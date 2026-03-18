/**
 * lib/utils/offlineCache.ts
 * Basic localStorage-backed cache for API responses and other JSON payloads.
 *
 * This is intentionally small and resilient; failures are silently ignored.
 */

const PREFIX = "hrs:offline:";

interface CacheRecord<T> {
    data: T;
    updatedAt: number;
}

const DEFAULT_TTL_MS = 1000 * 60 * 15; // 15 minutes

function makeKey(key: string) {
    return `${PREFIX}${key}`;
}

export function getCached<T>(key: string, maxAgeMs = DEFAULT_TTL_MS): T | undefined {
    try {
        const raw = localStorage.getItem(makeKey(key));
        if (!raw) return undefined;
        const record = JSON.parse(raw) as CacheRecord<T>;
        if (typeof record !== "object" || record === null) return undefined;
        if (Date.now() - record.updatedAt > maxAgeMs) {
            localStorage.removeItem(makeKey(key));
            return undefined;
        }
        return record.data;
    } catch {
        return undefined;
    }
}

export function setCached<T>(key: string, data: T): void {
    try {
        const record: CacheRecord<T> = { data, updatedAt: Date.now() };
        localStorage.setItem(makeKey(key), JSON.stringify(record));
    } catch {
        // ignore
    }
}

export function clearCached(key: string): void {
    try {
        localStorage.removeItem(makeKey(key));
    } catch {
        // ignore
    }
}
