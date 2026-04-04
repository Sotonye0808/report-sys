/**
 * app/api/invite-links/[id]/route.ts
 * DELETE /api/invite-links/:id — revoke an invite link (set isActive: false)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { getRequestContext } from "@/lib/server/requestContext";
import { revokeInviteLink } from "@/modules/users/services/inviteService";
import {
    errorResponse,
    handleApiError,
    successResponse,
    unauthorizedResponse,
} from "@/lib/utils/api";
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
    const ctx = getRequestContext(req);
    try {
        const auth = await verifyAuth(req, ALLOWED_ROLES);
        if (!auth.success) {
            return unauthorizedResponse(auth.error, ctx.requestId);
        }

        const { id } = await params;
        const result = await revokeInviteLink(id, {
            id: auth.user.id,
            role: auth.user.role,
        });
        if (!result.success) {
            return errorResponse(result.error, result.code, ctx.requestId);
        }

        return NextResponse.json(successResponse(result.data, ctx.requestId), {
            headers: { "x-request-id": ctx.requestId },
        });
    } catch (err) {
        return handleApiError(err, { requestId: ctx.requestId, route: ctx.route });
    }
}
