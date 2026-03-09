/**
 * app/api/reports/[id]/review/route.ts
 * POST /api/reports/:id/review — APPROVED → REVIEWED
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
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";

const ReviewSchema = z.object({
    notes: z.string().optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        const role = auth.user.role as UserRole;
        const roleConfig = ROLE_CONFIG[role];

        if (!roleConfig.canMarkReviewed) {
            return errorResponse("You do not have permission to mark reports as reviewed.", 403);
        }

        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.REVIEWED && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(`Cannot mark reviewed: report status is "${report.status}".`, 409);
        }

        const body = await req.json().catch(() => ({}));
        const { notes } = ReviewSchema.parse(body);
        const now = new Date().toISOString();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.REVIEWED,
                    reviewedById: auth.user.id,
                    updatedAt: new Date(),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.REVIEWED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.REVIEWED,
                    details: notes,
                },
            });

            return r;
        });

        await cache.invalidatePattern(`report:${id}*`);
        await cache.invalidatePattern(`reports:list:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
