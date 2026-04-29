/**
 * GET /api/admin-config/public
 *
 * Returns the admin-tunable bits that the client needs to render correctly:
 * role labels + capability flags, hierarchy levels, dashboard layout, PWA copy.
 *
 * Available to any authenticated user — does NOT expose any sensitive
 * configuration. Sensitive namespaces (e.g. `imports.maxFileBytes`) stay
 * behind the superadmin-only `/api/admin-config` endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import {
    resolveRoleConfigMap,
    resolveHierarchyLevels,
} from "@/lib/auth/permissions";
import { loadAdminConfig } from "@/lib/data/adminConfig";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const [roleMap, hierarchy, dashboardLayout, pwaInstall] = await Promise.all([
            resolveRoleConfigMap(),
            resolveHierarchyLevels(),
            loadAdminConfig("dashboardLayout"),
            loadAdminConfig("pwaInstall"),
        ]);
        return NextResponse.json(
            successResponse({
                roles: roleMap,
                hierarchy,
                dashboardLayout: dashboardLayout.payload,
                pwaInstall: pwaInstall.payload,
            }),
        );
    } catch (err) {
        return handleApiError(err);
    }
}
