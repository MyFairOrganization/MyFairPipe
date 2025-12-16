import {NextRequest, NextResponse} from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";
import {checkUUID} from "@/lib/utils/util";
import {QueryResult} from "pg";
import {getUser} from "@/lib/auth/getUser";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": "http://localhost",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function PATCH(req: NextRequest) {
    let client;

    try {
        // ====== getUser using new cookie-based getUser.ts ======
        const user = getUser(req);

        if (!user) {
            return NextResponse.json({error: "Not authenticated"}, {status: 401});
        }

        const formData = await req.formData();
        const videoId = formData.get("id") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;

        // -------------------------------
        // Request validation
        // -------------------------------
        if (!videoId) {
            return NextError.error("Missing id", HttpError.BadRequest);
        }

        if (!title && !description) {
            return NextError.error("At least one field to update is required", HttpError.BadRequest);
        }

        if (!checkUUID(videoId)) {
            return NextError.error("Invalid video id format", HttpError.BadRequest);
        }

        // -------------------------------
        // Database transaction
        // -------------------------------
        client = await connectionPool.connect();

        try {
            await client.query("BEGIN");
            let result: QueryResult;

            // Check if user owns the video
            const ownershipResult: QueryResult = await client.query(`
                SELECT v.video_id
                FROM video v
                WHERE v.video_id = $1 AND v.uploader = $2
            `, [videoId, user.id]);

            if (ownershipResult.rowCount === 0) {
                await client.query("ROLLBACK");
                return NextError.error("Video not found or you don't have permission to edit it", HttpError.NotFound);
            }

            if (title && description) {
                result = await client.query(`
                    UPDATE video
                    SET title       = $1,
                        description = $2
                    WHERE video_id = $3 AND uploader = $4
                `, [title, description, videoId, user.id]);
            } else if (title) {
                result = await client.query(`
                    UPDATE video
                    SET title = $1
                    WHERE video_id = $2 AND uploader = $3
                `, [title, videoId, user.id]);
            } else if (description) {
                result = await client.query(`
                    UPDATE video
                    SET description = $1
                    WHERE video_id = $2 AND uploader = $3
                `, [description, videoId, user.id]);
            } else {
                await client.query("ROLLBACK");
                return NextError.error("At least one field to update is required", HttpError.BadRequest);
            }

            await client.query("COMMIT");

            if (result.rowCount === 0) {
                return NextError.error("Video not found", HttpError.NotFound);
            }

            return NextResponse.json({success: true}, {status: 200});

        } catch (err) {
            await client.query("ROLLBACK");
            console.error("Database error:", err);
            return NextError.error("Database write failed", HttpError.InternalServerError);

        } finally {
            client.release();
        }

    } catch (err: any) {
        console.error("Update processing error:", err);
        const message = err instanceof Error ? err.message : "Server error.";
        return NextError.error(message, HttpError.InternalServerError);
    }
}