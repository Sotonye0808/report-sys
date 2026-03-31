import assert from "node:assert";
import { describe, it } from "node:test";
import { formatAxisLabel } from "../modules/analytics/chartUtils";

describe("modules/analytics/chartUtils formatAxisLabel", () => {
    it("returns full value when mode is full", () => {
        const value = "This is a long metric name";
        assert.strictEqual(formatAxisLabel(value, "full", 10), value);
    });

    it("returns short value when mode is short and exceeds maxLen", () => {
        const value = "This is a long metric name";
        assert.strictEqual(formatAxisLabel(value, "short", 10), "This is...");
    });

    it("returns acronym-like value when mode is auto and has multiple words", () => {
        const value = "Monthly Attendance by Campus";
        const result = formatAxisLabel(value, "auto", 15);
        assert.strictEqual(result, "M.A.B.C");
    });

    it("falls back to truncated string when auto with single word too long", () => {
        const value = "Supercalifragilistic";
        const result = formatAxisLabel(value, "auto", 10);
        assert.strictEqual(result, "Superca...");
    });
});
