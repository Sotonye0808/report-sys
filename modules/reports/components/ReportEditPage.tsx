"use client";

/**
 * modules/reports/components/ReportEditPage.tsx
 * Edit a report that is in DRAFT or REQUIRES_EDITS status.
 * Loads existing field values and allows updating them.
 */

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Form, message } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRole } from "@/lib/hooks/useRole";
import { useMockDbSubscription } from "@/lib/hooks/useMockDbSubscription";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportStatus } from "@/types/global";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function ReportEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useRole();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const report = useMockDbSubscription<Report | null>("reports", async () =>
    mockDb.reports.findFirst({ where: (r: Report) => r.id === id }),
  );

  const template = useMockDbSubscription<ReportTemplate | null>("reportTemplates", async () => {
    if (!report?.templateId) return null;
    return mockDb.reportTemplates.findFirst({
      where: (t: ReportTemplate) => t.id === report.templateId,
    });
  });

  /* Pre-fill form once report loads */
  if (report && !initialized) {
    form.setFieldsValue({ title: report.title, notes: report.notes ?? "" });
    setInitialized(true);
  }

  /* Guard: only editable when DRAFT or REQUIRES_EDITS */
  const isEditable =
    report?.status === ReportStatus.DRAFT ||
    report?.status === ReportStatus.REQUIRES_EDITS;

  const handleSave = async (values: { title: string; notes?: string }) => {
    if (!report) return;
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.reports.detail(id), {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.common.errorDefault as string));
        return;
      }
      message.success(CONTENT.common.successSave as string);
      router.push(APP_ROUTES.reportDetail(id));
    } catch {
      message.error(CONTENT.common.errorDefault as string);
    } finally {
      setSaving(false);
    }
  };

  if (!can.fillReports) {
    router.replace(APP_ROUTES.reports);
    return null;
  }

  if (report === undefined || template === undefined) {
    return (
      <PageLayout title={CONTENT.common.loading as string ?? "Loading…"}>
        <LoadingSkeleton rows={5} />
      </PageLayout>
    );
  }

  if (!report) {
    return (
      <PageLayout title="Report Not Found">
        <EmptyState
          title="Report not found"
          description="This report does not exist or has been removed."
          action={
            <Button onClick={() => router.push(APP_ROUTES.reports)}>
              {CONTENT.common.back as string}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  if (!isEditable) {
    return (
      <PageLayout title={report.title}>
        <EmptyState
          title="Report cannot be edited"
          description={`Reports in "${report.status}" status cannot be edited.`}
          action={
            <Button onClick={() => router.push(APP_ROUTES.reportDetail(id))}>
              {CONTENT.common.back as string}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${CONTENT.common.edit as string}: ${report.title}`}
      actions={
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(APP_ROUTES.reportDetail(id))}>
          {CONTENT.common.back as string}
        </Button>
      }
    >
      <div className="max-w-2xl">
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            requiredMark={false}
          >
            <Form.Item
              name="title"
              label="Report Title"
              rules={[{ required: true, message: "Title is required." }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item name="notes" label={CONTENT.reports.notesLabel as string}>
              <Input.TextArea
                rows={3}
                placeholder={CONTENT.reports.notesPlaceholder as string}
              />
            </Form.Item>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => router.push(APP_ROUTES.reportDetail(id))}>
                {CONTENT.common.cancel as string}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                {CONTENT.common.save as string}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
