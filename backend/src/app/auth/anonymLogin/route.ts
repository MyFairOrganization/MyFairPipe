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
        const getID = await connectionPool.query(`SELECT *
                                                  FROM "User"`);

        var id = getID.rowCount! + 1;
        const password = `anonymPass`;
        var username = await bcrypt.hash(`anonym${id}`, 1);
        const user_email = `${username}@anonym.com`;

        const hashed_password = await bcrypt.hash(password, 10);

        while (true) {
            const existing = await connectionPool.query(`SELECT user_id
                                                         FROM "User"
                                                         WHERE user_email = $1
                                                            OR username = $2`, [user_email, username]);

            if (existing.rowCount && existing.rowCount > 0) {
                id += 1;
                username = await bcrypt.hash(`anonym${id}`, 1);
            } else {
                break;
            }
        }

        const result = await connectionPool.query(`INSERT INTO "User" (user_email, hashed_password, username, displayname, anonym)
                                                   VALUES ($1, $2, $3, $3, TRUE)
                                                   RETURNING user_id, hashed_password, user_email, username`, [user_email, hashed_password, username]);

        return NextResponse.json({
            message: "User registered successfully",
            user: result.rows[0],
            password: password
        }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
