"use client";

/**
 * modules/goals/components/GoalsPage.tsx
 *
 * Goals management — GROUP_ADMIN and above.
 *
 * Layout:
 *   - Year selector + mode selector (Annual / Monthly) at top
 *   - "All Campuses" tab + one tab per campus
 *   - Inside each tab: a bulk-edit table with one row per metric that capturesGoal
 *     organised by template section. All fields visible simultaneously — no
 *     per-metric submit loop.
 *   - "All Campuses" tab = matrix view: rows = metrics, columns = campuses
 *   - Locked goals show a lock badge; editing them opens an unlock-request modal.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { FormDraftBanner } from "@/components/ui/FormDraftBanner";
import {
  InputNumber,
  Select,
  Tag,
  Tooltip,
  message,
  Modal,
  Tabs,
  Form,
  Collapse,
  Checkbox,
} from "antd";
import {
  TrophyOutlined,
  LockOutlined,
  UnlockOutlined,
  SaveOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { useFormPersistence } from "@/lib/hooks/useFormPersistence";
import { offlineFetch } from "@/lib/utils/offlineFetch";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScrollArea from "@/components/ui/ScrollArea";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { GoalMode, GoalEditRequestStatus, UserRole } from "@/types/global";

const g = CONTENT.goals as Record<string, unknown>;

/* ── Constants ─────────────────────────────────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map((y) => ({
  value: y,
  label: String(y),
}));
const MODE_OPTIONS = [
  { value: GoalMode.ANNUAL, label: g.modeAnnual as string },
  { value: GoalMode.MONTHLY, label: g.modeMonthly as string },
];
const MONTH_LABELS = g.months as string[];

const CAN_WRITE_ROLES: UserRole[] = [
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
  UserRole.SUPERADMIN,
];
const WIDE_VIEW_ROLES: UserRole[] = [
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
];

function canWrite(role: UserRole): boolean {
  return CAN_WRITE_ROLES.includes(role);
}
function canSeeAllCampuses(role: UserRole): boolean {
  return WIDE_VIEW_ROLES.includes(role);
}

/* ── Types ──────────────────────────────────────────────────────────────────── */

/** keyed by metricId */
type BulkGoalValues = Record<string, number | undefined>;
/** keyed by campusId then metricId (for all-campuses view) */
type MatrixValues = Record<string, BulkGoalValues>;

interface GoalsDraft {
  year: number;
  mode: GoalMode;
  activeTab?: string;
  annValues: BulkGoalValues;
  monthValues: Record<string, Record<number, number>>;
  matrixValues: MatrixValues;
}

/* ── Helpers ─────────────────────────────────────────────────────────────────  */

function goalKey(campusId: string, metricId: string, year: number, mode: GoalMode, month?: number) {
  return `${campusId}:${metricId}:${year}:${mode}${month != null ? `:${month}` : ""}`;
}

function goalsToMap(goals: Goal[]): Record<string, Goal> {
  const map: Record<string, Goal> = {};
  for (const goal of goals) {
    map[goalKey(goal.campusId, goal.templateMetricId, goal.year, goal.mode, goal.month)] = goal;
  }
  return map;
}

interface TemplateSectionGroup {
  templateId: string;
  templateName: string;
  sections: Array<{ section: ReportTemplateSection; metrics: ReportTemplateMetric[] }>;
}

function buildTemplateSectionGroups(templates: ReportTemplate[]): TemplateSectionGroup[] {
  return templates.map((tmpl) => ({
    templateName: tmpl.name,
    templateId: tmpl.id,
    sections: tmpl.sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        section,
        metrics: section.metrics
          .filter((m) => m.capturesGoal)
          .slice()
          .sort((a, b) => a.order - b.order),
      }))
      .filter(({ metrics }) => metrics.length > 0),
  }));
}

/* ── Unlock-request modal ───────────────────────────────────────────────────── */

interface UnlockModalProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function UnlockModal({ goal, open, onClose, onSuccess }: UnlockModalProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: { reason: string; proposedValue: number }) => {
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.goals.unlockRequest(goal.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? "Error");
        return;
      }
      message.success("Unlock request submitted.");
      form.resetFields();
      onSuccess();
    } catch {
      message.error("Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={g.requestUnlock as string}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="mt-4"
      >
        <div className="text-xs text-ds-text-subtle mb-3">
          <strong>{goal.metricName}</strong>
          {" — current target: "}
          {goal.targetValue.toLocaleString()}
        </div>
        <Form.Item
          name="proposedValue"
          label={g.targetValueLabel as string}
          rules={[{ required: true, message: "Required" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item
          name="reason"
          label={g.unlockReasonLabel as string}
          rules={[{ required: true, min: 10, message: "At least 10 characters." }]}
        >
          <Input.TextArea rows={3} placeholder={g.unlockReasonPlaceholder as string} />
        </Form.Item>
        <div className="flex gap-3 justify-end">
          <Button onClick={onClose}>{CONTENT.common.cancel as string}</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {g.requestUnlock as string}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

/* ── BulkGoalTable — one campus, all metrics in sections ─────────────────── */

interface BulkGoalTableProps {
  campusId: string;
  year: number;
  mode: GoalMode;
  templates: ReportTemplate[];
  goals: Goal[];
  canEdit: boolean;
  isSuperadmin: boolean;
}

function BulkGoalTable({
  campusId,
  year,
  mode,
  templates,
  goals,
  canEdit,
  isSuperadmin,
}: BulkGoalTableProps) {
  const goalMap = goalsToMap(goals.filter((g) => g.campusId === campusId));

  /** local edits: metricId -> { ann: number } | { months: Record<number, number> } */
  const [annValues, setAnnValues] = useState<BulkGoalValues>(() => {
    const init: BulkGoalValues = {};
    for (const goal of goals.filter(
      (go) => go.campusId === campusId && go.mode === GoalMode.ANNUAL && go.year === year,
    )) {
      init[goal.templateMetricId] = goal.targetValue;
    }
    return init;
  });
  const [monthValues, setMonthValues] = useState<Record<string, Record<number, number>>>(() => {
    const init: Record<string, Record<number, number>> = {};
    for (const goal of goals.filter(
      (go) =>
        go.campusId === campusId &&
        go.mode === GoalMode.MONTHLY &&
        go.year === year &&
        go.month != null,
    )) {
      if (!init[goal.templateMetricId]) init[goal.templateMetricId] = {};
      init[goal.templateMetricId][goal.month!] = goal.targetValue;
    }
    return init;
  });

  const draftKey = `draft:goals:campus:${campusId}:${year}:${mode}`;
  const {
    status: draftStatus,
    lastSavedAt: draftLastSaved,
    clearDraft,
  } = useFormPersistence<{
    annValues: BulkGoalValues;
    monthValues: Record<string, Record<number, number>>;
  }>({
    formKey: draftKey,
    formState: { annValues, monthValues },
    onRestore: (draft) => {
      setAnnValues(draft.annValues);
      setMonthValues(draft.monthValues);
    },
    enabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [unlockGoal, setUnlockGoal] = useState<Goal | undefined>(undefined);

  /* Collect all goal-capturing metrics organized by template */
  const templateSections = buildTemplateSectionGroups(templates);
  const sections = templateSections.flatMap((t) => t.sections);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payloads: object[] = [];

      if (mode === GoalMode.ANNUAL) {
        for (const [metricId, val] of Object.entries(annValues)) {
          if (val == null) continue;
          const sectionAndMetric = sections
            .flatMap(({ metrics }) => metrics)
            .find((m) => m.id === metricId);
          if (!sectionAndMetric) continue;
          payloads.push({
            campusId,
            templateMetricId: metricId,
            metricName: sectionAndMetric.name,
            mode: GoalMode.ANNUAL,
            year,
            targetValue: val,
          });
        }
      } else {
        for (const [metricId, months] of Object.entries(monthValues)) {
          const sectionAndMetric = sections
            .flatMap(({ metrics }) => metrics)
            .find((m) => m.id === metricId);
          if (!sectionAndMetric) continue;
          for (const [month, val] of Object.entries(months)) {
            if (val == null) continue;
            payloads.push({
              campusId,
              templateMetricId: metricId,
              metricName: sectionAndMetric.name,
              mode: GoalMode.MONTHLY,
              year,
              month: Number(month),
              targetValue: val,
            });
          }
        }
      }

      const { ok, queued, response } = await offlineFetch(API_ROUTES.goals.bulk, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloads),
        credentials: "include",
      });

      if (queued) {
        message.success("Changes saved locally and will sync when you're back online.");
        clearDraft();
        return;
      }

      const json = response ? await response.json().catch(() => ({})) : {};

      if (!ok || !json?.success) {
        message.error(
          json?.error ??
            (CONTENT.errors as Record<string, string>).generic ??
            "Error saving goals.",
        );
        return;
      }

      message.success(g.savedGoals as string);
      clearDraft();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic ?? "Error saving goals.");
    } finally {
      setSaving(false);
    }
  };

  if (templateSections.length === 0) {
    return (
      <EmptyState
        icon={<TrophyOutlined />}
        title={(g.emptyState as Record<string, string>)?.title}
        description="No goal-capturing metrics found in active templates."
      />
    );
  }

  return (
    <div className="space-y-4">
      {templateSections.map((tmpl) => (
        <Collapse key={tmpl.templateId} ghost>
          <Collapse.Panel
            key={tmpl.templateId}
            header={
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ds-text-primary">Template: {tmpl.templateName}</span>
                <span className="text-xs text-ds-text-subtle">
                  {tmpl.sections.reduce((acc, cur) => acc + cur.metrics.length, 0)} metrics
                </span>
              </div>
            }
          >
            {tmpl.sections.map(({ section, metrics }) => (
              <Collapse key={section.id} ghost>
                <Collapse.Panel
                  key={section.id}
                  header={
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ds-text-primary">{section.name}</span>
                      <span className="text-xs text-ds-text-subtle">
                        {metrics.length} goal metric{metrics.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  }
                >
                  <div className="space-y-2 p-3">
                    {metrics.map((metric) => {
                      const existingGoal =
                        mode === GoalMode.ANNUAL
                          ? goalMap[goalKey(campusId, metric.id, year, GoalMode.ANNUAL)]
                          : undefined;
                      const isLocked = (existingGoal?.isLocked ?? false) && !isSuperadmin;

                      return (
                        <div
                          key={metric.id}
                          className="border-b border-ds-border-subtle py-2 last:border-none"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="font-medium text-ds-text-primary truncate">
                              {metric.name}
                            </span>
                            <span className="text-xs text-ds-text-subtle">
                              {isLocked ? "Locked" : "Editable"}
                            </span>
                          </div>
                          {mode === GoalMode.ANNUAL ? (
                            <div className="flex items-center gap-3">
                              <InputNumber
                                className="w-36"
                                min={0}
                                value={annValues[metric.id]}
                                disabled={!canEdit || isLocked}
                                placeholder={g.noGoalSet as string}
                                onChange={(v) =>
                                  setAnnValues((prev) => ({ ...prev, [metric.id]: v ?? undefined }))
                                }
                              />
                              {isLocked ? (
                                <Tooltip title={g.lockedNote as string}>
                                  <Tag icon={<LockOutlined />} color="orange">
                                    Locked
                                  </Tag>
                                </Tooltip>
                              ) : existingGoal ? (
                                <Tag color="green">Set</Tag>
                              ) : (
                                <Tag color="default">{g.noGoalSet as string}</Tag>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-12 gap-1">
                              {MONTH_LABELS.map((_, idx) => {
                                const month = idx + 1;
                                const monthGoal =
                                  goalMap[goalKey(campusId, metric.id, year, GoalMode.MONTHLY, month)];
                                const monthLocked = (monthGoal?.isLocked ?? false) && !isSuperadmin;
                                return (
                                  <InputNumber
                                    key={month}
                                    size="small"
                                    className="w-full"
                                    min={0}
                                    value={monthValues[metric.id]?.[month] ?? monthGoal?.targetValue}
                                    disabled={!canEdit || monthLocked}
                                    placeholder="0"
                                    controls={false}
                                    onChange={(v) =>
                                      setMonthValues((prev) => ({
                                        ...prev,
                                        [metric.id]: {
                                          ...(prev[metric.id] ?? {}),
                                          [month]: v ?? 0,
                                        },
                                      }))
                                    }
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Collapse.Panel>
              </Collapse>
            ))}
          </Collapse.Panel>
        </Collapse>
      ))}
      {canEdit && (
        <div className="form-action-wrapper flex justify-end">
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveAll}>
            {g.saveAll as string}
          </Button>
        </div>
      )}
      {unlockGoal && (
        <UnlockModal
          goal={unlockGoal}
          open={!!unlockGoal}
          onClose={() => setUnlockGoal(undefined)}
          onSuccess={() => setUnlockGoal(undefined)}
        />
      )}
    </div>
  );
}

/* ── AllCampusesMatrix — rows = metrics, cols = campuses ─────────────────── */

interface AllCampusesMatrixProps {
  campuses: Campus[];
  year: number;
  mode: GoalMode;
  templates: ReportTemplate[];
  goals: Goal[];
  canEdit: boolean;
  isSuperadmin: boolean;
}

function AllCampusesMatrix({
  campuses,
  year,
  mode,
  templates,
  goals,
  canEdit,
  isSuperadmin,
}: AllCampusesMatrixProps) {
  const goalMap = goalsToMap(goals);

  const draftKey = `draft:goals:matrix:${year}:${mode}`;

  /** campusId -> metricId -> value */
  const [matrixValues, setMatrixValues] = useState<MatrixValues>(() => {
    const init: MatrixValues = {};
    for (const goal of goals.filter((go) => go.mode === mode && go.year === year)) {
      if (!init[goal.campusId]) init[goal.campusId] = {};
      init[goal.campusId][goal.templateMetricId] = goal.targetValue;
    }
    return init;
  });

  const {
    status: draftStatus,
    lastSavedAt: draftLastSaved,
    clearDraft,
  } = useFormPersistence<{
    matrixValues: MatrixValues;
  }>({
    formKey: draftKey,
    formState: { matrixValues },
    onRestore: (draft) => {
      setMatrixValues(draft.matrixValues);
    },
    enabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [allMetricValues, setAllMetricValues] = useState<Record<string, number | undefined>>({});

  const templateSections = buildTemplateSectionGroups(templates);
  const sections: Array<{ section: ReportTemplateSection; metrics: ReportTemplateMetric[] }> =
    templateSections.flatMap((t) => t.sections);

  const setCellValue = (campusId: string, metricId: string, v: number | null) =>
    setMatrixValues((prev) => ({
      ...prev,
      [campusId]: { ...(prev[campusId] ?? {}), [metricId]: v ?? undefined },
    }));

  const applyValueToAllCampuses = (metricId: string) => {
    const val = allMetricValues[metricId];
    if (val == null) {
      message.warning("Enter a value first before applying to all campuses.");
      return;
    }

    setMatrixValues((prev) => {
      const next = { ...prev };
      for (const campus of campuses) {
        const existing = goalMap[goalKey(campus.id, metricId, year, GoalMode.ANNUAL)];
        const isLocked = (existing?.isLocked ?? false) && !isSuperadmin;
        if (isLocked) continue;
        next[campus.id] = { ...(next[campus.id] ?? {}), [metricId]: val };
      }
      return next;
    });
  };

  const applyAllMetricsAcrossCampuses = () => {
    setMatrixValues((prev) => {
      const next = { ...prev };
      for (const metricId of Object.keys(allMetricValues)) {
        const value = allMetricValues[metricId];
        if (value == null) continue;

        for (const campus of campuses) {
          const existing = goalMap[goalKey(campus.id, metricId, year, GoalMode.ANNUAL)];
          const isLocked = (existing?.isLocked ?? false) && !isSuperadmin;
          if (isLocked) continue;
          next[campus.id] = { ...(next[campus.id] ?? {}), [metricId]: value };
        }
      }
      return next;
    });
    message.success("Applied selected metric values to all campuses.");
  };

  const handleSaveAll = async () => {
    if (mode !== GoalMode.ANNUAL) {
      message.info("Use per-campus tabs for monthly goal entry.");
      return;
    }
    setSaving(true);
    try {
      const payloads: object[] = [];
      for (const [campusId, metricMap] of Object.entries(matrixValues)) {
        for (const [metricId, val] of Object.entries(metricMap)) {
          if (val == null) continue;
          const metric = sections.flatMap(({ metrics }) => metrics).find((m) => m.id === metricId);
          if (!metric) continue;
          payloads.push({
            campusId,
            templateMetricId: metricId,
            metricName: metric.name,
            mode: GoalMode.ANNUAL,
            year,
            targetValue: val,
          });
        }
      }

      const { ok, queued, response } = await offlineFetch(API_ROUTES.goals.bulk, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloads),
        credentials: "include",
      });

      if (queued) {
        message.success("Changes saved locally and will sync when you're back online.");
        clearDraft();
        return;
      }

      if (!ok) {
        const json = response ? await response.json().catch(() => ({})) : {};
        message.error(json?.error ?? "Error saving goals.");
        return;
      }

      const json = response ? await response.json().catch(() => ({})) : {};
      if (!json?.success) {
        message.error(json?.error ?? "Error saving goals.");
        return;
      }

      message.success(g.savedGoals as string);
      clearDraft();
    } catch {
      message.error("Error saving goals.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <FormDraftBanner
        status={draftStatus}
        lastSavedAt={draftLastSaved}
        onClear={() => clearDraft()}
      />
      <p className="text-xs text-ds-text-subtle">{g.bulkNote as string}</p>

      <div className="flex items-center gap-2 mb-2">
        <Button
          size="small"
          onClick={applyAllMetricsAcrossCampuses}
          disabled={Object.values(allMetricValues).every((v) => v == null)}
        >
          Apply all metric values to all campuses
        </Button>
        <span className="text-xs text-ds-text-subtle">
          Set per-metric values first and press this to propagate.
        </span>
      </div>

      <Collapse defaultActiveKey={templateSections.map((t) => t.templateId)} ghost>
        {templateSections.map((tmpl) => (
          <Collapse.Panel
            key={tmpl.templateId}
            header={
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ds-text-primary">
                  Template: {tmpl.templateName}
                </span>
                <span className="text-xs text-ds-text-subtle">
                  {tmpl.sections.reduce((acc, cur) => acc + cur.metrics.length, 0)} metrics
                </span>
              </div>
            }
          >
            {tmpl.sections.map(({ section, metrics }) => (
              <div
                key={section.id}
                className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden mb-4"
              >
                <div className="px-5 py-3 border-b border-ds-border-base bg-ds-surface">
                  <span className="font-semibold text-sm text-ds-text-primary">{section.name}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b border-ds-border-subtle text-xs text-ds-text-secondary">
                        <th className="text-left px-4 py-2 w-40 font-semibold">Metric</th>
                        <th className="text-center px-2 py-2 font-semibold w-40">Apply to all</th>
                        {campuses.map((campus) => (
                          <th key={campus.id} className="text-center px-2 py-2 font-semibold min-w-[110px]">
                            {campus.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric) => (
                        <tr key={metric.id} className="border-b border-ds-border-subtle last:border-none hover:bg-ds-surface/40">
                          <td className="px-4 py-2 text-ds-text-primary font-medium">{metric.name}</td>
                          <td className="px-2 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <InputNumber
                                size="small"
                                className="w-20"
                                min={0}
                                value={allMetricValues[metric.id]}
                                onChange={(v) =>
                                  setAllMetricValues((prev) => ({ ...prev, [metric.id]: v ?? undefined }))
                                }
                              />
                              <Button size="small" onClick={() => applyValueToAllCampuses(metric.id)}>
                                Set
                              </Button>
                            </div>
                          </td>
                          {campuses.map((campus) => {
                            const existing = goalMap[goalKey(campus.id, metric.id, year, GoalMode.ANNUAL)];
                            const isLocked = (existing?.isLocked ?? false) && !isSuperadmin;
                            const currentVal = matrixValues[campus.id]?.[metric.id] ?? existing?.targetValue;
                            return (
                              <td key={campus.id} className="px-2 py-2 text-center">
                                {isLocked ? (
                                  <Tooltip title={g.lockedNote as string}>
                                    <Tag icon={<LockOutlined />} color="orange">
                                      {existing?.targetValue?.toLocaleString() ?? "—"}
                                    </Tag>
                                  </Tooltip>
                                ) : (
                                  <InputNumber
                                    size="small"
                                    className="w-24 text-center"
                                    min={0}
                                    value={currentVal}
                                    disabled={!canEdit}
                                    placeholder="—"
                                    controls={false}
                                    onChange={(v) => setCellValue(campus.id, metric.id, v)}
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </Collapse.Panel>
        ))}
      </Collapse>

      {canEdit && mode === GoalMode.ANNUAL && (
        <div className="form-action-wrapper flex justify-end">
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveAll}>
            {g.saveAll as string}
          </Button>
        </div>
      )}
      {mode === GoalMode.MONTHLY && (
        <p className="text-xs text-ds-text-subtle text-right">
          Monthly goals are set per-campus. Use the individual campus tabs.
        </p>
      )}
    </div>
  );
}

/* ── GoalsPage ──────────────────────────────────────────────────────────────── */

export function GoalsPage() {
  const { user } = useAuth();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [mode, setMode] = useState<GoalMode>(GoalMode.ANNUAL);

  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);
  const { data: goals } = useApiData<Goal[]>(`${API_ROUTES.goals.list}?year=${year}`, [year]);
  const {
    data: goalEditRequests,
    loading: goalEditRequestsLoading,
    refetch: refetchGoalEditRequests,
  } = useApiData<any[]>(API_ROUTES.goals.editRequests);

  if (!user || !campuses || !templates || !goals) return <LoadingSkeleton rows={8} />;

  const write = canWrite(user.role);
  const seeAllCampuses = canSeeAllCampuses(user.role);
  const isSuperadmin = user.role === UserRole.SUPERADMIN;

  const visibleCampuses = seeAllCampuses
    ? user.role === UserRole.GROUP_ADMIN || user.role === UserRole.GROUP_PASTOR
      ? campuses.filter((c) => c.parentId === user.orgGroupId)
      : campuses
    : campuses.filter((c) => c.id === user.campusId);

  const handleApproveGoalEdit = async (requestId: string) => {
    try {
      const res = await fetch(API_ROUTES.goals.editRequestApprove(requestId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to approve request");
      message.success("Goal unlock request approved.");
      refetchGoalEditRequests();
    } catch {
      message.error("Failed to approve request.");
    }
  };

  const handleRejectGoalEdit = async (requestId: string) => {
    try {
      const res = await fetch(API_ROUTES.goals.editRequestReject(requestId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to reject request");
      message.success("Goal unlock request rejected.");
      refetchGoalEditRequests();
    } catch {
      message.error("Failed to reject request.");
    }
  };

  /* Build tab items */
  const campusTabs = visibleCampuses.map((campus) => ({
    key: campus.id,
    label: campus.name,
    children: (
      <BulkGoalTable
        campusId={campus.id}
        year={year}
        mode={mode}
        templates={templates}
        goals={goals}
        canEdit={write}
        isSuperadmin={isSuperadmin}
      />
    ),
  }));

  /* "All Campuses" overview tab — only for wide-view roles + annual mode */
  const allCampusesTab = seeAllCampuses
    ? [
        {
          key: "_all",
          label: (
            <span className="flex items-center gap-1.5">
              <GlobalOutlined />
              {g.allCampuses as string}
            </span>
          ),
          children: (
            <AllCampusesMatrix
              campuses={visibleCampuses}
              year={year}
              mode={mode}
              templates={templates}
              goals={goals}
              canEdit={write}
              isSuperadmin={isSuperadmin}
            />
          ),
        },
      ]
    : [];

  const tabItems = [...allCampusesTab, ...campusTabs];

  return (
    <PageLayout>
      <PageHeader
        title={g.pageTitle as string}
        subtitle={`${year} · ${ROLE_CONFIG[user.role]?.label ?? user.role}`}
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={mode}
              onChange={(v) => setMode(v as GoalMode)}
              options={MODE_OPTIONS}
              size="middle"
              style={{ width: 170 }}
            />
            <Select
              value={year}
              onChange={setYear}
              options={YEAR_OPTIONS}
              size="middle"
              style={{ width: 100 }}
            />
          </div>
        }
      />

      {goalEditRequestsLoading ? (
        <p className="text-xs text-ds-text-subtle">Loading unlock requests…</p>
      ) : goalEditRequests && goalEditRequests.length > 0 ? (
        <div className="bg-ds-surface-elevated p-4 rounded-ds-2xl border border-ds-border-base mb-4">
          <h3 className="font-semibold mb-2">Goal Unlock Requests</h3>
          <ul className="space-y-2">
            {goalEditRequests.map((req) => (
              <li
                key={req.id}
                className="p-3 rounded-ds-lg border border-ds-border-subtle flex justify-between items-start"
              >
                <div>
                  <p className="text-sm font-medium">{req.reason}</p>
                  <p className="text-xs text-ds-text-subtle">
                    {req.status} • requested by {req.requestedById}
                  </p>
                </div>
                <div className="space-x-2">
                  {req.status === GoalEditRequestStatus.PENDING && (
                    <>
                      <Button size="small" onClick={() => handleApproveGoalEdit(req.id)}>
                        {g.approveUnlock as string}
                      </Button>
                      <Button
                        size="small"
                        type="default"
                        onClick={() => handleRejectGoalEdit(req.id)}
                      >
                        {g.rejectUnlock as string}
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tabItems.length === 0 ? (
        <EmptyState
          icon={<TrophyOutlined />}
          title="No campuses assigned"
          description="You must be assigned to a campus to manage goals."
        />
      ) : (
        <ScrollArea className="mt-2">
          <Tabs items={tabItems} />
        </ScrollArea>
      )}
    </PageLayout>
  );
}
