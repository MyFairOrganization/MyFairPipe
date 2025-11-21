import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import {deleteFolder, objectExists, videoBucket} from "@/lib/services/minio";
import NextError from "@/lib/utils/error";
import {checkUUID} from "@/lib/utils/util";

export async function DELETE(req: Request) {
	let client;

	try {
		const formData = await req.formData();

		const videoId = formData.get("id") as string;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!videoId) {
			return NextError.error("Missing id", 400);
		}

		if (!checkUUID(videoId)) {
			return NextError.error("Invalid video id format", 400);
		}

		// -------------------------------
		// Database Transaction
		// -------------------------------
		client = await connectionPool.connect();

		try {
			await client.query("BEGIN");

			const result = await client.query(`
                SELECT video_id, path
                FROM video
                WHERE video_id = $1`, [videoId]);

			if (result.rowCount === 0) {
				await client.query("ROLLBACK");
				return NextError.error("Video not found", 404);
			}

			let {path} = result.rows[0];
			path = path.split("/").slice(2).join("/");
			if (!await objectExists(videoBucket, path)) {
				return NextError.error("Video not found or not fully uploaded yet!", 404);
			}

			await client.query(`
                DELETE
                FROM video
                WHERE video_id = $1`, [videoId]);

			await client.query("COMMIT");

			try {
				await deleteFolder(videoBucket, videoId);
			} catch (err) {
				console.error("MinIO delete failed:", err);
			}

			return NextResponse.json({success: true});
		} catch (dbErr) {
			await client.query("ROLLBACK");
			console.error("Database transaction error:", dbErr);
			return NextError.error("Database write failed", 500);
		} finally {
			client.release();
		}

	} catch (err) {
		console.error("Request handling error:", err);
		return NextError.error("Server error", 500);
	}
}
