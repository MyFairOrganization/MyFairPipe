import {NextRequest, NextResponse} from "next/server";
import {createBucketIfNeeded, photoBucket, uploadFileToMinio} from "@/lib/services/minio";
import {connectionPool} from "@/lib/services/postgres";
import NextError, {HttpError} from "@/lib/utils/error";
import {getUser} from "@/lib/auth/getUser";

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
    const user = getUser(req);
    if (!user) {
        return NextResponse.json({error: "Not authenticated"}, {status: 401});
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextError.error("No file uploaded", HttpError.BadRequest);
    }

    if (!file.type.startsWith("image/")) {
        return NextError.error("Only image files are allowed", HttpError.BadRequest);
    }

    const client = await connectionPool.connect();
    await client.query("BEGIN");

    const amount = await client.query(`SELECT *
                                       FROM photo;`)

    const photoId = amount.rowCount! + 1;
    const extension = file.name.split(".").pop() || "png";
    const filename = `${photoId}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await createBucketIfNeeded(photoBucket);
    await uploadFileToMinio(filename, photoBucket, buffer, file.type);

    try {

        await client.query(`
            INSERT INTO photo (photo_id, path)
            VALUES ($1, $2)
        `, [photoId, filename]);

        await client.query(`
            INSERT INTO profile_picture (profile_picture_id, photo_id)
            VALUES ($1, $2)
        `, [photoId, photoId]);

        await client.query(`
            UPDATE "User"
            SET picture_id = $1
            WHERE user_id = $2
        `, [photoId, user.user_id]);

        await client.query("COMMIT");

        return NextResponse.json({success: true}, {status: 200});

    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        return NextError.error("Upload failed", HttpError.InternalServerError);
    } finally {
        client.release();
    }
}
