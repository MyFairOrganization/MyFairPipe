import { connectionPool } from "@/lib/services/postgres";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";
import { getUser } from "@/lib/auth/getUser";

async function like(videoID: number, userID: number) {
    const client = await connectionPool.connect();

    await client.query("BEGIN");

    // SQL query to check if user already liked video
    const query = `
        SELECT lv.is_like, u.anonym
        FROM Like_Video lv
                 JOIN "User" u ON u.user_id = lv.user_id
        WHERE u.user_id = $1
          AND lv.video_id = $2
    `;

    try {
        const result = await client.query(query, [userID, videoID]);

        var isLike: boolean | null;

        // sets isLike to null or isLike from DB if it exists or not
        try {
            isLike = result.rows[0].is_like;
        } catch (_) {
            isLike = null;
        }

        // Check if User already liked videos => returns if true
        if (result.rows.length > 0 && isLike) {
            // Updates LikeCount in Metadata
            const updateCount = `
                UPDATE video
                SET likes = likes + $1
                WHERE video_id = $2;
            `;

            var updateLikes = -1;

            await client.query(updateCount, [updateLikes, videoID]);

            // SQL query for deleting like from video
            const deleteLV = `
                DELETE
                FROM like_video
                WHERE user_id = $1
                  AND video_id = $2
            `;

            // Insert gets executed
            await client.query(deleteLV, [userID, videoID]);

            await client.query("COMMIT");

            return false;
        }

        // Check if like-entry has to be created in DB
        if (isLike === null) { // Entry has to be created
            // SQL query for User to like Video
            const insertLV = `
                INSERT INTO Like_Video (user_id, video_id, is_like)
                VALUES ($1, $2, TRUE)
            `;

            // Insert gets executed
            await client.query(insertLV, [userID, videoID]);
        } else if (!isLike) { // Entry has to be updated from dislike to like
            // LV Entry gets updated
            const updateLV = `
                UPDATE Like_Video
                SET is_like = TRUE
                WHERE user_id = $1
                  AND video_id = $2;
            `;

            // Query gets executed
            await client.query(updateLV, [userID, videoID]);
        }

        // Updates LikeCount in Metadata
        const updateCount = `
            UPDATE Video
            SET likes    = likes + $1,
                dislikes = dislikes + $2
            WHERE video_id = $3;
        `;

        // value that likes are increased by
        updateLikes = 1;
        // -1 if false, 0 if null
        var updateDislikes: number = isLike === null ? 0 : -1;

        await client.query(updateCount, [updateLikes, updateDislikes, videoID]);

        // TODO: unused const
        const selectCount = `SELECT likes
                             FROM video
                             WHERE video_id = $1;`;

        await client.query("COMMIT");

        return true;
    } catch (err: any) {
        return NextError.Error(err, HttpError.BadRequest);
    } finally {
        client.release();
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204, headers: {
            "Access-Control-Allow-Origin": "http://myfairpipe.com",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        const user = getUser(req);

        const { videoID } = await req.json();

        if (videoID === null) {
            return NextError.Error("No Video ID", HttpError.BadRequest);
        }

        const userID = user.user_id;

        if (userID === null) {
            return NextError.Error("No User ID", HttpError.BadRequest);
        }

        const result = await like(Number(videoID), Number(userID));
        if (result instanceof NextResponse) {
            return result;
        }
        return NextResponse.json({ result }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextError.Error(err + "", HttpError.BadRequest);
    }
}