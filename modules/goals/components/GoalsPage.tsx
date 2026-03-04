"use client";

/**
 * modules/goals/components/GoalsPage.tsx
 * Goals management — GROUP_ADMIN and above can set/view goals per campus.
 * Goals are linked to template metrics and set per year (annual or monthly).
 */

import { useState, useEffect, useCallback } from "react";
import {
  Form,
  InputNumber,
  Select,
  Tag,
  Tooltip,
  message,
  Modal,
  Tabs,
} from "antd";
import {
  TrophyOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
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

/* ─────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(
  (y) => ({ value: y, label: String(y) }),
);

const MODE_OPTIONS = [
  { value: GoalMode.ANNUAL,  label: g.modeAnnual  as string },
  { value: GoalMode.MONTHLY, label: g.modeMonthly as string },
];

const MONTH_LABELS = (g.months as string[]);

/* Roles that can SET goals (write access) */
const CAN_SET_GOALS: UserRole[] = [
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
  UserRole.SUPERADMIN,
];

function canWrite(role: UserRole): boolean {
  return CAN_SET_GOALS.includes(role);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Unlock-request modal                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

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
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success("Unlock request submitted.");
      form.resetFields();
      onSuccess();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
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
      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="mt-4">
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
          rules={[{ required: true, min: 10, message: "Please provide at least 10 characters." }]}
        >
          <Input.TextArea
            rows={3}
            placeholder={g.unlockReasonPlaceholder as string}
          />
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

/* ─────────────────────────────────────────────────────────────────────────── */
/* Goal row                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

interface GoalRowProps {
  goal: Goal;
  canEdit: boolean;
  onEdit: (goal: Goal) => void;
  onRequestUnlock: (goal: Goal) => void;
}

function GoalRow({ goal, canEdit, onEdit, onRequestUnlock }: GoalRowProps) {
  const isLocked = goal.isLocked;

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-ds-border-subtle last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ds-text-primary truncate">
            {goal.metricName}
          </span>
          {isLocked ? (
            <Tag color="orange" className="flex items-center gap-1">
              <LockOutlined className="text-xs" />
              {g.lockedBadge as string}
            </Tag>
          ) : (
            <Tag color="green">
              <UnlockOutlined className="text-xs mr-1" />
              {goal.mode === GoalMode.ANNUAL ? (g.modeAnnual as string).split("\u2014")[0].trim() : (g.modeMonthly as string).split("\u2014")[0].trim()}
            </Tag>
          )}
        </div>
        <p className="text-xs text-ds-text-subtle mt-0.5">
          {goal.year}
          {goal.month != null ? ` · ${MONTH_LABELS[goal.month - 1]}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="text-lg font-bold text-ds-brand-accent">{goal.targetValue.toLocaleString()}</p>
          <p className="text-xs text-ds-text-subtle">{g.targetValueLabel as string}</p>
        </div>
        {canEdit && (
          isLocked ? (
            <Tooltip title={g.lockedNote as string}>
              <Button size="small" icon={<UnlockOutlined />} onClick={() => onRequestUnlock(goal)}>
                {g.requestUnlock as string}
              </Button>
            </Tooltip>
          ) : (
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(goal)}>
              {CONTENT.common.edit as string}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Goal set / edit form                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

interface GoalFormValues {
  templateMetricId: string;
  metricName: string;
  mode: GoalMode;
  year: number;
  targetValue: number;
  months?: Record<number, number>; // month (1-12) → target
}

interface SetGoalFormProps {
  campusId: string;
  templates: ReportTemplate[];
  existingGoal?: Goal;
  onSaved: () => void;
  onCancel: () => void;
}

function SetGoalForm({ campusId, templates, existingGoal, onSaved, onCancel }: SetGoalFormProps) {
  const [form] = Form.useForm<GoalFormValues>();
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<GoalMode>(existingGoal?.mode ?? GoalMode.ANNUAL);
  const [monthTargets, setMonthTargets] = useState<Record<number, number>>(
    existingGoal?.mode === GoalMode.MONTHLY && existingGoal?.month != null
      ? { [existingGoal.month]: existingGoal.targetValue }
      : {},
  );

  // Build metric options from all active templates
  const metricOptions = templates.flatMap((tmpl) =>
    tmpl.sections.flatMap((sec) =>
      sec.metrics
        .filter((m) => m.capturesGoal)
        .map((m) => ({
          value: m.id,
          label: `${tmpl.name} › ${sec.name} › ${m.name}`,
          metricName: m.name,
        })),
    ),
  );

  const handleSubmit = async (values: GoalFormValues) => {
    setSaving(true);
    try {
      if (mode === GoalMode.MONTHLY) {
        // Submit one goal per month set
        const monthEntries = Object.entries(monthTargets).map(([month, val]) => ({
          campusId,
          templateMetricId: values.templateMetricId,
          metricName: values.metricName,
          mode: GoalMode.MONTHLY,
          year:  values.year,
          month: Number(month),
          targetValue: val,
        }));

        await Promise.all(
          monthEntries.map((payload) =>
            fetch(API_ROUTES.goals.list, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }),
          ),
        );
      } else {
        const payload = {
          campusId,
          templateMetricId: values.templateMetricId,
          metricName: values.metricName,
          mode: GoalMode.ANNUAL,
          year: values.year,
          targetValue: values.targetValue,
        };
        const res = await fetch(API_ROUTES.goals.list, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json();
          message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
          return;
        }
      }

      message.success(g.savedGoals as string);
      form.resetFields();
      onSaved();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  const selectedMetric = metricOptions.find(
    (m) => m.value === form.getFieldValue("templateMetricId"),
  );

  return (
    <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 mb-6">
      <h3 className="text-sm font-semibold text-ds-text-primary mb-4">
        {existingGoal ? (g.editGoal as string) : (g.setGoal as string)}
      </h3>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        initialValues={{
          templateMetricId: existingGoal?.templateMetricId,
          mode: existingGoal?.mode ?? GoalMode.ANNUAL,
          year: existingGoal?.year ?? CURRENT_YEAR,
          targetValue: existingGoal?.targetValue,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Form.Item
            name="templateMetricId"
            label={g.templateLabel as string}
            rules={[{ required: true, message: "Required" }]}
            className="sm:col-span-2"
          >
            <Select
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              options={(metricOptions.length > 0 ? metricOptions : [{ value: "", label: g.noTemplate as string, disabled: true }]) as any[]}
              onChange={(val) => {
                const opt = metricOptions.find((m) => m.value === val);
                if (opt) form.setFieldValue("metricName", opt.metricName);
              }}
              showSearch
              placeholder="Select a metric"
              filterOption={(input, opt) =>
                (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="metricName" hidden><Input /></Form.Item>

          <Form.Item name="year" label={g.yearLabel as string} rules={[{ required: true }]}>
            <Select options={YEAR_OPTIONS} />
          </Form.Item>

          <Form.Item name="mode" label={g.modeLabel as string} rules={[{ required: true }]}>
            <Select
              options={MODE_OPTIONS}
              onChange={(v) => setMode(v as GoalMode)}
            />
          </Form.Item>
        </div>

        {mode === GoalMode.ANNUAL && (
          <Form.Item
            name="targetValue"
            label={g.annualTargetLabel as string}
            rules={[{ required: true, message: "Required" }]}
          >
            <InputNumber min={0} className="w-full" placeholder="e.g. 1200" />
          </Form.Item>
        )}

        {mode === GoalMode.MONTHLY && (
          <div className="mt-2 mb-4">
            <p className="text-xs font-medium text-ds-text-secondary mb-3">
              {selectedMetric?.metricName ?? ""} — {g.modeMonthly as string}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {MONTH_LABELS.map((label, idx) => {
                const month = idx + 1;
                return (
                  <div key={month}>
                    <label className="text-xs text-ds-text-subtle block mb-1">{label}</label>
                    <InputNumber
                      min={0}
                      value={monthTargets[month]}
                      onChange={(v) =>
                        setMonthTargets((prev) => ({
                          ...prev,
                          [month]: v ?? 0,
                        }))
                      }
                      className="w-full"
                      size="small"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel}>{CONTENT.common.cancel as string}</Button>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            {g.saveGoals as string}
          </Button>
        </div>
      </Form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Goals list for a campus + year                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

interface GoalsListProps {
  campusId: string;
  year: number;
  canEdit: boolean;
}

function GoalsList({ campusId, year, canEdit }: GoalsListProps) {
  const [showForm, setShowForm]   = useState(false);
  const [editGoal, setEditGoal]   = useState<Goal | undefined>(undefined);
  const [unlockGoal, setUnlockGoal] = useState<Goal | undefined>(undefined);

  const templates = useMockDbSubscription<ReportTemplate[]>("reportTemplates", async () =>
    mockDb.reportTemplates.findMany({ where: (t: ReportTemplate) => t.isActive }),
  );

  const goals = useMockDbSubscription<Goal[]>("goals", async () =>
    mockDb.goals.findMany({
      where: (g: Goal) => g.campusId === campusId && g.year === year,
    }),
  );

  const handleSaved = () => {
    setShowForm(false);
    setEditGoal(undefined);
  };

  if (!goals || !templates) return <LoadingSkeleton rows={4} />;

  return (
    <div>
      {/* New-goal / edit-goal form */}
      {(showForm || editGoal) && (
        <SetGoalForm
          campusId={campusId}
          templates={templates}
          existingGoal={editGoal}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditGoal(undefined); }}
        />
      )}

      {/* List */}
      {goals.length === 0 && !showForm && !editGoal ? (
        <EmptyState
          icon={<TrophyOutlined />}
          title={(g.emptyState as Record<string, string>)?.title}
          description={(g.emptyState as Record<string, string>)?.description}
          action={
            canEdit ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
                {g.setGoal as string}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {goals.length > 0 && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
              {goals.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  canEdit={canEdit}
                  onEdit={(g) => { setEditGoal(g); setShowForm(false); }}
                  onRequestUnlock={(g) => setUnlockGoal(g)}
                />
              ))}
            </div>
          )}
          {canEdit && !showForm && !editGoal && (
            <div className="mt-4">
              <Button icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
                {g.setGoal as string}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Unlock request modal */}
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

/* ─────────────────────────────────────────────────────────────────────────── */
/* GoalsPage                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

export function GoalsPage() {
  const { user }   = useAuth();
  const [year, setYear]   = useState(CURRENT_YEAR);

  const campuses = useMockDbSubscription<Campus[]>("campuses", async () =>
    mockDb.campuses.findMany(),
  );

  if (!user) return <LoadingSkeleton rows={6} />;
  if (!campuses) return <LoadingSkeleton rows={6} />;

  const write = canWrite(user.role);

  // For non-super-admins, filter to their own campus only
  const visibleCampuses =
    user.role === UserRole.SUPERADMIN ||
    user.role === UserRole.SPO ||
    user.role === UserRole.CEO ||
    user.role === UserRole.CHURCH_MINISTRY
      ? campuses
      : campuses.filter((c) => c.id === user.campusId);

  const tabItems = visibleCampuses.map((campus) => ({
    key: campus.id,
    label: campus.name,
    children: (
      <GoalsList
        campusId={campus.id}
        year={year}
        canEdit={write}
      />
    ),
  }));

  return (
    <PageLayout>
      <PageHeader
        title={g.pageTitle as string}
        subtitle={`${year} · ${ROLE_CONFIG[user.role]?.label ?? user.role}`}
        actions={
          <Select
            value={year}
            onChange={setYear}
            options={YEAR_OPTIONS}
            size="middle"
            style={{ width: 110 }}
          />
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
