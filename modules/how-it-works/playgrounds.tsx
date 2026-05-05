"use client";

/**
 * modules/how-it-works/playgrounds.tsx
 *
 * Self-contained interactive demos surfaced inside the How It Works tabs.
 * Pure client components — no DB writes, no server round-trips. The set of
 * playgrounds available to a tab is config-driven (`tab.playgroundIds: string[]`)
 * and resolved through this registry; admins can toggle which demos a tab
 * mounts without touching this file.
 */

import { useMemo, useState } from "react";
import { InputNumber, Slider } from "antd";
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
};

export function getPlayground(id: string): PlaygroundDef | undefined {
    return PLAYGROUND_REGISTRY[id];
}
