import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const {email, password} = await req.json();

        if (!email || !password) {
            return NextResponse.json({error: "Missing email or password"}, {status: 400});
        }

        // === Fetch user ===
        const result = await connectionPool.query(
            `SELECT user_id,
                    user_email,
                    hashed_password
             FROM "User"
             WHERE user_email = $1`,
            [email]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        const user = result.rows[0];

        // === Verify password ===
        const valid = await bcrypt.compare(password, user.hashed_password);

        if (!valid) {
            return NextResponse.json({error: "Invalid password"}, {status: 401});
        }

        // Remove the hashed password for safety
        delete user.hashed_password;

        return NextResponse.json(
            {
                message: "Login successful",
                user,
            },
            {status: 200}
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}
