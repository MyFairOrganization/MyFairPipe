import { redis } from "@/lib/services/redis";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";

async function getCachedVideos(limit: number, offset: number): Promise<number[]> {
    const key = "sortedVids";

    const end = offset + limit - 1;
    const ids = await redis.lrange(key, offset, end);

    return ids.map(id => {
        return Number(id);
    });
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
        const limitParam = searchParams.get('limit');
        const offsetParam = searchParams.get('offset');

        if (limitParam === null) {
            return NextError.error("No Limit", HttpError.BadRequest);
        }

        const limit = Number.parseInt(limitParam, 10);

        if (offsetParam === null) {
            return NextError.error("No Offset", HttpError.BadRequest);
        }

        const offset = Number.parseInt(offsetParam, 10);

        const cachedVids = await getCachedVideos(limit, offset);

        return NextResponse.json({ cachedVids }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextError.error(err + "", HttpError.BadRequest);
    }
}