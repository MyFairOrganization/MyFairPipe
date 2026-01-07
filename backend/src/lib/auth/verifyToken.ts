import jwt, { JwtPayload } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET!;

if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not set. Please set it before starting the application.");
}

export function verifyToken(token: string): JwtPayload {
    try {
        return <JwtPayload>jwt.verify(token, jwtSecret);
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            console.error("JWT verification failed: Token expired.", err);
        } else if (err instanceof jwt.JsonWebTokenError) {
            console.error("JWT verification failed: Malformed token or signature error.", err);
        } else if (err instanceof jwt.NotBeforeError) {
            console.error("JWT verification failed: Token not active yet.", err);
        } else {
            console.error("JWT verification failed: Unknown error.", err);
        }
        throw err;
    }
}