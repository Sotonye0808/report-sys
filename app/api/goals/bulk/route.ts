/**
 * app/api/goals/bulk/route.ts
 * POST /api/goals/bulk — bulk create/update goals (atomic transaction)
 *
 * This endpoint exists to support bulk goal entry UI, allowing the client to
 * send all goal updates in one request. It performs all updates inside a
 * single database transaction (ACID) and will rollback if any item fails.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole, GoalMode } from "@/types/global";

const WRITE_ROLES: UserRole[] = [
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
  UserRole.SUPERADMIN,
];

const CreateGoalSchema = z.object({
  campusId: z.string().min(1),
  templateMetricId: z.string().min(1),
  metricName: z.string().min(1),
  mode: z.enum(["ANNUAL", "MONTHLY"]),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  targetValue: z.number().min(0),
});

const BulkGoalSchema = z.array(CreateGoalSchema).min(1).max(500);

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req, WRITE_ROLES);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const payload = BulkGoalSchema.parse(await req.json());

  const isSuperuser =
    auth.user.role === UserRole.SUPERADMIN ||
    auth.user.role === UserRole.SPO ||
    auth.user.role === UserRole.CEO ||
    auth.user.role === UserRole.CHURCH_MINISTRY;

  if (!isSuperuser) {
    // Non-superusers can only modify goals for their own campus.
    for (const goal of payload) {
      if (auth.user.campusId && goal.campusId !== auth.user.campusId) {
        return NextResponse.json(
          { success: false, error: "Cannot set goals for a different campus." },
          { status: 403 },
        );
      }
    }
  }

  // Normalize key to match unique constraint (month can be null)
  const makeKey = (goal: z.infer<typeof CreateGoalSchema>) =>
    `${goal.campusId}|${goal.templateMetricId}|${goal.year}|${goal.mode}|${goal.month ?? ""}`;

  const existing = await db.goal.findMany({
    where: {
      OR: payload.map((goal) => ({
        campusId: goal.campusId,
        templateMetricId: goal.templateMetricId,
        year: goal.year,
        mode: goal.mode,
        month: goal.month ?? null,
      })),
    },
  });

  const existingMap = new Map(existing.map((g) => [
    `${g.campusId}|${g.templateMetricId}|${g.year}|${g.mode}|${g.month ?? ""}`,
    g,
  ]));

  const results = await db.$transaction(async (tx) => {
    return Promise.all(
      payload.map(async (goal) => {
        const key = makeKey(goal);
        const existingGoal = existingMap.get(key);

        if (existingGoal && existingGoal.isLocked && !isSuperuser) {
          throw new Error("One or more goals are locked. Unlock them before saving.");
        }

        if (existingGoal) {
          return tx.goal.update({
            where: { id: existingGoal.id },
            data: {
              targetValue: goal.targetValue,
              metricName: goal.metricName,
              mode: goal.mode as GoalMode,
              year: goal.year,
              month: goal.month,
            },
          });
        }

        return tx.goal.create({
          data: {
            campusId: goal.campusId,
            templateMetricId: goal.templateMetricId,
            metricName: goal.metricName,
            mode: goal.mode as GoalMode,
            year: goal.year,
            month: goal.month,
            targetValue: goal.targetValue,
            isLocked: false,
            createdById: auth.user.id,
          },
        });
      }),
    );
  });

  return NextResponse.json({ success: true, data: results });
}
