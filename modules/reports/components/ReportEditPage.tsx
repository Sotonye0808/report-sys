"use client";

/**
 * modules/reports/components/ReportEditPage.tsx
 *
 * Edit a report that is in DRAFT or REQUIRES_EDITS status.
 * Goals for the campus + period are loaded from /api/goals/for-report and
 * pre-seeded into the form as read-only goal values with live stat tracking.
 */

import { useState, use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { useFormPersistence } from "@/lib/hooks/useFormPersistence";
import { calculateReportDeadline, formattedDeadlinePolicy } from "@/lib/utils/deadline";
import { SaveOutlined, ArrowLeftOutlined, LockOutlined, SendOutlined } from "@ant-design/icons";
import { useRole } from "@/lib/hooks/useRole";
import { UserRole, ReportStatus } from "@/types/global";
import { useApiData } from "@/lib/hooks/useApiData";
import { offlineFetch } from "@/lib/utils/offlineFetch";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { FormDraftBanner } from "@/components/ui/FormDraftBanner";

import { EmptyState } from "@/components/ui/EmptyState";
import {
  ReportSectionsForm,
  buildSectionsPayload,
  parseSectionsToMetricValues,
  type MetricValues,
  type GoalsForReportMap,
} from "./ReportSectionsForm";

const rk = CONTENT.reports as Record<string, unknown>;

/* ---- Component ---- */

interface PageProps {
  params: Promise<{ id: string }>;
}

export function ReportEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { can, role } = useRole();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [metricValues, setMetricValues] = useState<Record<string, MetricValues>>({});
  const [goalsMap, setGoalsMap] = useState<GoalsForReportMap>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const goalFetchKeyRef = useRef<string | null>(null);

  const {
    status: draftStatus,
    lastSavedAt: draftLastSaved,
    clearDraft,
  } = useFormPersistence<{
    title: string;
    notes: string;
    metricValues: Record<string, MetricValues>;
    goalsMap: GoalsForReportMap;
  }>({
    formKey: `draft:report:edit:${id}`,
    formState: { title, notes, metricValues, goalsMap },
    onRestore: (draft) => {
      setTitle(draft.title);
      setNotes(draft.notes);
      setMetricValues(draft.metricValues);
      setGoalsMap(draft.goalsMap);
      setInitialized(true);
    },
    enabled: true,
  });

  const { data: report } = useApiData<Report>(API_ROUTES.reports.detail(id));

  // Load template once report's templateId is known
  const { data: template } = useApiData<ReportTemplate>(
    report?.templateId ? API_ROUTES.reportTemplates.detail(report.templateId) : null,
    [report?.templateId],
  );

  const { data: templateVersion } = useApiData<ReportTemplateVersion>(
    report?.templateVersionId
      ? API_ROUTES.reportTemplates.versionDetail(report.templateId, report.templateVersionId)
      : null,
    [report?.templateVersionId],
  );

  const templateToUse =
    templateVersion?.snapshot && templateVersion.snapshot !== undefined
      ? templateVersion.snapshot
      : template;

  const isTemplateVersionMismatch = Boolean(
    report?.templateVersionId &&
    template &&
    templateToUse &&
    template.version !== templateToUse.version,
  );

  /* Initialise form values once report + template are available */
  useEffect(() => {
    if (!report || !templateToUse || initialized) return;
    setTitle(report.title ?? "");
    setNotes(report.notes ?? "");
    setMetricValues(parseSectionsToMetricValues((report.sections ?? []) as unknown[]));
    setInitialized(true);
  }, [initialized, report, templateToUse]);

  /* Load goals for this campus + period */
  useEffect(() => {
    if (!report) return;
    const campusId = report.campusId;
    const year = report.periodYear;
    const month = report.periodMonth;
    if (!campusId || !year) return;
    const nextFetchKey = `${campusId}:${year}:${month ?? 0}`;
    if (goalFetchKeyRef.current === nextFetchKey) {
      return;
    }
    goalFetchKeyRef.current = nextFetchKey;

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
  }, [report]);

  const handleMetricChange = (metricId: string, v: MetricValues) =>
    setMetricValues((prev) => ({ ...prev, [metricId]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!report || !templateToUse) {
        message.error("Unable to save: template data is not loaded yet.");
        setSaving(false);
        return;
      }
      const { ok, queued, response } = await offlineFetch(API_ROUTES.reports.detail(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes,
          sections: buildSectionsPayload(templateToUse, metricValues, goalsMap),
        }),
        credentials: "include",
      });

      if (queued) {
        message.success("Saved locally and will sync when you're back online.");
        return;
      }

      const json = response ? await response.json().catch(() => ({})) : {};
      if (!ok) {
        message.error(json.error ?? (CONTENT.common.errorDefault as string));
        setSaving(false);
        return;
      }
      message.success(CONTENT.common.successSave as string);
      clearDraft();
      router.push(APP_ROUTES.reportDetail(id));
    } catch {
      message.error(CONTENT.common.errorDefault as string);
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  /* Guards */
  if (!can.fillReports && role !== UserRole.SUPERADMIN) {
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

  const computedDeadline =
    report && templateToUse
      ? calculateReportDeadline(
          report.periodType,
          report.periodYear,
          report.periodMonth ?? undefined,
          report.periodWeek ?? undefined,
          templateToUse.deadlinePolicy ?? undefined,
          templateToUse.deadlineOffsetHours ?? undefined,
        )
      : undefined;
  const isDataEntryReport = report
    ? report.isDataEntry || report.periodYear < new Date().getFullYear()
    : false;

  const isEditable =
    report.status === ReportStatus.DRAFT ||
    report.status === ReportStatus.REQUIRES_EDITS ||
    (role === UserRole.SUPERADMIN && report.status === ReportStatus.LOCKED);
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
      <FormDraftBanner status={draftStatus} lastSavedAt={draftLastSaved} onClear={clearDraft} />
      {isTemplateVersionMismatch && (
        <div className="mb-4 px-4 py-3 rounded-ds-md border border-ds-state-warning bg-ds-surface-elevated">
          <p className="text-sm font-semibold text-ds-state-warning">Template version warning</p>
          <p className="text-xs text-ds-text-secondary">
            This report is linked to template version {report?.templateVersionId ?? "unknown"} and
            may not match the active template.
          </p>
        </div>
      )}
      {templateToUse && report && (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-4 mb-4">
          <p className="text-xs text-ds-text-secondary">{formattedDeadlinePolicy(templateToUse)}</p>
          <p className="text-xs text-ds-text-secondary">
            Computed deadline:{" "}
            {computedDeadline ? new Date(computedDeadline).toLocaleString() : "n/a"}
          </p>
          <p className="text-xs text-ds-text-secondary">
            Data entry report: {isDataEntryReport ? "Yes" : "No"}
          </p>
        </div>
      )}
      <div className="max-w-4xl space-y-6 form-scroll-container">
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
        {templateToUse && (
          <ReportSectionsForm
            template={templateToUse}
            metricValues={metricValues}
            goalsMap={goalsMap}
            onMetricChange={handleMetricChange}
          />
        )}

        {/* Bottom actions */}
        <div className="form-action-wrapper flex justify-end gap-3">
          <Button onClick={() => router.push(APP_ROUTES.reportDetail(id))}>
            {CONTENT.common.cancel as string}
          </Button>
          {can.submitReports &&
            (report.status === ReportStatus.DRAFT ||
              report.status === ReportStatus.REQUIRES_EDITS) && (
              <Button
                type="default"
                icon={<SendOutlined />}
                loading={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const { ok, queued, response } = await offlineFetch(
                      API_ROUTES.reports.submit(id),
                      {
                        method: "POST",
                        credentials: "include",
                      },
                    );

                    if (queued) {
                      message.success("Submit queued and will be retried when you're back online.");
                      return;
                    }

                    const json = response ? await response.json().catch(() => ({})) : {};
                    if (!ok) {
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
                }}
              >
                {CONTENT.reports.actions?.submit ?? "Submit"}
              </Button>
            )}
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            {CONTENT.common.save as string}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
