/**
 * app/api/reports/[id]/review/route.ts
 * POST /api/reports/:id/review — APPROVED → REVIEWED
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
        const report = await mockDb.reports.findUnique({ where: { id } });
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

        const updated = await mockDb.transaction(async (tx) => {
            const r = await tx.reports.update({
                where: { id },
                data: {
                    status: ReportStatus.REVIEWED,
                    reviewedById: auth.user.id,
                    reviewedAt: now,
                    updatedAt: now,
                    ...(notes !== undefined && { notes }),
                } as Partial<Report>,
            });

            await tx.reportEvents.create({
                data: {
                    id: crypto.randomUUID(),
                    reportId: id,
                    eventType: ReportEventType.REVIEWED,
                    actorId: auth.user.id,
                    timestamp: now,
                    metadata: notes ? { notes } : null,
                } as ReportEvent,
            });

            return r;
        });

        await mockCache.invalidatePattern(`report:${id}*`);
        await mockCache.invalidatePattern(`reports:list:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
