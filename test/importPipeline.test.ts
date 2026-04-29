import assert from "node:assert";
import { describe, it } from "node:test";
import { parseCsv, validateRows, type ImportMapping } from "../lib/data/importPipeline";

describe("parseCsv", () => {
    it("parses simple rows", () => {
        const out = parseCsv("a,b,c\n1,2,3\n4,5,6\n");
        assert.deepStrictEqual(out, [
            ["a", "b", "c"],
            ["1", "2", "3"],
            ["4", "5", "6"],
        ]);
    });

    it("handles quoted fields with commas and newlines", () => {
        const csv = `name,note\n"Foo, Inc.","line one\nline two"\n"Bar","ok"`;
        const out = parseCsv(csv);
        assert.strictEqual(out.length, 3);
        assert.strictEqual(out[1][0], "Foo, Inc.");
        assert.strictEqual(out[1][1], "line one\nline two");
        assert.strictEqual(out[2][1], "ok");
    });

    it("escapes embedded double quotes", () => {
        const out = parseCsv(`a\n"He said ""hi"""`);
        assert.strictEqual(out[1][0], 'He said "hi"');
    });
});

describe("validateRows", () => {
    const mapping: ImportMapping = {
        columns: [
            { index: 0, header: "campusId", target: "campusId" },
            { index: 1, header: "period", target: "period" },
            { index: 2, header: "Souls", target: "metric-1" },
        ],
    };
    const known = new Set<string>(["metric-1"]);

    it("flags non-numeric values for metric columns", () => {
        const rows = [
            ["campusId", "period", "Souls"],
            ["c1", "2026-04", "abc"],
        ];
        const out = validateRows(rows, mapping, known);
        assert.strictEqual(out[0].outcome, "ERROR");
        assert.match(out[0].errors.join(","), /Non-numeric/);
    });

    it("flags unknown templateMetricId targets", () => {
        const rows = [
            ["campusId", "period", "Bogus"],
            ["c1", "2026-04", "10"],
        ];
        const out = validateRows(
            rows,
            { columns: [
                { index: 0, header: "campusId", target: "campusId" },
                { index: 1, header: "period", target: "period" },
                { index: 2, header: "Bogus", target: "metric-99" },
            ] },
            known,
        );
        assert.strictEqual(out[0].outcome, "ERROR");
        assert.match(out[0].errors.join(","), /Unknown templateMetricId/);
    });

    it("detects duplicate (campusId, period) rows in the same batch", () => {
        const rows = [
            ["campusId", "period", "Souls"],
            ["c1", "2026-04", "10"],
            ["c1", "2026-04", "20"],
        ];
        const out = validateRows(rows, mapping, known);
        assert.strictEqual(out[0].outcome, "OK");
        assert.strictEqual(out[1].outcome, "ERROR");
        assert.match(out[1].errors.join(","), /Duplicate/);
    });

    it("requires campusId and period when mapped", () => {
        const rows = [
            ["campusId", "period", "Souls"],
            ["", "", "10"],
        ];
        const out = validateRows(rows, mapping, known);
        assert.strictEqual(out[0].outcome, "ERROR");
        assert.match(out[0].errors.join(","), /campusId required/);
        assert.match(out[0].errors.join(","), /period required/);
    });

    it("normalises numeric metric values", () => {
        const rows = [
            ["campusId", "period", "Souls"],
            ["c1", "2026-04", "42"],
        ];
        const out = validateRows(rows, mapping, known);
        assert.strictEqual(out[0].outcome, "OK");
        assert.strictEqual(out[0].normalized["metric-1"], 42);
    });
});
