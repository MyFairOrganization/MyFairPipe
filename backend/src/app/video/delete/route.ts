import { NextRequest, NextResponse } from "next/server";
import { connectionPool } from "@/lib/services/postgres";
import { deleteFolder, objectExists, videoBucket } from "@/lib/services/minio";
import NextError, { HttpError } from "@/lib/utils/error";
import { getUser } from "@/lib/auth/getUser";
import { QueryResult } from "pg";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": "https://myfairpipe.com",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function DELETE(req: NextRequest) {
    let client;

    try {
        // ====== getUser using new cookie-based getUser.ts ======
        const user = getUser(req);

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const formData = await req.formData();

        const videoId = formData.get("id") as string;

        // -------------------------------
        // Request validation
        // -------------------------------
        if (!videoId) {
            return NextError.Error("Missing id", HttpError.BadRequest);
        }

        // -------------------------------
        // Database Transaction
        // -------------------------------
        client = await connectionPool.connect();

        try {
            await client.query("BEGIN");

            // Check if user owns the video
            const ownershipResult: QueryResult = await client.query(`
                SELECT v.video_id, v.path
                FROM video v
                WHERE v.video_id = $1
                  AND v.uploader = $2
            `, [videoId, user.user_id]);

            if (ownershipResult.rowCount === 0) {
                await client.query("ROLLBACK");
                return NextError.Error("Video not found or you don't have permission to delete it", HttpError.NotFound);
            }

            let { path } = ownershipResult.rows[0];
            path = path.split("/").slice(2).join("/");

            if (!await objectExists(videoBucket, path)) {
                await client.query("ROLLBACK");
                return NextError.Error("Video not found or not fully uploaded yet!", HttpError.NotFound);
            }

            await client.query(`
                DELETE
                FROM video
                WHERE video_id = $1
                  AND uploader = $2
            `, [videoId, user.user_id]);

            await client.query("COMMIT");

            try {
                await deleteFolder(videoBucket, videoId);
            } catch (err) {
                console.error("MinIO delete failed:", err);
            }

            return NextResponse.json({ success: true }, { status: 200 });

        } catch (dbErr) {
            await client.query("ROLLBACK");
            console.error("Database transaction error:", dbErr);
            return NextError.Error("Database write failed", HttpError.InternalServerError);
        } finally {
            client.release();
        }

    } catch (err) {
        console.error("Request handling error:", err);
        const message = err instanceof Error ? err.message : "Server error";
        return NextError.Error(message, HttpError.InternalServerError);
    }
}