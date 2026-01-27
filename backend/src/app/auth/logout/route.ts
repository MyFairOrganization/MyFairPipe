import { NextResponse } from "next/server";

export async function OPTIONS() {
    const domain = process.env.DOMAIN ?? "";
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": domain,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function POST() {
    const res = NextResponse.json({ message: "Logged out" });

    res.cookies.set("session", "", {
        httpOnly: true, secure: false, sameSite: "lax",      // Cross-Site erlaubt
        domain: `${process.env.DOMAIN_HOST ?? ""}`, path: "/", expires: new Date(0), // cookie löschen
    });

    return res;
}
