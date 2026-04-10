import assert from "node:assert";
import { describe, it } from "node:test";
import { resolveReportMonth } from "../lib/utils/reportPeriod";

describe("resolveReportMonth", () => {
  it("returns explicit periodMonth when provided", () => {
    assert.equal(
      resolveReportMonth({
        periodType: "MONTHLY",
        periodYear: 2026,
        periodMonth: 4,
      }),
      4,
    );
  });

  it("derives month from ISO week for weekly reports", () => {
    assert.equal(
      resolveReportMonth({
        periodType: "WEEKLY",
        periodYear: 2026,
        periodWeek: 1,
      }),
      1,
    );
  });

  it("returns null when month cannot be resolved", () => {
    assert.equal(
      resolveReportMonth({
        periodType: "YEARLY",
        periodYear: 2026,
      }),
      null,
    );
  });
});
