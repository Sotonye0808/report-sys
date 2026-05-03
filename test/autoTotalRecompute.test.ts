import assert from "node:assert";
import { describe, it } from "node:test";
import {
    recomputeAutoTotals,
    validateAutoTotalConfig,
    buildAutoTotalComment,
} from "../lib/data/autoTotal";

const SECTION_ID = "sec-1";
const OTHER_SECTION = "sec-2";

const m = (id: string, name: string, opts: Partial<{ isAutoTotal: boolean; sources: string[]; sectionId: string; scope: "SECTION" | "TEMPLATE" }> = {}) => ({
    id,
    name,
    sectionId: opts.sectionId ?? SECTION_ID,
    isAutoTotal: opts.isAutoTotal ?? false,
    autoTotalSourceMetricIds: opts.sources ?? [],
    autoTotalScope: opts.scope,
});

describe("validateAutoTotalConfig", () => {
    it("rejects auto-total chains", () => {
        const errors = validateAutoTotalConfig([
            m("a", "Men"),
            m("b", "Total Adults", { isAutoTotal: true, sources: ["a"] }),
            m("c", "Combined Total", { isAutoTotal: true, sources: ["b", "a"] }),
        ]);
        assert.ok(errors.some((e) => /chaining/i.test(e)), `expected chain error, got ${errors.join("; ")}`);
    });

    it("rejects self-references", () => {
        const errors = validateAutoTotalConfig([
            m("a", "Total", { isAutoTotal: true, sources: ["a", "b"] }),
            m("b", "Men"),
        ]);
        assert.ok(errors.some((e) => /reference itself/i.test(e)));
    });

    it("flags SECTION-scoped totals that pull from another section", () => {
        const errors = validateAutoTotalConfig([
            m("a", "Men", { sectionId: SECTION_ID }),
            m("b", "Children", { sectionId: OTHER_SECTION }),
            m("t", "Total", { isAutoTotal: true, sources: ["a", "b"], scope: "SECTION", sectionId: SECTION_ID }),
        ]);
        assert.ok(errors.some((e) => /another section/i.test(e)));
    });

    it("allows TEMPLATE-scoped cross-section totals", () => {
        const errors = validateAutoTotalConfig([
            m("a", "Men", { sectionId: SECTION_ID }),
            m("b", "Children", { sectionId: OTHER_SECTION }),
            m("t", "Total", { isAutoTotal: true, sources: ["a", "b"], scope: "TEMPLATE", sectionId: SECTION_ID }),
        ]);
        assert.deepStrictEqual(errors, []);
    });

    it("rejects empty source lists", () => {
        const errors = validateAutoTotalConfig([m("t", "Total", { isAutoTotal: true, sources: [] })]);
        assert.ok(errors.some((e) => /source list is empty/i.test(e)));
    });
});

describe("recomputeAutoTotals", () => {
    const tplMetrics = [
        m("a", "Men"),
        m("b", "Women"),
        m("c", "Children"),
        m("t", "Total Attendance", { isAutoTotal: true, sources: ["a", "b", "c"] }),
    ];

    function makeSection(values: Record<string, number | null>) {
        return {
            id: SECTION_ID,
            metrics: ["a", "b", "c", "t"].map((id) => ({
                id: `cell-${id}`,
                templateMetricId: id,
                monthlyAchieved: values[id] ?? null,
            })),
        };
    }

    it("sums supplied source values into the auto-total cell", () => {
        const result = recomputeAutoTotals(
            [makeSection({ a: 10, b: 20, c: 5, t: 0 })],
            tplMetrics,
        );
        const totalCell = result.sections[0].metrics?.find((c) => c.templateMetricId === "t");
        assert.strictEqual(totalCell?.monthlyAchieved, 35);
        assert.strictEqual(totalCell?.isLocked, true);
    });

    it("treats nullish source values as zero (partial fills are allowed)", () => {
        const result = recomputeAutoTotals(
            [makeSection({ a: 10, b: null, c: 5, t: 0 })],
            tplMetrics,
        );
        const totalCell = result.sections[0].metrics?.find((c) => c.templateMetricId === "t");
        assert.strictEqual(totalCell?.monthlyAchieved, 15);
    });

    it("stamps a stable comment listing the source metric names", () => {
        const result = recomputeAutoTotals(
            [makeSection({ a: 1, b: 2, c: 3, t: 0 })],
            tplMetrics,
        );
        const totalCell = result.sections[0].metrics?.find((c) => c.templateMetricId === "t");
        assert.match(totalCell?.comment ?? "", /Auto-total of Children \+ Men \+ Women/);
    });

    it("respects SECTION scope when summing (skips out-of-section sources)", () => {
        const tpl = [
            m("a", "Men", { sectionId: SECTION_ID }),
            m("x", "External", { sectionId: OTHER_SECTION }),
            m("t", "Total", { isAutoTotal: true, sources: ["a", "x"], scope: "SECTION", sectionId: SECTION_ID }),
        ];
        const sections = [
            { id: SECTION_ID, metrics: [{ id: "ca", templateMetricId: "a", monthlyAchieved: 7 }, { id: "ct", templateMetricId: "t", monthlyAchieved: 0 }] },
            { id: OTHER_SECTION, metrics: [{ id: "cx", templateMetricId: "x", monthlyAchieved: 100 }] },
        ];
        const result = recomputeAutoTotals(sections, tpl);
        const totalCell = result.sections[0].metrics?.find((c) => c.templateMetricId === "t");
        // External source must be skipped under SECTION scope.
        assert.strictEqual(totalCell?.monthlyAchieved, 7);
    });

    it("tracks unresolved source ids without throwing", () => {
        const tpl = [
            m("a", "Men"),
            m("t", "Total", { isAutoTotal: true, sources: ["a", "missing"] }),
        ];
        const sections = [
            { id: SECTION_ID, metrics: [{ id: "ca", templateMetricId: "a", monthlyAchieved: 4 }, { id: "ct", templateMetricId: "t", monthlyAchieved: 0 }] },
        ];
        const result = recomputeAutoTotals(sections, tpl);
        assert.deepStrictEqual(result.unresolvedSourceIds, ["missing"]);
        const totalCell = result.sections[0].metrics?.find((c) => c.templateMetricId === "t");
        assert.strictEqual(totalCell?.monthlyAchieved, 4);
    });
});

describe("buildAutoTotalComment", () => {
    it("returns a placeholder when no sources are given", () => {
        assert.strictEqual(buildAutoTotalComment([]), "Auto-total: no source metrics");
    });

    it("dedupes + sorts source names for stable diffs", () => {
        assert.strictEqual(
            buildAutoTotalComment(["Men", "Women", "Men", "Children"]),
            "Auto-total of Children + Men + Women",
        );
    });
});
