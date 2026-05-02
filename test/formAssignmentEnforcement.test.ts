import assert from "node:assert";
import { describe, it } from "node:test";
import {
    verifyMetricSubset,
    FormAssignmentMetricMismatchError,
} from "../lib/data/formAssignment";

describe("verifyMetricSubset", () => {
    it("accepts a strict subset of the assigned metric ids", () => {
        const assigned = ["m1", "m2", "m3"];
        // Should not throw
        verifyMetricSubset(["m1", "m3"], assigned);
        verifyMetricSubset([], assigned);
        verifyMetricSubset(["m2"], assigned);
    });

    it("rejects any metric id outside the assigned subset", () => {
        const assigned = ["m1", "m2"];
        try {
            verifyMetricSubset(["m1", "m9"], assigned);
            assert.fail("expected FormAssignmentMetricMismatchError");
        } catch (err) {
            assert.ok(err instanceof FormAssignmentMetricMismatchError);
            assert.deepStrictEqual(err.unauthorizedMetricIds, ["m9"]);
        }
    });

    it("reports every offending metric id, not just the first", () => {
        const assigned = ["m1"];
        try {
            verifyMetricSubset(["m9", "m1", "m8"], assigned);
            assert.fail("expected FormAssignmentMetricMismatchError");
        } catch (err) {
            assert.ok(err instanceof FormAssignmentMetricMismatchError);
            assert.deepStrictEqual(err.unauthorizedMetricIds.sort(), ["m8", "m9"]);
        }
    });
});
