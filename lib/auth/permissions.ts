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
