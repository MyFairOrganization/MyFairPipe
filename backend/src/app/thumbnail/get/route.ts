import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";

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

		const THUMBNAIL_ID = searchParams.get("id") as string;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!THUMBNAIL_ID) {
			return NextError.error("Missing id", HttpError.BadRequest);
		}

		// -------------------------------
		// Database Transaction
		// -------------------------------
		client = await connectionPool.connect();
		const RESULT = await client.query(`
            SELECT t.thumbnail_id, p.photo_id, p.path
            FROM Thumbnail t
                     JOIN Photo p ON p.photo_id = t.photo_id
            WHERE t.thumbnail_id = $1
		`, [THUMBNAIL_ID]);

		if (RESULT.rowCount === 0) {
			return NextError.error("No Thumbnail found", HttpError.NotFound);
		}

		return NextResponse.json(RESULT.rows[0], {status: 200});
	} catch (err: any) {
		console.error("Database error: ", err);
		return NextError.error(err || "Server error.", HttpError.InternalServerError);
	} finally {
		if (client) client.release();
	}
}