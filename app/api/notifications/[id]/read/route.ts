/**
 * app/api/notifications/[id]/read/route.ts
 * POST /api/notifications/:id/read — mark a single notification as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, handleApiError } from "@/lib/utils/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const { id } = await params;
    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification) return notFoundResponse("Notification not found.");
    if (notification.userId !== auth.user.id) {
      return errorResponse("You do not have access to this notification.", 403);
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    await cache.invalidatePattern(`notifications:${auth.user.id}*`);
    return NextResponse.json(successResponse(updated));
  } catch (err) {
    return handleApiError(err);
  }
}
