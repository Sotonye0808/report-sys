import assert from "node:assert";
import { describe, it } from "node:test";

import {
    computeAutomatedGoal,
    resolveGoalAutomationConfig,
    DEFAULT_GOAL_AUTOMATION,
    type GoalAutomationConfig,
} from "../lib/data/goalAutomation";

describe("computeAutomatedGoal", () => {
    it("applies the configured weekly growth", () => {
        const out = computeAutomatedGoal({
            periodKind: "WEEKLY",
            priorAchieved: 200,
            priorLabel: "Week 17, 2026",
        });
        assert.strictEqual(out.value, 210); // 200 * 1.05
        assert.strictEqual(out.appliedGrowth, 0.05);
        assert.strictEqual(out.fromAutomation, true);
        assert.match(out.tooltip, /Week 17, 2026/);
        assert.match(out.tooltip, /\+5%/);
    });

    it("applies monthly growth when periodKind is MONTHLY", () => {
        const out = computeAutomatedGoal({ periodKind: "MONTHLY", priorAchieved: 1000 });
        assert.strictEqual(out.value, 1080); // 1000 * 1.08
    });

    it("applies yearly growth when periodKind is YEARLY", () => {
        const out = computeAutomatedGoal({ periodKind: "YEARLY", priorAchieved: 4000 });
        assert.strictEqual(out.value, 4600); // 4000 * 1.15
    });

    it("returns null + helpful tooltip when no prior value exists", () => {
        const out = computeAutomatedGoal({ periodKind: "WEEKLY", priorAchieved: null });
        assert.strictEqual(out.value, null);
        assert.strictEqual(out.fromAutomation, false);
        assert.match(out.tooltip, /No week-on-week reference/);
    });

    it("respects per-metric overrides via the config arg", () => {
        const cfg: GoalAutomationConfig = {
            ...DEFAULT_GOAL_AUTOMATION,
            perMetric: { "metric-a": { growthMonthly: 0.2 } },
        };
        const out = computeAutomatedGoal({
            periodKind: "MONTHLY",
            priorAchieved: 100,
            templateMetricId: "metric-a",
            config: cfg,
        });
        assert.strictEqual(out.value, 120); // 100 * 1.20
        assert.strictEqual(out.appliedGrowth, 0.2);
    });

    it("falls back to base growth for metrics without per-metric override", () => {
        const cfg: GoalAutomationConfig = {
            ...DEFAULT_GOAL_AUTOMATION,
            perMetric: { "metric-a": { growthMonthly: 0.2 } },
        };
        const out = computeAutomatedGoal({
            periodKind: "MONTHLY",
            priorAchieved: 100,
            templateMetricId: "metric-b",
            config: cfg,
        });
        assert.strictEqual(out.value, 108); // 100 * 1.08 (default)
    });
});

describe("resolveGoalAutomationConfig", () => {
    it("returns defaults when snapshot is null", () => {
        const out = resolveGoalAutomationConfig(null);
        assert.deepStrictEqual(out, DEFAULT_GOAL_AUTOMATION);
    });

    it("merges partial snapshot with defaults", () => {
        const out = resolveGoalAutomationConfig({ growthWeekly: 0.1 });
        assert.strictEqual(out.growthWeekly, 0.1);
        assert.strictEqual(out.growthMonthly, DEFAULT_GOAL_AUTOMATION.growthMonthly);
    });

    it("preserves perMetric overrides from the snapshot", () => {
        const out = resolveGoalAutomationConfig({
            perMetric: { m1: { growthYearly: 0.25 } },
        });
        assert.strictEqual(out.perMetric?.m1.growthYearly, 0.25);
    });
});
