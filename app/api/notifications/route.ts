/**
 * app/api/notifications/route.ts
 * GET  /api/notifications      — list notifications for current user
 * POST /api/notifications/read-all — mark all as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { mockCache } from "@/lib/data/mockCache";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const cacheKey = `notifications:${auth.user.id}`;
    const cached = await mockCache.get(cacheKey);
    if (cached) return NextResponse.json(successResponse(JSON.parse(cached)));

    const notifications = await mockDb.notifications.findMany({
      where: (n: AppNotification) => n.userId === auth.user.id,
    });

    const sorted = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    await mockCache.set(cacheKey, JSON.stringify(sorted), 30);
    return NextResponse.json(successResponse(sorted));
  } catch (err) {
    return handleApiError(err);
  }
}
