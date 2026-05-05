"use client";

/**
 * modules/quick-form/components/QuickFormLandingPage.tsx
 *
 * Lists the current user's active form assignments.
 * Designed for USHER / DATA_ENTRY: minimal columns, large hit targets,
 * and direct navigation to the fill page.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Empty } from "antd";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/providers/AuthProvider";
import { CAMPUS_SCOPED_ROLES, GROUP_SCOPED_ROLES } from "@/config/hierarchy";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const COPY = (CONTENT.quickForm ?? {}) as Record<string, unknown>;
const COPY_STATUS = (COPY.statusLabels ?? {}) as Record<string, string>;
const COPY_EMPTY = (COPY.emptyState ?? {}) as Record<string, string>;
const COPY_ACTIONS = (COPY.actions ?? {}) as Record<string, string>;

interface AssignmentRow {
    id: string;
    reportId: string;
    metricIds: string[];
    dueAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
}

function statusOf(row: AssignmentRow): string {
    if (row.cancelledAt) return "cancelled";
    if (row.completedAt) return "completed";
    if (row.dueAt && new Date(row.dueAt).getTime() < Date.now()) return "overdue";
    return "active";
}

export function QuickFormLandingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [materialised, setMaterialised] = useState(false);

    // Detect "previewing a scoped role without a target user" — the materialiser
    // can't run because there's no campus context, and the empty list is misleading.
    const previewWithoutCampus = (() => {
        if (!user?.impersonation) return false;
        const role = user.role;
        const isScoped = CAMPUS_SCOPED_ROLES.includes(role) || GROUP_SCOPED_ROLES.includes(role);
        if (!isScoped) return false;
        if (user.campusId || user.orgGroupId) return false;
        return true;
    })();

    // Idempotently expand recurring assignment rules into per-period rows
    // before listing assignments. Failure here is non-blocking — if the
    // backend is offline the existing list still renders.
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                await fetch(API_ROUTES.formAssignments.materialise, { method: "POST" });
            } catch {
                // ignore — list query below still runs
            } finally {
                if (!cancelled) setMaterialised(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const { data, loading } = useApiData<AssignmentRow[]>(
        materialised ? `${API_ROUTES.formAssignments.list}?scope=me` : null,
    );
    const rows = useMemo(() => data ?? [], [data]);

    if (loading || !materialised) {
        return (
            <PageLayout>
                <PageHeader title={String(COPY.pageTitle ?? "My Assignments")} subtitle={String(COPY.subtitle ?? "")} />
                <LoadingSkeleton rows={5} />
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageHeader title={String(COPY.pageTitle ?? "My Assignments")} subtitle={String(COPY.subtitle ?? "")} />
            {previewWithoutCampus && (
                <div
                    role="region"
                    aria-label="Impersonation context warning"
                    className="mb-3 px-4 py-3 rounded-ds-2xl border border-amber-400/60 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-900 dark:text-amber-100"
                >
                    {((CONTENT.impersonation as unknown) as Record<string, string>)?.previewNoCampusBanner ??
                        "You're previewing a scoped role without a target user, so there's no campus context. Exit the preview and start over with a target user picked."}
                </div>
            )}
            {rows.length === 0 ? (
                <Empty
                    description={
                        <div>
                            <p className="text-sm font-semibold text-ds-text-primary">
                                {COPY_EMPTY.title ?? "No active assignments"}
                            </p>
                            <p className="text-xs text-ds-text-subtle">{COPY_EMPTY.description ?? ""}</p>
                        </div>
                    }
                />
            ) : (
                <ul className="grid gap-3">
                    {rows.map((r) => {
                        const status = statusOf(r);
                        return (
                            <li key={r.id}>
                                <button
                                    type="button"
                                    onClick={() => router.push(APP_ROUTES.quickFormFill(r.id))}
                                    className="w-full text-left p-4 bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl hover:shadow-ds-md transition-shadow flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-ds-text-primary">
                                            {r.metricIds.length} metric{r.metricIds.length === 1 ? "" : "s"} assigned
                                        </p>
                                        {r.dueAt && (
                                            <p className="text-xs text-ds-text-subtle">
                                                Due {new Date(r.dueAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <Tag
                                        color={
                                            status === "active"
                                                ? "green"
                                                : status === "overdue"
                                                ? "orange"
                                                : status === "completed"
                                                ? "default"
                                                : "red"
                                        }
                                    >
                                        {COPY_STATUS[status] ?? status}
                                    </Tag>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </PageLayout>
    );
}

export default QuickFormLandingPage;
