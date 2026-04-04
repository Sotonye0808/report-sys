/**
 * app/api/notifications/read-all/route.ts
 * POST /api/notifications/read-all — mark all notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";
import { getRequestContext } from "@/lib/server/requestContext";

export async function POST(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const result = await db.notification.updateMany({
      where: { userId: auth.user.id, read: false },
      data: { read: true, readAt: new Date() },
    });

    await cache.invalidatePattern(`notifications:${auth.user.id}*`);
    return NextResponse.json(successResponse({ updated: result.count }, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (err) {
    return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
  }
}
