/**
 * lib/data/mockCache.ts
 * In-memory TTL cache with the same API surface as ioredis.
 * Swap for a real ioredis client without touching call sites.
 */

interface CacheEntry {
    value: string;
    expiresAt: number | null; // null = no expiry
}

class MockCache {
    private store = new Map<string, CacheEntry>();
    private timers = new Map<string, ReturnType<typeof setTimeout>>();

    async get(key: string): Promise<string | null> {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.store.set(key, { value, expiresAt });

        // Clear any existing timer
        const existingTimer = this.timers.get(key);
        if (existingTimer) clearTimeout(existingTimer);

        if (ttlSeconds) {
            const timer = setTimeout(() => {
                this.store.delete(key);
                this.timers.delete(key);
            }, ttlSeconds * 1000);
            this.timers.set(key, timer);
        }
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }
    }

    async exists(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== null;
    }

    async keys(pattern: string): Promise<string[]> {
        const regexPattern = pattern
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*")
            .replace(/\?/g, ".");
        const regex = new RegExp(`^${regexPattern}$`);
        return Array.from(this.store.keys()).filter((k) => regex.test(k));
    }

    async invalidatePattern(pattern: string): Promise<number> {
        const matchingKeys = await this.keys(pattern);
        await Promise.all(matchingKeys.map((k) => this.del(k)));
        return matchingKeys.length;
    }

    async flush(): Promise<void> {
        this.store.clear();
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers.clear();
    }

    /** Inspect current store size (useful for tests / debugging) */
    size(): number {
        return this.store.size;
    }
}

// Singleton — same instance across all server-side imports
const globalForCache = global as typeof global & { __mockCache?: MockCache };
if (!globalForCache.__mockCache) {
    globalForCache.__mockCache = new MockCache();
}

export const mockCache = globalForCache.__mockCache;
export default mockCache;
