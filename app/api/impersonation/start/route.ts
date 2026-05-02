/**
 * POST /api/impersonation/start
 *
 * SUPERADMIN-only. Starts a new impersonation session targeting a non-SUPERADMIN
 * role (and optionally a specific user). Auto-stops any prior session for the
 * same SUPERADMIN before starting.
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
import {
    startSession,
    ImpersonationDisabledError,
    ImpersonationForbiddenError,
} from "@/lib/auth/impersonation";
import { UserRole } from "@/types/global";

const Schema = z.object({
    impersonatedRole: z.nativeEnum(UserRole),
    impersonatedUserId: z.string().uuid().optional(),
    mode: z.enum(["READ_ONLY", "MUTATE"]).default("READ_ONLY"),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        // Use actualRole — a SUPERADMIN already impersonating must end the
        // current session before starting a new one.
        const actualRole = auth.user.actualRole ?? auth.user.role;
        if (actualRole !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("Impersonation is SUPERADMIN-only"), { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid payload"), {
                status: 400,
            });
        }

        const session = await startSession({
            superadminId: auth.user.id,
            impersonatedRole: parsed.data.impersonatedRole,
            impersonatedUserId: parsed.data.impersonatedUserId,
            mode: parsed.data.mode,
        });
        return NextResponse.json(successResponse({ session }));
    } catch (err) {
        if (err instanceof ImpersonationDisabledError) {
            return NextResponse.json(forbiddenResponse(err.message), { status: 403 });
        }
        if (err instanceof ImpersonationForbiddenError) {
            return NextResponse.json(forbiddenResponse(err.message), { status: 403 });
        }
        return handleApiError(err);
    }
}
