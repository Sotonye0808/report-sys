/**
 * app/api/reports/route.ts
 * GET  /api/reports  — list reports (role-scoped)
 * POST /api/reports  — create a new draft report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus, ReportPeriodType, ReportEventType } from "@/types/global";

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
        const cached = await mockCache.get(cacheKey);
        if (cached) {
            return NextResponse.json(JSON.parse(cached));
        }

        let reports = await mockDb.reports.findMany({
            where: (r: Report) => {
                /* Scope: campus-scoped roles only see their campus */
                if (roleConfig.reportVisibilityScope === "campus") {
                    if (r.campusId !== auth.user.campusId) return false;
                }
                if (status && r.status !== status) return false;
                if (campusId && r.campusId !== campusId) return false;
                if (periodType && r.periodType !== periodType) return false;
                if (templateId && r.templateId !== templateId) return false;
                if (search) {
                    const q = search.toLowerCase();
                    return (r.title ?? "").toLowerCase().includes(q) || (r.period ?? "").toLowerCase().includes(q);
                }
                return true;
            },
        });

        /* Sort: newest first */
        reports = [...reports].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

        const total = reports.length;
        const data = reports.slice((page - 1) * pageSize, page * pageSize);

        const body = successResponse({ data, total, page, pageSize });
        await mockCache.set(cacheKey, JSON.stringify(body), 30);
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
        const template = await mockDb.reportTemplates.findUnique({ where: { id: body.templateId } });
        if (!template) {
            return errorResponse("Report template not found.", 404);
        }

        const now = new Date().toISOString();

        const report = await mockDb.transaction(async (tx) => {
            const newReport = await tx.reports.create({
                data: {
                    id: crypto.randomUUID(),
                    organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
                    title: body.title,
                    templateId: body.templateId,
                    campusId: body.campusId,
                    period: body.period,
                    periodType: body.periodType,
                    status: ReportStatus.DRAFT,
                    createdById: auth.user.id,
                    submittedById: null,
                    notes: body.notes ?? null,
                    createdAt: now,
                    updatedAt: now,
                    deadline: null,
                    sections: [],
                } as unknown as Report,
            });

            await tx.reportEvents.create({
                data: {
                    id: crypto.randomUUID(),
                    reportId: newReport.id,
                    eventType: ReportEventType.CREATED,
                    actorId: auth.user.id,
                    timestamp: now,
                    metadata: null,
                } as ReportEvent,
            });

            return newReport;
        });

        await mockCache.invalidatePattern(`reports:list:${auth.user.id}:*`);

        return NextResponse.json(successResponse(report), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
