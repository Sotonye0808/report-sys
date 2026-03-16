"use client";

/**
 * modules/reports/components/ReportEditPage.tsx
 *
 * Edit a report that is in DRAFT or REQUIRES_EDITS status.
 * Goals for the campus + period are loaded from /api/goals/for-report and
 * pre-seeded into the form as read-only goal values with live stat tracking.
 */

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { SaveOutlined, ArrowLeftOutlined, LockOutlined } from "@ant-design/icons";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ReportSectionsForm,
  buildSectionsPayload,
  parseSectionsToMetricValues,
  type MetricValues,
  type GoalsForReportMap,
} from "./ReportSectionsForm";
import { ReportStatus } from "@/types/global";

const rk = CONTENT.reports as Record<string, unknown>;

/* ---- Component ---- */

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
  const [goalsMap, setGoalsMap] = useState<GoalsForReportMap>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: report } = useApiData<Report>(API_ROUTES.reports.detail(id));

  // Load template once report's templateId is known
  const { data: template } = useApiData<ReportTemplate>(
    report?.templateId ? API_ROUTES.reportTemplates.detail(report.templateId) : null,
    [report?.templateId],
  );

  /* Initialise form values + load goals once report + template are available */
  useEffect(() => {
    if (!report || !template || initialized) return;
    setTitle(report.title ?? "");
    setNotes(report.notes ?? "");
    setMetricValues(parseSectionsToMetricValues((report.sections ?? []) as unknown[]));
    setInitialized(true);

    // Load goals for this campus + period
    const campusId = report.campusId;
    const year = report.periodYear;
    const month = report.periodMonth;
    if (!campusId || !year) return;

    const params = new URLSearchParams({ campusId, year: String(year) });
    if (month) params.set("month", String(month));

    fetch(`${API_ROUTES.goals.forReport}?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setGoalsMap(json.data as GoalsForReportMap);
      })
      .catch(() => {
        /* non-fatal */
      });
  }, [report, template, initialized]);

  const handleMetricChange = (metricId: string, v: MetricValues) =>
    setMetricValues((prev) => ({ ...prev, [metricId]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!report || !template) {
        setSaving(false);
        return;
      }
      const res = await fetch(API_ROUTES.reports.detail(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes,
          sections: buildSectionsPayload(template, metricValues, goalsMap),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.common.errorDefault as string));
        setSaving(false);
        return;
      }
      message.success(CONTENT.common.successSave as string);
      router.push(APP_ROUTES.reportDetail(id));
    } catch {
      message.error(CONTENT.common.errorDefault as string);
      setSaving(false);
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
      <PageLayout title={CONTENT.errors.notFoundTitle as string}>
        <EmptyState
          title={CONTENT.errors.notFoundTitle as string}
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
        {/* Header: title + notes */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-ds-text-secondary block mb-1">
              {CONTENT.reports.columnLabels.title as string}
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
        </div>

        {/* Template sections form (shared component) */}
        {template && (
          <ReportSectionsForm
            template={template}
            metricValues={metricValues}
            goalsMap={goalsMap}
            onMetricChange={handleMetricChange}
          />
        )}

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
