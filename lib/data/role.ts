/**
 * lib/data/role.ts
 *
 * CRUD service for the runtime `Role` substrate. Every UserRole enum value
 * is seeded as a Role row with `isSystem=true` (see `reconcileSubstrate`);
 * admins can create custom roles at runtime, edit non-SUPERADMIN system
 * rows, and archive (soft-delete) anything that isn't a system role.
 *
 * Capability subset rule:
 *   - SUPERADMIN-only capabilities (`canManageAdminConfig`, `canManageUsers`,
 *     `canManageOrg`, `canLockReports`) cannot be granted to a non-SUPERADMIN
 *     role through this service. Attempts are silently dropped from the
 *     capabilities payload before persistence.
 *
 * Single source of truth:
 *   - `lib/auth/permissions.ts → resolveRoleConfig` reads from this table
 *     first, falling back to `ROLE_CONFIG` if the row is absent (substrate
 *     disabled / migration not yet applied).
 */

import { prisma } from "@/lib/data/prisma";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";

export class RoleValidationError extends Error {
    constructor(public reason: string) {
        super(reason);
        this.name = "RoleValidationError";
    }
}

const SUPERADMIN_ONLY_CAPABILITIES = new Set<string>([
    "canManageAdminConfig",
    "canManageUsers",
    "canManageOrg",
    "canLockReports",
]);

const ALLOWED_DASHBOARD_MODES = new Set([
    "system",
    "scope-overview",
    "report-review",
    "report-reviewed",
    "report-fill",
    "analytics",
    "quick-form",
]);

const ALLOWED_VISIBILITY_SCOPES = new Set(["all", "group", "campus", "own"]);

export interface RoleInput {
    code: string;
    label: string;
    description?: string | null;
    hierarchyOrder?: number;
    dashboardMode?: string;
    reportVisibilityScope?: string;
    capabilities?: Record<string, boolean>;
    cadence?: Record<string, unknown> | null;
    /** Optional org-unit pin — RoleScope rows are managed separately. */
    scopeUnitIds?: string[];
}

export interface RoleRow {
    id: string;
    code: string;
    label: string;
    description: string | null;
    hierarchyOrder: number;
    dashboardMode: string;
    reportVisibilityScope: string;
    capabilities: Record<string, boolean>;
    cadence: Record<string, unknown> | null;
    isSystem: boolean;
    archivedAt: Date | null;
    scopeUnitIds: string[];
}

function normaliseCode(code: string): string {
    return code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

/**
 * Drop any capabilities that aren't grantable to non-SUPERADMIN roles.
 * SUPERADMIN's own row keeps everything; everyone else is filtered.
 */
function sanitiseCapabilities(
    payload: Record<string, boolean> | undefined,
    isSuperadmin: boolean,
): Record<string, boolean> {
    if (!payload) return {};
    if (isSuperadmin) return { ...payload };
    const out: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(payload)) {
        if (SUPERADMIN_ONLY_CAPABILITIES.has(key)) continue;
        out[key] = Boolean(value);
    }
    return out;
}

function shapeRow(
    row: {
        id: string;
        code: string;
        label: string;
        description: string | null;
        hierarchyOrder: number;
        dashboardMode: string;
        reportVisibilityScope: string;
        capabilities: unknown;
        cadence: unknown;
        isSystem: boolean;
        archivedAt: Date | null;
    },
    scopeUnitIds: string[] = [],
): RoleRow {
    return {
        id: row.id,
        code: row.code,
        label: row.label,
        description: row.description,
        hierarchyOrder: row.hierarchyOrder,
        dashboardMode: row.dashboardMode,
        reportVisibilityScope: row.reportVisibilityScope,
        capabilities: (row.capabilities as Record<string, boolean>) ?? {},
        cadence: (row.cadence as Record<string, unknown>) ?? null,
        isSystem: row.isSystem,
        archivedAt: row.archivedAt,
        scopeUnitIds,
    };
}

export async function listRoles(opts: { includeArchived?: boolean } = {}): Promise<RoleRow[]> {
    const where: Record<string, unknown> = {};
    if (!opts.includeArchived) where.archivedAt = null;
    const rows = await prisma.role.findMany({
        where: where as never,
        include: { scopes: { select: { unitId: true } } },
        orderBy: [{ hierarchyOrder: "asc" }, { code: "asc" }],
    });
    return rows.map((r) => shapeRow(r, r.scopes.map((s) => s.unitId)));
}

export async function getRole(id: string): Promise<RoleRow | null> {
    const row = await prisma.role.findUnique({
        where: { id },
        include: { scopes: { select: { unitId: true } } },
    });
    if (!row) return null;
    return shapeRow(row, row.scopes.map((s) => s.unitId));
}

export async function getRoleByCode(code: string): Promise<RoleRow | null> {
    const row = await prisma.role.findUnique({
        where: { code: normaliseCode(code) },
        include: { scopes: { select: { unitId: true } } },
    });
    if (!row) return null;
    return shapeRow(row, row.scopes.map((s) => s.unitId));
}

async function validate(input: RoleInput, opts: { existingId?: string } = {}): Promise<void> {
    if (!input.code || normaliseCode(input.code).length === 0) {
        throw new RoleValidationError("Role code is required");
    }
    if (!input.label || input.label.trim().length === 0) {
        throw new RoleValidationError("Role label is required");
    }
    if (input.dashboardMode && !ALLOWED_DASHBOARD_MODES.has(input.dashboardMode)) {
        throw new RoleValidationError(`Unknown dashboard mode: ${input.dashboardMode}`);
    }
    if (input.reportVisibilityScope && !ALLOWED_VISIBILITY_SCOPES.has(input.reportVisibilityScope)) {
        throw new RoleValidationError(`Unknown visibility scope: ${input.reportVisibilityScope}`);
    }
    // Code uniqueness — but allow updating the same row.
    const existing = await prisma.role.findUnique({ where: { code: normaliseCode(input.code) } });
    if (existing && existing.id !== opts.existingId) {
        throw new RoleValidationError(`Role code "${normaliseCode(input.code)}" is already in use`);
    }
    // Pinned units must exist.
    if (input.scopeUnitIds && input.scopeUnitIds.length > 0) {
        const found = await prisma.orgUnit.findMany({
            where: { id: { in: input.scopeUnitIds } },
            select: { id: true },
        });
        if (found.length !== input.scopeUnitIds.length) {
            throw new RoleValidationError("One or more pinned org units do not exist");
        }
    }
}

export async function createRole(input: RoleInput): Promise<RoleRow> {
    await validate(input);
    const code = normaliseCode(input.code);
    const isSuperadmin = code === UserRole.SUPERADMIN;
    if (isSuperadmin) {
        // Refuse to create a duplicate SUPERADMIN — there's exactly one system row.
        throw new RoleValidationError("SUPERADMIN role cannot be created (already a system row)");
    }
    const created = await prisma.role.create({
        data: {
            code,
            label: input.label.trim(),
            description: input.description?.trim() || null,
            hierarchyOrder: input.hierarchyOrder ?? 50,
            dashboardMode: input.dashboardMode ?? "scope-overview",
            reportVisibilityScope: input.reportVisibilityScope ?? "own",
            capabilities: sanitiseCapabilities(input.capabilities, false) as never,
            cadence: (input.cadence ?? null) as never,
            isSystem: false,
        },
    });
    if (input.scopeUnitIds && input.scopeUnitIds.length > 0) {
        await prisma.roleScope.createMany({
            data: input.scopeUnitIds.map((unitId) => ({ roleId: created.id, unitId })),
        });
    }
    return getRole(created.id) as Promise<RoleRow>;
}

export async function updateRole(id: string, patch: Partial<RoleInput>): Promise<RoleRow> {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) throw new RoleValidationError("Role not found");

    // SUPERADMIN is fully immutable.
    if (existing.code === UserRole.SUPERADMIN) {
        throw new RoleValidationError("SUPERADMIN role is immutable");
    }

    const merged: RoleInput = {
        code: patch.code ?? existing.code,
        label: patch.label ?? existing.label,
        description: patch.description ?? existing.description,
        hierarchyOrder: patch.hierarchyOrder ?? existing.hierarchyOrder,
        dashboardMode: patch.dashboardMode ?? existing.dashboardMode,
        reportVisibilityScope: patch.reportVisibilityScope ?? existing.reportVisibilityScope,
        capabilities: patch.capabilities ?? (existing.capabilities as Record<string, boolean>),
        cadence: patch.cadence ?? (existing.cadence as Record<string, unknown> | null),
        scopeUnitIds: patch.scopeUnitIds,
    };
    await validate(merged, { existingId: id });

    // Code is immutable for system rows so they always match the UserRole enum.
    if (existing.isSystem && patch.code !== undefined && normaliseCode(patch.code) !== existing.code) {
        throw new RoleValidationError("System role codes are immutable");
    }

    await prisma.role.update({
        where: { id },
        data: {
            ...(patch.code !== undefined && !existing.isSystem && { code: normaliseCode(patch.code) }),
            ...(patch.label !== undefined && { label: patch.label.trim() }),
            ...(patch.description !== undefined && { description: patch.description?.trim() || null }),
            ...(patch.hierarchyOrder !== undefined && { hierarchyOrder: patch.hierarchyOrder }),
            ...(patch.dashboardMode !== undefined && { dashboardMode: patch.dashboardMode }),
            ...(patch.reportVisibilityScope !== undefined && {
                reportVisibilityScope: patch.reportVisibilityScope,
            }),
            ...(patch.capabilities !== undefined && {
                capabilities: sanitiseCapabilities(patch.capabilities, false) as never,
            }),
            ...(patch.cadence !== undefined && { cadence: (patch.cadence ?? null) as never }),
        },
    });

    if (patch.scopeUnitIds !== undefined) {
        await prisma.roleScope.deleteMany({ where: { roleId: id } });
        if (patch.scopeUnitIds.length > 0) {
            await prisma.roleScope.createMany({
                data: patch.scopeUnitIds.map((unitId) => ({ roleId: id, unitId })),
            });
        }
    }
    return getRole(id) as Promise<RoleRow>;
}

export async function archiveRole(id: string): Promise<RoleRow> {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) throw new RoleValidationError("Role not found");
    if (existing.isSystem) {
        throw new RoleValidationError("System roles cannot be archived");
    }
    await prisma.role.update({ where: { id }, data: { archivedAt: new Date() } });
    return getRole(id) as Promise<RoleRow>;
}

export async function restoreRole(id: string): Promise<RoleRow> {
    await prisma.role.update({ where: { id }, data: { archivedAt: null } });
    return getRole(id) as Promise<RoleRow>;
}

/**
 * Resolves a role view — DB row first, fallback to `ROLE_CONFIG` for the
 * matching enum value if the substrate is disabled. Used by permissions.
 */
export async function resolveRoleByCode(code: string): Promise<RoleRow | null> {
    const fromDb = await getRoleByCode(code);
    if (fromDb) return fromDb;
    const enumKey = code as UserRole;
    const fallback = ROLE_CONFIG[enumKey];
    if (!fallback) return null;
    const capabilityKeys: Array<keyof typeof fallback> = [
        "canCreateReports",
        "canFillReports",
        "canSubmitReports",
        "canRequestEdits",
        "canApproveReports",
        "canMarkReviewed",
        "canLockReports",
        "canManageTemplates",
        "canDataEntry",
        "canManageUsers",
        "canManageOrg",
        "canSetGoals",
        "canApproveGoalUnlock",
        "canQuickFormFill",
        "canManageAdminConfig",
        "canImportSpreadsheets",
        "canBulkInvite",
        "canViewScopeOverview",
    ];
    const capabilities: Record<string, boolean> = {};
    for (const key of capabilityKeys) {
        capabilities[key as string] = Boolean(fallback[key]);
    }
    return {
        id: `fallback:${enumKey}`,
        code: enumKey,
        label: fallback.label as string,
        description: null,
        hierarchyOrder: fallback.hierarchyOrder,
        dashboardMode: fallback.dashboardMode,
        reportVisibilityScope: fallback.reportVisibilityScope,
        capabilities,
        cadence: (fallback.cadence as unknown as Record<string, unknown>) ?? null,
        isSystem: true,
        archivedAt: null,
        scopeUnitIds: [],
    };
}
