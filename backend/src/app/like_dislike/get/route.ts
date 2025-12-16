import { connectionPool } from "@/lib/services/postgres";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";

async function getstatus(videoID: number, username: string) {
	const client = await connectionPool.connect();

	// SQL query to check if user already disliked video
	const query = `
    SELECT lv.is_like
    FROM Like_Video lv
    JOIN "User" u ON u.user_id = lv.user_id
    WHERE u.username = $1 AND lv.video_id = $2
  `;

	try {
		const result = await client.query(query, [username, videoID])

		var liked: boolean
		var disliked: boolean

		if (result.rows[0] == undefined) {
			liked = false
			disliked = false
		} else {
			const isLike = result.rows[0].is_like
			liked = isLike;
			disliked = !isLike;
		}
		return {liked, disliked}
	} catch (err) {

	} finally {
		client.release();
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = req.nextUrl;
		const videoID:number = Number.parseInt(searchParams.get('videoID'));
		const username = searchParams.get('username');

		const result = await getstatus(videoID, username);
		return NextResponse.json({ result }, {status: 200});
	} catch (err) {
		console.error(err);
		return NextError.error(err + "", HttpError.BadRequest);
	}
}