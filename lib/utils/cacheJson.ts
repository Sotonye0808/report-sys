export function parseCachedJsonSafe<T>(cached: unknown): T | null {
    if (cached == null) return null;
    try {
        return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
    } catch {
        return null;
    }
}
