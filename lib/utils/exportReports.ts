/**
 * lib/utils/exportReports.ts
 *
 * Client-side Excel (.xlsx) export utilities using SheetJS.
 *
 * Two exported functions:
 *  - exportReportsList  — exports the currently-filtered reports list
 *  - exportReportDetail — exports a single report (metadata + metrics sheets)
 */

import * as XLSX from "xlsx";
import { fmtDate } from "./formatDate";
import { getReportLabel, formatReportPeriod } from "./reportUtils";
import { CONTENT } from "@/config/content";

const ec = (CONTENT.reports as Record<string, unknown>).export as Record<string, string>;

/* ── helpers ────────────────────────────────────────────────────────────── */

function pct(achieved?: number, goal?: number): string {
    if (achieved == null || goal == null || goal === 0) return "";
    return `${Math.round((achieved / goal) * 100)}%`;
}

function safeStr(v: unknown): string {
    return v == null ? "" : String(v);
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

    /* ── Assemble workbook ─────────────────────────────────────────────── */

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsOverview, ec.sheetMeta);
    XLSX.utils.book_append_sheet(wb, wsMetrics, ec.sheetMetrics);

    const safeName = getReportLabel(report, templates)
        .replace(/[/\\?*[\]]/g, "-")
        .slice(0, 50);
    XLSX.writeFile(wb, `${safeName}.xlsx`);
}
