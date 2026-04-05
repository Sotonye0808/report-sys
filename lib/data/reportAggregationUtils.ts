import { MetricCalculationType, UserRole } from "@/types/global";

export function computeAggregatedValues(input: {
  calculationType: MetricCalculationType | "SUM" | "AVERAGE" | "SNAPSHOT";
  goalSum: number;
  achievedSum: number;
  yoySum: number;
  count: number;
  snapshot?: { monthlyGoal: number; monthlyAchieved: number; yoyGoal: number } | null;
}) {
  if (input.count === 0) {
    return {
      monthlyGoal: 0,
      monthlyAchieved: 0,
      yoyGoal: 0,
    };
  }

  if (input.calculationType === MetricCalculationType.AVERAGE) {
    return {
      monthlyGoal: input.goalSum / input.count,
      monthlyAchieved: input.achievedSum / input.count,
      yoyGoal: input.yoySum / input.count,
    };
  }

  if (input.calculationType === MetricCalculationType.SNAPSHOT) {
    return {
      monthlyGoal: input.snapshot?.monthlyGoal ?? 0,
      monthlyAchieved: input.snapshot?.monthlyAchieved ?? 0,
      yoyGoal: input.snapshot?.yoyGoal ?? 0,
    };
  }

  return {
    monthlyGoal: input.goalSum,
    monthlyAchieved: input.achievedSum,
    yoyGoal: input.yoySum,
  };
}

export function enforceAggregationScope(input: {
  user: AuthUser;
  scopeType: "campus" | "group" | "all";
  scopeId?: string;
  resolvedScopeCampusIds?: string[] | null;
}) {
  const { user, scopeType, scopeId, resolvedScopeCampusIds } = input;
  if (!user || !user.role) throw new Error("Unauthorized");

  if (user.role === UserRole.CAMPUS_ADMIN || user.role === UserRole.CAMPUS_PASTOR) {
    if (scopeType !== "campus" || scopeId !== user.campusId) {
      throw new Error("Campus roles can only aggregate their own campus.");
    }
  }

  if (user.role === UserRole.GROUP_ADMIN || user.role === UserRole.GROUP_PASTOR) {
    if (scopeType === "group" && scopeId !== user.orgGroupId) {
      throw new Error("Group roles can only aggregate their own group.");
    }
    if (scopeType === "campus") {
      const allowedCampusIds = resolvedScopeCampusIds ?? [];
      if (!scopeId || !allowedCampusIds.includes(scopeId)) {
        throw new Error("Group roles can only aggregate campuses in their own group.");
      }
    }
  }
}
