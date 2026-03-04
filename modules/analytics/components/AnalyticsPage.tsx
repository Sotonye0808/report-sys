"use client";

/**
 * modules/analytics/components/AnalyticsPage.tsx
 * Unified, role-aware analytics dashboard.
 * Used by both app/(leader)/analytics/page.tsx  and
 *            app/(superadmin)/analytics/page.tsx
 *
 * Role-awareness:
 *  - SUPERADMIN: system-wide scope, 8 KPI cards, BarChart + compliance bars
 *  - All others: campus-scoped (if user.campusId set), 4 KPI cards, PieChart
 */

import { useState, useEffect } from "react";
import { Select } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useMockDbSubscription } from "@/lib/hooks/useMockDbSubscription";
import { mockDb } from "@/lib/data/mockDb";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import Card from "@/components/ui/Card";
import { UserRole } from "@/types/global";

/* ── Shared types ─────────────────────────────────────────────────────────── */

interface AnalyticsOverview {
  totals: {
    total: number;
    submitted: number;
    approved: number;
    reviewed: number;
    locked: number;
    draft: number;
    requiresEdits: number;
  };
  compliance: number;
  submissionTrend: { month: string; count: number }[];
  campusBreakdown: {
    campusId: string;
    submitted: number;
    approved: number;
    complianceRate: number;
  }[];
}

/* ── KPI card config ──────────────────────────────────────────────────────── */

interface KpiConfig {
  id: string;
  label: string;
  value: (d: AnalyticsOverview, extra: { users: number; campuses: number }) => number | string;
  /** Only shown when the current role is included */
  allowedRoles: UserRole[];
}

const ALL_ROLES = Object.values(UserRole);

const KPI_CARDS: KpiConfig[] = [
  {
    id: "total",
    label: CONTENT.dashboard.kpi.totalReports as string,
    value: (d) => d.totals.total,
    allowedRoles: ALL_ROLES,
  },
  {
    id: "submitted",
    label: CONTENT.dashboard.kpi.pendingReview as string,
    value: (d) => d.totals.submitted,
    allowedRoles: ALL_ROLES,
  },
  {
    id: "approved",
    label: CONTENT.dashboard.kpi.approvedReports as string,
    value: (d) => d.totals.approved,
    allowedRoles: ALL_ROLES,
  },
  {
    id: "compliance",
    label: CONTENT.dashboard.kpi.complianceRate as string,
    value: (d) => `${d.compliance}%`,
    allowedRoles: ALL_ROLES,
  },
  {
    id: "users",
    label: CONTENT.dashboard.kpi.totalUsers as string,
    value: (_d, e) => e.users,
    allowedRoles: [UserRole.SUPERADMIN],
  },
  {
    id: "campuses",
    label: CONTENT.dashboard.kpi.totalCampuses as string,
    value: (_d, e) => e.campuses,
    allowedRoles: [UserRole.SUPERADMIN],
  },
  {
    id: "draft",
    label: (CONTENT.dashboard.kpi.drafts as string) ?? "Drafts",
    value: (d) => d.totals.draft,
    allowedRoles: [UserRole.SUPERADMIN],
  },
  {
    id: "requires",
    label: (CONTENT.dashboard.kpi.requiresEdits as string) ?? "Requires Edits",
    value: (d) => d.totals.requiresEdits,
    allowedRoles: [UserRole.SUPERADMIN],
  },
];

/* ── Chart palette ────────────────────────────────────────────────────────── */

const PIE_COLORS = [
  "var(--ds-chart-1)",
  "var(--ds-chart-2)",
  "var(--ds-chart-3)",
  "var(--ds-chart-4)",
  "var(--ds-chart-5)",
  "var(--ds-chart-6)",
];

const TOOLTIP_STYLE = {
  background: "var(--ds-surface-elevated)",
  border: "1px solid var(--ds-border-base)",
  borderRadius: 8,
};

/* ── Year options ─────────────────────────────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => ({
  value: y,
  label: String(y),
}));

/* ── Section config ───────────────────────────────────────────────────────── */

interface SectionConfig {
  id: string;
  allowedRoles: UserRole[];
}

const CHART_SECTIONS: SectionConfig[] = [
  { id: "trend", allowedRoles: ALL_ROLES },
  { id: "pie", allowedRoles: ALL_ROLES.filter((r) => r !== UserRole.SUPERADMIN) },
  { id: "bar", allowedRoles: [UserRole.SUPERADMIN] },
  { id: "compliance", allowedRoles: [UserRole.SUPERADMIN] },
];

/* ── Page component ───────────────────────────────────────────────────────── */

export function AnalyticsPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperadmin = role === UserRole.SUPERADMIN;

  /* System-wide counts — only loaded for SUPERADMIN */
  const allUsers = useMockDbSubscription<UserProfile[]>("users", () => mockDb.users.findMany({}));
  const allCampuses = useMockDbSubscription<Campus[]>("campuses", () =>
    mockDb.campuses.findMany({}),
  );

  /* Fetch analytics from API */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ year: String(year) });
        if (!isSuperadmin && user?.campusId) params.set("campusId", user.campusId);
        const res = await fetch(`${API_ROUTES.analytics.overview}?${params}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        /* silent — skeleton stays */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year, user?.campusId, isSuperadmin]);

  /* Derived values */
  const extra = {
    users: allUsers?.length ?? 0,
    campuses: allCampuses?.length ?? 0,
  };

  /* Enrich campus breakdown with resolved names */
  const campusBreakdownEnriched = (data?.campusBreakdown ?? []).map((row) => {
    const campus = allCampuses?.find((c) => c.id === row.campusId);
    return { ...row, name: campus?.name ?? row.campusId };
  });

  /* Slice KPI cards to current role */
  const visibleKpis = role
    ? KPI_CARDS.filter((k) => k.allowedRoles.includes(role as UserRole))
    : KPI_CARDS.slice(0, 4);

  /* Slice visible chart sections */
  const visibleSections = role
    ? CHART_SECTIONS.filter((s) => s.allowedRoles.includes(role as UserRole)).map((s) => s.id)
    : ["trend", "pie"];

  const pieData = data
    ? [
        { name: CONTENT.reports.status.DRAFT as string, value: data.totals.draft },
        { name: CONTENT.reports.status.SUBMITTED as string, value: data.totals.submitted },
        { name: CONTENT.reports.status.APPROVED as string, value: data.totals.approved },
        { name: CONTENT.reports.status.REVIEWED as string, value: data.totals.reviewed },
        { name: CONTENT.reports.status.LOCKED as string, value: data.totals.locked },
        { name: CONTENT.reports.status.REQUIRES_EDITS as string, value: data.totals.requiresEdits },
      ].filter((s) => s.value > 0)
    : [];

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <PageLayout>
      <PageHeader
        title={CONTENT.analytics.pageTitle as string}
        actions={<Select value={year} options={YEAR_OPTIONS} onChange={setYear} size="large" />}
      />
      {loading || !data ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <div className="space-y-6">
          {/* KPI bento row — role-filtered */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {visibleKpis.map((card) => (
              <Card key={card.id} className="!p-5">
                <p className="text-xs font-medium text-ds-text-subtle mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-ds-text-primary tracking-tight">
                  {card.value(data, extra)}
                </p>
              </Card>
            ))}
          </div>

          {/* Submission trend — shown to all roles */}
          {visibleSections.includes("trend") && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">
                  {CONTENT.analytics.trendsTitle as string}
                </h2>
                <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
              </div>
              {data.submissionTrend.length === 0 ? (
                <p className="text-sm text-ds-text-subtle">{CONTENT.analytics.noData as string}</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.submissionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--ds-brand-accent)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "var(--ds-brand-accent)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Status breakdown pie — non-superadmin */}
          {visibleSections.includes("pie") && pieData.length > 0 && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">
                  {(CONTENT.analytics.statusBreakdownTitle as string) ?? "Status Breakdown"}
                </h2>
                <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                    labelLine={{ stroke: "var(--ds-border-base)" }}
                  >
                    {pieData.map((_entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Campus comparison bar chart — SUPERADMIN only */}
          {visibleSections.includes("bar") && campusBreakdownEnriched.length > 0 && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">
                  {CONTENT.analytics.campusBreakdownTitle as string}
                </h2>
                <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={campusBreakdownEnriched} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--ds-text-subtle)" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Bar
                    dataKey="submitted"
                    name="Submitted"
                    fill="var(--ds-chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="approved"
                    name="Approved"
                    fill="var(--ds-chart-2)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Campus compliance progress bars — SUPERADMIN only */}
          {visibleSections.includes("compliance") && campusBreakdownEnriched.length > 0 && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">
                  {CONTENT.analytics.complianceTitle as string}
                </h2>
                <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
              </div>
              <div className="space-y-3">
                {[...campusBreakdownEnriched]
                  .sort((a, b) => b.complianceRate - a.complianceRate)
                  .map((row) => (
                    <div key={row.campusId} className="flex items-center gap-4">
                      <span className="text-sm text-ds-text-primary w-40 truncate flex-shrink-0">
                        {row.name}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-ds-surface-sunken overflow-hidden">
                        <div
                          className="h-full rounded-full bg-ds-brand-accent transition-all duration-500"
                          // Dynamic width must use inline style — no Tailwind alternative for runtime percentages
                          // eslint-disable-next-line react/forbid-component-props
                          style={
                            {
                              width: `${Math.min(row.complianceRate, 100)}%`,
                            } as React.CSSProperties
                          }
                        />
                      </div>
                      <span className="text-xs font-semibold font-ds-mono text-ds-text-secondary w-12 text-right flex-shrink-0">
                        {row.complianceRate}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
