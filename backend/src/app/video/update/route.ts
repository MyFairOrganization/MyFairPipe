import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import NextError from "@/lib/utils/error";
import {checkUUID} from "@/lib/utils/util";
import {QueryResultRow} from "pg";

export async function PATCH(req: Request) {
	let client;

	try {
		const formData = await req.formData();
		const videoId = formData.get("id") as string;
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!videoId) {
			return NextError.error("Missing id", 400);
		}

		if (!title && !description) {
			return NextError.error("At least one field to update is required", 400);
		}

		if (!checkUUID(videoId)) {
			return NextError.error("Invalid video id format", 400);
		}

		// -------------------------------
		// Database transaction
		// -------------------------------
		client = await connectionPool.connect();

		try {
			await client.query("BEGIN");
			let result: QueryResultRow;

			if (title && description) {
				result = await client.query(`
                    UPDATE video
                    SET title       = $1,
                        description = $2
                    WHERE video_id = $3
				`, [title, description, videoId]);
			} else if (title) {
				result = await client.query(`
                    UPDATE video
                    SET title = $1
                    WHERE video_id = $2
				`, [title, videoId]);
			} else if (description) {
				result = await client.query(`
                    UPDATE video
                    SET description = $1
                    WHERE video_id = $2
				`, [description, videoId]);
			} else {
				return NextError.error("At least one field to update is required", 400);
			}

			await client.query("COMMIT");

			if (result.rowCount === 0) {
				return NextError.error("Video not found", 404);
			}

			return NextResponse.json({success: true});

		} catch (err) {
			await client.query("ROLLBACK");
			console.error("Database error:", err);
			return NextError.error("Database write failed", 500);

		} finally {
			client.release();
		}

	} catch (err: any) {
		console.error("Update processing error:", err);
		return NextError.error(err || "Server error.", 500);
	}
}
