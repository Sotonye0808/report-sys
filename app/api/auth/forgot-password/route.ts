// @public-mutation -- intentionally unauthenticated (auth lifecycle endpoint).
/**
 * app/api/auth/forgot-password/route.ts
 * POST /api/auth/forgot-password
 * Generates a reset token and (in production) would send an email.
 * In dev, returns the token directly in the response.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, cache } from "@/lib/data/db";
import { sendPasswordResetEmail } from "@/lib/email/resend";

const Schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = Schema.parse(await req.json());

  const user = await db.user.findFirst({
    where: { email: { equals: body.email, mode: "insensitive" } },
  });

  /* Always return 200 to prevent email enumeration */
  if (!user) {
    return NextResponse.json({ success: true, message: "If this email exists, a reset link has been sent." });
  }

  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); /* 1 hour */

  /* Store reset token in cache (key: pwd-reset:{token} → userId) */
  await cache.set(`pwd-reset:${token}`, JSON.stringify({ userId: user.id, expiresAt }), 3600);

  /* Send password reset email if possible */
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  if (process.env.RESEND_API_KEY) {
    sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[forgot-password] Failed to send reset email", err);
    });
  }

  /* In production: do not expose token. In dev: include token in response. */
  const response: Record<string, unknown> = {
    success: true,
    message: "If this email exists, a reset link has been sent.",
  };

  if (process.env.NODE_ENV !== "production") {
    response.devToken = token;
    response.devHint = `Use this token at /reset-password?token=${token}`;
  }

  return NextResponse.json(response);
}
