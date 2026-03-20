/**
 * app/api/goals/edit-requests/[id]/reject/route.ts
 * POST /api/goals/edit-requests/:id/reject — reject a goal edit request
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, notFoundResponse, handleApiError } from "@/lib/utils/api";
import { UserRole, GoalEditRequestStatus, NotificationType } from "@/types/global";
import { createNotification } from "@/lib/utils/notifications";

const RejectSchema = z.object({ reviewNotes: z.string().optional() });

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN, UserRole.SPO, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.CHURCH_MINISTRY]);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const body = RejectSchema.parse(await req.json().catch(() => ({})));

        const request = await db.goalEditRequest.findUnique({ where: { id } });
        if (!request) return notFoundResponse("Goal unlock request not found.");
        if (request.status !== GoalEditRequestStatus.PENDING) {
            return NextResponse.json({ success: false, error: "Request is not pending." }, { status: 409 });
        }

        const updated = await db.goalEditRequest.update({
            where: { id },
            data: {
                status: GoalEditRequestStatus.REJECTED,
                reviewedById: auth.user.id,
                reviewNotes: body.reviewNotes,
                updatedAt: new Date(),
            },
        });

        const requester = await db.user.findUnique({ where: { id: request.requestedById } });
        if (requester) {
            await createNotification({
                userId: requester.id,
                type: NotificationType.GOAL_UNLOCK_REJECTED,
                title: "Goal Unlock Rejected",
                message: `Your goal unlock request has been rejected${body.reviewNotes ? `: ${body.reviewNotes}` : "."}`,
                relatedId: updated.id,
            });
        }

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
