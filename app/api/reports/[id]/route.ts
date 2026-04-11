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

        /* Scope check */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (roleConfig.reportVisibilityScope === "campus" && report.campusId !== auth.user.campusId) {
            return errorResponse("You do not have access to this report.", 403);
        }
        if (roleConfig.reportVisibilityScope === "group" && report.orgGroupId !== auth.user.orgGroupId) {
            return errorResponse("You do not have access to this report.", 403);
        }
        if (roleConfig.reportVisibilityScope === "own" && !isOwnScopedReport(report, auth.user.id)) {
            return errorResponse("You do not have access to this report.", 403);
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

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.EDIT_APPLIED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
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
