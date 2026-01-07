import Redis from "ioredis";

const redisUrl = process.env.REDIS || "redis://redis:6379/0";

export const redis = new Redis(redisUrl, {
    retryStrategy(times) {
        return Math.min(times * 2000, 10000);
    },
});
