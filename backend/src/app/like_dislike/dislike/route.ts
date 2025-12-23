import { connectionPool } from "@/lib/services/postgres";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";

async function dislike(videoID: number, username: string) {
  const client = await connectionPool.connect();

  // SQL query to check if user already disliked video
  const query = `
    SELECT lv.is_like, u.user_id
    FROM Like_Video lv
    JOIN "User" u ON u.user_id = lv.user_id
    WHERE u.username = $1 AND lv.video_id = $2
  `;

  try {
    const result = await client.query(query, [username, videoID]);

    var is_like :boolean | null;

    // sets is_like to null or is_like from DB if it exists or not
    try {
      is_like = result.rows[0].is_like;
    } catch (e) {
      is_like = null;
    }

    // SELECT UserID for future queries
    const selectUID = `
      SELECT user_id
      FROM "User"
      WHERE username = $1
    `;

    // UserID from SELECT
    const userID = (await client.query(selectUID, [username])).rows[0].user_id;

    // Check if User already disliked videos => returns if true
    if (result.rows.length > 0 && !is_like) {
      // Updates LikeCount in Metadata
      const updateCount = `
        UPDATE video
        SET dislikes = dislikes + $1
        WHERE video_id = $2;
      `;

      var updateDislikes = -1;

      await client.query(updateCount, [updateDislikes, videoID]);

      // SQL query for User to dislike Video
      const deleteLV = `
      DELETE FROM like_video
      WHERE user_id = $1 AND video_id = $2
    `;

      // Insert gets executed
      await client.query(deleteLV, [userID, videoID]);

      return false;
    }

    // Check if dislike-entry has to be created in DB
    if (is_like === null) { // Entry has to be created
      // SQL query for User to dislike Video
      const insertLV = `
      INSERT INTO Like_Video (user_id, video_id, is_like)
      VALUES ($1, $2, FALSE)
    `;

      // Insert gets executed
      await client.query(insertLV, [userID, videoID]);
    } else if (is_like) { // Entry has to be updated from like to dislike
      // LV Entry gets updated
      const updateLV = `
        UPDATE Like_Video
        SET is_like = FALSE
        WHERE user_id = $1 AND video_id = $2;
      `;

      // Query gets executed
      await client.query(updateLV, [userID, videoID]);
    }

    // Updates LikeCount in Metadata
    const updateCount = `
        UPDATE video
        SET likes = likes + $1, dislikes = dislikes + $2
        WHERE video_id = $3;
      `;

    var updateLikes = is_like === null ? 0 : -1;
    updateDislikes = 1;

    await client.query(updateCount, [updateLikes, updateDislikes, videoID]);

    return true;
  } catch (err) {
    return NextError.error(err, HttpError.BadRequest)
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const videoIDParam = searchParams.get('videoID');

    if (videoIDParam === null) {
      return NextError.error("No Video ID", HttpError.BadRequest);
    }

    const videoID = Number.parseInt(videoIDParam, 10);
    const usernameParam = searchParams.get('username');

    if (usernameParam === null) {
      return NextError.error("No Username", HttpError.BadRequest);
    }

    const result = await dislike(videoID, usernameParam);
    if (result instanceof NextResponse) {
      return result
    }
    return NextResponse.json({ result }, {status: 200});
  } catch (err) {
    console.error(err);
    return NextError.error(err + "", HttpError.BadRequest);
  }
}