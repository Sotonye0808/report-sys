/**
 * app/api/reports/[id]/edits/[editId]/reject/route.ts
 * POST /api/reports/:id/edits/:editId/reject — reject submitted report edit request
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";
import { rejectReportEdit } from "@/modules/reports/services/reportWorkflow";
import { UserRole } from "@/types/global";

const RejectEditSchema = z.object({ reason: z.string().optional() });

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; editId: string }> },
) {
    try {
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN, UserRole.SPO, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.CHURCH_MINISTRY]);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id, editId } = await params;
        const body = RejectEditSchema.parse(await req.json().catch(() => ({})));

        const rejected = await rejectReportEdit(id, editId, auth.user.id, `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim(), body.reason);

        return NextResponse.json(successResponse(rejected));
    } catch (err) {
        return handleApiError(err);
    }
}
