/**
 * POST /api/form-assignments/materialise
 *
 * Idempotently expands FormAssignmentRule rows that target the calling user
 * (by id or by role+scope) into FormAssignment rows for the current period,
 * ensuring the underlying report shell exists.
 *
 * Called by QuickFormLandingPage on mount before listing assignments.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { materialiseAssignmentsForUser } from "@/lib/data/recurringAssignmentService";
import { UserRole } from "@/types/global";

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const out = await materialiseAssignmentsForUser({
            userId: auth.user.id,
            role: auth.user.role as UserRole,
            campusId: auth.user.campusId,
            orgGroupId: auth.user.orgGroupId,
        });
        return NextResponse.json(successResponse({ assignments: out, count: out.length }));
    } catch (err) {
        return handleApiError(err);
    }
}
