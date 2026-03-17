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

const REDIS_OP_TIMEOUT_MS = Number(process.env.REDIS_OP_TIMEOUT_MS ?? 2000);

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Redis operation timed out")), timeoutMs)),
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache utilities — drop-in for mockCache API surface
// ─────────────────────────────────────────────────────────────────────────────

export const cache = {
    /**
     * The Upstash REST SDK automatically deserialises JSON when reading, so the
     * returned value is already a parsed object even though we passed a JSON
     * string to `set()`.  We accept `unknown` here so callers can use the value
     * directly without calling `JSON.parse()` again.
     */
    async get(k: string): Promise<unknown> {
        try {
            const val = await withTimeout(redis.get<unknown>(key(k)), REDIS_OP_TIMEOUT_MS);
            return val ?? null;
        } catch (err) {
            // Cache errors should not break app flow.
            // eslint-disable-next-line no-console
            console.error("[cache] get error:", err);
            return null;
        }
    },

    async set(k: string, value: string, ttlSeconds?: number): Promise<void> {
        try {
            if (ttlSeconds) {
                await withTimeout(redis.set(key(k), value, { ex: ttlSeconds }), REDIS_OP_TIMEOUT_MS);
            } else {
                await withTimeout(redis.set(key(k), value), REDIS_OP_TIMEOUT_MS);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("[cache] set error:", err);
        }
    },

    async del(k: string): Promise<void> {
        try {
            await withTimeout(redis.del(key(k)), REDIS_OP_TIMEOUT_MS);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("[cache] del error:", err);
        }
    },

    async exists(k: string): Promise<boolean> {
        try {
            const result = await withTimeout(redis.exists(key(k)), REDIS_OP_TIMEOUT_MS);
            return result === 1;
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("[cache] exists error:", err);
            return false;
        }
    },

    /**
     * Invalidate all keys matching a glob pattern.
     * Uses SCAN to avoid blocking the server.
     */
    async invalidatePattern(pattern: string): Promise<number> {
        try {
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
        } catch (err) {
            // Cache failures should not break core write operations.
            // Log and return 0 so callers can continue.
            // eslint-disable-next-line no-console
            console.error("[cache] invalidatePattern error:", err);
            return 0;
        }
    },

    /**
     * Invalidate cache keys matching a glob pattern.
     * This is intentionally fire-and-forget to avoid blocking requests.
     * The call will be cancelled after `timeoutMs` milliseconds.
     */
    invalidatePatternAsync(pattern: string, timeoutMs = 5000): void {
        void (async () => {
            try {
                await Promise.race([
                    cache.invalidatePattern(pattern),
                    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
                ]);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("[cache] invalidatePatternAsync error:", err);
            }
        })();
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
