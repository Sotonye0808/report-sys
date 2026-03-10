"use client";

/**
 * modules/analytics/components/AnalyticsPage.tsx
 * Full analytics dashboard â€” tabbed, role-aware, config-driven.
 *
 * Tabs: Overview | Metrics Analysis | Trends | Compliance
 * Role-awareness:
 *   SUPERADMIN â€” system-wide scope, all 4 KPI cards, all sections
 *   CEO / SPO / CM â€” cross-campus scope, all sections
 *   GROUP_ADMIN / GROUP_PASTOR â€” group-scoped
 *   CAMPUS_ADMIN / CAMPUS_PASTOR / DATA_ENTRY â€” campus-scoped
 */

import { useState, useEffect, useCallback } from "react";
import { Select, Tabs, Segmented, Progress } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import { UserRole, MetricCalculationType } from "@/types/global";

/* â”€â”€ API response types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface OverviewTotals {
  total: number;
  submitted: number;
  approved: number;
  reviewed: number;
  locked: number;
  draft: number;
  requiresEdits: number;
}

interface CampusBreakdownRow {
  campusId: string;
  submitted: number;
  approved: number;
  total: number;
  complianceRate: number;
}

interface QuarterlyTrendRow {
  quarter: string;
  complianceRate: number;
  submitted: number;
}

interface StatusTrendRow {
  month: string;
  [status: string]: number | string;
}

interface AnalyticsOverview {
  totals: OverviewTotals;
  compliance: number;
  submissionTrend: { month: string; count: number }[];
  campusBreakdown: CampusBreakdownRow[];
  quarterlyTrend: QuarterlyTrendRow[];
  statusTrend: StatusTrendRow[];
}

interface QuarterlyTotals {
  total: number;
  submitted: number;
  approved: number;
  compliance: number;
}

interface QuarterlyMonthRow {
  month: number;
  label: string;
  total: number;
  submitted: number;
  approved: number;
  compliance: number;
}

interface QuarterlyCampusRow {
  campusId: string;
  submitted: number;
  approved: number;
  total: number;
  complianceRate: number;
}

interface QuarterlySummaryData {
  year: number;
  quarter: number;
  label: string;
  current: QuarterlyTotals;
  previous: QuarterlyTotals & { label: string };
  qoqDelta: { total: number; submitted: number; approved: number; compliance: number };
  campusBreakdown: QuarterlyCampusRow[];
  monthlyBreakdown: QuarterlyMonthRow[];
}

interface MetricPoint {
  period: string;
  periodLabel: string;
  goal?: number;
  achieved?: number;
  yoy?: number;
}

interface CampusMetricSeries {
  campusId: string;
  campusName: string;
  series: MetricPoint[];
  avgAchievementRate: number;
}

interface AvailableMetric {
  id: string;
  name: string;
  sectionName: string;
  calculationType: MetricCalculationType;
}

interface MetricAnalyticsData {
  metricId: string;
  metricName: string;
  sectionName: string;
  calculationType: MetricCalculationType;
  aggregate: MetricPoint[];
  byCampus: CampusMetricSeries[];
  availableMetrics: AvailableMetric[];
}

/* â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const ALL_ROLES = Object.values(UserRole);
const CURRENT_YEAR = new Date().getFullYear();

const CHART_ROLES = [
  UserRole.SUPERADMIN,
  UserRole.CEO,
  UserRole.SPO,
  UserRole.CHURCH_MINISTRY,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
];

const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3].map(
  (y) => ({
    value: y,
    label: String(y),
  }),
);

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--ds-surface-elevated)",
  border: "1px solid var(--ds-border-base)",
  borderRadius: 8,
  fontSize: 12,
};

const PIE_COLORS = [
  "var(--ds-chart-1)",
  "var(--ds-chart-2)",
  "var(--ds-chart-3)",
  "var(--ds-chart-4)",
  "var(--ds-chart-5)",
  "var(--ds-chart-6)",
];

/* â”€â”€ KPI card config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface KpiConfig {
  id: string;
  label: string;
  value: (d: AnalyticsOverview, extra: { users: number; campuses: number }) => number | string;
  allowedRoles: UserRole[];
}

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
    value: (d) => d.compliance + "%",
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
    label: CONTENT.analytics.drafts as string,
    value: (d) => d.totals.draft,
    allowedRoles: [UserRole.SUPERADMIN],
  },
  {
    id: "requires",
    label: CONTENT.analytics.requiresEdits as string,
    value: (d) => d.totals.requiresEdits,
    allowedRoles: [UserRole.SUPERADMIN],
  },
];

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">{title}</h2>
      <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 " + className
      }
    >
      <SectionHeader title={title} />
      {children}
    </div>
  );
}

/* â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function AnalyticsPage() {
  const { user } = useAuth();
  const { role } = useRole();

  /* Shared controls */
  const [year, setYear] = useState(CURRENT_YEAR);
  const [campusFilter, setCampusFilter] = useState<string | undefined>(
    // Non-superadmin defaults default to own campus
    undefined,
  );

  /* Overview state */
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  /* Metrics tab state */
  const [selectedMetricId, setSelectedMetricId] = useState<string | undefined>();
  const [granularity, setGranularity] = useState<"weekly" | "monthly" | "quarterly">("monthly");
  const [compareYear, setCompareYear] = useState<number>(CURRENT_YEAR - 1);
  const [metricsData, setMetricsData] = useState<MetricAnalyticsData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState<AvailableMetric[]>([]);

  /* Quarterly tab state */
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [quarterlyData, setQuarterlyData] = useState<QuarterlySummaryData | null>(null);
  const [quarterlyLoading, setQuarterlyLoading] = useState(false);

  const isSuperadmin = role === UserRole.SUPERADMIN;
  const canSeeCrossCampus = CHART_ROLES.includes(role as UserRole);

  /* Campus + user counts */
  const { data: allCampuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const { data: allUsers } = useApiData<UserProfile[]>(isSuperadmin ? API_ROUTES.users.list : null);

  /* Effective campus filter â€” non-cross-campus roles forced to own campus */
  const effectiveCampusId = canSeeCrossCampus ? campusFilter : user?.campusId;

  /* â”€â”€ Fetch overview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.overview + "?" + params.toString());
      const json = await res.json();
      if (json.success) setOverview(json.data as AnalyticsOverview);
    } catch {
      /* silent â€” skeleton holds */
    } finally {
      setOverviewLoading(false);
    }
  }, [year, effectiveCampusId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  /* â”€â”€ Fetch available metrics (for selector) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const fetchAvailableMetrics = useCallback(async () => {
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.metrics + "?" + params.toString());
      const json = await res.json();
      if (json.success && json.data?.availableMetrics) {
        setAvailableMetrics(json.data.availableMetrics as AvailableMetric[]);
      }
    } catch {
      /* silent */
    }
  }, [year, effectiveCampusId]);

  useEffect(() => {
    fetchAvailableMetrics();
  }, [fetchAvailableMetrics]);

  /* â”€â”€ Fetch metric analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const fetchMetrics = useCallback(async () => {
    if (!selectedMetricId) return;
    setMetricsLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(year),
        compareYear: String(compareYear),
        granularity,
      });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      params.set("metricId", selectedMetricId);
      const res = await fetch(API_ROUTES.analytics.metrics + "?" + params.toString());
      const json = await res.json();
      if (json.success) setMetricsData(json.data as MetricAnalyticsData);
    } catch {
      /* silent */
    } finally {
      setMetricsLoading(false);
    }
  }, [selectedMetricId, year, compareYear, granularity, effectiveCampusId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  /* ── Fetch quarterly summary ────────────────────────────────────────────── */

  const fetchQuarterly = useCallback(async () => {
    setQuarterlyLoading(true);
    try {
      const params = new URLSearchParams({ year: String(year), quarter: String(selectedQuarter) });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.quarterly + "?" + params.toString());
      const json = await res.json();
      if (json.success) setQuarterlyData(json.data as QuarterlySummaryData);
    } catch {
      /* silent */
    } finally {
      setQuarterlyLoading(false);
    }
  }, [year, selectedQuarter, effectiveCampusId]);

  useEffect(() => {
    fetchQuarterly();
  }, [fetchQuarterly]);

  const visibleKpis = KPI_CARDS.filter((k) =>
    role ? k.allowedRoles.includes(role as UserRole) : true,
  );

  const extra = { users: allUsers?.length ?? 0, campuses: allCampuses?.length ?? 0 };

  const campusBreakdownNamed = (overview?.campusBreakdown ?? []).map((row) => ({
    ...row,
    name: allCampuses?.find((c) => c.id === row.campusId)?.name ?? row.campusId,
  }));

  const campusOptions = canSeeCrossCampus
    ? [
        { value: "", label: "All Campuses" },
        ...(allCampuses ?? []).map((c) => ({ value: c.id, label: c.name })),
      ]
    : [];

  /* Group available metrics by section for the Select optgroup */
  const metricSelectOptions = (() => {
    const sections: Record<string, AvailableMetric[]> = {};
    for (const m of availableMetrics) {
      if (!sections[m.sectionName]) sections[m.sectionName] = [];
      sections[m.sectionName].push(m);
    }
    return Object.entries(sections).map(([section, metrics]) => ({
      label: section,
      options: metrics.map((m) => ({
        value: m.id,
        label:
          m.name +
          (m.calculationType === MetricCalculationType.AVERAGE
            ? " (avg)"
            : m.calculationType === MetricCalculationType.SNAPSHOT
              ? " (snapshot)"
              : ""),
      })),
    }));
  })();

  /* Campus series for campus comparison bar chart */
  const campusComparisonData = (() => {
    if (!metricsData || metricsData.byCampus.length === 0) return [];
    const allPeriods = Array.from(
      new Set(metricsData.byCampus.flatMap((c) => c.series.map((p) => p.period))),
    ).sort();
    return allPeriods.map((period) => {
      const row: Record<string, string | number> = { period };
      for (const campus of metricsData.byCampus) {
        const pt = campus.series.find((p) => p.period === period);
        row[campus.campusName] = pt?.achieved ?? 0;
      }
      return row;
    });
  })();

  /* CHART_COLORS for per-campus lines */
  const CAMPUS_COLORS = [
    "var(--ds-chart-1)",
    "var(--ds-chart-2)",
    "var(--ds-chart-3)",
    "var(--ds-chart-4)",
    "var(--ds-chart-5)",
    "var(--ds-chart-6)",
  ];

  /* â”€â”€ Shared tab header controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const sharedControls = (
    <div className="flex flex-wrap items-center gap-3">
      {canSeeCrossCampus && (
        <Select
          placeholder={CONTENT.analytics.campusSelectorLabel as string}
          value={campusFilter ?? ""}
          options={campusOptions}
          onChange={(v) => setCampusFilter(v || undefined)}
          style={{ minWidth: 160 }}
          size="middle"
        />
      )}
      <Select
        value={year}
        options={YEAR_OPTIONS}
        onChange={setYear}
        size="middle"
        style={{ width: 100 }}
      />
    </div>
  );

  /* â”€â”€ Overview tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const overviewTab =
    overviewLoading || !overview ? (
      <LoadingSkeleton rows={8} />
    ) : (
      <div className="space-y-6">
        {/* KPI bento row */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
          {visibleKpis.map((card) => (
            <Card key={card.id} className="!p-5">
              <p className="text-xs font-medium text-ds-text-subtle mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-ds-text-primary tracking-tight">
                {card.value(overview, extra)}
              </p>
            </Card>
          ))}
        </div>

        {/* Submission trend */}
        {overview.submissionTrend.length > 0 && (
          <ChartCard title={CONTENT.analytics.trendsTitle as string}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={overview.submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name={CONTENT.analytics.chartLabels.submitted as string}
                  stroke="var(--ds-brand-accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--ds-brand-accent)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Campus breakdown â€” cross-campus roles */}
        {canSeeCrossCampus && campusBreakdownNamed.length > 0 && (
          <ChartCard title={CONTENT.analytics.campusBreakdownTitle as string}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={campusBreakdownNamed} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--ds-text-subtle)" }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar
                  dataKey="submitted"
                  name={CONTENT.analytics.chartLabels.submitted as string}
                  fill="var(--ds-chart-1)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="approved"
                  name={CONTENT.analytics.chartLabels.approved as string}
                  fill="var(--ds-chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    );

  /* â”€â”€ Metrics Analysis tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const metricsTab = (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-ds-surface-elevated rounded-ds-xl border border-ds-border-base p-4">
        <Select
          placeholder={CONTENT.analytics.metricSelectorLabel as string}
          value={selectedMetricId}
          options={metricSelectOptions}
          onChange={(v) => setSelectedMetricId(v)}
          style={{ minWidth: 280 }}
          showSearch
          optionFilterProp="label"
        />
        <Select
          value={compareYear}
          options={YEAR_OPTIONS.filter((y) => y.value !== year)}
          onChange={setCompareYear}
          style={{ width: 120 }}
          placeholder="Compare year"
        />
        <Segmented
          value={granularity}
          onChange={(v) => setGranularity(v as typeof granularity)}
          options={[
            { label: CONTENT.analytics.granularity.monthly as string, value: "monthly" },
            { label: CONTENT.analytics.granularity.quarterly as string, value: "quarterly" },
            { label: CONTENT.analytics.granularity.weekly as string, value: "weekly" },
          ]}
        />
      </div>

      {!selectedMetricId ? (
        <EmptyState title={CONTENT.analytics.noMetricSelected as string} description="" />
      ) : metricsLoading ? (
        <LoadingSkeleton rows={6} />
      ) : !metricsData ? (
        <EmptyState title={CONTENT.analytics.noData as string} description="" />
      ) : (
        <>
          {/* Goal vs Achieved */}
          <ChartCard title={CONTENT.analytics.goalVsAchievedTitle as string}>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={metricsData.aggregate}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis
                  dataKey="periodLabel"
                  tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar
                  dataKey="achieved"
                  name={CONTENT.analytics.chartLabels.achieved as string}
                  fill="var(--ds-chart-1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                {metricsData.calculationType !== MetricCalculationType.SNAPSHOT && (
                  <Line
                    type="monotone"
                    dataKey="goal"
                    name={CONTENT.analytics.chartLabels.goal as string}
                    stroke="var(--ds-chart-3)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
                {metricsData.aggregate.some((p) => p.yoy != null) && (
                  <Line
                    type="monotone"
                    dataKey="yoy"
                    name={CONTENT.analytics.chartLabels.yoy as string}
                    stroke="var(--ds-chart-4)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Campus comparison â€” cross-campus roles only */}
          {canSeeCrossCampus &&
            campusComparisonData.length > 0 &&
            metricsData.byCampus.length > 1 && (
              <ChartCard title={CONTENT.analytics.campusMetricCompTitle as string}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={campusComparisonData} margin={{ bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    {metricsData.byCampus.map((c, i) => (
                      <Bar
                        key={c.campusId}
                        dataKey={c.campusName}
                        fill={CAMPUS_COLORS[i % CAMPUS_COLORS.length]}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={32}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

          {/* Cumulative / Area chart */}
          {metricsData.calculationType === MetricCalculationType.SUM && (
            <ChartCard title={CONTENT.analytics.cumulativeTrendTitle as string}>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={metricsData.aggregate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="periodLabel"
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="achieved"
                    name={CONTENT.analytics.chartLabels.achieved as string}
                    fill="color-mix(in srgb, var(--ds-brand-accent) 20%, transparent)"
                    stroke="var(--ds-brand-accent)"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );

  /* â”€â”€ Trends tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const trendsTab =
    overviewLoading || !overview ? (
      <LoadingSkeleton rows={8} />
    ) : (
      <div className="space-y-6">
        {/* Status stacked bar over time */}
        {overview.statusTrend.length > 0 && (
          <ChartCard title={CONTENT.analytics.statusBreakdownTitle as string}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overview.statusTrend as Record<string, unknown>[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="SUBMITTED" name="Submitted" stackId="a" fill="var(--ds-chart-1)" />
                <Bar dataKey="APPROVED" name="Approved" stackId="a" fill="var(--ds-chart-2)" />
                <Bar dataKey="REVIEWED" name="Reviewed" stackId="a" fill="var(--ds-chart-3)" />
                <Bar dataKey="LOCKED" name="Locked" stackId="a" fill="var(--ds-chart-4)" />
                <Bar
                  dataKey="REQUIRES_EDITS"
                  name="Requires Edits"
                  stackId="a"
                  fill="var(--ds-chart-5)"
                />
                <Bar
                  dataKey="DRAFT"
                  name="Draft"
                  stackId="a"
                  fill="var(--ds-chart-6)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Quarterly compliance trend */}
        {overview.quarterlyTrend.length > 0 && (
          <ChartCard title="Quarterly Compliance Rate">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.quarterlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: unknown) => [v + "%", "Compliance"]}
                />
                <Bar
                  dataKey="complianceRate"
                  name="Compliance %"
                  fill="var(--ds-brand-accent)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    );

  /* â”€â”€ Compliance tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const complianceTab =
    overviewLoading || !overview ? (
      <LoadingSkeleton rows={6} />
    ) : (
      <div className="space-y-6">
        <ChartCard title={CONTENT.analytics.complianceTitle as string}>
          {campusBreakdownNamed.length === 0 ? (
            <p className="text-sm text-ds-text-subtle">{CONTENT.analytics.noData as string}</p>
          ) : (
            <div className="space-y-4">
              {[...campusBreakdownNamed]
                .sort((a, b) => b.complianceRate - a.complianceRate)
                .map((row) => (
                  <div key={row.campusId}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-ds-text-primary truncate">{row.name}</span>
                      <span className="text-xs font-semibold text-ds-text-secondary ml-4 flex-shrink-0">
                        {row.complianceRate}%
                      </span>
                    </div>
                    <Progress
                      percent={Math.min(row.complianceRate, 100)}
                      showInfo={false}
                      strokeColor="var(--ds-brand-accent)"
                      trailColor="var(--ds-surface-sunken)"
                      size="small"
                    />
                  </div>
                ))}
            </div>
          )}
        </ChartCard>

        {/* Summary pie */}
        {(() => {
          const pieData = [
            { name: "Submitted", value: overview.totals.submitted },
            { name: "Approved", value: overview.totals.approved },
            { name: "Reviewed", value: overview.totals.reviewed },
            { name: "Locked", value: overview.totals.locked },
            { name: "Draft", value: overview.totals.draft },
            { name: "Requires Edit", value: overview.totals.requiresEdits },
          ].filter((d) => d.value > 0);
          return pieData.length > 0 ? (
            <ChartCard title={CONTENT.analytics.statusBreakdownTitle as string}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={
                      ((props: Record<string, unknown>) =>
                        String(props.name ?? "") +
                        " " +
                        Math.round(((props.percent as number) ?? 0) * 100) +
                        "%") as unknown as import("recharts").PieLabel
                    }
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
            </ChartCard>
          ) : null;
        })()}
      </div>
    );

  /* â”€â”€ Tab items (config-driven) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  /* ── Quarterly tab ──────────────────────────────────────────────────────── */

  const quarterlyBrNamed = (quarterlyData?.campusBreakdown ?? []).map((row) => ({
    ...row,
    name: allCampuses?.find((c) => c.id === row.campusId)?.name ?? row.campusId,
  }));

  const QUARTER_OPTIONS = [1, 2, 3, 4].map((q) => ({ value: q, label: `Q${q}` }));

  function DeltaBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
    const color = value > 0 ? "text-ds-state-success" : value < 0 ? "text-ds-state-error" : "text-ds-text-subtle";
    const prefix = value > 0 ? "+" : "";
    return <span className={`text-xs font-semibold ${color}`}>{prefix}{value}{suffix}</span>;
  }

  const quarterlyTab =
    quarterlyLoading || !quarterlyData ? (
      <LoadingSkeleton rows={6} />
    ) : (
      <div className="space-y-6">
        {/* Quarter selector */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedQuarter}
            options={QUARTER_OPTIONS}
            onChange={setSelectedQuarter}
            style={{ width: 80 }}
            size="middle"
          />
        </div>

        {/* Quarterly KPIs with QoQ delta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: CONTENT.analytics.quarterlySubmittedLabel as string, cur: quarterlyData.current.submitted, delta: quarterlyData.qoqDelta.submitted },
            { label: CONTENT.analytics.quarterlyApprovedLabel as string, cur: quarterlyData.current.approved, delta: quarterlyData.qoqDelta.approved },
            { label: CONTENT.analytics.quarterlyComplianceLabel as string, cur: quarterlyData.current.compliance, delta: quarterlyData.qoqDelta.compliance, suffix: "%" },
            { label: CONTENT.dashboard.kpi.totalReports as string, cur: quarterlyData.current.total, delta: quarterlyData.qoqDelta.total },
          ].map((item) => (
            <Card key={item.label} className="!p-5">
              <p className="text-xs font-medium text-ds-text-subtle mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-ds-text-primary tracking-tight">
                {item.cur}{item.suffix ?? ""}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <DeltaBadge value={item.delta} suffix={item.suffix === "%" ? "pp" : ""} />
                <span className="text-xs text-ds-text-subtle">{CONTENT.analytics.quarterlyQoqLabel as string}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Monthly breakdown within quarter */}
        {quarterlyData.monthlyBreakdown.length > 0 && (
          <ChartCard title={CONTENT.analytics.quarterlyTitle as string}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={quarterlyData.monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="submitted" name={CONTENT.analytics.chartLabels.submitted as string} fill="var(--ds-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name={CONTENT.analytics.chartLabels.approved as string} fill="var(--ds-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Top campuses this quarter */}
        {canSeeCrossCampus && quarterlyBrNamed.length > 0 && (
          <ChartCard title={CONTENT.analytics.quarterlyTopCampuses as string}>
            <div className="space-y-4">
              {quarterlyBrNamed.slice(0, 10).map((row) => (
                <div key={row.campusId}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-ds-text-primary truncate">{row.name}</span>
                    <span className="text-xs font-semibold text-ds-text-secondary ml-4 flex-shrink-0">
                      {row.complianceRate}%
                    </span>
                  </div>
                  <Progress
                    percent={Math.min(row.complianceRate, 100)}
                    showInfo={false}
                    strokeColor="var(--ds-brand-accent)"
                    trailColor="var(--ds-surface-sunken)"
                    size="small"
                  />
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    );

  const TAB_ITEMS = [
    { key: "overview", label: CONTENT.analytics.tab.overview as string, children: overviewTab },
    { key: "metrics", label: CONTENT.analytics.tab.metrics as string, children: metricsTab },
    { key: "trends", label: CONTENT.analytics.tab.trends as string, children: trendsTab },
    {
      key: "compliance",
      label: CONTENT.analytics.tab.compliance as string,
      children: complianceTab,
    },
    {
      key: "quarterly",
      label: CONTENT.analytics.tab.quarterly as string,
      children: quarterlyTab,
    },
  ];

  /* â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  return (
    <PageLayout>
      <PageHeader title={CONTENT.analytics.pageTitle as string} actions={sharedControls} />
      <Tabs items={TAB_ITEMS} destroyInactiveTabPane={false} />
    </PageLayout>
  );
}
