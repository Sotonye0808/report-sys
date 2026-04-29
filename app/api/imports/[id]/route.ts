/**
 * GET    /api/imports/[id]     — job detail with items
 * DELETE /api/imports/[id]     — cancel/delete a job (only owner)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/data/prisma";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const { id } = await ctx.params;
        const job = await prisma.importJob.findUnique({
            where: { id },
            include: { items: { orderBy: { rowIndex: "asc" } } },
        });
        if (!job) return NextResponse.json(notFoundResponse("Import job not found"), { status: 404 });
        if (job.ownerId !== auth.user.id) {
            return NextResponse.json(forbiddenResponse("Not your import job"), { status: 403 });
        }
        return NextResponse.json(successResponse(job));
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
        const job = await prisma.importJob.findUnique({ where: { id } });
        if (!job) return NextResponse.json(notFoundResponse("Import job not found"), { status: 404 });
        if (job.ownerId !== auth.user.id) {
            return NextResponse.json(forbiddenResponse("Not your import job"), { status: 403 });
        }
        const updated = await prisma.importJob.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
