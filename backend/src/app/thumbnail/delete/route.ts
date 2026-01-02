import { NextRequest, NextResponse } from "next/server";
import { connectionPool } from "@/lib/services/postgres";
import { minioClient, videoBucket } from "@/lib/services/minio";
import NextError, { HttpError } from "@/lib/utils/error";
import { getUser } from "@/lib/auth/getUser";
import { QueryResult } from "pg";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": "http://myfairpipe.com",
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

        const { searchParams } = new URL(req.url);

        const thumbnailId = searchParams.get("id");

        // -------------------------------
        // Request validation
        // -------------------------------
        if (!thumbnailId) {
            return NextError.Error("Missing id", HttpError.BadRequest);
        }

        // -------------------------------
        // Database Transaction
        // -------------------------------
        client = await connectionPool.connect();
        try {
            await client.query("BEGIN");

            // Check ownership and get thumbnail info
            const result: QueryResult = await client.query(`
                SELECT t.thumbnail_id, p.photo_id, p.path, v.uploader
                FROM Thumbnail t
                         JOIN Photo p ON p.photo_id = t.photo_id
                         JOIN video v ON v.video_id = t.video_id
                WHERE t.thumbnail_id = $1
            `, [thumbnailId]);

            if (result.rowCount === 0) {
                await client.query("ROLLBACK");
                return NextError.Error("Thumbnail not found", HttpError.NotFound);
            }

            const { path, uploader } = result.rows[0];

            // Check if user owns the video
            if (uploader !== user.id) {
                await client.query("ROLLBACK");
                return NextError.Error("You don't have permission to delete this thumbnail", HttpError.Forbidden);
            }

            try {
                await minioClient.removeObject(videoBucket, path);
            } catch (err) {
                await client.query("ROLLBACK");
                console.error("MinIO delete failed:", err);
                return NextError.Error("Could not delete file from storage", HttpError.InternalServerError);
            }

            await client.query(`
                DELETE
                FROM Thumbnail
                WHERE thumbnail_id = $1
            `, [thumbnailId]);

            await client.query("COMMIT");

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