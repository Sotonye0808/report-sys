/**
 * app/api/reports/[id]/submit/route.ts
 * POST /api/reports/:id/submit — DRAFT → SUBMITTED
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
import { ROLE_CONFIG } from "@/config/roles";
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { createNotification } from "@/lib/utils/notifications";
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
        const roleConfig = ROLE_CONFIG[role];

        if (!roleConfig.canSubmitReports) {
            return errorResponse("You do not have permission to submit reports.", 403);
        }

        /* Validate status transition */
        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.SUBMITTED && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(
                `Cannot submit a report in status "${report.status}".`,
                409,
            );
        }

        const now = new Date().toISOString();

        const recipient =
            (await db.user.findFirst({
                where: {
                    role: UserRole.GROUP_ADMIN,
                    orgGroupId: report.orgGroupId ?? undefined,
                    isActive: true,
                },
            })) ||
            (await db.user.findFirst({
                where: {
                    role: UserRole.CAMPUS_PASTOR,
                    campusId: report.campusId ?? undefined,
                    isActive: true,
                },
            })) ||
            (await db.user.findFirst({
                where: { role: UserRole.SUPERADMIN, isActive: true },
            }));

        const actorName = [auth.user.firstName, auth.user.lastName].filter(Boolean).join(" ").trim();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.SUBMITTED,
                    submittedById: auth.user.id,
                    updatedAt: new Date(),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.SUBMITTED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.SUBMITTED,
                },
            });

            if (recipient && recipient.id !== auth.user.id) {
                await createNotification(
                    {
                        userId: recipient.id,
                        type: NotificationType.REPORT_SUBMITTED,
                        title: "Report Submitted",
                        message: `A report was submitted by ${actorName || auth.user.email}`,
                        reportId: id,
                    },
                    tx,
                );
            }

            return r;
        });

        cache.invalidatePatternAsync(`report:${id}*`);
        cache.invalidatePatternAsync(`reports:list:${auth.user.id}:*`);
        if (recipient) cache.invalidatePatternAsync(`notifications:${recipient.id}*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
