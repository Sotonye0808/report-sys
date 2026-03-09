/**
 * app/api/bug-reports/[id]/route.ts
 * GET   /api/bug-reports/:id — get single bug report
 * PATCH /api/bug-reports/:id — update status / admin notes (SUPERADMIN only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import {
    successResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole, BugReportStatus } from "@/types/global";

/* ── Update schema ─────────────────────────────────────────────────────────── */

const UpdateBugReportSchema = z.object({
    status: z.nativeEnum(BugReportStatus).optional(),
    adminNotes: z.string().max(5000).optional(),
});

/* ── GET ───────────────────────────────────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;

        const bugReport = await db.bugReport.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
        if (!bugReport) return notFoundResponse("Bug report not found.");

        // Non-superadmins can only view their own reports
        if (auth.user.role !== UserRole.SUPERADMIN && bugReport.createdById !== auth.user.id) {
            return forbiddenResponse("You do not have access to this bug report.");
        }

        return NextResponse.json(successResponse(bugReport));
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── PATCH ─────────────────────────────────────────────────────────────────── */

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        if (auth.user.role !== UserRole.SUPERADMIN) {
            return forbiddenResponse("Only SUPERADMIN can update bug reports.");
        }

        const { id } = await params;
        const body = UpdateBugReportSchema.parse(await req.json());

        const existing = await db.bugReport.findUnique({ where: { id } });
        if (!existing) return notFoundResponse("Bug report not found.");

        const updated = await db.bugReport.update({
            where: { id },
            data: {
                ...(body.status !== undefined && { status: body.status }),
                ...(body.adminNotes !== undefined && { adminNotes: body.adminNotes }),
            },
        });

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
