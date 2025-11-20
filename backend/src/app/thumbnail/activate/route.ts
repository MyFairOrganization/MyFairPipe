import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";

export async function PATCH(req: Request) {
	try {
		const {searchParams} = new URL(req.url);
		const thumbnail_id = searchParams.get("id");

		if (!thumbnail_id) {
			return NextResponse.json({error: "Missing id"}, {status: 400});
		}

		// 1. Get video ID for the selected thumbnail
		const resultVideo = await connectionPool.query(`
            SELECT video_id
            FROM Thumbnail
            WHERE thumbnail_id = $1
		`, [thumbnail_id]);

		if (resultVideo.rowCount === 0) {
			return NextResponse.json({error: "Thumbnail not found"}, {status: 404});
		}

		const video_id = resultVideo.rows[0].video_id;

		// 2. Deactivate any currently active thumbnail for that video
		await connectionPool.query(`
            UPDATE Thumbnail
            SET is_active = FALSE
            WHERE video_id = $1
              AND is_active = TRUE
		`, [video_id]);

		// 3. Activate the selected thumbnail
		const resultActivate = await connectionPool.query(`
            UPDATE Thumbnail
            SET is_active = TRUE
            WHERE thumbnail_id = $1
            RETURNING *
		`, [thumbnail_id]);

		if (resultActivate.rowCount === 0) {
			return NextResponse.json({error: "Failed to activate thumbnail"}, {status: 400});
		}

		return NextResponse.json(resultActivate.rows[0], {status: 200});

	} catch (err) {
		console.error(err);
		return NextResponse.json({error: "Database error"}, {status: 500});
	}
}
