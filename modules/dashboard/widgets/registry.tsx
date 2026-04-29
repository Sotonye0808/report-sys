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
import { useMemo } from "react";
import { useApiData } from "@/lib/hooks/useApiData";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { ReportStatus } from "@/types/global";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useRouter } from "next/navigation";

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
};

export function getWidget(id: string): DashboardWidget | undefined {
    return REGISTRY[id];
}

/* ── Default layout per role-band ──────────────────────────────────────── */

export const DEFAULT_LAYOUT: Record<string, string[]> = {
    "scope-overview-global": [
        "org-compliance",
        "top-campus",
        "group-performance",
        "pending-review-queue",
        "recent-submissions",
        "admin-quick-links",
    ],
    "scope-overview-group": [
        "top-campus",
        "pending-review-queue",
        "recent-submissions",
    ],
    "scope-overview-campus": [
        "org-compliance",
        "recent-submissions",
        "pending-review-queue",
    ],
};

export interface ResolvedLayout {
    widgets: DashboardWidget[];
    bandKey: string;
}

export function resolveLayout(
    scope: "own" | "campus" | "group" | "all",
    layoutOverride?: Record<string, string[]>,
): ResolvedLayout {
    const bandKey =
        scope === "all" ? "scope-overview-global"
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
}: {
    ctx: WidgetContext;
    layoutOverride?: Record<string, string[]>;
    isLoading?: boolean;
}) {
    const layout = useMemo(() => resolveLayout(ctx.scope, layoutOverride), [ctx.scope, layoutOverride]);
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
