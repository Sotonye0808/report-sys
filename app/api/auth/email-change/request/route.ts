import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import {
    badRequestResponse,
    errorResponse,
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from "@/lib/utils/api";
import { EmailActionError, requestEmailChange } from "@/modules/auth/services/emailVerificationService";

const RequestSchema = z.object({
    newEmail: z.string().email(),
});

export async function POST(req: NextRequest) {
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

        const parsed = RequestSchema.safeParse(await req.json());
        if (!parsed.success) {
            return badRequestResponse("A valid new email address is required.", ctx.requestId);
        }

        const result = await requestEmailChange(auth.user.id, parsed.data.newEmail);
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
