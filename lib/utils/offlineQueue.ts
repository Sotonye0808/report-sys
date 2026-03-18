/**
 * lib/utils/offlineQueue.ts
 * Stores pending network actions (POST/PUT/DELETE) in localStorage when offline.
 * When the browser comes back online, it retries them in order.
 *
 * This is intentionally simple: it uses localStorage as a queue and retries on
 * connectivity restored. Actions are removed on success.
 */

export type OfflineRequest = {
    id: string;
    url: string;
    init: RequestInit;
    createdAt: number;
    attempts: number;
    error?: string;
};

export type OfflineQueueStatus = {
    pending: number;
    failed: number;
    lastError?: string;
};

const QUEUE_KEY = "hrs:offline:queue";

function readQueue(): OfflineRequest[] {
    try {
        const raw = localStorage.getItem(QUEUE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as OfflineRequest[];
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch {
        return [];
    }
}

function writeQueue(queue: OfflineRequest[]): void {
    try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
        // ignore
    }
}

function requestKey(url: string, init: RequestInit): string {
    const body = init.body ?? "";
    const method = init.method ?? "GET";
    return `${method.toUpperCase()}|${url}|${typeof body === "string" ? body : JSON.stringify(body)}`;
}

export function enqueueOfflineRequest(req: Omit<OfflineRequest, "id" | "createdAt" | "attempts">): void {
    try {
        const queue = readQueue();
        const key = requestKey(req.url, req.init);

        // Deduplicate: prefer the most recent request for the same endpoint/payload.
        const filtered = queue.filter(
            (item) => requestKey(item.url, item.init) !== key,
        );

        filtered.push({
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            attempts: 0,
            ...req,
        });
        writeQueue(filtered);
    } catch {
        // ignore
    }
}

export function getOfflineQueueLength(): number {
    return readQueue().length;
}

export function getOfflineQueueStatus(): OfflineQueueStatus {
    const queue = readQueue();
    const pending = queue.filter((item) => !item.error).length;
    const failedItems = queue.filter((item) => !!item.error);
    return {
        pending,
        failed: failedItems.length,
        lastError: failedItems[0]?.error,
    };
}

export function getOfflineQueue(): OfflineRequest[] {
    return readQueue();
}

export function clearFailedOfflineQueue(): void {
    try {
        const queue = readQueue();
        const remaining = queue.filter((item) => !item.error);
        writeQueue(remaining);
    } catch {
        // ignore
    }
}

export async function processOfflineQueue(
    maxAttempts = 3,
): Promise<OfflineQueueStatus> {
    if (typeof navigator === "undefined" || !navigator.onLine) return getOfflineQueueStatus();

    const queue = readQueue();
    if (queue.length === 0) return getOfflineQueueStatus();

    const remaining: OfflineRequest[] = [];
    let lastError: string | undefined;

    for (const item of queue) {
        // Skip requests already marked as failed.
        if (item.error) {
            remaining.push(item);
            continue;
        }

        try {
            const res = await fetch(item.url, item.init);
            if (!res.ok) {
                // Do not retry client errors (except 429)
                if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                    const body = await res.text();
                    const message = `Request failed ${res.status}: ${body}`;
                    remaining.push({ ...item, error: message });
                    lastError = message;
                    continue;
                }

                throw new Error(`Request failed (${res.status})`);
            }

            // Success: drop from queue.
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            lastError = errorMessage;

            if (item.attempts + 1 < maxAttempts) {
                remaining.push({ ...item, attempts: item.attempts + 1 });
            } else {
                // Mark as failed to avoid endless retry loops.
                remaining.push({ ...item, attempts: item.attempts + 1, error: errorMessage });
            }
        }
    }

    writeQueue(remaining);
    return getOfflineQueueStatus();
}

export function clearOfflineQueue(): void {
    try {
        localStorage.removeItem(QUEUE_KEY);
    } catch {
        // ignore
    }
}

export function clearOfflineQueueErrors(): void {
    try {
        const queue = readQueue();
        const cleaned = queue.map((item) => ({ ...item, error: undefined, attempts: 0 }));
        writeQueue(cleaned);
    } catch {
        // ignore
    }
}
