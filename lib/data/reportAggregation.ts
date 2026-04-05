import { db } from "@/lib/data/db";
import { UserRole, ReportStatus, ReportPeriodType, MetricCalculationType } from "@/types/global";
import type { Report as PrismaReport, ReportSection as PrismaReportSection, ReportMetric as PrismaReportMetric } from "../../prisma/generated";
import { computeAggregatedValues, enforceAggregationScope } from "@/lib/data/reportAggregationUtils";

export type AggregationScope = "campus" | "group" | "all";

export interface AggregationCriteria {
    scopeType: AggregationScope;
    scopeId?: string;
    periodType: ReportPeriodType;
    periodYear: number;
    periodMonth?: number;
    periodWeek?: number;
    templateId?: string;
    includeDrafts?: boolean;
    includeStatuses?: ReportStatus[];
    metricIds?: string[];
    action?: "preview" | "generate";
}

// TODO: Prisma `Report`/`ReportSection`/`ReportMetric` are used here explicitly by alias to avoid DOM global `Report` collision.
// Avoid using bare global name `Report` in this file because `lib.dom` has a different `Report` interface (body/type/url/toJSON).
type ReportWithSections = PrismaReport & {
    sections: (PrismaReportSection & { metrics: PrismaReportMetric[] })[];
};

export interface AggregatedMetricValue {
    templateMetricId: string;
    metricName: string;
    calculationType: MetricCalculationType;
    monthlyGoal: number;
    monthlyAchieved: number;
    yoyGoal: number;
    sourceCount: number;
    selectedFromReportId?: string;
}

export interface AggregatedSectionValue {
    templateSectionId: string;
    sectionName: string;
    metrics: AggregatedMetricValue[];
}

export interface AggregationResult {
    sourceReports: ReportWithSections[];
    aggregatedSections: AggregatedSectionValue[];
    templateId: string;
    templateVersionId?: string;
    aggregationSource: "ROLLUP";
    aggregatedFrom: string[];
    scopeType: AggregationScope;
    scopeId?: string;
    periodType: ReportPeriodType;
    periodYear: number;
    periodMonth?: number;
    periodWeek?: number;
}

export class AggregationNoReportsError extends Error {
    constructor(message = "No reports found for the selected scope and period.") {
        super(message);
        this.name = "AggregationNoReportsError";
    }
}

const DRAFT_INCLUDED_STATUSES: ReportStatus[] = [
    ReportStatus.DRAFT,
    ReportStatus.SUBMITTED,
    ReportStatus.APPROVED,
    ReportStatus.REVIEWED,
    ReportStatus.LOCKED,
    ReportStatus.REQUIRES_EDITS,
];

const DRAFT_EXCLUDED_STATUSES: ReportStatus[] = [
    ReportStatus.SUBMITTED,
    ReportStatus.APPROVED,
    ReportStatus.REVIEWED,
    ReportStatus.LOCKED,
    ReportStatus.REQUIRES_EDITS,
];

function resolveAggregationStatuses(criteria: AggregationCriteria): ReportStatus[] {
    if (criteria.includeStatuses && criteria.includeStatuses.length > 0) {
        const statuses = new Set(criteria.includeStatuses);
        if (criteria.includeDrafts !== false) {
            statuses.add(ReportStatus.DRAFT);
        }
        return Array.from(statuses);
    }

    return criteria.includeDrafts === false ? DRAFT_EXCLUDED_STATUSES : DRAFT_INCLUDED_STATUSES;
}

/** Determine campus IDs available for user scope. */
export async function resolveScopeCampusIds(user: AuthUser): Promise<string[] | null> {
    if (!user || !user.role) return null;

    if (user.role === UserRole.CAMPUS_ADMIN || user.role === UserRole.CAMPUS_PASTOR) {
        return user.campusId ? [user.campusId] : [];
    }

    if (user.role === UserRole.GROUP_ADMIN || user.role === UserRole.GROUP_PASTOR) {
        if (!user.orgGroupId) return [];
        const group = await db.orgGroup.findUnique({
            where: { id: user.orgGroupId },
            include: { campuses: true },
        });
        if (!group) return [];
        return group.campuses.map((campus) => campus.id);
    }

    return null;
}

export function enforceScope(criteria: AggregationCriteria, user: AuthUser, resolvedScopeCampusIds?: string[] | null) {
    enforceAggregationScope({
        user,
        scopeType: criteria.scopeType,
        scopeId: criteria.scopeId,
        resolvedScopeCampusIds,
    });
}

export async function buildReportQuery(
    criteria: AggregationCriteria,
    user: AuthUser,
    resolvedScopeCampusIds?: string[] | null,
) {
    const campusScope = resolvedScopeCampusIds ?? await resolveScopeCampusIds(user);

    const where: any = {
        periodType: criteria.periodType,
        periodYear: criteria.periodYear,
        status: { in: resolveAggregationStatuses(criteria) },
    };

    if (criteria.periodType === ReportPeriodType.MONTHLY && criteria.periodMonth != null) {
        where.periodMonth = criteria.periodMonth;
    }
    if (criteria.periodType === ReportPeriodType.WEEKLY && criteria.periodWeek != null) {
        where.periodWeek = criteria.periodWeek;
    }
    if (criteria.templateId) where.templateId = criteria.templateId;

    if (criteria.scopeType === "campus" && criteria.scopeId) {
        where.campusId = criteria.scopeId;
    } else if (criteria.scopeType === "group" && criteria.scopeId) {
        const selectedGroup = await db.orgGroup.findUnique({
            where: { id: criteria.scopeId },
            include: { campuses: { select: { id: true } } },
        });

        const selectedGroupCampusIds = selectedGroup?.campuses.map((campus) => campus.id) ?? [];
        if (selectedGroupCampusIds.length > 0) {
            where.OR = [
                { orgGroupId: criteria.scopeId },
                { campusId: { in: selectedGroupCampusIds } },
            ];
        } else {
            where.orgGroupId = criteria.scopeId;
        }
    } else if (campusScope && campusScope.length > 0) {
        where.campusId = { in: campusScope };
    }

    return where;
}

export async function calculateAggregation(
    criteria: AggregationCriteria,
    user: AuthUser,
): Promise<AggregationResult> {
    const campusScope = await resolveScopeCampusIds(user);
    enforceScope(criteria, user, campusScope);

    const where = await buildReportQuery(criteria, user, campusScope);
    const reports = await db.report.findMany({
        where,
        include: {
            sections: {
                include: {
                    metrics: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    if (reports.length === 0) {
        throw new AggregationNoReportsError();
    }

    const templateIds = Array.from(new Set(reports.map((r) => r.templateId)));
    if (templateIds.length > 1) {
        throw new Error("Selected reports use multiple templates - aggregation requires one template.");
    }

    const templateId = templateIds[0];
    const template = await db.reportTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error("Template not found for aggregated reports.");

    const allMetricCumulative = new Map<string, {
        templateMetricId: string;
        metricName: string;
        calculationType: MetricCalculationType;
        goalSum: number;
        achievedSum: number;
        yoySum: number;
        count: number;
        snapshot: { reportId: string; createdAt: Date; monthlyGoal: number; monthlyAchieved: number; yoyGoal: number } | null;
    }>();

    for (const report of reports) {
        for (const section of report.sections) {
            for (const metric of section.metrics) {
                if (criteria.metricIds && !criteria.metricIds.includes(metric.templateMetricId)) continue;
                const key = metric.templateMetricId;
                const existing = allMetricCumulative.get(key);
                const calcType = (metric.calculationType ?? MetricCalculationType.SUM) as MetricCalculationType;

                if (!existing) {
                    allMetricCumulative.set(key, {
                        templateMetricId: key,
                        metricName: metric.metricName,
                        calculationType: calcType as MetricCalculationType,
                        goalSum: metric.monthlyGoal ?? 0,
                        achievedSum: metric.monthlyAchieved ?? 0,
                        yoySum: metric.yoyGoal ?? 0,
                        count: 1,
                        snapshot: {
                            reportId: report.id,
                            createdAt: report.createdAt,
                            monthlyGoal: metric.monthlyGoal ?? 0,
                            monthlyAchieved: metric.monthlyAchieved ?? 0,
                            yoyGoal: metric.yoyGoal ?? 0,
                        },
                    });
                    continue;
                }

                existing.goalSum += metric.monthlyGoal ?? 0;
                existing.achievedSum += metric.monthlyAchieved ?? 0;
                existing.yoySum += metric.yoyGoal ?? 0;
                existing.count += 1;

                if (existing.snapshot) {
                    if (report.createdAt > existing.snapshot.createdAt) {
                        existing.snapshot = {
                            reportId: report.id,
                            createdAt: report.createdAt,
                            monthlyGoal: metric.monthlyGoal ?? 0,
                            monthlyAchieved: metric.monthlyAchieved ?? 0,
                            yoyGoal: metric.yoyGoal ?? 0,
                        };
                    }
                }
            }
        }
    }

    const sectionsByTemplate = await db.reportTemplateSection.findMany({
        where: { templateId },
        orderBy: { order: "asc" },
        include: { metrics: { orderBy: { order: "asc" } } },
    });

    const aggregatedSections: AggregatedSectionValue[] = sectionsByTemplate.map((section) => ({
        templateSectionId: section.id,
        sectionName: section.name,
        metrics: section.metrics
            .filter((m) => !criteria.metricIds || criteria.metricIds.includes(m.id))
            .map((metric) => {
                const stored = allMetricCumulative.get(metric.id);
                const existing = stored ?? {
                    templateMetricId: metric.id,
                    metricName: metric.name,
                    calculationType: metric.calculationType,
                    goalSum: 0,
                    achievedSum: 0,
                    yoySum: 0,
                    count: 0,
                    snapshot: null,
                };

                const { monthlyGoal, monthlyAchieved, yoyGoal } = computeAggregatedValues({
                    calculationType: existing.calculationType,
                    goalSum: existing.goalSum,
                    achievedSum: existing.achievedSum,
                    yoySum: existing.yoySum,
                    count: existing.count,
                    snapshot: existing.snapshot,
                });

                return {
                    templateMetricId: metric.id,
                    metricName: metric.name,
                    calculationType: metric.calculationType as MetricCalculationType,
                    monthlyGoal,
                    monthlyAchieved,
                    yoyGoal,
                    sourceCount: existing.count,
                    selectedFromReportId: existing.snapshot?.reportId,
                };
            }),
    }));

    return {
        sourceReports: reports,
        aggregatedSections,
        templateId,
        templateVersionId: reports[0].templateVersionId ?? undefined,
        aggregationSource: "ROLLUP",
        aggregatedFrom: reports.map((report) => report.id),
        scopeType: criteria.scopeType,
        scopeId: criteria.scopeId,
        periodType: criteria.periodType,
        periodYear: criteria.periodYear,
        periodMonth: criteria.periodMonth,
        periodWeek: criteria.periodWeek,
    };
}

export async function persistAggregatedReport(
    result: AggregationResult,
    user: AuthUser,
): Promise<import("../../prisma/generated").Report & { aggregationSource: "ROLLUP"; aggregatedFrom: string[] }> {
    const title = `Aggregated ${result.scopeType} ${result.periodType} ${result.scopeId ?? "all"} ${result.periodYear}`;
    const firstCampusId = result.sourceReports?.[0]?.campusId ?? "";
    const firstOrgGroupId = result.sourceReports?.[0]?.orgGroupId ?? "";

    const report = await db.$transaction(async (tx) => {
        const created = await tx.report.create({
            data: {
                organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
                title,
                templateId: result.templateId,
                templateVersionId: result.templateVersionId,
                campusId: firstCampusId,
                orgGroupId: firstOrgGroupId,
                period: `${result.periodType}/${result.periodYear}`,
                periodType: result.periodType,
                periodYear: result.periodYear,
                periodMonth: result.periodMonth,
                periodWeek: result.periodWeek,
                status: ReportStatus.DRAFT,
                createdById: user.id,
                notes: "Aggregated report generated from multiple source reports",
                isDataEntry: false,
            },
        });

        for (const section of result.aggregatedSections) {
            const sectionRec = await tx.reportSection.create({
                data: {
                    reportId: created.id,
                    templateSectionId: section.templateSectionId,
                    sectionName: section.sectionName,
                },
            });

            for (const metric of section.metrics) {
                await tx.reportMetric.create({
                    data: {
                        reportSectionId: sectionRec.id,
                        templateMetricId: metric.templateMetricId,
                        metricName: metric.metricName,
                        calculationType: metric.calculationType,
                        monthlyGoal: metric.monthlyGoal,
                        monthlyAchieved: metric.monthlyAchieved,
                        yoyGoal: metric.yoyGoal,
                        isLocked: false,
                    },
                });
            }
        }

        await tx.reportEvent.create({
            data: {
                reportId: created.id,
                eventType: "CREATED",
                actorId: user.id,
                timestamp: new Date(),
            },
        });

        return created;
    });

    return {
        ...report,
        aggregationSource: "ROLLUP",
        aggregatedFrom: result.aggregatedFrom,
    };
}
