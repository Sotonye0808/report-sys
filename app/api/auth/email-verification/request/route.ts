import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import {
    errorResponse,
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from "@/lib/utils/api";
import { EmailActionError, requestEmailVerification } from "@/modules/auth/services/emailVerificationService";

export async function POST(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

        const result = await requestEmailVerification(auth.user.id);
        return NextResponse.json(successResponse(result, ctx.requestId), {
            headers: { "x-request-id": ctx.requestId },
        });
    } catch (err) {
        if (err instanceof EmailActionError) {
            return errorResponse(err.message, err.status, ctx.requestId);
        }
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}
