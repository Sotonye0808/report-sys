"use client";

/**
 * modules/templates/components/TemplateNewPage.tsx
 * Create a new report template — sections → metrics structure.
 * Mirrors TemplateDetailPage architecture.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Switch, Select, Collapse, Badge, Modal, Tag, Tooltip } from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
  TrophyOutlined,
  SettingOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useFormPersistence } from "@/lib/hooks/useFormPersistence";
import { offlineFetch } from "@/lib/utils/offlineFetch";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { MetricFieldType, MetricCalculationType, ReportDeadlinePolicy } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { FormDraftBanner } from "@/components/ui/FormDraftBanner";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters";

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
  order: number;
}

interface DraftSection {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  order: number;
  metrics: DraftMetric[];
}

interface MetricRowProps {
  metric: DraftMetric;
  onChange: (patch: Partial<DraftMetric>) => void;
  onRemove: () => void;
}

/**
 * Forms-style MetricRow: blank canvas by default (just the inline name +
 * settings cog + delete), settings palette opens on demand. Mirrors the
 * pattern in TemplateDetailPage so the create + edit flows look identical.
 *
 * Note (2026-05-04): the create + edit flows still keep their own copy of
 * MetricRow. A shared `<TemplateBuilder>` extraction is queued in
 * task-queue.md → Backlog to prevent future drift.
 */
function MetricRow({ metric, onChange, onRemove }: MetricRowProps) {
  type BoolKey = "isRequired" | "capturesGoal" | "capturesAchieved" | "capturesYoY";
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
  ];

  const [settingsOpen, setSettingsOpen] = useState(false);
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
        </div>
      )}
    </div>
  );
}

/**
 * Hidden-by-default panel for section description + isRequired. Auto-opens
 * when the section already has non-default config so admins don't lose it.
 */
interface SectionSettingsPaletteProps {
  section: DraftSection;
  onChange: (patch: Partial<DraftSection>) => void;
}

function SectionSettingsPalette({ section, onChange }: SectionSettingsPaletteProps) {
  const [open, setOpen] = useState(false);
  const hasNonDefaultConfig = Boolean(section.description) || section.isRequired === false;
  const isOpen = open || hasNonDefaultConfig;

  return (
    <div className="rounded-ds-md border border-dashed border-ds-border-subtle bg-ds-surface-base/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-ds-text-secondary hover:bg-ds-surface-sunken/40 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="inline-flex items-center gap-1.5">
          <SettingOutlined />
          Section settings
        </span>
        <span className="text-[10px] text-ds-text-subtle">{isOpen ? "Hide" : "Show"}</span>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-ds-border-subtle">
          <Input
            value={section.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Description (optional)"
            variant="borderless"
            className="!text-sm !text-ds-text-secondary !px-0"
            aria-label="Section description"
          />
          <Tooltip title="Required sections must be filled before the report can be submitted.">
            <span className="inline-flex items-center gap-1.5 text-xs text-ds-text-secondary">
              <Switch
                size="small"
                checked={section.isRequired}
                onChange={(v) => onChange({ isRequired: v })}
              />
              {CONTENT.templates.isRequiredLabel as string}
              <InfoCircleOutlined className="text-ds-text-subtle" />
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function makeEmptyMetric(order: number): DraftMetric {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    fieldType: MetricFieldType.NUMBER,
    calculationType: MetricCalculationType.SUM,
    isRequired: true,
    capturesGoal: true,
    capturesAchieved: true,
    capturesYoY: false,
    order,
  };
}

function makeEmptySection(order: number): DraftSection {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    isRequired: true,
    order,
    metrics: [makeEmptyMetric(1)],
  };
}

interface HeaderFormValues {
  name: string;
  description: string;
  isDefault: boolean;
  deadlinePolicy: ReportDeadlinePolicy;
  deadlineOffsetHours?: number;
}

export function TemplateNewPage() {
  const router = useRouter();
  const [form] = Form.useForm<HeaderFormValues>();
  const [sections, setSections] = useState<DraftSection[]>(() => [makeEmptySection(1)]);
  const [saving, setSaving] = useState(false);
  const [goalPromptVisible, setGoalPromptVisible] = useState(false);
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(null);

  const draftKey = "draft:template:new";

  const {
    status: draftStatus,
    lastSavedAt: draftLastSaved,
    clearDraft,
  } = useFormPersistence<{ formValues: HeaderFormValues; sections: DraftSection[] }>({
    formKey: draftKey,
    formState: {
      formValues: form.getFieldsValue(true) as HeaderFormValues,
      sections,
    },
    onRestore: (draft) => {
      form.setFieldsValue(draft.formValues);
      setSections(draft.sections);
    },
    enabled: true,
  });

  // Keep first-visit form initialization from empty to default segments.
  useEffect(() => {
    if (!sections || sections.length === 0) {
      setSections([makeEmptySection(1)]);
    }
  }, [sections]);

  /* ── Section helpers ────────────────────────────────────────── */
  const addSection = () => setSections((prev) => [...prev, makeEmptySection(prev.length + 1)]);

  const removeSection = (sId: string) => setSections((prev) => prev.filter((s) => s.id !== sId));

  const updateSection = (sId: string, patch: Partial<DraftSection>) =>
    setSections((prev) => prev.map((s) => (s.id === sId ? { ...s, ...patch } : s)));

  /* ── Metric helpers ─────────────────────────────────────────── */
  const addMetric = (sId: string) =>
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sId) return s;
        return { ...s, metrics: [...s.metrics, makeEmptyMetric(s.metrics.length + 1)] };
      }),
    );

  const removeMetric = (sId: string, mId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sId ? { ...s, metrics: s.metrics.filter((m) => m.id !== mId) } : s,
      ),
    );

  const updateMetric = (sId: string, mId: string, patch: Partial<DraftMetric>) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sId
          ? { ...s, metrics: s.metrics.map((m) => (m.id === mId ? { ...m, ...patch } : m)) }
          : s,
      ),
    );

  /* ── Save ───────────────────────────────────────────────────── */
  const handleSubmit = async (values: HeaderFormValues) => {
    setSaving(true);
    try {
      if (sections.find((s) => !s.name.trim())) {
        message.error("All sections must have a name.");
        setSaving(false);
        return;
      }
      for (const s of sections) {
        if (s.metrics.length === 0) {
          message.error(`Section "${s.name}" must have at least one metric.`);
          setSaving(false);
          return;
        }
        if (s.metrics.find((m) => !m.name.trim())) {
          message.error(`All metrics in "${s.name}" must have a name.`);
          setSaving(false);
          return;
        }
      }

      const payload = {
        name: values.name.trim(),
        description: values.description || undefined,
        isDefault: values.isDefault,
        deadlinePolicy: values.deadlinePolicy ?? ReportDeadlinePolicy.PERIOD_END,
        deadlineOffsetHours: values.deadlineOffsetHours ?? 48,
        organisationId: ORG_ID,
        sections: sections.map((s, si) => ({
          id: s.id,
          name: s.name.trim(),
          description: s.description || undefined,
          isRequired: s.isRequired,
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
            order: mi + 1,
          })),
        })),
      };

      const { ok, queued, response } = await offlineFetch(API_ROUTES.reportTemplates.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (queued) {
        message.success("Saved locally and will sync when you're back online.");
        clearDraft();
        router.push(APP_ROUTES.templates);
        return;
      }

      const json = response ? await response.json().catch(() => ({})) : {};
      if (!ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        setSaving(false);
        return;
      }
      message.success(CONTENT.templates.templateCreated as string);
      // If any metric captures goals, prompt to set goals now
      const hasGoalMetrics = sections.some((s) => s.metrics.some((m) => m.capturesGoal));
      clearDraft();
      if (hasGoalMetrics && json.data?.id) {
        setCreatedTemplateId(json.data.id);
        setGoalPromptVisible(true);
      } else {
        router.push(APP_ROUTES.templates);
      }
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const totalMetrics = sections.reduce((n, s) => n + s.metrics.length, 0);

  return (
    <>
      <PageLayout
        title={CONTENT.templates.newTemplate as string}
        actions={
          <Button onClick={() => router.push(APP_ROUTES.templates)}>
            {CONTENT.common.cancel as string}
          </Button>
        }
      >
        <FormDraftBanner
          status={draftStatus}
          lastSavedAt={draftLastSaved}
          onClear={() => {
            clearDraft();
          }}
        />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            isDefault: false,
            deadlinePolicy: ReportDeadlinePolicy.PERIOD_END,
            deadlineOffsetHours: 48,
          }}
        >
          <div className="max-w-4xl space-y-6 form-scroll-container">
            {/* Metadata card */}
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 space-y-4">
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
              <Form.Item
                name="deadlinePolicy"
                label="Report deadline policy"
                initialValue={ReportDeadlinePolicy.PERIOD_END}
              >
                <Select size="large" options={DEADLINE_POLICY_OPTIONS} />
              </Form.Item>
              <Form.Item
                name="deadlineOffsetHours"
                label="Deadline offset (hours, for fixed hours policy)"
                initialValue={48}
              >
                <Input type="number" min={1} max={168} />
              </Form.Item>
              <div className="flex items-center gap-2">
                <Form.Item name="isDefault" valuePropName="checked" noStyle>
                  <Switch size="small" />
                </Form.Item>
                <span className="text-sm text-ds-text-secondary">
                  {CONTENT.templates.setDefault as string}
                </span>
              </div>
            </div>

            {/* Sections + metrics */}
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-ds-text-primary">
                    {CONTENT.templates.sectionsLabel as string}
                    <Badge
                      count={sections.length}
                      className="ml-2"
                      style={{ backgroundColor: "var(--ds-brand-accent)" }}
                    />
                  </h3>
                  <p className="text-xs text-ds-text-subtle mt-0.5">
                    {totalMetrics} metric{totalMetrics === 1 ? "" : "s"} across {sections.length}{" "}
                    section{sections.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Button icon={<PlusOutlined />} size="small" onClick={addSection}>
                  {CONTENT.templates.addSection as string}
                </Button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-10 text-ds-text-subtle text-sm">
                  {CONTENT.templates.emptySections as string}
                </div>
              ) : (
                <Collapse
                  accordion={false}
                  defaultActiveKey={sections.map((s) => s.id)}
                  items={sections.map((section, si) => ({
                    key: section.id,
                    /*
                      Section dropdown header IS the borderless inline name input.
                      Click + key + mousedown propagation is stopped so editing
                      doesn't accidentally collapse the section.
                    */
                    label: (
                      <div className="flex items-center gap-2 min-w-0 w-full">
                        <DragOutlined className="text-ds-text-subtle flex-shrink-0" />
                        <Input
                          value={section.name}
                          onChange={(e) => updateSection(section.id, { name: e.target.value })}
                          placeholder={`${CONTENT.templates.sectionLabel as string} ${si + 1} name`}
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
                          onChange={(patch) => updateSection(section.id, patch)}
                        />

                        {/* Metrics list */}
                        <div className="space-y-2">
                          {section.metrics.length === 0 && (
                            <p className="text-xs text-ds-text-subtle py-2">
                              {CONTENT.templates.emptyMetrics as string}
                            </p>
                          )}
                          {section.metrics.map((metric) => (
                            <MetricRow
                              key={metric.id}
                              metric={metric}
                              onChange={(patch) => updateMetric(section.id, metric.id, patch)}
                              onRemove={() => removeMetric(section.id, metric.id)}
                            />
                          ))}
                        </div>

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
                            {CONTENT.templates.removeSection as string}
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
                {CONTENT.templates.createTemplate as string}
              </Button>
            </div>
          </div>
        </Form>
      </PageLayout>

      {/* Goal-set prompt modal */}
      <Modal
        open={goalPromptVisible}
        title={
          <div className="flex items-center gap-2">
            <TrophyOutlined className="text-ds-brand-accent" />
            <span>{CONTENT.templates.goalPromptTitle as string}</span>
          </div>
        }
        footer={[
          <Button
            key="later"
            onClick={() => {
              setGoalPromptVisible(false);
              router.push(APP_ROUTES.templates);
            }}
          >
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
        onCancel={() => {
          setGoalPromptVisible(false);
          router.push(APP_ROUTES.templates);
        }}
        closable={false}
      >
        <p className="text-sm text-ds-text-secondary py-2">
          {CONTENT.templates.goalPromptDescription as string}
        </p>
        {createdTemplateId && (
          <p className="text-xs text-ds-text-subtle">
            Template ID: <code className="font-ds-mono">{createdTemplateId}</code>
          </p>
        )}
      </Modal>
    </>
  );
}
