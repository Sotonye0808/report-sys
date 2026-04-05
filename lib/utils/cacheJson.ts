export function parseCachedJsonSafe<T>(cached: unknown): T | null {
  if (cached == null) return null;
  try {
    // NOTE: non-string cached payloads are trusted values from the in-process cache adapter.
    return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
  } catch {
    return null;
  }
}
