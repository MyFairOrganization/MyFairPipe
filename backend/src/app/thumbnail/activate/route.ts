import { NextRequest, NextResponse } from "next/server";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";
import {getUser} from "@/lib/auth/getUser";
import {QueryResult} from "pg";
import {checkUUID} from "@/lib/utils/util";

export async function PATCH(req: NextRequest) {
    let client;

    try {
        // ====== getUser using new cookie-based getUser.ts ======
        const user = getUser(req);

        if (!user) {
            return NextResponse.json({error: "Not authenticated"}, {status: 401});
        }

        const {searchParams} = new URL(req.url);

        const thumbnail_id = searchParams.get("id");

        // -------------------------------
        // Request validation
        // -------------------------------
        if (!thumbnail_id) {
            return NextError.error("Missing id", HttpError.BadRequest);
        }

        if (!checkUUID(thumbnail_id)) {
            return NextError.error("Invalid thumbnail id format", HttpError.BadRequest);
        }

        // -------------------------------
        // Database Transaction
        // -------------------------------
        client = await connectionPool.connect();

        try {
            await client.query("BEGIN");

            // Get video_id and check ownership
            const resultVideo: QueryResult = await client.query(`
                SELECT t.video_id, v.uploader
                FROM Thumbnail t
                         JOIN video v ON v.video_id = t.video_id
                WHERE t.thumbnail_id = $1
            `, [thumbnail_id]);

            if (resultVideo.rowCount === 0) {
                await client.query("ROLLBACK");
                return NextError.error("Thumbnail not found", HttpError.NotFound);
            }

            const {video_id, uploader} = resultVideo.rows[0];

            // Check if user owns the video
            if (uploader !== user.id) {
                await client.query("ROLLBACK");
                return NextError.error("You don't have permission to modify this thumbnail", HttpError.Forbidden);
            }

            // Deactivate all thumbnails for this video
            await client.query(`
                UPDATE Thumbnail
                SET is_active = FALSE
                WHERE video_id = $1
                  AND is_active = TRUE
            `, [video_id]);

            // Activate the selected thumbnail
            const resultActivate: QueryResult = await client.query(`
                UPDATE Thumbnail
                SET is_active = TRUE
                WHERE thumbnail_id = $1
                RETURNING *
            `, [thumbnail_id]);

            if (resultActivate.rowCount === 0) {
                await client.query("ROLLBACK");
                return NextError.error("Failed to activate thumbnail", HttpError.InternalServerError);
            }

            await client.query("COMMIT");

            return NextResponse.json({success: true}, {status: 200});

        } catch (dbErr) {
            await client.query("ROLLBACK");
            console.error("Database transaction error:", dbErr);
            return NextError.error("Database write failed", HttpError.InternalServerError);
        } finally {
            client.release();
        }

    } catch (err) {
        console.error("Request handling error:", err);
        const message = err instanceof Error ? err.message : "Server error";
        return NextError.error(message, HttpError.InternalServerError);
    }
}