import {NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth/verifyToken";

export function middleware(req: Request) {
    const url = new URL(req.url);

    // paths which require auth
    const protectedPaths = [
        "/video",
        "/thumbnail",
        "/subtitles",
        "/like_dislike"
    ];

    const isProtected = protectedPaths.some(path => url.pathname.startsWith(path));

    if (!isProtected) return NextResponse.next();

    const token = req.headers.get("cookie")
        ?.split("; ")
        .find(c => c.startsWith("session="))
        ?.split("=")[1];

    if (!token) {
        return NextResponse.json({error: "Not authenticated"}, {status: 401});
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({error: "Invalid session"}, {status: 401});
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", decoded.user_id);
    return response;
}
