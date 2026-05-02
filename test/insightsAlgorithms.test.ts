import assert from "node:assert";
import { describe, it } from "node:test";
import {
    pearsonCorrelation,
    topMover,
    biggestGap,
    trendSlope,
    complianceRate,
    correlationMatrix,
    summariseInsights,
} from "../lib/data/insights";
import { ReportStatus } from "../types/global.js";

const APPROVED = ReportStatus.APPROVED;
const DRAFT = ReportStatus.DRAFT;

interface Cell {
    templateMetricId: string;
    monthlyAchieved?: number | null;
    monthlyGoal?: number | null;
}
function makeReport(opts: {
    id: string;
    campusId: string;
    year?: number;
    month?: number;
    week?: number;
    cells: Cell[];
    status?: ReportStatus;
}) {
    return {
        id: opts.id,
        campusId: opts.campusId,
        periodYear: opts.year ?? 2026,
        periodMonth: opts.month ?? null,
        periodWeek: opts.week ?? null,
        status: opts.status ?? APPROVED,
        sections: [{ metrics: opts.cells }],
    } as const;
}

describe("pearsonCorrelation", () => {
    it("returns null below minSamples", () => {
        assert.strictEqual(pearsonCorrelation([1, 2], [2, 4], 5), null);
    });

    it("returns 1 for perfectly correlated samples", () => {
        const r = pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10], 5);
        assert.ok(r !== null);
        assert.strictEqual(Math.round(r! * 1000) / 1000, 1);
    });

    it("returns -1 for perfectly anti-correlated samples", () => {
        const r = pearsonCorrelation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2], 5);
        assert.ok(r !== null);
        assert.strictEqual(Math.round(r! * 1000) / 1000, -1);
    });

    it("returns null when one series has zero variance", () => {
        const r = pearsonCorrelation([5, 5, 5, 5, 5], [1, 2, 3, 4, 5], 5);
        assert.strictEqual(r, null);
    });
});

describe("topMover", () => {
    it("orders campuses by absolute delta over the window", () => {
        const reports = [
            makeReport({ id: "1", campusId: "a", week: 1, cells: [{ templateMetricId: "m", monthlyAchieved: 10 }] }),
            makeReport({ id: "2", campusId: "a", week: 4, cells: [{ templateMetricId: "m", monthlyAchieved: 50 }] }),
            makeReport({ id: "3", campusId: "b", week: 1, cells: [{ templateMetricId: "m", monthlyAchieved: 100 }] }),
            makeReport({ id: "4", campusId: "b", week: 4, cells: [{ templateMetricId: "m", monthlyAchieved: 95 }] }),
        ];
        const out = topMover(reports as never, "m", 4);
        assert.strictEqual(out[0].campusId, "a");
        assert.strictEqual(out[0].direction, "up");
        assert.strictEqual(out[1].campusId, "b");
        assert.strictEqual(out[1].direction, "down");
    });
});

describe("biggestGap", () => {
    it("sorts metrics by goal-minus-achieved descending", () => {
        const reports = [
            makeReport({ id: "1", campusId: "a", cells: [
                { templateMetricId: "m1", monthlyGoal: 100, monthlyAchieved: 10 },
                { templateMetricId: "m2", monthlyGoal: 50, monthlyAchieved: 40 },
            ] }),
        ];
        const out = biggestGap(reports as never);
        assert.strictEqual(out[0].templateMetricId, "m1");
        assert.strictEqual(out[0].gap, 90);
    });
});

describe("trendSlope", () => {
    it("returns positive slope for increasing series", () => {
        assert.ok(trendSlope([1, 2, 3, 4, 5]) > 0);
    });
    it("returns 0 for constant series", () => {
        assert.strictEqual(trendSlope([5, 5, 5, 5, 5]), 0);
    });
});

describe("complianceRate", () => {
    it("computes correct percentage", () => {
        const reports = [
            makeReport({ id: "1", campusId: "a", cells: [], status: APPROVED }),
            makeReport({ id: "2", campusId: "a", cells: [], status: APPROVED }),
            makeReport({ id: "3", campusId: "a", cells: [], status: DRAFT }),
        ];
        assert.strictEqual(complianceRate(reports as never), 67);
    });
});

describe("correlationMatrix", () => {
    it("only pairs metrics inside the named group", () => {
        const reports = Array.from({ length: 6 }, (_, i) =>
            makeReport({
                id: String(i),
                campusId: "a",
                week: i + 1,
                cells: [
                    { templateMetricId: "m1", monthlyAchieved: i + 1 },
                    { templateMetricId: "m2", monthlyAchieved: (i + 1) * 2 },
                    { templateMetricId: "outsider", monthlyAchieved: 100 - i },
                ],
            }),
        );
        const template = {
            sections: [
                {
                    correlationGroup: null,
                    metrics: [
                        { id: "m1", correlationGroup: "souls" },
                        { id: "m2", correlationGroup: "souls" },
                        { id: "outsider", correlationGroup: "other" },
                    ],
                },
            ],
        };
        const out = correlationMatrix(reports as never, template, "souls", 5);
        assert.strictEqual(out.length, 1);
        assert.strictEqual(out[0].a, "m1");
        assert.strictEqual(out[0].b, "m2");
        assert.ok(out[0].r !== null);
    });
});

describe("summariseInsights", () => {
    it("returns top mover, biggest gap and compliance delta when data is sufficient", () => {
        const current = Array.from({ length: 4 }, (_, i) =>
            makeReport({
                id: `c${i}`,
                campusId: "a",
                week: i + 1,
                cells: [{ templateMetricId: "m", monthlyAchieved: (i + 1) * 10, monthlyGoal: 200 }],
            }),
        );
        const previous = [
            makeReport({ id: "p1", campusId: "a", cells: [], status: DRAFT }),
            makeReport({ id: "p2", campusId: "a", cells: [], status: DRAFT }),
        ];
        const out = summariseInsights(current as never, previous as never, {
            topMoverMetricId: "m",
            topMoverWindow: 4,
        });
        assert.ok(out.topMover);
        assert.strictEqual(out.topMover!.campusId, "a");
        assert.ok(out.biggestGap);
        assert.ok(out.complianceDelta);
        assert.strictEqual(out.complianceDelta!.previous, 0);
        assert.strictEqual(out.complianceDelta!.current, 100);
        assert.strictEqual(out.complianceDelta!.delta, 100);
    });
});
