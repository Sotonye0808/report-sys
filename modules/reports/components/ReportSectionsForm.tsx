"use client";

/**
 * modules/reports/components/ReportSectionsForm.tsx
 *
 * Shared template-sections form for ReportNewPage and ReportEditPage.
 *
 * Features:
 *  - Config-driven metric rows (no repeated JSX)
 *  - Goals pre-seeded from the goals API — read-only goal fields
 *  - Optional comment field per value (goal, achieved, yoy)
 *  - Live statistics panel: % of goal, vs YoY, section completion progress
 *  - Goal source badge (campus-monthly / campus-annual / group / not set)
 */

import { useMemo, useState } from "react";
import { Collapse, InputNumber, Tag, Tooltip, Progress } from "antd";
import {
  CheckCircleOutlined,
  LockOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricFieldType, MetricCalculationType } from "@/types/global";
import type { GoalForMetric, GoalsForReportMap } from "@/app/api/goals/for-report/route";

const rk = CONTENT.reports as Record<string, unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** One metric's worth of editable + comment state */
export interface MetricValues {
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
  comment?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config-driven field descriptor for each capturable column
// ─────────────────────────────────────────────────────────────────────────────

interface FieldConfig {
  valueKey: keyof Pick<MetricValues, "monthlyGoal" | "monthlyAchieved" | "yoyGoal">;
  captureFlag: keyof Pick<
    ReportTemplateMetric,
    "capturesGoal" | "capturesAchieved" | "capturesYoY"
  >;
  labelKey: string;
  /** if true, value is pre-filled from the goals map and shown read-only */
  isGoalField: boolean;
}

const FIELD_CONFIGS: FieldConfig[] = [
  {
    valueKey: "monthlyGoal",
    captureFlag: "capturesGoal",
    labelKey: "fieldGoal",
    isGoalField: true,
  },
  {
    valueKey: "monthlyAchieved",
    captureFlag: "capturesAchieved",
    labelKey: "fieldAchieved",
    isGoalField: false,
  },
  {
    valueKey: "yoyGoal",
    captureFlag: "capturesYoY",
    labelKey: "fieldYoY",
    isGoalField: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Goal source badge config — object-driven
// ─────────────────────────────────────────────────────────────────────────────

const GOAL_SOURCE_LABELS: Record<GoalForMetric["source"], string> = {
  "campus-monthly": "Campus (monthly)",
  "campus-annual":  "Campus (annual)",
  "group-monthly":  "Group (monthly)",
  "group-annual":   "Group (annual)",
};

const GOAL_SOURCE_COLORS: Record<GoalForMetric["source"], string> = {
  "campus-monthly": "green",
  "campus-annual":  "blue",
  "group-monthly":  "orange",
  "group-annual":   "default",
};

// ─────────────────────────────────────────────────────────────────────────────
// Live-stats helpers
// ─────────────────────────────────────────────────────────────────────────────

function pct(achieved?: number, goal?: number): number | null {
  if (achieved == null || goal == null || goal === 0) return null;
  return Math.round((achieved / goal) * 100);
}

function pctStatus(p: number): "success" | "normal" | "exception" {
  if (p >= 100) return "success";
  if (p >= 70)  return "normal";
  return "exception";
}

function yoyDelta(achieved?: number, yoy?: number): number | null {
  if (achieved == null || yoy == null || yoy === 0) return null;
  return Math.round(((achieved - yoy) / yoy) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// CommentToggle — collapsible comment textarea
// ─────────────────────────────────────────────────────────────────────────────

interface CommentToggleProps {
  value?: string;
  onChange: (v: string) => void;
  label: string;
  disabled?: boolean;
}

function CommentToggle({ value, onChange, label, disabled }: CommentToggleProps) {
  const [open, setOpen] = useState(!!value);

  return (
    <div className="mt-1">
      <button
        type="button"
        className={`text-[11px] flex items-center gap-1 transition-colors ${
          value
            ? "text-ds-brand-accent font-medium"
            : "text-ds-text-subtle hover:text-ds-text-secondary"
        }`}
        onClick={() => setOpen((p) => !p)}
        disabled={disabled}
      >
        <CommentOutlined className="text-[10px]" />
        {value ? `${label} ✓` : label}
      </button>
      {open && (
        <textarea
          className="mt-1.5 w-full text-xs rounded-ds-md border border-ds-border-base bg-ds-surface px-2.5 py-2 text-ds-text-primary placeholder:text-ds-text-subtle resize-none focus:outline-none focus:ring-1 focus:ring-ds-brand-accent transition-shadow"
          rows={2}
          placeholder={rk.commentPlaceholder as string}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MetricRow
// ─────────────────────────────────────────────────────────────────────────────

interface MetricRowProps {
  metric: ReportTemplateMetric;
  values: MetricValues;
  goalInfo?: GoalForMetric;
  onChange: (v: MetricValues) => void;
  disabled?: boolean;
}

function MetricRow({ metric, values, goalInfo, onChange, disabled }: MetricRowProps) {
  const isCurrency = metric.fieldType === MetricFieldType.CURRENCY;
  const isPercentage = metric.fieldType === MetricFieldType.PERCENTAGE;
  const prefix = isCurrency ? "₦" : undefined;

  const activeFields = FIELD_CONFIGS.filter((f) => metric[f.captureFlag]);

  // Live stats
  const livePct  = pct(values.monthlyAchieved, values.monthlyGoal ?? goalInfo?.targetValue);
  const liveYoy  = yoyDelta(values.monthlyAchieved, values.yoyGoal);

  const colClass =
    activeFields.length >= 3
      ? "grid-cols-3"
      : activeFields.length === 2
        ? "grid-cols-2"
        : "grid-cols-1";

  return (
    <div className="py-4 border-b border-ds-border-subtle last:border-none">
      <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-6">
        {/* Metric label column */}
        <div className="md:w-52 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-ds-text-primary">{metric.name}</span>
            {metric.isRequired && (
              <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wide">
                {rk.sectionRequired as string}
              </span>
            )}
            {isCurrency && <Tag color="blue" className="text-[10px]">₦</Tag>}
            {isPercentage && <Tag color="purple" className="text-[10px]">%</Tag>}
          </div>
          {metric.description && (
            <p className="text-xs text-ds-text-subtle mt-0.5 leading-tight">{metric.description}</p>
          )}
          <span className="text-[10px] text-ds-text-subtle mt-1 inline-block">
            {metric.calculationType === MetricCalculationType.SUM
              ? "Σ cumulative"
              : metric.calculationType === MetricCalculationType.AVERAGE
                ? "∅ average"
                : "◎ snapshot"}
          </span>
          {/* Goal source badge */}
          {goalInfo && (
            <Tooltip title={`${rk.goalFromSource as string}: ${GOAL_SOURCE_LABELS[goalInfo.source]}`}>
              <Tag
                color={GOAL_SOURCE_COLORS[goalInfo.source]}
                className="mt-1 text-[10px] cursor-help"
                icon={goalInfo.isLocked ? <LockOutlined /> : <TrophyOutlined />}
              >
                {goalInfo.isLocked ? (rk.goalLocked as string) : GOAL_SOURCE_LABELS[goalInfo.source]}
              </Tag>
            </Tooltip>
          )}
          {!goalInfo && metric.capturesGoal && (
            <Tooltip title={rk.goalNotSet as string}>
              <Tag color="default" className="mt-1 text-[10px]">{rk.goalNotSet as string}</Tag>
            </Tooltip>
          )}
        </div>

        {/* Input / stats column */}
        {activeFields.length === 0 ? (
          <p className="text-xs text-ds-text-subtle italic self-center">
            {rk.sectionOptional as string}
          </p>
        ) : (
          <div className="flex-1 space-y-3">
            <div className={`grid ${colClass} gap-3`}>
              {activeFields.map(({ valueKey, labelKey, isGoalField }) => {
                const isGoalReadOnly = isGoalField && !!goalInfo;
                const displayValue = isGoalReadOnly
                  ? goalInfo!.targetValue
                  : (values[valueKey] as number | undefined);

                return (
                  <div key={valueKey}>
                    <label className="text-xs text-ds-text-subtle block mb-1">
                      {rk[labelKey] as string}
                      {isGoalReadOnly && (
                        <Tooltip title={rk.goalPrefilledTooltip as string}>
                          <InfoCircleOutlined className="ml-1 text-ds-brand-accent cursor-help" />
                        </Tooltip>
                      )}
                    </label>
                    <InputNumber
                      className="w-full"
                      prefix={prefix}
                      suffix={isPercentage ? "%" : undefined}
                      min={metric.minValue}
                      max={metric.maxValue}
                      value={displayValue}
                      disabled={disabled || isGoalReadOnly}
                      placeholder="0"
                      onChange={(v) =>
                        !isGoalReadOnly &&
                        onChange({ ...values, [valueKey]: v ?? undefined })
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* Single comment per metric */}
            <CommentToggle
              value={values.comment}
              onChange={(v) => onChange({ ...values, comment: v || undefined })}
              label={rk.metricComment as string}
              disabled={disabled}
            />

            {/* Live statistics row */}
            {(livePct !== null || liveYoy !== null) && (
              <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-ds-border-subtle">
                {livePct !== null && (
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <span className="text-[11px] text-ds-text-subtle whitespace-nowrap">
                      {rk.statVsGoal as string}
                    </span>
                    <div className="flex-1 min-w-[80px]">
                      <Progress
                        percent={Math.min(livePct, 100)}
                        size="small"
                        status={pctStatus(livePct)}
                        format={() => `${livePct}%`}
                        className="!mb-0"
                      />
                    </div>
                  </div>
                )}
                {liveYoy !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-ds-text-subtle">{rk.statVsYoY as string}</span>
                    <span className={`text-xs font-semibold ${liveYoy >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {liveYoy >= 0 ? "+" : ""}{liveYoy}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionPanel
// ─────────────────────────────────────────────────────────────────────────────

interface SectionPanelProps {
  section: ReportTemplateSection;
  metricValues: Record<string, MetricValues>;
  goalsMap: GoalsForReportMap;
  onMetricChange: (metricId: string, v: MetricValues) => void;
  disabled?: boolean;
}

function SectionPanel({ section, metricValues, goalsMap, onMetricChange, disabled }: SectionPanelProps) {
  const requiredMetrics = section.metrics.filter((m) => m.isRequired && m.capturesAchieved);
  const filledRequired  = requiredMetrics.filter(
    (m) => (metricValues[m.id]?.monthlyAchieved ?? 0) > 0,
  ).length;

  return (
    <div>
      {requiredMetrics.length > 0 && (
        <div className="pb-3 border-b border-ds-border-subtle mb-1">
          <Progress
            percent={Math.round((filledRequired / requiredMetrics.length) * 100)}
            size="small"
            format={() => `${filledRequired}/${requiredMetrics.length} ${rk.requiredFilled as string}`}
            status={filledRequired === requiredMetrics.length ? "success" : "active"}
            className="!mb-0"
          />
        </div>
      )}
      {section.metrics.length === 0 ? (
        <p className="text-sm text-ds-text-subtle py-4 text-center">No metrics in this section.</p>
      ) : (
        [...section.metrics]
          .sort((a, b) => a.order - b.order)
          .map((metric) => (
            <MetricRow
              key={metric.id}
              metric={metric}
              values={metricValues[metric.id] ?? {}}
              goalInfo={goalsMap[metric.id]}
              onChange={(v) => onMetricChange(metric.id, v)}
              disabled={disabled}
            />
          ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LiveStatsPanel — overall form-level stats
// ─────────────────────────────────────────────────────────────────────────────

interface LiveStatsPanelProps {
  template: ReportTemplate;
  metricValues: Record<string, MetricValues>;
  goalsMap: GoalsForReportMap;
}

function LiveStatsPanel({ template, metricValues, goalsMap }: LiveStatsPanelProps) {
  const stats = useMemo(() => {
    let totalAchieved = 0;
    let totalGoal     = 0;
    let totalYoy      = 0;
    let metricsWithGoal = 0;

    for (const section of template.sections) {
      for (const metric of section.metrics) {
        if (!metric.capturesAchieved) continue;
        if (metric.calculationType !== MetricCalculationType.SUM) continue;
        const vals     = metricValues[metric.id] ?? {};
        const achieved = vals.monthlyAchieved ?? 0;
        const goal     = vals.monthlyGoal ?? goalsMap[metric.id]?.targetValue ?? 0;
        const yoy      = vals.yoyGoal ?? 0;
        totalAchieved += achieved;
        totalGoal     += goal;
        totalYoy      += yoy;
        if (goal > 0) metricsWithGoal++;
      }
    }
    return { totalAchieved, totalGoal, totalYoy, metricsWithGoal };
  }, [template, metricValues, goalsMap]);

  const overallPct  = stats.totalGoal > 0 ? Math.round((stats.totalAchieved / stats.totalGoal) * 100) : null;
  const yoyDeltaVal = stats.totalYoy  > 0 ? Math.round(((stats.totalAchieved - stats.totalYoy) / stats.totalYoy) * 100) : null;

  if (overallPct === null && yoyDeltaVal === null && stats.metricsWithGoal === 0) return null;

  return (
    <div className="p-4 bg-ds-surface-elevated rounded-ds-xl border border-ds-border-base">
      <div className="flex items-center gap-2 mb-3">
        <BulbOutlined className="text-ds-brand-accent" />
        <span className="text-xs font-semibold text-ds-text-primary uppercase tracking-wide">
          {rk.liveStats as string}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {overallPct !== null && (
          <div>
            <div className="text-[11px] text-ds-text-subtle mb-1">{rk.statOverallGoal as string}</div>
            <Progress
              percent={Math.min(overallPct, 100)}
              status={pctStatus(overallPct)}
              format={() => `${overallPct}%`}
            />
          </div>
        )}
        {yoyDeltaVal !== null && (
          <div>
            <div className="text-[11px] text-ds-text-subtle mb-1">{rk.statYoYGrowth as string}</div>
            <div className={`text-2xl font-bold font-ds-mono ${yoyDeltaVal >= 0 ? "text-green-500" : "text-red-500"}`}>
              {yoyDeltaVal >= 0 ? "+" : ""}{yoyDeltaVal}%
            </div>
          </div>
        )}
        {stats.metricsWithGoal > 0 && (
          <div>
            <div className="text-[11px] text-ds-text-subtle mb-1">{rk.statMetricsWithGoal as string}</div>
            <div className="text-2xl font-bold font-ds-mono text-ds-text-primary">
              {stats.metricsWithGoal}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReportSectionsForm — main export
// ─────────────────────────────────────────────────────────────────────────────

interface ReportSectionsFormProps {
  template: ReportTemplate;
  metricValues: Record<string, MetricValues>;
  goalsMap: GoalsForReportMap;
  onMetricChange: (metricId: string, v: MetricValues) => void;
  disabled?: boolean;
}

export function ReportSectionsForm({
  template,
  metricValues,
  goalsMap,
  onMetricChange,
  disabled,
}: ReportSectionsFormProps) {
  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);

  const collapseItems = sortedSections.map((section) => ({
    key: section.id,
    label: (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ds-text-primary">{section.name}</span>
        {section.isRequired ? (
          <Tag color="red" className="text-[10px]">{rk.sectionRequired as string}</Tag>
        ) : (
          <Tag color="default" className="text-[10px]">{rk.sectionOptional as string}</Tag>
        )}
        <span className="text-xs text-ds-text-subtle ml-auto">
          {section.metrics.length} metric{section.metrics.length !== 1 ? "s" : ""}
        </span>
      </div>
    ),
    children: (
      <SectionPanel
        section={section}
        metricValues={metricValues}
        goalsMap={goalsMap}
        onMetricChange={onMetricChange}
        disabled={disabled}
      />
    ),
  }));

  const totalMetrics = template.sections.reduce((n, s) => n + s.metrics.length, 0);
  const goalsCount   = Object.keys(goalsMap).length;

  return (
    <div className="space-y-4">
      {/* Template + goals info banner */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-ds-surface rounded-ds-lg border border-ds-border-subtle text-xs text-ds-text-subtle">
        <CheckCircleOutlined className="text-ds-brand-accent" />
        <span>
          {rk.templateLabel as string}:{" "}
          <strong className="text-ds-text-primary">{template.name}</strong>
          {" · "}{template.sections.length} sections{" · "}{totalMetrics} metrics
        </span>
        {goalsCount > 0 && (
          <>
            <span className="text-ds-border-base">|</span>
            <span className="flex items-center gap-1">
              <TrophyOutlined className="text-ds-brand-accent" />
              {goalsCount} metric{goalsCount !== 1 ? "s" : ""} {rk.goalsPrefilledBadge as string}
            </span>
          </>
        )}
        {goalsCount === 0 && (
          <>
            <span className="text-ds-border-base">|</span>
            <span className="flex items-center gap-1 text-yellow-500">
              <InfoCircleOutlined />
              {rk.noGoalsSet as string}
            </span>
          </>
        )}
      </div>

      {/* Live stats panel */}
      <LiveStatsPanel template={template} metricValues={metricValues} goalsMap={goalsMap} />

      {/* Section collapse panels */}
      <div>
        <h2 className="text-xs font-semibold text-ds-text-secondary uppercase tracking-wide mb-3 px-1">
          {rk.metricsFormTitle as string}
        </h2>
        {collapseItems.length > 0 ? (
          <Collapse
            items={collapseItems}
            defaultActiveKey={collapseItems.map((i) => i.key)}
            className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl overflow-hidden"
          />
        ) : (
          <EmptyState title="No template sections" description="This template has no sections." />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: build sections payload for API
// ─────────────────────────────────────────────────────────────────────────────

export function buildSectionsPayload(
  template: ReportTemplate,
  metricValues: Record<string, MetricValues>,
  goalsMap: GoalsForReportMap = {},
) {
  return [...template.sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      templateSectionId: section.id,
      sectionName: section.name,
      metrics: [...section.metrics]
        .sort((a, b) => a.order - b.order)
        .map((metric) => {
          const vals = metricValues[metric.id] ?? {};
          const goal = goalsMap[metric.id];
          return {
            templateMetricId: metric.id,
            metricName: metric.name,
            calculationType: metric.calculationType,
            isLocked: false,
            monthlyGoal: goal?.targetValue ?? vals.monthlyGoal,
            monthlyAchieved: vals.monthlyAchieved,
            yoyGoal: vals.yoyGoal,
            comment: vals.comment,
          };
        }),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: parse existing report sections → metricValues map
// ─────────────────────────────────────────────────────────────────────────────

export function parseSectionsToMetricValues(sections: unknown[]): Record<string, MetricValues> {
  const map: Record<string, MetricValues> = {};
  const typedSections = sections as Array<{
    templateSectionId: string;
    metrics: Array<{
      templateMetricId: string;
      monthlyGoal?: number;
      monthlyAchieved?: number;
      yoyGoal?: number;
      comment?: string;
    }>;
  }>;
  for (const sec of typedSections) {
    for (const m of sec.metrics ?? []) {
      map[m.templateMetricId] = {
        monthlyGoal:     m.monthlyGoal,
        monthlyAchieved: m.monthlyAchieved,
        yoyGoal:         m.yoyGoal,
        comment:         m.comment,
      };
    }
  }
  return map;
}

export type { GoalsForReportMap, GoalForMetric };
