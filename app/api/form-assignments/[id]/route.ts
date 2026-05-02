/**
 * GET    /api/form-assignments/[id]   — assignment detail (assignee or manager)
 * PATCH  /api/form-assignments/[id]   — update metricIds / dueAt / notes (manager only)
 * DELETE /api/form-assignments/[id]   — cancel assignment (manager only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";

function isManager(actorId: string, row: { assignedById: string; assigneeId: string }): boolean {
    return row.assignedById === actorId;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const row = await prisma.formAssignment.findUnique({ where: { id } });
        if (!row) return NextResponse.json(notFoundResponse("Assignment not found"), { status: 404 });
        if (row.assigneeId !== auth.user.id && !isManager(auth.user.id, row)) {
            return NextResponse.json(forbiddenResponse("Not your assignment"), { status: 403 });
        }
        return NextResponse.json(successResponse(row));
    } catch (err) {
        return handleApiError(err);
    }
}

const PatchSchema = z.object({
    metricIds: z.array(z.string().uuid()).min(1).max(100).optional(),
    dueAt: z.string().datetime().nullable().optional(),
    notes: z.string().max(500).optional(),
    completed: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const row = await prisma.formAssignment.findUnique({ where: { id } });
        if (!row) return NextResponse.json(notFoundResponse("Assignment not found"), { status: 404 });

        const body = await req.json();
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }

        const isAssignee = row.assigneeId === auth.user.id;
        const isMgr = isManager(auth.user.id, row);

        // Assignee can only flip `completed`; managers can edit other fields.
        if (parsed.data.completed != null) {
            if (!isAssignee && !isMgr) {
                return NextResponse.json(forbiddenResponse("Cannot complete assignment"), { status: 403 });
            }
        }
        if ((parsed.data.metricIds || parsed.data.dueAt !== undefined || parsed.data.notes != null) && !isMgr) {
            return NextResponse.json(forbiddenResponse("Only the manager can edit"), { status: 403 });
        }

        const data: Record<string, unknown> = {};
        if (parsed.data.metricIds) data.metricIds = parsed.data.metricIds;
        if (parsed.data.dueAt !== undefined) data.dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
        if (parsed.data.notes != null) data.notes = parsed.data.notes;
        if (parsed.data.completed === true) data.completedAt = new Date();
        if (parsed.data.completed === false) data.completedAt = null;

        const updated = await prisma.formAssignment.update({ where: { id }, data: data as never });
        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const row = await prisma.formAssignment.findUnique({ where: { id } });
        if (!row) return NextResponse.json(notFoundResponse("Assignment not found"), { status: 404 });
        if (!isManager(auth.user.id, row)) {
            return NextResponse.json(forbiddenResponse("Only the manager can cancel"), { status: 403 });
        }
        const updated = await prisma.formAssignment.update({
            where: { id },
            data: { cancelledAt: new Date() },
        });
        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
