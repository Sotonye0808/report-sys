/**
 * GET /api/admin-config
 * List all admin-config namespaces with current snapshot summaries.
 * Superadmin only.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, forbiddenResponse, handleApiError } from "@/lib/utils/api";
import { loadAdminConfig } from "@/lib/data/adminConfig";
import { UserRole } from "@/types/global";

const NAMESPACES = [
    "roles",
    "hierarchy",
    "dashboardLayout",
    "templatesMapping",
    "imports",
    "pwaInstall",
    "bulkInvites",
    "analytics",
    "emailTemplates",
    "roleCadence",
    "correlation",
] as const;

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (auth.user.role !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("Admin config requires superadmin"), { status: 403 });
        }
        const snapshots = await Promise.all(
            NAMESPACES.map((ns) => loadAdminConfig(ns)),
        );
        return NextResponse.json(successResponse({ namespaces: snapshots }));
    } catch (err) {
        return handleApiError(err);
    }
}
