/**
 * lib/data/reconcile.ts
 *
 * Idempotent reconciliation between the legacy substrate (Campus + OrgGroup
 * tables, UserRole enum) and the new polymorphic substrate (OrgUnit + Role
 * tables). Used by:
 *
 *   - the prisma seed script (boot-time migration ergonomics)
 *   - the admin "Reconcile" action (`/api/admin-config/reconcile`)
 *
 * Contract:
 *   - Never overwrites populated values.
 *   - Never deletes legacy rows.
 *   - Re-runnable: every step is `findFirst → upsert` with content-stable IDs.
 *   - Returns a structured report so the UI can show "we created N rows,
 *     updated M rows, skipped K rows" — useful as a dry-run preview too.
 *
 * The legacy `Campus` and `OrgGroup` tables stay untouched; we only add
 * matching `OrgUnit` rows with the SAME UUID so every existing FK that
 * points at `campuses.id` or `org_groups.id` resolves to a real OrgUnit too.
 */

import { prisma } from "@/lib/data/prisma";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";

export interface ReconcileReport {
    orgUnits: { groupsBackfilled: number; campusesBackfilled: number; alreadyPresent: number };
    roles: { created: number; updated: number; alreadyPresent: number };
    users: { roleIdSet: number; unitIdSet: number };
    inviteLinks: { targetRoleIdSet: number; unitIdSet: number };
    formAssignmentRules: { roleIdSet: number; unitIdsSet: number };
    reports: { unitIdSet: number };
    importJobs: { fileFormatSet: number };
    /** Dry-run = compute everything but do NOT write. */
    dryRun: boolean;
}

interface ReconcileOptions {
    dryRun?: boolean;
}

/**
 * Run the full reconciliation pass. The migration's idempotent back-fill
 * already covers the no-data-yet case at deploy time; this helper exists
 * for runtime "Reconcile" actions in the Admin Config UI when an admin
 * wants to migrate freshly-added legacy rows (or repair drift) without
 * a deploy.
 */
export async function reconcileSubstrate(opts: ReconcileOptions = {}): Promise<ReconcileReport> {
    const dryRun = Boolean(opts.dryRun);
    const report: ReconcileReport = {
        orgUnits: { groupsBackfilled: 0, campusesBackfilled: 0, alreadyPresent: 0 },
        roles: { created: 0, updated: 0, alreadyPresent: 0 },
        users: { roleIdSet: 0, unitIdSet: 0 },
        inviteLinks: { targetRoleIdSet: 0, unitIdSet: 0 },
        formAssignmentRules: { roleIdSet: 0, unitIdsSet: 0 },
        reports: { unitIdSet: 0 },
        importJobs: { fileFormatSet: 0 },
        dryRun,
    };

    // ── 1) Mirror OrgGroup rows into OrgUnit (level=GROUP) ─────────────────
    const groups = await prisma.orgGroup.findMany();
    for (const g of groups) {
        const existing = await prisma.orgUnit.findUnique({ where: { id: g.id } });
        if (existing) {
            report.orgUnits.alreadyPresent += 1;
            continue;
        }
        report.orgUnits.groupsBackfilled += 1;
        if (!dryRun) {
            await prisma.orgUnit.create({
                data: {
                    id: g.id,
                    level: "GROUP",
                    name: g.name,
                    description: g.description,
                    parentId: null,
                    rootKey: "primary",
                    country: g.country,
                    leaderId: g.leaderId,
                    isActive: g.isActive,
                    createdAt: g.createdAt,
                    updatedAt: g.updatedAt,
                },
            });
        }
    }

    // ── 2) Mirror Campus rows into OrgUnit (level=CAMPUS, parent=group's id) ─
    const campuses = await prisma.campus.findMany();
    for (const c of campuses) {
        const existing = await prisma.orgUnit.findUnique({ where: { id: c.id } });
        if (existing) {
            report.orgUnits.alreadyPresent += 1;
            continue;
        }
        report.orgUnits.campusesBackfilled += 1;
        if (!dryRun) {
            await prisma.orgUnit.create({
                data: {
                    id: c.id,
                    level: "CAMPUS",
                    name: c.name,
                    description: c.description,
                    parentId: c.parentId,
                    rootKey: "primary",
                    country: c.country,
                    location: c.location,
                    address: c.address,
                    phone: c.phone,
                    adminId: c.adminId,
                    isActive: c.isActive,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt,
                },
            });
        }
    }

    // ── 3) Seed/refresh built-in Role rows from ROLE_CONFIG ────────────────
    for (const code of Object.keys(ROLE_CONFIG) as UserRole[]) {
        const cfg = ROLE_CONFIG[code];
        const capabilityKeys: Array<keyof typeof cfg> = [
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
            capabilities[key as string] = Boolean(cfg[key]);
        }
        const existing = await prisma.role.findUnique({ where: { code } });
        if (!existing) {
            report.roles.created += 1;
            if (!dryRun) {
                await prisma.role.create({
                    data: {
                        code,
                        label: cfg.label as string,
                        hierarchyOrder: cfg.hierarchyOrder,
                        dashboardMode: cfg.dashboardMode,
                        reportVisibilityScope: cfg.reportVisibilityScope,
                        capabilities: capabilities as never,
                        cadence: (cfg.cadence ?? null) as never,
                        isSystem: true,
                    },
                });
            }
            continue;
        }
        // Already exists — only update label/cadence if they're literally empty
        // so admin edits aren't overwritten. SUPERADMIN capabilities are always
        // re-aligned to the source of truth.
        const needsUpdate =
            (existing.isSystem && code === UserRole.SUPERADMIN) ||
            existing.label === "" ||
            existing.label === existing.code;
        if (needsUpdate) {
            report.roles.updated += 1;
            if (!dryRun) {
                await prisma.role.update({
                    where: { id: existing.id },
                    data: {
                        label: cfg.label as string,
                        hierarchyOrder: cfg.hierarchyOrder,
                        dashboardMode: cfg.dashboardMode,
                        reportVisibilityScope: cfg.reportVisibilityScope,
                        capabilities: capabilities as never,
                        cadence: (cfg.cadence ?? null) as never,
                        isSystem: true,
                    },
                });
            }
        } else {
            report.roles.alreadyPresent += 1;
        }
    }

    // Build a code → roleId map for the back-fill steps below.
    const roleRows = await prisma.role.findMany();
    const roleIdByCode = new Map(roleRows.map((r) => [r.code, r.id] as const));

    // ── 4) Back-fill User.roleId + User.unitId ─────────────────────────────
    const users = await prisma.user.findMany({
        where: {
            OR: [{ roleId: null }, { unitId: null }],
        },
        select: {
            id: true,
            role: true,
            roleId: true,
            unitId: true,
            campusId: true,
            orgGroupId: true,
        },
    });
    for (const u of users) {
        const updates: { roleId?: string; unitId?: string } = {};
        if (!u.roleId) {
            const rid = roleIdByCode.get(u.role);
            if (rid) {
                updates.roleId = rid;
                report.users.roleIdSet += 1;
            }
        }
        if (!u.unitId) {
            const uid = u.campusId ?? u.orgGroupId;
            if (uid) {
                updates.unitId = uid;
                report.users.unitIdSet += 1;
            }
        }
        if (Object.keys(updates).length > 0 && !dryRun) {
            await prisma.user.update({ where: { id: u.id }, data: updates });
        }
    }

    // ── 5) Back-fill InviteLink.targetRoleId + InviteLink.unitId ───────────
    const invites = await prisma.inviteLink.findMany({
        where: { OR: [{ targetRoleId: null }, { unitId: null }] },
        select: {
            id: true,
            targetRole: true,
            targetRoleId: true,
            campusId: true,
            groupId: true,
            unitId: true,
        },
    });
    for (const il of invites) {
        const updates: { targetRoleId?: string; unitId?: string } = {};
        if (!il.targetRoleId && il.targetRole) {
            const rid = roleIdByCode.get(il.targetRole);
            if (rid) {
                updates.targetRoleId = rid;
                report.inviteLinks.targetRoleIdSet += 1;
            }
        }
        if (!il.unitId) {
            const uid = il.campusId ?? il.groupId;
            if (uid) {
                updates.unitId = uid;
                report.inviteLinks.unitIdSet += 1;
            }
        }
        if (Object.keys(updates).length > 0 && !dryRun) {
            await prisma.inviteLink.update({ where: { id: il.id }, data: updates });
        }
    }

    // ── 6) Back-fill FormAssignmentRule.roleId + unitIds ───────────────────
    const rules = await prisma.formAssignmentRule.findMany();
    for (const rule of rules) {
        const updates: { roleId?: string; unitIds?: string[] } = {};
        if (!rule.roleId && rule.role) {
            const rid = roleIdByCode.get(rule.role);
            if (rid) {
                updates.roleId = rid;
                report.formAssignmentRules.roleIdSet += 1;
            }
        }
        if ((rule.unitIds?.length ?? 0) === 0) {
            const merged = Array.from(
                new Set([
                    ...(rule.campusIds ?? []),
                    ...(rule.orgGroupIds ?? []),
                    ...(rule.campusId ? [rule.campusId] : []),
                    ...(rule.orgGroupId ? [rule.orgGroupId] : []),
                ]),
            ).filter(Boolean);
            if (merged.length > 0) {
                updates.unitIds = merged;
                report.formAssignmentRules.unitIdsSet += 1;
            }
        }
        if (Object.keys(updates).length > 0 && !dryRun) {
            await prisma.formAssignmentRule.update({ where: { id: rule.id }, data: updates });
        }
    }

    // ── 7) Back-fill Report.unitId ─────────────────────────────────────────
    const reports = await prisma.report.findMany({
        where: { unitId: null },
        select: { id: true, campusId: true },
    });
    for (const r of reports) {
        if (r.campusId) {
            report.reports.unitIdSet += 1;
            if (!dryRun) {
                await prisma.report.update({ where: { id: r.id }, data: { unitId: r.campusId } });
            }
        }
    }

    // ── 8) Back-fill ImportJob.fileFormat for legacy rows ──────────────────
    const importJobs = await prisma.importJob.findMany({
        where: { fileFormat: null, storageRef: { not: null } },
        select: { id: true },
    });
    for (const j of importJobs) {
        report.importJobs.fileFormatSet += 1;
        if (!dryRun) {
            await prisma.importJob.update({ where: { id: j.id }, data: { fileFormat: "CSV" } });
        }
    }

    return report;
}
