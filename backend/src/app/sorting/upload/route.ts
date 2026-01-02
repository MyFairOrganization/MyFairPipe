import { connectionPool } from "@/lib/services/postgres";
import { redis } from "@/lib/services/redis";
import { NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";

interface IVideo {
    video_id: number;
}

async function loadVideosFromPostgres(): Promise<IVideo[]> {
    const query = `
        SELECT v.video_id, (((vd.likes * 2 + vd.views * 0.1 - vd.dislikes * 3) + 1) * (1 + RANDOM())) - 1 AS score
        FROM video_details vd
                 JOIN video v on vd.video_id = v.video_id
        ORDER BY score DESC
    `;

    const result = await connectionPool.query(query);

    return result.rows;
}

async function cacheVideos(videos: IVideo[]): Promise<void> {
    const key = "sortedVids";

    await redis.del(key);

    if (videos.length > 0) {
        await redis.rpush(key, ...videos.map(v => {
            return v.video_id.toString();
        }));
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
        const result = await loadVideosFromPostgres();
        await cacheVideos(result);

        return NextResponse.json({ result: result }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextError.Error(err + "", HttpError.BadRequest);
    }
}