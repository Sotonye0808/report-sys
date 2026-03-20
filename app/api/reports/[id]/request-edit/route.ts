/**
 * app/api/reports/[id]/request-edit/route.ts
 * POST /api/reports/:id/request-edit — SUBMITTED → REQUIRES_EDITS
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { requestEditReport } from "@/modules/reports/services/reportWorkflow";
import { UserRole } from "@/types/global";

const RequestEditSchema = z.object({
    reason: z.string().min(1, "Reason is required.").max(1000),
    sections: z.array(z.string()).optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const body = RequestEditSchema.parse(await req.json());

        const updated = await requestEditReport(
            {
                reportId: id,
                actorId: auth.user.id,
                actorName: [auth.user.firstName, auth.user.lastName].filter(Boolean).join(" ").trim(),
                actorRole: auth.user.role as UserRole,
            },
            body.reason,
        );

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
