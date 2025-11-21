import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import { verifyPassword, generateToken } from "../auth.utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 });
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Ungültiges Passwort" }, { status: 401 });
        }

        const token = generateToken(user.id.toString());
        return NextResponse.json({ token });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Fehler beim Login" }, { status: 500 });
    }
}
