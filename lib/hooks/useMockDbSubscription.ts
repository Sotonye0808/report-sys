"use client";

import { useEffect, useState } from "react";
import { mockDb } from "@/lib/data/mockDb";

/**
 * useMockDbSubscription
 * Subscribes to mockDb EventEmitter events for a given table and returns live data.
 * Re-runs the query whenever mockDb emits "{table}:changed".
 *
 * @param tableName  The mockDb table name (e.g. "reports")
 * @param query      Async function returning the current data snapshot
 * @param deps       Optional extra dependencies to re-run the query
 *
 * Usage:
 *   const reports = useMockDbSubscription<Report[]>(
 *     "reports",
 *     () => mockDb.reports.findMany({ where: { campusId: user.campusId } }),
 *   );
 */
export function useMockDbSubscription<T>(
    tableName: string,
    query: () => Promise<T>,
    deps: unknown[] = [],
): T | undefined {
    const [data, setData] = useState<T | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            const result = await query();
            if (!cancelled) setData(result);
        };

        run();

        const handler = () => {
            run();
        };

        mockDb.on(`${tableName}:changed`, handler);

        return () => {
            cancelled = true;
            mockDb.off(`${tableName}:changed`, handler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableName, ...deps]);

    return data;
}
