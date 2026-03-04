/**
 * app/api/notifications/read-all/route.ts
 * POST /api/notifications/read-all — mark all notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const unread = await mockDb.notifications.findMany({
      where: (n: AppNotification) => n.userId === auth.user.id && !n.read,
    });

    const now = new Date().toISOString();
    await Promise.all(
      unread.map((n) =>
        mockDb.notifications.update({
          where: { id: n.id },
          data: { read: true, readAt: now } as Partial<AppNotification>,
        }),
      ),
    );

    await mockCache.invalidatePattern(`notifications:${auth.user.id}*`);
    return NextResponse.json(successResponse({ updated: unread.length }));
  } catch (err) {
    return handleApiError(err);
  }
}
