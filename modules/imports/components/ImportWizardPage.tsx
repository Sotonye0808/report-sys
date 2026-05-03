"use client";

/**
 * modules/imports/components/ImportWizardPage.tsx
 *
 * Stepper wizard: Upload → Map columns → Preview → Commit.
 * - Upload sends raw CSV body to /api/imports/[id]/file.
 * - Mapping wires CSV columns to template metric IDs.
 * - Preview shows per-row outcome from /validate (no DB write yet).
 * - Commit calls /commit which chunks updates atomically per chunk.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Steps, Select, Table, Tag, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import { useApiData } from "@/lib/hooks/useApiData";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const COPY = (CONTENT.imports ?? {}) as Record<string, unknown>;
const COPY_STEPS = (COPY.steps ?? {}) as Record<string, string>;
const COPY_ACTIONS = (COPY.actions ?? {}) as Record<string, string>;
const COPY_TOASTS = (COPY.toasts ?? {}) as Record<string, string>;
const COPY_OUTCOMES = (COPY.outcomeLabels ?? {}) as Record<string, string>;

interface ColumnMapping {
    index: number;
    header: string;
    target: string;
}

interface PreviewRow {
    rowIndex: number;
    raw: Record<string, string>;
    normalized: Record<string, unknown>;
    outcome: "OK" | "WARNING" | "ERROR" | "COMMITTED";
    errors: string[];
}

interface JobDetail {
    id: string;
    status: string;
    fileName?: string | null;
    mapping?: { columns: ColumnMapping[]; templateId?: string } | null;
    validationSummary?: { total: number; ok: number; warning: number; error: number } | null;
    commitSummary?: { committed: number; failed: number } | null;
}

const STEP_INDEX: Record<string, number> = {
    DRAFT: 0,
    FILE_UPLOADED: 1,
    MAPPED: 2,
    VALIDATED: 2,
    COMMITTED: 3,
    FAILED: 3,
    CANCELLED: 0,
};

export function ImportWizardPage({ jobId: initialJobId }: { jobId?: string }) {
    const router = useRouter();
    const [jobId, setJobId] = useState<string | undefined>(initialJobId);
    const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
    const [sample, setSample] = useState<string[][]>([]);
    const [columnsMapping, setColumnsMapping] = useState<ColumnMapping[]>([]);
    const [preview, setPreview] = useState<PreviewRow[] | null>(null);
    const [busy, setBusy] = useState(false);

    const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

    /* Load job detail + sample when jobId is set */
    useEffect(() => {
        if (!jobId) return;
        void (async () => {
            const detailRes = await fetch(API_ROUTES.imports.detail(jobId), { cache: "no-store" });
            const detailJson = (await detailRes.json()) as { success: boolean; data?: JobDetail };
            if (detailJson.success && detailJson.data) setJobDetail(detailJson.data);

            const mapRes = await fetch(API_ROUTES.imports.mapping(jobId), { cache: "no-store" });
            const mapJson = (await mapRes.json()) as {
                success: boolean;
                data?: { mapping?: { columns: ColumnMapping[] } | null; sample: string[][] };
            };
            if (mapJson.success && mapJson.data) {
                setSample(mapJson.data.sample ?? []);
                if (mapJson.data.mapping?.columns) setColumnsMapping(mapJson.data.mapping.columns);
                else if ((mapJson.data.sample ?? []).length > 0) {
                    const header = mapJson.data.sample[0];
                    setColumnsMapping(
                        header.map((h, i) => ({ index: i, header: h, target: "skip" })),
                    );
                }
            }
        })();
    }, [jobId, jobDetail?.status]);

    const ensureJob = async () => {
        if (jobId) return jobId;
        const res = await fetch(API_ROUTES.imports.list, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const json = (await res.json()) as { success: boolean; data?: { id: string }; error?: string };
        if (!res.ok || !json.success || !json.data) {
            message.error(json.error ?? "Could not create import job");
            return null;
        }
        setJobId(json.data.id);
        return json.data.id;
    };

    const handleUpload = async (file: File): Promise<boolean> => {
        const id = await ensureJob();
        if (!id) return false;
        setBusy(true);
        try {
            const text = await file.text();
            const res = await fetch(API_ROUTES.imports.file(id), {
                method: "PUT",
                headers: { "Content-Type": "text/csv", "x-import-filename": file.name },
                body: text,
            });
            const json = (await res.json()) as { success: boolean; error?: string };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Upload failed");
                return false;
            }
            message.success(COPY_TOASTS.jobCreated ?? "File uploaded");
            // refresh job detail (re-trigger effect by toggling sample)
            const mapRes = await fetch(API_ROUTES.imports.mapping(id), { cache: "no-store" });
            const mapJson = (await mapRes.json()) as {
                success: boolean;
                data?: { sample: string[][] };
            };
            if (mapJson.success && mapJson.data) {
                setSample(mapJson.data.sample ?? []);
                if ((mapJson.data.sample ?? []).length > 0) {
                    const header = mapJson.data.sample[0];
                    setColumnsMapping(
                        header.map((h, i) => ({ index: i, header: h, target: "skip" })),
                    );
                }
            }
            const detailRes = await fetch(API_ROUTES.imports.detail(id), { cache: "no-store" });
            const detailJson = (await detailRes.json()) as { success: boolean; data?: JobDetail };
            if (detailJson.success && detailJson.data) setJobDetail(detailJson.data);
            return true;
        } finally {
            setBusy(false);
        }
    };

    const saveMapping = async () => {
        if (!jobId) return;
        setBusy(true);
        try {
            const res = await fetch(API_ROUTES.imports.mapping(jobId), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ columns: columnsMapping }),
            });
            const json = (await res.json()) as { success: boolean; error?: string; data?: JobDetail };
            if (!res.ok || !json.success) {
                message.error(json.error ?? "Mapping save failed");
                return;
            }
            message.success(COPY_TOASTS.mappingSaved ?? "Mapping saved");
            if (json.data) setJobDetail(json.data);
        } finally {
            setBusy(false);
        }
    };

    const runValidate = async () => {
        if (!jobId) return;
        setBusy(true);
        try {
            const res = await fetch(API_ROUTES.imports.validate(jobId), { method: "POST" });
            const json = (await res.json()) as {
                success: boolean;
                data?: { preview: PreviewRow[]; summary: JobDetail["validationSummary"] };
                error?: string;
            };
            if (!res.ok || !json.success || !json.data) {
                message.error(json.error ?? "Validate failed");
                return;
            }
            setPreview(json.data.preview);
            setJobDetail((prev) => (prev ? { ...prev, status: "VALIDATED", validationSummary: json.data!.summary } : prev));
            message.success(COPY_TOASTS.validated ?? "Validated");
        } finally {
            setBusy(false);
        }
    };

    const runCommit = async () => {
        if (!jobId) return;
        setBusy(true);
        try {
            const res = await fetch(API_ROUTES.imports.commit(jobId), { method: "POST" });
            const json = (await res.json()) as {
                success: boolean;
                data?: { committed: number; failed: number };
                error?: string;
            };
            if (!res.ok || !json.success || !json.data) {
                message.error(json.error ?? "Commit failed");
                return;
            }
            message.success(`${json.data.committed} committed · ${json.data.failed} failed`);
            setJobDetail((prev) =>
                prev
                    ? { ...prev, status: json.data!.committed > 0 ? "COMMITTED" : "FAILED", commitSummary: json.data ?? null }
                    : prev,
            );
        } finally {
            setBusy(false);
        }
    };

    // Grouped options keep the picker scannable: System | Template → Section → Metric.
    const metricOptions = useMemo(() => {
        type Group = { label: string; options: Array<{ value: string; label: string }> };
        const groups: Group[] = [
            {
                label: "System",
                options: [
                    { value: "skip", label: "Skip" },
                    { value: "campusId", label: "Campus ID" },
                    { value: "period", label: "Report period" },
                ],
            },
        ];
        for (const t of templates ?? []) {
            for (const sec of t.sections ?? []) {
                if ((sec.metrics ?? []).length === 0) continue;
                groups.push({
                    label: `${t.name} → ${sec.name}`,
                    options: (sec.metrics ?? []).map((m) => ({ value: m.id, label: m.name })),
                });
            }
        }
        return groups;
    }, [templates]);

    const stepIndex = STEP_INDEX[jobDetail?.status ?? "DRAFT"] ?? 0;

    return (
        <PageLayout>
            <PageHeader title={String(COPY.pageTitle ?? "Imports")} subtitle={String(COPY.subtitle ?? "")} />
            <Steps
                current={stepIndex}
                items={[
                    { title: COPY_STEPS.upload ?? "Upload" },
                    { title: COPY_STEPS.map ?? "Map columns" },
                    { title: COPY_STEPS.preview ?? "Preview" },
                    { title: COPY_STEPS.commit ?? "Commit" },
                ]}
                className="mb-6"
            />
            {!jobId || stepIndex === 0 ? (
                <Upload.Dragger
                    accept=".csv,text/csv"
                    multiple={false}
                    showUploadList={false}
                    disabled={busy}
                    beforeUpload={(file) => {
                        void handleUpload(file as File);
                        return false;
                    }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="text-sm text-ds-text-secondary">
                        {COPY_ACTIONS.uploadFile ?? "Click or drag a CSV file"}
                    </p>
                </Upload.Dragger>
            ) : null}

            {jobId && stepIndex >= 1 && (
                <div className="flex flex-col gap-3 mt-4">
                    <h2 className="text-base font-semibold text-ds-text-primary">{COPY_STEPS.map ?? "Map columns"}</h2>
                    <Table
                        rowKey={(r) => `${r.index}-${r.header}`}
                        dataSource={columnsMapping}
                        pagination={false}
                        size="small"
                        columns={[
                            { title: "#", dataIndex: "index", width: 80 },
                            { title: "Header", dataIndex: "header" },
                            {
                                title: "Target",
                                dataIndex: "target",
                                render: (_v, r) => (
                                    <Select
                                        value={r.target}
                                        options={metricOptions}
                                        onChange={(v) =>
                                            setColumnsMapping((prev) =>
                                                prev.map((m) => (m.index === r.index ? { ...m, target: v } : m)),
                                            )
                                        }
                                        style={{ minWidth: 320 }}
                                        showSearch
                                        optionFilterProp="label"
                                    />
                                ),
                            },
                        ]}
                    />
                    <p className="text-xs text-ds-text-subtle">Sample (first 5 rows):</p>
                    <Table
                        rowKey={(_r, idx) => String(idx)}
                        dataSource={sample.slice(1, 6).map((row, idx) => ({
                            __idx: idx,
                            ...Object.fromEntries(row.map((c, i) => [`c${i}`, c])),
                        })) as unknown as Record<string, unknown>[]}
                        size="small"
                        pagination={false}
                        columns={(sample[0] ?? []).map((h, i) => ({
                            title: h,
                            dataIndex: `c${i}`,
                            ellipsis: true,
                        }))}
                    />
                    <div className="flex gap-2">
                        <Button onClick={saveMapping} loading={busy}>
                            Save mapping
                        </Button>
                        {stepIndex >= 2 && (
                            <Button onClick={runValidate} loading={busy}>
                                {COPY_ACTIONS.validate ?? "Validate"}
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {preview && (
                <div className="mt-6">
                    <h2 className="text-base font-semibold text-ds-text-primary mb-2">Preview</h2>
                    <Table
                        rowKey={(r) => String(r.rowIndex)}
                        dataSource={preview}
                        size="small"
                        pagination={{ pageSize: 25 }}
                        columns={[
                            { title: "Row", dataIndex: "rowIndex", width: 80 },
                            {
                                title: "Outcome",
                                dataIndex: "outcome",
                                render: (v: string) => (
                                    <Tag color={v === "OK" ? "green" : v === "WARNING" ? "orange" : v === "COMMITTED" ? "blue" : "red"}>
                                        {COPY_OUTCOMES[v] ?? v}
                                    </Tag>
                                ),
                            },
                            {
                                title: "Errors",
                                dataIndex: "errors",
                                render: (errs: string[]) =>
                                    errs?.length ? errs.join("; ") : <span className="text-ds-text-subtle">—</span>,
                            },
                        ]}
                    />
                    <div className="mt-3 flex gap-2">
                        <Button type="primary" onClick={runCommit} loading={busy}>
                            {COPY_ACTIONS.commit ?? "Commit import"}
                        </Button>
                        <Button onClick={() => router.push(APP_ROUTES.imports)}>
                            {COPY_ACTIONS.cancel ?? "Cancel"}
                        </Button>
                    </div>
                </div>
            )}

            {jobDetail?.commitSummary && (
                <div className="mt-6 p-4 border border-ds-border-base rounded-ds-2xl bg-ds-surface-elevated">
                    <p className="text-sm text-ds-text-secondary">
                        Committed {jobDetail.commitSummary.committed} rows · {jobDetail.commitSummary.failed} failed
                    </p>
                </div>
            )}
        </PageLayout>
    );
}

export default ImportWizardPage;
