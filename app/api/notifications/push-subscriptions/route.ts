import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import {
  errorResponse,
  handleApiError,
  successResponse,
  unauthorizedResponse,
} from "@/lib/utils/api";
import {
  getPushSubscriptions,
  removePushSubscription,
  upsertPushSubscription,
} from "@/lib/utils/notificationPreferences";

const SubscriptionSchema = z.object({
  endpoint: z.string().min(1),
  keys: z
    .object({
      p256dh: z.string().optional(),
      auth: z.string().optional(),
    })
    .optional(),
});

const RemoveSchema = z.object({
  endpoint: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const subscriptions = await getPushSubscriptions(auth.user.id);
    return NextResponse.json(successResponse(subscriptions, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (err) {
    return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
  }
}

export async function POST(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const parsed = SubscriptionSchema.safeParse(await req.json());
    if (!parsed.success) return errorResponse(parsed.error.message, 400, ctx.requestId);

    const subscriptions = await upsertPushSubscription(auth.user.id, {
      ...parsed.data,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(successResponse(subscriptions, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (err) {
    return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const parsed = RemoveSchema.safeParse(await req.json());
    if (!parsed.success) return errorResponse(parsed.error.message, 400, ctx.requestId);

    const subscriptions = await removePushSubscription(auth.user.id, parsed.data.endpoint);
    return NextResponse.json(successResponse(subscriptions, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (err) {
    return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
  }
}

