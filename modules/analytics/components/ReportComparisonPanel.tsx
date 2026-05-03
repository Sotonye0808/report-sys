"use client";

/**
 * modules/analytics/components/ReportComparisonPanel.tsx
 *
 * Side-by-side report comparison: pick 2-N reports already loaded by the
 * analytics page; render a per-metric value table + per-metric mini chart
 * + insights summary. Reuses lib/data/insights.ts.
 */

import { useMemo, useState } from "react";
import { Select, Empty, Tag } from "antd";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { biggestGap, summariseInsights } from "@/lib/data/insights";
import { ChartScrollContainer, RotatedTick } from "@/modules/analytics/chartUtils";
import type { ReportStatus } from "@/types/global";

interface ReportMetricCell {
    templateMetricId: string;
    metricName?: string;
    monthlyAchieved?: number | null;
    monthlyGoal?: number | null;
}

interface ReportLike {
    id: string;
    campusId: string;
    periodYear: number;
    periodMonth?: number | null;
    periodWeek?: number | null;
    status: ReportStatus;
    title?: string | null;
    sections?: Array<{ metrics?: ReportMetricCell[] }>;
}

interface Props {
    reports: ReportLike[];
    /** Optional pre-selection. */
    initialReportIds?: string[];
}

const TONE_COLORS = [
    "var(--ds-chart-1)",
    "var(--ds-chart-2)",
    "var(--ds-chart-3)",
    "var(--ds-chart-4)",
];

function reportLabel(r: ReportLike): string {
    const period = r.periodMonth
        ? `${r.periodYear}-M${String(r.periodMonth).padStart(2, "0")}`
        : r.periodWeek
        ? `${r.periodYear}-W${String(r.periodWeek).padStart(2, "0")}`
        : `${r.periodYear}`;
    return r.title ? `${r.title} · ${period}` : `${period} · ${r.id.slice(0, 6)}`;
}

export function ReportComparisonPanel({ reports, initialReportIds }: Props) {
    const [picked, setPicked] = useState<string[]>(initialReportIds ?? []);

    const selected = useMemo(() => reports.filter((r) => picked.includes(r.id)), [picked, reports]);

    // Pivot per-metric values across the picked reports.
    const tableRows = useMemo(() => {
        if (selected.length < 2) return [];
        const byMetric = new Map<string, { name: string; values: Record<string, number | null> }>();
        for (const r of selected) {
            for (const sec of r.sections ?? []) {
                for (const cell of sec.metrics ?? []) {
                    const key = cell.templateMetricId;
                    const existing = byMetric.get(key) ?? {
                        name: cell.metricName ?? key,
                        values: {} as Record<string, number | null>,
                    };
                    existing.values[r.id] = cell.monthlyAchieved ?? null;
                    byMetric.set(key, existing);
                }
            }
        }
        return Array.from(byMetric.entries()).map(([id, v]) => ({ templateMetricId: id, ...v }));
    }, [selected]);

    const chartData = tableRows.map((row) => ({
        metric: row.name,
        ...Object.fromEntries(
            selected.map((r) => [reportLabel(r), row.values[r.id] ?? 0]),
        ),
    }));

    const insights = useMemo(() => {
        if (selected.length < 2) return null;
        const summary = summariseInsights(
            selected as never,
            selected.slice(0, -1) as never,
        );
        const gaps = biggestGap(selected as never).slice(0, 3);
        return { summary, gaps };
    }, [selected]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-ds-text-subtle">Pick 2 or more reports to compare</label>
                <Select
                    mode="multiple"
                    value={picked}
                    onChange={(v) => setPicked(v as string[])}
                    options={reports.map((r) => ({ value: r.id, label: reportLabel(r) }))}
                    showSearch
                    optionFilterProp="label"
                    placeholder="Search reports by title or period"
                />
            </div>

            {selected.length < 2 ? (
                <Empty description="Pick at least two reports to compare." />
            ) : (
                <>
                    <ChartScrollContainer minWidthClass="min-w-[700px]">
                        <ResponsiveContainer width="100%" height={Math.max(220, tableRows.length * 32)}>
                            <BarChart data={chartData} margin={{ bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                                <XAxis dataKey="metric" interval={0} height={56} tick={<RotatedTick maxChars={14} />} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                                <Tooltip />
                                <Legend />
                                {selected.map((r, i) => (
                                    <Bar
                                        key={r.id}
                                        dataKey={reportLabel(r)}
                                        fill={TONE_COLORS[i % TONE_COLORS.length]}
                                        radius={[4, 4, 0, 0]}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartScrollContainer>

                    {insights && (
                        <div className="flex flex-col gap-2 p-3 rounded-ds-2xl border border-ds-border-base bg-ds-surface-elevated">
                            <p className="text-xs uppercase tracking-wide text-ds-text-subtle">Insights</p>
                            {insights.summary.complianceDelta && (
                                <p className="text-sm text-ds-text-secondary">
                                    Compliance is{" "}
                                    <span
                                        className={
                                            insights.summary.complianceDelta.delta >= 0
                                                ? "text-green-500 font-semibold"
                                                : "text-red-500 font-semibold"
                                        }
                                    >
                                        {insights.summary.complianceDelta.delta >= 0 ? "+" : ""}
                                        {insights.summary.complianceDelta.delta}%
                                    </span>{" "}
                                    vs prior selection ({insights.summary.complianceDelta.previous}% →{" "}
                                    {insights.summary.complianceDelta.current}%).
                                </p>
                            )}
                            {insights.gaps.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {insights.gaps.map((g) => (
                                        <Tag key={g.templateMetricId} color={g.gap > 0 ? "orange" : "green"}>
                                            Gap {g.gap >= 0 ? "+" : ""}
                                            {g.gap} on {g.templateMetricId.slice(0, 8)}
                                        </Tag>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ReportComparisonPanel;
