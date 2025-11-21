import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";

export async function PATCH(req: Request) {
	let client;

	try {
		const {searchParams} = new URL(req.url);

		const thumbnail_id = searchParams.get("id");

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!thumbnail_id) {
			return NextError.error("Missing id", HttpError.BadRequest);
		}

		// -------------------------------
		// Database Transaction
		// -------------------------------
		client = await connectionPool.connect();

		try {
			await client.query("BEGIN");

			const resultVideo = await client.query(`
                SELECT video_id
                FROM Thumbnail
                WHERE thumbnail_id = $1
			`, [thumbnail_id]);

			if (resultVideo.rowCount === 0) {
				return NextError.error("Thumbnail not found", HttpError.NotFound);
			}

			const video_id = resultVideo.rows[0].video_id;

			await client.query(`
                UPDATE Thumbnail
                SET is_active = FALSE
                WHERE video_id = $1
                  AND is_active = TRUE
			`, [video_id]);

			const resultActivate = await client.query(`
                UPDATE Thumbnail
                SET is_active = TRUE
                WHERE thumbnail_id = $1
                RETURNING *
			`, [thumbnail_id]);

			if (resultActivate.rowCount === 0) {
				return NextError.error("Failed to activate thumbnail", HttpError.BadRequest);
			}

			await client.query("COMMIT");

			return NextResponse.json({success: true});
		} catch (dbErr) {
			await client.query("ROLLBACK");
			console.error("Database transaction error:", dbErr);
			return NextError.error("Database write failed", HttpError.InternalServerError);
		} finally {
			client.release();
		}
	} catch (err) {
		console.error(err);
		return NextError.error("Database error", HttpError.InternalServerError);
	}
}