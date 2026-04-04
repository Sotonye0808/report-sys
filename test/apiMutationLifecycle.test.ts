import assert from "node:assert";
import { describe, it } from "node:test";
import { apiMutation } from "../lib/utils/apiMutation";

describe("apiMutation lifecycle", () => {
  it("maps success payload data", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ success: true, data: { value: 7 } }), {
        status: 200,
        headers: { "x-request-id": "req-success" },
      })) as typeof fetch;

    const res = await apiMutation<{ value: number }>("/api/mock", { method: "POST", body: {} });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.data?.value, 7);
    assert.strictEqual(res.requestId, "req-success");

    globalThis.fetch = originalFetch;
  });

  it("maps error payload and keeps request id", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ success: false, error: "Bad request", code: 400 }), {
        status: 400,
        headers: { "x-request-id": "req-error" },
      })) as typeof fetch;

    const res = await apiMutation("/api/mock", { method: "PUT", body: { a: 1 } });
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, "Bad request");
    assert.strictEqual(res.requestId, "req-error");
    assert.strictEqual(res.status, 400);

    globalThis.fetch = originalFetch;
  });

  it("handles network error and returns default error shape", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error("network failed");
    }) as typeof fetch;

    const res = await apiMutation("/api/mock", { method: "DELETE" });
    assert.strictEqual(res.ok, false);
    assert.ok(typeof res.error === "string" && res.error.length > 0);
    assert.strictEqual(res.status, 0);

    globalThis.fetch = originalFetch;
  });
});

