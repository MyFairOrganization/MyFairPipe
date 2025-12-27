import {NextRequest, NextResponse} from "next/server";
import { countFilesInFolder, objectExists, uploadBucket, uploadFileToMinio, videoBucket } from "@/lib/services/minio";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";
import {checkUUID} from "@/lib/utils/util";
import {getUser} from "@/lib/auth/getUser";
import {QueryResult} from "pg";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": "http://myfairpipe.com",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function POST(req: NextRequest) {
    let client;

    try {
        // ====== getUser using new cookie-based getUser.ts ======
        const user = getUser(req);

        if (!user) {
            return NextResponse.json({error: "Not authenticated"}, {status: 401});
        }

        const formData = await req.formData();

        const videoId = formData.get("id") as string;
        const file = formData.get("file") as File;

        // -------------------------------
        // Request validation
        // -------------------------------
        if (!videoId) {
            return NextError.error("No video given", HttpError.BadRequest);
        }

        if (!file) {
            return NextError.error("No file uploaded", HttpError.BadRequest);
        }

        if (!file.type.startsWith("image/")) {
            return NextError.error("Only image files are allowed", HttpError.BadRequest);
        }

        // -------------------------------
        // Database ownership check
        // -------------------------------
        client = await connectionPool.connect();

        try {
            const ownershipResult: QueryResult = await client.query(`
                SELECT v.video_id
                FROM video v
                WHERE v.video_id = $1 AND v.uploader = $2
            `, [videoId, user.user_id]);

            if (ownershipResult.rowCount === 0) {
                return NextError.error("Video not found or you don't have permission to add thumbnails", HttpError.NotFound);
            }
        } finally {
            client.release();
        }

        // -------------------------------
        // MinIO validation
        // -------------------------------
        const exists = await objectExists(videoBucket, `${videoId}/${videoId}.mp4`) || await objectExists(uploadBucket, `${videoId}.mov`);
        // const exists = await objectExists(videoBucket, `${videoId}/master.m3u8`);


        if (!exists) {
            return NextError.error("Video isn't uploaded yet.", HttpError.BadRequest);
        }

        const thumbnails_existing = await countFilesInFolder(videoBucket, `${videoId}/thumbnails`);

        if (thumbnails_existing >= 5) {
            return NextError.error("Only 5 thumbnails are allowed at the same time", HttpError.BadRequest);
        }

        // -------------------------------
        // Prepare Client for Database
        // -------------------------------
        client = await connectionPool.connect();

        await client.query("BEGIN");

        const rows = await client.query(`SELECT * FROM thumbnail;`);

        // -------------------------------
        // Prepare file
        // -------------------------------
        const buffer = Buffer.from(await file.arrayBuffer());
        const id = rows.rowCount + 1;
        const extension = file.name.split(".").pop() || "png";
        const filename = `${id}.${extension}`;

        // -------------------------------
        // Upload file to MinIO
        // -------------------------------
        await uploadFileToMinio(`${videoId}/thumbnails/${filename}`, videoBucket, buffer, file.type);

        // -------------------------------
        // Database Transaction
        // -------------------------------
        client = await connectionPool.connect();
        try {
            await client.query(`
                INSERT INTO photo (photo_id, path)
                VALUES ($1, $2)
            `, [id, `${videoId}/thumbnails/${filename}`]);

            await client.query(`
                INSERT INTO Thumbnail (thumbnail_id, photo_id, video_id, is_active)
                VALUES ($1, $2, $3, $4)
            `, [id, id, videoId, false]);

            await client.query(`
                UPDATE video
                SET thumbnail_id = $1
                WHERE video_id = $2
            `, [id, videoId]);

            await client.query("COMMIT");
            return NextResponse.json({id: id, success: true}, {status: 200});

        } catch (err) {
            await client.query("ROLLBACK");
            console.error("Database error:", err);
            return NextError.error("Database write failed.", HttpError.InternalServerError);

        } finally {
            client.release();
        }

    } catch (err: any) {
        console.error("Upload processing error:", err);
        const message = err instanceof Error ? err.message : "Server error.";
        return NextError.error(message, HttpError.InternalServerError);
    }
}