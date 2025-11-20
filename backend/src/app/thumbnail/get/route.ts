import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";

export async function GET(req: Request) {
	try {
		const {searchParams} = new URL(req.url);
		const thumbnail_id = searchParams.get("id");

		if (!thumbnail_id) {
			return NextResponse.json({error: "Missing id"}, {status: 400});
		}

		const result = await connectionPool.query(`
            SELECT t.thumbnail_id, p.photo_id, p.path
            FROM Thumbnail t
                     JOIN Photo p ON p.photo_id = t.photo_id
            WHERE t.thumbnail_id = $1
		`, [thumbnail_id]);

		if (result.rowCount === 0) {
			return NextResponse.json({error: "No Thumbnail found not found"}, {status: 404});
		}

		return NextResponse.json(result.rows[0], {status: 200});
	} catch (err) {
		console.error(err);
		return NextResponse.json({error: "Database error"}, {status: 500});
	}
}
