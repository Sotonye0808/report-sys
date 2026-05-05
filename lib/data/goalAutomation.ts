/**
 * lib/data/goalAutomation.ts
 *
 * Pure helpers used by goal-setting forms + analytics tooltips to derive an
 * automated goal value from the previous period's achieved value.
 *
 * Default growth parameters live in the `goalAutomation` admin-config
 * namespace (DB-first → typed fallback in `config/content.ts` /
 * `lib/data/adminConfig.ts`). Per-metric overrides take precedence.
 *
 * Contract:
 *   - WoW: prior-week achieved × (1 + growthWeekly)
 *   - MoM: prior-month achieved × (1 + growthMonthly)
 *   - YoY: prior-year achieved × (1 + growthYearly)
 *
 * The form pre-fills the suggested value AND keeps the user-editable; tooltip
 * surfaces the source ("from week 17 (was 245), +5% growth").
 *
 * Non-blocking: when no prior value exists the helper returns null and the
 * form falls back to whatever default the legacy goal flow used (typically
 * the previous month's value or zero).
 */

export type GoalPeriodKind = "WEEKLY" | "MONTHLY" | "YEARLY";

export interface GoalAutomationParams {
    /** Decimal growth (0.05 = +5%). */
    growthWeekly: number;
    growthMonthly: number;
    growthYearly: number;
}

export interface GoalAutomationConfig extends GoalAutomationParams {
    /** Per-metric overrides. Keyed by templateMetricId. */
    perMetric?: Record<string, Partial<GoalAutomationParams>>;
}

export const DEFAULT_GOAL_AUTOMATION: GoalAutomationConfig = {
    // 5% week-on-week, 8% month-on-month, 15% year-on-year — sensible church-
    // attendance defaults that admins are expected to tune via admin-config.
    growthWeekly: 0.05,
    growthMonthly: 0.08,
    growthYearly: 0.15,
    perMetric: {},
};

export interface AutomatedGoalInput {
    /** Period kind we're projecting forward to. */
    periodKind: GoalPeriodKind;
    /** Prior-period achieved value. null/undefined => no automation. */
    priorAchieved: number | null | undefined;
    /** Prior period's human-readable label, used in the tooltip ("Week 17, 2026"). */
    priorLabel?: string;
    /** Optional per-metric override key. */
    templateMetricId?: string;
    /** Live config snapshot. */
    config?: GoalAutomationConfig;
}

export interface AutomatedGoalResult {
    /** The suggested goal value, rounded to integer. null when no prior value. */
    value: number | null;
    /** Decimal growth applied (0.05 = +5%). */
    appliedGrowth: number;
    /** Free-form sentence the form/analytics renders in the tooltip. */
    tooltip: string;
    /** Truthy when the field was pre-filled by automation. */
    fromAutomation: boolean;
}

function pickGrowth(
    cfg: GoalAutomationConfig,
    kind: GoalPeriodKind,
    metricId?: string,
): number {
    const baseKey =
        kind === "WEEKLY" ? "growthWeekly" : kind === "MONTHLY" ? "growthMonthly" : "growthYearly";
    const perMetric = metricId ? cfg.perMetric?.[metricId] : undefined;
    const perMetricVal = perMetric?.[baseKey];
    if (typeof perMetricVal === "number" && Number.isFinite(perMetricVal)) {
        return perMetricVal;
    }
    return cfg[baseKey];
}

function periodKindLabel(kind: GoalPeriodKind): string {
    switch (kind) {
        case "WEEKLY":
            return "week-on-week";
        case "MONTHLY":
            return "month-on-month";
        case "YEARLY":
            return "year-on-year";
    }
}

/**
 * Compute the suggested automated goal for a single metric.
 *
 * `value` is null when no automation can be applied; in that case the form
 * should leave the input empty (or fall back to whatever default it had
 * previously) and the tooltip should explain why.
 */
export function computeAutomatedGoal(input: AutomatedGoalInput): AutomatedGoalResult {
    const cfg = input.config ?? DEFAULT_GOAL_AUTOMATION;
    const growth = pickGrowth(cfg, input.periodKind, input.templateMetricId);

    if (typeof input.priorAchieved !== "number" || !Number.isFinite(input.priorAchieved)) {
        return {
            value: null,
            appliedGrowth: growth,
            tooltip: `No ${periodKindLabel(input.periodKind)} reference value — automated goal unavailable. Enter a value manually.`,
            fromAutomation: false,
        };
    }

    const projected = input.priorAchieved * (1 + growth);
    // Round to integer for headcount-style metrics; admins can post-edit.
    const rounded = Math.round(projected);
    const growthPct = Math.round(growth * 100);
    const sourceLabel = input.priorLabel ? ` (${input.priorLabel})` : "";

    return {
        value: rounded,
        appliedGrowth: growth,
        tooltip:
            `Auto-prefilled from prior ${periodKindLabel(input.periodKind)} value of ${input.priorAchieved}${sourceLabel}, ` +
            `with +${growthPct}% growth applied. You can override.`,
        fromAutomation: true,
    };
}

/**
 * Adopt admin-config payload into the typed shape, merging with defaults so
 * unspecified fields stay safe.
 */
export function resolveGoalAutomationConfig(
    snapshot: Partial<GoalAutomationConfig> | null | undefined,
): GoalAutomationConfig {
    if (!snapshot) return DEFAULT_GOAL_AUTOMATION;
    const merged: GoalAutomationConfig = {
        growthWeekly: typeof snapshot.growthWeekly === "number" ? snapshot.growthWeekly : DEFAULT_GOAL_AUTOMATION.growthWeekly,
        growthMonthly: typeof snapshot.growthMonthly === "number" ? snapshot.growthMonthly : DEFAULT_GOAL_AUTOMATION.growthMonthly,
        growthYearly: typeof snapshot.growthYearly === "number" ? snapshot.growthYearly : DEFAULT_GOAL_AUTOMATION.growthYearly,
        perMetric: snapshot.perMetric ?? {},
    };
    return merged;
}
