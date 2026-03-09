/**
 * app/api/reports/[id]/lock/route.ts
 * POST /api/reports/:id/lock — REVIEWED → LOCKED (SUPERADMIN only)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        const role = auth.user.role as UserRole;
        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.LOCKED && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(`Cannot lock a report in status "${report.status}".`, 409);
        }

        const now = new Date().toISOString();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.LOCKED,
                    lockedAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.LOCKED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.LOCKED,
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
