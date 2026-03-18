import { enqueueOfflineRequest } from "@/lib/utils/offlineQueue";

export type OfflineFetchResult = { ok: boolean; queued?: true; response?: Response };

export async function offlineFetch(url: string, init: RequestInit): Promise<OfflineFetchResult> {
    try {
        const res = await fetch(url, init);
        if (!res.ok) {
            // If server fails but we are offline, queue; otherwise return failure.
            if (!navigator.onLine) {
                enqueueOfflineRequest({ url, init });
                return { ok: true, queued: true };
            }
            return { ok: false, response: res };
        }
        return { ok: true, response: res };
    } catch {
        // Network error — queue for retry
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            enqueueOfflineRequest({ url, init });
            return { ok: true, queued: true };
        }
        return { ok: false };
    }
}
