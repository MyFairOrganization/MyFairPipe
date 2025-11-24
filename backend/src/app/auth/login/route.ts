import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
    try {
        const {email, password} = await req.json();

        if (!email || !password) {
            return NextResponse.json({error: "Missing email or password"}, {status: 400});
        }

        const result = await connectionPool.query(
            `SELECT user_id, user_email, hashed_password
             FROM "User"
             WHERE user_email = $1`,
            [email]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.hashed_password);

        if (!valid) {
            return NextResponse.json({error: "Invalid password"}, {status: 401});
        }

        // === JWT erstellen ===
        const token = jwt.sign(
            {user_id: user.user_id, email: user.user_email},
            JWT_SECRET,
            {expiresIn: "7d"}
        );

        return NextResponse.json(
            {
                message: "Login successful",
                token,
                user: {
                    user_id: user.user_id,
                    email: user.user_email,
                },
            },
            {status: 200}
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}
