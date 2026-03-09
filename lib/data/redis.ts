/**
 * lib/data/redis.ts
 * Upstash Redis client singleton with namespaced keys.
 * Provides cache, rate-limiting, and pub/sub utilities.
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ─────────────────────────────────────────────────────────────────────────────
// Redis client singleton
// ─────────────────────────────────────────────────────────────────────────────

const globalForRedis = globalThis as typeof globalThis & {
    __redis?: Redis;
};

if (!globalForRedis.__redis) {
    globalForRedis.__redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
}

export const redis = globalForRedis.__redis;

// ─────────────────────────────────────────────────────────────────────────────
// Key prefix for namespace isolation
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX = process.env.REDIS_PREFIX ?? "hrs:";

function key(k: string): string {
    return `${PREFIX}${k}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache utilities — drop-in for mockCache API surface
// ─────────────────────────────────────────────────────────────────────────────

export const cache = {
    async get(k: string): Promise<string | null> {
        const val = await redis.get<string>(key(k));
        return val ?? null;
    },

    async set(k: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await redis.set(key(k), value, { ex: ttlSeconds });
        } else {
            await redis.set(key(k), value);
        }
    },

    async del(k: string): Promise<void> {
        await redis.del(key(k));
    },

    async exists(k: string): Promise<boolean> {
        const result = await redis.exists(key(k));
        return result === 1;
    },

    /**
     * Invalidate all keys matching a glob pattern.
     * Uses SCAN to avoid blocking the server.
     */
    async invalidatePattern(pattern: string): Promise<number> {
        let cursor: string | number = 0;
        let deleted = 0;
        do {
            const result = await redis.scan(cursor, {
                match: key(pattern),
                count: 100,
            });
            const [nextCur, keys] = result as [number | string, string[]];
            cursor = nextCur;
            if (keys.length > 0) {
                await redis.del(...keys);
                deleted += keys.length;
            }
        } while (cursor !== 0);
        return deleted;
    },

    async flush(): Promise<void> {
        await cache.invalidatePattern("*");
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiters
// ─────────────────────────────────────────────────────────────────────────────

/**
 * General API rate limiter: 60 requests per 60 seconds per identifier.
 */
export const apiRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: `${PREFIX}rl:api`,
    analytics: true,
});

/**
 * Auth rate limiter: 10 attempts per 60 seconds per identifier.
 * Prevents brute-force login attempts.
 */
export const authRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: `${PREFIX}rl:auth`,
    analytics: true,
});

/**
 * Strict rate limiter for sensitive operations: 5 per 300 seconds.
 */
export const strictRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "300 s"),
    prefix: `${PREFIX}rl:strict`,
    analytics: true,
});

export default redis;
