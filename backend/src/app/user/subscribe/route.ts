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
    const creatorId = searchParams.get("id");

    let userId: number | null = null;
    let parsedId: number | null = null;

    parsedId = Number(creatorId);
    if (isNaN(parsedId)) {
        return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const sessionUser = getUser(req);
    if (!sessionUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = sessionUser.user_id;

    if (parsedId === userId) {
        return NextResponse.json({ error: "Cant subscribe to yourself: " + userId + ", " + creatorId }, { status: 401 });
    }

    try {
        await connectionPool.query(`
            INSERT INTO subscriber (user_id, subscriber_id) VALUES ($1, $2)
        `, [parsedId, userId]);

        return NextResponse.json({ msg: "Thanks for subscribing" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
