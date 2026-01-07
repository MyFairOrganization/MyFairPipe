import { connectionPool } from "@/lib/services/postgres";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";
import { getUser } from "@/lib/auth/getUser";

async function getstatus(videoID: number, userID = 1) {
	const client = await connectionPool.connect();

	client.query("BEGIN")

	// SQL query to check if user already disliked video
	const isLikeQuery = `
    SELECT lv.is_like, v.likes, v.dislikes
    FROM Like_Video lv
    JOIN video v ON lv.video_id = v.video_id
    JOIN "User" u ON u.user_id = lv.user_id
    WHERE u.user_id = $1 AND lv.video_id = $2
  `;

	const likesQuery = `
		SELECT likes, dislikes
		FROM video
		WHERE video_id = $1
	`;

	try {
		var result = undefined;
		if (userID) {
			result = await client.query(isLikeQuery, [userID, videoID])
		}
		var liked = false
		var likes = 0
		var disliked = false
		var dislikes = 0

		if (result?.rows[0] == undefined) {
			const amount = await client.query(likesQuery, [videoID])
			console.log(amount.rows[0])
			liked = false
			disliked = false
			if (amount.rows[0]) {
				console.log("setting likes/dislikes")
				likes = amount.rows[0].likes;
				dislikes = amount.rows[0].dislikes;
			}

			console.log(liked, disliked, likes, dislikes)
		} else {
			console.log("IS LIKEEEEEE")
			const isLike = result.rows[0].is_like
			liked = isLike;
			likes = result.rows[0].likes
			disliked = !isLike;
			dislikes = result.rows[0].dislikes
		}
		return {liked, disliked, likes, dislikes}
	} catch (err) {
		console.log(err)

	} finally {
		client.query("COMMIT")
		client.release();
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204, headers: {
			"Access-Control-Allow-Origin": "https://myfairpipe.com",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
		},
	});
}

export async function POST(req: NextRequest) {
	try {
		const user = getUser(req);

		console.log(user)

		const {videoID} = await req.json();

		if (videoID === null) {
			return NextError.error("No Video ID", HttpError.BadRequest);
		}

		const userID = user?.user_id;

		const result = await getstatus(Number(videoID), Number(userID));
		return NextResponse.json({ result }, {status: 200});
	} catch (err) {
		console.error(err);
		return NextError.error(err + "", HttpError.BadRequest);
	}
}