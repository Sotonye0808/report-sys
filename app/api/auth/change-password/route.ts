/**
 * app/api/auth/change-password/route.ts
 * POST /api/auth/change-password
 * Allows a logged-in user to change their own password.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth, hashPassword, verifyPassword } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const body = Schema.parse(await req.json());

  const user = await mockDb.users.findFirst({ where: { id: auth.user.id } });
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  /* Verify current password */
  const valid = await verifyPassword(body.currentPassword, user.passwordHash ?? "");
  if (!valid) {
    return NextResponse.json(
      { success: false, error: "Current password is incorrect." },
      { status: 400 },
    );
  }

  const hashed = await hashPassword(body.newPassword);

  await mockDb.users.update({
    where: { id: auth.user.id },
    data: { passwordHash: hashed, updatedAt: new Date().toISOString() } as Partial<UserProfile>,
  });

  return NextResponse.json({ success: true, message: "Password changed successfully." });
}
