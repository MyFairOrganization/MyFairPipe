import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import {minioClient, videoBucket} from "@/lib/services/minio";
import {checkUUID} from "@/lib/utils/util";
import NextError, {HttpError} from "@/lib/utils/error";

export async function DELETE(req: Request) {
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

		if (!checkUUID(thumbnail_id)) {
			return NextError.error("Invalid video id format", HttpError.BadRequest);
		}

		// -------------------------------
		// Database Transaction
		// -------------------------------
		client = await connectionPool.connect();
		try {
			await client.query("BEGIN");

			const result = await client.query(`
                SELECT t.thumbnail_id, p.photo_id, p.path
                FROM Thumbnail t
                         JOIN Photo p ON p.photo_id = t.photo_id
                WHERE t.thumbnail_id = $1`, [thumbnail_id]);

			if (result.rowCount === 0) {
				return NextError.error("Thumbnail not found", HttpError.NotFound);
			}

			let {path} = result.rows[0];

			try {
				await minioClient.removeObject(videoBucket, path);
			} catch (err) {
				console.error("MinIO delete failed:", err);
				return NextError.error("Could not delete file from storage", HttpError.InternalServerError);
			}

			await client.query(`
                DELETE
                FROM Thumbnail
                WHERE thumbnail_id = $1`, [thumbnail_id]);

			await client.query("COMMIT");
		} catch (dbErr) {
			await client.query("ROLLBACK");
			console.error("Database transaction error:", dbErr);
			return NextError.error("Database write failed", HttpError.InternalServerError);
		} finally {
			client.release();
		}

		return NextResponse.json({success: true});
	} catch (err) {
		console.error(err);
		return NextError.error("Database error", HttpError.InternalServerError);
	}
}