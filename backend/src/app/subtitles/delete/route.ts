import {NextRequest, NextResponse} from "next/server";
import {listFilesInFolder, minioClient, streamToString, uploadFileToMinio, videoBucket} from "@/lib/services/minio";
import NextError, {HttpError} from "@/lib/utils/error";
import {getUser} from "@/lib/auth/getUser";
import {connectionPool} from "@/lib/services/postgres";
import {QueryResult} from "pg";

export async function OPTIONS() {
	const domain = process.env.DOMAIN ?? "";
	return new NextResponse(null, {
		status: 204, headers: {
			"Access-Control-Allow-Origin": domain,
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
		},
	});
}

export async function DELETE(req: NextRequest) {
	try {
		// ====== getUser using new cookie-based getUser.ts ======
		const user = getUser(req);

		if (!user) {
			return NextResponse.json({error: "Not authenticated"}, {status: 401});
		}

		const formData = await req.formData();

		const videoId = formData.get("id") as string;
		const language = formData.get("language") as string;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!videoId) {
			return NextError.Error("Missing id", HttpError.BadRequest);
		}

		if (!language) {
			return NextError.Error("Missing language", HttpError.BadRequest);
		}

		// -------------------------------
		// Check ownership
		// -------------------------------
		const client = await connectionPool.connect();
		try {
			const ownershipResult: QueryResult = await client.query(`
                SELECT v.video_id
                FROM video v
                WHERE v.video_id = $1
                  AND v.uploader = $2
			`, [videoId, user.user_id]);

			if (ownershipResult.rowCount === 0) {
				return NextError.Error("Video not found or you don't have permission to delete subtitles", HttpError.NotFound);
			}
		} finally {
			client.release();
		}

		// -------------------------------
		// Delete subtitle files
		// -------------------------------
		const files = await listFilesInFolder(videoBucket, `${videoId}/subtitles`);

		const filesToDelete = files.filter(file => {
			const file_lang = file.split(".")[0].split("_").pop();
			return file_lang === language;
		});

		if (filesToDelete.length === 0) {
			return NextError.Error("Subtitle not found for this language", HttpError.NotFound);
		}

		// Delete all matching files (VTT and M3U8)
		await Promise.all(filesToDelete.map(file => minioClient.removeObject(videoBucket, file)));

		// -------------------------------
		// Update master playlist
		// -------------------------------
		try {
			const masterPlaylistPath = `${videoId}/master.m3u8`;
			const stream = await minioClient.getObject(videoBucket, masterPlaylistPath);
			const masterContent = await streamToString(stream);

			if (masterContent.trim()) {
				const lines = masterContent.split(/\r?\n/);

				// Remove subtitle line for this language
				const updatedLines = lines.filter(line => {
					return !(line.startsWith('#EXT-X-MEDIA:TYPE=SUBTITLES') && line.includes(`LANGUAGE="${language}"`));

				});

				const newContent = updatedLines.join("\n");
				await uploadFileToMinio(masterPlaylistPath, videoBucket, Buffer.from(newContent, "utf-8"), "application/vnd.apple.mpegurl");
			}
		} catch (playlistErr) {
			console.error("Failed to update master playlist:", playlistErr);
		}

		return NextResponse.json({success: true}, {status: 200});

	} catch (err) {
		console.error("Delete subtitle error:", err);
		const message = err instanceof Error ? err.message : "Server error";
		return NextError.Error(message, HttpError.InternalServerError);
	}
}