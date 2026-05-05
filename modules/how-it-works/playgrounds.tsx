"use client";

/**
 * modules/how-it-works/playgrounds.tsx
 *
 * Self-contained interactive demos surfaced inside the How It Works tabs.
 * Pure client components — no DB writes, no server round-trips. The set of
 * playgrounds available to a tab is config-driven (`tab.playgroundIds: string[]`)
 * and resolved through this registry; admins can toggle which demos a tab
 * mounts without touching this file.
 *
 * Each demo reuses the *real* algorithm (insights, autoTotal, parseCsv) so
 * the playground IS the production behaviour, just with a synthetic dataset.
 */

import { useMemo, useState } from "react";
import { InputNumber, Slider, Select, Switch, Tag } from "antd";
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
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { pearsonCorrelation } from "@/lib/data/insights";

interface PlaygroundDef {
    id: string;
    title: string;
    description: string;
    Component: React.ComponentType;
}

/* ── Quick-form demo ───────────────────────────────────────────────────── */

function QuickFormDemo() {
    const [men, setMen] = useState<number>(0);
    const [women, setWomen] = useState<number>(0);
    const [children, setChildren] = useState<number>(0);
    const total = men + women + children;
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-ds-text-secondary">
                Men
                <InputNumber value={men} onChange={(v) => setMen(typeof v === "number" ? v : 0)} min={0} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ds-text-secondary">
                Women
                <InputNumber value={women} onChange={(v) => setWomen(typeof v === "number" ? v : 0)} min={0} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ds-text-secondary">
                Children
                <InputNumber
                    value={children}
                    onChange={(v) => setChildren(typeof v === "number" ? v : 0)}
                    min={0}
                />
            </label>
            <div className="flex flex-col gap-1 text-xs text-ds-text-secondary">
                Auto-total (read-only)
                <div className="px-3 py-1.5 rounded-ds-md bg-ds-surface-sunken border border-ds-border-subtle text-sm font-medium text-ds-text-primary tabular-nums">
                    {total}
                </div>
            </div>
            <p className="sm:col-span-2 text-xs text-ds-text-subtle">
                Auto-total cells are server-computed in the real flow; the form renders them read-only with a comment listing the source metrics.
            </p>
        </div>
    );
}

/* ── Correlation demo ──────────────────────────────────────────────────── */

function CorrelationDemo() {
    const [n, setN] = useState(8);
    const [noise, setNoise] = useState(0);
    const samples = useMemo(() => {
        const a: number[] = [];
        const b: number[] = [];
        for (let i = 0; i < n; i++) {
            const base = i * 5;
            a.push(base);
            b.push(base + (Math.sin(i * 0.7) * noise));
        }
        return { a, b };
    }, [n, noise]);
    const r = pearsonCorrelation(samples.a, samples.b, 5);
    const minSamplesNote = samples.a.length < 5
        ? "Fewer than 5 paired samples — Pearson is null by default to avoid misleading r values."
        : null;
    return (
        <div className="grid gap-3">
            <label className="flex flex-col gap-1 text-xs text-ds-text-secondary">
                Sample count: {n}
                <Slider min={2} max={20} value={n} onChange={(v) => setN(v)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ds-text-secondary">
                Noise: {noise.toFixed(1)}
                <Slider min={0} max={50} step={1} value={noise} onChange={(v) => setNoise(v)} />
            </label>
            <div className="px-3 py-2 rounded-ds-md bg-ds-surface-sunken border border-ds-border-subtle">
                <p className="text-xs text-ds-text-subtle">Pearson r</p>
                <p className="text-lg font-semibold text-ds-text-primary tabular-nums">
                    {r === null ? "—" : r.toFixed(3)}
                </p>
                {minSamplesNote && (
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{minSamplesNote}</p>
                )}
            </div>
        </div>
    );
}

/* ── Analytics chart-type toggle ─────────────────────────────────────── */

function AnalyticsChartToggle() {
    const [kind, setKind] = useState<"bar" | "line" | "area" | "pie">("bar");
    const data = useMemo(
        () => [
            { name: "Wk 1", value: 230 },
            { name: "Wk 2", value: 264 },
            { name: "Wk 3", value: 198 },
            { name: "Wk 4", value: 312 },
            { name: "Wk 5", value: 285 },
        ],
        [],
    );
    const PIE_COLOURS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
    return (
        <div className="grid gap-3">
            <Select
                value={kind}
                onChange={(v) => setKind(v as typeof kind)}
                options={[
                    { value: "bar", label: "Bar" },
                    { value: "line", label: "Line" },
                    { value: "area", label: "Area" },
                    { value: "pie", label: "Pie" },
                ]}
                style={{ width: 160 }}
            />
            <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                    {kind === "bar" ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ReTooltip />
                            <Bar dataKey="value" fill="#7c3aed" />
                        </BarChart>
                    ) : kind === "line" ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ReTooltip />
                            <Line dataKey="value" stroke="#7c3aed" />
                        </LineChart>
                    ) : kind === "area" ? (
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ReTooltip />
                            <Area dataKey="value" stroke="#7c3aed" fill="#7c3aed44" />
                        </AreaChart>
                    ) : (
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" outerRadius={70} label>
                                {data.map((_, idx) => (
                                    <Cell key={idx} fill={PIE_COLOURS[idx % PIE_COLOURS.length]} />
                                ))}
                            </Pie>
                            <ReTooltip />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-ds-text-subtle">
                Same dataset, four chart types. The real Analytics page lets you toggle between these
                same options on every chart card via the chart-controls bar.
            </p>
        </div>
    );
}

/* ── Template-builder effect on reports + analytics ──────────────────── */

function TemplateBuilderEffect() {
    const [capturesGoal, setCapturesGoal] = useState(true);
    const [capturesYoY, setCapturesYoY] = useState(false);
    const [capturesWoW, setCapturesWoW] = useState(false);
    const [hasAutoTotal, setHasAutoTotal] = useState(true);

    const cells = [
        { name: "Men", goal: 80, achieved: 72, prior: 70 },
        { name: "Women", goal: 100, achieved: 95, prior: 102 },
        { name: "Children", goal: 40, achieved: 35, prior: 38 },
    ];
    const total = cells.reduce((acc, c) => acc + c.achieved, 0);
    const priorTotal = cells.reduce((acc, c) => acc + c.prior, 0);
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap gap-3 text-xs text-ds-text-secondary">
                <label className="inline-flex items-center gap-2">
                    <Switch size="small" checked={capturesGoal} onChange={setCapturesGoal} /> Goal
                </label>
                <label className="inline-flex items-center gap-2">
                    <Switch size="small" checked={capturesYoY} onChange={setCapturesYoY} /> YoY
                </label>
                <label className="inline-flex items-center gap-2">
                    <Switch size="small" checked={capturesWoW} onChange={setCapturesWoW} /> Week-on-week
                </label>
                <label className="inline-flex items-center gap-2">
                    <Switch size="small" checked={hasAutoTotal} onChange={setHasAutoTotal} /> Auto-total
                </label>
            </div>
            <div className="border border-ds-border-subtle rounded-ds-md p-3 bg-ds-surface-elevated">
                <p className="text-[11px] uppercase tracking-wide text-ds-text-subtle mb-2">
                    Generated report shape
                </p>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-left">
                            <th className="py-1">Metric</th>
                            {capturesGoal && <th className="py-1 text-right">Goal</th>}
                            <th className="py-1 text-right">Achieved</th>
                            {capturesYoY && <th className="py-1 text-right">YoY %</th>}
                            {capturesWoW && <th className="py-1 text-right">WoW Δ</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {cells.map((c) => (
                            <tr key={c.name} className="border-t border-ds-border-subtle">
                                <td className="py-1">{c.name}</td>
                                {capturesGoal && <td className="py-1 text-right">{c.goal}</td>}
                                <td className="py-1 text-right">{c.achieved}</td>
                                {capturesYoY && (
                                    <td className="py-1 text-right">
                                        {Math.round(((c.achieved - c.prior) / c.prior) * 100)}%
                                    </td>
                                )}
                                {capturesWoW && (
                                    <td className="py-1 text-right">{c.achieved - c.prior}</td>
                                )}
                            </tr>
                        ))}
                        {hasAutoTotal && (
                            <tr className="border-t border-ds-border-subtle bg-ds-surface-sunken">
                                <td className="py-1 font-medium">
                                    Total <Tag className="!m-0 !text-[10px]">AUTO</Tag>
                                </td>
                                {capturesGoal && (
                                    <td className="py-1 text-right">
                                        {cells.reduce((acc, c) => acc + c.goal, 0)}
                                    </td>
                                )}
                                <td className="py-1 text-right font-medium">{total}</td>
                                {capturesYoY && (
                                    <td className="py-1 text-right">
                                        {Math.round(((total - priorTotal) / priorTotal) * 100)}%
                                    </td>
                                )}
                                {capturesWoW && (
                                    <td className="py-1 text-right">{total - priorTotal}</td>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-ds-text-subtle">
                The toggle row above is the template-builder. The table is what one report instance
                ends up looking like — and the analytics surfaces inherit those toggles automatically.
            </p>
        </div>
    );
}

/* ── Correlation matrix builder ──────────────────────────────────────── */

function CorrelationMatrixBuilder() {
    const metrics = useMemo(() => {
        const baseA = [10, 22, 38, 51, 60, 75, 89, 102, 115, 130];
        const baseB = baseA.map((v, i) => v + Math.cos(i) * 3); // strongly correlated
        const baseC = [80, 70, 65, 50, 45, 40, 35, 30, 25, 20]; // inverse
        return { baseA, baseB, baseC };
    }, []);
    const matrix = useMemo(() => {
        const labels = ["A", "B", "C"];
        const series: number[][] = [metrics.baseA, metrics.baseB, metrics.baseC];
        const rows: Array<{ a: string; b: string; r: number | null }> = [];
        for (let i = 0; i < labels.length; i++) {
            for (let j = 0; j < labels.length; j++) {
                rows.push({
                    a: labels[i],
                    b: labels[j],
                    r: i === j ? 1 : pearsonCorrelation(series[i], series[j], 5),
                });
            }
        }
        return { labels, rows };
    }, [metrics]);
    return (
        <div className="grid gap-3">
            <p className="text-xs text-ds-text-subtle">
                Three metrics in the same correlation group. Pearson r is computed pairwise; same
                gating as production (min-samples = 5, returns null for tiny series).
            </p>
            <div className="grid grid-cols-4 gap-1 text-xs">
                <div />
                {matrix.labels.map((l) => (
                    <div key={`h-${l}`} className="text-center font-semibold">
                        {l}
                    </div>
                ))}
                {matrix.labels.map((rowLabel) => (
                    <>
                        <div key={`row-${rowLabel}`} className="font-semibold">
                            {rowLabel}
                        </div>
                        {matrix.labels.map((colLabel) => {
                            const cell = matrix.rows.find((r) => r.a === rowLabel && r.b === colLabel);
                            const r = cell?.r ?? null;
                            const intensity = r === null ? 0 : Math.abs(r);
                            const colour =
                                r === null
                                    ? "bg-ds-surface-sunken"
                                    : r > 0
                                      ? `bg-emerald-${Math.round(intensity * 4 + 1) * 100}`
                                      : `bg-rose-${Math.round(intensity * 4 + 1) * 100}`;
                            void colour; // tailwind purges dynamic class names; use inline style for portability
                            const styleColour =
                                r === null
                                    ? "transparent"
                                    : r > 0
                                      ? `rgba(16,185,129,${Math.max(0.15, intensity)})`
                                      : `rgba(244,63,94,${Math.max(0.15, intensity)})`;
                            return (
                                <div
                                    key={`${rowLabel}-${colLabel}`}
                                    className="text-center p-2 rounded-ds-sm border border-ds-border-subtle tabular-nums"
                                    style={{ background: styleColour }}
                                >
                                    {r === null ? "—" : r.toFixed(2)}
                                </div>
                            );
                        })}
                    </>
                ))}
            </div>
        </div>
    );
}

/* ── Auto-sum chain (SECTION ↔ TEMPLATE scope) ───────────────────────── */

function AutoSumChain() {
    const [scope, setScope] = useState<"SECTION" | "TEMPLATE">("SECTION");
    const sectionMen = 60;
    const sectionWomen = 80;
    const sectionChildren = 30;
    const otherFirstTimers = 25;

    const total =
        scope === "SECTION"
            ? sectionMen + sectionWomen + sectionChildren
            : sectionMen + sectionWomen + sectionChildren + otherFirstTimers;

    return (
        <div className="grid gap-3">
            <Select
                value={scope}
                onChange={(v) => setScope(v as typeof scope)}
                options={[
                    { value: "SECTION", label: "Same section" },
                    { value: "TEMPLATE", label: "Cross-section (any section)" },
                ]}
                style={{ width: 280 }}
            />
            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-ds-border-subtle rounded-ds-md p-3 bg-ds-surface-elevated">
                    <p className="font-semibold text-ds-text-primary mb-1">Attendance section</p>
                    <ul className="space-y-1 text-ds-text-secondary">
                        <li>Men: {sectionMen}</li>
                        <li>Women: {sectionWomen}</li>
                        <li>Children: {sectionChildren}</li>
                    </ul>
                </div>
                <div className="border border-ds-border-subtle rounded-ds-md p-3 bg-ds-surface-elevated">
                    <p className="font-semibold text-ds-text-primary mb-1">Outreach section</p>
                    <ul className="space-y-1 text-ds-text-secondary">
                        <li>First-timers: {otherFirstTimers}</li>
                    </ul>
                </div>
            </div>
            <div className="rounded-ds-md bg-ds-surface-sunken border border-ds-border-subtle p-3">
                <p className="text-xs text-ds-text-subtle">Auto-total cell</p>
                <p className="text-2xl font-semibold text-ds-text-primary tabular-nums">{total}</p>
                <p className="text-[11px] text-ds-text-subtle">
                    Scope: {scope === "SECTION" ? "section only" : "cross-section"} · server-computed,
                    locked on the form, comment lists source metrics.
                </p>
            </div>
        </div>
    );
}

/* ── Insights summary preview ────────────────────────────────────────── */

function InsightSummaryPreview() {
    const reports = useMemo(
        () => [
            { campus: "Lekki", week: 1, attendance: 220, goal: 240 },
            { campus: "Lekki", week: 2, attendance: 245, goal: 240 },
            { campus: "Lekki", week: 3, attendance: 268, goal: 240 },
            { campus: "Surulere", week: 1, attendance: 180, goal: 220 },
            { campus: "Surulere", week: 2, attendance: 195, goal: 220 },
            { campus: "Surulere", week: 3, attendance: 168, goal: 220 },
        ],
        [],
    );
    const movers = useMemo(() => {
        const byCampus = new Map<string, typeof reports>();
        for (const r of reports) {
            if (!byCampus.has(r.campus)) byCampus.set(r.campus, []);
            byCampus.get(r.campus)!.push(r);
        }
        const out: Array<{ campus: string; delta: number; percent: number }> = [];
        for (const [campus, list] of byCampus.entries()) {
            const sorted = list.slice().sort((a, b) => a.week - b.week);
            const first = sorted[0]?.attendance ?? 0;
            const last = sorted[sorted.length - 1]?.attendance ?? 0;
            const delta = last - first;
            out.push({
                campus,
                delta,
                percent: first === 0 ? 0 : Math.round((delta / Math.abs(first)) * 100),
            });
        }
        return out.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    }, [reports]);

    const totalGoal = reports.reduce((acc, r) => acc + r.goal, 0);
    const totalAch = reports.reduce((acc, r) => acc + r.attendance, 0);
    const compliance = totalGoal === 0 ? 0 : Math.round((totalAch / totalGoal) * 100);

    return (
        <div className="grid gap-2 text-sm text-ds-text-secondary">
            {movers[0] && (
                <p>
                    Biggest mover: <strong>{movers[0].campus}</strong> ({movers[0].delta >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(movers[0].percent)}%, {movers[0].delta >= 0 ? "+" : ""}
                    {movers[0].delta} attendance over the window).
                </p>
            )}
            <p>
                Overall compliance: <strong>{compliance}%</strong> against goal across {reports.length}{" "}
                reports.
            </p>
            <p className="text-xs text-ds-text-subtle">
                The real InsightSummary widget runs the same algorithms (top mover, biggest gap,
                compliance delta) over your own scope.
            </p>
        </div>
    );
}

/* ── Aggregation rollup ──────────────────────────────────────────────── */

function AggregationRollup() {
    const [scope, setScope] = useState<"monthly" | "quarterly" | "yearly">("monthly");
    const weeklySource = [220, 245, 268, 230, 250, 275, 290, 285, 260, 240, 255, 270];
    const monthly = useMemo(() => {
        const out: number[] = [];
        for (let i = 0; i < weeklySource.length; i += 4) {
            out.push(weeklySource.slice(i, i + 4).reduce((a, b) => a + b, 0));
        }
        return out;
    }, []);
    const value =
        scope === "monthly"
            ? monthly[monthly.length - 1]
            : scope === "quarterly"
              ? monthly.slice(-3).reduce((a, b) => a + b, 0)
              : monthly.reduce((a, b) => a + b, 0);

    return (
        <div className="grid gap-3">
            <Select
                value={scope}
                onChange={(v) => setScope(v as typeof scope)}
                options={[
                    { value: "monthly", label: "Latest month" },
                    { value: "quarterly", label: "Latest quarter" },
                    { value: "yearly", label: "Year-to-date" },
                ]}
                style={{ width: 200 }}
            />
            <div className="rounded-ds-md bg-ds-surface-sunken border border-ds-border-subtle p-3">
                <p className="text-xs text-ds-text-subtle">Aggregated attendance</p>
                <p className="text-2xl font-semibold text-ds-text-primary tabular-nums">{value}</p>
                <p className="text-[11px] text-ds-text-subtle">
                    Source rows aggregated: {scope === "monthly" ? 4 : scope === "quarterly" ? 12 : weeklySource.length}.
                    Same engine that powers the Quick Views bar on every report detail.
                </p>
            </div>
        </div>
    );
}

/* ── Import wizard demo ──────────────────────────────────────────────── */

function ImportWizardDemo() {
    const [text, setText] = useState(
        "campusId,period,first_timers,attendance\nlekki,2026-W17,12,245\nsurulere,2026-W17,8,195",
    );
    const rows = useMemo(() => {
        const out: string[][] = [];
        for (const line of text.split(/\r?\n/)) {
            if (!line.trim()) continue;
            out.push(line.split(",").map((c) => c.trim()));
        }
        return out;
    }, [text]);
    const header = rows[0] ?? [];
    const dataRows = rows.slice(1);

    return (
        <div className="grid gap-3">
            <p className="text-xs text-ds-text-subtle">
                Paste rows as CSV. The wizard would normally show this preview after upload, plus a
                column-target picker and a per-row validation column. xlsx flows through the same
                mapping step.
            </p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className="w-full font-mono text-xs p-2 rounded-ds-md border border-ds-border-subtle bg-ds-surface-base"
            />
            <div className="border border-ds-border-subtle rounded-ds-md overflow-hidden">
                <table className="w-full text-xs">
                    <thead className="bg-ds-surface-sunken">
                        <tr>
                            {header.map((h, i) => (
                                <th key={i} className="text-left p-2">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataRows.map((row, i) => (
                            <tr key={i} className="border-t border-ds-border-subtle">
                                {row.map((cell, j) => (
                                    <td key={j} className="p-2">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ── Registry ──────────────────────────────────────────────────────────── */

export const PLAYGROUND_REGISTRY: Record<string, PlaygroundDef> = {
    "quick-form-demo": {
        id: "quick-form-demo",
        title: "Quick-form auto-total",
        description:
            "Type values for Men / Women / Children and watch the auto-total field stay in sync — server-side it's the same recompute path, with a comment listing the source metrics.",
        Component: QuickFormDemo,
    },
    "correlation-demo": {
        id: "correlation-demo",
        title: "Correlation min-samples gate",
        description:
            "Drag the sample count below 5 and the Pearson coefficient drops to null — a deliberate floor that prevents misleading r values on tiny series.",
        Component: CorrelationDemo,
    },
    "analytics-chart-toggle": {
        id: "analytics-chart-toggle",
        title: "Chart-type toggle",
        description:
            "Same dataset rendered as bar / line / area / pie — the chart-controls bar on real Analytics surfaces lets you flip between these in one click.",
        Component: AnalyticsChartToggle,
    },
    "template-builder-effect": {
        id: "template-builder-effect",
        title: "Template settings → report shape",
        description:
            "Toggle goal / YoY / WoW / auto-total flags and watch the generated report shape rebuild. Templates drive every downstream surface (form layout + analytics columns).",
        Component: TemplateBuilderEffect,
    },
    "correlation-matrix-builder": {
        id: "correlation-matrix-builder",
        title: "Correlation matrix",
        description:
            "Three correlated metrics laid out as a Pearson r matrix. Identical to the matrix the dashboard widget renders for any template-defined correlation group.",
        Component: CorrelationMatrixBuilder,
    },
    "auto-sum-chain": {
        id: "auto-sum-chain",
        title: "Auto-sum scope",
        description:
            "Switch between SECTION and TEMPLATE scope and see the sources picker change. Same toggle the AutoSumPanel exposes per section in the template editor.",
        Component: AutoSumChain,
    },
    "insight-summary-preview": {
        id: "insight-summary-preview",
        title: "Insight summary",
        description:
            "Top mover, biggest gap, and compliance summary computed live from a synthetic dataset — the dashboard's InsightSummary widget runs the same logic over your scope.",
        Component: InsightSummaryPreview,
    },
    "aggregation-rollup": {
        id: "aggregation-rollup",
        title: "Aggregation rollup",
        description:
            "Pick monthly / quarterly / yearly and watch a synthetic aggregate compute from 12 weekly sources. Identical to the Quick Views bar's behaviour on a real report detail.",
        Component: AggregationRollup,
    },
    "import-wizard-demo": {
        id: "import-wizard-demo",
        title: "Imports preview",
        description:
            "Paste a tiny CSV (or imagine an xlsx — same flow). The wizard's mapping step looks like this on a real upload, with column-target pickers and per-row validation outcomes.",
        Component: ImportWizardDemo,
    },
};

export function getPlayground(id: string): PlaygroundDef | undefined {
    return PLAYGROUND_REGISTRY[id];
}
