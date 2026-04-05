export function parseCachedJsonSafe<T>(cached: unknown): T | null {
  if (cached == null) return null;
  try {
    // NOTE: non-string cached payloads come from this process' cache adapter and are
    // assumed to be previously validated payload shapes from our own route writes.
    // This helper only guarantees safe JSON parsing, not structural runtime validation.
    return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
  } catch {
    return null;
  }
}
