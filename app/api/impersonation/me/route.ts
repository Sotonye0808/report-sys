/**
 * GET /api/impersonation/me
 * Returns the currently active impersonation session for the calling user,
 * or `{ session: null }` when none.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { loadActiveSession } from "@/lib/auth/impersonation";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const session = await loadActiveSession();
        return NextResponse.json(successResponse({ session: session ?? null }));
    } catch (err) {
        return handleApiError(err);
    }
}
