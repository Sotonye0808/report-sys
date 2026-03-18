import { useEffect, useState } from "react";
import {
    clearFailedOfflineQueue,
    clearOfflineQueueErrors,
    getOfflineQueue,
    getOfflineQueueStatus,
    getOfflineQueueLength,
    processOfflineQueue,
    OfflineQueueStatus,
} from "@/lib/utils/offlineQueue";

export function useOfflineSync() {
    const [queueLength, setQueueLength] = useState(getOfflineQueueLength());
    const [queueItems, setQueueItems] = useState(getOfflineQueue());
    const [failedCount, setFailedCount] = useState(0);
    const [lastError, setLastError] = useState<string | undefined>(undefined);
    const [lastSyncAt, setLastSyncAt] = useState<Date | undefined>(undefined);
    const [isSyncing, setIsSyncing] = useState(false);

    const refreshStatus = () => {
        const status = getOfflineQueueStatus();
        setQueueLength(status.pending);
        setFailedCount(status.failed);
        setLastError(status.lastError);
        setQueueItems(getOfflineQueue());
    };

    const sync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            const status: OfflineQueueStatus = await processOfflineQueue();
            setQueueLength(status.pending);
            setFailedCount(status.failed);
            setLastError(status.lastError);
            setLastSyncAt(new Date());
        } finally {
            setIsSyncing(false);
        }
    };

    const retry = async () => {
        clearOfflineQueueErrors();
        refreshStatus();
        await sync();
    };

    const clearFailed = () => {
        clearFailedOfflineQueue();
        refreshStatus();
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        const onOnline = () => {
            refreshStatus();
            void sync();
        };

        window.addEventListener("online", onOnline);

        // If we mount while online but there are queued items (from a prior session), start syncing
        if (navigator.onLine && getOfflineQueueLength() > 0) {
            void sync();
        }

        return () => window.removeEventListener("online", onOnline);
    }, []);

    // Periodically refresh queue length (in case another tab modified it)
    useEffect(() => {
        const interval = setInterval(refreshStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return { queueLength, queueItems, failedCount, lastError, lastSyncAt, isSyncing, sync, retry, clearFailed };
}
