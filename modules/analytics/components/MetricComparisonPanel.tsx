"use client";

/**
 * modules/analytics/components/MetricComparisonPanel.tsx
 *
 * Compare 2-N metrics across the loaded reports. Renders a Recharts
 * LineChart pivoted by period, plus a Pearson correlation matrix and
 * descriptive insight sentences. Reuses lib/data/insights.ts for the
 * analytics; no new server logic.
 */

import { useMemo, useState } from "react";
import { Empty, Tag } from "antd";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { pearsonCorrelation } from "@/lib/data/insights";
import { ChartScrollContainer, RotatedTick } from "@/modules/analytics/chartUtils";
import { MetricSelect } from "@/modules/templates/components/MetricSelect";

interface ReportMetricCell {
    templateMetricId: string;
    monthlyAchieved?: number | null;
}

interface ReportLike {
    id: string;
    periodYear: number;
    periodMonth?: number | null;
    periodWeek?: number | null;
    sections?: Array<{ metrics?: ReportMetricCell[] }>;
}

interface MetricMeta {
    id: string;
    name: string;
}

interface Props {
    /** Reports already loaded by the parent analytics page. */
    reports: ReportLike[];
    /** Template snapshot used to power the multi-select. */
    template: Pick<ReportTemplate, "sections"> | null;
    /** Pre-selection (optional). */
    initialMetricIds?: string[];
}

const TONE_COLORS = [
    "var(--ds-chart-1)",
    "var(--ds-chart-2)",
    "var(--ds-chart-3)",
    "var(--ds-chart-4)",
    "var(--ds-chart-5)",
    "var(--ds-chart-6)",
];

function periodKey(r: ReportLike): string {
    if (r.periodMonth) return `${r.periodYear}-M${String(r.periodMonth).padStart(2, "0")}`;
    if (r.periodWeek) return `${r.periodYear}-W${String(r.periodWeek).padStart(2, "0")}`;
    return `${r.periodYear}`;
}

function periodOrder(a: string, b: string): number {
    return a.localeCompare(b);
}

function flattenMetricsMeta(template: Pick<ReportTemplate, "sections"> | null): MetricMeta[] {
    if (!template?.sections) return [];
    return template.sections.flatMap((s) => (s.metrics ?? []).map((m) => ({ id: m.id, name: m.name })));
}

export function MetricComparisonPanel({ reports, template, initialMetricIds }: Props) {
    const [metricIds, setMetricIds] = useState<string[]>(initialMetricIds ?? []);

    const metricMeta = useMemo(() => flattenMetricsMeta(template), [template]);
    const idToName = useMemo(() => new Map(metricMeta.map((m) => [m.id, m.name])), [metricMeta]);

    // Pivot: rows = period, cols = metric; values = sum of achieved for that period.
    const chartData = useMemo(() => {
        if (metricIds.length === 0 || reports.length === 0) return [];
        const buckets = new Map<string, Record<string, number | string>>();
        for (const r of reports) {
            const key = periodKey(r);
            const row = buckets.get(key) ?? { period: key };
            for (const sec of r.sections ?? []) {
                for (const cell of sec.metrics ?? []) {
                    if (!metricIds.includes(cell.templateMetricId)) continue;
                    const name = idToName.get(cell.templateMetricId) ?? cell.templateMetricId;
                    const prev = (row[name] as number | undefined) ?? 0;
                    row[name] = prev + (typeof cell.monthlyAchieved === "number" ? cell.monthlyAchieved : 0);
                }
            }
            buckets.set(key, row);
        }
        return Array.from(buckets.entries())
            .sort(([a], [b]) => periodOrder(a, b))
            .map(([, v]) => v);
    }, [metricIds, reports, idToName]);

    // Per-pair Pearson + sentence.
    const correlationCells = useMemo(() => {
        if (metricIds.length < 2 || chartData.length < 2) return [];
        const out: Array<{ a: string; b: string; r: number | null; n: number }> = [];
        for (let i = 0; i < metricIds.length; i++) {
            for (let j = i + 1; j < metricIds.length; j++) {
                const a = metricIds[i];
                const b = metricIds[j];
                const aName = idToName.get(a) ?? a;
                const bName = idToName.get(b) ?? b;
                const samplesA: number[] = [];
                const samplesB: number[] = [];
                for (const row of chartData) {
                    const av = row[aName];
                    const bv = row[bName];
                    if (typeof av === "number" && typeof bv === "number") {
                        samplesA.push(av);
                        samplesB.push(bv);
                    }
                }
                const r = pearsonCorrelation(samplesA, samplesB, 5);
                out.push({ a: aName, b: bName, r, n: samplesA.length });
            }
        }
        return out;
    }, [metricIds, chartData, idToName]);

    const sentences = correlationCells
        .filter((c) => c.r !== null && Math.abs(c.r) >= 0.5)
        .map(
            (c) =>
                `${c.a} and ${c.b} ${c.r! > 0 ? "rise together" : "move inversely"} (r=${c.r!.toFixed(2)}, n=${c.n}).`,
        );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-ds-text-subtle">Pick 2 or more metrics to compare</label>
                <MetricSelect
                    template={template}
                    value={metricIds}
                    onChange={(v) => setMetricIds(v as string[])}
                    multiple
                    placeholder="Search by metric or section name"
                />
            </div>

            {chartData.length === 0 || metricIds.length < 2 ? (
                <Empty description="Pick at least two metrics with overlapping data to see comparison." />
            ) : (
                <>
                    <ChartScrollContainer minWidthClass="min-w-[600px]">
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData} margin={{ bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                                <XAxis dataKey="period" interval={0} height={56} tick={<RotatedTick maxChars={14} />} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                                <Tooltip />
                                <Legend />
                                {metricIds.map((id, i) => {
                                    const name = idToName.get(id) ?? id;
                                    return (
                                        <Line
                                            key={id}
                                            type="monotone"
                                            dataKey={name}
                                            stroke={TONE_COLORS[i % TONE_COLORS.length]}
                                            dot={false}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartScrollContainer>

                    <div className="grid gap-3">
                        <p className="text-xs uppercase tracking-wide text-ds-text-subtle">Correlation</p>
                        <div className="flex flex-wrap gap-2">
                            {correlationCells.map((c) => (
                                <Tag
                                    key={`${c.a}-${c.b}`}
                                    color={c.r === null ? "default" : Math.abs(c.r) >= 0.7 ? "green" : Math.abs(c.r) >= 0.4 ? "blue" : "default"}
                                >
                                    {c.a} ↔ {c.b}: {c.r === null ? "n/a (need ≥ 5 samples)" : `r=${c.r.toFixed(2)} (n=${c.n})`}
                                </Tag>
                            ))}
                        </div>
                        {sentences.length > 0 && (
                            <ul className="text-sm text-ds-text-secondary space-y-1">
                                {sentences.map((s, i) => (
                                    <li key={i}>· {s}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default MetricComparisonPanel;
