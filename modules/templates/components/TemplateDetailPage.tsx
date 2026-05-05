"use client";

/**
 * modules/templates/components/TemplateDetailPage.tsx
 * View and edit an existing report template — sections → metrics structure.
 * SUPERADMIN only.
 */

import { useState, useEffect, useMemo, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Modal, Switch, Select, Tag, Collapse, Badge, Tabs, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { TemplateAssignmentsEditor } from "./TemplateAssignmentsEditor";
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  DragOutlined,
  TrophyOutlined,
  SettingOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { useFormPersistence } from "@/lib/hooks/useFormPersistence";
import { offlineFetch } from "@/lib/utils/offlineFetch";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { MetricFieldType, MetricCalculationType, ReportDeadlinePolicy } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const FIELD_TYPE_OPTIONS = [
  { value: MetricFieldType.NUMBER, label: "Number" },
  { value: MetricFieldType.PERCENTAGE, label: "Percentage (%)" },
  { value: MetricFieldType.CURRENCY, label: "Currency" },
  { value: MetricFieldType.TEXT, label: "Text" },
];

const CALC_TYPE_OPTIONS = [
  { value: MetricCalculationType.SUM, label: "Sum (cumulative)" },
  { value: MetricCalculationType.AVERAGE, label: "Average (rolling mean)" },
  { value: MetricCalculationType.SNAPSHOT, label: "Snapshot (last value)" },
];

const DEADLINE_POLICY_OPTIONS = [
  { value: ReportDeadlinePolicy.PERIOD_START, label: "Beginning of period" },
  { value: ReportDeadlinePolicy.PERIOD_MIDDLE, label: "Middle of period" },
  { value: ReportDeadlinePolicy.PERIOD_END, label: "End of period" },
  { value: ReportDeadlinePolicy.AFTER_PERIOD_HOURS, label: "Fixed hours after period end" },
];

interface DraftMetric {
  id: string;
  name: string;
  description: string;
  fieldType: MetricFieldType;
  calculationType: MetricCalculationType;
  isRequired: boolean;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
  capturesWoW: boolean;
  correlationGroup: string;
  isAutoTotal: boolean;
  autoTotalSourceMetricIds: string[];
  autoTotalScope: "SECTION" | "TEMPLATE";
  order: number;
}

interface DraftSection {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  correlationGroup: string;
  order: number;
  metrics: DraftMetric[];
}

type TemplateWithMeta = ReportTemplate & { isDefault?: boolean; isArchived?: boolean };

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MetricRowProps {
  metric: DraftMetric;
  onChange: (patch: Partial<DraftMetric>) => void;
  onRemove: () => void;
}

function MetricRow({
  metric,
  onChange,
  onRemove,
  sectionMetrics,
  allSections,
}: MetricRowProps & { sectionMetrics: DraftMetric[]; allSections: DraftSection[] }) {
  type BoolKey = "isRequired" | "capturesGoal" | "capturesAchieved" | "capturesYoY" | "capturesWoW";
  const TOGGLES: { key: BoolKey; label: string; tip: string }[] = [
    {
      key: "isRequired",
      label: CONTENT.templates.isRequiredLabel as string,
      tip: "Required metrics must be filled before the report can be submitted.",
    },
    {
      key: "capturesGoal",
      label: CONTENT.templates.capturesGoalLabel as string,
      tip: "Show a goal field on the form. Goals can auto-prefill from the previous period — see Goal Automation in Admin Config.",
    },
    {
      key: "capturesAchieved",
      label: CONTENT.templates.capturesAchievedLabel as string,
      tip: "Show an achieved-value field on the form (the actual measurement).",
    },
    {
      key: "capturesYoY",
      label: CONTENT.templates.capturesYoYLabel as string,
      tip: "Compare against the same period last year. Non-blocking — silently degrades when no prior-year report exists.",
    },
    {
      key: "capturesWoW",
      label: "Week-on-Week",
      tip: "Compare against the same metric in the prior week. Non-blocking — only shows when a prior-week report exists.",
    },
  ];

  // sectionMetrics + allSections passed for context. Both correlation group
  // and auto-sum configuration were promoted to dedicated section-level
  // panels (`CorrelationGroupsPanel`, `AutoSumPanel`) so the per-metric row
  // stays focused on data-entry fields.
  void sectionMetrics;
  void allSections;

  // Settings panel hidden by default — Forms/Zoho-style blank canvas.
  // The row collapses to JUST the borderless name input + settings/delete icons
  // until the admin opts in to configuration.
  const [settingsOpen, setSettingsOpen] = useState(false);

  // A small pill-strip summary of which captures are active, so the
  // collapsed row still gives a quick read of what's configured.
  const activeCaptures = TOGGLES.filter((t) => Boolean(metric[t.key])).map((t) => t.label);

  return (
    <div
      className={[
        "rounded-ds-lg border bg-ds-surface-elevated transition-shadow",
        settingsOpen
          ? "border-ds-brand-accent/40 shadow-ds-sm"
          : "border-ds-border-subtle hover:shadow-ds-sm",
      ].join(" ")}
    >
      {/* Default state: bare inline name input + collapsed settings cog */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Input
          value={metric.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Untitled metric"
          variant="borderless"
          className="!text-base !font-medium !text-ds-text-primary !px-0 flex-1"
          aria-label="Metric name"
        />
        {activeCaptures.length > 0 && !settingsOpen && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-ds-text-subtle">
            {activeCaptures.slice(0, 3).map((c) => (
              <Tag key={c} className="!m-0 !text-[10px]">{c}</Tag>
            ))}
            {activeCaptures.length > 3 && (
              <Tag className="!m-0 !text-[10px]">+{activeCaptures.length - 3}</Tag>
            )}
          </span>
        )}
        <Tooltip title={settingsOpen ? "Close settings" : "Open settings"}>
          <Button
            type="text"
            size="small"
            icon={settingsOpen ? <CloseOutlined /> : <SettingOutlined />}
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label={settingsOpen ? "Close metric settings" : "Open metric settings"}
            aria-expanded={settingsOpen ? "true" : "false"}
          />
        </Tooltip>
        <Tooltip title="Remove this metric">
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={onRemove}
            aria-label="Remove metric"
          />
        </Tooltip>
      </div>

      {/* Settings palette — only when toggled open */}
      {settingsOpen && (
        <div className="px-3 pb-3 pt-0 border-t border-ds-border-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="flex flex-col gap-1">
              <Tooltip title="Field type controls how the value is rendered + validated on the form (number / percentage / currency / text).">
                <span className="text-[11px] text-ds-text-subtle inline-flex items-center gap-1">
                  {CONTENT.templates.fieldTypeLabel as string}
                  <InfoCircleOutlined />
                </span>
              </Tooltip>
              <Select
                size="middle"
                value={metric.fieldType}
                options={FIELD_TYPE_OPTIONS}
                onChange={(v) => onChange({ fieldType: v })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Tooltip title="How aggregated reports combine values across periods: Sum (cumulative), Average (rolling mean), or Snapshot (latest value).">
                <span className="text-[11px] text-ds-text-subtle inline-flex items-center gap-1">
                  {CONTENT.templates.calculationTypeLabel as string}
                  <InfoCircleOutlined />
                </span>
              </Tooltip>
              <Select
                size="middle"
                value={metric.calculationType}
                options={CALC_TYPE_OPTIONS}
                onChange={(v) => onChange({ calculationType: v })}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {TOGGLES.map(({ key, label, tip }) => (
              <Tooltip key={key} title={tip}>
                <span className="inline-flex items-center gap-1.5 text-xs text-ds-text-secondary">
                  <Switch
                    size="small"
                    checked={metric[key] as boolean}
                    onChange={(v) => onChange({ [key]: v })}
                  />
                  {label}
                  <InfoCircleOutlined className="text-ds-text-subtle" />
                </span>
              </Tooltip>
            ))}
          </div>

          {/*
            Correlation group is no longer edited inline — it's managed in the
            section-level CorrelationGroupsPanel below the AutoSumPanel, which
            is parallel to how auto-totals are configured. We keep a read-only
            badge here so admins know which group (if any) this metric belongs
            to without having to scroll.
          */}
          {metric.correlationGroup && (
            <div className="flex items-center gap-2 text-[11px] text-ds-text-subtle">
              <span className="uppercase tracking-wide">Correlation group</span>
              <Tag color="purple" className="!m-0">
                {metric.correlationGroup}
              </Tag>
              <span className="text-ds-text-subtle">
                · edit in <em>Correlation groups</em> below
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Section settings palette ──────────────────────────────────────────────
 *
 * Hidden-by-default panel for description + isRequired. Correlation grouping
 * was promoted to a dedicated section-level `CorrelationGroupsPanel` mounted
 * below `AutoSumPanel` so cross-section configuration lives in one place.
 */
interface SectionSettingsPaletteProps {
  section: DraftSection;
  updateSection: (sId: string, patch: Partial<DraftSection>) => void;
}

function SectionSettingsPalette({
  section,
  updateSection,
}: SectionSettingsPaletteProps) {
  const [open, setOpen] = useState(false);

  // Auto-open when settings already differ from defaults so the user knows
  // the panel exists without having to discover the cog.
  const hasNonDefaultConfig =
    Boolean(section.description) || section.isRequired === false; // default is true; flipping false counts as configured

  const isOpen = open || hasNonDefaultConfig;

  return (
    <div className="rounded-ds-md border border-dashed border-ds-border-subtle bg-ds-surface-base/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-ds-text-secondary hover:bg-ds-surface-sunken/40 transition-colors"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <span className="inline-flex items-center gap-1.5">
          <SettingOutlined />
          Section settings
        </span>
        <span className="text-[10px] text-ds-text-subtle">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-ds-border-subtle">
          <Input
            value={section.description}
            onChange={(e) => updateSection(section.id, { description: e.target.value })}
            placeholder="Description (optional)"
            variant="borderless"
            className="!text-sm !text-ds-text-secondary !px-0"
            aria-label="Section description"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Tooltip title="Required sections must be filled before the report can be submitted.">
              <span className="inline-flex items-center gap-1.5 text-xs text-ds-text-secondary">
                <Switch
                  size="small"
                  checked={section.isRequired}
                  onChange={(v) => updateSection(section.id, { isRequired: v })}
                />
                {CONTENT.templates.isRequiredLabel as string}
                <InfoCircleOutlined className="text-ds-text-subtle" />
              </span>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Section-level auto-sum panel ─────────────────────────────────────────
 *
 * Auto-sums live as `ReportTemplateMetric` rows with `isAutoTotal: true` on
 * the SAME section, so the data model is unchanged. The UI surfaces them
 * in a dedicated panel attached to the section so admins can configure
 * multiple totals per section, including cross-section sources.
 */
interface AutoSumPanelProps {
  section: DraftSection;
  allSections: DraftSection[];
  onMetricsChange: (sectionId: string, nextMetrics: DraftMetric[]) => void;
}

function AutoSumPanel({ section, allSections, onMetricsChange }: AutoSumPanelProps) {
  const autoSums = section.metrics.filter((m) => m.isAutoTotal);

  /** Same-section non-auto metrics. */
  const sectionSourceOptions = section.metrics
    .filter((m) => !m.isAutoTotal)
    .map((m) => ({ value: m.id, label: m.name || `Metric ${m.id.slice(0, 6)}` }));

  /** Template-wide non-auto metrics, grouped by section. */
  const templateSourceOptions = allSections.map((sec) => ({
    label: sec.name || `Section`,
    options: (sec.metrics ?? [])
      .filter((m) => !m.isAutoTotal)
      .map((m) => ({ value: m.id, label: m.name || `Metric ${m.id.slice(0, 6)}` })),
  }));

  const updateAutoSum = (metricId: string, patch: Partial<DraftMetric>) => {
    const next = section.metrics.map((m) => (m.id === metricId ? { ...m, ...patch } : m));
    onMetricsChange(section.id, next);
  };

  const removeAutoSum = (metricId: string) => {
    const next = section.metrics.filter((m) => m.id !== metricId);
    onMetricsChange(section.id, next);
  };

  const addAutoSum = () => {
    const suggested = `Total ${section.name || "Section"}`.trim();
    const newMetric: DraftMetric = {
      id: crypto.randomUUID(),
      name: suggested,
      description: "",
      fieldType: MetricFieldType.NUMBER,
      calculationType: MetricCalculationType.SUM,
      isRequired: false,
      capturesGoal: false,
      capturesAchieved: true,
      capturesYoY: false,
      capturesWoW: false,
      correlationGroup: "",
      isAutoTotal: true,
      autoTotalSourceMetricIds: [],
      autoTotalScope: "SECTION",
      order: section.metrics.length + 1,
    };
    onMetricsChange(section.id, [...section.metrics, newMetric]);
  };

  return (
    <div className="border border-dashed border-ds-border-base rounded-ds-lg p-3 bg-ds-surface-base/30 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-ds-text-primary uppercase tracking-wide">
            Auto-sum totals ({autoSums.length})
          </p>
          <p className="text-xs text-ds-text-subtle">
            Server-computed sums of other metrics. Add multiple per section; cross-section sources are
            allowed when scope is set to Cross-section.
          </p>
        </div>
        <Button size="small" icon={<PlusOutlined />} onClick={addAutoSum}>
          Add auto-sum
        </Button>
      </div>
      {autoSums.length === 0 ? null : (
        <div className="space-y-2">
          {autoSums.map((m) => {
            const scope = m.autoTotalScope ?? "SECTION";
            const sourceOptions =
              scope === "TEMPLATE" ? templateSourceOptions : sectionSourceOptions;
            const noSources =
              scope === "TEMPLATE"
                ? templateSourceOptions.every((g) => g.options.length === 0)
                : sectionSourceOptions.length === 0;
            return (
              <div
                key={m.id}
                className="p-3 rounded-ds-md border border-ds-border-subtle bg-ds-surface-sunken space-y-2"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Total name</span>
                    <Input
                      size="middle"
                      value={m.name}
                      onChange={(e) => updateAutoSum(m.id, { name: e.target.value })}
                      placeholder={`Total ${section.name || "Section"}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-ds-text-subtle">Scope</span>
                    <Select
                      size="middle"
                      value={scope}
                      onChange={(v) =>
                        updateAutoSum(m.id, {
                          autoTotalScope: v as "SECTION" | "TEMPLATE",
                          // Drop sources that no longer fit the new scope.
                          autoTotalSourceMetricIds:
                            v === "SECTION"
                              ? m.autoTotalSourceMetricIds.filter((id) =>
                                  section.metrics.some((sm) => sm.id === id),
                                )
                              : m.autoTotalSourceMetricIds,
                        })
                      }
                      options={[
                        { value: "SECTION", label: "Same section" },
                        { value: "TEMPLATE", label: "Cross-section (any section in this template)" },
                      ]}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-ds-text-subtle">Source metrics (summed)</span>
                  <Select
                    mode="multiple"
                    size="middle"
                    value={m.autoTotalSourceMetricIds}
                    onChange={(v) => updateAutoSum(m.id, { autoTotalSourceMetricIds: v as string[] })}
                    options={sourceOptions as never}
                    placeholder={
                      noSources
                        ? "Add data metrics to this section first"
                        : scope === "SECTION"
                          ? "Pick metrics in this section"
                          : "Pick any data metrics across the template"
                    }
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="label"
                    disabled={noSources}
                  />
                  <p className="text-xs text-ds-text-subtle">
                    Computed server-side, rendered read-only on the report, comment auto-stamped with
                    the source names.
                  </p>
                </div>
                <div className="flex items-center justify-end">
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeAutoSum(m.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Section-level correlation groups panel ───────────────────────────────
 *
 * Collapsible panel mounted below `AutoSumPanel` per section. Surfaces every
 * correlation group that has at least one member in this section, plus the
 * ability to create new groups. A group's scope can be:
 *   - SECTION (default): only metrics in this section can be members.
 *   - TEMPLATE: any data metric across the template can be members
 *     (read "Cross-section" — parallels AutoSumPanel's TEMPLATE scope).
 *
 * Membership is encoded on each metric via `correlationGroup` (string match);
 * editing this panel updates `correlationGroup` on the affected metrics
 * across the entire template via `setAllSections`. This keeps the data shape
 * unchanged from the prior inline editor — only the editing surface moved.
 */
interface CorrelationGroupsPanelProps {
  section: DraftSection;
  allSections: DraftSection[];
  setAllSections: (updater: (prev: DraftSection[]) => DraftSection[]) => void;
}

function CorrelationGroupsPanel({
  section,
  allSections,
  setAllSections,
}: CorrelationGroupsPanelProps) {
  /** Open by default when this section already has groups so admins see them up-front. */
  const initialOpen = useMemo(
    () => section.metrics.some((m) => Boolean(m.correlationGroup)),
    [section.metrics],
  );
  const [open, setOpen] = useState(initialOpen);

  /** Groups that have at least one member metric inside THIS section. */
  const sectionGroups = useMemo(() => {
    const set = new Set<string>();
    for (const m of section.metrics) if (m.correlationGroup) set.add(m.correlationGroup);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [section.metrics]);

  /** Member metrics across the entire template, keyed by group name. */
  const groupMembership = useMemo(() => {
    const map = new Map<string, Array<{ id: string; name: string; sectionId: string; sectionName: string }>>();
    for (const sec of allSections) {
      for (const m of sec.metrics) {
        if (!m.correlationGroup) continue;
        if (!map.has(m.correlationGroup)) map.set(m.correlationGroup, []);
        map.get(m.correlationGroup)!.push({
          id: m.id,
          name: m.name || `Metric ${m.id.slice(0, 6)}`,
          sectionId: sec.id,
          sectionName: sec.name || "Section",
        });
      }
    }
    return map;
  }, [allSections]);

  /** Effective scope is TEMPLATE when members span sections, otherwise SECTION. */
  const effectiveScope = (groupName: string): "SECTION" | "TEMPLATE" => {
    const members = groupMembership.get(groupName) ?? [];
    if (members.length === 0) return "SECTION";
    const first = members[0].sectionId;
    return members.every((m) => m.sectionId === first) ? "SECTION" : "TEMPLATE";
  };

  /** Available metric options for a group, scoped per its current scope. */
  const memberOptions = (
    groupName: string,
    scope: "SECTION" | "TEMPLATE",
  ): Array<{ label: string; options: Array<{ value: string; label: string }> }> => {
    const sourceSections = scope === "TEMPLATE" ? allSections : [section];
    return sourceSections.map((sec) => ({
      label: sec.name || "Section",
      options: sec.metrics
        .filter((m) => !m.isAutoTotal)
        .map((m) => ({
          value: m.id,
          label: m.name || `Metric ${m.id.slice(0, 6)}`,
        })),
    }));
  };

  /** Current member ids for a group (across template). */
  const currentMembers = (groupName: string): string[] =>
    (groupMembership.get(groupName) ?? []).map((m) => m.id);

  /** Set membership: every metric in `nextIds` joins, every former member not in nextIds leaves. */
  const setGroupMembers = (groupName: string, nextIds: string[]) => {
    const nextSet = new Set(nextIds);
    setAllSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        metrics: sec.metrics.map((m) => {
          if (m.isAutoTotal) return m;
          if (nextSet.has(m.id)) return { ...m, correlationGroup: groupName };
          if (m.correlationGroup === groupName) return { ...m, correlationGroup: "" };
          return m;
        }),
      })),
    );
  };

  /** Rename a group across all member metrics. No-op if the new name is blank. */
  const renameGroup = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    // If the new name collides with an existing group, members merge — that
    // is the expected outcome of "rename A to B" when B already exists.
    setAllSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        metrics: sec.metrics.map((m) =>
          m.correlationGroup === oldName ? { ...m, correlationGroup: trimmed } : m,
        ),
      })),
    );
  };

  /** Toggle scope: TEMPLATE → SECTION drops cross-section members. */
  const setGroupScope = (groupName: string, nextScope: "SECTION" | "TEMPLATE") => {
    if (nextScope === "TEMPLATE") return; // expanding scope needs no member change
    // Restricting to SECTION: drop members that aren't in this section.
    setAllSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        metrics: sec.metrics.map((m) => {
          if (m.correlationGroup !== groupName) return m;
          if (sec.id === section.id) return m;
          return { ...m, correlationGroup: "" };
        }),
      })),
    );
  };

  /** Remove a group entirely (clears correlationGroup on all members). */
  const removeGroup = (groupName: string) => {
    setAllSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        metrics: sec.metrics.map((m) =>
          m.correlationGroup === groupName ? { ...m, correlationGroup: "" } : m,
        ),
      })),
    );
  };

  /** Create a new group. Auto-suggests a name and starts with no members. */
  const addGroup = () => {
    const used = new Set(Array.from(groupMembership.keys()));
    let n = 1;
    let name = `${section.name || "Section"} group ${n}`;
    while (used.has(name)) {
      n += 1;
      name = `${section.name || "Section"} group ${n}`;
    }
    // Seed the group on the first non-auto metric in this section so it
    // shows up in `sectionGroups` immediately. If the section has no data
    // metrics, the group still appears via the explicit override below by
    // assigning to a synthetic empty member set — but that's harder, so we
    // require at least one data metric.
    const firstData = section.metrics.find((m) => !m.isAutoTotal);
    if (!firstData) {
      message.warning("Add at least one data metric to this section first.");
      return;
    }
    setAllSections((prev) =>
      prev.map((sec) =>
        sec.id === section.id
          ? {
              ...sec,
              metrics: sec.metrics.map((m) =>
                m.id === firstData.id ? { ...m, correlationGroup: name } : m,
              ),
            }
          : sec,
      ),
    );
    setOpen(true);
  };

  return (
    <div className="rounded-ds-md border border-dashed border-ds-border-base bg-ds-surface-base/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-ds-text-secondary hover:bg-ds-surface-sunken/40 transition-colors rounded-t-ds-md"
        aria-expanded={open ? "true" : "false"}
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-semibold text-ds-text-primary uppercase tracking-wide inline-flex items-center gap-1.5">
            Correlation groups ({sectionGroups.length})
            <Tooltip title="Metrics sharing a correlation group are paired in Analytics & InsightSummary via Pearson correlation (gated by min-sample size). Toggle a group to Cross-section to include metrics from any section in this template.">
              <InfoCircleOutlined className="text-ds-text-subtle" />
            </Tooltip>
          </span>
          <span className="text-[11px] font-normal text-ds-text-subtle normal-case tracking-normal">
            Same idea as auto-totals — pick which metrics relate to each other; cross-section is allowed.
          </span>
        </div>
        <span className="text-[10px] text-ds-text-subtle">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-ds-border-subtle">
          {sectionGroups.length === 0 ? (
            <p className="text-xs text-ds-text-subtle py-1">
              No correlation groups in this section yet.
            </p>
          ) : (
            <div className="space-y-2">
              {sectionGroups.map((groupName) => {
                const members = groupMembership.get(groupName) ?? [];
                const scope = effectiveScope(groupName);
                return (
                  <div
                    key={groupName}
                    className="p-3 rounded-ds-md border border-ds-border-subtle bg-ds-surface-sunken space-y-2"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-ds-text-subtle">Group name</span>
                        <Input
                          size="middle"
                          defaultValue={groupName}
                          onBlur={(e) => renameGroup(groupName, e.target.value)}
                          placeholder="e.g. First-time visitors"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-ds-text-subtle">Scope</span>
                        <Select
                          size="middle"
                          value={scope}
                          onChange={(v) =>
                            setGroupScope(groupName, v as "SECTION" | "TEMPLATE")
                          }
                          options={[
                            { value: "SECTION", label: "Same section" },
                            {
                              value: "TEMPLATE",
                              label: "Cross-section (any section in this template)",
                            },
                          ]}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-ds-text-subtle">
                        Members ({members.length})
                      </span>
                      <Select
                        mode="multiple"
                        size="middle"
                        value={currentMembers(groupName)}
                        onChange={(v) => setGroupMembers(groupName, v as string[])}
                        options={memberOptions(groupName, scope) as never}
                        placeholder={
                          scope === "SECTION"
                            ? "Pick metrics in this section"
                            : "Pick any data metrics across the template"
                        }
                        style={{ width: "100%" }}
                        showSearch
                        optionFilterProp="label"
                      />
                      {scope === "TEMPLATE" && (
                        <p className="text-[11px] text-ds-text-subtle">
                          Includes members from:{" "}
                          {Array.from(new Set(members.map((m) => m.sectionName))).join(", ") ||
                            "—"}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeGroup(groupName)}
                      >
                        Remove group
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <p className="text-[11px] text-ds-text-subtle">
              Adding a group seeds it on the first data metric in this section — drag in more
              members from the dropdown above.
            </p>
            <Button size="small" icon={<PlusOutlined />} onClick={addGroup}>
              Add correlation group
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TemplateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [form] = Form.useForm();
  const [sections, setSections] = useState<DraftSection[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [goalPromptVisible, setGoalPromptVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const {
    status: draftStatus,
    lastSavedAt: draftLastSaved,
    clearDraft,
  } = useFormPersistence<{
    formValues: any;
    sections: DraftSection[];
  }>({
    formKey: `draft:template:${id}`,
    formState: {
      formValues: form.getFieldsValue(true),
      sections: sections ?? [],
    },
    onRestore: (draft) => {
      form.setFieldsValue(draft.formValues);
      setSections(draft.sections);
      setInitialized(true);
    },
    enabled: true,
  });

  const { data: template } = useApiData<TemplateWithMeta>(API_ROUTES.reportTemplates.detail(id));

  // This is intentionally empty here: form persistence is now handled via useFormPersistence and the local template restore.

  useEffect(() => {
    if (initialized) return;
    if (!template) return;

    form.setFieldsValue({
      name: template.name,
      description: template.description ?? "",
      isDefault: template.isDefault ?? false,
      isArchived: template.isArchived ?? false,
      deadlinePolicy: template.deadlinePolicy ?? ReportDeadlinePolicy.PERIOD_END,
      deadlineOffsetHours: template.deadlineOffsetHours ?? 48,
    });

    const rawSections = (template.sections ?? []) as ReportTemplateSection[];
    setSections(
      rawSections
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description ?? "",
          isRequired: s.isRequired,
          correlationGroup: s.correlationGroup ?? "",
          order: s.order,
          metrics: (s.metrics ?? [])
            .sort((a, b) => a.order - b.order)
            .map((m) => ({
              id: m.id,
              name: m.name,
              description: m.description ?? "",
              fieldType: m.fieldType,
              calculationType: m.calculationType,
              isRequired: m.isRequired,
              capturesGoal: m.capturesGoal,
              capturesAchieved: m.capturesAchieved,
              capturesYoY: m.capturesYoY,
              capturesWoW: (m as { capturesWoW?: boolean }).capturesWoW ?? false,
              correlationGroup: m.correlationGroup ?? "",
              isAutoTotal: (m as { isAutoTotal?: boolean }).isAutoTotal ?? false,
              autoTotalSourceMetricIds:
                (m as { autoTotalSourceMetricIds?: string[] }).autoTotalSourceMetricIds ?? [],
              autoTotalScope:
                ((m as { autoTotalScope?: string }).autoTotalScope as "SECTION" | "TEMPLATE") ?? "SECTION",
              order: m.order,
            })),
        })),
    );

    setInitialized(true);
  }, [initialized, template, form]);

  const updateSection = (sId: string, patch: Partial<DraftSection>) =>
    setSections((prev) => (prev ?? []).map((s) => (s.id === sId ? { ...s, ...patch } : s)));
  const removeSection = (sId: string) =>
    setSections((prev) => (prev ?? []).filter((s) => s.id !== sId));
  const addSection = () =>
    setSections((prev) => [
      ...(prev ?? []),
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        isRequired: true,
        correlationGroup: "",
        order: (prev ?? []).length + 1,
        metrics: [],
      },
    ]);

  const updateMetric = (sId: string, mId: string, patch: Partial<DraftMetric>) =>
    setSections((prev) =>
      (prev ?? []).map((s) =>
        s.id === sId
          ? { ...s, metrics: s.metrics.map((m) => (m.id === mId ? { ...m, ...patch } : m)) }
          : s,
      ),
    );
  const removeMetric = (sId: string, mId: string) =>
    setSections((prev) =>
      (prev ?? []).map((s) =>
        s.id === sId ? { ...s, metrics: s.metrics.filter((m) => m.id !== mId) } : s,
      ),
    );

  /**
   * Replace a section's full metrics array. Used by the section-level
   * auto-sum panel so it can add / edit / remove auto-sum entries (which are
   * just `ReportTemplateMetric` rows with `isAutoTotal: true`) without
   * touching the regular metric list.
   */
  const setSectionMetrics = (sId: string, nextMetrics: DraftMetric[]) =>
    setSections((prev) =>
      (prev ?? []).map((s) => (s.id === sId ? { ...s, metrics: nextMetrics } : s)),
    );

  /**
   * Bulk update across the full sections array — used by `CorrelationGroupsPanel`
   * because correlation groups can span sections (e.g. renaming a group rewrites
   * `correlationGroup` on every member, regardless of which section it lives in).
   */
  const setAllSections = (updater: (prev: DraftSection[]) => DraftSection[]) =>
    setSections((prev) => updater(prev ?? []));
  const addMetric = (sId: string) =>
    setSections((prev) =>
      (prev ?? []).map((s) => {
        if (s.id !== sId) return s;
        return {
          ...s,
          metrics: [
            ...s.metrics,
            {
              id: crypto.randomUUID(),
              name: "",
              description: "",
              fieldType: MetricFieldType.NUMBER,
              calculationType: MetricCalculationType.SUM,
              isRequired: true,
              capturesGoal: true,
              capturesAchieved: true,
              capturesYoY: false,
              capturesWoW: false,
              correlationGroup: "",
              isAutoTotal: false,
              autoTotalSourceMetricIds: [],
              autoTotalScope: "SECTION",
              order: s.metrics.length + 1,
            },
          ],
        };
      }),
    );

  const handleSave = async (values: {
    name: string;
    description: string;
    isDefault: boolean;
    isArchived: boolean;
    deadlinePolicy?: ReportDeadlinePolicy;
    deadlineOffsetHours?: number;
  }) => {
    const draft = sections ?? [];
    if (draft.find((s) => !s.name.trim())) {
      message.error("All sections must have a name.");
      return;
    }
    for (const s of draft) {
      if (s.metrics.find((m) => !m.name.trim())) {
        message.error(`All metrics in "${s.name}" must have a name.`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        ...values,
        deadlinePolicy: values.deadlinePolicy ?? ReportDeadlinePolicy.PERIOD_END,
        deadlineOffsetHours: values.deadlineOffsetHours ?? 48,
        sections: draft.map((s, si) => ({
          id: s.id,
          templateId: id,
          name: s.name.trim(),
          description: s.description || undefined,
          isRequired: s.isRequired,
          correlationGroup: s.correlationGroup.trim() || null,
          order: si + 1,
          metrics: s.metrics.map((m, mi) => ({
            id: m.id,
            sectionId: s.id,
            name: m.name.trim(),
            description: m.description || undefined,
            fieldType: m.fieldType,
            calculationType: m.calculationType,
            isRequired: m.isRequired,
            capturesGoal: m.capturesGoal,
            capturesAchieved: m.capturesAchieved,
            capturesYoY: m.capturesYoY,
            capturesWoW: m.capturesWoW,
            correlationGroup: m.correlationGroup.trim() || null,
            isAutoTotal: m.isAutoTotal,
            autoTotalSourceMetricIds: m.autoTotalSourceMetricIds,
            autoTotalScope: m.autoTotalScope,
            order: mi + 1,
          })),
        })),
      };
      const { ok, queued, response } = await offlineFetch(API_ROUTES.reportTemplates.detail(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (queued) {
        message.success("Saved locally and will sync when you're back online.");
        return;
      }

      const json = response ? await response.json().catch(() => ({})) : {};
      if (!ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.templates.templateSaved as string);
      clearDraft();
      // Prompt to update goals if any metric captures a goal
      const hasGoalMetrics = draft.some((s) => s.metrics.some((m) => m.capturesGoal));
      if (hasGoalMetrics) setGoalPromptVisible(true);
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  if (template === undefined || !initialized) {
    return (
      <PageLayout title={CONTENT.templates.editTemplate as string}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }
  if (!template) {
    return (
      <PageLayout title="Template Not Found">
        <Button onClick={() => router.push(APP_ROUTES.templates)}>
          {CONTENT.common.back as string}
        </Button>
      </PageLayout>
    );
  }

  const draft = sections ?? [];
  const totalMetrics = draft.reduce((n, s) => n + s.metrics.length, 0);

  return (
    <>
      <PageLayout
        title={CONTENT.templates.editTemplate as string}
        subtitle={template.name}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(APP_ROUTES.templates)}>
            {CONTENT.common.back as string}
          </Button>
        }
      >
        <Tabs
          defaultActiveKey="sections"
          destroyOnHidden={false}
          items={[
            {
              key: "sections",
              label: "Sections & metrics",
              children: (
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <div className="max-w-4xl space-y-6 form-scroll-container">
            {/* Metadata card */}
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 space-y-4">
              <div className="flex gap-2 mb-2 flex-wrap">
                {template.isDefault && (
                  <Tag color="gold" icon={<StarOutlined />}>
                    {CONTENT.templates.defaultBadge as string}
                  </Tag>
                )}
                {template.isArchived && <Tag>Archived</Tag>}
              </div>
              <Form.Item
                name="name"
                label={CONTENT.templates.nameLabel as string}
                rules={[{ required: true, message: "Template name is required." }]}
              >
                <Input size="large" placeholder={CONTENT.templates.namePlaceholder as string} />
              </Form.Item>
              <Form.Item name="description" label={CONTENT.templates.descriptionLabel as string}>
                <Input.TextArea
                  rows={2}
                  placeholder={CONTENT.templates.descriptionPlaceholder as string}
                />
              </Form.Item>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item name="deadlinePolicy" label="Report deadline policy">
                  <Select size="large" options={DEADLINE_POLICY_OPTIONS} />
                </Form.Item>
                <Form.Item name="deadlineOffsetHours" label="Deadline offset (hours)">
                  <Input type="number" min={1} max={168} />
                </Form.Item>
              </div>
              <div className="flex flex-wrap gap-6">
                {(["isDefault", "isArchived"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <Form.Item name={key} valuePropName="checked" noStyle>
                      <Switch size="small" />
                    </Form.Item>
                    <span className="text-sm text-ds-text-secondary">
                      {key === "isDefault"
                        ? (CONTENT.templates.setDefault as string)
                        : (CONTENT.templates.archiveTemplate as string)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections + metrics */}
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-ds-text-primary">
                    Sections
                    <Badge
                      count={draft.length}
                      className="ml-2"
                      style={{ backgroundColor: "var(--ds-brand-accent)" }}
                    />
                  </h3>
                  <p className="text-xs text-ds-text-subtle mt-0.5">
                    {totalMetrics} metric{totalMetrics === 1 ? "" : "s"} across {draft.length}{" "}
                    section{draft.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Button icon={<PlusOutlined />} size="small" onClick={addSection}>
                  {CONTENT.templates.addSection as string}
                </Button>
              </div>

              {draft.length === 0 ? (
                <div className="text-center py-10 text-ds-text-subtle text-sm">
                  No sections yet. Click <strong>Add Section</strong> to start building this
                  template.
                </div>
              ) : (
                <Collapse
                  accordion={false}
                  defaultActiveKey={draft.map((s) => s.id)}
                  items={draft.map((section, si) => ({
                    key: section.id,
                    /*
                      Section dropdown header IS the borderless inline name input.
                      Clicks + key strokes on the input are stopped from
                      bubbling so editing doesn't accidentally collapse the
                      section. The little metric-count + drag handle ride on
                      the right of the same row.
                    */
                    label: (
                      <div className="flex items-center gap-2 min-w-0 w-full">
                        <DragOutlined className="text-ds-text-subtle flex-shrink-0" />
                        <Input
                          value={section.name}
                          onChange={(e) => updateSection(section.id, { name: e.target.value })}
                          placeholder={`Section ${si + 1} name`}
                          variant="borderless"
                          className="!text-base !font-semibold !text-ds-text-primary !px-0 flex-1 min-w-0"
                          aria-label="Section name"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs text-ds-text-subtle flex-shrink-0 hidden sm:inline">
                          {section.metrics.length} metric{section.metrics.length === 1 ? "" : "s"}
                          {section.isRequired && <span className="ml-1 text-red-500" title="Required">*</span>}
                        </span>
                      </div>
                    ),
                    children: (
                      <div className="space-y-4 pt-1">
                        {/* Section settings palette — hidden by default; user opts in to configure */}
                        <SectionSettingsPalette
                          section={section}
                          updateSection={updateSection}
                        />

                        {/* Data metrics (auto-sums are surfaced separately in AutoSumPanel below) */}
                        {(() => {
                          const dataMetrics = section.metrics.filter((m) => !m.isAutoTotal);
                          return (
                            <div className="space-y-2">
                              {dataMetrics.length === 0 && (
                                <p className="text-xs text-ds-text-subtle py-2">
                                  No metrics yet. Add a metric below.
                                </p>
                              )}
                              {dataMetrics.map((metric) => (
                                <MetricRow
                                  key={metric.id}
                                  metric={metric}
                                  sectionMetrics={section.metrics}
                                  allSections={draft}
                                  onChange={(patch) => updateMetric(section.id, metric.id, patch)}
                                  onRemove={() => removeMetric(section.id, metric.id)}
                                />
                              ))}
                            </div>
                          );
                        })()}

                        {/* Section-level auto-sum totals (multiple per section, optional cross-section sources) */}
                        <AutoSumPanel
                          section={section}
                          allSections={draft}
                          onMetricsChange={setSectionMetrics}
                        />

                        {/*
                          Correlation groups panel — mounted directly below the
                          auto-totals panel and structured similarly (collapsible
                          + cross-section scope toggle + multi-select members)
                          so admins recognise the pattern instantly.
                        */}
                        <CorrelationGroupsPanel
                          section={section}
                          allSections={draft}
                          setAllSections={setAllSections}
                        />

                        {/* Section footer actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-ds-border-subtle">
                          <Button
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => addMetric(section.id)}
                          >
                            {CONTENT.templates.addMetric as string}
                          </Button>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeSection(section.id)}
                          >
                            Remove Section
                          </Button>
                        </div>
                      </div>
                    ),
                  }))}
                />
              )}
            </div>

            {/* Footer */}
            <div className="form-action-wrapper flex justify-end gap-3">
              <Button onClick={() => router.push(APP_ROUTES.templates)}>
                {CONTENT.common.cancel as string}
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {CONTENT.common.save as string}
              </Button>
            </div>
          </div>
        </Form>
              ),
            },
            {
              key: "assignments",
              label: "Quick-form assignments",
              children: (
                <div className="max-w-4xl">
                  <TemplateAssignmentsEditor templateId={id} template={template} />
                </div>
              ),
            },
          ]}
        />
      </PageLayout>

      {/* Goal-update prompt modal */}
      <Modal
        open={goalPromptVisible}
        title={
          <div className="flex items-center gap-2">
            <TrophyOutlined className="text-ds-brand-accent" />
            <span>{CONTENT.templates.goalPromptTitle as string}</span>
          </div>
        }
        footer={[
          <Button key="later" onClick={() => setGoalPromptVisible(false)}>
            {CONTENT.templates.goalPromptSkip as string}
          </Button>,
          <Button
            key="now"
            type="primary"
            icon={<TrophyOutlined />}
            onClick={() => {
              setGoalPromptVisible(false);
              router.push(APP_ROUTES.goals);
            }}
          >
            {CONTENT.templates.goalPromptConfirm as string}
          </Button>,
        ]}
        onCancel={() => setGoalPromptVisible(false)}
        closable={false}
      >
        <p className="text-sm text-ds-text-secondary py-2">
          {CONTENT.templates.goalPromptDescription as string}
        </p>
      </Modal>
    </>
  );
}
