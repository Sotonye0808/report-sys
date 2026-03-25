"use client";

/**
 * modules/reports/components/ReportNewPage.tsx
 *
 * Create a new draft report. After selecting a template the full section/metric
 * form appears so the reporter can enter all data before saving the draft.
 * Goals for the campus + period are loaded from /api/goals/for-report and
 * pre-populated into the form as read-only goal values.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Select, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { SaveOutlined } from "@ant-design/icons";
import { useDraftCache } from "@/lib/hooks/useDraftCache";
import { useFormPersistence } from "@/lib/hooks/useFormPersistence";
import { offlineFetch } from "@/lib/utils/offlineFetch";

dayjs.extend(weekOfYear);
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { FormDraftBanner } from "@/components/ui/FormDraftBanner";
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
  { value: ReportPeriodType.YEARLY, label: "Yearly" },
];

/* ---- Form values ---- */

/** Only fields that live in the Ant Design Form store. Period date fields are
 *  derived from the controlled pickerValue state at submit time. */
interface NewReportFormValues {
  title: string;
  templateId: string;
  campusId: string;
  periodType: ReportPeriodType;
  notes?: string;
}

/* ---- Component ---- */

interface ReportNewDraft {
  formValues: NewReportFormValues;
  pickerValue: string | null;
  selectedTemplateId?: string;
  metricValues: Record<string, MetricValues>;
  goalsMap: GoalsForReportMap;
}

export function ReportNewPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { can } = useRole();
  const [form] = Form.useForm<NewReportFormValues>();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const draftKey = "draft:report:new";

  /* Template sections state */
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [metricValues, setMetricValues] = useState<Record<string, MetricValues>>({});
  const [goalsMap, setGoalsMap] = useState<GoalsForReportMap>({});
  const [goalsLoading, setGoalsLoading] = useState(false);

  // pickerValue is the single source of truth for the selected period
  const [pickerValue, setPickerValue] = useState<Dayjs | null>(null);

  // Watch form fields for draft persistence
  const title = Form.useWatch("title", form) as string | undefined;
  const templateId = Form.useWatch("templateId", form) as string | undefined;
  const campusId = Form.useWatch("campusId", form) as string | undefined;
  const periodType = Form.useWatch("periodType", form) as ReportPeriodType | undefined;
  const notes = Form.useWatch("notes", form) as string | undefined;

  const formState = useMemo<ReportNewDraft>(
    () => ({
      formValues: {
        title: title ?? "",
        templateId: templateId ?? "",
        campusId: campusId ?? "",
        periodType: periodType ?? ReportPeriodType.MONTHLY,
        notes: notes ?? "",
      },
      pickerValue: pickerValue?.toISOString() ?? null,
      selectedTemplateId: selectedTemplate?.id,
      metricValues,
      goalsMap,
    }),
    [
      title,
      templateId,
      campusId,
      periodType,
      notes,
      pickerValue,
      selectedTemplate,
      metricValues,
      goalsMap,
    ],
  );

  const {
    status: draftStatus,
    lastSavedAt: draftLastSaved,
    clearDraft: clearDraftPersist,
  } = useFormPersistence<ReportNewDraft>({
    formKey: draftKey,
    formState,
    onRestore: (draft) => {
      form.setFieldsValue(draft.formValues);
      setPickerValue(draft.pickerValue ? dayjs(draft.pickerValue) : dayjs());
      setSelectedTemplate(templates.find((t) => t.id === draft.selectedTemplateId) ?? null);
      setMetricValues(draft.metricValues || {});
      setGoalsMap(draft.goalsMap || {});
      message.info("Restored your unsaved draft.");
    },
    enabled: true,
  });

  useEffect(() => {
    const load = async () => {
      const [tsRes, csRes] = await Promise.all([
        fetch(API_ROUTES.reportTemplates.list, { credentials: "include" }),
        fetch(API_ROUTES.org.campuses, { credentials: "include" }),
      ]);
      const [tsJson, csJson] = await Promise.all([tsRes.json(), csRes.json()]);
      const ts: ReportTemplate[] = tsJson.success ? tsJson.data : [];
      const cs: Campus[] = csJson.success ? csJson.data : [];
      setTemplates(ts);
      setCampuses(cs);

      const existingCampusId = form.getFieldValue("campusId");
      if (!existingCampusId && user?.campusId) {
        form.setFieldValue("campusId", user.campusId);
      }

      const existingTemplateId = form.getFieldValue("templateId");
      const resolvedTemplate = existingTemplateId
        ? ts.find((t) => t.id === existingTemplateId)
        : null;

      const defaultTemplate =
        resolvedTemplate ??
        ts.find((t) => (t as ReportTemplate & { isDefault?: boolean }).isDefault) ??
        null;

      if (defaultTemplate) {
        form.setFieldValue("templateId", defaultTemplate.id);
        setSelectedTemplate(defaultTemplate);
      }

      if (!pickerValue) {
        setPickerValue(dayjs());
      }

      setDataLoading(false);
    };

    load();
  }, [user, form]);

  /* Load goals whenever campus + period changes */
  useEffect(() => {
    const resolvedCampusId = campusId ?? user?.campusId;
    const resolvedPeriodType = periodType ?? ReportPeriodType.MONTHLY;
    if (!resolvedCampusId || !pickerValue) return;

    const year = pickerValue.year();
    let month: number | undefined;

    if (resolvedPeriodType === ReportPeriodType.MONTHLY) {
      month = pickerValue.month() + 1;
    }

    setGoalsLoading(true);
    setGoalsMap({});

    const params = new URLSearchParams({ campusId: resolvedCampusId, year: String(year) });
    if (month) params.set("month", String(month));

    fetch(`${API_ROUTES.goals.list.replace("/api/goals", "/api/goals/for-report")}?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setGoalsMap(json.data as GoalsForReportMap);
        } else {
          setGoalsMap({});
        }
      })
      .catch(() => {
        setGoalsMap({});
      })
      .finally(() => setGoalsLoading(false));
  }, [campusId, user?.campusId, pickerValue, periodType]);

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

  /** Called when the user picks a date — derives periodYear/Month/Week + label. */
  const handlePickerChange = useCallback((value: Dayjs | null) => {
    setPickerValue(value);
  }, []);

  /** When period type changes, reset the picker to current period (and reload goals). */
  const handlePeriodTypeChange = useCallback(() => {
    setPickerValue(dayjs());
  }, []);

  const handleSubmit = async (values: NewReportFormValues) => {
    setLoading(true);
    try {
      if (!pickerValue) {
        message.error("Please select a report period.");
        setLoading(false);
        return;
      }
      // Derive period fields from the controlled DatePicker value
      const periodYear = pickerValue.year();
      let periodMonth: number | undefined;
      let periodWeek: number | undefined;
      let period: string;

      if (values.periodType === ReportPeriodType.WEEKLY) {
        periodWeek = pickerValue.week();
        period = `Week ${String(periodWeek).padStart(2, "0")}, ${periodYear}`;
      } else if (values.periodType === ReportPeriodType.YEARLY) {
        period = String(periodYear);
      } else {
        periodMonth = pickerValue.month() + 1;
        period = pickerValue.format("MMMM YYYY");
      }

      const sections = selectedTemplate
        ? buildSectionsPayload(selectedTemplate, metricValues, goalsMap)
        : [];

      const { ok, queued, response } = await offlineFetch(API_ROUTES.reports.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, periodYear, periodMonth, periodWeek, period, sections }),
        credentials: "include",
      });

      if (queued) {
        message.success("Saved locally and will submit when you're back online.");
        clearDraftPersist();
        router.push(APP_ROUTES.reports);
        return;
      }

      const json = response ? await response.json().catch(() => ({})) : {};
      if (!ok) {
        message.error(json.error ?? (CONTENT.common.errorDefault as string));
        setLoading(false);
        return;
      }

      if (!json?.data?.id) {
        message.error(CONTENT.common.errorDefault as string);
        setLoading(false);
        return;
      }

      message.success(CONTENT.common.successSave as string);
      clearDraftPersist();
      router.push(APP_ROUTES.reportDetail(json.data.id));
    } catch {
      message.error(CONTENT.common.errorDefault as string);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <PageLayout title={CONTENT.reports.newReport as string}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }

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
      <div className="max-w-4xl space-y-6 form-scroll-container">
        <FormDraftBanner
          status={draftStatus}
          lastSavedAt={draftLastSaved}
          onClear={clearDraftPersist}
        />
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
              rules={[
                { required: true, message: "Please select a template." },
                {
                  validator: (_, value) => {
                    const uuidRegex =
                      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
                    if (!value || !uuidRegex.test(value)) {
                      return Promise.reject(
                        "Invalid template selection. Please select a valid template.",
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
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
              rules={[
                { required: true, message: "Please select a campus." },
                {
                  validator: (_, value) => {
                    const uuidRegex =
                      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
                    if (!value || !uuidRegex.test(value)) {
                      return Promise.reject(
                        "Invalid campus selection. Please select a valid campus.",
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select campus"
                disabled={!!user?.campusId}
                options={campuses.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                name="periodType"
                label={CONTENT.reports.metadata.periodTypeLabel as string}
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  options={PERIOD_TYPE_OPTIONS}
                  onChange={handlePeriodTypeChange}
                />
              </Form.Item>

              <Form.Item
                label={
                  periodType === ReportPeriodType.WEEKLY
                    ? (CONTENT.reports.metadata.weekLabel as string)
                    : periodType === ReportPeriodType.YEARLY
                      ? (CONTENT.reports.metadata.yearLabel as string)
                      : (CONTENT.reports.metadata.monthLabel as string)
                }
                required
              >
                <DatePicker
                  className="w-full"
                  size="large"
                  picker={
                    periodType === ReportPeriodType.WEEKLY
                      ? "week"
                      : periodType === ReportPeriodType.YEARLY
                        ? "year"
                        : "month"
                  }
                  format={
                    periodType === ReportPeriodType.WEEKLY
                      ? "[Week] ww, YYYY"
                      : periodType === ReportPeriodType.YEARLY
                        ? "YYYY"
                        : "MMMM YYYY"
                  }
                  value={pickerValue}
                  onChange={handlePickerChange}
                />
              </Form.Item>
            </div>

            <Form.Item name="notes" label={CONTENT.reports.notesLabel as string}>
              <Input.TextArea rows={3} placeholder={CONTENT.reports.notesPlaceholder as string} />
            </Form.Item>

            {/* Template sections form */}
            {selectedTemplate && (
              <div className="mt-6">
                {goalsLoading && (
                  <p className="text-xs text-ds-text-subtle mb-3">
                    {CONTENT.reports.goalsLoading as string}
                  </p>
                )}
                <ReportSectionsForm
                  template={selectedTemplate}
                  metricValues={metricValues}
                  goalsMap={goalsMap}
                  onMetricChange={handleMetricChange}
                />
              </div>
            )}

            <div className="form-action-wrapper flex justify-end gap-3">
              <Button onClick={() => router.back()}>{CONTENT.common.cancel as string}</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                {CONTENT.reports.saveDraft as string}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
