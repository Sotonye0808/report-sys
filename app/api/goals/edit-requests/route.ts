/**
 * app/api/goals/edit-requests/route.ts
 * GET /api/goals/edit-requests  — list all pending goal unlock requests
 * POST /api/goals/edit-requests — create a new unlock request for a goal
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { successResponse, errorResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";
import { UserRole, GoalEditRequestStatus, NotificationType } from "@/types/global";
import { createNotification } from "@/lib/utils/notifications";

const CreateGoalEditRequestSchema = z.object({
    goalId: z.string().uuid(),
    reason: z.string().min(10),
    proposedValue: z.number().min(0),
});

const MANAGER_ROLES = [
    UserRole.SUPERADMIN,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.OFFICE_OF_CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
    UserRole.CAMPUS_PASTOR,
];

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        if (!MANAGER_ROLES.includes(auth.user.role as UserRole)) {
            return unauthorizedResponse("Access denied.");
        }

        const requests = await db.goalEditRequest.findMany({
            orderBy: { createdAt: "desc" },
            include: { goal: true, requestedBy: true, reviewedBy: true },
        });

        return NextResponse.json(successResponse(requests));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req, [
            UserRole.CAMPUS_ADMIN,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.SPO,
            UserRole.CEO,
            UserRole.CHURCH_MINISTRY,
            UserRole.SUPERADMIN,
        ]);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const body = CreateGoalEditRequestSchema.parse(await req.json());

        const goal = await db.goal.findUnique({ where: { id: body.goalId } });
        if (!goal) return errorResponse("Goal not found.", 404);
        if (!goal.isLocked) return errorResponse("Goal is not locked.", 400);

        const request = await db.goalEditRequest.create({
            data: {
                goalId: body.goalId,
                requestedById: auth.user.id,
                reason: body.reason,
                proposedValue: body.proposedValue,
                status: GoalEditRequestStatus.PENDING,
            },
        });

        const approvers = await db.user.findMany({
            where: { role: { in: MANAGER_ROLES }, isActive: true },
        });

        await Promise.all(
            approvers.map((u) =>
                createNotification({
                    userId: u.id,
                    type: NotificationType.GOAL_UNLOCK_REQUESTED,
                    title: "Goal Unlock Request",
                    message: `${auth.user.email} requested to unlock a goal: ${body.reason}`,
                    relatedId: request.id,
                    reportId: undefined,
                }),
            ),
        );

        return NextResponse.json(successResponse(request), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
