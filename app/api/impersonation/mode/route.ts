/**
 * PATCH /api/impersonation/mode
 * Switch the active session between READ_ONLY and MUTATE.
 * Always allowed (the toggle itself is the safety mechanism).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { changeMode } from "@/lib/auth/impersonation";
import { UserRole } from "@/types/global";

const Schema = z.object({
    mode: z.enum(["READ_ONLY", "MUTATE"]),
});

export async function PATCH(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const actualRole = auth.user.actualRole ?? auth.user.role;
        if (actualRole !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("Impersonation is SUPERADMIN-only"), { status: 403 });
        }
        if (!auth.user.impersonation) {
            return NextResponse.json(badRequestResponse("No active impersonation session"), { status: 400 });
        }
        const body = await req.json().catch(() => ({}));
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }
        const session = await changeMode(auth.user.impersonation.sessionId, parsed.data.mode);
        return NextResponse.json(successResponse({ session }));
    } catch (err) {
        return handleApiError(err);
    }
}
