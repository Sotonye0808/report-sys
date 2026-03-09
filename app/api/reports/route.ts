/**
 * app/api/reports/route.ts
 * GET  /api/reports  — list reports (role-scoped)
 * POST /api/reports  — create a new draft report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus, ReportPeriodType, ReportEventType, MetricCalculationType } from "@/types/global";

/* ── Query schema ──────────────────────────────────────────────────────────── */

const ListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.nativeEnum(ReportStatus).optional(),
    campusId: z.string().optional(),
    periodType: z.nativeEnum(ReportPeriodType).optional(),
    search: z.string().optional(),
    templateId: z.string().optional(),
});

/* ── Create schema ─────────────────────────────────────────────────────────── */

const CreateReportSchema = z.object({
    title: z.string().min(1).max(200),
    templateId: z.string().uuid(),
    campusId: z.string().uuid(),
    period: z.string().min(1),
    periodType: z.nativeEnum(ReportPeriodType),
    notes: z.string().optional(),
    sections: z.array(z.object({
        templateSectionId: z.string(),
        sectionName: z.string(),
        metrics: z.array(z.object({
            templateMetricId: z.string(),
            metricName: z.string(),
            calculationType: z.string().optional(),
            isLocked: z.boolean().optional(),
            monthlyGoal: z.number().optional(),
            monthlyAchieved: z.number().optional(),
            yoyGoal: z.number().optional(),
        })),
    })).optional(),
});

/* ── GET ───────────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const params = Object.fromEntries(new URL(req.url).searchParams);
        const query = ListQuerySchema.parse(params);

        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        const { page, pageSize, status, campusId, periodType, search, templateId } = query;

        const cacheKey = `reports:list:${auth.user.id}:${JSON.stringify(query)}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(JSON.parse(cached));
        }

        /* Build Prisma where clause */
        const where: Record<string, unknown> = {};
        if (roleConfig.reportVisibilityScope === "campus" && auth.user.campusId) {
            where.campusId = auth.user.campusId;
        }
        if (status) where.status = status;
        if (campusId) where.campusId = campusId;
        if (periodType) where.periodType = periodType;
        if (templateId) where.templateId = templateId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { period: { contains: search, mode: "insensitive" } },
            ];
        }

        const [reports, total] = await Promise.all([
            db.report.findMany({
                where,
                orderBy: { updatedAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            db.report.count({ where }),
        ]);

        const body = successResponse({ reports, total, page, pageSize });
        await cache.set(cacheKey, JSON.stringify(body), 30);
        return NextResponse.json(body);
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── POST ──────────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (!roleConfig.canCreateReports) {
            return errorResponse("You do not have permission to create reports.", 403);
        }

        const body = CreateReportSchema.parse(await req.json());

        /* Verify template exists */
        const template = await db.reportTemplate.findUnique({ where: { id: body.templateId } });
        if (!template) {
            return errorResponse("Report template not found.", 404);
        }

        const report = await db.$transaction(async (tx) => {
            const newReport = await tx.report.create({
                data: {
                    organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
                    title: body.title,
                    templateId: body.templateId,
                    campusId: body.campusId,
                    orgGroupId: template.orgGroupId ?? "",
                    period: body.period,
                    periodType: body.periodType,
                    periodYear: new Date().getFullYear(),
                    status: ReportStatus.DRAFT,
                    createdById: auth.user.id,
                    notes: body.notes ?? null,
                    sections: body.sections ? {
                        create: body.sections.map((sec) => ({
                            templateSectionId: sec.templateSectionId,
                            sectionName: sec.sectionName,
                            metrics: {
                                create: sec.metrics.map((met) => ({
                                    templateMetricId: met.templateMetricId,
                                    metricName: met.metricName,
                                    calculationType: met.calculationType as MetricCalculationType ?? MetricCalculationType.SUM,
                                    monthlyGoal: met.monthlyGoal,
                                    monthlyAchieved: met.monthlyAchieved,
                                    yoyGoal: met.yoyGoal,
                                    isLocked: met.isLocked ?? false,
                                })),
                            },
                        })),
                    } : undefined,
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: newReport.id,
                    eventType: ReportEventType.CREATED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                },
            });

            return newReport;
        });

        await cache.invalidatePattern(`reports:list:${auth.user.id}:*`);

        return NextResponse.json(successResponse(report), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
