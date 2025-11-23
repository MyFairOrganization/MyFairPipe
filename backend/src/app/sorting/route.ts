import { connectionPool } from "@/lib/services/postgres";
import { redis } from "@/lib/services/redis";

interface Video {
  id: number;
  title: string;
  likes: number;
  thumbnail_url: string;
  created_at: string;
}

async function loadVideosFromPostgres(limit: number = 10, offset: number = 0): Promise<Video[]> {
  const query = `
    SELECT v.path, vd.title, v.description, v.views, (vd.likes * 2 + v.views * 0.1 - vd.dislikes * 3) AS score
    FROM video_details vd
    JOIN public.video v on vd.video_id = v.video_id
    ORDER BY score DESC
    LIMIT $1
    OFFSET $2;
  `;

  const result = await connectionPool.query(query, [limit, offset]);

  console.log(result.rows);

  return result.rows;
}

async function cacheVideos(videos: Video[]): Promise<void> {
  const key = "videos:mostLiked";

  await redis.set(key, JSON.stringify(videos), "EX", 60);

  console.log("✔ Videos cached in Redis");
}

async function getCachedVideos(): Promise<Video[] | null> {
  const key = "videos:mostLiked";

  const cached = await redis.get(key);
  if (!cached) return null;

  return JSON.parse(cached);
}

async function main() {
  console.log("📥 Loading videos from Postgres...");
  const videos = await loadVideosFromPostgres(5, 0);

  console.log("🔄 Caching videos in Redis...");
  await cacheVideos(videos);

  console.log("📤 Reading videos from Redis...");
  const cachedVideos = await getCachedVideos();

  console.log("📦 Cached videos:");
  console.log(cachedVideos);

  // Close connections gracefully
  await connectionPool.end();
  await redis.quit();
}

main().catch(console.error);
