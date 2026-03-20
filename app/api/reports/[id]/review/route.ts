/**
 * app/api/reports/[id]/review/route.ts
 * POST /api/reports/:id/review — APPROVED → REVIEWED
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { reviewReport } from "@/modules/reports/services/reportWorkflow";
import { UserRole } from "@/types/global";

const ReviewSchema = z.object({
    notes: z.string().optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;

        const updated = await reviewReport({
            reportId: id,
            actorId: auth.user.id,
            actorName: [auth.user.firstName, auth.user.lastName].filter(Boolean).join(" ").trim(),
            actorRole: auth.user.role as UserRole,
        });

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
