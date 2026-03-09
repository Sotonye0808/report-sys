/**
 * app/api/notifications/read-all/route.ts
 * POST /api/notifications/read-all — mark all notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const result = await db.notification.updateMany({
      where: { userId: auth.user.id, read: false },
      data: { read: true, readAt: new Date() },
    });

    await cache.invalidatePattern(`notifications:${auth.user.id}*`);
    return NextResponse.json(successResponse({ updated: result.count }));
  } catch (err) {
    return handleApiError(err);
  }
}
