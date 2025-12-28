import { NextRequest, NextResponse } from "next/server";
import { connectionPool } from "@/lib/services/postgres";
import { getUser } from "@/lib/auth/getUser";

const PHOTO_CDN = "https://cdn.myfairpipe.com/photo";

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "http://myfairpipe.com",
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
		},
	});
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const idParam = searchParams.get("id");

	let userId: number;

	if (idParam) {
		const parsedId = Number(idParam);
		if (isNaN(parsedId)) {
			return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
		}
		userId = parsedId;
	} else {
		const sessionUser = getUser(req);
		if (!sessionUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		userId = sessionUser.user_id;
	}

	try {
		const result = await connectionPool.query(
			`
                SELECT ph.path
                FROM "User" u
                         LEFT JOIN profile_picture p
                                   ON p.profile_picture_id = u.picture_id
                         LEFT JOIN photo ph
                                   ON ph.photo_id = p.photo_id
                WHERE u.user_id = $1
			`,
			[userId]
		);

		if (result.rowCount === 0) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const path: string | null = result.rows[0].path;

		return NextResponse.json(
			{
				photo_url: path ? `${PHOTO_CDN}/${path}` : null,
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
