/**
 * app/api/reports/route.ts
 * GET  /api/reports  — list reports (role-scoped)
 * POST /api/reports  — create a new draft report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { DEADLINE_CONFIG } from "@/config/reports";
import { UserRole, ReportStatus, ReportPeriodType, ReportDeadlinePolicy, ReportEventType, MetricCalculationType } from "@/types/global";
import { dispatchDeadlineReminder } from "@/lib/utils/deadlineReminder";
import { getRequestContext } from "@/lib/server/requestContext";
import { resolveReportListPagination } from "@/lib/utils/reportListPagination";

dayjs.extend(weekOfYear);

const DEFAULT_REPORT_LIST_PAGE_SIZE = 100;
const MAX_REPORT_LIST_PAGE_SIZE = 500;

/* ── Query schema ──────────────────────────────────────────────────────────── */

const ListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(MAX_REPORT_LIST_PAGE_SIZE).default(DEFAULT_REPORT_LIST_PAGE_SIZE),
    all: z.preprocess((value) => {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return value;
    }, z.boolean()).default(false),
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
    periodYear: z.number().int().min(1900).max(2100),
    periodMonth: z.number().int().min(1).max(12).optional(),
    periodWeek: z.number().int().min(1).max(53).optional(),
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

function computeReportDeadline(
    periodType: ReportPeriodType,
    periodYear: number,
    periodMonth?: number,
    periodWeek?: number,
    policy: ReportDeadlinePolicy = ReportDeadlinePolicy.PERIOD_END,
    offsetHours: number = DEADLINE_CONFIG.reportDeadlineHours,
): Date {
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;

    if (periodType === ReportPeriodType.WEEKLY) {
        const weekNumber = periodWeek ?? 1;
        start = dayjs().year(periodYear).week(weekNumber).startOf("week");
        end = start.endOf("week");
    } else if (periodType === ReportPeriodType.YEARLY) {
        start = dayjs(`${periodYear}-01-01`).startOf("day");
        end = dayjs(`${periodYear}-12-31`).endOf("day");
    } else {
        const month = periodMonth ?? 1;
        start = dayjs(`${periodYear}-${String(month).padStart(2, "0")}-01`).startOf("day");
        end = start.endOf("month");
    }

    switch (policy) {
        case ReportDeadlinePolicy.PERIOD_START:
            return start.toDate();
        case ReportDeadlinePolicy.PERIOD_MIDDLE:
            return start.add(end.diff(start) / 2, "millisecond").toDate();
        case ReportDeadlinePolicy.AFTER_PERIOD_HOURS:
            return end.add(offsetHours, "hour").toDate();
        case ReportDeadlinePolicy.PERIOD_END:
        default:
            return end.toDate();
    }
}

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
            return NextResponse.json(cached);
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

        let reportsPromise;
        if (query.all) {
            reportsPromise = db.report.findMany({
                where,
                orderBy: { updatedAt: "desc" },
            });
        } else {
            const pagination = resolveReportListPagination({
                page,
                pageSize,
                all: false,
            }) as { skip: number; take: number };
            reportsPromise = db.report.findMany({
                where,
                orderBy: { updatedAt: "desc" },
                skip: pagination.skip,
                take: pagination.take,
            });
        }

        const [reports, total] = await Promise.all([
            reportsPromise,
            db.report.count({ where }),
        ]);

        const payload = {
            success: true,
            data: {
                reports,
                total,
                page: query.all ? 1 : page,
                pageSize: query.all ? reports.length : pageSize,
            },
        };
        await cache.set(cacheKey, JSON.stringify(payload), 30);
        return NextResponse.json(payload);
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── POST ──────────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    const ctx = getRequestContext(req);
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

        // Ensure campus exists and derive orgGroupId when template doesn't specify one.
        const campus = await db.campus.findUnique({ where: { id: body.campusId } });
        if (!campus) {
            return errorResponse("Campus not found.", 404);
        }

        const report = await db.$transaction(async (tx) => {
            const deadline = computeReportDeadline(
                body.periodType,
                body.periodYear,
                body.periodMonth,
                body.periodWeek,
                (template as any)?.deadlinePolicy ?? ReportDeadlinePolicy.PERIOD_END,
                (template as any)?.deadlineOffsetHours ?? DEADLINE_CONFIG.reportDeadlineHours,
            );
            const isDataEntry = body.periodYear < new Date().getFullYear();

            const newReport = await tx.report.create({
                data: {
                    organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
                    title: body.title,
                    templateId: body.templateId,
                    campusId: body.campusId,
                    // Use template.orgGroupId when present, otherwise fall back to
                    // the campus' parent group (seeded templates may not set orgGroupId).
                    orgGroupId: template.orgGroupId ?? campus.parentId,
                    period: body.period,
                    periodType: body.periodType,
                    periodYear: body.periodYear,
                    periodMonth: body.periodMonth,
                    periodWeek: body.periodWeek,
                    status: ReportStatus.DRAFT,
                    createdById: auth.user.id,
                    notes: body.notes ?? null,
                    deadline,
                    isDataEntry,
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

        const creator = await db.user.findUnique({
            where: { id: auth.user.id },
            select: { id: true, email: true, firstName: true, lastName: true },
        });

        if (creator?.email) {
            void dispatchDeadlineReminder({
                report: {
                    id: report.id,
                    title: report.title,
                    deadline: report.deadline,
                },
                recipient: creator,
                requestId: ctx.requestId,
            }).catch((error) => {
                console.warn("[reports.create] deadline reminder dispatch failed", {
                    requestId: ctx.requestId,
                    reportId: report.id,
                    actorId: auth.user.id,
                    error: error instanceof Error ? error.message : String(error),
                });
            });
        }

        cache.invalidatePatternAsync(`reports:list:${auth.user.id}:*`);

        return NextResponse.json(successResponse(report), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
