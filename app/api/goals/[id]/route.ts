/**
 * app/api/goals/[id]/route.ts
 * GET    /api/goals/:id
 * PUT    /api/goals/:id  — update target value (must not be locked)
 * DELETE /api/goals/:id  — SUPERADMIN only
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { UserRole } from "@/types/global";

const READ_ROLES: UserRole[] = [
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.CAMPUS_PASTOR,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.SUPERADMIN,
];

const WRITE_ROLES: UserRole[] = [
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.SUPERADMIN,
];

const UpdateGoalSchema = z.object({
    targetValue: z.number().min(0).optional(),
    isLocked:    z.boolean().optional(),
});

interface RouteCtx { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteCtx) {
    const auth = await verifyAuth(req, READ_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { id } = await params;
    const goal = await mockDb.goals.findUnique({ where: { id } });
    if (!goal) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

    return NextResponse.json({ success: true, data: goal });
}

export async function PUT(req: NextRequest, { params }: RouteCtx) {
    const auth = await verifyAuth(req, WRITE_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { id } = await params;
    const goal = await mockDb.goals.findUnique({ where: { id } });
    if (!goal) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

    if (goal.isLocked && auth.user.role !== UserRole.SUPERADMIN) {
        return NextResponse.json(
            { success: false, error: "Goal is locked. Submit an unlock request." },
            { status: 403 },
        );
    }

    const body = UpdateGoalSchema.parse(await req.json());
    const updated = await mockDb.goals.update({
        where: { id },
        data: { ...body, updatedAt: new Date().toISOString() },
    });

    mockDb.emit("goals:changed");
    return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, { params }: RouteCtx) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { id } = await params;
    const goal = await mockDb.goals.findUnique({ where: { id } });
    if (!goal) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

    await mockDb.goals.delete({ where: { id } });
    mockDb.emit("goals:changed");
    return NextResponse.json({ success: true, data: null });
}
