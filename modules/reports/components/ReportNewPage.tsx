"use client";

/**
 * modules/reports/components/ReportNewPage.tsx
 * Create a new draft report. Uses the default template.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Select } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ReportPeriodType } from "@/types/global";

/* ── Period type options ──────────────────────────────────────────────────── */

const PERIOD_TYPE_OPTIONS = [
  { value: ReportPeriodType.WEEKLY, label: "Weekly" },
  { value: ReportPeriodType.MONTHLY, label: "Monthly" },
];

interface NewReportFormValues {
  title: string;
  templateId: string;
  campusId: string;
  period: string;
  periodType: ReportPeriodType;
  notes?: string;
}

export function ReportNewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { can } = useRole();
  const [form] = Form.useForm<NewReportFormValues>();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ts, cs] = await Promise.all([
        mockDb.reportTemplates.findMany({}),
        mockDb.campuses.findMany({}),
      ]);
      setTemplates(ts);
      setCampuses(cs);

      /* Pre-fill campus for scoped roles */
      if (user?.campusId) {
        form.setFieldValue("campusId", user.campusId);
      }
      /* Pre-fill default template */
      const defaultTemplate = ts.find(
        (t) => (t as ReportTemplate & { isDefault?: boolean }).isDefault,
      );
      if (defaultTemplate) {
        form.setFieldValue("templateId", defaultTemplate.id);
      }
      setDataLoading(false);
    };
    load();
  }, [user, form]);

  const handleSubmit = async (values: NewReportFormValues) => {
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.reports.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
      <div className="max-w-2xl">
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
              label="Report Title"
              rules={[{ required: true, message: "Report title is required." }]}
            >
              <Input placeholder="e.g. Lekki Campus — March 2025" size="large" />
            </Form.Item>

            <Form.Item
              name="templateId"
              label="Template"
              rules={[{ required: true, message: "Please select a template." }]}
            >
              <Select
                size="large"
                placeholder="Select a template"
                options={templates.map((t) => ({ value: t.id, label: t.name }))}
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

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="period"
                label={CONTENT.reports.periodLabel as string}
                rules={[{ required: true, message: "Period is required." }]}
              >
                <Input placeholder="e.g. March 2025" size="large" />
              </Form.Item>

              <Form.Item name="periodType" label="Period Type" rules={[{ required: true }]}>
                <Select size="large" options={PERIOD_TYPE_OPTIONS} />
              </Form.Item>
            </div>

            <Form.Item name="notes" label={CONTENT.reports.notesLabel as string}>
              <Input.TextArea rows={3} placeholder={CONTENT.reports.notesPlaceholder as string} />
            </Form.Item>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => router.back()}>{CONTENT.common.cancel as string}</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<FileTextOutlined />}
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
