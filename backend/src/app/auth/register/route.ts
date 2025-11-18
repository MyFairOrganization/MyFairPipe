import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import { hashPassword } from "../auth.utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email und Passwort erforderlich" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "User existiert bereits" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        return NextResponse.json({ message: "User erfolgreich registriert", userId: user.id }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Fehler beim Registrieren" }, { status: 500 });
    }
}
