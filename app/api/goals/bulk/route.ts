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

const BulkGoalSchema = z.array(CreateGoalSchema).min(1).max(5000);

export async function POST(req: NextRequest) {
  let payload: z.infer<typeof BulkGoalSchema> | undefined;
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch (err) {
    console.error("[api] Error parsing JSON body in POST /api/goals/bulk", {
      err,
      url: req.url,
      method: req.method,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON payload.",
        code: 400,
        debug: err instanceof Error ? err.message : String(err),
      },
      { status: 400 },
    );
  }

  const auth = await verifyAuth(req, WRITE_ROLES);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const parseResult = BulkGoalSchema.safeParse(rawBody);
  if (!parseResult.success) {
    console.error("[api] Zod validation failed in POST /api/goals/bulk", {
      errors: parseResult.error.format(),
      url: req.url,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Invalid goals payload.",
        code: 400,
        validation: parseResult.error.format(),
      },
      { status: 400 },
    );
  }

  payload = parseResult.data;

  try {
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

    // Expand ALL marker for superuser bulk operations.
    let expandedPayload = payload;
    const hasAllMarker = payload.some((goal) =>
      ["ALL", "*"].includes(goal.campusId?.toUpperCase?.() ?? ""),
    );
    if (hasAllMarker) {
      if (!isSuperuser) {
        return NextResponse.json(
          { success: false, error: "Cannot set all campuses unless superuser." },
          { status: 403 },
        );
      }

      const campuses = await db.campus.findMany({ select: { id: true } });
      const campusIds = campuses.map((c) => c.id);

      expandedPayload = payload.flatMap((goal) => {
        if (["ALL", "*"].includes(goal.campusId.toUpperCase())) {
          return campusIds.map((campusId) => ({ ...goal, campusId }));
        }
        return [goal];
      });
    }

    // Deduplicate by unique key to prevent accidental insert/update conflict.
    const makeKey = (goal: z.infer<typeof CreateGoalSchema>) =>
      `${goal.campusId}|${goal.templateMetricId}|${goal.year}|${goal.mode}|${goal.month ?? ""}`;

    const uniqueGoalsMap = new Map<string, z.infer<typeof CreateGoalSchema>>();
    for (const goal of expandedPayload) {
      uniqueGoalsMap.set(makeKey(goal), goal);
    }
    const uniqueGoals = Array.from(uniqueGoalsMap.values());

    const existing = await db.goal.findMany({
      where: {
        OR: uniqueGoals.map((goal) => ({
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
        uniqueGoals.map(async (goal) => {
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
  } catch (err) {
    console.error("[api] Error in POST /api/goals/bulk", {
      error: err,
      route: req.url,
      method: req.method,
      user: { id: auth.user?.id, role: auth.user?.role, campusId: auth.user?.campusId },
      payloadSample: Array.isArray(payload) ? payload.slice(0, 8) : payload,
    });

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid goals payload.",
          code: 400,
          validation: err.format(),
        },
        { status: 400 },
      );
    }

    const message = err instanceof Error ? err.message : "An unknown error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: "An internal error occurred while saving goals.",
        code: 500,
        debug: message,
      },
      { status: 500 },
    );
  }
}
