import { NextResponse } from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";

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

export async function GET(req: Request) {
	let client;

	try {
		const {searchParams} = new URL(req.url);

		const videoId = searchParams.get("id");

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!videoId) {
			return NextError.Error("Missing id", 400);
		}

		// -------------------------------
		// Database Transaction
		// -------------------------------
		client = await connectionPool.connect();
		const result = await client.query(`
            SELECT v.video_id,
                   v.title,
                   v.description,
                   v.path,
                   v.duration,
                   v.views,
                   p.path    AS thumbnail_path,
                   u.user_id AS uploader_id
            FROM video v
                     LEFT JOIN thumbnail t
                               ON t.video_id = v.video_id
                     LEFT JOIN photo p
                               ON p.photo_id = t.photo_id
                     LEFT JOIN "User" u ON u.user_id = v.uploader
            WHERE v.video_id = $1`, [videoId]);

		if (result.rowCount === 0) {
			return NextError.Error("Video not found", 404);
		}

		return NextResponse.json(result.rows[0], {status: 200});

	} catch (err: any) {
		console.error("Database error: ", err);
		return NextError.Error(err || "Server error.", HttpError.InternalServerError);
	} finally {
		if (client) client.release();
	}
}
