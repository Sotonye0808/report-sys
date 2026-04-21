import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { syncVerificationPromptForUser } from "@/modules/auth/services/emailVerificationService";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (auth.user.emailServiceReady) {
            void syncVerificationPromptForUser(auth.user.id).catch(() => undefined);
        }
        return NextResponse.json(successResponse(auth.user));
    } catch (err) {
        return handleApiError(err);
    }
}
