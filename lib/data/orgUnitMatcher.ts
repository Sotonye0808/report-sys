/**
 * lib/data/orgUnitMatcher.ts
 *
 * Polymorphic scope-match used wherever the legacy code asked
 * "is X within scope Y?" against the now-unified OrgUnit substrate.
 *
 * Usage examples:
 *   - aggregation engine: which reports roll up under this unit (and all its
 *     descendants)?
 *   - report visibility: does this user (with `unitId = U`) have access to a
 *     report tagged `unitId = R`?
 *   - form-assignment matcher: do the rule's `unitIds[]` cover this user?
 *
 * Performance:
 *   - Reads (id, parentId) once per call, builds a child-map in memory, runs
 *     BFS. Trees are small (O(100) nodes) — no caching needed.
 *
 * Back-compat:
 *   - Every caller can pass legacy fields (campusId / orgGroupId / campusIds
 *     / orgGroupIds) and the matcher transparently merges them into the
 *     polymorphic check via `mergeLegacyScope`.
 */

import { prisma } from "@/lib/data/prisma";

interface UnitGraphRow {
    id: string;
    parentId: string | null;
}

let graphCache: { rows: UnitGraphRow[]; expiresAt: number } | null = null;
const GRAPH_TTL_MS = 30_000; // small TTL keeps the matcher snappy under hot loops

async function loadGraph(): Promise<UnitGraphRow[]> {
    const now = Date.now();
    if (graphCache && graphCache.expiresAt > now) return graphCache.rows;
    const rows = await prisma.orgUnit.findMany({
        select: { id: true, parentId: true },
    });
    graphCache = { rows, expiresAt: now + GRAPH_TTL_MS };
    return rows;
}

/** Force a graph reload (called from `/api/admin-config/reconcile` + write paths). */
export function invalidateOrgUnitGraphCache(): void {
    graphCache = null;
}

function buildChildMap(rows: UnitGraphRow[]): Map<string, string[]> {
    const childrenOf = new Map<string, string[]>();
    for (const u of rows) {
        if (!u.parentId) continue;
        if (!childrenOf.has(u.parentId)) childrenOf.set(u.parentId, []);
        childrenOf.get(u.parentId)!.push(u.id);
    }
    return childrenOf;
}

/**
 * Returns the set of unit ids that are within the given scope ids
 * (the scope ids themselves PLUS every descendant). Used by aggregation +
 * permission gates.
 */
export async function descendantSet(scopeUnitIds: string[]): Promise<Set<string>> {
    if (scopeUnitIds.length === 0) return new Set();
    const rows = await loadGraph();
    const childrenOf = buildChildMap(rows);
    const out = new Set<string>(scopeUnitIds);
    const queue = [...scopeUnitIds];
    while (queue.length > 0) {
        const id = queue.shift()!;
        const kids = childrenOf.get(id) ?? [];
        for (const k of kids) {
            if (out.has(k)) continue;
            out.add(k);
            queue.push(k);
        }
    }
    return out;
}

/**
 * `true` when `targetUnitId` is `===` to any scope id, or a descendant of one.
 * Empty `scopeUnitIds` returns false (caller decides whether unbounded scope
 * means allow-all or deny-all in their context).
 */
export async function unitInScope(
    targetUnitId: string | null | undefined,
    scopeUnitIds: string[],
): Promise<boolean> {
    if (!targetUnitId) return false;
    if (scopeUnitIds.length === 0) return false;
    if (scopeUnitIds.includes(targetUnitId)) return true;
    const set = await descendantSet(scopeUnitIds);
    return set.has(targetUnitId);
}

/**
 * Merge a (possibly legacy) scope description into a flat `unitIds[]`.
 * Used by callers that still carry `campusIds` / `orgGroupIds` / single-value
 * `campusId` / `orgGroupId` columns; deduplicates and filters falsy entries.
 */
export function mergeLegacyScope(parts: {
    unitIds?: string[] | null;
    campusIds?: string[] | null;
    orgGroupIds?: string[] | null;
    campusId?: string | null;
    orgGroupId?: string | null;
}): string[] {
    const set = new Set<string>();
    for (const id of parts.unitIds ?? []) if (id) set.add(id);
    for (const id of parts.campusIds ?? []) if (id) set.add(id);
    for (const id of parts.orgGroupIds ?? []) if (id) set.add(id);
    if (parts.campusId) set.add(parts.campusId);
    if (parts.orgGroupId) set.add(parts.orgGroupId);
    return Array.from(set);
}
