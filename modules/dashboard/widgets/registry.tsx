"use client";

/**
 * modules/dashboard/widgets/registry.tsx
 *
 * Widget registry consumed by ScopeOverviewPanel and (in future) the
 * analytics drill-in pages. Each widget is a pure component that reads
 * data via the hooks in `useDashboardData.ts` and renders a card.
 *
 * Layouts are config-driven: the dashboardLayout admin-config namespace
 * maps role-band keys to widget id arrays, so an admin can reorder or
 * hide widgets without a deploy.
 */

import type { ReactElement } from "react";
import { useMemo, useEffect, useState } from "react";
import { useApiData } from "@/lib/hooks/useApiData";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { useAuth } from "@/providers/AuthProvider";
import { ReportStatus } from "@/types/global";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRouter } from "next/navigation";
import {
    Bar,
    BarChart,
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip as ReTooltip,
    XAxis,
    YAxis,
} from "recharts";
import Button from "@/components/ui/Button";

export interface WidgetContext {
    /** Reports the user is allowed to see (already scope-filtered upstream). */
    reports: Report[];
    /** Campuses (when superadmin) or scoped subset. */
    campuses: Campus[];
    /** Org groups when applicable. */
    orgGroups: OrgGroup[];
    /** Templates available. */
    templates: ReportTemplate[];
    /** Report visibility scope of current user. */
    scope: "own" | "campus" | "group" | "all";
}

export interface DashboardWidget {
    id: string;
    title: string;
    render: (ctx: WidgetContext) => ReactElement;
}

/* ── Reusable card shell ────────────────────────────────────────────────── */

function Card({ title, children, href }: { title: string; children: React.ReactNode; href?: string }) {
    const router = useRouter();
    return (
        <button
            onClick={() => href && router.push(href)}
            className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5 text-left transition-shadow hover:shadow-ds-md focus:outline-1 focus:outline-ds-brand-accent w-full"
            type="button"
        >
            <p className="text-xs font-semibold uppercase tracking-wide text-ds-text-subtle mb-2">{title}</p>
            <div>{children}</div>
        </button>
    );
}

/* ── Widget implementations ────────────────────────────────────────────── */

const groupPerformanceWidget: DashboardWidget = {
    id: "group-performance",
    title: "Group performance",
    render: ({ reports, orgGroups }) => {
        const byGroup = new Map<string, { groupName: string; submitted: number; total: number }>();
        for (const g of orgGroups) {
            byGroup.set(g.id, { groupName: g.name, submitted: 0, total: 0 });
        }
        for (const r of reports) {
            const cur = byGroup.get(r.orgGroupId);
            if (!cur) continue;
            cur.total += 1;
            if (r.status !== ReportStatus.DRAFT) cur.submitted += 1;
        }
        const ranked = Array.from(byGroup.values())
            .sort((a, b) => b.submitted - a.submitted)
            .slice(0, 5);
        return (
            <Card title="Group performance" href={APP_ROUTES.analytics}>
                {ranked.length === 0 ? (
                    <p className="text-sm text-ds-text-subtle">No group activity yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {ranked.map((g) => (
                            <li key={g.groupName} className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-ds-text-primary truncate">{g.groupName}</span>
                                <span className="text-xs text-ds-text-subtle tabular-nums">
                                    {g.submitted}/{g.total}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        );
    },
};

const topCampusWidget: DashboardWidget = {
    id: "top-campus",
    title: "Top campus",
    render: ({ reports, campuses }) => {
        const counts = new Map<string, { campusName: string; approved: number }>();
        for (const c of campuses) counts.set(c.id, { campusName: c.name, approved: 0 });
        for (const r of reports) {
            const cur = counts.get(r.campusId);
            if (!cur) continue;
            if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status)) {
                cur.approved += 1;
            }
        }
        const top = Array.from(counts.values())
            .sort((a, b) => b.approved - a.approved)
            .slice(0, 1)[0];
        return (
            <Card title="Top campus" href={APP_ROUTES.analytics}>
                {top ? (
                    <>
                        <p className="text-2xl font-bold text-ds-text-primary truncate">{top.campusName}</p>
                        <p className="text-xs text-ds-text-subtle tabular-nums">{top.approved} approved</p>
                    </>
                ) : (
                    <p className="text-sm text-ds-text-subtle">No campus data yet.</p>
                )}
            </Card>
        );
    },
};

const orgComplianceWidget: DashboardWidget = {
    id: "org-compliance",
    title: "Org compliance",
    render: ({ reports }) => {
        const total = reports.length;
        const completed = reports.filter((r) =>
            [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status),
        ).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return (
            <Card title="Org compliance" href={APP_ROUTES.analytics}>
                <p className="text-3xl font-bold text-ds-text-primary tabular-nums">{pct}%</p>
                <p className="text-xs text-ds-text-subtle">
                    {completed}/{total} approved or reviewed
                </p>
            </Card>
        );
    },
};

const recentSubmissionsWidget: DashboardWidget = {
    id: "recent-submissions",
    title: "Recent submissions",
    render: ({ reports }) => {
        const sorted = [...reports]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
        return (
            <Card title="Recent submissions" href={APP_ROUTES.reports}>
                {sorted.length === 0 ? (
                    <p className="text-sm text-ds-text-subtle">No submissions yet.</p>
                ) : (
                    <ul className="space-y-1.5">
                        {sorted.map((r) => (
                            <li
                                key={r.id}
                                className="flex items-center justify-between gap-2 text-sm text-ds-text-primary"
                            >
                                <span className="truncate">
                                    {(r.title as string | undefined) ?? `Report ${r.id.slice(0, 6)}`}
                                </span>
                                <span className="text-xs text-ds-text-subtle">{r.status}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        );
    },
};

const pendingReviewQueueWidget: DashboardWidget = {
    id: "pending-review-queue",
    title: "Pending review",
    render: ({ reports }) => {
        const pending = reports.filter((r) =>
            r.status === ReportStatus.SUBMITTED || r.status === ReportStatus.APPROVED,
        ).length;
        return (
            <Card title="Pending review" href={APP_ROUTES.reports}>
                <p className="text-3xl font-bold text-ds-text-primary tabular-nums">{pending}</p>
                <p className="text-xs text-ds-text-subtle">awaiting decision</p>
            </Card>
        );
    },
};

const topCampusChartWidget: DashboardWidget = {
    id: "top-campus-chart",
    title: "Top campus chart",
    render: ({ reports, campuses }) => {
        const counts = new Map<string, { campusName: string; approved: number }>();
        for (const c of campuses) counts.set(c.id, { campusName: c.name, approved: 0 });
        for (const r of reports) {
            const cur = counts.get(r.campusId);
            if (!cur) continue;
            if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status)) {
                cur.approved += 1;
            }
        }
        const series = Array.from(counts.values())
            .sort((a, b) => b.approved - a.approved)
            .slice(0, 5);
        return (
            <Card title="Top campuses" href={APP_ROUTES.analytics}>
                {series.length === 0 ? (
                    <p className="text-sm text-ds-text-subtle">No campus activity yet.</p>
                ) : (
                    <div style={{ width: "100%", height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={series} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                                <XAxis dataKey="campusName" tick={{ fontSize: 11 }} interval={0} angle={-12} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                                <ReTooltip />
                                <Bar dataKey="approved" fill="var(--ds-brand-accent, #3b82f6)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        );
    },
};

const metricTrendSparkWidget: DashboardWidget = {
    id: "metric-trend-spark",
    title: "Compliance trend",
    render: ({ reports }) => {
        // 6-month rolling compliance %
        const now = new Date();
        const months: Array<{ label: string; pct: number }> = [];
        for (let i = 5; i >= 0; i--) {
            const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = ref.getFullYear();
            const month = ref.getMonth() + 1;
            const monthlyReports = reports.filter(
                (r) => r.periodYear === year && r.periodMonth === month,
            );
            const completed = monthlyReports.filter((r) =>
                [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status),
            ).length;
            const pct = monthlyReports.length > 0
                ? Math.round((completed / monthlyReports.length) * 100)
                : 0;
            months.push({
                label: ref.toLocaleString("default", { month: "short" }),
                pct,
            });
        }
        return (
            <Card title="6-month compliance" href={APP_ROUTES.analytics}>
                <p className="text-2xl font-bold text-ds-text-primary tabular-nums">
                    {months[months.length - 1].pct}%
                </p>
                <div style={{ width: "100%", height: 80 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={months} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                            <Area
                                type="monotone"
                                dataKey="pct"
                                stroke="var(--ds-brand-accent, #3b82f6)"
                                fill="var(--ds-brand-accent, #3b82f6)"
                                fillOpacity={0.2}
                            />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                            <ReTooltip />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        );
    },
};

const insightSummaryWidget: DashboardWidget = {
    id: "insight-summary",
    title: "Insight summary",
    render: ({ reports, campuses, orgGroups }) => {
        // Compute a couple of quick insights from already-loaded data.
        const total = reports.length;
        const completed = reports.filter((r) =>
            [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status),
        ).length;
        const compliance = total > 0 ? Math.round((completed / total) * 100) : 0;

        const byCampus = new Map<string, number>();
        for (const r of reports) {
            byCampus.set(r.campusId, (byCampus.get(r.campusId) ?? 0) + 1);
        }
        let topCampusName: string | undefined;
        let topCount = 0;
        for (const [campusId, count] of byCampus) {
            if (count > topCount) {
                topCount = count;
                topCampusName = campuses.find((c) => c.id === campusId)?.name;
            }
        }

        const groupCount = orgGroups.length;
        const insights: string[] = [];
        insights.push(`Overall compliance is ${compliance}% across ${total} report${total === 1 ? "" : "s"}.`);
        if (topCampusName) insights.push(`Most active campus: ${topCampusName} (${topCount} reports).`);
        if (groupCount > 0) insights.push(`${groupCount} group${groupCount === 1 ? "" : "s"} active in this scope.`);

        return (
            <Card title="Insight summary">
                <ul className="text-sm text-ds-text-secondary space-y-1.5 leading-relaxed">
                    {insights.map((i, idx) => (
                        <li key={idx}>• {i}</li>
                    ))}
                </ul>
            </Card>
        );
    },
};

interface AssignmentInline {
    id: string;
    reportId: string;
    metricIds: string[];
    completedAt?: string | null;
    cancelledAt?: string | null;
    dueAt?: string | null;
}

interface InlineMetricRow {
    templateMetricId: string;
    metricName?: string;
    monthlyAchieved?: number | null;
    comment?: string | null;
}

interface InlineReportPayload {
    id: string;
    sections?: Array<{
        sectionName?: string;
        metrics?: InlineMetricRow[];
    }>;
}

function UsherInlineForm() {
    const router = useRouter();
    const { user } = useAuth();
    const { data: assignments } = useApiData<AssignmentInline[]>(
        `${API_ROUTES.formAssignments.list}?scope=me&status=active`,
    );
    const active = useMemo(
        () =>
            (assignments ?? []).filter((a) => !a.completedAt && !a.cancelledAt),
        [assignments],
    );
    const next = active[0];
    const { data: report } = useApiData<InlineReportPayload>(
        next ? API_ROUTES.reports.detail(next.reportId) : null,
    );

    const visibleMetrics = useMemo(() => {
        if (!next || !report) return [];
        const allowed = new Set(next.metricIds);
        const out: Array<{ templateMetricId: string; metricName: string; sectionName: string }> = [];
        for (const sec of report.sections ?? []) {
            for (const m of sec.metrics ?? []) {
                if (!allowed.has(m.templateMetricId)) continue;
                out.push({
                    templateMetricId: m.templateMetricId,
                    metricName: m.metricName ?? "Metric",
                    sectionName: sec.sectionName ?? "",
                });
            }
        }
        return out;
    }, [next, report]);

    const todayLabel = useMemo(() => new Date().toLocaleDateString(), []);

    if (!user) return null;
    if (!assignments) {
        return (
            <Card title="Quick form">
                <LoadingSkeleton rows={2} />
            </Card>
        );
    }
    if (!next) {
        return (
            <Card title="Quick form" href={APP_ROUTES.quickForm}>
                <p className="text-sm text-ds-text-subtle">No active assignments. Check back later.</p>
            </Card>
        );
    }
    return (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ds-text-subtle">
                    Your next assignment
                </p>
                <span className="text-xs text-ds-text-subtle">{todayLabel}</span>
            </div>
            <p className="text-sm text-ds-text-primary">
                {visibleMetrics.length} metric{visibleMetrics.length === 1 ? "" : "s"} assigned
                {next.dueAt ? ` · due ${new Date(next.dueAt).toLocaleDateString()}` : ""}
            </p>
            <ul className="text-xs text-ds-text-subtle space-y-1">
                {visibleMetrics.slice(0, 4).map((m) => (
                    <li key={m.templateMetricId}>
                        {m.sectionName ? `${m.sectionName} · ` : ""}{m.metricName}
                    </li>
                ))}
                {visibleMetrics.length > 4 && (
                    <li>+ {visibleMetrics.length - 4} more</li>
                )}
            </ul>
            <div className="flex gap-2">
                <Button type="primary" onClick={() => router.push(APP_ROUTES.quickFormFill(next.id))}>
                    Open form
                </Button>
                {active.length > 1 && (
                    <Button onClick={() => router.push(APP_ROUTES.quickForm)}>
                        See all ({active.length})
                    </Button>
                )}
            </div>
        </div>
    );
}

const usherQuickFormWidget: DashboardWidget = {
    id: "usher-quick-form",
    title: "Quick form",
    render: () => <UsherInlineForm />,
};

const adminQuickLinksWidget: DashboardWidget = {
    id: "admin-quick-links",
    title: "Quick links",
    render: () => (
        <Card title="Quick links" href={APP_ROUTES.adminConfig}>
            <ul className="space-y-1 text-sm">
                <li>
                    <a className="text-ds-brand-accent hover:underline" href={APP_ROUTES.adminConfig}>
                        Admin config
                    </a>
                </li>
                <li>
                    <a className="text-ds-brand-accent hover:underline" href={APP_ROUTES.imports}>
                        {(CONTENT.nav as Record<string, string>).imports ?? "Imports"}
                    </a>
                </li>
                <li>
                    <a className="text-ds-brand-accent hover:underline" href={APP_ROUTES.invitesBulk}>
                        {(CONTENT.nav as Record<string, string>).bulkInvites ?? "Bulk invites"}
                    </a>
                </li>
            </ul>
        </Card>
    ),
};

/* ── Registry ──────────────────────────────────────────────────────────── */

const REGISTRY: Record<string, DashboardWidget> = {
    [groupPerformanceWidget.id]: groupPerformanceWidget,
    [topCampusWidget.id]: topCampusWidget,
    [orgComplianceWidget.id]: orgComplianceWidget,
    [recentSubmissionsWidget.id]: recentSubmissionsWidget,
    [pendingReviewQueueWidget.id]: pendingReviewQueueWidget,
    [adminQuickLinksWidget.id]: adminQuickLinksWidget,
    [topCampusChartWidget.id]: topCampusChartWidget,
    [metricTrendSparkWidget.id]: metricTrendSparkWidget,
    [insightSummaryWidget.id]: insightSummaryWidget,
    [usherQuickFormWidget.id]: usherQuickFormWidget,
};

export function getWidget(id: string): DashboardWidget | undefined {
    return REGISTRY[id];
}

/* ── Default layout per role-band ──────────────────────────────────────── */

export const DEFAULT_LAYOUT: Record<string, string[]> = {
    "scope-overview-global": [
        "insight-summary",
        "org-compliance",
        "top-campus",
        "top-campus-chart",
        "metric-trend-spark",
        "group-performance",
        "pending-review-queue",
        "recent-submissions",
        "admin-quick-links",
    ],
    "scope-overview-group": [
        "insight-summary",
        "top-campus",
        "top-campus-chart",
        "metric-trend-spark",
        "pending-review-queue",
        "recent-submissions",
    ],
    "scope-overview-campus": [
        "insight-summary",
        "metric-trend-spark",
        "org-compliance",
        "recent-submissions",
        "pending-review-queue",
    ],
    "quick-form-self": [
        "usher-quick-form",
        "recent-submissions",
    ],
};

export interface ResolvedLayout {
    widgets: DashboardWidget[];
    bandKey: string;
}

export function resolveLayout(
    scope: "own" | "campus" | "group" | "all",
    layoutOverride?: Record<string, string[]>,
    mode?: string,
): ResolvedLayout {
    const bandKey = mode === "quick-form"
        ? "quick-form-self"
        : scope === "all" ? "scope-overview-global"
        : scope === "group" ? "scope-overview-group"
        : "scope-overview-campus";
    const ids = (layoutOverride?.[bandKey] ?? DEFAULT_LAYOUT[bandKey] ?? []).slice();
    const widgets = ids.map((id) => REGISTRY[id]).filter((w): w is DashboardWidget => Boolean(w));
    return { widgets, bandKey };
}

/* ── Panel grid ────────────────────────────────────────────────────────── */

export function ScopeOverviewGrid({
    ctx,
    layoutOverride,
    isLoading,
    mode,
}: {
    ctx: WidgetContext;
    layoutOverride?: Record<string, string[]>;
    isLoading?: boolean;
    mode?: string;
}) {
    const layout = useMemo(
        () => resolveLayout(ctx.scope, layoutOverride, mode),
        [ctx.scope, layoutOverride, mode],
    );
    if (isLoading) return <LoadingSkeleton rows={4} />;
    if (layout.widgets.length === 0) {
        return (
            <p className="text-sm text-ds-text-subtle">
                No widgets configured for this role. Edit dashboardLayout in Admin Config to add widgets.
            </p>
        );
    }
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {layout.widgets.map((w) => (
                <div key={w.id}>{w.render(ctx)}</div>
            ))}
        </div>
    );
}

/* ── Hook to load context ──────────────────────────────────────────────── */

export function useScopeOverviewContext(scope: "own" | "campus" | "group" | "all", user: AuthUser | null): {
    ctx: WidgetContext | null;
    isLoading: boolean;
} {
    const reportsUrl =
        !user
            ? null
            : scope === "campus" && user.campusId
            ? `${API_ROUTES.reports.list}?all=true&campusId=${user.campusId}`
            : scope === "group" && user.orgGroupId
            ? `${API_ROUTES.reports.list}?all=true&groupId=${user.orgGroupId}`
            : `${API_ROUTES.reports.list}?all=true`;
    const { data: reportsPage } = useApiData<{ reports: Report[]; total: number }>(reportsUrl);
    const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
    const { data: orgGroups } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);
    const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

    const isLoading =
        !user || reportsPage === undefined || campuses === undefined || orgGroups === undefined || templates === undefined;

    const ctx: WidgetContext | null = useMemo(() => {
        if (isLoading || !reportsPage) return null;
        return {
            reports: reportsPage.reports ?? [],
            campuses: campuses ?? [],
            orgGroups: orgGroups ?? [],
            templates: templates ?? [],
            scope,
        };
    }, [isLoading, reportsPage, campuses, orgGroups, templates, scope]);

    return { ctx, isLoading };
}
