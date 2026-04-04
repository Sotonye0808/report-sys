import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import { handleApiError, successResponse, unauthorizedResponse, errorResponse } from "@/lib/utils/api";
import { AssetDomain, AssetUploadMode } from "@/types/global";
import { createUploadSession } from "@/lib/assets/lifecycleService";

const CreateSessionSchema = z.object({
  domain: z.nativeEnum(AssetDomain),
  mode: z.nativeEnum(AssetUploadMode).default(AssetUploadMode.DEFERRED_SUBMIT),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export async function POST(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const parsed = CreateSessionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400, ctx.requestId);
    }

    const session = await createUploadSession({
      ownerId: auth.user.id,
      domain: parsed.data.domain,
      mode: parsed.data.mode,
      idempotencyKey: parsed.data.idempotencyKey,
      requestId: ctx.requestId,
    });

    return NextResponse.json(successResponse(session, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (error) {
    return handleApiError(error, { requestId: ctx.requestId, route: ctx.route });
  }
}
