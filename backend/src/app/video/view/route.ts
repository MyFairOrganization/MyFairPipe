import { NextResponse } from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";
import {getUser} from "@/lib/auth/getUser";

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
            UPDATE video SET views = views + 1 WHERE video_id = $1`, [videoId]);

        return NextResponse.json({success: true}, {status: 200});

    } catch (err: any) {
        console.error("Database error: ", err);
        return NextError.Error(err || "Server error.", HttpError.InternalServerError);
    } finally {
        if (client) client.release();
    }
}
