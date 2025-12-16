import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ message: "Logged out" });

    res.cookies.set("session", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        expires: new Date(0), // cookie löschen
    });

    return res;
}
