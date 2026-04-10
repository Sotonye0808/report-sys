interface ReportPeriodShape {
  periodType: "WEEKLY" | "MONTHLY" | "YEARLY";
  periodYear: number;
  periodMonth?: number | null;
  periodWeek?: number | null;
}

function monthFromIsoWeek(periodYear: number, periodWeek: number): number | null {
  if (!Number.isInteger(periodWeek) || periodWeek < 1 || periodWeek > 53) return null;

  const firstDay = new Date(Date.UTC(periodYear, 0, 1));
  firstDay.setUTCDate(firstDay.getUTCDate() + (periodWeek - 1) * 7);
  return firstDay.getUTCMonth() + 1;
}

export function resolveReportMonth(report: ReportPeriodShape): number | null {
  if (report.periodMonth != null && report.periodMonth >= 1 && report.periodMonth <= 12) {
    return report.periodMonth;
  }

  if (report.periodType === "WEEKLY" && report.periodWeek != null) {
    return monthFromIsoWeek(report.periodYear, report.periodWeek);
  }

  return null;
}
