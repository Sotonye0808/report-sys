/**
 * lib/auth/permissions.ts
 *
 * Server-side capability + label resolution that runs every check through the
 * admin-config substrate first, falling back to `config/roles.ts`. This is
 * what API route handlers should use when gating actions or rendering role
 * labels — never read ROLE_CONFIG directly outside the fallback path.
 *
 * SUPERADMIN is enforced as immutable: any override that tries to demote the
 * SUPERADMIN role's capabilities or label is silently rejected.
 */

import { loadAdminConfig } from "@/lib/data/adminConfig";
import { ROLE_CONFIG } from "@/config/roles";
import { ORG_HIERARCHY_CONFIG } from "@/config/hierarchy";
import { UserRole } from "@/types/global";

/* ── Role config (with admin overrides) ─────────────────────────────────── */

export interface ResolvedRoleConfig extends RoleConfig {
    /** True when this role's config came from a DB override (i.e. an admin edit). */
    isOverride: boolean;
}

export interface ResolvedHierarchyLevel {
    level: string;
    label: string;
    parentLevel?: string | null;
    childLevel?: string | null;
    leaderRole?: UserRole;
    adminRole?: UserRole;
    /** Position from top (0-based). */
    depth: number;
}

const SUPERADMIN_IMMUTABLE_KEYS: ReadonlyArray<keyof RoleConfig> = [
    "canManageAdminConfig",
    "canManageUsers",
    "canManageOrg",
    "canLockReports",
    "reportVisibilityScope",
    "dashboardMode",
];

export function freezeSuperadmin(rendered: RoleConfig, fallback: RoleConfig): RoleConfig {
    if (rendered.role !== UserRole.SUPERADMIN) return rendered;
    const merged = { ...rendered };
    for (const key of SUPERADMIN_IMMUTABLE_KEYS) {
        // @ts-expect-error narrow union assignment is safe per key set
        merged[key] = fallback[key];
    }
    // SUPERADMIN label is also frozen
    merged.label = fallback.label;
    return merged;
}

/**
 * Resolves the runtime role config map. The result is intended for read-only
 * use by route handlers and rendering helpers; it is NOT a writable interface.
 */
export async function resolveRoleConfigMap(): Promise<Record<UserRole, ResolvedRoleConfig>> {
    const snap = await loadAdminConfig<{ roleConfig?: Partial<Record<UserRole, Partial<RoleConfig>>> }>(
        "roles",
    );
    const overrides = (snap.payload?.roleConfig ?? {}) as Partial<Record<UserRole, Partial<RoleConfig>>>;
    const out = {} as Record<UserRole, ResolvedRoleConfig>;
    const isFallback = snap.source === "fallback";

    for (const role of Object.keys(ROLE_CONFIG) as UserRole[]) {
        const fallback = ROLE_CONFIG[role];
        const override = overrides[role];
        const merged: RoleConfig = override
            ? freezeSuperadmin({ ...fallback, ...override, role }, fallback)
            : fallback;
        out[role] = { ...merged, isOverride: !isFallback && Boolean(override) };
    }
    return out;
}

export async function resolveRoleConfig(role: UserRole): Promise<ResolvedRoleConfig> {
    const map = await resolveRoleConfigMap();
    return map[role];
}

export async function hasCapability(
    role: UserRole,
    capability: keyof RoleConfig,
): Promise<boolean> {
    const cfg = await resolveRoleConfig(role);
    return Boolean(cfg[capability]);
}

/**
 * Resolves capabilities for a user, checking the runtime Role table first
 * (when `auth.user.roleId` is set) and falling back to the legacy enum
 * overlay otherwise. Custom roles created via `RolesEditorV2` are honoured
 * here; built-in roles continue to flow through the existing overlay.
 *
 * Existing capability checks that only know about the enum can keep using
 * `hasCapability(role, …)` — this helper is the substrate-aware path for
 * code that wants the runtime Role table consulted.
 */
export async function hasCapabilityForUser(
    user: { role: UserRole; roleId?: string | null } | null | undefined,
    capability: keyof RoleConfig,
): Promise<boolean> {
    if (!user) return false;
    if (user.roleId) {
        try {
            const { resolveRoleByCode } = await import("@/lib/data/role");
            const { prisma } = await import("@/lib/data/prisma");
            const row = await prisma.role.findUnique({
                where: { id: user.roleId },
                select: { code: true, capabilities: true, archivedAt: true },
            });
            if (row && !row.archivedAt) {
                const caps = (row.capabilities as Record<string, boolean>) ?? {};
                if (capability in caps) return Boolean(caps[capability]);
                // Field not present on the runtime row — fall through to the
                // resolver so built-in defaults still apply for missing keys.
                const resolved = await resolveRoleByCode(row.code);
                if (resolved && capability in (resolved.capabilities ?? {})) {
                    return Boolean(resolved.capabilities[capability as string]);
                }
            }
        } catch {
            // Substrate hiccup — fall through to the legacy enum path.
        }
    }
    return hasCapability(user.role, capability);
}

/* ── Role cadence (with admin overrides) ──────────────────────────────── */

export interface ResolvedCadence {
    frequency: "WEEKLY" | "MONTHLY" | "YEARLY" | "TWICE_WEEKLY" | "ANY";
    expectedDays: number[];
    deadlineHours: number;
    autoFillTitleTemplate?: string;
}

const DEFAULT_CADENCE: ResolvedCadence = {
    frequency: "WEEKLY",
    expectedDays: [],
    deadlineHours: 48,
};

export async function resolveRoleCadence(role: UserRole): Promise<ResolvedCadence> {
    const snap = await loadAdminConfig<{ byRole?: Record<string, Partial<ResolvedCadence>> }>(
        "roleCadence",
    );
    const override = snap.payload?.byRole?.[role];
    const fallback = ROLE_CONFIG[role]?.cadence as Partial<ResolvedCadence> | undefined;
    return {
        ...DEFAULT_CADENCE,
        ...(fallback ?? {}),
        ...(override ?? {}),
    };
}

/* ── Hierarchy levels (with admin overrides) ───────────────────────────── */

export async function resolveHierarchyLevels(): Promise<ResolvedHierarchyLevel[]> {
    const snap = await loadAdminConfig<{ levels?: ResolvedHierarchyLevel[] }>("hierarchy");
    const fromDb = snap.payload?.levels;
    if (Array.isArray(fromDb) && fromDb.length > 0) {
        return fromDb.map((level, idx) => ({
            level: String(level.level),
            label: String(level.label ?? level.level),
            parentLevel: level.parentLevel ?? null,
            childLevel: level.childLevel ?? null,
            leaderRole: level.leaderRole,
            adminRole: level.adminRole,
            depth: idx,
        }));
    }
    return ORG_HIERARCHY_CONFIG.map((level, idx) => ({
        level: level.level,
        label: level.label,
        parentLevel: level.parentLevel ?? null,
        childLevel: level.childLevel ?? null,
        leaderRole: level.leaderRole,
        adminRole: level.adminRole,
        depth: idx,
    }));
}

/* ── Impersonation read-only gate ───────────────────────────────────────── */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Routes that are safe to invoke under READ_ONLY impersonation: they don't
 * mutate domain state in a way that affects other users (e.g. marking a
 * notification as read keeps preview fidelity high without leaking changes).
 *
 * Match is by exact pathname or by predicate.
 */
const READ_ONLY_ALLOWLIST: Array<RegExp> = [
    /^\/api\/notifications\/[^/]+\/read$/,
    /^\/api\/notifications\/read-all$/,
    /^\/api\/impersonation\/(stop|me)$/,
    /^\/api\/auth\/(me|refresh|logout)$/,
];

export interface ReadOnlyAssertion {
    ok: boolean;
    code?: "impersonation_readonly";
    message?: string;
}

/**
 * Returns `{ ok: false }` when the calling user is in a READ_ONLY
 * impersonation session and the request is mutating + not on the allowlist.
 *
 * Handlers should call this immediately after `verifyAuth` and short-circuit
 * with HTTP 403 + body `{ success: false, error, code: "impersonation_readonly" }`
 * when `ok === false`. The rejection is also recorded as a
 * MUTATION_BLOCKED impersonation event by the helper.
 */
export async function assertNotReadOnly(
    auth: { user: AuthUser },
    req: { method?: string; nextUrl?: URL; url?: string },
): Promise<ReadOnlyAssertion> {
    const session = auth.user.impersonation;
    if (!session || session.mode !== "READ_ONLY") return { ok: true };
    const method = (req.method ?? "GET").toUpperCase();
    if (!MUTATING_METHODS.has(method)) return { ok: true };

    const pathname =
        req.nextUrl?.pathname ?? (req.url ? new URL(req.url, "http://localhost").pathname : "/");
    if (READ_ONLY_ALLOWLIST.some((re) => re.test(pathname))) return { ok: true };

    // Best-effort audit emission — never throws.
    try {
        const { recordEvent } = await import("@/lib/auth/impersonation");
        await recordEvent(session.sessionId, "MUTATION_BLOCKED", {
            path: pathname,
            method,
            status: 403,
        });
    } catch {
        // ignore
    }

    return {
        ok: false,
        code: "impersonation_readonly",
        message:
            "This change can't be applied — you're previewing in read-only mode. Switch to mutate mode or exit preview to make changes.",
    };
}

/* ── Self-demote guard ──────────────────────────────────────────────────── */

/**
 * Verify that an admin-config role write does not strip the SUPERADMIN
 * capability set or label. Returns a sanitised payload.
 */
export function sanitiseRoleConfigPayload(
    payload: Partial<Record<UserRole, Partial<RoleConfig>>>,
): Partial<Record<UserRole, Partial<RoleConfig>>> {
    const cleaned = { ...payload };
    if (cleaned[UserRole.SUPERADMIN]) {
        const fallback = ROLE_CONFIG[UserRole.SUPERADMIN];
        const supplied = cleaned[UserRole.SUPERADMIN] as Partial<RoleConfig>;
        // Strip immutable keys so superadmin cannot lose them via override.
        const safeSuperadmin: Partial<RoleConfig> = { ...supplied };
        for (const key of SUPERADMIN_IMMUTABLE_KEYS) {
            // @ts-expect-error key indexing
            safeSuperadmin[key] = fallback[key];
        }
        safeSuperadmin.label = fallback.label;
        cleaned[UserRole.SUPERADMIN] = safeSuperadmin;
    }
    return cleaned;
}
