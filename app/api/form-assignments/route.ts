/**
 * GET  /api/form-assignments         — list assignments for current user (or all for managers)
 * POST /api/form-assignments         — create new assignment (managers only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";

function canManageAssignments(role: UserRole): boolean {
    const cfg = ROLE_CONFIG[role];
    return Boolean(cfg?.canCreateReports || cfg?.canManageTemplates || cfg?.canDataEntry || role === UserRole.SUPERADMIN);
}

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const url = new URL(req.url);
        const scope = url.searchParams.get("scope") ?? "me"; // me | managed | all
        const status = url.searchParams.get("status"); // active | completed | cancelled

        const filter: Record<string, unknown> = {};
        if (scope === "me") {
            filter.assigneeId = auth.user.id;
        } else if (scope === "managed") {
            filter.assignedById = auth.user.id;
        } else if (scope === "all" && auth.user.role !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("Insufficient scope"), { status: 403 });
        }
        if (status === "active") {
            filter.completedAt = null;
            filter.cancelledAt = null;
        } else if (status === "completed") {
            filter.completedAt = { not: null };
        } else if (status === "cancelled") {
            filter.cancelledAt = { not: null };
        }

        const rows = await prisma.formAssignment.findMany({
            where: filter as never,
            orderBy: [{ createdAt: "desc" }],
            take: 100,
        });
        return NextResponse.json(successResponse(rows));
    } catch (err) {
        return handleApiError(err);
    }
}

const CreateSchema = z.object({
    reportId: z.string().uuid(),
    assigneeId: z.string().uuid(),
    metricIds: z.array(z.string().uuid()).min(1).max(100),
    dueAt: z.string().datetime().optional(),
    notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (!canManageAssignments(auth.user.role)) {
            return NextResponse.json(forbiddenResponse("Cannot create assignments"), { status: 403 });
        }
        const body = await req.json();
        const parsed = CreateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }
        // Prevent self-assignment as a manager (USHER/DATA_ENTRY can't reach this branch).
        if (parsed.data.assigneeId === auth.user.id) {
            return NextResponse.json(badRequestResponse("Cannot self-assign"), { status: 400 });
        }
        const created = await prisma.formAssignment.create({
            data: {
                reportId: parsed.data.reportId,
                assigneeId: parsed.data.assigneeId,
                assignedById: auth.user.id,
                metricIds: parsed.data.metricIds,
                dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
                notes: parsed.data.notes,
            },
        });
        return NextResponse.json(successResponse(created));
    } catch (err) {
        return handleApiError(err);
    }
}
