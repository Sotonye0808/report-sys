/**
 * lib/utils/exportReports.ts
 *
 * Client-side Excel (.xlsx) export utilities using SheetJS.
 *
 * Exported functions:
 *  - exportReportsList       — single-sheet list export
 *  - exportReportDetail      — two-sheet single-report export
 *  - exportReportsWithOptions — full-featured export driven by ExportDialogOptions
 */

import * as XLSX from "xlsx";
import { fmtDate } from "./formatDate";
import { getReportLabel, formatReportPeriod } from "./reportUtils";
import { CONTENT } from "@/config/content";

interface AggregatedMetricValue {
    templateMetricId: string;
    metricName: string;
    calculationType: string;
    monthlyGoal: number;
    monthlyAchieved: number;
    yoyGoal: number;
    sourceCount: number;
    selectedFromReportId?: string;
}

interface AggregatedSourceReport extends Report {
    sections?: (ReportSection & { metrics?: ReportMetric[] })[];
}

interface ExportAggregatedReportOptions {
    includeGroupedSourceSheet?: boolean;
    orgGroups?: OrgGroupWithDetails[];
}

const ec = (CONTENT.reports as Record<string, unknown>).export as Record<string, string>;
const DEFAULT_GROUP_NAME = "Ungrouped";

/* ── helpers ────────────────────────────────────────────────────────────── */

function pct(achieved?: number, goal?: number): string {
    if (achieved == null || goal == null || goal === 0) return "";
    return `${Math.round((achieved / goal) * 100)}%`;
}

function safeStr(v: unknown): string {
    return v == null ? "" : String(v);
}

/* ── ExportDialogOptions ────────────────────────────────────────────────── */

export type ExportGrouping = "none" | "campus" | "month" | "quarter";
export type ExportFormat = "single" | "per-campus";

export interface ExportDialogOptions {
    /** Which reports to export — already filtered by caller */
    reports: Report[];
    templates: ReportTemplate[];
    campuses: Campus[];
    grouping: ExportGrouping;
    includeMetrics: boolean;
    includeGoals: boolean;
    includeComments: boolean;
    format: ExportFormat;
    /** Optional per-report sections/metrics for metric export */
    sections?: ReportSection[];
    metrics?: ReportMetric[];
}

/* ── exportReportsList ──────────────────────────────────────────────────── */

/**
 * Exports the supplied (already-filtered) reports to a single-sheet workbook.
 * Columns: Title · Campus · Period · Status · Template · Deadline · Created
 */
export function exportReportsList(
    reports: Report[],
    templates: ReportTemplate[],
    campuses: Campus[],
): void {
    const campusMap = Object.fromEntries(campuses.map((c) => [c.id, c.name]));

    const header = [
        ec.colTitle,
        ec.colCampus,
        ec.colPeriod,
        ec.colStatus,
        ec.colTemplate,
        ec.colDeadline,
        ec.colCreatedAt,
    ];

    const rows = reports.map((r) => {
        const template = templates.find((t) => t.id === r.templateId);
        return [
            getReportLabel(r, templates),
            campusMap[r.campusId] ?? r.campusId,
            formatReportPeriod(r),
            (CONTENT.reports.status as Record<string, string>)?.[r.status] ?? r.status,
            template?.name ?? "",
            fmtDate(r.deadline),
            fmtDate(r.createdAt),
        ];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

    /* column widths */
    ws["!cols"] = [
        { wch: 40 }, // title
        { wch: 24 }, // campus
        { wch: 18 }, // period
        { wch: 16 }, // status
        { wch: 28 }, // template
        { wch: 14 }, // deadline
        { wch: 14 }, // created
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, ec.sheetList);

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${ec.listFilename}-${timestamp}.xlsx`);
}

/* ── exportReportDetail ─────────────────────────────────────────────────── */

/**
 * Exports a single report as a two-sheet workbook:
 *  Sheet 1 "Overview"  — key metadata fields
 *  Sheet 2 "Metrics"   — section → metric → achieved / goal / % / comment
 */
export function exportReportDetail(
    report: Report,
    sections: ReportSection[],
    metrics: ReportMetric[],
    templates: ReportTemplate[],
    campuses: Campus[],
    users: UserProfile[],
): void {
    const campusName = campuses.find((c) => c.id === report.campusId)?.name ?? report.campusId;
    const template = templates.find((t) => t.id === report.templateId);
    const submitter = users.find((u) => u.id === report.submittedById);
    const submitterName = submitter ? `${submitter.firstName} ${submitter.lastName}` : "";

    const statusLabel =
        (CONTENT.reports.status as Record<string, string>)?.[report.status] ??
        report.status;

    /* ── Sheet 1: Overview ─────────────────────────────────────────────── */

    const overviewData: [string, string][] = [
        [ec.colTitle, getReportLabel(report, templates)],
        [ec.colCampus, campusName],
        [ec.colPeriod, formatReportPeriod(report)],
        [ec.colStatus, statusLabel],
        [ec.colTemplate, template?.name ?? ""],
        [ec.colDeadline, fmtDate(report.deadline)],
        [ec.colCreatedAt, fmtDate(report.createdAt)],
        [ec.colSubmittedBy, submitterName],
        ...(report.notes ? [[ec.colNotes, safeStr(report.notes)]] as [string, string][] : []),
    ];

    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    wsOverview["!cols"] = [{ wch: 18 }, { wch: 48 }];

    /* ── Sheet 2: Metrics ──────────────────────────────────────────────── */

    const metricsHeader = [
        ec.colSection,
        ec.colMetric,
        ec.colAchieved,
        ec.colGoal,
        ec.colPercentage,
        ec.colComment,
    ];

    const metricRows: (string | number)[][] = [];

    // If saved report sections exist, use them
    if (sections.length > 0) {
        for (const section of sections) {
            const sectionMetrics = metrics.filter((m) => m.reportSectionId === section.id);
            for (const m of sectionMetrics) {
                metricRows.push([
                    section.sectionName,
                    m.metricName,
                    m.monthlyAchieved ?? "",
                    m.monthlyGoal ?? "",
                    pct(m.monthlyAchieved, m.monthlyGoal),
                    safeStr(m.comment),
                ]);
            }
        }
    } else if (template) {
        // Fall back to template structure (no values — report was never filled)
        for (const section of [...template.sections].sort((a, b) => a.order - b.order)) {
            for (const m of [...section.metrics].sort((a, b) => a.order - b.order)) {
                metricRows.push([section.name, m.name, "", "", "", ""]);
            }
        }
    }

    const wsMetrics = XLSX.utils.aoa_to_sheet([metricsHeader, ...metricRows]);
    wsMetrics["!cols"] = [
        { wch: 26 }, // section
        { wch: 32 }, // metric
        { wch: 12 }, // achieved
        { wch: 12 }, // goal
        { wch: 12 }, // %
        { wch: 40 }, // comment
    ];

    /* ── Sheet 3: Chart data (performance-by-metric) ────────────────── */
    const chartData = metricRows.map((row) => ({
        Section: row[0],
        Metric: row[1],
        Achieved: row[2],
        Goal: row[3],
        Percentage: row[4],
        Comment: row[5],
    }));
    const wsChart = XLSX.utils.json_to_sheet(chartData);

    /* ── Assemble workbook ─────────────────────────────────────────────── */

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsOverview, ec.sheetMeta);
    XLSX.utils.book_append_sheet(wb, wsMetrics, ec.sheetMetrics);
    XLSX.utils.book_append_sheet(wb, wsChart, "Chart Data");

    const safeName = getReportLabel(report, templates)
        .replace(/[/\\?*[\]]/g, "-")
        .slice(0, 50);
    XLSX.writeFile(wb, `${safeName}.xlsx`);
}

/**
 * Aggregated report export with chart-friendly sheet payloads.
 */
export function exportAggregatedReport(
    report: Report,
    aggregatedSections: { sectionName: string; metrics: AggregatedMetricValue[] }[],
    sourceReports: AggregatedSourceReport[],
    templates: ReportTemplate[],
    campuses: Campus[],
    options?: ExportAggregatedReportOptions,
): void {
    const campusName = campuses.find((c) => c.id === report.campusId)?.name ?? report.campusId;
    const template = templates.find((t) => t.id === report.templateId);
    const includeGroupedSourceSheet = options?.includeGroupedSourceSheet !== false;
    const groupNameById = new Map<string, string>(
        (options?.orgGroups ?? []).map((group) => [group.id, group.name]),
    );
    const campusNameById = new Map<string, string>(campuses.map((campus) => [campus.id, campus.name]));

    const overviewRows = [
        ["Title", report.title ?? ""],
        ["Campus", campusName],
        ["Period", report.period ?? ""],
        ["Status", report.status],
        ["Template", template?.name ?? ""],
        ["Created", fmtDate(report.createdAt)],
        ["Notes", report.notes ?? ""],
    ];

    const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
    const wsMetrics = XLSX.utils.json_to_sheet(
        aggregatedSections.flatMap((section) =>
            section.metrics.map((m) => ({
                Section: section.sectionName,
                Metric: m.metricName,
                CalculationType: m.calculationType,
                Goal: m.monthlyGoal,
                Achieved: m.monthlyAchieved,
                YoY: m.yoyGoal,
                SourceCount: m.sourceCount,
            })),
        ),
    );

    const wsSources = XLSX.utils.json_to_sheet(
        sourceReports.map((r) => ({
            id: r.id,
            title: r.title,
            campusId: r.campusId,
            period: r.period,
            status: r.status,
            updatedAt: fmtDate(r.updatedAt),
        })),
    );

    const chartData = aggregatedSections.flatMap((section) =>
        section.metrics.map((m) => ({
            section: section.sectionName,
            metric: m.metricName,
            achieved: m.monthlyAchieved,
            goal: m.monthlyGoal,
            yoy: m.yoyGoal,
        })),
    );
    const wsChart = XLSX.utils.json_to_sheet(chartData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");
    XLSX.utils.book_append_sheet(wb, wsMetrics, "Metrics");
    XLSX.utils.book_append_sheet(wb, wsSources, "Source Reports");
    XLSX.utils.book_append_sheet(wb, wsChart, "Chart Data");

    if (includeGroupedSourceSheet && sourceReports.length > 0) {
        const groupedRows: (string | number)[][] = [
            [
                "Group",
                "Campus",
                "Report",
                "Period",
                "Status",
                "Section",
                "Metric",
                "Achieved",
                "Goal",
                "YoY",
                "Calculation Type",
            ],
        ];

        const groupedReports = [...sourceReports].sort((a, b) => {
            const groupA = groupNameById.get(a.orgGroupId ?? "") ?? a.orgGroupId ?? DEFAULT_GROUP_NAME;
            const groupB = groupNameById.get(b.orgGroupId ?? "") ?? b.orgGroupId ?? DEFAULT_GROUP_NAME;
            if (groupA !== groupB) return groupA.localeCompare(groupB);

            const campusA = campusNameById.get(a.campusId) ?? a.campusId;
            const campusB = campusNameById.get(b.campusId) ?? b.campusId;
            if (campusA !== campusB) return campusA.localeCompare(campusB);
            return (a.title ?? a.id).localeCompare(b.title ?? b.id);
        });

        for (const src of groupedReports) {
            const groupName = groupNameById.get(src.orgGroupId ?? "") ?? src.orgGroupId ?? DEFAULT_GROUP_NAME;
            const srcCampusName = campusNameById.get(src.campusId) ?? src.campusId;
            const metricsByTemplateKey = new Map<string, ReportMetric>();

            for (const section of src.sections ?? []) {
                for (const metric of section.metrics ?? []) {
                    metricsByTemplateKey.set(metric.templateMetricId, metric);
                }
            }

            for (const section of aggregatedSections) {
                for (const metric of section.metrics) {
                    const matched = metricsByTemplateKey.get(metric.templateMetricId);
                    groupedRows.push([
                        groupName,
                        srcCampusName,
                        src.title ?? src.id,
                        src.period ?? "",
                        src.status,
                        section.sectionName,
                        metric.metricName,
                        matched?.monthlyAchieved ?? "",
                        matched?.monthlyGoal ?? "",
                        matched?.yoyGoal ?? "",
                        matched?.calculationType ?? metric.calculationType,
                    ]);
                }
            }
        }

        const wsGrouped = XLSX.utils.aoa_to_sheet(groupedRows);
        wsGrouped["!cols"] = [
            { wch: 24 },
            { wch: 24 },
            { wch: 34 },
            { wch: 16 },
            { wch: 16 },
            { wch: 24 },
            { wch: 28 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 16 },
        ];
        XLSX.utils.book_append_sheet(wb, wsGrouped, "Grouped Details");
    }

    const safeName = (report.title ?? "aggregated-report").replace(/[/\\?*[\]]/g, "-").slice(0, 50);
    XLSX.writeFile(wb, `${safeName}.xlsx`);
}

/* ── exportReportsWithOptions ───────────────────────────────────────────── */

/**
 * Full-featured export driven by ExportDialogOptions.
 * Supports grouping (campus / month / quarter), multi-sheet per-campus format,
 * and optional metric / goal / comment columns.
 */
export function exportReportsWithOptions(opts: ExportDialogOptions): void {
    const {
        reports,
        templates,
        campuses,
        grouping,
        includeMetrics,
        includeGoals,
        includeComments,
        format,
        sections = [],
        metrics = [],
    } = opts;

    const campusMap = Object.fromEntries(campuses.map((c) => [c.id, c.name]));
    const timestamp = new Date().toISOString().slice(0, 10);
    const wb = XLSX.utils.book_new();

    /* ── Build base columns (always included) ─────────────────────────── */

    type ColDef = { header: string; wch: number; value: (r: Report) => string | number };

    const baseCols: ColDef[] = [
        { header: ec.colTitle, wch: 40, value: (r) => getReportLabel(r, templates) },
        { header: ec.colCampus, wch: 24, value: (r) => campusMap[r.campusId] ?? r.campusId },
        { header: ec.colPeriod, wch: 18, value: (r) => formatReportPeriod(r) },
        { header: ec.colStatus, wch: 16, value: (r) => (CONTENT.reports.status as Record<string, string>)?.[r.status] ?? r.status },
        { header: ec.colTemplate, wch: 28, value: (r) => templates.find((t) => t.id === r.templateId)?.name ?? "" },
        { header: ec.colDeadline, wch: 14, value: (r) => fmtDate(r.deadline) },
        { header: ec.colCreatedAt, wch: 14, value: (r) => fmtDate(r.createdAt) },
    ];

    /* ── Determine grouping key ───────────────────────────────────────── */

    function groupKey(r: Report): string {
        if (grouping === "campus") return campusMap[r.campusId] ?? r.campusId;
        if (grouping === "month") return r.periodMonth != null ? `${r.periodYear}-${String(r.periodMonth).padStart(2, "0")}` : String(r.periodYear);
        if (grouping === "quarter" && r.periodMonth != null) return `${r.periodYear} Q${Math.ceil(r.periodMonth / 3)}`;
        return "all";
    }

    /* ── Build grouped buckets ────────────────────────────────────────── */

    const buckets: Map<string, Report[]> = new Map();
    for (const r of reports) {
        const k = groupKey(r);
        if (!buckets.has(k)) buckets.set(k, []);
        buckets.get(k)!.push(r);
    }

    /* ── Build worksheet for a group of reports ─────────────────────── */

    function buildSheet(groupReports: Report[]): XLSX.WorkSheet {
        const header = baseCols.map((c) => c.header);
        const rows: (string | number)[][] = groupReports.map((r) => baseCols.map((c) => c.value(r)));

        // Optional: append per-report metric summary rows
        if (includeMetrics || includeGoals || includeComments) {
            const metricDataRows: (string | number)[][] = [];
            for (const r of groupReports) {
                const rSections = sections.filter((s) => s.reportId === r.id);
                for (const sec of rSections) {
                    const secMetrics = metrics.filter((m) => m.reportSectionId === sec.id);
                    for (const m of secMetrics) {
                        metricDataRows.push([
                            getReportLabel(r, templates),
                            campusMap[r.campusId] ?? r.campusId,
                            sec.sectionName,
                            m.metricName,
                            ...(includeMetrics ? [m.monthlyAchieved ?? ""] : []),
                            ...(includeGoals ? [m.monthlyGoal ?? ""] : []),
                            ...(includeMetrics && includeGoals ? [pct(m.monthlyAchieved, m.monthlyGoal)] : []),
                            ...(includeComments ? [safeStr(m.comment)] : []),
                        ]);
                    }
                }
            }
            if (metricDataRows.length > 0) {
                const metricHeader = [
                    ec.colTitle, ec.colCampus, ec.colSection, ec.colMetric,
                    ...(includeMetrics ? [ec.colAchieved] : []),
                    ...(includeGoals ? [ec.colGoal] : []),
                    ...(includeMetrics && includeGoals ? [ec.colPercentage] : []),
                    ...(includeComments ? [ec.colComment] : []),
                ];
                // Append metric data below a blank row separator
                const ws = XLSX.utils.aoa_to_sheet([
                    header, ...rows,
                    [],
                    metricHeader, ...metricDataRows,
                ]);
                ws["!cols"] = baseCols.map((c) => ({ wch: c.wch }));
                return ws;
            }
        }

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        ws["!cols"] = baseCols.map((c) => ({ wch: c.wch }));
        return ws;
    }

    /* ── Single-sheet vs per-campus format ───────────────────────────── */

    if (format === "per-campus") {
        // One sheet per bucket, sheet name = campus name (truncated to 31 chars)
        for (const [key, groupReports] of buckets) {
            const sheetName = key.slice(0, 31);
            XLSX.utils.book_append_sheet(wb, buildSheet(groupReports), sheetName);
        }
    } else {
        if (grouping === "none" || buckets.size === 1) {
            // Single flat sheet
            XLSX.utils.book_append_sheet(wb, buildSheet(reports), ec.sheetList);
        } else {
            // All groups on separate sheets within single workbook
            for (const [key, groupReports] of buckets) {
                const sheetName = key.slice(0, 31);
                XLSX.utils.book_append_sheet(wb, buildSheet(groupReports), sheetName);
            }
        }
    }

    if (sections.length > 0 && metrics.length > 0) {
        const chartDataRows = metrics.map((m) => {
            const section = sections.find((s) => s.id === m.reportSectionId);
            return {
                Section: section?.sectionName ?? "",
                Metric: m.metricName,
                Achieved: m.monthlyAchieved ?? "",
                Goal: m.monthlyGoal ?? "",
                Percentage: pct(m.monthlyAchieved, m.monthlyGoal),
                Comment: safeStr(m.comment),
            };
        });
        const wsChart = XLSX.utils.json_to_sheet(chartDataRows);
        XLSX.utils.book_append_sheet(wb, wsChart, "Chart Data");
    }

    XLSX.writeFile(wb, `${ec.listFilename}-${timestamp}.xlsx`);
}
