"use client";

/**
 * modules/quick-form/components/QuickFormFillPage.tsx
 *
 * Single-assignment fill surface. Shows ONLY the metrics in the assignment's
 * subset. Goals are hidden by design — assignees enter monthlyAchieved values
 * (and optional comments) only. Autosaves every 30s; explicit Submit marks
 * the assignment complete server-side.
 *
 * The server is the source of truth for which metrics are allowed; the client
 * here is a slim renderer.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, InputNumber, Input, message } from "antd";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import { useApiData } from "@/lib/hooks/useApiData";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const COPY = (CONTENT.quickForm ?? {}) as Record<string, unknown>;
const COPY_ACTIONS = (COPY.actions ?? {}) as Record<string, string>;
const COPY_AUTOSAVE = (COPY.autosave ?? {}) as Record<string, string>;

interface AssignmentRow {
    id: string;
    reportId: string;
    metricIds: string[];
    completedAt?: string | null;
    cancelledAt?: string | null;
}

interface ReportPayload {
    id: string;
    sections?: Array<{
        templateSectionId: string;
        sectionName?: string;
        metrics?: Array<{
            id: string;
            templateMetricId: string;
            metricName?: string;
            monthlyAchieved?: number | null;
            comment?: string | null;
        }>;
    }>;
}

interface ValueRow {
    templateMetricId: string;
    monthlyAchieved?: number | null;
    comment?: string | null;
}

export function QuickFormFillPage({ assignmentId }: { assignmentId: string }) {
    const router = useRouter();
    const { data: assignment, loading: isLoading } = useApiData<AssignmentRow>(
        API_ROUTES.formAssignments.detail(assignmentId),
    );
    const { data: report } = useApiData<ReportPayload>(
        assignment ? API_ROUTES.reports.detail(assignment.reportId) : null,
    );

    const [values, setValues] = useState<Record<string, ValueRow>>({});
    const [autosaveLabel, setAutosaveLabel] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const lastSubmittedRef = useRef<string>("");

    // Filter the report's metrics down to the assigned subset.
    const visibleMetrics = useMemo(() => {
        if (!assignment || !report) return [];
        const allowed = new Set(assignment.metricIds);
        const out: Array<{ templateMetricId: string; metricName: string; sectionName: string; current: ValueRow }> = [];
        for (const sec of report.sections ?? []) {
            for (const rm of sec.metrics ?? []) {
                if (!allowed.has(rm.templateMetricId)) continue;
                out.push({
                    templateMetricId: rm.templateMetricId,
                    metricName: rm.metricName ?? "Metric",
                    sectionName: sec.sectionName ?? "",
                    current: {
                        templateMetricId: rm.templateMetricId,
                        monthlyAchieved: rm.monthlyAchieved ?? null,
                        comment: rm.comment ?? null,
                    },
                });
            }
        }
        return out;
    }, [assignment, report]);

    // Initialise values from the report state.
    useEffect(() => {
        if (visibleMetrics.length === 0) return;
        setValues((prev) => {
            const seeded: Record<string, ValueRow> = { ...prev };
            for (const m of visibleMetrics) {
                if (!seeded[m.templateMetricId]) seeded[m.templateMetricId] = { ...m.current };
            }
            return seeded;
        });
    }, [visibleMetrics.length]);

    const submitValues = async (submit: boolean): Promise<boolean> => {
        const payload = {
            metrics: Object.values(values).filter(
                (v) => v.monthlyAchieved != null || (v.comment ?? "").trim().length > 0,
            ),
            submit,
        };
        if (payload.metrics.length === 0) return false;
        const serialised = JSON.stringify(payload);
        if (!submit && serialised === lastSubmittedRef.current) return false;
        try {
            const res = await fetch(`${API_ROUTES.formAssignments.detail(assignmentId)}/quick-fill`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: serialised,
            });
            const json = (await res.json()) as { success: boolean; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Save failed");
                setAutosaveLabel(COPY_AUTOSAVE.failed ?? "Could not save");
                return false;
            }
            lastSubmittedRef.current = serialised;
            setAutosaveLabel(COPY_AUTOSAVE.saved ?? "Saved");
            return true;
        } catch {
            setAutosaveLabel(COPY_AUTOSAVE.failed ?? "Could not save");
            return false;
        }
    };

    // Autosave every 30s when values change.
    useEffect(() => {
        if (!assignment || assignment.completedAt || assignment.cancelledAt) return;
        const id = setInterval(() => {
            setAutosaveLabel(COPY_AUTOSAVE.saving ?? "Saving…");
            void submitValues(false);
        }, 30_000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignment, values]);

    if (isLoading || !assignment) {
        return (
            <PageLayout>
                <PageHeader
                    title={String(COPY.fillTitle ?? "Quick Fill")}
                    subtitle={String(COPY.fillSubtitle ?? "")}
                />
                <LoadingSkeleton rows={5} />
            </PageLayout>
        );
    }

    if (assignment.cancelledAt) {
        return (
            <PageLayout>
                <PageHeader title="Assignment cancelled" subtitle="This assignment was cancelled by the manager." />
            </PageLayout>
        );
    }

    if (assignment.completedAt) {
        return (
            <PageLayout>
                <PageHeader title="Assignment complete" subtitle="Thanks — values were submitted." />
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageHeader
                title={String(COPY.fillTitle ?? "Quick Fill")}
                subtitle={String(COPY.fillSubtitle ?? "")}
            />
            <div className="flex flex-col gap-3 max-w-2xl">
                {visibleMetrics.length === 0 && <p className="text-sm text-ds-text-subtle">No metrics assigned.</p>}
                {visibleMetrics.map((m) => {
                    const current = values[m.templateMetricId] ?? m.current;
                    return (
                        <div
                            key={m.templateMetricId}
                            className="border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated p-4 flex flex-col gap-2"
                        >
                            <p className="text-xs uppercase tracking-wide text-ds-text-subtle">{m.sectionName}</p>
                            <p className="text-base font-semibold text-ds-text-primary">{m.metricName}</p>
                            <Form layout="vertical">
                                <Form.Item label="Value">
                                    <InputNumber
                                        size="large"
                                        style={{ width: "100%" }}
                                        value={current.monthlyAchieved ?? undefined}
                                        onChange={(v) =>
                                            setValues((prev) => ({
                                                ...prev,
                                                [m.templateMetricId]: {
                                                    ...current,
                                                    templateMetricId: m.templateMetricId,
                                                    monthlyAchieved: typeof v === "number" ? v : null,
                                                },
                                            }))
                                        }
                                    />
                                </Form.Item>
                                <Form.Item label="Comment (optional)">
                                    <Input.TextArea
                                        rows={2}
                                        value={current.comment ?? ""}
                                        onChange={(e) =>
                                            setValues((prev) => ({
                                                ...prev,
                                                [m.templateMetricId]: {
                                                    ...current,
                                                    templateMetricId: m.templateMetricId,
                                                    comment: e.target.value,
                                                },
                                            }))
                                        }
                                    />
                                </Form.Item>
                            </Form>
                        </div>
                    );
                })}
                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-ds-text-subtle">{autosaveLabel}</span>
                    <div className="flex gap-2">
                        <Button
                            onClick={async () => {
                                setAutosaveLabel(COPY_AUTOSAVE.saving ?? "Saving…");
                                const ok = await submitValues(false);
                                if (ok) message.success(COPY_AUTOSAVE.saved ?? "Saved");
                            }}
                        >
                            {COPY_ACTIONS.saveDraft ?? "Save draft"}
                        </Button>
                        <Button
                            type="primary"
                            loading={submitting}
                            onClick={async () => {
                                setSubmitting(true);
                                try {
                                    const ok = await submitValues(true);
                                    if (ok) {
                                        message.success("Submitted");
                                        router.push(APP_ROUTES.quickForm);
                                    }
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {COPY_ACTIONS.submit ?? "Submit values"}
                        </Button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

export default QuickFormFillPage;
