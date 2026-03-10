"use client";

/**
 * modules/reports/components/ExportDialog.tsx
 *
 * Modal dialog for exporting reports with options:
 *  - Scope: all filtered | selected only
 *  - Grouping: none | campus | month | quarter
 *  - Content: metrics | goals | comments
 *  - Format: single sheet | one sheet per campus
 */

import { useState } from "react";
import { Modal, Checkbox, Radio, Select, Divider } from "antd";
import { CONTENT } from "@/config/content";
import {
    exportReportsWithOptions,
    type ExportGrouping,
    type ExportFormat,
} from "@/lib/utils/exportReports";

const ec = (CONTENT.reports as Record<string, unknown>).export as Record<string, string>;

/* ── Types ─────────────────────────────────────────────────────────────── */

interface ExportDialogProps {
    open: boolean;
    onClose: () => void;
    /** All currently-filtered reports (the "all" scope) */
    reports: Report[];
    /** Subset selected by the user in the table (may be length 0) */
    selectedReports?: Report[];
    templates: ReportTemplate[];
    campuses: Campus[];
    sections?: ReportSection[];
    metrics?: ReportMetric[];
}

/* ── Grouping options ───────────────────────────────────────────────────── */

const GROUPING_OPTIONS: { value: ExportGrouping; label: string }[] = [
    { value: "none", label: ec.groupingNone },
    { value: "campus", label: ec.groupingCampus },
    { value: "month", label: ec.groupingMonth },
    { value: "quarter", label: ec.groupingQuarter },
];

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
    { value: "single", label: ec.formatSingleSheet },
    { value: "per-campus", label: ec.formatMultiSheet },
];

/* ── ExportDialog ───────────────────────────────────────────────────────── */

export function ExportDialog({
    open,
    onClose,
    reports,
    selectedReports = [],
    templates,
    campuses,
    sections = [],
    metrics = [],
}: ExportDialogProps) {
    const [scope, setScope] = useState<"all" | "selected">(
        selectedReports.length > 0 ? "selected" : "all",
    );
    const [grouping, setGrouping] = useState<ExportGrouping>("none");
    const [includeMetrics, setIncludeMetrics] = useState(true);
    const [includeGoals, setIncludeGoals] = useState(true);
    const [includeComments, setIncludeComments] = useState(false);
    const [format, setFormat] = useState<ExportFormat>("single");
    const [loading, setLoading] = useState(false);

    const hasSelected = selectedReports.length > 0;
    const targetReports = scope === "selected" && hasSelected ? selectedReports : reports;

    function handleExport() {
        setLoading(true);
        try {
            exportReportsWithOptions({
                reports: targetReports,
                templates,
                campuses,
                grouping,
                includeMetrics,
                includeGoals,
                includeComments,
                format,
                sections,
                metrics,
            });
        } finally {
            setLoading(false);
            onClose();
        }
    }

    return (
        <Modal
            open={open}
            title={ec.dialogTitle}
            onCancel={onClose}
            onOk={handleExport}
            okText={ec.exportButtonLabel}
            cancelText={ec.cancelButtonLabel}
            confirmLoading={loading}
            width={480}
            destroyOnClose
        >
            <div className="space-y-5 py-2">
                {/* Scope */}
                <div>
                    <p className="text-sm font-medium text-ds-text-secondary mb-2">{ec.scopeLabel}</p>
                    <Radio.Group
                        value={scope}
                        onChange={(e) => setScope(e.target.value as typeof scope)}
                        className="flex flex-col gap-1"
                    >
                        <Radio value="all">
                            {ec.scopeAll}{" "}
                            <span className="text-xs text-ds-text-subtle">({reports.length})</span>
                        </Radio>
                        <Radio value="selected" disabled={!hasSelected}>
                            {ec.scopeSelected}{" "}
                            <span className="text-xs text-ds-text-subtle">({selectedReports.length})</span>
                        </Radio>
                    </Radio.Group>
                </div>

                <Divider className="!my-0" />

                {/* Grouping */}
                <div>
                    <p className="text-sm font-medium text-ds-text-secondary mb-2">{ec.groupingLabel}</p>
                    <Select
                        value={grouping}
                        options={GROUPING_OPTIONS}
                        onChange={(v) => setGrouping(v as ExportGrouping)}
                        style={{ width: "100%" }}
                        size="middle"
                    />
                </div>

                {/* Format */}
                <div>
                    <p className="text-sm font-medium text-ds-text-secondary mb-2">{ec.formatLabel}</p>
                    <Radio.Group
                        value={format}
                        onChange={(e) => setFormat(e.target.value as typeof format)}
                        className="flex flex-col gap-1"
                    >
                        {FORMAT_OPTIONS.map((opt) => (
                            <Radio key={opt.value} value={opt.value}>
                                {opt.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                </div>

                <Divider className="!my-0" />

                {/* Content */}
                <div>
                    <p className="text-sm font-medium text-ds-text-secondary mb-2">{ec.contentLabel}</p>
                    <div className="flex flex-col gap-2">
                        <Checkbox
                            checked={includeMetrics}
                            onChange={(e) => setIncludeMetrics(e.target.checked)}
                        >
                            {ec.contentMetrics}
                        </Checkbox>
                        <Checkbox
                            checked={includeGoals}
                            onChange={(e) => setIncludeGoals(e.target.checked)}
                        >
                            {ec.contentGoals}
                        </Checkbox>
                        <Checkbox
                            checked={includeComments}
                            onChange={(e) => setIncludeComments(e.target.checked)}
                        >
                            {ec.contentComments}
                        </Checkbox>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
