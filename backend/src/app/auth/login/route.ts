import {NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set. Please set it before starting the application.');
}
const JWT_SECRET = process.env.JWT_SECRET;

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": "https://myfairpipe.com, http://api.myfairpipe.com",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function POST(req: Request) {
    try {
        const {user_email, password} = await req.json();

        if (!user_email || !password) {
            return NextResponse.json({error: "Missing email or password"}, {status: 400});
        }

        const result = await connectionPool.query(
            `SELECT user_id, user_email, hashed_password
             FROM "User"
             WHERE user_email = $1`,
            [user_email]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({error: "Invalid email or password"}, {status: 401});
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.hashed_password);

        console.log(valid)

        if (!valid) {
            return NextResponse.json({error: "Invalid email or password"}, {status: 401});
        }

        // === Create JWT ===
        const token = jwt.sign(
            {user_id: user.user_id, email: user.user_email},
            JWT_SECRET,
            {expiresIn: "7d"}
        );

        const response = NextResponse.json(
            {message: "Login successful", user: {user_id: user.user_id, email: user.user_email}},
            {status: 200}
        );

        response.cookies.set("session", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",      // Cross-Site erlaubt
            domain: ".myfairpipe.com",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}
