/**
 * app/api/goals/for-report/route.ts
 * GET /api/goals/for-report?campusId=...&year=...&month=...
 *
 * Returns a map of { [templateMetricId]: { targetValue, isLocked, goalId } }
 * for the given campus + period combination.
 *
 * Resolution order (most-specific wins):
 *   1. Campus-level MONTHLY goal for exact month
 *   2. Campus-level ANNUAL goal for the year
 *   3. Group-level MONTHLY goal (inherited from campus's orgGroup)
 *   4. Group-level ANNUAL goal (inherited)
 *
 * If no goal exists for a metric, the metric is omitted from the map
 * (the form will show the field as empty / unset).
 *
 * This way every metric is scoped to its owning entity with no cross-group
 * conflicts: a campus goal always wins over its group goal, and goals are
 * never shared across sibling campuses from different groups.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole, GoalMode } from "@/types/global";

const READ_ROLES: UserRole[] = [
    UserRole.SUPERADMIN,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.CAMPUS_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.DATA_ENTRY,
];

const QuerySchema = z.object({
    campusId: z.string().min(1),
    year: z.coerce.number().int().min(2020).max(2100),
    month: z.coerce.number().int().min(1).max(12).optional(),
});

export interface GoalForMetric {
    goalId: string;
    targetValue: number;
    isLocked: boolean;
    source: "campus-monthly" | "campus-annual" | "group-monthly" | "group-annual";
}

export type GoalsForReportMap = Record<string, GoalForMetric>;

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req, READ_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const params = QuerySchema.safeParse(
        Object.fromEntries(new URL(req.url).searchParams),
    );
    if (!params.success) {
        return NextResponse.json(
            { success: false, error: "Invalid query parameters." },
            { status: 400 },
        );
    }

    const { campusId, year, month } = params.data;

    // Non-campus-level roles that are scoped to a campus can only query their own campus
    const isCampusScoped =
        auth.user.role === UserRole.CAMPUS_ADMIN ||
        auth.user.role === UserRole.CAMPUS_PASTOR ||
        auth.user.role === UserRole.DATA_ENTRY;

    if (isCampusScoped && auth.user.campusId && auth.user.campusId !== campusId) {
        return NextResponse.json(
            { success: false, error: "Cannot query goals for a different campus." },
            { status: 403 },
        );
    }

    // Resolve the campus to find its orgGroupId for group-level goal inheritance
    const campus = await db.campus.findUnique({ where: { id: campusId } });
    if (!campus) {
        return NextResponse.json(
            { success: false, error: "Campus not found." },
            { status: 404 },
        );
    }

    const orgGroupId = campus.parentId; // Campus.parentId is the OrgGroup id

    // Fetch all relevant goals in one pass (campus + group for the given year)
    const allGoals = await db.goal.findMany({
        where: {
            year,
            campusId: { in: [campusId, orgGroupId] },
        },
    });

    // Build resolution map: most-specific wins
    const result: GoalsForReportMap = {};

    // Helper: priority of each source (lower = higher priority)
    const PRIORITY: Record<GoalForMetric["source"], number> = {
        "campus-monthly": 1,
        "campus-annual": 2,
        "group-monthly": 3,
        "group-annual": 4,
    };

    for (const goal of allGoals) {
        const isCampusGoal = goal.campusId === campusId;
        const isGroupGoal = goal.campusId === orgGroupId;

        const isMonthly =
            goal.mode === GoalMode.MONTHLY && month != null && goal.month === month;
        const isAnnual = goal.mode === GoalMode.ANNUAL || goal.mode === GoalMode.CAMPUS_OVERRIDE;

        if (!isMonthly && !isAnnual) continue;

        let source: GoalForMetric["source"];
        if (isCampusGoal && isMonthly) source = "campus-monthly";
        else if (isCampusGoal && isAnnual) source = "campus-annual";
        else if (isGroupGoal && isMonthly) source = "group-monthly";
        else if (isGroupGoal && isAnnual) source = "group-annual";
        else continue;

        const existing = result[goal.templateMetricId];
        if (!existing || PRIORITY[source] < PRIORITY[existing.source]) {
            result[goal.templateMetricId] = {
                goalId: goal.id,
                targetValue: goal.targetValue,
                isLocked: goal.isLocked,
                source,
            };
        }
    }

    return NextResponse.json({ success: true, data: result });
}
