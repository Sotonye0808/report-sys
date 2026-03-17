/**
 * lib/utils/reportUtils.ts
 * Utility functions for displaying Report records.
 *
 * Because `Report` stores period as structured fields (periodType / periodYear /
 * periodMonth / periodWeek) rather than a human-readable string, these helpers
 * convert those fields into display-ready labels throughout the UI.
 */

import { ReportPeriodType } from "@/types/global";

/** Short month names for period labelling */
const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Build a human-readable period label from a Report's period fields.
 * Examples: "Jan 2025", "Week 3, 2025", "2025"
 */
export function formatReportPeriod(report: {
    periodType: ReportPeriodType;
    periodYear: number;
    periodMonth?: number;
    periodWeek?: number;
}): string {
    switch (report.periodType) {
        case ReportPeriodType.MONTHLY:
            return report.periodMonth
                ? `${MONTH_SHORT[report.periodMonth - 1]} ${report.periodYear}`
                : `${report.periodYear}`;
        case ReportPeriodType.WEEKLY:
            return report.periodWeek
                ? `Week ${report.periodWeek}, ${report.periodYear}`
                : `${report.periodYear}`;
        case ReportPeriodType.YEARLY:
            return `${report.periodYear}`;
        default:
            return `${report.periodYear}`;
    }
}

/**
 * Build a display label for a report by combining template name + period.
 * Falls back to period alone when template name is not available.
 */
export function getReportLabel(
    report: {
        title?: string;
        templateId: string;
        periodType: ReportPeriodType;
        periodYear: number;
        periodMonth?: number;
        periodWeek?: number;
    },
    templates: ReportTemplate[],
): string {
    if (report.title && report.title.trim().length > 0) {
        return report.title;
    }
    const template = templates.find((t) => t.id === report.templateId);
    const period = formatReportPeriod(report);
    return template ? `${template.name} — ${period}` : period;
}
