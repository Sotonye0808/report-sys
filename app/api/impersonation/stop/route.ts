/**
 * POST /api/impersonation/stop
 * Ends the current impersonation session for the calling SUPERADMIN.
 * Allowed even while in READ_ONLY mode.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { stopSession } from "@/lib/auth/impersonation";

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        await stopSession("USER");
        return NextResponse.json(successResponse({ ended: true }));
    } catch (err) {
        return handleApiError(err);
    }
}
