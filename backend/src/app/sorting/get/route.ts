import { redis } from "@/lib/services/redis";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";

async function getCachedVideos(limit: number, offset: number): Promise<number[]> {
	const key = "sortedVids";

	const end = offset + limit - 1;
	const ids = await redis.lrange(key, offset, end);

	return ids.map(id => Number(id));
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = req.nextUrl;
		const limit:number = Number.parseInt(searchParams.get('limit'));
		const offset = Number.parseInt(searchParams.get('offset'));

		const cachedVids = await getCachedVideos(limit, offset);

		return NextResponse.json({ cachedVids }, { status: 200 });
	} catch (err) {
		console.error(err);
		return NextError.error(err + "", HttpError.BadRequest);
	}
}