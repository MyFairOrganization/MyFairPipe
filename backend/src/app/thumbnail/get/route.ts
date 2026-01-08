import {NextResponse} from "next/server";
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

		const thumbnail_id = searchParams.get("id") as string;

		// -------------------------------
		// Request validation
		// -------------------------------
		if (!thumbnail_id) {
			return NextError.Error("Missing id", HttpError.BadRequest);
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
			return NextError.Error("No Thumbnail found", HttpError.NotFound);
		}

		return NextResponse.json(result.rows[0], {status: 200});
	} catch (err: any) {
		console.error("Database error: ", err);
		return NextError.Error(err || "Server error.", HttpError.InternalServerError);
	} finally {
		if (client) client.release();
	}
}