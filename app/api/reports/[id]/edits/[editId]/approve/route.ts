/**
 * app/api/reports/[id]/edits/[editId]/approve/route.ts
 * POST /api/reports/:id/edits/:editId/approve — approve submitted report edit request
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";
import { approveReportEdit } from "@/modules/reports/services/reportWorkflow";
import { UserRole } from "@/types/global";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; editId: string }> },
) {
    try {
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN, UserRole.SPO, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.CHURCH_MINISTRY]);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id, editId } = await params;
        const approved = await approveReportEdit(id, editId, auth.user.id, `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim());

        return NextResponse.json(successResponse(approved));
    } catch (err) {
        return handleApiError(err);
    }
}
