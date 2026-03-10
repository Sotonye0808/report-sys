/**
 * app/api/invite-links/[id]/route.ts
 * DELETE /api/invite-links/:id — revoke an invite link (set isActive: false)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const ALLOWED_ROLES = [
    UserRole.SUPERADMIN,
    UserRole.CAMPUS_ADMIN,
    UserRole.CAMPUS_PASTOR,
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
];

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAuth(req, ALLOWED_ROLES);
    if (!auth.success) {
        return NextResponse.json(
            { success: false, error: auth.error },
            { status: auth.status ?? 401 },
        );
    }

    const { id } = await params;

    const link = await db.inviteLink.findUnique({ where: { id } });
    if (!link) {
        return NextResponse.json(
            { success: false, error: "Invite link not found" },
            { status: 404 },
        );
    }

    // Only the creator or a SUPERADMIN can revoke
    if (link.createdById !== auth.user.id && auth.user.role !== UserRole.SUPERADMIN) {
        return NextResponse.json(
            { success: false, error: "You can only revoke your own invite links" },
            { status: 403 },
        );
    }

    if (!link.isActive) {
        return NextResponse.json(
            { success: false, error: "Invite link is already revoked" },
            { status: 400 },
        );
    }

    const updated = await db.inviteLink.update({
        where: { id },
        data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: updated });
}
