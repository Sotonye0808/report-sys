"use client";

/**
 * modules/reports/components/ReportDetailPage.tsx
 *
 * Unified role-aware report detail page.
 * Works for ALL roles — action buttons filtered by allowedRoles[].
 *
 * Report structure:
 *   Report → ReportSection[] (by reportId) → ReportMetric[] (by reportSectionId)
 * The Report record itself holds status + meta; field data is in the sections/metrics.
 */

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Descriptions, Tooltip, Tag } from "antd";
import { useRole } from "@/lib/hooks/useRole";
import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { getReportLabel, formatReportPeriod } from "@/lib/utils/reportUtils";
import { fmtDate, fmtDateTime } from "@/lib/utils/formatDate";
import { exportReportDetail } from "@/lib/utils/exportReports";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { ReportStatusBadge } from "@/components/ui/StatusBadge";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";

/* ── Action config ────────────────────────────────────────────────────────── */

interface ActionConfig {
  key: string;
  label: string;
  type: "primary" | "default" | "danger";
  icon: React.ReactNode;
  targetStatus: ReportStatus;
  eventType: ReportEventType;
  /** Only shown when report is in one of these statuses */
  visibleWhen: ReportStatus[];
  allowedRoles: UserRole[];
}

const REPORT_ACTIONS: ActionConfig[] = [
  {
    key: "submit",
    label: CONTENT.reports.actions?.submit ?? "Submit",
    type: "primary",
    icon: <SendOutlined />,
    targetStatus: ReportStatus.SUBMITTED,
    eventType: ReportEventType.SUBMITTED,
    visibleWhen: [ReportStatus.DRAFT, ReportStatus.REQUIRES_EDITS],
    allowedRoles: [
      UserRole.CAMPUS_ADMIN,
      UserRole.DATA_ENTRY,
      UserRole.GROUP_ADMIN,
      UserRole.SUPERADMIN,
    ],
  },
  {
    key: "approve",
    label: CONTENT.reports.actions?.approve ?? "Approve",
    type: "primary",
    icon: <CheckOutlined />,
    targetStatus: ReportStatus.APPROVED,
    eventType: ReportEventType.APPROVED,
    visibleWhen: [ReportStatus.SUBMITTED, ReportStatus.REVIEWED],
    allowedRoles: [
      UserRole.CAMPUS_PASTOR,
      UserRole.GROUP_PASTOR,
      UserRole.GROUP_ADMIN,
      UserRole.CHURCH_MINISTRY,
      UserRole.CEO,
      UserRole.SPO,
      UserRole.SUPERADMIN,
    ],
  },
  {
    key: "review",
    label: CONTENT.reports.actions?.review ?? "Mark Reviewed",
    type: "default",
    icon: <CheckCircleOutlined />,
    targetStatus: ReportStatus.REVIEWED,
    eventType: ReportEventType.REVIEWED,
    visibleWhen: [ReportStatus.SUBMITTED],
    allowedRoles: [
      UserRole.CAMPUS_PASTOR,
      UserRole.GROUP_PASTOR,
      UserRole.GROUP_ADMIN,
      UserRole.CHURCH_MINISTRY,
      UserRole.CEO,
      UserRole.SPO,
      UserRole.SUPERADMIN,
    ],
  },
  {
    key: "request-edits",
    label: CONTENT.reports.actions?.requestEdit ?? "Request Edits",
    type: "danger",
    icon: <CloseOutlined />,
    targetStatus: ReportStatus.REQUIRES_EDITS,
    eventType: ReportEventType.EDIT_REQUESTED,
    visibleWhen: [ReportStatus.SUBMITTED, ReportStatus.REVIEWED],
    allowedRoles: [
      UserRole.CAMPUS_PASTOR,
      UserRole.GROUP_PASTOR,
      UserRole.GROUP_ADMIN,
      UserRole.CHURCH_MINISTRY,
      UserRole.CEO,
      UserRole.SPO,
      UserRole.SUPERADMIN,
    ],
  },
  {
    key: "lock",
    label: CONTENT.reports.actions?.lock ?? "Lock",
    type: "danger",
    icon: <LockOutlined />,
    targetStatus: ReportStatus.LOCKED,
    eventType: ReportEventType.LOCKED,
    visibleWhen: [ReportStatus.APPROVED],
    allowedRoles: [UserRole.SUPERADMIN],
  },
  {
    key: "unlock",
    label: ((CONTENT.reports.actions as any)?.unlock as string) ?? "Unlock",
    type: "default",
    icon: <UnlockOutlined />,
    targetStatus: ReportStatus.DRAFT,
    eventType: ReportEventType.UNLOCKED,
    visibleWhen: [ReportStatus.LOCKED],
    allowedRoles: [UserRole.SUPERADMIN],
  },
];

/* ── Audit trail event config ───────────────────────────────────────────── */

const rk = CONTENT.reports as Record<string, unknown>;
const eventLabels = (rk.eventLabels ?? {}) as Record<string, string>;

interface AuditEventConfig {
  icon: React.ReactNode;
  color: string; // Ant Tag color
  dotColor: string; // timeline dot CSS class
}

const AUDIT_EVENT_CONFIG: Record<string, AuditEventConfig> = {
  [ReportEventType.CREATED]: {
    icon: <PlusCircleOutlined />,
    color: "blue",
    dotColor: "bg-blue-500",
  },
  [ReportEventType.SUBMITTED]: { icon: <SendOutlined />, color: "cyan", dotColor: "bg-cyan-500" },
  [ReportEventType.EDIT_REQUESTED]: {
    icon: <ExclamationCircleOutlined />,
    color: "orange",
    dotColor: "bg-orange-400",
  },
  [ReportEventType.EDIT_SUBMITTED]: {
    icon: <SyncOutlined />,
    color: "purple",
    dotColor: "bg-purple-400",
  },
  [ReportEventType.EDIT_APPROVED]: {
    icon: <CheckCircleOutlined />,
    color: "green",
    dotColor: "bg-green-500",
  },
  [ReportEventType.EDIT_REJECTED]: {
    icon: <CloseOutlined />,
    color: "red",
    dotColor: "bg-red-400",
  },
  [ReportEventType.EDIT_APPLIED]: {
    icon: <CheckOutlined />,
    color: "green",
    dotColor: "bg-green-500",
  },
  [ReportEventType.UNLOCKED]: {
    icon: <UnlockOutlined />,
    color: "gold",
    dotColor: "bg-yellow-400",
  },
  [ReportEventType.APPROVED]: {
    icon: <CheckCircleOutlined />,
    color: "green",
    dotColor: "bg-green-500",
  },
  [ReportEventType.REVIEWED]: {
    icon: <CheckCircleOutlined />,
    color: "geekblue",
    dotColor: "bg-blue-400",
  },
  [ReportEventType.LOCKED]: { icon: <LockOutlined />, color: "red", dotColor: "bg-red-500" },
  [ReportEventType.DEADLINE_PASSED]: {
    icon: <ClockCircleOutlined />,
    color: "volcano",
    dotColor: "bg-orange-500",
  },
  [ReportEventType.UPDATE_REQUESTED]: {
    icon: <ExclamationCircleOutlined />,
    color: "orange",
    dotColor: "bg-orange-400",
  },
  [ReportEventType.UPDATE_APPROVED]: {
    icon: <CheckOutlined />,
    color: "green",
    dotColor: "bg-green-500",
  },
  [ReportEventType.UPDATE_REJECTED]: {
    icon: <CloseOutlined />,
    color: "red",
    dotColor: "bg-red-400",
  },
  [ReportEventType.DATA_ENTRY_CREATED]: {
    icon: <FileTextOutlined />,
    color: "blue",
    dotColor: "bg-blue-500",
  },
  [ReportEventType.TEMPLATE_VERSION_NOTE]: {
    icon: <FileTextOutlined />,
    color: "default",
    dotColor: "bg-gray-400",
  },
  [ReportEventType.AUTO_APPROVED]: {
    icon: <ThunderboltOutlined />,
    color: "gold",
    dotColor: "bg-yellow-400",
  },
};

function getEventConfig(eventType: string): AuditEventConfig {
  return (
    AUDIT_EVENT_CONFIG[eventType] ?? {
      icon: <FileTextOutlined />,
      color: "default",
      dotColor: "bg-ds-text-subtle",
    }
  );
}

/* ── ReportDetailPage ─────────────────────────────────────────────────────── */

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id: reportId } = use(params);
  const { role, can } = useRole();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const isSuperadmin = role === UserRole.SUPERADMIN;

  /* ── Data fetching ─────────────────────────────────────────────────── */

  const { data: report, refetch: refetchReport } = useApiData<Report>(
    API_ROUTES.reports.detail(reportId),
  );

  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

  const { data: events } = useApiData<ReportEvent[]>(API_ROUTES.reports.history(reportId));

  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);

  const { data: users } = useApiData<UserProfile[]>(API_ROUTES.users.list);

  /* ── Derived data ───────────────────────────────────────────────────────── */

  const campus = useMemo(
    () => (campuses ?? []).find((c) => c.id === report?.campusId),
    [campuses, report],
  );

  const submitter = useMemo(
    () => (users ?? []).find((u) => !!report?.submittedById && u.id === report.submittedById),
    [users, report],
  );

  const sortedEvents = useMemo(
    () =>
      [...(events ?? [])].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
    [events],
  );

  const template = useMemo(
    () => (templates ?? []).find((t) => t.id === report?.templateId) ?? null,
    [templates, report?.templateId],
  );

  // Report detail API returns sections with nested metrics
  type SectionWithMetrics = ReportSection & { metrics: ReportMetric[] };
  const sectionsWithMetrics = useMemo(() => {
    const secs: SectionWithMetrics[] =
      (report as Report & { sections?: SectionWithMetrics[] })?.sections ?? [];
    return secs.map((s: SectionWithMetrics) => ({
      section: s as ReportSection,
      metrics: s.metrics ?? [],
    }));
  }, [report]);

  /* ── Action handler ─────────────────────────────────────────────────────── */

  async function handleAction(action: ActionConfig) {
    if (!report) return;
    const endpointMap: Record<string, string> = {
      submit: API_ROUTES.reports.submit(report.id),
      approve: API_ROUTES.reports.approve(report.id),
      review: API_ROUTES.reports.review(report.id),
      "request-edits": API_ROUTES.reports.requestEdit(report.id),
      lock: API_ROUTES.reports.lock(report.id),
      unlock: API_ROUTES.reports.unlock(report.id),
    };
    const url = endpointMap[action.key];
    if (!url) return;
    await fetch(url, { method: "POST", credentials: "include" });
    refetchReport();
  }

  /* ── Loading / not found ────────────────────────────────────────────────── */

  const isLoading = report === undefined || templates === undefined || events === undefined;

  if (isLoading) return <LoadingSkeleton rows={6} />;

  if (!report) {
    return (
      <PageLayout>
        <EmptyState title={CONTENT.common.errorNotFound} description="" />
      </PageLayout>
    );
  }

  /* ── Visible actions ────────────────────────────────────────────────────── */

  const visibleActions = REPORT_ACTIONS.filter(
    (a) => role && a.allowedRoles.includes(role) && a.visibleWhen.includes(report.status),
  );

  /* ── Edit button ────────────────────────────────────────────────────────── */

  const canEdit =
    (can.fillReports || role === UserRole.SUPERADMIN) &&
    (report.status === ReportStatus.DRAFT ||
      report.status === ReportStatus.REQUIRES_EDITS ||
      report.status === ReportStatus.LOCKED);

  const backHref = APP_ROUTES.reports;
  const reportLabel = getReportLabel(report, templates ?? []);

  return (
    <PageLayout>
      <PageHeader
        title={reportLabel}
        subtitle={
          !(report.title && report.title.trim().length > 0) ? formatReportPeriod(report) : undefined
        }
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(backHref)}>
              {CONTENT.common.back ?? "Back"}
            </Button>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => router.push(APP_ROUTES.reportAnalytics(report.id))}
            >
              Analytics
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                const secs = sectionsWithMetrics.map((s) => s.section);
                const mets = sectionsWithMetrics.flatMap((s) => s.metrics);
                exportReportDetail(
                  report,
                  secs,
                  mets,
                  templates ?? [],
                  campuses ?? [],
                  users ?? [],
                );
              }}
            >
              {(rk.export as Record<string, string>).button}
            </Button>
            {canEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(APP_ROUTES.reportEdit(report.id))}
              >
                {CONTENT.common.edit}
              </Button>
            )}
            {visibleActions.map((action) => (
              <Button
                key={action.key}
                type={action.type === "danger" ? "default" : action.type}
                danger={action.type === "danger"}
                icon={action.icon}
                onClick={() => handleAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        }
      />

      {/* Status badge */}
      <div className="mb-6">
        <ReportStatusBadge status={report.status} />
      </div>

      {/* Metadata */}
      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5 mb-6">
        <h2 className="text-sm font-semibold text-ds-text-primary mb-3">
          {CONTENT.reports.metadata?.title ?? "Details"}
        </h2>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label={CONTENT.reports.columnLabels?.campus ?? "Campus"}>
            {campus?.name ?? report.campusId}
          </Descriptions.Item>
          <Descriptions.Item label={CONTENT.reports.columnLabels?.period ?? "Period"}>
            {formatReportPeriod(report)}
          </Descriptions.Item>
          <Descriptions.Item label={CONTENT.reports.columnLabels?.deadline ?? "Deadline"}>
            {fmtDate(report.deadline)}
          </Descriptions.Item>
          <Descriptions.Item label={CONTENT.reports.columnLabels?.status ?? "Status"}>
            <ReportStatusBadge status={report.status} />
          </Descriptions.Item>
          {submitter && (
            <Descriptions.Item label={CONTENT.reports.columnLabels?.submittedBy ?? "Submitted by"}>
              {submitter.firstName} {submitter.lastName}
            </Descriptions.Item>
          )}
          {report.lockedAt && (
            <Descriptions.Item label={CONTENT.reports.columnLabels?.lockedAt ?? "Locked at"}>
              {fmtDate(report.lockedAt)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {/* Report sections + metrics */}
      <div className="space-y-4 mb-6">
        {/* Case A: saved section data exists (report was submitted through the form) */}
        {sectionsWithMetrics.length > 0 &&
          sectionsWithMetrics.map(({ section, metrics: sectionMetrics }) => (
            <div
              key={section.id}
              className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5"
            >
              <h3 className="text-sm font-semibold text-ds-text-primary mb-3">
                {section.sectionName}
              </h3>
              {sectionMetrics.length === 0 ? (
                <p className="text-xs text-ds-text-subtle">{CONTENT.common.noResultsDescription}</p>
              ) : (
                <div className="divide-y divide-ds-border-subtle">
                  {sectionMetrics.map((m) => (
                    <div key={m.id} className="py-2 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm text-ds-text-secondary">{m.metricName}</p>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-ds-text-primary tabular-nums">
                            {m.monthlyAchieved ?? "—"}
                            {m.monthlyGoal !== undefined && (
                              <span className="text-ds-text-subtle font-normal">
                                {" "}
                                / {m.monthlyGoal}
                              </span>
                            )}
                          </p>

                          {(() => {
                            const hasGoal =
                              m.monthlyGoal !== undefined &&
                              m.monthlyGoal !== null &&
                              m.monthlyGoal !== 0;
                            const livePct = hasGoal
                              ? Math.round(((m.monthlyAchieved ?? 0) / m.monthlyGoal!) * 100)
                              : undefined;
                            const pctToShow =
                              m.computedPercentage !== undefined && m.computedPercentage !== null
                                ? Math.round(m.computedPercentage)
                                : livePct;
                            const yoyDelta =
                              m.yoyGoal !== undefined &&
                              m.yoyGoal !== null &&
                              m.yoyGoal !== 0 &&
                              m.monthlyAchieved !== undefined
                                ? Math.round(((m.monthlyAchieved - m.yoyGoal) / m.yoyGoal) * 100)
                                : undefined;

                            return (
                              <>
                                {pctToShow !== undefined && (
                                  <p className="text-xs text-ds-text-subtle tabular-nums">
                                    {pctToShow}%
                                    {m.computedPercentage === undefined && hasGoal && " (calc)"}
                                  </p>
                                )}
                                {m.yoyGoal !== undefined && m.yoyGoal !== null && (
                                  <p className="text-xs text-ds-text-subtle tabular-nums">
                                    <span className="font-semibold">YoY: </span>
                                    {m.yoyGoal}
                                    {yoyDelta !== undefined && (
                                      <span className="ml-1 text-ds-text-secondary">
                                        ({yoyDelta >= 0 ? "+" : ""}
                                        {yoyDelta}% vs YoY)
                                      </span>
                                    )}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      {m.comment && (
                        <p className="text-xs text-ds-text-secondary italic pl-2 border-l-2 border-ds-border-subtle">
                          {m.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        {/* Case B: no saved section data — render the template structure as a read-only skeleton */}
        {sectionsWithMetrics.length === 0 &&
          template &&
          template.sections.length > 0 &&
          [...template.sections]
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div
                key={section.id}
                className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5"
              >
                <h3 className="text-sm font-semibold text-ds-text-primary mb-3">{section.name}</h3>
                {section.metrics.length === 0 ? (
                  <p className="text-xs text-ds-text-subtle">
                    {CONTENT.common.noResultsDescription}
                  </p>
                ) : (
                  <div className="divide-y divide-ds-border-subtle">
                    {[...section.metrics]
                      .sort((a, b) => a.order - b.order)
                      .map((m) => (
                        <div key={m.id} className="py-2">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-ds-text-secondary">{m.name}</p>
                            <p className="text-sm text-ds-text-subtle tabular-nums">—</p>
                          </div>
                          {m.description && (
                            <p className="text-xs text-ds-text-subtle mt-0.5">{m.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}

        {/* Case C: no template — nothing to show */}
        {sectionsWithMetrics.length === 0 && !template && (
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
            <p className="text-sm text-ds-text-subtle">{CONTENT.common.noResultsDescription}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {report.notes && (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5 mb-6">
          <h3 className="text-sm font-semibold text-ds-text-primary mb-2">
            {CONTENT.reports.notesLabel ?? "Notes"}
          </h3>
          <p className="text-sm text-ds-text-secondary whitespace-pre-wrap">{report.notes}</p>
        </div>
      )}

      {/* Audit Trail */}
      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
        <h3 className="text-sm font-semibold text-ds-text-primary mb-5">
          {rk.auditTrailTitle as string}
        </h3>
        {sortedEvents.length === 0 ? (
          <p className="text-sm text-ds-text-subtle">{CONTENT.dashboard.noActivity}</p>
        ) : (
          <ol className="relative border-l-2 border-ds-border-base ml-3 space-y-0">
            {sortedEvents.map((ev, idx) => {
              const actor = (users ?? []).find((u) => u.id === ev.actorId);
              const cfg = getEventConfig(ev.eventType);
              const label = eventLabels[ev.eventType] ?? ev.eventType;
              const isFirst = idx === 0;
              const isLast = idx === sortedEvents.length - 1;

              return (
                <li key={ev.id} className={`ml-6 relative ${isLast ? "" : "pb-5"}`}>
                  {/* Timeline dot */}
                  <span
                    className={`absolute -left-[calc(1.5rem+5px)] top-1 flex items-center justify-center w-4 h-4 rounded-full ring-2 ring-ds-surface-elevated ${cfg.dotColor}`}
                  />
                  {/* Content */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag color={cfg.color} className="text-xs m-0">
                        {cfg.icon}
                        <span className="ml-1">{label}</span>
                      </Tag>
                      {ev.previousStatus && ev.newStatus && (
                        <span className="text-[10px] text-ds-text-subtle">
                          {ev.previousStatus} → {ev.newStatus}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ds-text-subtle">
                      <time>{fmtDateTime(ev.timestamp)}</time>
                      {actor && (
                        <span>
                          · {actor.firstName} {actor.lastName}
                        </span>
                      )}
                    </div>
                    {ev.details && (
                      <p className="text-xs text-ds-text-secondary mt-0.5 italic border-l-2 border-ds-border-subtle pl-2">
                        {ev.details}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </PageLayout>
  );
}
