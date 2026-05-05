/**
 * GET /api/goals/automation
 *
 * Returns the resolved goal-automation configuration for the current actor:
 *   - growthWeekly / growthMonthly / growthYearly (decimal, e.g. 0.05 = +5%)
 *   - perMetric overrides (keyed by templateMetricId)
 *
 * The goal-setting form pulls this once on mount and uses
 * `computeAutomatedGoal({ priorAchieved, periodKind, ... })` to pre-fill
 * each input. Tooltip strings are constructed client-side from the result so
 * the UI can localise without a server round-trip.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";
import { loadAdminConfig } from "@/lib/data/adminConfig";
import { resolveGoalAutomationConfig } from "@/lib/data/goalAutomation";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        const snap = await loadAdminConfig("goalAutomation");
        const config = resolveGoalAutomationConfig(snap.payload as never);
        return NextResponse.json(successResponse({ config }));
    } catch (err) {
        return handleApiError(err);
    }
}
