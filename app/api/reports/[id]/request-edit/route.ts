/**
 * app/api/reports/[id]/request-edit/route.ts
 * POST /api/reports/:id/request-edit — SUBMITTED → REQUIRES_EDITS
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
import { UserRole, ReportStatus, ReportEventType, ReportEditStatus } from "@/types/global";

const RequestEditSchema = z.object({
    reason: z.string().min(1, "Reason is required.").max(1000),
    sections: z.array(z.string()).optional(),
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

        if (!roleConfig.canRequestEdits) {
            return errorResponse("You do not have permission to request edits.", 403);
        }

        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.REQUIRES_EDITS && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(
                `Cannot request edits for a report in status "${report.status}".`,
                409,
            );
        }

        const body = RequestEditSchema.parse(await req.json());
        const now = new Date().toISOString();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.REQUIRES_EDITS,
                    notes: body.reason,
                    updatedAt: new Date(),
                },
            });

            await tx.reportEdit.create({
                data: {
                    reportId: id,
                    submittedById: auth.user.id,
                    reason: body.reason,
                    status: ReportEditStatus.SUBMITTED,
                    sections: body.sections ?? [],
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.EDIT_REQUESTED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.REQUIRES_EDITS,
                    details: body.reason,
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
