"use client";

/**
 * modules/reports/components/QuickViewAggregateBar.tsx
 *
 * Three-pill bar — Monthly / Quarterly / Yearly — that links into the
 * existing aggregation engine pre-filled for the report's campus + period
 * (or scope, for group/global viewers). Each pill is disabled when there
 * are no source reports for that rollup; the count is shown as a hint.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Tooltip } from "antd";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";

interface QuickView {
    period: "MONTHLY" | "QUARTERLY" | "YEARLY";
    label: string;
    sourceCount: number;
    href: string;
}

interface QuickViewsPayload {
    reportId: string;
    scope: "campus" | "group" | "global";
    views: QuickView[];
}

const PERIOD_TAG_COLOR: Record<QuickView["period"], string> = {
    MONTHLY: "blue",
    QUARTERLY: "geekblue",
    YEARLY: "purple",
};

export function QuickViewAggregateBar({ reportId }: { reportId: string }) {
    const router = useRouter();
    const [data, setData] = useState<QuickViewsPayload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const res = await fetch(API_ROUTES.reports.quickViews(reportId), { cache: "no-store" });
                const json = (await res.json()) as { success: boolean; data?: QuickViewsPayload };
                if (!cancelled && json.success && json.data) setData(json.data);
            } catch {
                // silent — bar simply doesn't render
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [reportId]);

    const copy = (CONTENT.reportsQuickViews ?? {}) as unknown as Record<string, string>;

    const visibleViews = useMemo(() => data?.views ?? [], [data]);
    if (loading || visibleViews.length === 0) return null;

    return (
        <div
            role="region"
            aria-label={copy.regionLabel ?? "Aggregated report quick views"}
            className="flex flex-wrap gap-2 items-center p-3 mb-4 rounded-ds-2xl border border-ds-border-base bg-ds-surface-elevated"
        >
            <span className="text-xs font-medium text-ds-text-secondary mr-1">
                {copy.heading ?? "View aggregated:"}
            </span>
            {visibleViews.map((v) => {
                const disabled = v.sourceCount === 0;
                const onClick = disabled ? undefined : () => router.push(v.href);
                const node = (
                    <button
                        type="button"
                        onClick={onClick}
                        disabled={disabled}
                        className={[
                            "px-3 py-1.5 rounded-ds-md text-xs font-medium border transition-colors",
                            disabled
                                ? "border-ds-border-subtle text-ds-text-subtle cursor-not-allowed"
                                : "border-ds-border-base text-ds-text-primary hover:bg-ds-surface-sunken cursor-pointer",
                        ].join(" ")}
                    >
                        <Tag color={PERIOD_TAG_COLOR[v.period]} style={{ marginRight: 6 }}>
                            {v.period.toLowerCase()}
                        </Tag>
                        <span>{v.label}</span>
                        <span className="ml-2 text-ds-text-subtle">({v.sourceCount})</span>
                    </button>
                );
                return disabled ? (
                    <Tooltip key={v.period} title={copy.noDataTooltip ?? "No source data yet for this rollup"}>
                        <span>{node}</span>
                    </Tooltip>
                ) : (
                    <span key={v.period}>{node}</span>
                );
            })}
        </div>
    );
}

export default QuickViewAggregateBar;
