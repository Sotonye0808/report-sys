/**
 * app/api/reports/[id]/route.ts
 * GET /api/reports/:id  — get single report
 * PUT /api/reports/:id  — update report fields (DRAFT only)
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
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";

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
        const cached = await mockCache.get(cacheKey);
        if (cached) return NextResponse.json(successResponse(JSON.parse(cached)));

        const report = await mockDb.reports.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        /* Scope check */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (roleConfig.reportVisibilityScope === "campus" && report.campusId !== auth.user.campusId) {
            return errorResponse("You do not have access to this report.", 403);
        }

        await mockCache.set(cacheKey, JSON.stringify(report), 60);
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

        const report = await mockDb.reports.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        /* Only DRAFT reports can be freely edited */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (!roleConfig.canFillReports) {
            return errorResponse("You do not have permission to edit reports.", 403);
        }
        if (report.status !== ReportStatus.DRAFT && report.status !== ReportStatus.REQUIRES_EDITS) {
            return errorResponse("Only draft or requires-edit reports can be updated.", 409);
        }

        const body = UpdateReportSchema.parse(await req.json());
        const now = new Date().toISOString();

        const updated = await mockDb.transaction(async (tx) => {
            const r = await tx.reports.update({
                where: { id },
                data: {
                    ...(body.title !== undefined && { title: body.title }),
                    ...(body.notes !== undefined && { notes: body.notes }),
                    ...(body.sections !== undefined && { sections: body.sections }),
                    updatedAt: now,
                },
            });

            await tx.reportEvents.create({
                data: {
                    id: crypto.randomUUID(),
                    reportId: id,
                    eventType: ReportEventType.EDIT_APPLIED,
                    actorId: auth.user.id,
                    timestamp: now,
                    metadata: null,
                } as ReportEvent,
            });

            return r;
        });

        await mockCache.invalidatePattern(`report:${id}*`);
        await mockCache.invalidatePattern(`reports:list:${auth.user.id}:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
