import { connectionPool } from "@/lib/services/postgres";
import { redis } from "@/lib/services/redis";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";

interface Video {
	video_id: number;
}

async function loadVideosFromPostgres(): Promise<Video[]> {
	const QUERY = `
    SELECT v.video_id, (((vd.likes * 2 + vd.views * 0.1 - vd.dislikes * 3) + 1) * (1 + RANDOM())) - 1 AS score
    FROM video_details vd
    JOIN video v on vd.video_id = v.video_id
    ORDER BY score DESC
  `;

	const RESULT = await connectionPool.query(QUERY);

	return RESULT.rows;
}

async function cacheVideos(videos: Video[]): Promise<void> {
	const KEY = "sortedVids";

	await redis.del(KEY);

	if (videos.length > 0) {
		await redis.rpush(KEY, ...videos.map(v => v.video_id.toString()));
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

export async function GET() {
	try {
		const RESULT = await loadVideosFromPostgres();
		await cacheVideos(RESULT);

		return NextResponse.json({ result: RESULT }, { status: 200 });
	} catch (err) {
		console.error(err);
		return NextError.error(err + "", HttpError.BadRequest);
	}
}