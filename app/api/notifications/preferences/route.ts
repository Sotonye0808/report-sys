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
  getNotificationPreferences,
  setNotificationPreferences,
} from "@/lib/utils/notificationPreferences";

const UpdatePreferencesSchema = z.object({
  email: z.boolean().optional(),
  inApp: z.boolean().optional(),
  deadlineReminders: z.boolean().optional(),
  push: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const preferences = await getNotificationPreferences(auth.user.id);
    return NextResponse.json(successResponse(preferences, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (err) {
    return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
  }
}

export async function PUT(req: NextRequest) {
  const ctx = getRequestContext(req);
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error, ctx.requestId);

    const parsed = UpdatePreferencesSchema.safeParse(await req.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.message, 400, ctx.requestId);
    }

    const preferences = await setNotificationPreferences(auth.user.id, parsed.data);
    return NextResponse.json(successResponse(preferences, ctx.requestId), {
      headers: { "x-request-id": ctx.requestId },
    });
  } catch (err) {
    return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
  }
}

