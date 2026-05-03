/**
 * Shared chart utilities for analytics modules.
 *
 * Same UI policy:
 * - All charts must be consistent across the report-specific page and the global analytics page.
 * - Axis labels must be readable (auto/short/full modes) and include a title fallback for long truncated values.
 * - Maximum series/metric counts should show a user warning when >50 points to avoid performance issues.
 * - Tooltip and legend labels must be explicitly set from content tokens.
 */

import { ReactNode } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { CONTENT } from "@/config/content";

export type MetricChartType = "bar" | "line" | "area" | "pie";
export type AxisLabelMode = "auto" | "short" | "full";

export const METRIC_CHART_TYPE_OPTIONS = [
  { label: "Bar", value: "bar" },
  { label: "Line", value: "line" },
  { label: "Area", value: "area" },
  { label: "Pie", value: "pie" },
] as const;

export function ChartScrollContainer({
  children,
  minWidthClass = "min-w-[720px]",
}: {
  children: ReactNode;
  minWidthClass?: string;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div className={minWidthClass}>{children}</div>
    </div>
  );
}

export function formatAxisLabel(value: any, mode: AxisLabelMode = "auto", maxLen = 20) {
  if (typeof value !== "string") return String(value);
  if (mode === "full") return value;
  if (mode === "short") {
    return value.length > maxLen ? `${value.slice(0, maxLen - 3)}...` : value;
  }
  // auto: attempt to shrink by splitting on word boundary
  if (value.length <= maxLen) return value;
  const words = value.split(" ");
  if (words.length === 1) return `${value.slice(0, maxLen - 3)}...`;
  const short = words.map((w) => w.charAt(0).toUpperCase()).join(".");
  return short.length <= maxLen ? short : `${value.slice(0, maxLen - 3)}...`;
}

function renderXAxisTick(
  props: any,
  formatter?: (value: string) => string,
  maxLen = 22,
): React.ReactNode {
  const { x, y, payload } = props;
  const full = payload?.value ?? "";
  const formatted = formatter ? formatter(String(full)) : formatAxisLabel(full, "auto", maxLen);

  return (
    <text x={x} y={y + 15} textAnchor="end" fill="var(--ds-text-subtle)" style={{ fontSize: 11 }}>
      <title>{String(full)}</title>
      {formatted}
    </text>
  );
}

/**
 * Reusable rotated x-axis tick for charts whose labels are long enough to
 * overlap when rendered horizontally (campus names, metric names).
 *
 *  - Rotates -30° anchored at the right edge so labels read into the chart.
 *  - Truncates beyond `maxChars` (default 14) with ellipsis.
 *  - Embeds full label in `<title>` so native + Recharts tooltips show the
 *    untruncated text on hover.
 *  - Short labels render straight (no rotation) — graceful fallback.
 */
export function RotatedTick(props: {
  x?: number;
  y?: number;
  payload?: { value?: string | number };
  maxChars?: number;
}): React.ReactElement {
  const { x = 0, y = 0, payload, maxChars = 14 } = props;
  const full = String(payload?.value ?? "");
  const truncated = full.length > maxChars ? `${full.slice(0, maxChars - 1)}…` : full;
  const rotate = full.length > maxChars;
  return (
    <g transform={`translate(${x},${y + 8})`}>
      <text
        textAnchor={rotate ? "end" : "middle"}
        transform={rotate ? "rotate(-30)" : undefined}
        fill="var(--ds-text-subtle)"
        style={{ fontSize: 11 }}
      >
        <title>{full}</title>
        {truncated}
      </text>
    </g>
  );
}

/** Convenience formatter mirror of {@link RotatedTick} for non-tick contexts. */
export function formatXAxisTick(label: string, maxChars = 14): string {
  return label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label;
}

const PIE_COLORS = [
  "var(--ds-chart-1)",
  "var(--ds-chart-2)",
  "var(--ds-chart-3)",
  "var(--ds-chart-4)",
  "var(--ds-chart-5)",
  "var(--ds-chart-6)",
];

export interface RenderMetricChartProps {
  chartType: MetricChartType;
  data: any[];
  tooltipStyle: React.CSSProperties;
  granularityLabel?: string;
  metricCalculationType?: string;
  xAxisTickFormatter?: (value: string) => string;
}

export function renderMetricChart({
  chartType,
  data,
  tooltipStyle,
  granularityLabel,
  metricCalculationType,
  xAxisTickFormatter,
}: RenderMetricChartProps): ReactNode {
  if (!data || data.length === 0) {
    return null;
  }

  if (chartType === "pie") {
    const pieSliceValueKey = "achieved";
    const pieData = data
      .filter((item) => item[pieSliceValueKey] != null)
      .map((item) => ({
        name: item.periodLabel ?? item.period,
        value: Number(item[pieSliceValueKey]),
      }));

    if (!pieData.length) return null;

    return (
      <ChartScrollContainer minWidthClass="min-w-[680px]">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {pieData.map((_entry, index) => (
                <Cell key={String(index)} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartScrollContainer>
    );
  }

  if (chartType === "line") {
    return (
      <ChartScrollContainer>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
            <XAxis
              dataKey="periodLabel"
              tick={(props) => renderXAxisTick(props, xAxisTickFormatter, 22)}
              angle={-40}
              textAnchor="end"
              height={80}
              tickFormatter={xAxisTickFormatter}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line
              type="monotone"
              dataKey="achieved"
              name={CONTENT.analytics.chartLabels?.achieved as string}
              stroke="var(--ds-chart-1)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            {metricCalculationType !== "snapshot" && (
              <Line
                type="monotone"
                dataKey="goal"
                name={CONTENT.analytics.chartLabels?.goal as string}
                stroke="var(--ds-chart-3)"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartScrollContainer>
    );
  }

  if (chartType === "area") {
    return (
      <ChartScrollContainer>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
            <XAxis
              dataKey="periodLabel"
              tick={(props) => renderXAxisTick(props, xAxisTickFormatter, 22)}
              angle={-40}
              textAnchor="end"
              height={80}
              tickFormatter={xAxisTickFormatter}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Area
              type="monotone"
              dataKey="achieved"
              name={CONTENT.analytics.chartLabels?.achieved as string}
              fill="var(--ds-brand-accent)"
              stroke="var(--ds-brand-accent)"
              strokeWidth={2}
            />
            {metricCalculationType !== "snapshot" && (
              <Area
                type="monotone"
                dataKey="goal"
                name={CONTENT.analytics.chartLabels?.goal as string}
                fill="var(--ds-chart-3)"
                stroke="var(--ds-chart-3)"
                strokeWidth={1.5}
                opacity={0.4}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </ChartScrollContainer>
    );
  }

  // Default: bar/composed chart
  return (
    <ChartScrollContainer>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
          <XAxis
            dataKey="periodLabel"
            tick={(props) => renderXAxisTick(props, xAxisTickFormatter, 22)}
            angle={-40}
            textAnchor="end"
            height={80}
            tickFormatter={xAxisTickFormatter}
          />
          <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Bar
            dataKey="achieved"
            name={CONTENT.analytics.chartLabels?.achieved as string}
            fill="var(--ds-chart-1)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
          {metricCalculationType !== "snapshot" && (
            <Line
              type="monotone"
              dataKey="goal"
              name={CONTENT.analytics.chartLabels?.goal as string}
              stroke="var(--ds-chart-3)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartScrollContainer>
  );
}
