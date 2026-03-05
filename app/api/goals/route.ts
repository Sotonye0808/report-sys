/**
 * app/api/goals/route.ts
 * GET  /api/goals  — list goals (filtered by role/campus)
 * POST /api/goals  — create or upsert a goal (GROUP_ADMIN+)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { UserRole, GoalMode } from "@/types/global";

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

const CreateGoalSchema = z.object({
    campusId: z.string().min(1),
    templateMetricId: z.string().min(1),
    metricName: z.string().min(1),
    mode: z.enum(["ANNUAL", "MONTHLY"]),
    year: z.number().int().min(2020).max(2100),
    month: z.number().int().min(1).max(12).optional(),
    targetValue: z.number().min(0),
});

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req, READ_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

    const goals = await mockDb.goals.findMany({
        where: (g: Goal) => {
            if (campusId && g.campusId !== campusId) return false;
            if (year != null && g.year !== year) return false;
            // Non-superadmin: restrict to their own campus
            if (
                auth.user.role !== UserRole.SUPERADMIN &&
                auth.user.role !== UserRole.SPO &&
                auth.user.role !== UserRole.CEO &&
                auth.user.role !== UserRole.CHURCH_MINISTRY
            ) {
                if (auth.user.campusId && g.campusId !== auth.user.campusId) return false;
            }
            return true;
        },
    });

    return NextResponse.json({ success: true, data: goals });
}

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, WRITE_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const body = CreateGoalSchema.parse(await req.json());

    // Non-superadmin / non-SPO can only set goals for their own campus
    if (
        auth.user.role !== UserRole.SUPERADMIN &&
        auth.user.role !== UserRole.SPO &&
        auth.user.role !== UserRole.CEO &&
        auth.user.role !== UserRole.CHURCH_MINISTRY
    ) {
        if (auth.user.campusId && body.campusId !== auth.user.campusId) {
            return NextResponse.json(
                { success: false, error: "Cannot set goals for a different campus." },
                { status: 403 },
            );
        }
    }

    const now = new Date().toISOString();

    // Upsert: find existing for same campus/metric/year/mode
    const existing = await mockDb.goals.findFirst({
        where: (g: Goal) =>
            g.campusId === body.campusId &&
            g.templateMetricId === body.templateMetricId &&
            g.year === body.year &&
            g.mode === body.mode &&
            (body.month == null || g.month === body.month),
    });

    if (existing) {
        if (existing.isLocked) {
            return NextResponse.json(
                { success: false, error: "This goal is locked. Submit an unlock request to edit it." },
                { status: 403 },
            );
        }
        const updated = await mockDb.goals.update({
            where: { id: existing.id },
            data: { ...body, mode: body.mode as GoalMode, updatedAt: now },
        });
        mockDb.emit("goals:changed");
        return NextResponse.json({ success: true, data: updated });
    }

    const goal = await mockDb.goals.create({
        data: {
            id: crypto.randomUUID(),
            ...body,
            mode: body.mode as GoalMode,
            isLocked: false,
            createdById: auth.user.id,
            createdAt: now,
            updatedAt: now,
        },
    });

    mockDb.emit("goals:changed");
    return NextResponse.json({ success: true, data: goal }, { status: 201 });
}
