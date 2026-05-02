/**
 * POST /api/admin-config/[ns]/reset
 * Revert a namespace to its `config/*` fallback. Superadmin only.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { resetAdminConfig, type AdminConfigNamespaceName } from "@/lib/data/adminConfig";
import { UserRole } from "@/types/global";

const ALLOWED_NS: AdminConfigNamespaceName[] = [
    "roles",
    "hierarchy",
    "dashboardLayout",
    "templatesMapping",
    "imports",
    "pwaInstall",
    "bulkInvites",
    "analytics",
    "emailTemplates",
];

export async function POST(
    req: NextRequest,
    ctx: { params: Promise<{ ns: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (auth.user.role !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("Admin config requires superadmin"), { status: 403 });
        }
        const { ns: rawNs } = await ctx.params;
        if (!(ALLOWED_NS as string[]).includes(rawNs)) {
            return NextResponse.json(badRequestResponse("Unknown namespace"), { status: 400 });
        }
        const snap = await resetAdminConfig(rawNs as AdminConfigNamespaceName, auth.user.id);
        return NextResponse.json(successResponse(snap));
    } catch (err) {
        return handleApiError(err);
    }
}
