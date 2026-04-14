"use client";

/**
 * modules/analytics/components/AnalyticsPage.tsx
 * Full analytics dashboard — tabbed, role-aware, config-driven.
 *
 * Tabs: Overview | Metrics Analysis | Trends | Compliance
 * Role-awareness:
 *   SUPERADMIN — system-wide scope, all 4 KPI cards, all sections
 *   CEO / SPO / CM — cross-campus scope, all sections
 *   GROUP_ADMIN / GROUP_PASTOR — group-scoped
 *   CAMPUS_ADMIN / CAMPUS_PASTOR / DATA_ENTRY — campus-scoped
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { Select, Tabs, Segmented, Progress, Checkbox } from "antd";
import Button from "@/components/ui/Button";
import { DownloadOutlined } from "@ant-design/icons";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
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
import { utils, writeFile } from "xlsx";
import {
  MetricChartType,
  AxisLabelMode,
  METRIC_CHART_TYPE_OPTIONS,
  renderMetricChart,
  formatAxisLabel,
  ChartScrollContainer,
} from "@/modules/analytics/chartUtils";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { getIsoWeeksInYear } from "@/lib/utils/isoWeek";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import { UserRole, MetricCalculationType, ReportStatus } from "@/types/global";

/* ── API response types ───────────────────────────────────────────────────── */

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

/* ── Config ───────────────────────────────────────────────────────────────── */

const ALL_ROLES = Object.values(UserRole);
const CURRENT_YEAR = new Date().getFullYear();
type TrendChartType = "bar" | "line" | "area";
const ALL_PERIOD_SELECTOR_VALUE = "all";

function makeMetricCompareKey(sectionName: string, metricName: string) {
  return JSON.stringify([sectionName, metricName]);
}

const CHART_ROLES = [
  UserRole.SUPERADMIN,
  UserRole.CEO,
  UserRole.SPO,
  UserRole.CHURCH_MINISTRY,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
];

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

/* ── KPI card config ──────────────────────────────────────────────────────── */

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

/* ── Helpers ──────────────────────────────────────────────────────────────── */

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

/* ── Main component ───────────────────────────────────────────────────────── */

export function AnalyticsPage() {
  const { user } = useAuth();
  const { role } = useRole();

  /* Shared controls */
  const [year, setYear] = useState(CURRENT_YEAR);
  const [activeTab, setActiveTab] = useState("overview");
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
  const [selectedPeriod, setSelectedPeriod] = useState<string>(ALL_PERIOD_SELECTOR_VALUE);
  const [chartType, setChartType] = useState<MetricChartType>("bar");
  const [trendsChartType, setTrendsChartType] = useState<TrendChartType>("bar");
  const [overviewChartType, setOverviewChartType] = useState<TrendChartType>("line");
  const [quarterlyChartType, setQuarterlyChartType] = useState<TrendChartType>("bar");
  const [axisLabelMode, setAxisLabelMode] = useState<AxisLabelMode>("auto");
  const [metricsData, setMetricsData] = useState<MetricAnalyticsData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState<AvailableMetric[]>([]);

  /* Quarterly tab state */
  const [selectedQuarter, setSelectedQuarter] = useState<number>(
    Math.ceil((new Date().getMonth() + 1) / 3),
  );
  const [quarterlyData, setQuarterlyData] = useState<QuarterlySummaryData | null>(null);
  const [quarterlyLoading, setQuarterlyLoading] = useState(false);

  const isSuperadmin = role === UserRole.SUPERADMIN;
  const canSeeCrossCampus = CHART_ROLES.includes(role as UserRole);

  /* Include drafts in analytics data */
  const [includeDrafts, setIncludeDrafts] = useState<boolean>(true);

  /* Report-driven analytics modifiers */
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [compareReportId, setCompareReportId] = useState<string | undefined>(undefined);
  const { data: reportListData } = useApiData<{ reports: Report[]; total: number }>(
    `${API_ROUTES.reports.list}?all=true`,
  );
  const { data: selectedReport } = useApiData<Report>(
    selectedReportId ? API_ROUTES.reports.detail(selectedReportId) : null,
  );
  const { data: compareReport } = useApiData<Report>(
    compareReportId ? API_ROUTES.reports.detail(compareReportId) : null,
  );

  const yearOptions = useMemo(() => {
    const reportYears = (reportListData?.reports ?? []).map((report) => report.periodYear);
    const years = new Set<number>([CURRENT_YEAR, CURRENT_YEAR - 1, ...reportYears]);
    return [...years]
      .sort((a, b) => b - a)
      .map((y) => ({
        value: y,
        label: String(y),
      }));
  }, [reportListData?.reports]);

  useEffect(() => {
    const reports = (reportListData?.reports ?? []).filter((report) =>
      includeDrafts ? true : report.status !== ReportStatus.DRAFT,
    );
    if (reports.length === 0) return;

    const hasDataForSelectedYear = reports.some((report) => report.periodYear === year);
    if (hasDataForSelectedYear) return;

    const latestYear = reports.reduce(
      (maxYear, report) => Math.max(maxYear, report.periodYear),
      reports[0].periodYear,
    );
    if (latestYear !== year) {
      setYear(latestYear);
    }
  }, [includeDrafts, reportListData?.reports, year]);

  useEffect(() => {
    setSelectedPeriod(ALL_PERIOD_SELECTOR_VALUE);
  }, [granularity, year]);

  /* Campus + user counts */
  const { data: allCampuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const { data: allUsers } = useApiData<UserProfile[]>(isSuperadmin ? API_ROUTES.users.list : null);

  /* Effective campus filter — non-cross-campus roles forced to own campus */
  const effectiveCampusId = canSeeCrossCampus ? campusFilter : user?.campusId;

  const exportToXlsx = (sheets: { name: string; data: any[] }[], filename: string) => {
    const workbook = utils.book_new();
    for (const sheet of sheets) {
      const ws = utils.json_to_sheet(sheet.data);
      utils.book_append_sheet(workbook, ws, sheet.name);
    }
    writeFile(workbook, filename);
  };

  const handleExport = () => {
    const campusLabel = allCampuses?.find((c) => c.id === effectiveCampusId)?.name ?? "all";
    const baseFilename = `analytics-${activeTab}-${year}-${campusLabel}`.replace(
      /[^a-zA-Z0-9-_\.]/g,
      "_",
    );

    const getStatusPieData = (overview: AnalyticsOverview) =>
      [
        { status: "Submitted", value: overview.totals.submitted },
        { status: "Approved", value: overview.totals.approved },
        { status: "Reviewed", value: overview.totals.reviewed },
        { status: "Locked", value: overview.totals.locked },
        { status: "Draft", value: overview.totals.draft },
        { status: "Requires Edits", value: overview.totals.requiresEdits },
      ].filter((row) => row.value > 0);

    if (activeTab === "overview" && overview) {
      exportToXlsx(
        [
          {
            name: "Summary",
            data: [
              { metric: "Total Reports", value: overview.totals.total },
              { metric: "Submitted", value: overview.totals.submitted },
              { metric: "Approved", value: overview.totals.approved },
              { metric: "Compliance", value: overview.compliance },
              { metric: "Reviewed", value: overview.totals.reviewed },
              { metric: "Locked", value: overview.totals.locked },
              { metric: "Draft", value: overview.totals.draft },
              { metric: "Requires Edits", value: overview.totals.requiresEdits },
            ],
          },
          { name: "Submission Trend", data: overview.submissionTrend },
          { name: "Campus Breakdown", data: overview.campusBreakdown },
          { name: "Status Trend", data: overview.statusTrend },
          { name: "Quarterly Trend", data: overview.quarterlyTrend },
          { name: "Status Pie", data: getStatusPieData(overview) },
        ],
        `${baseFilename}.xlsx`,
      );
      return;
    }

    if (activeTab === "metrics" && metricsData) {
      const campusComparison = campusComparisonData;
      const cumulativeTrend =
        metricsData.calculationType === MetricCalculationType.SUM
          ? metricsData.aggregate.map((row) => ({
              period: row.period,
              periodLabel: row.periodLabel,
              achieved: row.achieved,
              cumulativeAchieved: Number(row.achieved ?? 0) + 0, // already in curve
            }))
          : [];

      exportToXlsx(
        [
          { name: "Metric Aggregate", data: metricsData.aggregate },
          {
            name: "By Campus",
            data: metricsData.byCampus.flatMap((c) =>
              c.series.map((p) => ({ campus: c.campusName, ...p })),
            ),
          },
          { name: "Campus Comparison", data: campusComparison },
          ...(cumulativeTrend.length > 0
            ? [{ name: "Cumulative Trend", data: cumulativeTrend }]
            : []),
        ],
        `${baseFilename}.xlsx`,
      );
      return;
    }

    if (activeTab === "trends" && overview) {
      exportToXlsx(
        [
          { name: "Submission Trend", data: overview.submissionTrend },
          { name: "Status Trend", data: overview.statusTrend },
          { name: "Quarterly Trend", data: overview.quarterlyTrend },
        ],
        `${baseFilename}.xlsx`,
      );
      return;
    }

    if (activeTab === "compliance" && overview) {
      exportToXlsx(
        [
          { name: "Campus Breakdown", data: campusBreakdownNamed },
          { name: "Status Pie", data: getStatusPieData(overview) },
          { name: "Overall Compliance", data: [overview] },
        ],
        `${baseFilename}.xlsx`,
      );
      return;
    }

    if (activeTab === "quarterly" && quarterlyData) {
      const topCampuses = (quarterlyData.campusBreakdown ?? [])
        .map((row) => ({
          ...row,
          name: allCampuses?.find((c) => c.id === row.campusId)?.name ?? row.campusId,
        }))
        .sort((a, b) => b.complianceRate - a.complianceRate)
        .slice(0, 10);

      exportToXlsx(
        [
          { name: "Quarterly Summary", data: [quarterlyData] },
          { name: "Campus Breakdown", data: quarterlyData.campusBreakdown },
          { name: "Monthly Breakdown", data: quarterlyData.monthlyBreakdown },
          { name: "Top Campuses", data: topCampuses },
        ],
        `${baseFilename}.xlsx`,
      );
      return;
    }

    // Fallback: export overview if available
    if (overview) {
      exportToXlsx(
        [
          { name: "Summary", data: [overview.totals] },
          { name: "Campus Breakdown", data: overview.campusBreakdown },
          { name: "Submission Trend", data: overview.submissionTrend },
          { name: "Status Trend", data: overview.statusTrend },
        ],
        `${baseFilename}.xlsx`,
      );
    }
  };

  const summarizeReport = (report?: Report | null) => {
    if (!report || !Array.isArray(report.sections) || report.sections.length === 0) {
      return { totalGoal: 0, totalAchieved: 0, totalYoY: 0, targetPct: null, metricCount: 0 };
    }

    const sections = report.sections as ReportSection[];
    let totalGoal = 0;
    let totalAchieved = 0;
    let totalYoY = 0;
    let metricCount = 0;

    for (const section of sections) {
      for (const metric of section.metrics ?? []) {
        metricCount += 1;
        totalGoal += metric.monthlyGoal ?? 0;
        totalAchieved += metric.monthlyAchieved ?? 0;
        totalYoY += metric.yoyGoal ?? 0;
      }
    }

    return {
      totalGoal,
      totalAchieved,
      totalYoY,
      targetPct: totalGoal > 0 ? Math.round((totalAchieved / totalGoal) * 100) : null,
      metricCount,
    };
  };

  const reportComparisonInsights = useMemo(() => {
    if (!selectedReport) return [];
    const selectedSections = (selectedReport.sections ?? []) as ReportSection[];
    const compareSections = (compareReport?.sections ?? []) as ReportSection[];
    const compareByName = new Map(compareSections.map((section) => [section.sectionName, section]));

    return selectedSections
      .map((section) => {
        const selectedMetrics = section.metrics ?? [];
        const compareSection = compareByName.get(section.sectionName);
        const compareMetrics = compareSection?.metrics ?? [];
        const selectedAchieved = selectedMetrics.reduce((sum, metric) => sum + (metric.monthlyAchieved ?? 0), 0);
        const compareAchieved = compareMetrics.reduce((sum, metric) => sum + (metric.monthlyAchieved ?? 0), 0);
        const delta = selectedAchieved - compareAchieved;
        return {
          section: section.sectionName,
          selectedAchieved,
          compareAchieved,
          delta,
          comment:
            delta > 0
              ? "Improved versus compared report."
              : delta < 0
                ? "Under compared report; review this section."
                : "Stable versus compared report.",
        };
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 6);
  }, [compareReport?.sections, selectedReport]);

  const reportMetricComparisonInsights = useMemo(() => {
    if (!selectedReport || !compareReport) return [];
    const selectedSections = (selectedReport.sections ?? []) as ReportSection[];
    const compareSections = (compareReport.sections ?? []) as ReportSection[];
    const compareMetricByKey = new Map<string, ReportMetric>();

    for (const section of compareSections) {
      for (const metric of section.metrics ?? []) {
        compareMetricByKey.set(makeMetricCompareKey(section.sectionName, metric.metricName), metric);
      }
    }

    return selectedSections
      .flatMap((section) =>
        (section.metrics ?? []).map((metric) => {
          const key = makeMetricCompareKey(section.sectionName, metric.metricName);
          const compared = compareMetricByKey.get(key);
          const selectedAchieved = metric.monthlyAchieved ?? 0;
          const comparedAchieved = compared?.monthlyAchieved ?? 0;
          const achievedDelta = selectedAchieved - comparedAchieved;
          return {
            key,
            section: section.sectionName,
            metric: metric.metricName,
            selectedAchieved,
            comparedAchieved,
            achievedDelta,
          };
        }),
      )
      .sort((a, b) => Math.abs(b.achievedDelta) - Math.abs(a.achievedDelta))
      .slice(0, 8);
  }, [compareReport, selectedReport]);

  /* ── Fetch overview ─────────────────────────────────────────────────── */

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(year),
        includeDrafts: String(includeDrafts),
      });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.overview + "?" + params.toString());
      const json = await res.json();
      if (json.success) setOverview(json.data as AnalyticsOverview);
    } catch {
      /* silent — skeleton holds */
    } finally {
      setOverviewLoading(false);
    }
  }, [year, effectiveCampusId, includeDrafts]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  /* ── Fetch available metrics (for selector) ─────────────────────────── */

  const fetchAvailableMetrics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        year: String(year),
        includeDrafts: String(includeDrafts),
      });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.metrics + "?" + params.toString());
      const json = await res.json();
      if (json.success && json.data?.availableMetrics) {
        setAvailableMetrics(json.data.availableMetrics as AvailableMetric[]);
      }
    } catch {
      /* silent */
    }
  }, [year, effectiveCampusId, includeDrafts]);

  useEffect(() => {
    fetchAvailableMetrics();
  }, [fetchAvailableMetrics]);

  /* ── Fetch metric analysis ──────────────────────────────────────────── */

  const fetchMetrics = useCallback(async () => {
    if (!selectedMetricId) return;
    setMetricsLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(year),
        granularity,
        includeDrafts: String(includeDrafts),
      });
      if (selectedPeriod !== ALL_PERIOD_SELECTOR_VALUE) {
        const periodValue = Number(selectedPeriod);
        if (granularity === "monthly") {
          params.set("startMonth", String(periodValue));
          params.set("endMonth", String(periodValue));
        } else if (granularity === "quarterly") {
          const startMonth = (periodValue - 1) * 3 + 1;
          const endMonth = periodValue * 3;
          params.set("startMonth", String(startMonth));
          params.set("endMonth", String(endMonth));
        } else {
          params.set("startWeek", String(periodValue));
          params.set("endWeek", String(periodValue));
        }
      }
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
  }, [selectedMetricId, year, granularity, selectedPeriod, effectiveCampusId, includeDrafts]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  /* -- Fetch quarterly summary ---------------------------------------------- */

  const fetchQuarterly = useCallback(async () => {
    setQuarterlyLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(year),
        quarter: String(selectedQuarter),
        includeDrafts: String(includeDrafts),
      });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.quarterly + "?" + params.toString());
      const json = await res.json();
      if (json.success) setQuarterlyData(json.data as QuarterlySummaryData);
    } catch {
      /* silent */
    } finally {
      setQuarterlyLoading(false);
    }
  }, [year, selectedQuarter, effectiveCampusId, includeDrafts]);

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

  const trendsInsight = useMemo(() => {
    if (!overview) return null;
    const lastStatus = overview.statusTrend[overview.statusTrend.length - 1] as
      | (StatusTrendRow & Record<string, number | string>)
      | undefined;
    const lastQuarter = overview.quarterlyTrend[overview.quarterlyTrend.length - 1];
    if (!lastStatus && !lastQuarter) return "No trend insights available for selected filters yet.";

    const submitted = Number(lastStatus?.SUBMITTED ?? 0);
    const approved = Number(lastStatus?.APPROVED ?? 0);
    const approvalSignal =
      submitted > 0 ? Math.round((approved / submitted) * 100) : lastQuarter?.complianceRate ?? 0;

    if (approvalSignal >= 80) return "Strong momentum: approval/compliance trend is healthy.";
    if (approvalSignal >= 50) return "Moderate trend: monitor pending submissions and approvals.";
    return "Weak trend signal: prioritize review throughput and close pending reports.";
  }, [overview]);

  const complianceInsight = useMemo(() => {
    if (!overview) return null;
    if (campusBreakdownNamed.length === 0) return "No campus compliance data available.";
    const best = [...campusBreakdownNamed].sort((a, b) => b.complianceRate - a.complianceRate)[0];
    const worst = [...campusBreakdownNamed].sort((a, b) => a.complianceRate - b.complianceRate)[0];
    if (!best || !worst) return null;
    return `Top performer: ${best.name} (${best.complianceRate}%). Lowest: ${worst.name} (${worst.complianceRate}%).`;
  }, [campusBreakdownNamed, overview]);

  const quarterlyInsight = useMemo(() => {
    if (!quarterlyData) return null;
    if (quarterlyData.qoqDelta.compliance > 0) {
      return `Compliance improved by ${quarterlyData.qoqDelta.compliance}% versus ${quarterlyData.previous.label}.`;
    }
    if (quarterlyData.qoqDelta.compliance < 0) {
      return `Compliance dropped by ${Math.abs(quarterlyData.qoqDelta.compliance)}% versus ${quarterlyData.previous.label}.`;
    }
    return `Compliance is unchanged versus ${quarterlyData.previous.label}.`;
  }, [quarterlyData]);

  const campusOptions = canSeeCrossCampus
    ? [
        { value: "", label: "All Campuses" },
        ...(allCampuses ?? []).map((c) => ({ value: c.id, label: c.name })),
      ]
    : [];

  const metricPeriodSelectorOptions = useMemo(() => {
    if (granularity === "monthly") {
      return [
        { value: ALL_PERIOD_SELECTOR_VALUE, label: "All Months" },
        ...Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          return {
            value: String(month),
            label: new Date(year, i, 1).toLocaleString("en-GB", { month: "short" }),
          };
        }),
      ];
    }
    if (granularity === "quarterly") {
      return [
        { value: ALL_PERIOD_SELECTOR_VALUE, label: "All Quarters" },
        ...[1, 2, 3, 4].map((q) => ({ value: String(q), label: `Q${q}` })),
      ];
    }
    return [
      { value: ALL_PERIOD_SELECTOR_VALUE, label: "All Weeks" },
      ...Array.from({ length: getIsoWeeksInYear(year) }, (_, i) => {
        const week = i + 1;
        return { value: String(week), label: `W${week.toString().padStart(2, "0")}` };
      }),
    ];
  }, [granularity, year]);

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

  /* ── Shared tab header controls ─────────────────────────────────────── */

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
        options={yearOptions}
        onChange={setYear}
        size="middle"
        style={{ width: 100 }}
      />
      <Checkbox checked={includeDrafts} onChange={(e) => setIncludeDrafts(e.target.checked)}>
        Include draft reports
      </Checkbox>
      <Button icon={<DownloadOutlined />} onClick={handleExport} type="default" size="middle">
        Export
      </Button>
    </div>
  );

  /* ── Overview tab ───────────────────────────────────────────────────── */

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

        {/* Report selection and compare panel */}
        <ChartCard title="Report Drilldown & Comparison">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            <Select
              placeholder="Select report for analytics"
              options={
                reportListData?.reports.map((r) => ({
                  label: `${r.title ?? "(untitled)"} (${r.period})`,
                  value: r.id,
                })) ?? []
              }
              value={selectedReportId}
              onChange={(value) => setSelectedReportId(value)}
              allowClear
            />
            <Select
              placeholder="Select second report for comparison"
              options={
                reportListData?.reports
                  .filter((r) => r.id !== selectedReportId)
                  .map((r) => ({
                    label: `${r.title ?? "(untitled)"} (${r.period})`,
                    value: r.id,
                  })) ?? []
              }
              value={compareReportId}
              onChange={(value) => setCompareReportId(value)}
              allowClear
            />
            <div className="flex items-center gap-2">
              <Button onClick={() => setSelectedReportId(undefined)}>Clear</Button>
              <Button onClick={() => setCompareReportId(undefined)}>{"Clear Compare"}</Button>
            </div>
          </div>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { report: selectedReport, label: "Selected report" },
                  { report: compareReport, label: "Compared report" },
                ]
                  .filter((x) => x.report)
                  .map((entry) => {
                    const summary = summarizeReport(entry.report as Report);
                    return (
                      <div key={entry.label} className="bg-ds-surface-base p-3 rounded-ds-md">
                        <p className="text-xs text-ds-text-subtle mb-1">{entry.label}</p>
                        <p className="text-sm font-semibold">Total Goal: {summary.totalGoal}</p>
                        <p className="text-sm font-semibold">
                          Total Achieved: {summary.totalAchieved}
                        </p>
                        <p className="text-sm font-semibold">
                          Target %: {summary.targetPct ?? "n/a"}
                        </p>
                      </div>
                    );
                  })}
              </div>
              {compareReport && reportComparisonInsights.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-ds-text-secondary">
                    Section comparison insights
                  </p>
                  {reportComparisonInsights.map((row) => (
                    <div
                      key={row.section}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-ds-md border border-ds-border-base bg-ds-surface-base px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-ds-text-primary">{row.section}</p>
                        <p className="text-xs text-ds-text-subtle">{row.comment}</p>
                      </div>
                      <p className="text-xs font-semibold text-ds-text-secondary">
                        Δ Achieved: {row.delta >= 0 ? "+" : ""}
                        {row.delta}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {reportMetricComparisonInsights.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-ds-text-secondary">
                    Metric comparison insights
                  </p>
                  {reportMetricComparisonInsights.map((row) => (
                    <div
                      key={row.key}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-ds-md border border-ds-border-base bg-ds-surface-base px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-ds-text-primary">
                          {row.section} · {row.metric}
                        </p>
                        <p className="text-xs text-ds-text-subtle">
                          Selected: {row.selectedAchieved} | Compared: {row.comparedAchieved}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-ds-text-secondary">
                        Δ Achieved: {row.achievedDelta >= 0 ? "+" : ""}
                        {row.achievedDelta}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ChartCard>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-ds-text-secondary">Chart type:</span>
          <Segmented
            value={overviewChartType}
            onChange={(v) => setOverviewChartType(v as TrendChartType)}
            options={[
              { label: "Bar", value: "bar" },
              { label: "Line", value: "line" },
              { label: "Area", value: "area" },
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-ds-text-secondary">X-axis labels:</span>
            <Select
              size="small"
              value={axisLabelMode}
              options={[
                { label: "Auto", value: "auto" },
                { label: "Short", value: "short" },
                { label: "Full", value: "full" },
              ]}
              onChange={(value) => setAxisLabelMode(value as AxisLabelMode)}
              style={{ width: 100 }}
            />
          </div>
        </div>

        {/* Submission trend */}
        {overview.submissionTrend.length > 0 && (
          <ChartCard title={CONTENT.analytics.trendsTitle as string}>
            <ChartScrollContainer minWidthClass="min-w-[720px]">
              <ResponsiveContainer width="100%" height={240}>
                {overviewChartType === "bar" ? (
                  <BarChart data={overview.submissionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 14)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name={CONTENT.analytics.chartLabels.submitted as string}
                      fill="var(--ds-chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : overviewChartType === "area" ? (
                  <AreaChart data={overview.submissionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 14)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name={CONTENT.analytics.chartLabels.submitted as string}
                      fill="var(--ds-brand-accent)"
                      stroke="var(--ds-brand-accent)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={overview.submissionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 14)}
                    />
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
                )}
              </ResponsiveContainer>
            </ChartScrollContainer>
          </ChartCard>
        )}

        {/* Campus breakdown — cross-campus roles */}
        {canSeeCrossCampus && campusBreakdownNamed.length > 0 && (
          <ChartCard title={CONTENT.analytics.campusBreakdownTitle as string}>
            <ChartScrollContainer minWidthClass="min-w-[820px]">
              <ResponsiveContainer width="100%" height={280}>
                {overviewChartType === "line" ? (
                  <LineChart data={campusBreakdownNamed}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--ds-text-subtle)" }}
                      interval={0}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 20)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    <Line
                      dataKey="submitted"
                      name={CONTENT.analytics.chartLabels.submitted as string}
                      stroke="var(--ds-chart-1)"
                      dot={false}
                    />
                    <Line
                      dataKey="approved"
                      name={CONTENT.analytics.chartLabels.approved as string}
                      stroke="var(--ds-chart-2)"
                      dot={false}
                    />
                  </LineChart>
                ) : overviewChartType === "area" ? (
                  <AreaChart data={campusBreakdownNamed}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--ds-text-subtle)" }}
                      interval={0}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 20)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    <Area
                      dataKey="submitted"
                      name={CONTENT.analytics.chartLabels.submitted as string}
                      stackId="a"
                      fill="var(--ds-chart-1)"
                      stroke="var(--ds-chart-1)"
                    />
                    <Area
                      dataKey="approved"
                      name={CONTENT.analytics.chartLabels.approved as string}
                      stackId="a"
                      fill="var(--ds-chart-2)"
                      stroke="var(--ds-chart-2)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={campusBreakdownNamed} margin={{ bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--ds-text-subtle)" }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 20)}
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
                )}
              </ResponsiveContainer>
            </ChartScrollContainer>
          </ChartCard>
        )}
      </div>
    );

  /* ── Metrics Analysis tab ───────────────────────────────────────────── */

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
          value={selectedPeriod}
          options={metricPeriodSelectorOptions}
          onChange={(value) => setSelectedPeriod(value)}
          style={{ width: 150 }}
          placeholder={CONTENT.analytics.periodSelectorLabel as string}
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
        <Segmented
          value={chartType}
          onChange={(v) => setChartType(v as MetricChartType)}
          options={METRIC_CHART_TYPE_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-ds-text-secondary">X-axis labels:</span>
          <Select
            size="small"
            value={axisLabelMode}
            options={[
              { label: "Auto", value: "auto" },
              { label: "Short", value: "short" },
              { label: "Full", value: "full" },
            ]}
            onChange={(value) => setAxisLabelMode(value as AxisLabelMode)}
            style={{ width: 100 }}
          />
        </div>
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
          {metricsData.aggregate.length > 50 && (
            <Card type="inner" className="border-yellow-300 bg-yellow-50">
              <p className="text-xs text-yellow-800">
                The chart includes over 50 periods/metrics. Consider narrowing the dataset to
                improve rendering performance.
              </p>
            </Card>
          )}
          <ChartCard title={CONTENT.analytics.goalVsAchievedTitle as string}>
            {renderMetricChart({
              chartType,
              data: metricsData.aggregate,
              tooltipStyle: TOOLTIP_STYLE,
              metricCalculationType: metricsData.calculationType,
              xAxisTickFormatter: (value) => formatAxisLabel(String(value), axisLabelMode, 22),
            })}
          </ChartCard>

          {/* Campus comparison — cross-campus roles only */}
            {canSeeCrossCampus &&
              campusComparisonData.length > 0 &&
              metricsData.byCampus.length > 1 && (
                <ChartCard title={CONTENT.analytics.campusMetricCompTitle as string}>
                  <ChartScrollContainer minWidthClass="min-w-[860px]">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={campusComparisonData} margin={{ bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                          angle={-40}
                          textAnchor="end"
                          height={70}
                          tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 20)}
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
                  </ChartScrollContainer>
                </ChartCard>
              )}

          {/* Cumulative / Area chart */}
          {metricsData.calculationType === MetricCalculationType.SUM && (
            <ChartCard title={CONTENT.analytics.cumulativeTrendTitle as string}>
              <ChartScrollContainer minWidthClass="min-w-[760px]">
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={metricsData.aggregate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="periodLabel"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 20)}
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
              </ChartScrollContainer>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );

  /* ── Trends tab ─────────────────────────────────────────────────────── */

  const trendsTab =
    overviewLoading || !overview ? (
      <LoadingSkeleton rows={8} />
    ) : (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xs text-ds-text-secondary">Chart type:</span>
          <Segmented
            value={trendsChartType}
            onChange={(v) => setTrendsChartType(v as TrendChartType)}
            options={[
              { label: "Bar", value: "bar" },
              { label: "Line", value: "line" },
              { label: "Area", value: "area" },
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-ds-text-secondary">X-axis labels:</span>
            <Select
              size="small"
              value={axisLabelMode}
              options={[
                { label: "Auto", value: "auto" },
                { label: "Short", value: "short" },
                { label: "Full", value: "full" },
              ]}
              onChange={(value) => setAxisLabelMode(value as AxisLabelMode)}
              style={{ width: 100 }}
            />
          </div>
        </div>
        {/* Status stacked bar over time */}
        {overview.statusTrend.length > 0 ? (
          <ChartCard title={CONTENT.analytics.statusBreakdownTitle as string}>
            <ChartScrollContainer minWidthClass="min-w-[820px]">
              <ResponsiveContainer width="100%" height={280}>
              {trendsChartType === "bar" ? (
                <BarChart data={overview.statusTrend as Record<string, unknown>[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 14)}
                  />
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
              ) : trendsChartType === "line" ? (
                <LineChart data={overview.statusTrend as Record<string, unknown>[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 14)}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Line dataKey="SUBMITTED" name="Submitted" stroke="var(--ds-chart-1)" dot={false} />
                  <Line dataKey="APPROVED" name="Approved" stroke="var(--ds-chart-2)" dot={false} />
                  <Line dataKey="REVIEWED" name="Reviewed" stroke="var(--ds-chart-3)" dot={false} />
                  <Line dataKey="LOCKED" name="Locked" stroke="var(--ds-chart-4)" dot={false} />
                  <Line
                    dataKey="REQUIRES_EDITS"
                    name="Requires Edits"
                    stroke="var(--ds-chart-5)"
                    dot={false}
                  />
                  <Line dataKey="DRAFT" name="Draft" stroke="var(--ds-chart-6)" dot={false} />
                </LineChart>
              ) : (
                <AreaChart data={overview.statusTrend as Record<string, unknown>[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 14)}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Area
                    dataKey="SUBMITTED"
                    name="Submitted"
                    stackId="a"
                    stroke="var(--ds-chart-1)"
                    fill="var(--ds-chart-1)"
                  />
                  <Area
                    dataKey="APPROVED"
                    name="Approved"
                    stackId="a"
                    stroke="var(--ds-chart-2)"
                    fill="var(--ds-chart-2)"
                  />
                  <Area
                    dataKey="REVIEWED"
                    name="Reviewed"
                    stackId="a"
                    stroke="var(--ds-chart-3)"
                    fill="var(--ds-chart-3)"
                  />
                  <Area
                    dataKey="LOCKED"
                    name="Locked"
                    stackId="a"
                    stroke="var(--ds-chart-4)"
                    fill="var(--ds-chart-4)"
                  />
                  <Area
                    dataKey="REQUIRES_EDITS"
                    name="Requires Edits"
                    stackId="a"
                    stroke="var(--ds-chart-5)"
                    fill="var(--ds-chart-5)"
                  />
                  <Area
                    dataKey="DRAFT"
                    name="Draft"
                    stackId="a"
                    stroke="var(--ds-chart-6)"
                    fill="var(--ds-chart-6)"
                  />
                </AreaChart>
              )}
              </ResponsiveContainer>
            </ChartScrollContainer>
          </ChartCard>
        ) : (
          <Card>
            <div className="text-sm text-ds-text-subtle">
              No status trend data available for the selected filters.
            </div>
          </Card>
        )}

        {/* Quarterly compliance trend */}
        {overview.quarterlyTrend.length > 0 ? (
          <ChartCard title="Quarterly Compliance Rate">
            <ChartScrollContainer minWidthClass="min-w-[720px]">
              <ResponsiveContainer width="100%" height={220}>
              {trendsChartType === "bar" ? (
                <BarChart data={overview.quarterlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 12)}
                  />
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
              ) : trendsChartType === "line" ? (
                <LineChart data={overview.quarterlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 12)}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: unknown) => [v + "%", "Compliance"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="complianceRate"
                    name="Compliance %"
                    stroke="var(--ds-brand-accent)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              ) : (
                <AreaChart data={overview.quarterlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 12)}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: unknown) => [v + "%", "Compliance"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="complianceRate"
                    name="Compliance %"
                    stroke="var(--ds-brand-accent)"
                    fill="var(--ds-brand-accent)"
                  />
                </AreaChart>
              )}
              </ResponsiveContainer>
            </ChartScrollContainer>
          </ChartCard>
        ) : (
          <Card>
            <div className="text-sm text-ds-text-subtle">
              No quarterly trend data available for the selected filters.
            </div>
          </Card>
        )}
        {trendsInsight && (
          <Card>
            <p className="text-sm text-ds-text-secondary">{trendsInsight}</p>
          </Card>
        )}
      </div>
    );

  /* ── Compliance tab ─────────────────────────────────────────────────── */

  const complianceTab =
    overviewLoading || !overview ? (
      <LoadingSkeleton rows={6} />
    ) : (
      <div className="space-y-6">
        {complianceInsight && (
          <Card>
            <p className="text-sm text-ds-text-secondary">{complianceInsight}</p>
          </Card>
        )}
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
              <ChartScrollContainer minWidthClass="min-w-[680px]">
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
              </ChartScrollContainer>
            </ChartCard>
          ) : null;
        })()}
      </div>
    );

  /* ── Tab items (config-driven) ──────────────────────────────────────── */

  /* -- Quarterly tab -------------------------------------------------------- */

  const quarterlyBrNamed = (quarterlyData?.campusBreakdown ?? []).map((row) => ({
    ...row,
    name: allCampuses?.find((c) => c.id === row.campusId)?.name ?? row.campusId,
  }));

  const QUARTER_OPTIONS = [1, 2, 3, 4].map((q) => ({ value: q, label: `Q${q}` }));

  function DeltaBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
    const color =
      value > 0
        ? "text-ds-state-success"
        : value < 0
          ? "text-ds-state-error"
          : "text-ds-text-subtle";
    const prefix = value > 0 ? "+" : "";
    return (
      <span className={`text-xs font-semibold ${color}`}>
        {prefix}
        {value}
        {suffix}
      </span>
    );
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
          <Segmented
            value={quarterlyChartType}
            onChange={(v) => setQuarterlyChartType(v as TrendChartType)}
            options={[
              { label: "Bar", value: "bar" },
              { label: "Line", value: "line" },
              { label: "Area", value: "area" },
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-ds-text-secondary">X-axis labels:</span>
            <Select
              size="small"
              value={axisLabelMode}
              options={[
                { label: "Auto", value: "auto" },
                { label: "Short", value: "short" },
                { label: "Full", value: "full" },
              ]}
              onChange={(value) => setAxisLabelMode(value as AxisLabelMode)}
              style={{ width: 100 }}
            />
          </div>
        </div>

        {/* Quarterly KPIs with QoQ delta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: CONTENT.analytics.quarterlySubmittedLabel as string,
              cur: quarterlyData.current.submitted,
              delta: quarterlyData.qoqDelta.submitted,
            },
            {
              label: CONTENT.analytics.quarterlyApprovedLabel as string,
              cur: quarterlyData.current.approved,
              delta: quarterlyData.qoqDelta.approved,
            },
            {
              label: CONTENT.analytics.quarterlyComplianceLabel as string,
              cur: quarterlyData.current.compliance,
              delta: quarterlyData.qoqDelta.compliance,
              suffix: "%",
            },
            {
              label: CONTENT.dashboard.kpi.totalReports as string,
              cur: quarterlyData.current.total,
              delta: quarterlyData.qoqDelta.total,
            },
          ].map((item) => (
            <Card key={item.label} className="!p-5">
              <p className="text-xs font-medium text-ds-text-subtle mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-ds-text-primary tracking-tight">
                {item.cur}
                {item.suffix ?? ""}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <DeltaBadge value={item.delta} suffix={item.suffix === "%" ? "pp" : ""} />
                <span className="text-xs text-ds-text-subtle">
                  {CONTENT.analytics.quarterlyQoqLabel as string}
                </span>
              </div>
            </Card>
          ))}
        </div>
        {quarterlyInsight && (
          <Card>
            <p className="text-sm text-ds-text-secondary">{quarterlyInsight}</p>
          </Card>
        )}

        {/* Monthly breakdown within quarter */}
        {quarterlyData.monthlyBreakdown.length > 0 && (
          <ChartCard title={CONTENT.analytics.quarterlyTitle as string}>
            <ChartScrollContainer minWidthClass="min-w-[720px]">
              <ResponsiveContainer width="100%" height={240}>
                {quarterlyChartType === "line" ? (
                  <LineChart data={quarterlyData.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 12)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    <Line
                      dataKey="submitted"
                      name={CONTENT.analytics.chartLabels.submitted as string}
                      stroke="var(--ds-chart-1)"
                      dot={false}
                    />
                    <Line
                      dataKey="approved"
                      name={CONTENT.analytics.chartLabels.approved as string}
                      stroke="var(--ds-chart-2)"
                      dot={false}
                    />
                  </LineChart>
                ) : quarterlyChartType === "area" ? (
                  <AreaChart data={quarterlyData.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 12)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    <Area
                      dataKey="submitted"
                      name={CONTENT.analytics.chartLabels.submitted as string}
                      stackId="a"
                      fill="var(--ds-chart-1)"
                      stroke="var(--ds-chart-1)"
                    />
                    <Area
                      dataKey="approved"
                      name={CONTENT.analytics.chartLabels.approved as string}
                      stackId="a"
                      fill="var(--ds-chart-2)"
                      stroke="var(--ds-chart-2)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={quarterlyData.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                      tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 12)}
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
                )}
              </ResponsiveContainer>
            </ChartScrollContainer>
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

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <PageLayout>
      <PageHeader title={CONTENT.analytics.pageTitle as string} actions={sharedControls} />
      <Tabs
        items={TAB_ITEMS}
        destroyInactiveTabPane={false}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
      />
    </PageLayout>
  );
}
