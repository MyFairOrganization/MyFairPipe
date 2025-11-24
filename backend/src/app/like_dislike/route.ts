import { connectionPool } from "@/lib/services/postgres";
import { NextRequest, NextResponse } from "next/server";

async function like(videoID: string, username: string) {
  await connectionPool.connect();

  const query = `
    SELECT lv.is_like, m.metadata_id
    FROM like_video lv
    JOIN "User" u ON u.user_id = lv.user_id
    JOIN video v ON v.video_id = lv.video_id
    JOIN metadata m ON v.metadata_id = m.metadata_id
    WHERE u.username = $1 AND v.video_id = $2
  `;

  const result = await connectionPool.query(query, [username, videoID]);
  const is_like: boolean = result.rows[0].is_like;

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const result = like("0", 'test');
    return NextResponse.json({ result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Fehler beim Liken" }, { status: 500 });
  }
}