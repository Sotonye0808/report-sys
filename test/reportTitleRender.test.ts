import assert from "node:assert";
import { describe, it } from "node:test";
import { renderTitle, renderTitleSimple } from "../lib/utils/reportTitle";

describe("reportTitle render", () => {
    it("substitutes allowlisted placeholders", () => {
        const out = renderTitle("Weekly — {campus} — {period}", {
            campus: "HQ",
            period: "Week 17 2026",
        });
        assert.strictEqual(out.title, "Weekly — HQ — Week 17 2026");
        assert.deepStrictEqual(out.missing, []);
        assert.deepStrictEqual(out.unknown, []);
    });

    it("leaves unknown placeholders literal and reports them", () => {
        const out = renderTitle("Hi {name} — {period}", { period: "Week 17" });
        assert.match(out.title, /\{name\}/);
        assert.deepStrictEqual(out.unknown, ["name"]);
    });

    it("leaves missing-value placeholders literal", () => {
        const out = renderTitle("Weekly — {campus} — {period}", { period: "Week 17" });
        assert.match(out.title, /\{campus\}/);
        assert.deepStrictEqual(out.missing, ["campus"]);
    });

    it("renderTitleSimple returns empty string for null/undefined templates", () => {
        assert.strictEqual(renderTitleSimple(null, {}), "");
        assert.strictEqual(renderTitleSimple(undefined, {}), "");
    });

    it("supports numeric placeholders", () => {
        const out = renderTitle("Quarter {quarter} {year}", { quarter: 2, year: 2026 });
        assert.strictEqual(out.title, "Quarter 2 2026");
    });
});
