/**
 * app/api/notifications/[id]/read/route.ts
 * POST /api/notifications/:id/read — mark a single notification as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, handleApiError } from "@/lib/utils/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const { id } = await params;
    const notification = await mockDb.notifications.findUnique({ where: { id } });
    if (!notification) return notFoundResponse("Notification not found.");
    if (notification.userId !== auth.user.id) {
      return errorResponse("You do not have access to this notification.", 403);
    }

    const updated = await mockDb.notifications.update({
      where: { id },
      data: { isRead: true, readAt: new Date().toISOString() } as Partial<Notification>,
    });

    await mockCache.invalidatePattern(`notifications:${auth.user.id}*`);
    return NextResponse.json(successResponse(updated));
  } catch (err) {
    return handleApiError(err);
  }
}
