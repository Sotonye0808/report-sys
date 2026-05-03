import assert from "node:assert";
import { describe, it } from "node:test";
import { pearsonCorrelation, biggestGap, summariseInsights } from "../lib/data/insights";
import { ReportStatus } from "../types/global.js";

describe("Pearson correlation gating + correctness", () => {
    it("returns null below the min-samples threshold", () => {
        const r = pearsonCorrelation([1, 2, 3], [2, 3, 4], 5);
        assert.strictEqual(r, null);
    });

    it("computes a strong positive correlation on perfectly aligned series", () => {
        const r = pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10], 5);
        assert.ok(r !== null && Math.abs(r - 1) < 1e-9, `expected r ≈ 1, got ${r}`);
    });

    it("computes a strong negative correlation on inversely aligned series", () => {
        const r = pearsonCorrelation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2], 5);
        assert.ok(r !== null && Math.abs(r + 1) < 1e-9, `expected r ≈ -1, got ${r}`);
    });

    it("returns null when one series has zero variance", () => {
        const r = pearsonCorrelation([1, 1, 1, 1, 1], [1, 2, 3, 4, 5], 5);
        assert.strictEqual(r, null);
    });
});

describe("biggestGap ordering", () => {
    it("sorts metrics by goal − achieved descending", () => {
        const reports = [
            {
                id: "r1",
                campusId: "c1",
                periodYear: 2026,
                status: ReportStatus.APPROVED,
                sections: [
                    { metrics: [{ templateMetricId: "m1", monthlyGoal: 100, monthlyAchieved: 60 }, { templateMetricId: "m2", monthlyGoal: 50, monthlyAchieved: 40 }, { templateMetricId: "m3", monthlyGoal: 30, monthlyAchieved: 35 }] },
                ],
            },
        ];
        const out = biggestGap(reports as never);
        assert.strictEqual(out[0].templateMetricId, "m1"); // gap 40
        assert.strictEqual(out[1].templateMetricId, "m2"); // gap 10
        assert.strictEqual(out[2].templateMetricId, "m3"); // gap -5
    });
});

describe("summariseInsights structure", () => {
    it("returns complianceDelta even when no other insights apply", () => {
        const current = [
            { id: "1", campusId: "c1", periodYear: 2026, status: ReportStatus.APPROVED, sections: [] },
            { id: "2", campusId: "c1", periodYear: 2026, status: ReportStatus.APPROVED, sections: [] },
        ];
        const previous = [
            { id: "p1", campusId: "c1", periodYear: 2026, status: ReportStatus.DRAFT, sections: [] },
            { id: "p2", campusId: "c1", periodYear: 2026, status: ReportStatus.APPROVED, sections: [] },
        ];
        const out = summariseInsights(current as never, previous as never);
        assert.ok(out.complianceDelta);
        assert.strictEqual(out.complianceDelta?.current, 100);
        assert.strictEqual(out.complianceDelta?.previous, 50);
        assert.strictEqual(out.complianceDelta?.delta, 50);
    });
});
