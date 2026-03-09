/**
 * app/api/goals/[id]/unlock-request/route.ts
 * POST /api/goals/:id/unlock-request  — request permission to edit a locked goal
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole, GoalEditRequestStatus } from "@/types/global";

const UnlockRequestSchema = z.object({
    reason: z.string().min(10),
    proposedValue: z.number().min(0),
});

interface RouteCtx { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteCtx) {
    const auth = await verifyAuth(req, [
        UserRole.GROUP_ADMIN,
        UserRole.GROUP_PASTOR,
        UserRole.SPO,
        UserRole.CEO,
        UserRole.CHURCH_MINISTRY,
        UserRole.SUPERADMIN,
    ]);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { id } = await params;
    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

    if (!goal.isLocked) {
        return NextResponse.json(
            { success: false, error: "Goal is not locked — edit it directly." },
            { status: 400 },
        );
    }

    const body = UnlockRequestSchema.parse(await req.json());

    const editRequest = await db.goalEditRequest.create({
        data: {
            goalId: id,
            requestedById: auth.user.id,
            reason: body.reason,
            proposedValue: body.proposedValue,
            status: GoalEditRequestStatus.PENDING,
        },
    });

    return NextResponse.json({ success: true, data: editRequest }, { status: 201 });
}
