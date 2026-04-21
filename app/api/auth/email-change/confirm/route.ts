import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/server/requestContext";
import { badRequestResponse, errorResponse, handleApiError, successResponse } from "@/lib/utils/api";
import { confirmPendingEmailChange, EmailActionError } from "@/modules/auth/services/emailVerificationService";

const ConfirmSchema = z.object({
    token: z.string().min(1),
});

export async function POST(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const parsed = ConfirmSchema.safeParse(await req.json());
        if (!parsed.success) {
            return badRequestResponse("A valid token is required.", ctx.requestId);
        }

        const result = await confirmPendingEmailChange(parsed.data.token);
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
