import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import { errorResponse, handleApiError, successResponse, unauthorizedResponse } from "@/lib/utils/api";
import { uploadTempAssetToSession } from "@/lib/assets/lifecycleService";

const UploadSchema = z.object({
  dataUrl: z.string().min(32),
  fileName: z.string().max(255).optional(),
  mimeType: z.string().max(128).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const { id } = await params;
    const parsed = UploadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400, ctx.requestId);
    }

    const session = await uploadTempAssetToSession({
      sessionId: id,
      ownerId: auth.user.id,
      dataUrl: parsed.data.dataUrl,
      fileName: parsed.data.fileName,
      mimeType: parsed.data.mimeType,
      requestId: ctx.requestId,
    });

    return NextResponse.json(successResponse(session, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (error) {
    return handleApiError(error, { requestId: ctx.requestId, route: ctx.route });
  }
}
