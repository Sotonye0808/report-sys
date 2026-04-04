import assert from "node:assert";
import { describe, it } from "node:test";
import { successResponse } from "../lib/utils/api";

describe("API response contract", () => {
  it("returns success payload with requestId when supplied", () => {
    const res = successResponse({ id: "123" }, "req-1");
    assert.strictEqual(res.success, true);
    assert.deepStrictEqual(res.data, { id: "123" });
    assert.strictEqual(res.requestId, "req-1");
  });

  it("keeps compatibility without requestId", () => {
    const res = successResponse({ ok: true });
    assert.strictEqual(res.success, true);
    assert.deepStrictEqual(res.data, { ok: true });
    assert.strictEqual("requestId" in res, false);
  });
});

