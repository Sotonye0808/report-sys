import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { ReportDeadlinePolicy, ReportPeriodType } from "@/types/global";
import { DEADLINE_CONFIG } from "@/config/reports";

dayjs.extend(weekOfYear);

export function calculateReportDeadline(
    periodType: ReportPeriodType,
    periodYear: number,
    periodMonth?: number,
    periodWeek?: number,
    policy: ReportDeadlinePolicy = ReportDeadlinePolicy.PERIOD_END,
    offsetHours: number = DEADLINE_CONFIG.reportDeadlineHours,
): Date {
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;

    if (periodType === ReportPeriodType.WEEKLY) {
        const weekNumber = periodWeek ?? 1;
        start = dayjs().year(periodYear).week(weekNumber).startOf("week");
        end = start.endOf("week");
    } else if (periodType === ReportPeriodType.YEARLY) {
        start = dayjs(`${periodYear}-01-01`).startOf("day");
        end = dayjs(`${periodYear}-12-31`).endOf("day");
    } else {
        const month = periodMonth ?? 1;
        start = dayjs(`${periodYear}-${String(month).padStart(2, "0")}-01`).startOf("day");
        end = start.endOf("month");
    }

    switch (policy) {
        case ReportDeadlinePolicy.PERIOD_START:
            return start.toDate();
        case ReportDeadlinePolicy.PERIOD_MIDDLE:
            return start.add(end.diff(start) / 2, "millisecond").toDate();
        case ReportDeadlinePolicy.AFTER_PERIOD_HOURS:
            return end.add(offsetHours, "hour").toDate();
        case ReportDeadlinePolicy.PERIOD_END:
        default:
            return end.toDate();
    }
}

export function formattedDeadlinePolicy(template: { deadlinePolicy?: ReportDeadlinePolicy; deadlineOffsetHours?: number } | null) {
    if (!template) return "Using end-of-period deadline.";
    switch (template.deadlinePolicy) {
        case ReportDeadlinePolicy.PERIOD_START:
            return "Deadline is at the beginning of the report period.";
        case ReportDeadlinePolicy.PERIOD_MIDDLE:
            return "Deadline is in the middle of the report period.";
        case ReportDeadlinePolicy.AFTER_PERIOD_HOURS:
            return `Deadline is ${template.deadlineOffsetHours ?? DEADLINE_CONFIG.reportDeadlineHours} hours after period close.`;
        case ReportDeadlinePolicy.PERIOD_END:
        default:
            return "Deadline is at the end of the report period.";
    }
}
