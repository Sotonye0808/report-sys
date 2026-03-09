/**
 * app/api/notifications/route.ts
 * GET  /api/notifications      — list notifications for current user
 * POST /api/notifications/read-all — mark all as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const cacheKey = `notifications:${auth.user.id}${unreadOnly ? ":unread" : ""}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(successResponse(JSON.parse(cached)));

    const where: { userId: string; read?: boolean } = { userId: auth.user.id };
    if (unreadOnly) where.read = false;

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    await cache.set(cacheKey, JSON.stringify(notifications), 30);
    return NextResponse.json(successResponse(notifications));
  } catch (err) {
    return handleApiError(err);
  }
}
