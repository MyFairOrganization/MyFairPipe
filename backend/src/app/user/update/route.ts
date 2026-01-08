import { NextRequest, NextResponse } from "next/server";
import { connectionPool } from "@/lib/services/postgres";
import NextError, { HttpError } from "@/lib/utils/error";
import { getUser } from "@/lib/auth/getUser";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "https://myfairpipe.com",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function PATCH(req: NextRequest) {
    let client;

    try {
        const user = getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const formData = await req.formData();
        const displayName = formData.get("displayName") as string | null;
        const bio = formData.get("bio") as string | null;

        if (!displayName && !bio) {
            return NextError.Error(
                "At least one field must be updated",
                HttpError.BadRequest
            );
        }

        client = await connectionPool.connect();
        await client.query("BEGIN");

        const fields = [];
        const values: any[] = [];
        let idx = 1;

        if (displayName) {
            fields.push(`displayname = $${idx++}`);
            values.push(displayName);
        }

        if (bio) {
            fields.push(`bio = $${idx++}`);
            values.push(bio);
        }

        values.push(user.id);

        const result = await client.query(
            `
            UPDATE "User"
            SET ${fields.join(", ")}
            WHERE user_id = $${idx}
            `,
            values
        );

        await client.query("COMMIT");

        if (result.rowCount === 0) {
            return NextError.Error("User not found", HttpError.NotFound);
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err) {
        if (client) await client.query("ROLLBACK");
        console.error(err);
        return NextError.Error("Profile update failed", HttpError.InternalServerError);
    } finally {
        client?.release();
    }
}
