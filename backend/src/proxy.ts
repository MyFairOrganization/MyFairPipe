import {NextRequest, NextResponse} from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const config = {
	matcher: ["/api/secure/:path*"],
};

export default async function proxy(req: NextRequest) {
	const url = req.nextUrl.pathname;

	// Ausschließen, damit nicht Login/Logout/Signup blockiert werden
	if (url.startsWith("/auth/login") || url.startsWith("/auth/register") || url.startsWith("/auth/logout")) {
		return NextResponse.next();
	}

	// Cookie auslesen
	const cookie = req.cookies.get("session")?.value;

	if (!cookie) {
		return NextResponse.json({error: "Not authenticated"}, {status: 401});
	}

	try {
		jwt.verify(cookie, JWT_SECRET);
	} catch (err) {
		return NextResponse.json({error: "Invalid token"}, {status: 401});
	}

	return NextResponse.next();
}