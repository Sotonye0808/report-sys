import assert from "node:assert";
import { describe, it } from "node:test";
import { successResponse } from "../lib/utils/api";
import { isScanCursorComplete } from "../lib/data/redisCursor";

describe("redis cursor termination regression", () => {
  it("treats both numeric and string terminal cursors as complete", () => {
    assert.strictEqual(isScanCursorComplete(0), true);
    assert.strictEqual(isScanCursorComplete("0"), true);
    assert.strictEqual(isScanCursorComplete("1"), false);
  });
});

describe("report/auth route contract regressions", () => {
  it("keeps auth refresh response contract shape", () => {
    const payload = successResponse({
      user: {
        id: "u-1",
        email: "user@example.com",
        role: "SUPERADMIN",
      },
    });

    assert.strictEqual(payload.success, true);
    assert.ok(payload.data.user);
    assert.strictEqual(payload.data.user.id, "u-1");
  });

  it("keeps report unlock/audit related response envelope shape", () => {
    const unlockPayload = successResponse({
      id: "report-1",
      status: "DRAFT",
    });
    const historyPayload = successResponse([
      { id: "event-1", reportId: "report-1", eventType: "UNLOCKED" },
    ]);

    assert.strictEqual(unlockPayload.success, true);
    assert.strictEqual(unlockPayload.data.status, "DRAFT");
    assert.strictEqual(historyPayload.success, true);
    assert.strictEqual(Array.isArray(historyPayload.data), true);
  });
});
