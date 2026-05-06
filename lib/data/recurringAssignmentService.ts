/**
 * lib/data/recurringAssignmentService.ts
 *
 * Expands FormAssignmentRule rows for a calling user into concrete
 * FormAssignment rows for the current period, ensuring the underlying
 * report shell exists. Idempotent: a rule + period + user tuple resolves
 * to one assignment; subsequent calls return the same row.
 *
 * Match contract (see `formAssignmentRule.ruleMatchesUser`):
 *   - direct: rule.assigneeId === user.id, OR
 *   - role + scope: rule.role === user.role AND (
 *        empty scope arrays + null legacy fields ⇒ all campuses/groups,
 *        OR user.campusId ∈ rule.campusIds (or legacy rule.campusId match),
 *        OR user.orgGroupId ∈ rule.orgGroupIds (or legacy rule.orgGroupId match)
 *     ).
 */

import { prisma } from "@/lib/data/prisma";
import { ensureReportShell } from "@/lib/data/reportShellService";
import { ruleMatchesUser } from "@/lib/data/formAssignmentRule";
import { getCurrentPeriod, type CadenceFrequency } from "@/lib/utils/cadence";
import { resolveRoleCadence } from "@/lib/auth/permissions";
import { type UserRole } from "@/types/global";

export interface MaterialiseInput {
    userId: string;
    role: UserRole;
    campusId?: string | null;
    orgGroupId?: string | null;
    asOf?: Date;
}

export interface MaterialisedAssignment {
    id: string;
    reportId: string;
    metricIds: string[];
    periodKey: string;
    ruleId: string;
    completedAt: string | null;
    cancelledAt: string | null;
    dueAt: string | null;
}

export async function materialiseAssignmentsForUser(
    input: MaterialiseInput,
): Promise<MaterialisedAssignment[]> {
    const asOf = input.asOf ?? new Date();
    const cadence = await resolveRoleCadence(input.role);

    // Pull every active rule that *could* match this user (DB-side filter is
    // intentionally broad — the precise scope check happens in `ruleMatchesUser`
    // so legacy single-value scope, new array scope, and "empty = all" all work).
    const candidateRules = await prisma.formAssignmentRule.findMany({
        where: {
            isActive: true,
            OR: [
                { assigneeId: input.userId },
                { role: input.role },
            ],
        },
    });

    const matching = candidateRules.filter((rule) =>
        ruleMatchesUser(
            {
                role: (rule.role as UserRole | null) ?? null,
                assigneeId: rule.assigneeId,
                campusId: rule.campusId,
                orgGroupId: rule.orgGroupId,
                campusIds: rule.campusIds ?? [],
                orgGroupIds: rule.orgGroupIds ?? [],
                unitIds: (rule as { unitIds?: string[] | null }).unitIds ?? [],
            },
            {
                id: input.userId,
                role: input.role,
                campusId: input.campusId ?? null,
                orgGroupId: input.orgGroupId ?? null,
                unitId: input.campusId ?? input.orgGroupId ?? null,
            },
        ),
    );

    // Per-call memo: avoid re-fetching the same campus's parent id across
    // multiple rules that resolve to the same campus.
    const campusParentMemo = new Map<string, string | null>();
    async function resolveGroupForCampus(campusId: string): Promise<string | null> {
        if (campusParentMemo.has(campusId)) return campusParentMemo.get(campusId) ?? null;
        const campus = await prisma.campus.findUnique({
            where: { id: campusId },
            select: { parentId: true },
        });
        const parentId = campus?.parentId ?? null;
        campusParentMemo.set(campusId, parentId);
        return parentId;
    }

    const out: MaterialisedAssignment[] = [];
    for (const rule of matching) {
        const ruleCadence = (rule.cadenceOverride as Record<string, unknown> | null) ?? null;
        const frequency = (ruleCadence?.frequency as CadenceFrequency | undefined) ?? cadence.frequency;
        const expectedDays = (ruleCadence?.expectedDays as number[] | undefined) ?? cadence.expectedDays;
        const deadlineHours = (ruleCadence?.deadlineHours as number | undefined) ?? cadence.deadlineHours;
        const titleTemplate =
            (ruleCadence?.autoFillTitleTemplate as string | undefined) ?? cadence.autoFillTitleTemplate;

        const period = getCurrentPeriod(frequency, asOf);
        // Campus is keyed off the user (campus-scoped roles like USHER always
        // wire into their own campus). Rule scope only filters which users
        // qualify — it never overrides the campus the report is created against.
        const campusId = input.campusId ?? rule.campusId ?? null;
        // Derive orgGroupId from the campus's parent when not supplied directly.
        // Fixes the silent-skip path that previously returned an empty
        // assignment list for users (typically USHER) whose user record sets
        // campusId but leaves orgGroupId null.
        let orgGroupId = input.orgGroupId ?? rule.orgGroupId ?? null;
        if (!orgGroupId && campusId) {
            orgGroupId = await resolveGroupForCampus(campusId);
        }
        if (!campusId || !orgGroupId) continue;

        const { report } = await ensureReportShell(
            {
                templateId: rule.templateId,
                campusId,
                orgGroupId,
                period,
                cadence: {
                    frequency,
                    expectedDays,
                    deadlineHours,
                    autoFillTitleTemplate: titleTemplate,
                },
                asOf,
            },
            rule.ownerId,
        );

        // Idempotent assignment upsert: keyed on (ruleId, assigneeId, periodKey).
        const existing = await prisma.formAssignment.findFirst({
            where: {
                ruleId: rule.id,
                assigneeId: input.userId,
                periodKey: period.key,
            },
        });
        const assignment =
            existing ??
            (await prisma.formAssignment.create({
                data: {
                    reportId: report.id,
                    assigneeId: input.userId,
                    assignedById: rule.ownerId,
                    metricIds: rule.metricIds,
                    ruleId: rule.id,
                    periodKey: period.key,
                    notes: rule.notes,
                },
            }));

        out.push({
            id: assignment.id,
            reportId: assignment.reportId,
            metricIds: assignment.metricIds,
            periodKey: assignment.periodKey ?? period.key,
            ruleId: rule.id,
            completedAt: assignment.completedAt?.toISOString() ?? null,
            cancelledAt: assignment.cancelledAt?.toISOString() ?? null,
            dueAt: assignment.dueAt?.toISOString() ?? null,
        });
    }
    return out;
}
