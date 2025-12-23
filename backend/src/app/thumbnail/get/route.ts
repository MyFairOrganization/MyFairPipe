import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";
import {checkUUID} from "@/lib/utils/util";

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

export async function GET(req: Request) {
	let client;

	try {
		const {searchParams} = new URL(req.url);

		const thumbnail_id = searchParams.get("id") as string;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!thumbnail_id) {
			return NextError.error("Missing id", HttpError.BadRequest);
		}

		if (!checkUUID(thumbnail_id)) {
			return NextError.error("Invalid video id format", HttpError.BadRequest);
		}

		// -------------------------------
		// Database Transaction
		// -------------------------------
		client = await connectionPool.connect();
		const result = await client.query(`
            SELECT t.thumbnail_id, p.photo_id, p.path
            FROM Thumbnail t
                     JOIN Photo p ON p.photo_id = t.photo_id
            WHERE t.thumbnail_id = $1
		`, [thumbnail_id]);

		if (result.rowCount === 0) {
			return NextError.error("No Thumbnail found", HttpError.NotFound);
		}

		return NextResponse.json(result.rows[0], {status: 200});
	} catch (err: any) {
		console.error("Database error: ", err);
		return NextError.error(err || "Server error.", HttpError.InternalServerError);
	} finally {
		if (client) client.release();
	}
}