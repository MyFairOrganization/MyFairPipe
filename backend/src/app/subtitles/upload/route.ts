import {NextRequest, NextResponse} from "next/server";
import {
	listFilesInFolder,
	minioClient,
	objectExists,
	streamToString,
	uploadFileToMinio,
	videoBucket
} from "@/lib/services/minio";
import NextError, {HttpError} from "@/lib/utils/error";
import {getUser} from "@/lib/auth/getUser";
import {connectionPool} from "@/lib/services/postgres";
import {QueryResult} from "pg";

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204, headers: {
			"Access-Control-Allow-Origin": "https://myfairpipe.com",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
		},
	});
}

export async function POST(req: NextRequest) {
	try {
		// ====== getUser using new cookie-based getUser.ts ======
		const user = getUser(req);

		if (!user) {
			return NextResponse.json({error: "Not authenticated"}, {status: 401});
		}

		const formData = await req.formData();

		const videoId = formData.get("id") as string;
		const file = formData.get("file") as File;
		const language = formData.get("language") as string;
		const language_short = formData.get("language_short") as string;

		// -------------------------------
		// Validation
		// -------------------------------
		if (!videoId) {
			return NextError.Error("Invalid video id", HttpError.BadRequest);
		}

		if (!file) {
			return NextError.Error("No file uploaded", HttpError.BadRequest);
		}

		if (!file.name.endsWith(".vtt") && file.type !== "text/vtt") {
			return NextError.Error("Only VTT subtitle files are allowed", HttpError.BadRequest);
		}

		if (!language || !language_short || !language.match(/^[a-zA-Z]+(-[a-zA-Z]+)?$/)) {
			return NextError.Error("Invalid language", HttpError.BadRequest);
		}

		// -------------------------------
		// Check ownership
		// -------------------------------
		const client = await connectionPool.connect();

        var idSelect;

		try {
			const ownershipResult: QueryResult = await client.query(`
                SELECT v.video_id
                FROM video v
                WHERE v.video_id = $1
                  AND v.uploader = $2
			`, [videoId, user.id]);

			if (ownershipResult.rowCount === 0) {
				return NextError.Error("Video not found or you don't have permission to add subtitles", HttpError.NotFound);
			}

            idSelect = await client.query(`SELECT * FROM video;`)
		} finally {
			client.release();
		}

		// -------------------------------
		// Check if video exists
		// -------------------------------
		const videoExists = await objectExists(videoBucket, `${videoId}/master.m3u8`);
		if (!videoExists) {
			return NextError.Error("Video isn't uploaded yet.", HttpError.BadRequest);
		}

		// -------------------------------
		// List existing subtitles for this video
		// -------------------------------
		const subtitleFiles = await listFilesInFolder(videoBucket, `${videoId}/subtitles`);

		const existingSubtitle = subtitleFiles.find(f => f.includes(`_${language_short}.vtt`));

		const buffer = Buffer.from(await file.arrayBuffer());
		let subtitleId: string;
		let filename: string;

		if (existingSubtitle) {
			filename = existingSubtitle.split('/').pop()!;
			subtitleId = filename.replace(".vtt", "").replace("subs_", "");
		} else {
			subtitleId = idSelect.rowCount + 1;
			filename = `subs_${language_short}.vtt`;
		}

		// Upload VTT
		await uploadFileToMinio(`${videoId}/subtitles/${filename}`, videoBucket, buffer, "text/vtt");

		// Upload subtitle playlist
		const content = `#EXTM3U
#EXT-X-VERSION:3
#EXTINF:9999999,
${filename}
#EXT-X-ENDLIST`;

		const sub_playlist_path = `${videoId}/subtitles/${filename.replace(".vtt", ".m3u8")}`;
		await uploadFileToMinio(sub_playlist_path, videoBucket, Buffer.from(content), "application/vnd.apple.mpegurl");

		// Update master playlist
		const masterPlaylistPath = `${videoId}/master.m3u8`;
		const stream = await minioClient.getObject(videoBucket, masterPlaylistPath);
		const masterContent = await streamToString(stream);

		if (!masterContent.trim()) {
			return NextError.Error("Master playlist is empty", HttpError.InternalServerError);
		}

		const lines = masterContent.split(/\r?\n/);

		const subtitleLine = `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="${language}",DEFAULT="NO",AUTOSELECT="NO",LANGUAGE="${language_short}",URI="subtitles/subs_${language_short}.m3u8"`;

		let found = false;
		const updatedLines = lines.map(line => {
			if (line.startsWith('#EXT-X-MEDIA:TYPE=SUBTITLES') && line.includes(`LANGUAGE="${language_short}"`)) {
				found = true;
				return subtitleLine;
			}
			return line;
		});

		if (!found) {
			const index = updatedLines.findIndex(l => l.startsWith("#EXT-X-STREAM-INF"));
			updatedLines.splice(index !== -1 ? index : updatedLines.length, 0, subtitleLine);
		}

		const newContent = updatedLines.join("\n");

		await uploadFileToMinio(masterPlaylistPath, videoBucket, Buffer.from(newContent, "utf-8"), "application/vnd.apple.mpegurl");

		return NextResponse.json({success: true, subtitle_id: subtitleId, filename}, {status: 200});

	} catch (err: any) {
		console.error("Upload/update subtitle error:", err);
		const message = err instanceof Error ? err.message : "Server error.";
		return NextError.Error(message, HttpError.InternalServerError);
	}
}