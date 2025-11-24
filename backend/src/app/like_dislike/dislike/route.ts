import { connectionPool } from "@/lib/services/postgres";
import { NextRequest, NextResponse } from "next/server";

async function dislike(videoID: number, username: string) {
  const client = await connectionPool.connect();

  // SQL query to check if user already disliked video
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

    // Check if User already disliked videos => returns if true
    if (result.rows.length > 0 && !is_like) {
      return username + " already disliked!";
    }

    // SELECT UserID for future queries
    const selectUID = `
      SELECT user_id
      FROM "User"
      WHERE username = $1
    `;

    // UserID from SELECT
    const userID = (await client.query(selectUID, [username])).rows[0].user_id;

    // Check if dislike-entry has to be created in DB
    if (is_like === null) { // Entry has to be created
      // SQL query for User to dislike Video
      const insertLV = `
      INSERT INTO Like_Video (user_id, video_id, is_like)
      VALUES ($1, $2, TRUE)
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

    // SELECTs Metadata_id for next step (Update likes/dislikes)
    const selectMID = `
      SELECT metadata_id
      FROM video
      WHERE video_id = $1
    `;

    const metadata_id = (await client.query(selectMID, [videoID])).rows[0].metadata_id;

    // Updates LikeCount in Metadata
    const updateCount = `
        UPDATE Metadata
        SET likes = likes + $1, dislikes = dislikes + $2
        WHERE metadata_id = $3;
      `;

    var updateLikes = is_like === null ? 0 : -1;
    var updateDislikes :number = 1;

    await client.query(updateCount, [updateLikes, updateDislikes, metadata_id]);

    return username + " disliked!";
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const videoID:number = Number.parseInt(searchParams.get('videoID'));
    const username = searchParams.get('username');

    const result = await dislike(videoID, username);
    return NextResponse.json({ result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Fehler beim Like"}, { status: 500 });
  }
}
