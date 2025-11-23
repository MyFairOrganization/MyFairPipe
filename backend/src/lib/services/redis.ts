import Redis from "ioredis";

const redisUrl = process.env.REDIS;

if (!redisUrl) {
  throw new Error("Missing REDIS environment variable");
}

export const redis = new Redis(redisUrl);