import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import {minioClient, uploadBucket as bucket} from "@/lib/services/minio";

export async function DELETE(req: Request) {
	try {
		const {searchParams} = new URL(req.url);
		const thumbnail_id = searchParams.get("id");

		if (!thumbnail_id) {
			return NextResponse.json({error: "Missing id"}, {status: 400});
		}

		// 1. Fetch thumbnail + photo info
		const result = await connectionPool.query(`
            SELECT t.thumbnail_id, p.photo_id, p.path
            FROM Thumbnail t
                     JOIN Photo p ON p.photo_id = t.photo_id
            WHERE t.thumbnail_id = $1
		`, [thumbnail_id]);

		if (result.rowCount === 0) {
			return NextResponse.json({error: "Thumbnail not found"}, {status: 404});
		}

		const {path} = result.rows[0];

		// 2. Remove file from MinIO
		try {
			await minioClient.removeObject(bucket, path);
		} catch (err) {
			console.error("MinIO delete failed:", err);
			return NextResponse.json({error: "Could not delete file from storage"}, {status: 500});
		}

		// 3. Remove database record
		await connectionPool.query(`DELETE
                                    FROM Thumbnail
                                    WHERE thumbnail_id = $1`, [thumbnail_id]);

		return NextResponse.json({
			message: "Thumbnail deleted successfully", deleted_thumbnail_id: thumbnail_id, deleted_file: path
		}, {status: 200});

	} catch (err) {
		console.error(err);
		return NextResponse.json({error: "Database error"}, {status: 500});
	}
}
