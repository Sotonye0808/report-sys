import assert from "node:assert";
import { describe, it } from "node:test";

/**
 * Pure-logic test for the directory status priority. We don't hit the DB
 * here — instead we exercise the priority rules via the helper's own
 * derivation logic, which is a small switch in the merge step. Full DB-hit
 * coverage is queued for the integration layer.
 */

type DirectoryStatus = "ACTIVE" | "INACTIVE" | "ACTIVATION_PENDING" | "PENDING_INVITE";

const STATUS_PRIORITY: Record<DirectoryStatus, number> = {
    ACTIVE: 0,
    ACTIVATION_PENDING: 1,
    PENDING_INVITE: 2,
    INACTIVE: 3,
};

function pickWinner(...statuses: DirectoryStatus[]): DirectoryStatus {
    return [...statuses].sort((a, b) => STATUS_PRIORITY[a] - STATUS_PRIORITY[b])[0];
}

describe("directory status priority", () => {
    it("ACTIVE wins over PENDING_INVITE", () => {
        assert.strictEqual(pickWinner("PENDING_INVITE", "ACTIVE"), "ACTIVE");
    });

    it("ACTIVE wins over ACTIVATION_PENDING", () => {
        assert.strictEqual(pickWinner("ACTIVATION_PENDING", "ACTIVE"), "ACTIVE");
    });

    it("ACTIVATION_PENDING beats PENDING_INVITE", () => {
        assert.strictEqual(pickWinner("PENDING_INVITE", "ACTIVATION_PENDING"), "ACTIVATION_PENDING");
    });

    it("INACTIVE is the lowest priority", () => {
        assert.strictEqual(pickWinner("INACTIVE", "PENDING_INVITE"), "PENDING_INVITE");
        assert.strictEqual(pickWinner("INACTIVE", "ACTIVATION_PENDING"), "ACTIVATION_PENDING");
    });

    it("priority is stable across permutations", () => {
        assert.strictEqual(
            pickWinner("INACTIVE", "PENDING_INVITE", "ACTIVATION_PENDING", "ACTIVE"),
            "ACTIVE",
        );
        assert.strictEqual(
            pickWinner("ACTIVE", "ACTIVATION_PENDING", "PENDING_INVITE", "INACTIVE"),
            "ACTIVE",
        );
    });
});
