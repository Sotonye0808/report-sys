import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import { cleanupStaleTempAssets } from "@/lib/assets/lifecycleService";
import { errorResponse, handleApiError, successResponse, unauthorizedResponse } from "@/lib/utils/api";
import { UserRole } from "@/types/global";

const CleanupSchema = z.object({
  maxAgeHours: z.coerce.number().int().min(1).max(720).optional(),
  dryRun: z.boolean().optional().default(false),
});

function hasValidCleanupToken(req: NextRequest): boolean {
  const token = process.env.ASSET_CLEANUP_TOKEN;
  if (!token) {
    return false;
  }
  const headerToken = req.headers.get("x-cleanup-token") ?? "";
  return token === headerToken;
}

export async function POST(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    const allowedByToken = hasValidCleanupToken(req);

    if (!allowedByToken) {
      if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);
      if (auth.user.role !== UserRole.SUPERADMIN) {
        return unauthorizedResponse("Insufficient permissions", ctx.requestId);
      }
    }

    const parsed = CleanupSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400, ctx.requestId);
    }

    const result = await cleanupStaleTempAssets({
      maxAgeHours: parsed.data.maxAgeHours,
      dryRun: parsed.data.dryRun,
      requestId: ctx.requestId,
    });

    return NextResponse.json(successResponse(result, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (error) {
    return handleApiError(error, { requestId: ctx.requestId, route: ctx.route });
  }
}
