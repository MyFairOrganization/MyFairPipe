import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import {minioClient, videoBucket} from "@/lib/services/minio";

export async function DELETE(req: Request) {
	try {
		const {searchParams} = new URL(req.url);
		const video_id = searchParams.get("id");

		if (!video_id) {
			return NextResponse.json({error: "Missing id"}, {status: 400});
		}

		// 1. Fetch thumbnail + photo info
		const result = await connectionPool.query(`
            SELECT t.video_id, t.path
            FROM video t
            WHERE t.video_id = $1
		`, [video_id]);

		if (result.rowCount === 0) {
			return NextResponse.json({error: "Thumbnail not found"}, {status: 404});
		}

		const {path} = result.rows[0];

		// 2. Remove file from MinIO
		try {
			await minioClient.removeObject(videoBucket, path);
		} catch (err) {
			console.error("MinIO delete failed:", err);
			return NextResponse.json({error: "Could not delete file from storage"}, {status: 500});
		}

		// 3. Remove database record
		await connectionPool.query(`
            DELETE
            FROM video
            WHERE video_id = $1`,
			[video_id]
		);


		return NextResponse.json(result.rows[0], {status: 200});
	} catch (err) {
		console.error(err);
		return NextResponse.json({error: "Database error"}, {status: 500});
	}
}
