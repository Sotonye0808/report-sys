/**
 * lib/data/wow.ts
 *
 * Pure helpers that attach Week-on-Week comparison context to a report
 * payload before it is returned to the client. Non-blocking: when the
 * prior week's report is missing, the corresponding fields are simply
 * omitted (the form layer hides the indicator and analytics shows
 * "no data" rather than throwing).
 */

import { prisma } from "@/lib/data/prisma";
import { ReportPeriodType } from "@/types/global";

interface MetricCellLike {
    templateMetricId: string;
    monthlyAchieved?: number | null;
    wowGoal?: number | null;
    wowAchieved?: number | null;
}

interface SectionLike {
    metrics?: MetricCellLike[];
}

interface ReportLike {
    id: string;
    campusId: string;
    templateId: string;
    periodType: ReportPeriodType;
    periodYear: number;
    periodWeek?: number | null;
    sections?: SectionLike[];
}

interface TemplateMetricLike {
    id: string;
    capturesWoW?: boolean;
}

/**
 * Mutates the report payload, filling `wowGoal` (= prior week's achieved) and
 * `wowAchieved` (= current week's achieved) for every metric whose template
 * definition has `capturesWoW: true`. Returns the same report for chaining.
 */
export function applyWowContext(report: ReportLike, prev: ReportLike | null, templateMetrics: TemplateMetricLike[]): ReportLike {
    const wowMetricIds = new Set(templateMetrics.filter((m) => m.capturesWoW).map((m) => m.id));
    if (wowMetricIds.size === 0) return report;

    const prevByTemplateMetricId = new Map<string, number | null>();
    if (prev?.sections) {
        for (const sec of prev.sections) {
            for (const cell of sec.metrics ?? []) {
                prevByTemplateMetricId.set(cell.templateMetricId, cell.monthlyAchieved ?? null);
            }
        }
    }

    for (const sec of report.sections ?? []) {
        for (const cell of sec.metrics ?? []) {
            if (!wowMetricIds.has(cell.templateMetricId)) continue;
            const prior = prevByTemplateMetricId.get(cell.templateMetricId);
            cell.wowAchieved = cell.monthlyAchieved ?? null;
            cell.wowGoal = prior ?? null;
        }
    }

    return report;
}

/**
 * Convenience: load the prior-week report (if any) for the same campus +
 * template + period bucket, then apply WoW context.
 *
 * Returns the same report row when no WoW metrics exist on the template
 * (no DB hit in that case). Errors are swallowed; WoW is non-blocking.
 */
export async function attachWeekOnWeekContext(report: ReportLike, templateMetrics: TemplateMetricLike[]): Promise<ReportLike> {
    if (report.periodType !== ReportPeriodType.WEEKLY) return report;
    const wowMetricIds = templateMetrics.filter((m) => m.capturesWoW).map((m) => m.id);
    if (wowMetricIds.length === 0) return report;
    const week = report.periodWeek;
    const year = report.periodYear;
    if (!week || !year) return report;

    try {
        // Previous ISO week — if week is 1, look up prior year's last week (52/53).
        const prevWeek = week === 1 ? 52 : week - 1;
        const prevYear = week === 1 ? year - 1 : year;

        const prev = await prisma.report.findFirst({
            where: {
                campusId: report.campusId,
                templateId: report.templateId,
                periodType: ReportPeriodType.WEEKLY,
                periodYear: prevYear,
                periodWeek: prevWeek,
            },
            include: { sections: { include: { metrics: true } } },
        });
        return applyWowContext(report, (prev as unknown as ReportLike | null) ?? null, templateMetrics);
    } catch {
        return report;
    }
}
