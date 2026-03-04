"use client";

/**
 * modules/templates/components/TemplateDetailPage.tsx
 * View and edit an existing report template — sections → metrics structure.
 * SUPERADMIN only.
 */

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Switch, Select, Tag, Collapse, Badge } from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { useMockDbSubscription } from "@/lib/hooks/useMockDbSubscription";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { MetricFieldType, MetricCalculationType } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const FIELD_TYPE_OPTIONS = [
  { value: MetricFieldType.NUMBER,     label: "Number" },
  { value: MetricFieldType.PERCENTAGE, label: "Percentage (%)" },
  { value: MetricFieldType.CURRENCY,   label: "Currency" },
  { value: MetricFieldType.TEXT,       label: "Text" },
];

const CALC_TYPE_OPTIONS = [
  { value: MetricCalculationType.SUM,      label: "Sum (cumulative)" },
  { value: MetricCalculationType.AVERAGE,  label: "Average (rolling mean)" },
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

type TemplateWithMeta = ReportTemplate & { isDefault?: boolean; isArchived?: boolean };

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MetricRowProps {
  metric: DraftMetric;
  onChange: (patch: Partial<DraftMetric>) => void;
  onRemove: () => void;
}

function MetricRow({ metric, onChange, onRemove }: MetricRowProps) {
  type BoolKey = "isRequired" | "capturesGoal" | "capturesAchieved" | "capturesYoY";
  const TOGGLES: { key: BoolKey; label: string }[] = [
    { key: "isRequired",       label: CONTENT.templates.isRequiredLabel as string },
    { key: "capturesGoal",     label: CONTENT.templates.capturesGoalLabel as string },
    { key: "capturesAchieved", label: CONTENT.templates.capturesAchievedLabel as string },
    { key: "capturesYoY",      label: CONTENT.templates.capturesYoYLabel as string },
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

export function TemplateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [form] = Form.useForm();
  const [sections, setSections] = useState<DraftSection[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const template = useMockDbSubscription<TemplateWithMeta | null>("reportTemplates", async () =>
    mockDb.reportTemplates.findFirst({ where: (t: ReportTemplate) => t.id === id }),
  );

  if (template && !initialized) {
    form.setFieldsValue({
      name: template.name,
      description: template.description ?? "",
      isDefault:  template.isDefault  ?? false,
      isArchived: template.isArchived ?? false,
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
              order: m.order,
            })),
        })),
    );
    setInitialized(true);
  }

  const updateSection = (sId: string, patch: Partial<DraftSection>) =>
    setSections((prev) => (prev ?? []).map((s) => (s.id === sId ? { ...s, ...patch } : s)));
  const removeSection = (sId: string) =>
    setSections((prev) => (prev ?? []).filter((s) => s.id !== sId));
  const addSection = () =>
    setSections((prev) => [
      ...(prev ?? []),
      { id: crypto.randomUUID(), name: "", description: "", isRequired: true, order: (prev ?? []).length + 1, metrics: [] },
    ]);

  const updateMetric = (sId: string, mId: string, patch: Partial<DraftMetric>) =>
    setSections((prev) =>
      (prev ?? []).map((s) =>
        s.id === sId ? { ...s, metrics: s.metrics.map((m) => (m.id === mId ? { ...m, ...patch } : m)) } : s,
      ),
    );
  const removeMetric = (sId: string, mId: string) =>
    setSections((prev) =>
      (prev ?? []).map((s) =>
        s.id === sId ? { ...s, metrics: s.metrics.filter((m) => m.id !== mId) } : s,
      ),
    );
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
              order: s.metrics.length + 1,
            },
          ],
        };
      }),
    );

  const handleSave = async (values: { name: string; description: string; isDefault: boolean; isArchived: boolean }) => {
    const draft = sections ?? [];
    if (draft.find((s) => !s.name.trim())) { message.error("All sections must have a name."); return; }
    for (const s of draft) {
      if (s.metrics.find((m) => !m.name.trim())) { message.error(`All metrics in "${s.name}" must have a name.`); return; }
    }
    setSaving(true);
    try {
      const payload = {
        ...values,
        sections: draft.map((s, si) => ({
          id: s.id, templateId: id, name: s.name.trim(), description: s.description || undefined,
          isRequired: s.isRequired, order: si + 1,
          metrics: s.metrics.map((m, mi) => ({
            id: m.id, sectionId: s.id, name: m.name.trim(), description: m.description || undefined,
            fieldType: m.fieldType, calculationType: m.calculationType,
            isRequired: m.isRequired, capturesGoal: m.capturesGoal,
            capturesAchieved: m.capturesAchieved, capturesYoY: m.capturesYoY, order: mi + 1,
          })),
        })),
      };
      const res = await fetch(API_ROUTES.reportTemplates.detail(id), {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic); return; }
      message.success(CONTENT.common.successSave as string);
    } catch { message.error((CONTENT.errors as Record<string, string>).generic); }
    finally { setSaving(false); }
  };

  if (template === undefined || !initialized) {
    return <PageLayout title={CONTENT.templates.editTemplate as string}><LoadingSkeleton rows={6} /></PageLayout>;
  }
  if (!template) {
    return (
      <PageLayout title="Template Not Found">
        <Button onClick={() => router.push(APP_ROUTES.templates)}>{CONTENT.common.back as string}</Button>
      </PageLayout>
    );
  }

  const draft = sections ?? [];
  const totalMetrics = draft.reduce((n, s) => n + s.metrics.length, 0);

  return (
    <PageLayout
      title={CONTENT.templates.editTemplate as string}
      subtitle={template.name}
      actions={
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(APP_ROUTES.templates)}>
          {CONTENT.common.back as string}
        </Button>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
        <div className="max-w-4xl space-y-6">
          {/* Metadata card */}
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 space-y-4">
            <div className="flex gap-2 mb-2 flex-wrap">
              {template.isDefault  && <Tag color="gold" icon={<StarOutlined />}>{CONTENT.templates.defaultBadge as string}</Tag>}
              {template.isArchived && <Tag>Archived</Tag>}
            </div>
            <Form.Item name="name" label={CONTENT.templates.nameLabel as string} rules={[{ required: true, message: "Template name is required." }]}>
              <Input size="large" placeholder={CONTENT.templates.namePlaceholder as string} />
            </Form.Item>
            <Form.Item name="description" label={CONTENT.templates.descriptionLabel as string}>
              <Input.TextArea rows={2} placeholder={CONTENT.templates.descriptionPlaceholder as string} />
            </Form.Item>
            <div className="flex flex-wrap gap-6">
              {(["isDefault", "isArchived"] as const).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Form.Item name={key} valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                  <span className="text-sm text-ds-text-secondary">
                    {key === "isDefault" ? CONTENT.templates.setDefault as string : CONTENT.templates.archiveTemplate as string}
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
                  {totalMetrics} metric{totalMetrics === 1 ? "" : "s"} across {draft.length} section{draft.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button icon={<PlusOutlined />} size="small" onClick={addSection}>
                {CONTENT.templates.addSection as string}
              </Button>
            </div>

            {draft.length === 0 ? (
              <div className="text-center py-10 text-ds-text-subtle text-sm">
                No sections yet. Click <strong>Add Section</strong> to start building this template.
              </div>
            ) : (
              <Collapse
                accordion={false}
                defaultActiveKey={draft.map((s) => s.id)}
                items={draft.map((section, si) => ({
                  key: section.id,
                  label: (
                    <div className="flex items-center gap-3 min-w-0">
                      <DragOutlined className="text-ds-text-subtle flex-shrink-0" />
                      <span className="font-medium text-ds-text-primary truncate">
                        {section.name || `Section ${si + 1}`}
                      </span>
                      <span className="text-xs text-ds-text-subtle flex-shrink-0">
                        {section.metrics.length} metric{section.metrics.length === 1 ? "" : "s"}
                        {section.isRequired && <span className="ml-1 text-red-500">*</span>}
                      </span>
                    </div>
                  ),
                  children: (
                    <div className="space-y-4 pt-1">
                      {/* Section header fields */}
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
                              Description
                            </label>
                            <Input
                              size="middle"
                              value={section.description}
                              onChange={(e) => updateSection(section.id, { description: e.target.value })}
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

                      {/* Metrics */}
                      <div className="space-y-2">
                        {section.metrics.length === 0 && (
                          <p className="text-xs text-ds-text-subtle py-2">
                            No metrics yet. Add a metric below.
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
                        <Button icon={<PlusOutlined />} size="small" onClick={() => addMetric(section.id)}>
                          {CONTENT.templates.addMetric as string}
                        </Button>
                        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeSection(section.id)}>
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
          <div className="flex justify-end gap-3">
            <Button onClick={() => router.push(APP_ROUTES.templates)}>{CONTENT.common.cancel as string}</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              {CONTENT.common.save as string}
            </Button>
          </div>
        </div>
      </Form>
    </PageLayout>
  );
}
