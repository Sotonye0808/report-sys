/**
 * lib/data/reportShellService.ts
 *
 * Idempotent report-shell upsert. Given a `(templateId, campusId, periodKey)`
 * tuple, returns an existing draft report or creates one whose `sections` and
 * `metrics` mirror the template's structure. `autoCreated: true` flags rows
 * the system created on behalf of a recurring usher assignment so downstream
 * UI can attribute auto-fills.
 *
 * Concurrency: the look-up uses a deterministic period filter and a final
 * "second-read" guard so two concurrent callers can't end up with two report
 * rows. We don't add a hard DB unique index because the upstream period shape
 * is heterogeneous (week vs month vs year); the in-process guard plus a tight
 * findFirst → create window is sufficient for our throughput.
 */

import { prisma } from "@/lib/data/prisma";
import { recomputeAutoTotals } from "@/lib/data/autoTotal";
import { renderTitle } from "@/lib/utils/reportTitle";
import {
    type CadenceFrequency,
    type PeriodKey,
    computeDeadline,
    getCurrentPeriod,
    periodLabel,
    quarterFromMonth,
} from "@/lib/utils/cadence";
import { ReportPeriodType, ReportStatus } from "@/types/global";

export interface EnsureReportShellInput {
    templateId: string;
    campusId: string;
    orgGroupId: string;
    period?: PeriodKey;
    /** Optional cadence override (drives deadline + title). */
    cadence?: {
        frequency: CadenceFrequency;
        expectedDays: number[];
        deadlineHours: number;
        autoFillTitleTemplate?: string;
    };
    /** Used to compute period when `period` is absent. */
    asOf?: Date;
}

export interface EnsureReportShellResult {
    report: { id: string; campusId: string; templateId: string; status: ReportStatus };
    created: boolean;
}

function findFilter(input: EnsureReportShellInput, period: PeriodKey) {
    const filter: Record<string, unknown> = {
        campusId: input.campusId,
        templateId: input.templateId,
        periodType: period.periodType,
        periodYear: period.periodYear,
    };
    if (period.periodType === ReportPeriodType.WEEKLY) {
        filter.periodWeek = period.periodWeek;
    } else if (period.periodType === ReportPeriodType.MONTHLY) {
        filter.periodMonth = period.periodMonth;
    }
    return filter;
}

export async function ensureReportShell(
    input: EnsureReportShellInput,
    actorId: string,
): Promise<EnsureReportShellResult> {
    const cadence = input.cadence;
    const period =
        input.period ??
        getCurrentPeriod(cadence?.frequency ?? ReportPeriodType.WEEKLY, input.asOf ?? new Date());

    const filter = findFilter(input, period);

    const existing = await prisma.report.findFirst({
        where: filter as never,
        select: { id: true, campusId: true, templateId: true, status: true },
    });
    if (existing) {
        return { report: existing as EnsureReportShellResult["report"], created: false };
    }

    const template = await prisma.reportTemplate.findUnique({
        where: { id: input.templateId },
        include: { sections: { include: { metrics: true } } },
    });
    if (!template) {
        throw new Error(`Template ${input.templateId} not found`);
    }

    const campus = await prisma.campus.findUnique({
        where: { id: input.campusId },
        select: { name: true, parentId: true },
    });
    const orgGroup = campus
        ? await prisma.orgGroup.findUnique({
              where: { id: campus.parentId },
              select: { name: true },
          })
        : null;

    const titleTemplate =
        cadence?.autoFillTitleTemplate ??
        template.autoFillTitleTemplate ??
        "{period}";
    const titleVars = {
        campus: campus?.name ?? input.campusId,
        group: orgGroup?.name,
        period: periodLabel(period),
        weekNumber: period.periodWeek,
        monthName: period.periodMonth,
        quarter: period.periodMonth ? quarterFromMonth(period.periodMonth) : undefined,
        year: period.periodYear,
    };
    const { title } = renderTitle(titleTemplate, titleVars);

    const deadline = cadence
        ? computeDeadline(cadence.expectedDays, cadence.deadlineHours, input.asOf ?? new Date())
        : null;

    // Second-pass guard: verify nothing was created while we were preparing.
    const racedExisting = await prisma.report.findFirst({
        where: filter as never,
        select: { id: true, campusId: true, templateId: true, status: true },
    });
    if (racedExisting) {
        return { report: racedExisting as EnsureReportShellResult["report"], created: false };
    }

    const created = await prisma.report.create({
        data: {
            templateId: input.templateId,
            campusId: input.campusId,
            orgGroupId: input.orgGroupId,
            periodType: period.periodType,
            periodYear: period.periodYear,
            periodMonth: period.periodMonth,
            periodWeek: period.periodWeek,
            period: period.key,
            status: ReportStatus.DRAFT,
            title: title || null,
            deadline: deadline ?? undefined,
            autoCreated: true,
            createdById: actorId,
            sections: {
                create: template.sections.map((sec) => ({
                    templateSectionId: sec.id,
                    sectionName: sec.name,
                    metrics: {
                        create: sec.metrics.map((m) => ({
                            templateMetricId: m.id,
                            metricName: m.name,
                            calculationType: m.calculationType,
                        })),
                    },
                })),
            },
        },
        select: { id: true, campusId: true, templateId: true, status: true },
    });

    // Seed auto-total values + comments on the freshly-built shell so
    // the form opens with totals already at zero (and comment stamped).
    try {
        const fresh = await prisma.report.findUnique({
            where: { id: created.id },
            include: { sections: { include: { metrics: true } } },
        });
        if (fresh && fresh.sections) {
            const tplMetrics = template.sections.flatMap((s) =>
                s.metrics.map((m) => ({
                    id: m.id,
                    name: m.name,
                    sectionId: s.id,
                    isAutoTotal: (m as { isAutoTotal?: boolean }).isAutoTotal ?? false,
                    autoTotalSourceMetricIds:
                        (m as { autoTotalSourceMetricIds?: string[] }).autoTotalSourceMetricIds ?? [],
                    autoTotalScope:
                        (m as { autoTotalScope?: string }).autoTotalScope ?? "SECTION",
                })),
            );
            if (tplMetrics.some((m) => m.isAutoTotal)) {
                const sectionsForRecompute = fresh.sections.map((sec) => ({
                    id: sec.id,
                    templateSectionId: sec.templateSectionId,
                    metrics: sec.metrics.map((m) => ({
                        id: m.id,
                        templateMetricId: m.templateMetricId,
                        monthlyAchieved: m.monthlyAchieved,
                        comment: m.comment,
                        isLocked: m.isLocked,
                    })),
                }));
                const result = recomputeAutoTotals(sectionsForRecompute, tplMetrics);
                for (const sec of result.sections) {
                    for (const cell of sec.metrics ?? []) {
                        if (cell.id == null) continue;
                        await prisma.reportMetric.update({
                            where: { id: cell.id },
                            data: {
                                monthlyAchieved: cell.monthlyAchieved ?? null,
                                comment: cell.comment ?? null,
                                isLocked: cell.isLocked ?? false,
                            },
                        });
                    }
                }
            }
        }
    } catch {
        // Non-fatal — shell creation succeeded; auto-total seeding can retry on next save.
    }

    return { report: created as EnsureReportShellResult["report"], created: true };
}
