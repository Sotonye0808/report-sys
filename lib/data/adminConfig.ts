/**
 * lib/data/adminConfig.ts
 * DB-first admin-config loader with `config/*` fallback.
 *
 * Each namespace is read from the latest non-fallback `AdminConfigEntry` row.
 * If no row exists (or the substrate is disabled), the typed `config/*` value
 * is returned untouched as the immutable fallback.
 *
 * Writes are versioned (one row per save) with optimistic-lock checks against
 * the caller-supplied baseVersion. Cache invalidation happens out-of-band so
 * the write response stays off the cache critical path.
 */

import { prisma } from "@/lib/data/prisma";
import { cache } from "@/lib/data/redis";
import { ROLE_CONFIG } from "@/config/roles";
import { ORG_HIERARCHY_CONFIG } from "@/config/hierarchy";
import { CONTENT } from "@/config/content";

/* ── Types ──────────────────────────────────────────────────────────────── */

export type AdminConfigNamespaceName =
    | "roles"
    | "hierarchy"
    | "dashboardLayout"
    | "templatesMapping"
    | "imports"
    | "pwaInstall"
    | "bulkInvites"
    | "analytics";

export interface AdminConfigSnapshot<T = Record<string, unknown>> {
    namespace: AdminConfigNamespaceName;
    version: number;
    payload: T;
    source: "db" | "fallback";
    updatedAt?: string;
    actorId?: string | null;
}

export class AdminConfigConflictError extends Error {
    constructor(
        public namespace: AdminConfigNamespaceName,
        public expectedVersion: number,
        public actualVersion: number,
    ) {
        super(
            `Admin config conflict on namespace "${namespace}" (expected v${expectedVersion}, found v${actualVersion}).`,
        );
        this.name = "AdminConfigConflictError";
    }
}

/* ── Fallback registry ──────────────────────────────────────────────────── */

const FALLBACKS: Record<AdminConfigNamespaceName, () => Record<string, unknown>> = {
    roles: () => ({ roleConfig: ROLE_CONFIG }),
    hierarchy: () => ({ levels: ORG_HIERARCHY_CONFIG }),
    dashboardLayout: () => ({
        // Empty layout means dashboard renders its built-in role-band default.
        byRoleBand: {},
    }),
    templatesMapping: () => ({ overrides: [] }),
    imports: () => ({
        maxFileBytes: Number(process.env.IMPORT_MAX_FILE_BYTES ?? 10 * 1024 * 1024),
        allowedMimes: ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    }),
    pwaInstall: () => ({ ...(CONTENT.pwaInstall as Record<string, unknown>) }),
    bulkInvites: () => ({
        defaultExpiryHours: 168,
        defaultRole: undefined,
        emailGate: true,
    }),
    analytics: () => ({
        correlation: {
            maxMetrics: Number(process.env.ANALYTICS_CORRELATION_MAX_METRICS ?? 12),
            defaultEnabled: true,
        },
    }),
};

/* ── Cache key + TTL ────────────────────────────────────────────────────── */

const TTL_SECONDS = Number(process.env.ADMIN_CONFIG_CACHE_TTL_SECONDS ?? 300);
const NS_CACHE_KEY = (ns: AdminConfigNamespaceName) => `adminConfig:ns:${ns}`;

/* ── Substrate gate ─────────────────────────────────────────────────────── */

function substrateEnabled(): boolean {
    const raw = process.env.ADMIN_CONFIG_DB_ENABLED;
    if (raw == null) return true; // default ON; fallback path is still safe.
    return raw.toLowerCase() === "true" || raw === "1";
}

/* ── Load ───────────────────────────────────────────────────────────────── */

export async function loadAdminConfig<T = Record<string, unknown>>(
    namespace: AdminConfigNamespaceName,
): Promise<AdminConfigSnapshot<T>> {
    const fallback = (FALLBACKS[namespace]?.() ?? {}) as T;

    if (!substrateEnabled()) {
        return { namespace, version: 0, payload: fallback, source: "fallback" };
    }

    // Cache hit
    const cached = (await cache.get(NS_CACHE_KEY(namespace))) as AdminConfigSnapshot<T> | null;
    if (cached && cached.namespace === namespace) {
        return cached;
    }

    // DB read (latest non-fallback row by version)
    try {
        const row = await prisma.adminConfigEntry.findFirst({
            where: { namespace, isFallback: false },
            orderBy: [{ version: "desc" }, { createdAt: "desc" }],
            select: {
                version: true,
                payload: true,
                actorId: true,
                createdAt: true,
            },
        });

        if (!row) {
            const snap: AdminConfigSnapshot<T> = {
                namespace,
                version: 0,
                payload: fallback,
                source: "fallback",
            };
            await cache.set(NS_CACHE_KEY(namespace), JSON.stringify(snap), TTL_SECONDS);
            return snap;
        }

        const snap: AdminConfigSnapshot<T> = {
            namespace,
            version: row.version,
            payload: (row.payload as T) ?? fallback,
            source: "db",
            updatedAt: row.createdAt.toISOString(),
            actorId: row.actorId ?? null,
        };
        await cache.set(NS_CACHE_KEY(namespace), JSON.stringify(snap), TTL_SECONDS);
        return snap;
    } catch (err) {
        // Loader must never brick the app. Log and fall back.
        // eslint-disable-next-line no-console
        console.error("[adminConfig] DB read failed; using fallback for", namespace, err);
        return { namespace, version: 0, payload: fallback, source: "fallback" };
    }
}

/* ── Write (optimistic-lock) ───────────────────────────────────────────── */

export interface AdminConfigWriteInput {
    namespace: AdminConfigNamespaceName;
    payload: Record<string, unknown>;
    baseVersion: number;
    actorId: string;
    notes?: string;
}

export async function writeAdminConfig(
    input: AdminConfigWriteInput,
): Promise<AdminConfigSnapshot> {
    const current = await prisma.adminConfigEntry.findFirst({
        where: { namespace: input.namespace, isFallback: false },
        orderBy: [{ version: "desc" }, { createdAt: "desc" }],
        select: { version: true },
    });
    const currentVersion = current?.version ?? 0;
    if (currentVersion !== input.baseVersion) {
        throw new AdminConfigConflictError(
            input.namespace,
            input.baseVersion,
            currentVersion,
        );
    }

    const next = await prisma.adminConfigEntry.create({
        data: {
            namespace: input.namespace,
            version: currentVersion + 1,
            payload: input.payload as never,
            isFallback: false,
            actorId: input.actorId,
            notes: input.notes,
        },
        select: {
            version: true,
            payload: true,
            actorId: true,
            createdAt: true,
        },
    });

    cache.invalidatePatternAsync(NS_CACHE_KEY(input.namespace));

    return {
        namespace: input.namespace,
        version: next.version,
        payload: next.payload as Record<string, unknown>,
        source: "db",
        updatedAt: next.createdAt.toISOString(),
        actorId: next.actorId ?? null,
    };
}

/* ── Reset to fallback ──────────────────────────────────────────────────── */

export async function resetAdminConfig(
    namespace: AdminConfigNamespaceName,
    actorId: string,
): Promise<AdminConfigSnapshot> {
    const current = await prisma.adminConfigEntry.findFirst({
        where: { namespace, isFallback: false },
        orderBy: [{ version: "desc" }, { createdAt: "desc" }],
        select: { version: true },
    });
    const nextVersion = (current?.version ?? 0) + 1;

    await prisma.adminConfigEntry.create({
        data: {
            namespace,
            version: nextVersion,
            payload: {} as never,
            isFallback: true,
            actorId,
        },
    });

    cache.invalidatePatternAsync(NS_CACHE_KEY(namespace));

    const fallback = (FALLBACKS[namespace]?.() ?? {}) as Record<string, unknown>;
    return {
        namespace,
        version: 0,
        payload: fallback,
        source: "fallback",
        updatedAt: new Date().toISOString(),
        actorId,
    };
}

/* ── Diff helper ────────────────────────────────────────────────────────── */

export async function diffAgainstFallback(
    namespace: AdminConfigNamespaceName,
): Promise<{ changed: boolean; current: unknown; fallback: unknown }> {
    const snap = await loadAdminConfig(namespace);
    const fallback = FALLBACKS[namespace]?.() ?? {};
    return {
        changed: JSON.stringify(snap.payload) !== JSON.stringify(fallback),
        current: snap.payload,
        fallback,
    };
}
