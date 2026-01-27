import { NextRequest, NextResponse } from "next/server";
import { connectionPool } from "@/lib/services/postgres";
import { getUser } from "@/lib/auth/getUser";

export async function OPTIONS() {
    const domain = process.env.DOMAIN ?? "";
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": domain,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    let userId: number | null = null;

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
        const result = await connectionPool.query(`
            SELECT user_id,
                   username,
                   displayname,
                   bio,
                   picture_id,
                   created_at,
                   anonym
            FROM "User"
            WHERE user_id = $1
        `, [userId]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: result.rows[0] }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
