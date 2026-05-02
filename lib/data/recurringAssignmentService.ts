/**
 * lib/data/recurringAssignmentService.ts
 *
 * Expands FormAssignmentRule rows for a calling user into concrete
 * FormAssignment rows for the current period, ensuring the underlying
 * report shell exists. Idempotent: a rule + period + user tuple resolves
 * to one assignment; subsequent calls return the same row.
 *
 * A rule matches a user when:
 *   - rule.assigneeId === user.id, OR
 *   - rule.role === user.role AND (rule.campusId == null || user.campusId === rule.campusId)
 *     AND (rule.orgGroupId == null || user.orgGroupId === rule.orgGroupId)
 */

import { prisma } from "@/lib/data/prisma";
import { ensureReportShell } from "@/lib/data/reportShellService";
import { getCurrentPeriod, type CadenceFrequency } from "@/lib/utils/cadence";
import { resolveRoleCadence } from "@/lib/auth/permissions";
import { ReportPeriodType, type UserRole } from "@/types/global";

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

    const rules = await prisma.formAssignmentRule.findMany({
        where: {
            isActive: true,
            OR: [
                { assigneeId: input.userId },
                {
                    role: input.role,
                    OR: [
                        { campusId: null, orgGroupId: null },
                        { campusId: input.campusId ?? undefined },
                        { orgGroupId: input.orgGroupId ?? undefined },
                    ],
                },
            ],
        },
    });

    const out: MaterialisedAssignment[] = [];
    for (const rule of rules) {
        const ruleCadence = (rule.cadenceOverride as Record<string, unknown> | null) ?? null;
        const frequency = (ruleCadence?.frequency as CadenceFrequency | undefined) ?? cadence.frequency;
        const expectedDays = (ruleCadence?.expectedDays as number[] | undefined) ?? cadence.expectedDays;
        const deadlineHours = (ruleCadence?.deadlineHours as number | undefined) ?? cadence.deadlineHours;
        const titleTemplate =
            (ruleCadence?.autoFillTitleTemplate as string | undefined) ?? cadence.autoFillTitleTemplate;

        const period = getCurrentPeriod(frequency, asOf);
        const campusId = rule.campusId ?? input.campusId ?? null;
        const orgGroupId = rule.orgGroupId ?? input.orgGroupId ?? null;
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
