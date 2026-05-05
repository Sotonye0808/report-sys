/**
 * POST /api/admin-config/reconcile
 *
 * Idempotent migration of legacy data into the polymorphic OrgUnit + Role
 * substrate. Used as the "dry update" action in Admin Config:
 *
 *   - DRY:   `POST /api/admin-config/reconcile?dry=true`
 *     Computes what would be back-filled WITHOUT writing. Returns the same
 *     report shape as a real run so the UI can preview the impact.
 *   - LIVE:  `POST /api/admin-config/reconcile`
 *     Performs the back-fill. Re-runnable: never overwrites populated values.
 *
 * SUPERADMIN-only. Existing campus + group rows are NEVER overwritten —
 * we only write to the new tables and back-fill nullable columns.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import {
    successResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole } from "@/types/global";
import { reconcileSubstrate } from "@/lib/data/reconcile";
import { invalidateOrgUnitGraphCache } from "@/lib/data/orgUnitMatcher";

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        if (auth.user.role !== UserRole.SUPERADMIN) {
            return NextResponse.json(forbiddenResponse("Reconcile is SUPERADMIN-only"), {
                status: 403,
            });
        }
        const url = new URL(req.url);
        const dryRun = url.searchParams.get("dry") === "true";
        const report = await reconcileSubstrate({ dryRun });
        if (!dryRun) {
            invalidateOrgUnitGraphCache();
        }
        return NextResponse.json(successResponse(report));
    } catch (err) {
        return handleApiError(err);
    }
}
