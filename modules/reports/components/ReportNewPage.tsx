"use client";

/**
 * modules/reports/components/ReportNewPage.tsx
 *
 * Create a new draft report. After selecting a template the full section/metric
 * form appears so the reporter can enter all data before saving the draft.
 * Goals for the campus + period are loaded from /api/goals/for-report and
 * pre-populated into the form as read-only goal values.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Select, InputNumber } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  ReportSectionsForm,
  buildSectionsPayload,
  type MetricValues,
  type GoalsForReportMap,
} from "./ReportSectionsForm";
import { ReportPeriodType } from "@/types/global";

/* ---- Period type options ---- */

const PERIOD_TYPE_OPTIONS = [
  { value: ReportPeriodType.WEEKLY, label: "Weekly" },
  { value: ReportPeriodType.MONTHLY, label: "Monthly" },
];

const MONTH_OPTIONS = [1,2,3,4,5,6,7,8,9,10,11,12].map((m) => ({
  value: m,
  label: (CONTENT.goals.months as string[])[m - 1],
}));

/* ---- Form values ---- */

interface NewReportFormValues {
  title: string;
  templateId: string;
  campusId: string;
  period: string;
  periodType: ReportPeriodType;
  periodYear: number;
  periodMonth?: number;
  periodWeek?: number;
  notes?: string;
}

/* ---- Component ---- */

export function ReportNewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { can } = useRole();
  const [form] = Form.useForm<NewReportFormValues>();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  /* Template sections state */
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [metricValues, setMetricValues] = useState<Record<string, MetricValues>>({});
  const [goalsMap, setGoalsMap] = useState<GoalsForReportMap>({});
  const [goalsLoading, setGoalsLoading] = useState(false);

  // Watched form values for goal resolution
  const periodType  = Form.useWatch("periodType",  form) as ReportPeriodType | undefined;
  const campusId    = Form.useWatch("campusId",     form) as string | undefined;
  const periodYear  = Form.useWatch("periodYear",   form) as number | undefined;
  const periodMonth = Form.useWatch("periodMonth",  form) as number | undefined;

  useEffect(() => {
    const load = async () => {
      const [ts, cs] = await Promise.all([
        mockDb.reportTemplates.findMany({}),
        mockDb.campuses.findMany({}),
      ]);
      setTemplates(ts);
      setCampuses(cs);

      if (user?.campusId) {
        form.setFieldValue("campusId", user.campusId);
      }
      const currentYear = new Date().getFullYear();
      form.setFieldValue("periodYear", currentYear);
      form.setFieldValue("periodMonth", new Date().getMonth() + 1);

      const defaultTemplate = ts.find((t) => (t as ReportTemplate & { isDefault?: boolean }).isDefault);
      if (defaultTemplate) {
        form.setFieldValue("templateId", defaultTemplate.id);
        setSelectedTemplate(defaultTemplate);
      }
      setDataLoading(false);
    };
    load();
  }, [user, form]);

  /* Load goals whenever campus + period changes */
  useEffect(() => {
    const resolvedCampusId = campusId ?? user?.campusId;
    const resolvedYear     = periodYear ?? new Date().getFullYear();
    if (!resolvedCampusId || !resolvedYear) return;

    setGoalsLoading(true);
    const params = new URLSearchParams({
      campusId: resolvedCampusId,
      year: String(resolvedYear),
    });
    if (periodType === ReportPeriodType.MONTHLY && periodMonth) {
      params.set("month", String(periodMonth));
    }

    fetch(`${API_ROUTES.goals.list.replace("/api/goals", "/api/goals/for-report")}?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setGoalsMap(json.data as GoalsForReportMap);
      })
      .catch(() => {/* non-fatal */})
      .finally(() => setGoalsLoading(false));
  }, [campusId, user?.campusId, periodYear, periodMonth, periodType]);

  /* When template changes, reset metric values (but keep goals) */
  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const tmpl = templates.find((t) => t.id === templateId) ?? null;
      setSelectedTemplate(tmpl);
      setMetricValues({});
    },
    [templates],
  );

  const handleMetricChange = useCallback((metricId: string, v: MetricValues) => {
    setMetricValues((prev) => ({ ...prev, [metricId]: v }));
  }, []);

  const handleSubmit = async (values: NewReportFormValues) => {
    setLoading(true);
    try {
      const sections = selectedTemplate
        ? buildSectionsPayload(selectedTemplate, metricValues, goalsMap)
        : [];

      const res = await fetch(API_ROUTES.reports.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, sections }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.common.errorDefault as string));
        return;
      }
      message.success(CONTENT.common.successSave as string);
      router.push(APP_ROUTES.reportDetail(json.data.id));
    } catch {
      message.error(CONTENT.common.errorDefault as string);
    } finally {
      setLoading(false);
    }
  };

  if (!can.createReports) {
    router.replace(APP_ROUTES.reports);
    return null;
  }

  if (dataLoading) {
    return (
      <PageLayout title={CONTENT.reports.newReport as string}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={CONTENT.reports.newReport as string}
      actions={<Button onClick={() => router.back()}>{CONTENT.common.cancel as string}</Button>}
    >
      <div className="max-w-4xl space-y-6">
        {/* Meta fields */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ periodType: ReportPeriodType.MONTHLY }}
          >
            <Form.Item
              name="title"
              label={CONTENT.reports.columnLabels.title as string}
              rules={[{ required: true, message: "Report title is required." }]}
            >
              <Input placeholder="e.g. Lekki Campus — March 2025" size="large" />
            </Form.Item>

            <Form.Item
              name="templateId"
              label={CONTENT.templates.nameLabel as string}
              rules={[{ required: true, message: "Please select a template." }]}
            >
              <Select
                size="large"
                placeholder="Select a template"
                options={templates.map((t) => ({ value: t.id, label: t.name }))}
                onChange={handleTemplateChange}
              />
            </Form.Item>

            <Form.Item
              name="campusId"
              label={CONTENT.reports.campusLabel as string}
              rules={[{ required: true, message: "Please select a campus." }]}
            >
              <Select
                size="large"
                placeholder="Select campus"
                disabled={!!user?.campusId}
                options={campuses.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item
                name="periodType"
                label={CONTENT.reports.metadata.periodTypeLabel as string}
                rules={[{ required: true }]}
              >
                <Select size="large" options={PERIOD_TYPE_OPTIONS} />
              </Form.Item>

              <Form.Item
                name="periodYear"
                label={CONTENT.reports.metadata.yearLabel as string}
                rules={[{ required: true, message: "Year is required." }]}
              >
                <InputNumber className="w-full" size="large" min={2020} max={2100} placeholder="2026" />
              </Form.Item>

              {(periodType === ReportPeriodType.MONTHLY || !periodType) && (
                <Form.Item
                  name="periodMonth"
                  label={CONTENT.reports.metadata.monthLabel as string}
                >
                  <Select size="large" options={MONTH_OPTIONS} placeholder="Month" />
                </Form.Item>
              )}

              {periodType === ReportPeriodType.WEEKLY && (
                <Form.Item
                  name="periodWeek"
                  label={CONTENT.reports.metadata.weekLabel as string}
                >
                  <InputNumber className="w-full" size="large" min={1} max={53} placeholder="Week #" />
                </Form.Item>
              )}
            </div>

            <Form.Item name="period" label={CONTENT.reports.periodLabel as string}>
              <Input placeholder="e.g. March 2025 · Week 12" size="large" />
            </Form.Item>

            <Form.Item name="notes" label={CONTENT.reports.notesLabel as string}>
              <Input.TextArea rows={3} placeholder={CONTENT.reports.notesPlaceholder as string} />
            </Form.Item>

            {/* Template sections form */}
            {selectedTemplate && (
              <div className="mt-6">
                {goalsLoading && (
                  <p className="text-xs text-ds-text-subtle mb-3">{CONTENT.reports.goalsLoading as string}</p>
                )}
                <ReportSectionsForm
                  template={selectedTemplate}
                  metricValues={metricValues}
                  goalsMap={goalsMap}
                  onMetricChange={handleMetricChange}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => router.back()}>{CONTENT.common.cancel as string}</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                {CONTENT.reports.saveDraft as string}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
