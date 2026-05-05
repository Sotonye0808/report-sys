/**
 * app/api/reports/[id]/route.ts
 * GET /api/reports/:id  — get single report
 * PUT /api/reports/:id  — update report fields (DRAFT only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus, ReportEventType, MetricCalculationType } from "@/types/global";
import { parseCachedJsonSafe } from "@/lib/utils/cacheJson";
import { isOwnScopedReport } from "@/lib/utils/reportVisibility";
import { unitInScope } from "@/lib/data/orgUnitMatcher";

/* ── Update schema ─────────────────────────────────────────────────────────── */

const UpdateReportSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    notes: z.string().optional(),
    sections: z.array(z.unknown()).optional(),
});

/* ── GET ───────────────────────────────────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;

        const cacheKey = `report:${id}`;
        const cached = await cache.get(cacheKey);
        const parsedCached = parseCachedJsonSafe<Report>(cached);
        if (parsedCached) return NextResponse.json(successResponse(parsedCached));

        const report = await db.report.findUnique({
            where: { id },
            include: { sections: { include: { metrics: true } } },
        });
        if (!report) return notFoundResponse("Report not found.");

        /* Scope check
         *
         * Two-stage: (1) the legacy column-equality check, kept so existing
         * data with no `unitId` populated still resolves correctly; (2) the
         * polymorphic `unitInScope(target, [user.unitId])` fallback so the
         * new substrate is honored after reconciliation moves users + reports
         * onto `unitId`. Either path passing grants access — no regression
         * for legacy rows, and new multi-tree scopes work end-to-end.
         */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        const reportSnap = report;
        const userSnap = auth.user;
        const reportUnitId =
            (reportSnap as { unitId?: string | null }).unitId ?? reportSnap.campusId;
        const userUnitId =
            (userSnap as { unitId?: string | null }).unitId ?? userSnap.campusId ?? null;

        const scope = roleConfig.reportVisibilityScope;
        let allowed = false;
        if (scope === "all") {
            allowed = true;
        } else if (scope === "campus") {
            allowed =
                reportSnap.campusId === userSnap.campusId ||
                (Boolean(userUnitId) && (await unitInScope(reportUnitId, [userUnitId!])));
        } else if (scope === "group") {
            allowed =
                reportSnap.orgGroupId === userSnap.orgGroupId ||
                (Boolean(userUnitId) && (await unitInScope(reportUnitId, [userUnitId!]))) ||
                (Boolean(userSnap.orgGroupId) &&
                    (await unitInScope(reportUnitId, [userSnap.orgGroupId!])));
        } else if (scope === "own") {
            if (isOwnScopedReport(reportSnap, userSnap.id)) {
                allowed = true;
            } else {
                const hasAssignment = await db.formAssignment.findFirst({
                    where: {
                        reportId: reportSnap.id,
                        assigneeId: userSnap.id,
                        cancelledAt: null,
                    },
                    select: { id: true },
                });
                allowed = Boolean(hasAssignment);
            }
        }

        if (!allowed) {
            return errorResponse("You do not have access to this report.", 403);
        }

        // Attach Week-on-Week context (non-blocking; only relevant for weekly templates).
        try {
            const tplWithMetrics = await db.reportTemplate.findUnique({
                where: { id: report.templateId },
                include: { sections: { include: { metrics: true } } },
            });
            const flatTplMetrics = tplWithMetrics?.sections.flatMap((s) =>
                s.metrics.map((m) => ({
                    id: m.id,
                    capturesWoW: (m as { capturesWoW?: boolean }).capturesWoW ?? false,
                })),
            ) ?? [];
            if (flatTplMetrics.some((m) => m.capturesWoW)) {
                const { attachWeekOnWeekContext } = await import("@/lib/data/wow");
                await attachWeekOnWeekContext(report as never, flatTplMetrics);
            }
        } catch {
            // WoW is non-blocking — ignore failures and return the raw report.
        }

        await cache.set(cacheKey, JSON.stringify(report), 60);
        return NextResponse.json(successResponse(report));
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── PUT ───────────────────────────────────────────────────────────────────── */

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;

        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        /* Only DRAFT reports can be freely edited */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (!roleConfig.canFillReports) {
            return errorResponse("You do not have permission to edit reports.", 403);
        }
        if (roleConfig.reportVisibilityScope === "campus" && report.campusId !== auth.user.campusId) {
            return errorResponse("You do not have access to edit this report.", 403);
        }
        if (roleConfig.reportVisibilityScope === "group" && report.orgGroupId !== auth.user.orgGroupId) {
            return errorResponse("You do not have access to edit this report.", 403);
        }
        if (roleConfig.reportVisibilityScope === "own" && !isOwnScopedReport(report, auth.user.id)) {
            return errorResponse("You do not have access to edit this report.", 403);
        }
        if (report.status !== ReportStatus.DRAFT && report.status !== ReportStatus.REQUIRES_EDITS) {
            return errorResponse("Only draft or requires-edit reports can be updated.", 409);
        }

        const body = UpdateReportSchema.parse(await req.json());

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    ...(body.title !== undefined && { title: body.title }),
                    ...(body.notes !== undefined && { notes: body.notes }),
                },
            });

            if (body.sections) {
                // Reset to new section/metric payload to avoid stale data issues.
                await tx.reportSection.deleteMany({ where: { reportId: id } });

                const sections = body.sections as Array<{
                    templateSectionId: string;
                    sectionName: string;
                    metrics: Array<{
                        templateMetricId: string;
                        metricName: string;
                        calculationType?: MetricCalculationType;
                        isLocked?: boolean;
                        monthlyGoal?: number;
                        monthlyAchieved?: number;
                        yoyGoal?: number;
                        comment?: string;
                    }>;
                }>;

                // Recompute auto-totals server-side BEFORE persisting so the
                // total cell value + comment are server-truth (not client-trusted).
                try {
                    const tplWithMetrics = await tx.reportTemplate.findUnique({
                        where: { id: r.templateId },
                        include: { sections: { include: { metrics: true } } },
                    });
                    const flatMetrics = tplWithMetrics?.sections.flatMap((s) =>
                        s.metrics.map((m) => ({
                            id: m.id,
                            name: m.name,
                            sectionId: s.id,
                            isAutoTotal:
                                (m as { isAutoTotal?: boolean }).isAutoTotal ?? false,
                            autoTotalSourceMetricIds:
                                (m as { autoTotalSourceMetricIds?: string[] }).autoTotalSourceMetricIds ?? [],
                            autoTotalScope:
                                (m as { autoTotalScope?: string }).autoTotalScope ?? "SECTION",
                        })),
                    ) ?? [];
                    if (flatMetrics.some((m) => m.isAutoTotal)) {
                        const { recomputeAutoTotals } = await import("@/lib/data/autoTotal");
                        const sectionsForRecompute = sections.map((sec) => {
                            const tplSec = tplWithMetrics?.sections.find(
                                (s) => s.id === sec.templateSectionId,
                            );
                            return {
                                id: tplSec?.id ?? sec.templateSectionId,
                                templateSectionId: sec.templateSectionId,
                                metrics: sec.metrics.map((m) => ({
                                    templateMetricId: m.templateMetricId,
                                    monthlyAchieved: m.monthlyAchieved,
                                    comment: m.comment,
                                    isLocked: m.isLocked,
                                })),
                            };
                        });
                        const result = recomputeAutoTotals(sectionsForRecompute, flatMetrics);
                        // Apply back to `sections` (mutated by reference inside the result).
                        for (const sec of result.sections) {
                            const targetSec = sections.find(
                                (s) => s.templateSectionId === sec.templateSectionId,
                            );
                            if (!targetSec) continue;
                            for (const cell of sec.metrics ?? []) {
                                const targetMetric = targetSec.metrics.find(
                                    (m) => m.templateMetricId === cell.templateMetricId,
                                );
                                if (!targetMetric) continue;
                                targetMetric.monthlyAchieved = cell.monthlyAchieved ?? undefined;
                                targetMetric.comment = cell.comment ?? undefined;
                                targetMetric.isLocked = cell.isLocked ?? false;
                            }
                        }
                    }
                } catch {
                    // Recompute failure is non-fatal; persist what the client sent.
                }

                for (const section of sections) {
                    await tx.reportSection.create({
                        data: {
                            reportId: id,
                            templateSectionId: section.templateSectionId,
                            sectionName: section.sectionName,
                            metrics: {
                                create: (section.metrics ?? []).map((metric) => ({
                                    templateMetricId: metric.templateMetricId,
                                    metricName: metric.metricName,
                                    calculationType:
                                        metric.calculationType ?? MetricCalculationType.SUM,
                                    monthlyGoal: metric.monthlyGoal,
                                    monthlyAchieved: metric.monthlyAchieved,
                                    yoyGoal: metric.yoyGoal,
                                    comment: metric.comment,
                                    isLocked: metric.isLocked ?? false,
                                })),
                            },
                        },
                    });
                }
            }

            // Capture a brief change-summary in `details` so the audit trail
            // surfaces what was actually touched, not just "edit applied".
            const editSummary = (() => {
                const editedSections = (body.sections ?? []) as Array<{ metrics?: unknown[] }>;
                if (editedSections.length === 0) {
                    return body.notes ? `Notes: ${body.notes}` : "Report fields edited";
                }
                const sectionCount = editedSections.length;
                let metricCount = 0;
                for (const s of editedSections) {
                    metricCount += s.metrics?.length ?? 0;
                }
                const noteSuffix = body.notes ? ` · Notes: ${body.notes}` : "";
                return `Edited ${metricCount} metric${metricCount === 1 ? "" : "s"} across ${sectionCount} section${sectionCount === 1 ? "" : "s"}${noteSuffix}`;
            })();

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.EDIT_APPLIED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    details: editSummary,
                },
            });

            return r;
        });

        cache.invalidatePatternAsync(`report:${id}*`);
        cache.invalidatePatternAsync(`reports:list:${auth.user.id}:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
