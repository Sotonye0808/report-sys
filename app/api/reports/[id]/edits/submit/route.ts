/**
 * app/api/reports/[id]/edits/submit/route.ts
 * POST /api/reports/:id/edits/submit — submit existing report edit request
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";
import { submitReportEdit } from "@/modules/reports/services/reportWorkflow";

const SubmitEditSchema = z.object({ editId: z.string().uuid() });

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const body = SubmitEditSchema.parse(await req.json());

        const submitted = await submitReportEdit(id, body.editId, auth.user.id, `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim());
        return NextResponse.json(successResponse(submitted));
    } catch (err) {
        return handleApiError(err);
    }
}
