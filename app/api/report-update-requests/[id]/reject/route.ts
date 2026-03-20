/**
 * app/api/report-update-requests/[id]/reject/route.ts
 * POST /api/report-update-requests/:id/reject  — REJECT a pending update request
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, notFoundResponse, handleApiError } from "@/lib/utils/api";
import { UserRole, ReportUpdateRequestStatus, NotificationType } from "@/types/global";
import { createNotification } from "@/lib/utils/notifications";
import { z } from "zod";

const RejectSchema = z.object({ reason: z.string().optional() });

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        if (![UserRole.SUPERADMIN, UserRole.SPO, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.CHURCH_MINISTRY].includes(auth.user.role as UserRole)) {
            return unauthorizedResponse("Access denied.");
        }

        const { id } = await params;
        const body = RejectSchema.parse(await req.json().catch(() => ({})));
        const request = await db.reportUpdateRequest.findUnique({ where: { id } });
        if (!request) return notFoundResponse("Request not found.");
        if (request.status !== ReportUpdateRequestStatus.PENDING) {
            return NextResponse.json({ success: false, error: "Request is not pending." }, { status: 409 });
        }

        const updated = await db.reportUpdateRequest.update({
            where: { id },
            data: {
                status: ReportUpdateRequestStatus.REJECTED,
                reviewedById: auth.user.id,
                reviewNotes: body.reason,
                updatedAt: new Date(),
            },
        });

        const requester = await db.user.findUnique({ where: { id: request.requestedById } });
        if (requester) {
            await createNotification({
                userId: requester.id,
                type: NotificationType.REPORT_UPDATE_REJECTED,
                title: "Report Update Rejected",
                message: `Your report update request was rejected${body.reason ? `: ${body.reason}` : "."}`,
                reportId: request.reportId,
                relatedId: id,
            });
        }

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
