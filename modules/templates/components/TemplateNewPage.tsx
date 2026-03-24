"use client";

/**
 * modules/templates/components/TemplateNewPage.tsx
 * Create a new report template — sections → metrics structure.
 * Mirrors TemplateDetailPage architecture.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Switch, Select, Collapse, Badge, Modal } from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useDraftCache } from "@/lib/hooks/useDraftCache";
import { offlineFetch } from "@/lib/utils/offlineFetch";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { MetricFieldType, MetricCalculationType } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";

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

function MetricRow({ metric, onChange, onRemove }: MetricRowProps) {
  type BoolKey = "isRequired" | "capturesGoal" | "capturesAchieved" | "capturesYoY";
  const TOGGLES: { key: BoolKey; label: string }[] = [
    { key: "isRequired", label: CONTENT.templates.isRequiredLabel as string },
    { key: "capturesGoal", label: CONTENT.templates.capturesGoalLabel as string },
    { key: "capturesAchieved", label: CONTENT.templates.capturesAchievedLabel as string },
    { key: "capturesYoY", label: CONTENT.templates.capturesYoYLabel as string },
  ];

  return (
    <div className="p-4 bg-ds-surface-sunken rounded-ds-lg border border-ds-border-subtle space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.metricNameLabel as string} *
          </label>
          <Input
            size="middle"
            value={metric.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Total Attendance"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.fieldTypeLabel as string}
          </label>
          <Select
            size="middle"
            value={metric.fieldType}
            options={FIELD_TYPE_OPTIONS}
            onChange={(v) => onChange({ fieldType: v })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.calculationTypeLabel as string}
          </label>
          <Select
            size="middle"
            value={metric.calculationType}
            options={CALC_TYPE_OPTIONS}
            onChange={(v) => onChange({ calculationType: v })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap gap-4">
          {TOGGLES.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <Switch
                size="small"
                checked={metric[key] as boolean}
                onChange={(v) => onChange({ [key]: v })}
              />
              <span className="text-xs text-ds-text-secondary">{label}</span>
            </div>
          ))}
        </div>
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} />
      </div>
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
}

export function TemplateNewPage() {
  const router = useRouter();
  const [form] = Form.useForm<HeaderFormValues>();
  const [sections, setSections] = useState<DraftSection[]>(() => [makeEmptySection(1)]);
  const [saving, setSaving] = useState(false);
  const [goalPromptVisible, setGoalPromptVisible] = useState(false);
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(null);

  const {
    cachedDraft,
    isLoaded: isDraftLoaded,
    saveDraft,
    clearDraft,
  } = useDraftCache<{ formValues: HeaderFormValues; sections: DraftSection[] }>(
    "draft:template:new",
  );
  const draftRestoredRef = useRef(false);

  useEffect(() => {
    if (isDraftLoaded && cachedDraft && !draftRestoredRef.current) {
      draftRestoredRef.current = true;
      form.setFieldsValue(cachedDraft.formValues);
      setSections(cachedDraft.sections);
    }
  }, [cachedDraft, isDraftLoaded, form]);

  useEffect(() => {
    if (!draftRestoredRef.current) return;
    saveDraft({
      formValues: form.getFieldsValue(true) as HeaderFormValues,
      sections,
    });
  }, [form, sections, saveDraft]);

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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ isDefault: false }}
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
                    label: (
                      <div className="flex items-center gap-3 min-w-0">
                        <DragOutlined className="text-ds-text-subtle flex-shrink-0" />
                        <span className="font-medium text-ds-text-primary truncate">
                          {section.name || `${CONTENT.templates.sectionLabel as string} ${si + 1}`}
                        </span>
                        <span className="text-xs text-ds-text-subtle flex-shrink-0">
                          {section.metrics.length} metric{section.metrics.length === 1 ? "" : "s"}
                          {section.isRequired && <span className="ml-1 text-red-500">*</span>}
                        </span>
                      </div>
                    ),
                    children: (
                      <div className="space-y-4 pt-1">
                        {/* Section name + required toggle */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                          <div>
                            <label className="text-xs font-medium text-ds-text-secondary block mb-1">
                              {CONTENT.templates.sectionNameLabel as string} *
                            </label>
                            <Input
                              size="middle"
                              value={section.name}
                              onChange={(e) => updateSection(section.id, { name: e.target.value })}
                              placeholder="e.g. Weekly Attendance"
                            />
                          </div>
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-medium text-ds-text-secondary block mb-1">
                                {CONTENT.templates.descriptionLabel as string}
                              </label>
                              <Input
                                size="middle"
                                value={section.description}
                                onChange={(e) =>
                                  updateSection(section.id, { description: e.target.value })
                                }
                                placeholder="Optional"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
                              <Switch
                                size="small"
                                checked={section.isRequired}
                                onChange={(v) => updateSection(section.id, { isRequired: v })}
                              />
                              <span className="text-xs text-ds-text-secondary whitespace-nowrap">
                                {CONTENT.templates.isRequiredLabel as string}
                              </span>
                            </div>
                          </div>
                        </div>

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
