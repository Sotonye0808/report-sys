"use client";

/**
 * lib/hooks/useEntityNames.ts
 *
 * Resolves a set of campus / group / unit / role / user ids to display names
 * via a single batched POST to `/api/labels/resolve`. The hook keeps an
 * in-memory cache so repeat lookups on the same id never hit the network.
 *
 * Usage:
 *
 *   const { names, loading } = useEntityNames({ campusIds: [user.campusId] });
 *   const campusName = names.campuses[user.campusId];
 *   // → renders the actual campus name; falls back to "Unknown campus"
 *   //   when the row is gone, never the raw UUID.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { API_ROUTES } from "@/config/routes";

export interface EntityNameMap {
    campuses: Record<string, string | null>;
    groups: Record<string, string | null>;
    units: Record<string, string | null>;
    roles: Record<string, string | null>;
    users: Record<string, string | null>;
}

export interface UseEntityNamesQuery {
    campusIds?: Array<string | null | undefined>;
    groupIds?: Array<string | null | undefined>;
    unitIds?: Array<string | null | undefined>;
    roleIds?: Array<string | null | undefined>;
    userIds?: Array<string | null | undefined>;
}

const cache: EntityNameMap = {
    campuses: {},
    groups: {},
    units: {},
    roles: {},
    users: {},
};

function clean(input: UseEntityNamesQuery[keyof UseEntityNamesQuery]): string[] {
    if (!input) return [];
    const set = new Set<string>();
    for (const v of input) {
        if (typeof v !== "string") continue;
        const trimmed = v.trim();
        if (!trimmed) continue;
        set.add(trimmed);
    }
    return Array.from(set);
}

function missing<K extends keyof EntityNameMap>(
    bucket: K,
    ids: string[],
): string[] {
    return ids.filter((id) => !(id in cache[bucket]));
}

interface State {
    names: EntityNameMap;
    loading: boolean;
}

export function useEntityNames(query: UseEntityNamesQuery): State {
    const cIds = useMemo(() => clean(query.campusIds), [JSON.stringify(query.campusIds ?? [])]);
    const gIds = useMemo(() => clean(query.groupIds), [JSON.stringify(query.groupIds ?? [])]);
    const uIds = useMemo(() => clean(query.unitIds), [JSON.stringify(query.unitIds ?? [])]);
    const rIds = useMemo(() => clean(query.roleIds), [JSON.stringify(query.roleIds ?? [])]);
    const userIds = useMemo(() => clean(query.userIds), [JSON.stringify(query.userIds ?? [])]);

    const [names, setNames] = useState<EntityNameMap>(() => ({ ...cache }));
    const [loading, setLoading] = useState(false);
    const inFlightRef = useRef(0);

    useEffect(() => {
        const need = {
            campusIds: missing("campuses", cIds),
            groupIds: missing("groups", gIds),
            unitIds: missing("units", uIds),
            roleIds: missing("roles", rIds),
            userIds: missing("users", userIds),
        };
        const total =
            need.campusIds.length +
            need.groupIds.length +
            need.unitIds.length +
            need.roleIds.length +
            need.userIds.length;
        if (total === 0) {
            setNames({ ...cache });
            return;
        }
        let cancelled = false;
        inFlightRef.current += 1;
        setLoading(true);
        void (async () => {
            try {
                const res = await fetch(API_ROUTES.labels.resolve, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(need),
                    credentials: "include",
                });
                const json = (await res.json()) as { success: boolean; data?: EntityNameMap };
                if (!cancelled && res.ok && json.success && json.data) {
                    Object.assign(cache.campuses, json.data.campuses);
                    Object.assign(cache.groups, json.data.groups);
                    Object.assign(cache.units, json.data.units);
                    Object.assign(cache.roles, json.data.roles);
                    Object.assign(cache.users, json.data.users);
                    setNames({ ...cache });
                }
            } catch {
                // Resolver failure is non-blocking — UI shows "Unknown <kind>"
                // rather than a stale UUID.
            } finally {
                inFlightRef.current -= 1;
                if (!cancelled && inFlightRef.current === 0) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cIds.join(","), gIds.join(","), uIds.join(","), rIds.join(","), userIds.join(",")]);

    return { names, loading };
}

/**
 * Convenience helper for the common single-id case. Returns the resolved
 * name, or — when the lookup hasn't completed yet or the row is gone —
 * the supplied `fallback` (defaults to a generic "Unknown" string so a
 * UUID never leaks into the UI).
 */
export function pickName(
    map: Record<string, string | null>,
    id: string | null | undefined,
    fallback = "Unknown",
): string {
    if (!id) return fallback;
    const value = map[id];
    if (value == null) return fallback;
    return value;
}
