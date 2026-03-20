/**
 * app/api/reports/[id]/edits/route.ts
 * GET /api/reports/:id/edits  — list edits on report
 * POST /api/reports/:id/edits — create edit draft
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { successResponse, errorResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";
import { createReportEdit } from "@/modules/reports/services/reportWorkflow";
import { UserRole } from "@/types/global";

const CreateEditSchema = z.object({
    reason: z.string().min(1).max(1000),
    sections: z.array(z.unknown()).optional(),
});

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return errorResponse("Report not found.", 404);

        const list = await db.reportEdit.findMany({
            where: { reportId: id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(successResponse(list));
    } catch (err) {
        return handleApiError(err);
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        if (![UserRole.CAMPUS_ADMIN, UserRole.GROUP_ADMIN, UserRole.GROUP_PASTOR, UserRole.SPO, UserRole.CEO, UserRole.CHURCH_MINISTRY, UserRole.SUPERADMIN].includes(auth.user.role as UserRole)) {
            return unauthorizedResponse("Access denied.");
        }

        const body = CreateEditSchema.parse(await req.json());
        const edit = await createReportEdit(id, auth.user.id, `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim(), body.reason, body.sections ?? []);

        return NextResponse.json(successResponse(edit), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
