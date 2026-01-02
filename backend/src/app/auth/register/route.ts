import { NextResponse } from "next/server";
import { connectionPool } from "@/lib/services/postgres";
import bcrypt from "bcrypt";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": "http://myfairpipe.com",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function POST(req: Request) {
    try {
        const { user_email: userEmail, username, password } = await req.json();

        if (!userEmail || !username || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
        }

        const existing = await connectionPool.query(`SELECT user_id
                                                     FROM "User"
                                                     WHERE user_email = $1
                                                        OR username = $2`, [userEmail, username]);

        if (existing.rowCount && existing.rowCount > 0) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await connectionPool.query(`INSERT INTO "User" (user_email, hashed_password, username, displayname)
                                                   VALUES ($1, $2, $3, $3)
                                                   RETURNING user_id, user_email, username`, [userEmail, hashedPassword, username]);

        return NextResponse.json({ message: "User registered successfully", user: result.rows[0] }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
