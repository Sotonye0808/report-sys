"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiData } from "@/lib/hooks/useApiData";
import { useRole } from "@/lib/hooks/useRole";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { ReportStatus, UserRole } from "@/types/global";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card, Tag, Divider, Select, Checkbox } from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  CommentOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { formatAxisLabel, AxisLabelMode } from "@/modules/analytics/chartUtils";

interface ReportAnalyticsPageProps {
  reportId: string;
}

function getMetricInsight(metric: any) {
  const goal = metric.monthlyGoal ?? 0;
  const achieved = metric.monthlyAchieved ?? 0;
  const yoy = metric.yoyGoal;
  const pct = goal > 0 ? (achieved / goal) * 100 : null;
  const yoyDelta = yoy ? ((achieved - yoy) / yoy) * 100 : null;

  if (goal === 0) return "No benchmark goal set. Focus on capturing goal values for this metric.";
  if (pct === null) return "Insufficient data to evaluate growth.";
  if (pct < 70) return "At risk: metric is below 70% of target. Consider corrective actions.";
  if (pct < 100) return "On track: metric is below target but within acceptable range.";
  return "Target met or exceeded: great progress. Share success and best practices.";
}

function getOverallInsight(overallPct: number | null, yoyDelta: number | null) {
  if (overallPct === null) return "Report has no goal-driven metrics set yet.";
  if (overallPct < 70)
    return "Overall performance is weak; immediate attention required to hit monthly targets.";
  if (overallPct < 100)
    return "Overall performance is positive and nearing target; keep the momentum.";
  if (yoyDelta !== null && yoyDelta > 0)
    return "Strong YoY growth with target achievement; consolidate what’s working.";
  return "Great results; maintain performance and look for scalable improvements.";
}

const CHART_TYPE_OPTIONS = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
];

type ChartType = "bar" | "line" | "area";

export function ReportAnalyticsPage({ reportId }: ReportAnalyticsPageProps) {
  const router = useRouter();
  const { role } = useRole();

  const { data: report } = useApiData<Report>(API_ROUTES.reports.detail(reportId));
  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

  const [chartType, setChartType] = useState<ChartType>("bar");
  const [showGoal, setShowGoal] = useState(true);
  const [showAchieved, setShowAchieved] = useState(true);
  const [showYoY, setShowYoY] = useState(true);
  const [topMetrics, setTopMetrics] = useState<number>(10);
  const [axisLabelMode, setAxisLabelMode] = useState<AxisLabelMode>("auto");

  const template = useMemo(
    () => (templates ?? []).find((t) => t.id === report?.templateId) ?? null,
    [templates, report?.templateId],
  );

  const sectionsWithMetrics = useMemo(() => {
    const secs: (ReportSection & { metrics: ReportMetric[] })[] =
      (report as Report & { sections?: (ReportSection & { metrics: ReportMetric[] })[] })
        ?.sections ?? [];
    return secs;
  }, [report]);

  const summary = useMemo(() => {
    let totalGoal = 0;
    let totalAchieved = 0;
    let totalYoy = 0;
    let metricsWithGoal = 0;

    const data: Array<Record<string, any>> = [];

    sectionsWithMetrics.forEach((section) => {
      section.metrics.forEach((metric) => {
        const achieved = metric.monthlyAchieved ?? 0;
        const goal = metric.monthlyGoal ?? 0;
        const yoy = metric.yoyGoal ?? 0;
        const percent = goal > 0 ? (achieved / goal) * 100 : 0;
        const yoyDiff = yoy > 0 ? ((achieved - yoy) / yoy) * 100 : undefined;

        data.push({
          name: metric.metricName,
          label: `${section.sectionName}: ${metric.metricName}`,
          achieved,
          goal,
          yoy,
          pct: Number.isFinite(percent) ? Math.round(percent) : null,
          yoyDiff: yoyDiff !== undefined && Number.isFinite(yoyDiff) ? Math.round(yoyDiff) : null,
          section: section.sectionName,
          insights: getMetricInsight(metric),
        });

        if (goal > 0) {
          totalGoal += goal;
          totalAchieved += achieved;
          metricsWithGoal += 1;
        }
        totalYoy += yoy;
      });
    });

    const overallPct = totalGoal > 0 ? Math.round((totalAchieved / totalGoal) * 100) : null;
    const yoyDelta =
      totalYoy > 0 ? Math.round(((totalAchieved - totalYoy) / totalYoy) * 100) : null;

    const comment = getOverallInsight(overallPct, yoyDelta);

    return { data, overallPct, yoyDelta, totalGoal, totalAchieved, metricsWithGoal, comment };
  }, [sectionsWithMetrics]);

  const chartData = useMemo(() => {
    return [...summary.data].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0)).slice(0, topMetrics);
  }, [summary.data, topMetrics]);

  if (report === undefined || templates === undefined) {
    return <LoadingSkeleton rows={6} />;
  }

  if (!report) {
    return (
      <PageLayout>
        <EmptyState title={CONTENT.common.errorNotFound} description="Report not found." />
      </PageLayout>
    );
  }

  const isEmpty = summary.data.length === 0;

  return (
    <PageLayout>
      <PageHeader
        title={`${report.title || "Report"} - Analytics`}
        subtitle={report.title ? undefined : "Report analytics and insights"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(APP_ROUTES.reportDetail(reportId))}
            >
              Back
            </Button>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => router.replace(APP_ROUTES.reportAnalytics(reportId))}
            >
              {CONTENT.common.refresh as string}
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        <Card title="Overall Summary" bordered>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-ds-text-subtle">Total Goal</div>
              <div className="text-lg font-semibold">{summary.totalGoal}</div>
            </div>
            <div>
              <div className="text-xs text-ds-text-subtle">Total Achieved</div>
              <div className="text-lg font-semibold">{summary.totalAchieved}</div>
            </div>
            <div>
              <div className="text-xs text-ds-text-subtle">Overall %</div>
              <div className="text-lg font-semibold">
                {summary.overallPct !== null ? `${summary.overallPct}%` : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-ds-text-subtle">YoY Delta</div>
              <div className="text-lg font-semibold">
                {summary.yoyDelta !== null
                  ? `${summary.yoyDelta >= 0 ? "+" : ""}${summary.yoyDelta}%`
                  : "—"}
              </div>
            </div>
          </div>
          <Divider />
          <div className="text-sm text-ds-text-secondary">{summary.comment}</div>
        </Card>

        <Card title="Performance by metric controls" bordered>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-ds-text-secondary">Chart type:</span>
              <Select
                size="small"
                value={chartType}
                options={CHART_TYPE_OPTIONS}
                onChange={(value) => setChartType(value as ChartType)}
                style={{ width: 120 }}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Checkbox checked={showGoal} onChange={(e) => setShowGoal(e.target.checked)}>
                Goal
              </Checkbox>
              <Checkbox checked={showAchieved} onChange={(e) => setShowAchieved(e.target.checked)}>
                Achieved
              </Checkbox>
              <Checkbox checked={showYoY} onChange={(e) => setShowYoY(e.target.checked)}>
                YoY
              </Checkbox>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-ds-text-secondary">X-axis label:</span>
              <Select
                size="small"
                value={axisLabelMode}
                options={[
                  { value: "auto", label: "Auto" },
                  { value: "short", label: "Short" },
                  { value: "full", label: "Full" },
                ]}
                onChange={(value) => setAxisLabelMode(value as AxisLabelMode)}
                style={{ width: 100 }}
              />
              <span className="text-xs text-ds-text-secondary">Top metrics:</span>
              <Select
                size="small"
                value={topMetrics}
                options={[5, 10, 20, 50, 100].map((n) => ({ value: n, label: String(n) }))}
                onChange={(value) => setTopMetrics(Number(value))}
                style={{ width: 80 }}
              />
            </div>
          </div>
        </Card>

        {isEmpty ? (
          <Card>
            <p className="text-sm text-ds-text-subtle">No metrics available for analytics yet.</p>
          </Card>
        ) : (
          <>
            {chartData.length > 50 && (
              <Card type="inner" className="border-yellow-300 bg-yellow-50">
                <p className="text-xs text-yellow-800">
                  Showing top {topMetrics} metrics. More than 50 metrics can cause rendering
                  slowdowns. Use the top metrics filter and toggle label mode for better
                  performance.
                </p>
              </Card>
            )}
            <Card title="Performance by metric">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                        angle={-40}
                        textAnchor="end"
                        height={80}
                        tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 18)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {showGoal && <Bar dataKey="goal" fill="#8884d8" name="Goal" />}
                      {showAchieved && <Bar dataKey="achieved" fill="#82ca9d" name="Achieved" />}
                      {showYoY && <Bar dataKey="yoy" fill="#ffc658" name="YoY" />}
                    </BarChart>
                  ) : chartType === "line" ? (
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                        angle={-40}
                        textAnchor="end"
                        height={80}
                        tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 18)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {showGoal && (
                        <Line type="monotone" dataKey="goal" stroke="#8884d8" dot={false} />
                      )}
                      {showAchieved && (
                        <Line type="monotone" dataKey="achieved" stroke="#82ca9d" dot={false} />
                      )}
                      {showYoY && (
                        <Line type="monotone" dataKey="yoy" stroke="#ffc658" dot={false} />
                      )}
                    </LineChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                        angle={-40}
                        textAnchor="end"
                        height={80}
                        tickFormatter={(value) => formatAxisLabel(String(value), axisLabelMode, 18)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {showGoal && (
                        <Area type="monotone" dataKey="goal" stroke="#8884d8" fill="#8884d8" />
                      )}
                      {showAchieved && (
                        <Area type="monotone" dataKey="achieved" stroke="#82ca9d" fill="#82ca9d" />
                      )}
                      {showYoY && (
                        <Area type="monotone" dataKey="yoy" stroke="#ffc658" fill="#ffc658" />
                      )}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Top analytics insights">
              <div className="space-y-2">
                {summary.data.slice(0, 5).map((m) => (
                  <div key={m.name} className="border border-ds-border-subtle rounded-ds-md p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{m.name}</span>
                      <Tag color={m.pct >= 100 ? "success" : m.pct >= 70 ? "warning" : "error"}>
                        {m.pct !== null ? `${m.pct}%` : "n/a"}
                      </Tag>
                    </div>
                    <div className="text-xs text-ds-text-subtle mt-1">{m.insights}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Intelligent comment on implications">
              <div className="flex items-center gap-2 mb-2">
                <CommentOutlined />
                <span className="text-sm text-ds-text-subtle">Quick AI-style summary</span>
              </div>
              <p className="text-sm">{getOverallInsight(summary.overallPct, summary.yoyDelta)}</p>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
}
