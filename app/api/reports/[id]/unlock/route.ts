/**
 * app/api/reports/[id]/unlock/route.ts
 * POST /api/reports/:id/unlock — LOCKED → DRAFT (SUPERADMIN only)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { unlockReport } from "@/modules/reports/services/reportWorkflow";
import { UserRole } from "@/types/global";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;

        const updated = await unlockReport({
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
