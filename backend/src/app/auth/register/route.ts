import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const {user_email, username, password} = await req.json();

        // === Validation ===
        if (!user_email || !username || !password) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400});
        }

        if (password.length < 6) {
            return NextResponse.json(
                {error: "Password must be at least 6 characters long"},
                {status: 400}
            );
        }

        // === User exists? ===
        const existing = await connectionPool.query(
            `SELECT user_id
             FROM "User"
             WHERE user_email = $1
                OR username = $2`,
            [user_email, username]
        );

        if (existing.rowCount && existing.rowCount > 0) {
            return NextResponse.json(
                {error: "User already exists"},
                {status: 409}
            );
        }

        // === Hash password ===
        const hashed_password = await bcrypt.hash(password, 10);

        // === Insert user ===
        const result = await connectionPool.query(
            `INSERT INTO "User"
                 (user_email, hashed_password, username)
             VALUES ($1, $2, $3)
             RETURNING user_id, user_email, username`,
            [user_email, hashed_password, username]
        );

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: result.rows[0],
            },
            {status: 201}
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}
