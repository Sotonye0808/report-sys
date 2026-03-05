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

import { useState, useCallback } from "react";
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
import { useMockDbSubscription } from "@/lib/hooks/useMockDbSubscription";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { GoalMode, GoalEditRequestStatus, UserRole } from "@/types/global";

const g = CONTENT.goals as Record<string, unknown>;

/* ── Constants ─────────────────────────────────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(
  (y) => ({ value: y, label: String(y) }),
);
const MODE_OPTIONS = [
  { value: GoalMode.ANNUAL,  label: g.modeAnnual  as string },
  { value: GoalMode.MONTHLY, label: g.modeMonthly as string },
];
const MONTH_LABELS = g.months as string[];

const CAN_WRITE_ROLES: UserRole[] = [
  UserRole.GROUP_ADMIN, UserRole.GROUP_PASTOR,
  UserRole.SPO, UserRole.CEO, UserRole.CHURCH_MINISTRY,
  UserRole.SUPERADMIN,
];
const WIDE_VIEW_ROLES: UserRole[] = [
  UserRole.SPO, UserRole.CEO, UserRole.CHURCH_MINISTRY, UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN, UserRole.GROUP_PASTOR,
];

function canWrite(role: UserRole): boolean { return CAN_WRITE_ROLES.includes(role); }
function canSeeAllCampuses(role: UserRole): boolean { return WIDE_VIEW_ROLES.includes(role); }

/* ── Types ──────────────────────────────────────────────────────────────────── */

/** keyed by metricId */
type BulkGoalValues = Record<string, number | undefined>;
/** keyed by campusId then metricId (for all-campuses view) */
type MatrixValues = Record<string, BulkGoalValues>;

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

/* ── Unlock-request modal ───────────────────────────────────────────────────── */

interface UnlockModalProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function UnlockModal({ goal, open, onClose, onSuccess }: UnlockModalProps) {
  const [form]   = Form.useForm();
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
      if (!res.ok) { message.error(json.error ?? "Error"); return; }
      message.success("Unlock request submitted.");
      form.resetFields();
      onSuccess();
    } catch { message.error("Error"); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} title={g.requestUnlock as string} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="mt-4">
        <div className="text-xs text-ds-text-subtle mb-3">
          <strong>{goal.metricName}</strong>
          {" — current target: "}{goal.targetValue.toLocaleString()}
        </div>
        <Form.Item name="proposedValue" label={g.targetValueLabel as string}
          rules={[{ required: true, message: "Required" }]}>
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item name="reason" label={g.unlockReasonLabel as string}
          rules={[{ required: true, min: 10, message: "At least 10 characters." }]}>
          <Input.TextArea rows={3} placeholder={g.unlockReasonPlaceholder as string} />
        </Form.Item>
        <div className="flex gap-3 justify-end">
          <Button onClick={onClose}>{CONTENT.common.cancel as string}</Button>
          <Button type="primary" htmlType="submit" loading={saving}>{g.requestUnlock as string}</Button>
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
}

function BulkGoalTable({ campusId, year, mode, templates, goals, canEdit }: BulkGoalTableProps) {
  const goalMap = goalsToMap(goals.filter((g) => g.campusId === campusId));

  /** local edits: metricId -> { ann: number } | { months: Record<number, number> } */
  const [annValues,    setAnnValues]    = useState<BulkGoalValues>(() => {
    const init: BulkGoalValues = {};
    for (const goal of goals.filter((go) => go.campusId === campusId && go.mode === GoalMode.ANNUAL && go.year === year)) {
      init[goal.templateMetricId] = goal.targetValue;
    }
    return init;
  });
  const [monthValues,  setMonthValues]  = useState<Record<string, Record<number, number>>>(() => {
    const init: Record<string, Record<number, number>> = {};
    for (const goal of goals.filter((go) => go.campusId === campusId && go.mode === GoalMode.MONTHLY && go.year === year && go.month != null)) {
      if (!init[goal.templateMetricId]) init[goal.templateMetricId] = {};
      init[goal.templateMetricId][goal.month!] = goal.targetValue;
    }
    return init;
  });
  const [saving,       setSaving]       = useState(false);
  const [unlockGoal,   setUnlockGoal]   = useState<Goal | undefined>(undefined);

  /* Collect all goal-capturing metrics across all templates */
  const sections: Array<{ section: ReportTemplateSection; metrics: ReportTemplateMetric[] }> =
    templates.flatMap((tmpl) =>
      tmpl.sections
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
    );

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
            metricName:       sectionAndMetric.name,
            mode:             GoalMode.ANNUAL,
            year,
            targetValue:      val,
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
              metricName:       sectionAndMetric.name,
              mode:             GoalMode.MONTHLY,
              year,
              month:            Number(month),
              targetValue:      val,
            });
          }
        }
      }

      await Promise.all(
        payloads.map((payload) =>
          fetch(API_ROUTES.goals.list, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        ),
      );

      message.success(g.savedGoals as string);
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic ?? "Error saving goals.");
    } finally {
      setSaving(false);
    }
  };

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={<TrophyOutlined />}
        title={(g.emptyState as Record<string, string>)?.title}
        description="No goal-capturing metrics found in active templates."
      />
    );
  }

  /* Build Collapse panels — one per section */
  const collapseItems = sections.map(({ section, metrics }) => ({
    key: section.id,
    label: (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ds-text-primary">{section.name}</span>
        <span className="text-xs text-ds-text-subtle">
          {metrics.length} goal metric{metrics.length !== 1 ? "s" : ""}
        </span>
      </div>
    ),
    children: (
      <div className="space-y-0">
        {/* Column headers */}
        <div className={`grid gap-3 pb-2 border-b border-ds-border-subtle text-xs font-semibold text-ds-text-secondary ${mode === GoalMode.MONTHLY ? "grid-cols-[200px_1fr]" : "grid-cols-[200px_160px_120px]"}`}>
          <span>{g.metricColumn as string}</span>
          {mode === GoalMode.ANNUAL ? (
            <>
              <span>{g.annualTargetShort as string}</span>
              <span className="text-right">Status</span>
            </>
          ) : (
            <div className="grid grid-cols-12 gap-1">
              {MONTH_LABELS.map((lbl) => (
                <span key={lbl} className="text-center truncate">{lbl}</span>
              ))}
            </div>
          )}
        </div>

        {metrics.map((metric) => {
          const existingGoal =
            mode === GoalMode.ANNUAL
              ? goalMap[goalKey(campusId, metric.id, year, GoalMode.ANNUAL)]
              : undefined;
          const isLocked = existingGoal?.isLocked ?? false;

          return (
            <div
              key={metric.id}
              className={`grid gap-3 py-3 border-b border-ds-border-subtle last:border-none items-center ${mode === GoalMode.MONTHLY ? "grid-cols-[200px_1fr]" : "grid-cols-[200px_160px_120px]"}`}
            >
              {/* Metric name */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm text-ds-text-primary truncate">{metric.name}</span>
                {isLocked && (
                  <Tooltip title={g.lockedNote as string}>
                    <LockOutlined className="text-orange-400 text-xs shrink-0" />
                  </Tooltip>
                )}
              </div>

              {mode === GoalMode.ANNUAL ? (
                <>
                  {/* Annual target input */}
                  <InputNumber
                    className="w-full"
                    min={0}
                    value={annValues[metric.id]}
                    disabled={!canEdit || isLocked}
                    placeholder={g.noGoalSet as string}
                    onChange={(v) =>
                      setAnnValues((prev) => ({ ...prev, [metric.id]: v ?? undefined }))
                    }
                  />
                  {/* Lock / edit action */}
                  <div className="flex justify-end">
                    {isLocked ? (
                      <Button
                        size="small"
                        icon={<UnlockOutlined />}
                        onClick={() => setUnlockGoal(existingGoal)}
                      >
                        {g.requestUnlock as string}
                      </Button>
                    ) : existingGoal ? (
                      <Tag color="green">
                        <UnlockOutlined className="mr-1" />
                        Set
                      </Tag>
                    ) : (
                      <Tag color="default">{g.noGoalSet as string}</Tag>
                    )}
                  </div>
                </>
              ) : (
                /* Monthly mode — 12 mini inputs */
                <div className="grid grid-cols-12 gap-1">
                  {MONTH_LABELS.map((_, idx) => {
                    const month = idx + 1;
                    const monthGoal = goalMap[goalKey(campusId, metric.id, year, GoalMode.MONTHLY, month)];
                    const monthLocked = monthGoal?.isLocked ?? false;
                    return (
                      <InputNumber
                        key={month}
                        size="small"
                        className="w-full"
                        min={0}
                        value={monthValues[metric.id]?.[month] ?? (monthGoal?.targetValue)}
                        disabled={!canEdit || monthLocked}
                        placeholder="0"
                        controls={false}
                        onChange={(v) =>
                          setMonthValues((prev) => ({
                            ...prev,
                            [metric.id]: { ...(prev[metric.id] ?? {}), [month]: v ?? 0 },
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
    ),
  }));

  return (
    <div className="space-y-4">
      <Collapse
        items={collapseItems}
        defaultActiveKey={collapseItems.map((i) => i.key)}
        className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl overflow-hidden"
      />

      {canEdit && (
        <div className="flex justify-end">
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
}

function AllCampusesMatrix({ campuses, year, mode, templates, goals, canEdit }: AllCampusesMatrixProps) {
  const goalMap = goalsToMap(goals);
  /** campusId -> metricId -> value */
  const [matrixValues, setMatrixValues] = useState<MatrixValues>(() => {
    const init: MatrixValues = {};
    for (const goal of goals.filter((go) => go.mode === mode && go.year === year)) {
      if (!init[goal.campusId]) init[goal.campusId] = {};
      init[goal.campusId][goal.templateMetricId] = goal.targetValue;
    }
    return init;
  });
  const [saving, setSaving] = useState(false);

  const sections: Array<{ section: ReportTemplateSection; metrics: ReportTemplateMetric[] }> =
    templates.flatMap((tmpl) =>
      tmpl.sections
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
    );

  const setCellValue = (campusId: string, metricId: string, v: number | null) =>
    setMatrixValues((prev) => ({
      ...prev,
      [campusId]: { ...(prev[campusId] ?? {}), [metricId]: v ?? undefined },
    }));

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
            campusId, templateMetricId: metricId, metricName: metric.name,
            mode: GoalMode.ANNUAL, year, targetValue: val,
          });
        }
      }
      await Promise.all(
        payloads.map((payload) =>
          fetch(API_ROUTES.goals.list, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        ),
      );
      message.success(g.savedGoals as string);
    } catch {
      message.error("Error saving goals.");
    } finally {
      setSaving(false);
    }
  };

  if (sections.length === 0) {
    return (
      <EmptyState icon={<TrophyOutlined />}
        title="No goal metrics found"
        description="No metrics with goal-capturing enabled exist in active templates."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-ds-text-subtle">{g.bulkNote as string}</p>

      {sections.map(({ section, metrics }) => (
        <div key={section.id} className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden">
          <div className="px-5 py-3 border-b border-ds-border-base bg-ds-surface">
            <span className="font-semibold text-sm text-ds-text-primary">{section.name}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-ds-border-subtle text-xs text-ds-text-secondary">
                  <th className="text-left px-4 py-2 w-40 font-semibold">Metric</th>
                  {campuses.map((campus) => (
                    <th key={campus.id} className="text-center px-2 py-2 font-semibold min-w-[110px]">
                      {campus.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => {
                  return (
                    <tr key={metric.id} className="border-b border-ds-border-subtle last:border-none hover:bg-ds-surface/40">
                      <td className="px-4 py-2 text-ds-text-primary font-medium">{metric.name}</td>
                      {campuses.map((campus) => {
                        const existing = goalMap[goalKey(campus.id, metric.id, year, GoalMode.ANNUAL)];
                        const isLocked = existing?.isLocked ?? false;
                        const currentVal =
                          matrixValues[campus.id]?.[metric.id] ?? existing?.targetValue;
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {canEdit && mode === GoalMode.ANNUAL && (
        <div className="flex justify-end">
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
  const [year, setYear]   = useState(CURRENT_YEAR);
  const [mode, setMode]   = useState<GoalMode>(GoalMode.ANNUAL);

  const campuses = useMockDbSubscription<Campus[]>("campuses", async () =>
    mockDb.campuses.findMany(),
  );
  const templates = useMockDbSubscription<ReportTemplate[]>("reportTemplates", async () =>
    mockDb.reportTemplates.findMany({ where: (t: ReportTemplate) => t.isActive }),
  );
  const goals = useMockDbSubscription<Goal[]>("goals", async () =>
    mockDb.goals.findMany({ where: (goalItem: Goal) => goalItem.year === year }),
  );

  if (!user || !campuses || !templates || !goals) return <LoadingSkeleton rows={8} />;

  const write          = canWrite(user.role);
  const seeAllCampuses = canSeeAllCampuses(user.role);

  const visibleCampuses = seeAllCampuses
    ? campuses
    : campuses.filter((c) => c.id === user.campusId);

  /* Build tab items */
  const campusTabs = visibleCampuses.map((campus) => ({
    key:      campus.id,
    label:    campus.name,
    children: (
      <BulkGoalTable
        campusId={campus.id}
        year={year}
        mode={mode}
        templates={templates}
        goals={goals}
        canEdit={write}
      />
    ),
  }));

  /* "All Campuses" overview tab — only for wide-view roles + annual mode */
  const allCampusesTab = seeAllCampuses
    ? [{
        key:   "_all",
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
          />
        ),
      }]
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

      {tabItems.length === 0 ? (
        <EmptyState
          icon={<TrophyOutlined />}
          title="No campuses assigned"
          description="You must be assigned to a campus to manage goals."
        />
      ) : (
        <Tabs items={tabItems} className="mt-2" />
      )}
    </PageLayout>
  );
}
