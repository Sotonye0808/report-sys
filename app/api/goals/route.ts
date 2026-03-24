/**
 * app/api/goals/route.ts
 * GET  /api/goals  — list goals (filtered by role/campus)
 * POST /api/goals  — create or upsert a goal (GROUP_ADMIN+)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api";
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

    /* Build Prisma where clause */
    const where: Record<string, unknown> = {};
    if (campusId) where.campusId = campusId;
    if (year != null) where.year = year;
    // Non-superadmin: restrict to their own campus
    if (
        auth.user.role !== UserRole.SUPERADMIN &&
        auth.user.role !== UserRole.SPO &&
        auth.user.role !== UserRole.CEO &&
        auth.user.role !== UserRole.CHURCH_MINISTRY
    ) {
        if (auth.user.campusId) where.campusId = auth.user.campusId;
    }

    const goals = await db.goal.findMany({ where });

    return NextResponse.json({ success: true, data: goals });
}

export async function POST(req: NextRequest) {
    let jsonBody: unknown;
    try {
        jsonBody = await req.json();
    } catch (err) {
        console.error("[api] Error parsing JSON body in POST /api/goals", {
            err,
            url: req.url,
            method: req.method,
        });
        return errorResponse("Invalid JSON payload.", 400);
    }

    try {
        const auth = await verifyAuth(req, WRITE_ROLES);
        if (!auth.success) return errorResponse(auth.error, auth.status ?? 401);

        const parseResult = CreateGoalSchema.safeParse(jsonBody);
        if (!parseResult.success) {
            console.error("[api] Zod validation failed in POST /api/goals", {
                errors: parseResult.error.format(),
            });
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid goal payload.",
                    code: 400,
                    validation: parseResult.error.format(),
                },
                { status: 400 },
            );
        }

        const body = parseResult.data;

        // Non-superadmin / non-SPO can only set goals for their own campus
        if (
            auth.user.role !== UserRole.SUPERADMIN &&
            auth.user.role !== UserRole.SPO &&
            auth.user.role !== UserRole.CEO &&
            auth.user.role !== UserRole.CHURCH_MINISTRY
        ) {
            if (auth.user.campusId && body.campusId !== auth.user.campusId) {
                return errorResponse("Cannot set goals for a different campus.", 403);
            }
        }

        const goal = await db.$transaction(async (tx) => {
            const existingWhere: Record<string, unknown> = {
                campusId: body.campusId,
                templateMetricId: body.templateMetricId,
                year: body.year,
                mode: body.mode,
            };
            if (body.month != null) existingWhere.month = body.month;

            const existing = await tx.goal.findFirst({ where: existingWhere });

            if (existing) {
                if (existing.isLocked && auth.user.role !== UserRole.SUPERADMIN) {
                    throw new Error("This goal is locked. Submit an unlock request to edit it.");
                }
                return tx.goal.update({
                    where: { id: existing.id },
                    data: { targetValue: body.targetValue, mode: body.mode as GoalMode },
                });
            }

            return tx.goal.create({
                data: {
                    campusId: body.campusId,
                    templateMetricId: body.templateMetricId,
                    metricName: body.metricName,
                    mode: body.mode as GoalMode,
                    year: body.year,
                    month: body.month,
                    targetValue: body.targetValue,
                    isLocked: false,
                    createdById: auth.user.id,
                },
            });
        });

        return NextResponse.json(successResponse(goal), { status: 201 });
    } catch (err) {
        if (err instanceof Error && err.message.includes("locked")) {
            return errorResponse(err.message, 403);
        }
        return handleApiError(err);
    }
}
