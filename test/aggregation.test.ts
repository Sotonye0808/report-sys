import assert from "node:assert";
import { describe, it } from "node:test";
import {
  computeAggregatedValues,
  enforceAggregationScope,
} from "../lib/data/reportAggregationUtils";
import {
  MetricCalculationType,
  UserRole,
} from "../types/global.js";

describe("aggregation calculations", () => {
  it("computes SUM values by summing source values", () => {
    const result = computeAggregatedValues({
      calculationType: MetricCalculationType.SUM,
      goalSum: 100,
      achievedSum: 80,
      yoySum: 60,
      count: 2,
    });
    assert.deepStrictEqual(result, {
      monthlyGoal: 100,
      monthlyAchieved: 80,
      yoyGoal: 60,
    });
  });

  it("computes AVERAGE values by count", () => {
    const result = computeAggregatedValues({
      calculationType: MetricCalculationType.AVERAGE,
      goalSum: 100,
      achievedSum: 80,
      yoySum: 60,
      count: 4,
    });
    assert.deepStrictEqual(result, {
      monthlyGoal: 25,
      monthlyAchieved: 20,
      yoyGoal: 15,
    });
  });

  it("computes SNAPSHOT values from latest snapshot", () => {
    const result = computeAggregatedValues({
      calculationType: MetricCalculationType.SNAPSHOT,
      goalSum: 100,
      achievedSum: 80,
      yoySum: 60,
      count: 3,
      snapshot: {
        monthlyGoal: 44,
        monthlyAchieved: 33,
        yoyGoal: 22,
      },
    });
    assert.deepStrictEqual(result, {
      monthlyGoal: 44,
      monthlyAchieved: 33,
      yoyGoal: 22,
    });
  });
});

describe("aggregation scope behavior", () => {
  it("allows campus role only for own campus", () => {
    const user = {
      id: "u1",
      email: "campus@example.com",
      firstName: "Campus",
      lastName: "Admin",
      role: UserRole.CAMPUS_ADMIN,
      campusId: "campus-1",
    };

    enforceAggregationScope({
      user,
      scopeType: "campus",
      scopeId: "campus-1",
      resolvedScopeCampusIds: ["campus-1"],
    });

    assert.throws(() =>
      enforceAggregationScope({
        user,
        scopeType: "campus",
        scopeId: "campus-2",
        resolvedScopeCampusIds: ["campus-1"],
      }),
    );
  });

  it("allows group role campus scope only inside group campuses", () => {
    const user = {
      id: "u2",
      email: "group@example.com",
      firstName: "Group",
      lastName: "Pastor",
      role: UserRole.GROUP_PASTOR,
      orgGroupId: "group-1",
    };

    enforceAggregationScope({
      user,
      scopeType: "campus",
      scopeId: "campus-a",
      resolvedScopeCampusIds: ["campus-a", "campus-b"],
    });

    assert.throws(() =>
      enforceAggregationScope({
        user,
        scopeType: "campus",
        scopeId: "campus-z",
        resolvedScopeCampusIds: ["campus-a", "campus-b"],
      }),
    );
  });
});
