"use client";

/**
 * modules/dashboard/components/DashboardPage.tsx
 *
 * Unified role-aware dashboard — handles ALL roles via dashboardMode.
 *
 * Modes driven by ROLE_CONFIG[role].dashboardMode:
 *   "system"          → SUPERADMIN: org-wide KPIs, recent reports + recent users widgets
 *   "analytics"       → CEO / SPO / CHURCH_MINISTRY: compliance-focused KPIs
 *   "report-review"   → CAMPUS_ADMIN / CAMPUS_PASTOR: pending + approval KPIs
 *   "report-reviewed" → secondary review roles
 *   "report-fill"     → GROUP_ADMIN / GROUP_PASTOR / DATA_ENTRY: submission-focused KPIs
 *
 * Architecture notes:
 *   • ALL_KPI_CARDS: allowedModes[] filters visible cards per mode.
 *   • "system" mode additionally loads users / templates / campuses.
 *   • No role-specific JSX branches — only config-driven filtering.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  TeamOutlined,
  LayoutOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { getReportLabel, formatReportPeriod } from "@/lib/utils/reportUtils";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { ReportStatusBadge, RoleBadge } from "@/components/ui/StatusBadge";
import { UserRole, ReportStatus, ReportPeriodType } from "@/types/global";

/* ── Local types ──────────────────────────────────────────────────────────── */

interface KpiCardConfig {
  id: string;
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  href?: string;
  /** Modes for which this card is visible */
  allowedModes: string[];
}

/* ── KpiCard ─────────────────────────────────────────────────────────────── */

function KpiCard({ config }: { config: KpiCardConfig }) {
  const router = useRouter();

  return (
    <button
      onClick={() => config.href && router.push(config.href)}
      className={[
        "flex flex-col gap-3 p-5 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base text-left w-full",
        "transition-shadow hover:shadow-ds-md focus:outline-1 focus:outline-ds-brand-accent",
        config.href ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ds-text-secondary leading-snug">{config.label}</p>
        <span
          className={[
            "flex items-center justify-center w-9 h-9 rounded-ds-lg flex-shrink-0 text-base",
            config.color,
          ].join(" ")}
        >
          {config.icon}
        </span>
      </div>
      <p className="text-3xl font-bold text-ds-text-primary tabular-nums">{config.value}</p>
    </button>
  );
}

/* ── RecentReportsList ────────────────────────────────────────────────────── */

function RecentReportsList({
  reports,
  templates,
  isSuperadmin,
}: {
  reports: Report[];
  templates: ReportTemplate[];
  isSuperadmin: boolean;
}) {
  const router = useRouter();

  if (!reports.length) {
    return (
      <EmptyState
        title={CONTENT.reports.emptyState.title}
        description={CONTENT.reports.emptyState.description}
      />
    );
  }

  return (
    <ul className="divide-y divide-ds-border-subtle">
      {reports.map((r) => (
        <li key={r.id}>
          <button
            onClick={() => router.push(APP_ROUTES.reportDetail(r.id))}
            className="flex items-center justify-between gap-4 w-full py-3 px-1 hover:bg-ds-surface-sunken rounded-ds-lg transition-colors text-left bg-transparent border-none cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ds-text-primary truncate">
                {getReportLabel(r, templates)}
              </p>
              <p className="text-xs text-ds-text-subtle mt-0.5">{formatReportPeriod(r)}</p>
            </div>
            <div className="flex-shrink-0">
              <ReportStatusBadge status={r.status} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── RecentUsersList (system mode only) ──────────────────────────────────── */

function RecentUsersList({ users }: { users: UserProfile[] }) {
  const router = useRouter();

  if (!users.length) {
    return (
      <EmptyState
        title={CONTENT.users.emptyState.title}
        description={CONTENT.users.emptyState.description}
      />
    );
  }

  return (
    <ul className="divide-y divide-ds-border-subtle">
      {users.map((u) => (
        <li key={u.id}>
          <button
            onClick={() => router.push(APP_ROUTES.userDetail(u.id))}
            className="flex items-center justify-between gap-4 w-full py-3 px-1 hover:bg-ds-surface-sunken rounded-ds-lg transition-colors text-left bg-transparent border-none cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ds-text-primary truncate">
                {u.firstName} {u.lastName}
              </p>
              <p className="text-xs text-ds-text-subtle mt-0.5 truncate">{u.email}</p>
            </div>
            <div className="flex-shrink-0">
              <RoleBadge role={u.role} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── DashboardPage ────────────────────────────────────────────────────────── */

export function DashboardPage() {
  const { user } = useAuth();
  const { role, config: roleConfig } = useRole();
  const router = useRouter();

  const dashboardMode = roleConfig?.dashboardMode ?? "report-fill";
  const isSuperadmin = role === UserRole.SUPERADMIN;
  const visibilityScope = roleConfig?.reportVisibilityScope ?? "own";

  /* ── Data subscriptions ─────────────────────────────────────────────────── */

  // Load reports scoped to campus where applicable.
  // Complex scoping (own) is done in useMemo — WhereClause<T> only supports Partial<T>.
  const reportsUrl = user
    ? visibilityScope === "campus" && user.campusId
      ? `${API_ROUTES.reports.list}?all=true&campusId=${user.campusId}`
      : `${API_ROUTES.reports.list}?all=true`
    : null;
  const { data: reportsPage } = useApiData<{ reports: Report[]; total: number }>(reportsUrl);
  const allReports = reportsPage?.reports;

  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

  // System-mode-only subscriptions — empty for non-superadmin
  const { data: allUsers } = useApiData<UserProfile[]>(isSuperadmin ? API_ROUTES.users.list : null);

  const { data: campuses } = useApiData<Campus[]>(isSuperadmin ? API_ROUTES.org.campuses : null);

  /* ── Scope filtering ────────────────────────────────────────────────────── */

  const reports = useMemo(() => {
    if (!allReports) return undefined;
    if (visibilityScope === "own" && user) {
      return allReports.filter((r) => r.orgGroupId === user.orgGroupId);
    }
    return allReports;
  }, [allReports, visibilityScope, user]);

  /* ── Derived counts ─────────────────────────────────────────────────────── */

  const counts = useMemo(() => {
    const r = reports ?? [];
    const u = allUsers ?? [];
    const t = templates ?? [];
    const c = campuses ?? [];

    const completed = r.filter((x) =>
      [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(x.status),
    ).length;

    // Current quarter compliance
    const now = new Date();
    const currentQ = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();
    const qMonths = [(currentQ - 1) * 3 + 1, (currentQ - 1) * 3 + 2, (currentQ - 1) * 3 + 3];
    const qReports = r.filter((x) => x.periodYear === currentYear && qMonths.includes(x.periodMonth ?? 0));
    const qSubmitted = qReports.filter((x) => x.status !== ReportStatus.DRAFT).length;
    const qApproved = qReports.filter((x) =>
      [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(x.status),
    ).length;
    const quarterlyCompliance = qSubmitted > 0 ? Math.round((qApproved / qSubmitted) * 100) : 0;

    return {
      totalReports: r.length,
      pending: r.filter((x) => x.status === ReportStatus.SUBMITTED).length,
      approved: r.filter((x) => x.status === ReportStatus.APPROVED).length,
      draft: r.filter((x) => x.status === ReportStatus.DRAFT).length,
      requiresEdits: r.filter((x) => x.status === ReportStatus.REQUIRES_EDITS).length,
      compliance: r.length > 0 ? Math.round((completed / r.length) * 100) : 0,
      quarterlyCompliance,
      quarterlyLabel: `Q${currentQ}`,
      activeUsers: u.filter((x) => x.isActive).length,
      activeTemplates: t.filter((x) => x.isActive !== false).length,
      totalCampuses: c.length,
    };
  }, [reports, allUsers, templates, campuses]);

  /* ── Weekly report check for current period ─────────────────────────────── */

  const weeklyReportCheck = useMemo(() => {
    if (!reports || !user) return { hasWeeklyReport: true, currentPeriodLabel: "" };
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
    const currentWeek = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
    const currentYear = now.getFullYear();

    const hasWeeklyReport = reports.some(
      (r) =>
        r.periodType === ReportPeriodType.WEEKLY &&
        r.periodYear === currentYear &&
        r.periodWeek === currentWeek &&
        r.createdById === user.id,
    );

    return {
      hasWeeklyReport,
      currentPeriodLabel: `Week ${currentWeek}, ${currentYear}`,
    };
  }, [reports, user]);

  /* ── KPI card config ────────────────────────────────────────────────────── */

  const reportsHref = APP_ROUTES.reports;

  const ALL_KPI_CARDS: KpiCardConfig[] = [
    {
      id: "total-reports",
      label: CONTENT.dashboard.kpi.totalReports,
      value: counts.totalReports,
      icon: <FileTextOutlined />,
      color: "bg-ds-brand-accent/10 text-ds-brand-accent",
      href: reportsHref,
      allowedModes: ["system", "report-fill", "report-review", "report-reviewed", "analytics"],
    },
    {
      id: "pending-review",
      label: CONTENT.dashboard.kpi.pendingReview,
      value: counts.pending,
      icon: <ClockCircleOutlined />,
      color: "bg-ds-state-warning/10 text-ds-state-warning",
      href: reportsHref,
      allowedModes: ["system", "report-review", "report-reviewed", "analytics"],
    },
    {
      id: "approved-reports",
      label: CONTENT.dashboard.kpi.approvedReports,
      value: counts.approved,
      icon: <CheckCircleOutlined />,
      color: "bg-ds-state-success/10 text-ds-state-success",
      href: reportsHref,
      allowedModes: ["system", "report-fill", "report-review", "report-reviewed", "analytics"],
    },
    {
      id: "compliance-rate",
      label: CONTENT.dashboard.kpi.complianceRate,
      value: `${counts.compliance}%`,
      icon: <BarChartOutlined />,
      color: "bg-ds-brand-secondary/10 text-ds-brand-secondary",
      allowedModes: ["system", "report-review", "report-reviewed", "analytics"],
    },
    {
      id: "total-users",
      label: CONTENT.dashboard.kpi.totalUsers,
      value: counts.activeUsers,
      icon: <TeamOutlined />,
      color: "bg-ds-brand-accent/10 text-ds-brand-accent",
      href: APP_ROUTES.users,
      allowedModes: ["system"],
    },
    {
      id: "total-campuses",
      label: CONTENT.dashboard.kpi.totalCampuses,
      value: counts.totalCampuses,
      icon: <ApartmentOutlined />,
      color: "bg-ds-surface-sunken text-ds-text-secondary",
      href: APP_ROUTES.org,
      allowedModes: ["system"],
    },
    {
      id: "active-templates",
      label: CONTENT.dashboard.kpi.activeTemplates,
      value: counts.activeTemplates,
      icon: <LayoutOutlined />,
      color: "bg-ds-state-info/10 text-ds-state-info",
      href: APP_ROUTES.templates,
      allowedModes: ["system"],
    },
    {
      id: "requires-edits",
      label: CONTENT.reports.status.REQUIRES_EDITS,
      value: counts.requiresEdits,
      icon: <ExclamationCircleOutlined />,
      color: "bg-ds-state-error/10 text-ds-state-error",
      href: reportsHref,
      allowedModes: ["system", "report-fill"],
    },
    {
      id: "draft-reports",
      label: CONTENT.reports.status.DRAFT,
      value: counts.draft,
      icon: <SendOutlined />,
      color: "bg-ds-surface-sunken text-ds-text-subtle",
      href: reportsHref,
      allowedModes: ["report-fill"],
    },
    {
      id: "quarterly-compliance",
      label: `${CONTENT.dashboard.kpi.quarterlyCompliance} (${counts.quarterlyLabel})`,
      value: `${counts.quarterlyCompliance}%`,
      icon: <BarChartOutlined />,
      color: "bg-ds-brand-secondary/10 text-ds-brand-secondary",
      href: APP_ROUTES.analytics,
      allowedModes: ["system", "analytics", "report-review", "report-reviewed"],
    },
  ];

  const visibleKpiCards = ALL_KPI_CARDS.filter((c) => c.allowedModes.includes(dashboardMode));

  /* ── Recent items ───────────────────────────────────────────────────────── */

  const recentReports = useMemo(
    () =>
      [...(reports ?? [])]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [reports],
  );

  const recentUsers = useMemo(
    () =>
      [...(allUsers ?? [])]
        .sort(
          (a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime(),
        )
        .slice(0, 5),
    [allUsers],
  );

  /* ── Guards ─────────────────────────────────────────────────────────────── */

  const isLoading =
    reports === undefined || templates === undefined || (isSuperadmin && allUsers === undefined);

  const canCreate = roleConfig?.canCreateReports ?? false;

  if (!user || !role) return <LoadingSkeleton rows={3} />;

  /* ── Member lobby — MEMBER role sees a waiting page ─────────────────────── */
  if (role === UserRole.MEMBER) {
    const lobby = CONTENT.dashboard.memberLobby as {
      title: string;
      subtitle: string;
      waitingLabel: string;
      currentRole: string;
      contactAdmin: string;
    };

    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-20 px-4 max-w-lg mx-auto text-center gap-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-ds-brand-accent/10">
            <ClockCircleOutlined className="text-3xl text-ds-brand-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-ds-text-primary">{lobby.title}</h1>
            <p className="text-sm text-ds-text-secondary leading-relaxed">{lobby.subtitle}</p>
          </div>
          <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl p-5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ds-text-secondary">{lobby.currentRole}</span>
              <span className="text-xs font-medium text-ds-text-subtle bg-ds-surface-sunken px-3 py-1 rounded-full">
                {lobby.waitingLabel}
              </span>
            </div>
            <p className="text-left text-sm font-medium text-ds-text-primary mt-2">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-left text-xs text-ds-text-subtle">{user.email}</p>
          </div>
          <p className="text-xs text-ds-text-subtle">{lobby.contactAdmin}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={CONTENT.dashboard.pageTitle}
        subtitle={`${CONTENT.dashboard.welcomeBack}, ${user.firstName}`}
        actions={
          canCreate ? (
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => router.push(APP_ROUTES.reportNew)}
            >
              {CONTENT.reports.newReport}
            </Button>
          ) : undefined
        }
      />

      {/* ── Role-aware action CTAs ───────────────────────────────────────── */}
      {!isLoading &&
        (() => {
          const ctaContent = CONTENT.dashboard.cta as {
            pendingApproval: (n: number) => string;
            pendingReview: (n: number) => string;
            draftReports: (n: number) => string;
            requiresEdits: (n: number) => string;
            weeklyReportDue: (period: string) => string;
            viewReports: string;
          };

          interface CtaItem {
            id: string;
            message: string;
            type: "warning" | "info" | "error";
            show: boolean;
          }

          const ctaItems: CtaItem[] = [
            {
              id: "weekly-report-due",
              message: ctaContent.weeklyReportDue(weeklyReportCheck.currentPeriodLabel),
              type: "warning",
              show: (roleConfig?.canFillReports ?? false) && !weeklyReportCheck.hasWeeklyReport,
            },
            {
              id: "pending-approval",
              message: ctaContent.pendingApproval(counts.pending),
              type: "warning",
              show: (roleConfig?.canApproveReports ?? false) && counts.pending > 0,
            },
            {
              id: "pending-review",
              message: ctaContent.pendingReview(counts.approved),
              type: "info",
              show: (roleConfig?.canMarkReviewed ?? false) && counts.approved > 0,
            },
            {
              id: "drafts",
              message: ctaContent.draftReports(counts.draft),
              type: "info",
              show: (roleConfig?.canFillReports ?? false) && counts.draft > 0,
            },
            {
              id: "requires-edits",
              message: ctaContent.requiresEdits(counts.requiresEdits),
              type: "error",
              show: (roleConfig?.canFillReports ?? false) && counts.requiresEdits > 0,
            },
          ];

          const visible = ctaItems.filter((c) => c.show);
          if (visible.length === 0) return null;

          const typeStyles: Record<"warning" | "info" | "error", string> = {
            warning:
              "border-amber-400/60 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300",
            info: "border-ds-brand-accent/40 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
            error: "border-red-400/60 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300",
          };
          const dotStyles: Record<"warning" | "info" | "error", string> = {
            warning: "bg-amber-400",
            info: "bg-ds-brand-accent",
            error: "bg-red-500",
          };

          return (
            <div className="flex flex-col gap-2 mb-6">
              {visible.map((cta) => (
                <div
                  key={cta.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 rounded-ds-xl border text-sm font-medium ${typeStyles[cta.type]}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotStyles[cta.type]}`} />
                    {cta.message}
                  </span>
                  <button
                    onClick={() => router.push(reportsHref)}
                    className="underline underline-offset-2 text-xs opacity-80 hover:opacity-100 whitespace-nowrap flex-shrink-0"
                  >
                    {ctaContent.viewReports}
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

      {/* KPI grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: visibleKpiCards.length || 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {visibleKpiCards.map((card) => (
            <KpiCard key={card.id} config={card} />
          ))}
        </div>
      )}

      {/* Widgets row */}
      <div className={`grid gap-6 ${isSuperadmin ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Recent reports — all roles */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ds-text-primary">
              {CONTENT.dashboard.recentActivity}
            </h2>
            <Button
              type="link"
              size="small"
              onClick={() => router.push(reportsHref)}
              className="text-ds-text-link"
            >
              {CONTENT.reports.viewReport}
            </Button>
          </div>
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <RecentReportsList
              reports={recentReports}
              templates={templates ?? []}
              isSuperadmin={isSuperadmin}
            />
          )}
        </div>

        {/* Recent users — system mode only */}
        {isSuperadmin && (
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-ds-text-primary">
                {CONTENT.users.pageTitle}
              </h2>
              <Button
                type="link"
                size="small"
                onClick={() => router.push(APP_ROUTES.users)}
                className="text-ds-text-link"
              >
                {CONTENT.common.viewAll}
              </Button>
            </div>
            {isLoading ? <LoadingSkeleton rows={5} /> : <RecentUsersList users={recentUsers} />}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
