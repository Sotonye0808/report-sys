/**
 * app/api/invite-links/[token]/route.ts
 * GET /api/invite-links/:token  — validate invite link (public — no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mockDb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const link = await mockDb.inviteLinks.findFirst({
    where: (l: InviteLink) => l.token === token,
  });

  if (!link) {
    return NextResponse.json({ success: false, error: "Invalid or expired invite link." }, { status: 404 });
  }

  if (link.usedAt) {
    return NextResponse.json({ success: false, error: "This invite link has already been used." }, { status: 410 });
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return NextResponse.json({ success: false, error: "This invite link has expired." }, { status: 410 });
  }

  /* Return public-safe subset */
  return NextResponse.json({
    success: true,
    data: {
      token: link.token,
      targetRole: link.targetRole,
      campusId: link.campusId,
      groupId: link.groupId,
      expiresAt: link.expiresAt,
    },
  });
}
