import {JwtPayload} from "jsonwebtoken";
import {verifyToken} from "@/lib/auth/verifyToken";
import NextError, {HttpError} from "@/lib/utils/error";
import {connectionPool} from "@/lib/services/postgres";

export interface User {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    displayName: string;
    bio: string;
    picture: number;
}

export async function getUser(req: Request) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    try {
        if (!token) {
            throw new Error("Token is required");
        }

        const decoded: JwtPayload = verifyToken(token);

        // Access JWT payload properties directly
        const email = decoded.email as string;
        const username = decoded.username as string;

        if (!email || !username) {
            throw new Error("Invalid token payload");
        }

        const result = await connectionPool.query(`
            SELECT user_id, user_email, created_at, username, displayname, bio, picture_id
            FROM "User"
            WHERE username = $1
              AND user_email = $2
        `, [username, email]);

        if (!result.rows || result.rows.length === 0) {
            return NextError.error("User not found", HttpError.NotFound);
        }

        const row = result.rows[0];
        const userObj: User = {
            id: row.user_id,
            email: row.user_email,
            username: row.username,
            createdAt: new Date(row.created_at),
            displayName: row.displayname,
            bio: row.bio,
            picture: row.picture_id
        };

        return userObj;

    } catch (error) {
        const message = error instanceof Error ? error.message : "Authentication failed";
        return NextError.error(message, HttpError.Forbidden);
    }
}