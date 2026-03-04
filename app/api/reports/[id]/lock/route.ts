/**
 * app/api/reports/[id]/lock/route.ts
 * POST /api/reports/:id/lock — REVIEWED → LOCKED (SUPERADMIN only)
 */

import { NextRequest, NextResponse } from "next/server";
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
        const report = await mockDb.reports.findUnique({ where: { id } });
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

        const updated = await mockDb.transaction(async (tx) => {
            const r = await tx.reports.update({
                where: { id },
                data: {
                    status: ReportStatus.LOCKED,
                    lockedAt: now,
                    updatedAt: now,
                } as Partial<Report>,
            });

            await tx.reportEvents.create({
                data: {
                    id: crypto.randomUUID(),
                    reportId: id,
                    eventType: ReportEventType.LOCKED,
                    actorId: auth.user.id,
                    timestamp: now,
                    metadata: null,
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
