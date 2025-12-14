import { connectionPool } from "@/lib/services/postgres";
import { NextRequest, NextResponse } from "next/server";
import NextError, { HttpError } from "@/lib/utils/error";

async function like(videoID: number, username: string) {
  const client = await connectionPool.connect();

  const test = `
    SELECT * FROM video;
  `;

  const result = await client.query(test);
  console.log(result);

  // SQL query to check if user already liked video
  const query = `
    SELECT lv.is_like
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

    // Check if User already liked videos => returns if true
    if (result.rows.length > 0 && is_like) {
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
      DELETE FROM like_video
      WHERE user_id = $1 AND video_id = $2
    `;

      // Insert gets executed
      await client.query(deleteLV, [userID, videoID]);

      return false;
    }

    // Check if like-entry has to be created in DB
    if (is_like === null) { // Entry has to be created
      // SQL query for User to like Video
      const insertLV = `
      INSERT INTO Like_Video (user_id, video_id, is_like)
      VALUES ($1, $2, TRUE)
    `;

      // Insert gets executed
      await client.query(insertLV, [userID, videoID]);
    } else if (!is_like) { // Entry has to be updated from dislike to like
      // LV Entry gets updated
      const updateLV = `
        UPDATE Like_Video
        SET is_like = TRUE
        WHERE user_id = $1 AND video_id = $2;
      `;

      // Query gets executed
      await client.query(updateLV, [userID, videoID]);
    }

    // Updates LikeCount in Metadata
    const updateCount = `
        UPDATE Video
        SET likes = likes + $1, dislikes = dislikes + $2
        WHERE video_id = $3;
      `;

    // value that likes are increased by
    updateLikes = 1;
    // -1 if false, 0 if null
    var updateDislikes :number = is_like === null ? 0 : -1;

    await client.query(updateCount, [updateLikes, updateDislikes, videoID]);

    return true;
  } catch (err) {
    if (err.message.includes("user")) {
      throw new Error("'user_id does not point to existing User'");
    } else if (err.message.includes("video")) {
      throw new Error("'video_id does not point to existing Video'");
    }
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const videoID:number = Number.parseInt(searchParams.get('videoID'));
    const username = searchParams.get('username');

    const result = await like(videoID, username);
    return NextResponse.json({ result }, {status: 200});
  } catch (err) {
    console.error(err);
    return NextError.error(err + "", HttpError.BadRequest);
  }
}