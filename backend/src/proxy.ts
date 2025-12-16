import {NextRequest, NextResponse} from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const config = {
	matcher: ["/video/delete", "/video/update", "/video/delete", "/thumbnail/activate", "/thumbnail/delete", "/thumbnail/upload", "/subtitles/delete", "/subtitles/upload",],
};

export default async function proxy(req: NextRequest) {
	const url = req.nextUrl.pathname;

	if (url.startsWith("/auth/login") || url.startsWith("/auth/register") || url.startsWith("/auth/logout")) {
		return NextResponse.next();
	} else if (url in config.matcher) {
		const cookie = req.cookies.get("session")?.value;

		if (!cookie) {
			return NextResponse.json({error: "Not authenticated"}, {status: 401});
		}

		try {
			jwt.verify(cookie, JWT_SECRET);
		} catch {
			return NextResponse.json({error: "Invalid token"}, {status: 401});
		}
	}

	return NextResponse.next();
}