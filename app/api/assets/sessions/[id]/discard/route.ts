import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import { handleApiError, successResponse, unauthorizedResponse } from "@/lib/utils/api";
import { discardUploadSession } from "@/lib/assets/lifecycleService";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const { id } = await params;

    const session = await discardUploadSession({
      sessionId: id,
      ownerId: auth.user.id,
      requestId: ctx.requestId,
    });

    return NextResponse.json(successResponse(session, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (error) {
    return handleApiError(error, { requestId: ctx.requestId, route: ctx.route });
  }
}
