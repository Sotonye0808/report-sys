"use client";

/**
 * modules/reports/components/ReportEditPage.tsx
 * Edit a report that is in DRAFT or REQUIRES_EDITS status.
 * Renders ALL template sections and their metrics so reporters can fill in
 * goal, achieved, and year-on-year figures in a single scrollable form.
 */

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Collapse, InputNumber, Tag, message } from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRole } from "@/lib/hooks/useRole";
import { useMockDbSubscription } from "@/lib/hooks/useMockDbSubscription";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportStatus, MetricFieldType } from "@/types/global";

const rk = CONTENT.reports as Record<string, unknown>;

interface MetricValues {
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
}

const METRIC_FIELD_CONFIGS: {
  key: keyof MetricValues;
  flag: keyof Pick<ReportTemplateMetric, "capturesGoal" | "capturesAchieved" | "capturesYoY">;
  labelKey: string;
}[] = [
  { key: "monthlyGoal", flag: "capturesGoal", labelKey: "fieldGoal" },
  { key: "monthlyAchieved", flag: "capturesAchieved", labelKey: "fieldAchieved" },
  { key: "yoyGoal", flag: "capturesYoY", labelKey: "fieldYoY" },
];

/* ── MetricRow ────────────────────────────────────────────────────────────── */

interface MetricRowProps {
  metric: ReportTemplateMetric;
  values: MetricValues;
  onChange: (v: MetricValues) => void;
  disabled?: boolean;
}

function MetricRow({ metric, values, onChange, disabled }: MetricRowProps) {
  const isCurrency = metric.fieldType === MetricFieldType.CURRENCY;
  const activeFields = METRIC_FIELD_CONFIGS.filter((f) => metric[f.flag]);
  const colClass =
    activeFields.length >= 3
      ? "grid-cols-3"
      : activeFields.length === 2
        ? "grid-cols-2"
        : "grid-cols-1";

  return (
    <div className="py-4 border-b border-ds-border-subtle last:border-none">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
        <div className="sm:w-56 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-ds-text-primary">{metric.name}</span>
            {metric.isRequired && (
              <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wide">
                {rk.sectionRequired as string}
              </span>
            )}
            {isCurrency && (
              <Tag color="blue" className="text-[10px]">
                N
              </Tag>
            )}
          </div>
          {metric.description && (
            <p className="text-xs text-ds-text-subtle mt-0.5 leading-tight">{metric.description}</p>
          )}
        </div>
        {activeFields.length === 0 ? (
          <p className="text-xs text-ds-text-subtle italic self-center">
            {rk.sectionOptional as string}
          </p>
        ) : (
          <div className={`flex-1 grid ${colClass} gap-3`}>
            {activeFields.map(({ key, labelKey }) => (
              <div key={key}>
                <label className="text-xs text-ds-text-subtle block mb-1">
                  {rk[labelKey] as string}
                </label>
                <InputNumber
                  className="w-full"
                  prefix={isCurrency ? "N" : undefined}
                  min={metric.minValue}
                  max={metric.maxValue}
                  value={values[key] as number | undefined}
                  disabled={disabled}
                  placeholder="0"
                  onChange={(v) => onChange({ ...values, [key]: v ?? undefined })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── SectionPanel ─────────────────────────────────────────────────────────── */

interface SectionPanelProps {
  section: ReportTemplateSection;
  metricValues: Record<string, MetricValues>;
  onMetricChange: (metricId: string, v: MetricValues) => void;
  disabled?: boolean;
}

function SectionPanel({ section, metricValues, onMetricChange, disabled }: SectionPanelProps) {
  return (
    <div>
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
              onChange={(v) => onMetricChange(metric.id, v)}
              disabled={disabled}
            />
          ))
      )}
    </div>
  );
}

/* ── ReportEditPage ───────────────────────────────────────────────────────── */

interface PageProps {
  params: Promise<{ id: string }>;
}

export function ReportEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useRole();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [metricValues, setMetricValues] = useState<Record<string, MetricValues>>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  const report = useMockDbSubscription<Report | null>("reports", async () =>
    mockDb.reports.findFirst({ where: (r: Report) => r.id === id }),
  );

  const template = useMockDbSubscription<ReportTemplate | null>("reportTemplates", async () => {
    if (!report?.templateId) return null;
    return mockDb.reportTemplates.findFirst({
      where: (t: ReportTemplate) => t.id === report.templateId,
    });
  });

  /* Initialise form values once both report + template are available */
  useEffect(() => {
    if (!report || !template || initialized) return;
    setTitle(report.title ?? "");
    setNotes(report.notes ?? "");
    const existingSections = (report.sections ?? []) as Array<{
      templateSectionId: string;
      metrics: Array<{ templateMetricId: string } & MetricValues>;
    }>;
    const map: Record<string, MetricValues> = {};
    for (const sec of existingSections) {
      for (const m of sec.metrics ?? []) {
        map[m.templateMetricId] = {
          monthlyGoal: m.monthlyGoal,
          monthlyAchieved: m.monthlyAchieved,
          yoyGoal: m.yoyGoal,
        };
      }
    }
    setMetricValues(map);
    setInitialized(true);
  }, [report, template, initialized]);

  const handleMetricChange = (metricId: string, v: MetricValues) =>
    setMetricValues((prev) => ({ ...prev, [metricId]: v }));

  const buildSectionsPayload = () =>
    (template?.sections ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        templateSectionId: section.id,
        sectionName: section.name,
        metrics: [...section.metrics]
          .sort((a, b) => a.order - b.order)
          .map((metric) => ({
            templateMetricId: metric.id,
            metricName: metric.name,
            calculationType: metric.calculationType,
            isLocked: false,
            ...(metricValues[metric.id] ?? {}),
          })),
      }));

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.reports.detail(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes, sections: buildSectionsPayload() }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? "An error occurred.");
        return;
      }
      message.success(CONTENT.common.successSave as string);
      router.push(APP_ROUTES.reportDetail(id));
    } catch {
      message.error("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  /* Guards */
  if (!can.fillReports) {
    router.replace(APP_ROUTES.reports);
    return null;
  }

  if (report === undefined || template === undefined) {
    return (
      <PageLayout title={(CONTENT.common.loading as string) ?? "Loading..."}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }

  if (!report) {
    return (
      <PageLayout title="Report Not Found">
        <EmptyState
          title="Report not found"
          description="This report does not exist."
          action={
            <Button onClick={() => router.push(APP_ROUTES.reports)}>
              {CONTENT.common.back as string}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const isEditable =
    report.status === ReportStatus.DRAFT || report.status === ReportStatus.REQUIRES_EDITS;
  if (!isEditable) {
    return (
      <PageLayout title={report.title ?? "Report"}>
        <EmptyState
          icon={<LockOutlined />}
          title="Report cannot be edited"
          description={`Reports with status "${report.status}" cannot be edited.`}
          action={
            <Button onClick={() => router.push(APP_ROUTES.reportDetail(id))}>
              {CONTENT.common.back as string}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  /* Build Collapse items from template sections */
  const collapseItems = (template?.sections ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      key: section.id,
      label: (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ds-text-primary">{section.name}</span>
          {section.isRequired ? (
            <Tag color="red" className="text-[10px]">
              {rk.sectionRequired as string}
            </Tag>
          ) : (
            <Tag color="default" className="text-[10px]">
              {rk.sectionOptional as string}
            </Tag>
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
          onMetricChange={handleMetricChange}
        />
      ),
    }));

  const totalMetrics = template?.sections?.reduce((n, s) => n + s.metrics.length, 0) ?? 0;

  return (
    <PageLayout
      title={`${rk.editReport as string}: ${report.title ?? ""}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(APP_ROUTES.reportDetail(id))}
          >
            {CONTENT.common.back as string}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            {CONTENT.common.save as string}
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Header: title + notes + template info */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-ds-text-secondary block mb-1">
              Report Title
            </label>
            <input
              className="w-full bg-ds-surface border border-ds-border-base rounded-ds-md px-3 py-2 text-sm text-ds-text-primary focus:outline-none focus:ring-2 focus:ring-ds-brand-accent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Report title"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ds-text-secondary block mb-1">
              {rk.notesLabel as string}
            </label>
            <textarea
              className="w-full bg-ds-surface border border-ds-border-base rounded-ds-md px-3 py-2 text-sm text-ds-text-primary focus:outline-none focus:ring-2 focus:ring-ds-brand-accent resize-none"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={rk.notesPlaceholder as string}
            />
          </div>
          {template && (
            <div className="flex items-center gap-2 p-3 bg-ds-surface rounded-ds-lg border border-ds-border-subtle text-xs text-ds-text-subtle">
              <CheckCircleOutlined className="text-ds-brand-accent" />
              <span>
                Template: <strong className="text-ds-text-primary">{template.name}</strong>
                {" · "}
                {template.sections.length} sections{" · "}
                {totalMetrics} metrics
              </span>
            </div>
          )}
        </div>

        {/* Template sections */}
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

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button onClick={() => router.push(APP_ROUTES.reportDetail(id))}>
            {CONTENT.common.cancel as string}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            {CONTENT.common.save as string}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
