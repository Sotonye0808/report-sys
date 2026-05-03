import assert from "node:assert";
import { describe, it } from "node:test";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/test_placeholder";

const { applyWowContext } = await import("../lib/data/wow");
import { ReportPeriodType } from "../types/global.js";

function makeReport(values: Record<string, number>, week: number) {
    return {
        id: `r-${week}`,
        campusId: "c1",
        templateId: "t1",
        periodType: ReportPeriodType.WEEKLY,
        periodYear: 2026,
        periodWeek: week,
        sections: [
            {
                metrics: Object.entries(values).map(([id, achieved]) => ({
                    templateMetricId: id,
                    monthlyAchieved: achieved,
                })),
            },
        ],
    };
}

describe("applyWowContext", () => {
    const tpl = [
        { id: "souls", capturesWoW: true },
        { id: "decisions", capturesWoW: true },
        { id: "offering", capturesWoW: false },
    ];

    it("attaches wowGoal from prior + wowAchieved from current", () => {
        const current = makeReport({ souls: 12, decisions: 5, offering: 100 }, 17);
        const prev = makeReport({ souls: 9, decisions: 4, offering: 80 }, 16);
        applyWowContext(current as never, prev as never, tpl);
        const cells = current.sections[0].metrics as Array<{ templateMetricId: string; wowGoal?: number | null; wowAchieved?: number | null }>;
        const souls = cells.find((c) => c.templateMetricId === "souls")!;
        assert.strictEqual(souls.wowGoal, 9);
        assert.strictEqual(souls.wowAchieved, 12);
        const decisions = cells.find((c) => c.templateMetricId === "decisions")!;
        assert.strictEqual(decisions.wowGoal, 4);
        // Non-WoW metrics are untouched.
        const offering = cells.find((c) => c.templateMetricId === "offering")!;
        assert.strictEqual((offering as { wowGoal?: number }).wowGoal, undefined);
    });

    it("non-blocking when prior week is missing — wowGoal becomes null", () => {
        const current = makeReport({ souls: 10 }, 17);
        applyWowContext(current as never, null, tpl);
        const cells = current.sections[0].metrics as Array<{ templateMetricId: string; wowGoal?: number | null; wowAchieved?: number | null }>;
        const souls = cells.find((c) => c.templateMetricId === "souls")!;
        assert.strictEqual(souls.wowGoal, null);
        assert.strictEqual(souls.wowAchieved, 10);
    });

    it("returns the report unchanged when no metric captures WoW", () => {
        const current = makeReport({ souls: 10 }, 17);
        const out = applyWowContext(current as never, null, [{ id: "souls", capturesWoW: false }]);
        const cells = out.sections![0].metrics as Array<{ wowGoal?: number | null }>;
        assert.strictEqual(cells[0].wowGoal, undefined);
    });
});
