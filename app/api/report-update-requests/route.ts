/**
 * app/api/report-update-requests/route.ts
 * GET /api/report-update-requests  — list all requests (Superadmin + exec)
 * POST /api/report-update-requests — create a request (Campus Admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, errorResponse, handleApiError } from "@/lib/utils/api";
import { UserRole, ReportUpdateRequestStatus, NotificationType } from "@/types/global";
import { createNotification } from "@/lib/utils/notifications";

const CreateRequestSchema = z.object({
    reportId: z.string().uuid(),
    reason: z.string().min(1).max(1000),
});

const EXEC_ROLES = [
    UserRole.SUPERADMIN,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.OFFICE_OF_CEO,
    UserRole.CHURCH_MINISTRY,
];

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        if (!EXEC_ROLES.includes(auth.user.role as UserRole)) {
            return unauthorizedResponse("Access denied.");
        }

        const items = await db.reportUpdateRequest.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json(successResponse(items));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        if (![UserRole.CAMPUS_ADMIN, UserRole.GROUP_ADMIN, UserRole.SUPERADMIN].includes(auth.user.role as UserRole)) {
            return unauthorizedResponse("Access denied.");
        }

        const body = CreateRequestSchema.parse(await req.json());

        const report = await db.report.findUnique({ where: { id: body.reportId } });
        if (!report) return errorResponse("Report not found.", 404);

        const request = await db.reportUpdateRequest.create({
            data: {
                reportId: body.reportId,
                requestedById: auth.user.id,
                reason: body.reason,
                status: ReportUpdateRequestStatus.PENDING,
                sections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        const approvers = await db.user.findMany({
            where: { role: { in: EXEC_ROLES }, isActive: true },
        });

        await Promise.all(
            approvers.map((u) =>
                createNotification({
                    userId: u.id,
                    type: NotificationType.REPORT_UPDATE_REQUESTED,
                    title: "Report Update Request",
                    message: `A report update request has been submitted by ${auth.user.email}.`,
                    reportId: body.reportId,
                }),
            ),
        );

        return NextResponse.json(successResponse(request), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
