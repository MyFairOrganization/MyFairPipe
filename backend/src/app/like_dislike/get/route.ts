import { connectionPool } from "@/lib/services/postgres";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";

async function getstatus(videoID: number, userID: number) {
	const client = await connectionPool.connect();

	client.query("BEGIN")

	// SQL query to check if user already disliked video
	const query = `
    SELECT lv.is_like, v.likes, v.dislikes
    FROM Like_Video lv
    JOIN "User" u ON u.user_id = lv.user_id
    JOIN video v ON lv.video_id = v.video_id
    WHERE u.user_id = $1 AND lv.video_id = $2
  `;

	try {
		const result = await client.query(query, [userID, videoID])

		var liked: boolean
		var likes = 0
		var disliked: boolean
		var dislikes = 0

		if (result.rows[0] == undefined) {
			liked = false
			disliked = false
		} else {
			const isLike = result.rows[0].is_like
			liked = isLike;
			likes = result.rows[0].likes
			disliked = !isLike;
			dislikes = result.rows[0].dislikes
		}
		return {liked, disliked, likes, dislikes}
	} catch (err) {

	} finally {
		client.query("COMMIT")
		client.release();
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204, headers: {
			"Access-Control-Allow-Origin": "http://myfairpipe.com",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
		},
	});
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = req.nextUrl;
		const videoIDParam = searchParams.get('videoID');

		if (videoIDParam === null) {
			return NextError.error("No Video ID", HttpError.BadRequest);
		}

		const videoID = Number.parseInt(videoIDParam, 10);
		const usernameParam = searchParams.get('userID');

		if (usernameParam === null) {
			return NextError.error("No User ID", HttpError.BadRequest);
		}

		const result = await getstatus(videoID, Number(usernameParam));
		return NextResponse.json({ result }, {status: 200});
	} catch (err) {
		console.error(err);
		return NextError.error(err + "", HttpError.BadRequest);
	}
}