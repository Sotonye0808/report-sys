import assert from "node:assert";
import { describe, it } from "node:test";
import {
    getCurrentPeriod,
    nextOccurrence,
    previousExpectedDay,
    computeDeadline,
    periodLabel,
    quarterFromMonth,
} from "../lib/utils/cadence";

describe("cadence utilities", () => {
    it("buckets WEEKLY/TWICE_WEEKLY/ANY by ISO week", () => {
        const asOf = new Date(Date.UTC(2026, 4, 6)); // Wed 2026-05-06
        const weekly = getCurrentPeriod("WEEKLY", asOf);
        const twice = getCurrentPeriod("TWICE_WEEKLY", asOf);
        const any = getCurrentPeriod("ANY", asOf);
        assert.strictEqual(weekly.periodType, "WEEKLY");
        assert.strictEqual(weekly.key, twice.key);
        assert.strictEqual(weekly.key, any.key);
    });

    it("MONTHLY uses YYYY-MMM key + correct month", () => {
        const asOf = new Date(Date.UTC(2026, 0, 15)); // Jan 15
        const m = getCurrentPeriod("MONTHLY", asOf);
        assert.strictEqual(m.periodType, "MONTHLY");
        assert.strictEqual(m.periodMonth, 1);
        assert.strictEqual(m.key, "2026-M01");
    });

    it("YEARLY collapses to year key", () => {
        const asOf = new Date(Date.UTC(2026, 6, 4));
        const y = getCurrentPeriod("YEARLY", asOf);
        assert.strictEqual(y.periodType, "YEARLY");
        assert.strictEqual(y.key, "2026-Y");
        assert.strictEqual(y.periodWeek, undefined);
        assert.strictEqual(y.periodMonth, undefined);
    });

    it("nextOccurrence returns same-day when weekday matches", () => {
        const sun = new Date(Date.UTC(2026, 4, 3)); // 2026-05-03 is Sunday
        const next = nextOccurrence(0, sun);
        assert.strictEqual(next.getUTCDay(), 0);
        assert.strictEqual(next.getUTCDate(), 3);
    });

    it("nextOccurrence wraps to next week when needed", () => {
        const wed = new Date(Date.UTC(2026, 4, 6)); // Wed
        const sun = nextOccurrence(0, wed);
        assert.strictEqual(sun.getUTCDay(), 0);
        // 2026-05-06 → next Sun is 2026-05-10
        assert.strictEqual(sun.getUTCDate(), 10);
    });

    it("previousExpectedDay picks the most-recent occurrence among the set", () => {
        const wed = new Date(Date.UTC(2026, 4, 6));
        const prev = previousExpectedDay([0, 3], wed); // Sun + Wed
        assert.ok(prev);
        // The same Wednesday should be the most recent occurrence.
        assert.strictEqual(prev!.getUTCDay(), 3);
        assert.strictEqual(prev!.getUTCDate(), 6);
    });

    it("computeDeadline anchors on previousExpectedDay + deadlineHours", () => {
        const wed = new Date(Date.UTC(2026, 4, 6, 12)); // Wed noon
        const deadline = computeDeadline([3], 48, wed); // anchor Wed midnight + 48h
        assert.ok(deadline);
        assert.strictEqual(deadline!.getUTCDate(), 8); // Fri
    });

    it("periodLabel formats for monthly/weekly/yearly", () => {
        assert.match(periodLabel({ key: "x", periodType: "MONTHLY", periodYear: 2026, periodMonth: 1 } as never), /January 2026/);
        assert.match(periodLabel({ key: "x", periodType: "WEEKLY", periodYear: 2026, periodWeek: 17 } as never), /Week 17 2026/);
        assert.match(periodLabel({ key: "x", periodType: "YEARLY", periodYear: 2026 } as never), /2026/);
    });

    it("quarterFromMonth maps months to quarters", () => {
        assert.strictEqual(quarterFromMonth(1), 1);
        assert.strictEqual(quarterFromMonth(3), 1);
        assert.strictEqual(quarterFromMonth(4), 2);
        assert.strictEqual(quarterFromMonth(7), 3);
        assert.strictEqual(quarterFromMonth(12), 4);
    });
});
