import { type NextRequest } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        return successResponse(auth.user);
    } catch (err) {
        return handleApiError(err);
    }
}
