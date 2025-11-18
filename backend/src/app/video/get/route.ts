import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";

export async function GET(req: Request) {
	try {
		const {searchParams} = new URL(req.url);
		const video_id = searchParams.get("id");

		if (!video_id) {
			return NextResponse.json({error: "Missing id"}, {status: 400});
		}

		const result = await connectionPool.query("SELECT * FROM video WHERE video_id = $1", [video_id]);

		if (result.rowCount === 0) {
			return NextResponse.json({error: "Video not found"}, {status: 404});
		}

		return NextResponse.json(result.rows[0], {status: 200});
	} catch (err) {
		console.error(err);
		return NextResponse.json({error: "Database error"}, {status: 500});
	}
}
