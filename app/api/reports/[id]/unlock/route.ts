/**
 * app/api/reports/[id]/unlock/route.ts
 * POST /api/reports/:id/unlock — LOCKED → DRAFT (SUPERADMIN only)
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
import { createNotification } from "@/lib/utils/notifications";
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { UserRole, ReportStatus, ReportEventType, NotificationType } from "@/types/global";

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
        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.DRAFT && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(`Cannot unlock a report in status "${report.status}".`, 409);
        }

        const recipientId = report.submittedById ?? report.createdById;
        const actorName = [auth.user.firstName, auth.user.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.DRAFT,
                    lockedAt: null,
                    updatedAt: new Date(),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.UNLOCKED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.DRAFT,
                },
            });

            if (recipientId && recipientId !== auth.user.id) {
                await createNotification(
                    {
                        userId: recipientId,
                        type: NotificationType.REPORT_UNLOCKED,
                        title: "Report Unlocked",
                        message: `Your report was unlocked by ${actorName || auth.user.email}`,
                        reportId: id,
                    },
                    tx,
                );
            }

            return r;
        });

        cache.invalidatePatternAsync(`report:${id}*`);
        cache.invalidatePatternAsync(`reports:list:${auth.user.id}:*`);
        if (recipientId) cache.invalidatePatternAsync(`notifications:${recipientId}*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
