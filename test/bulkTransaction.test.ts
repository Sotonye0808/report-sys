import assert from "node:assert";
import { describe, it } from "node:test";
import { runBulkTransaction } from "../lib/data/bulkTransaction";

describe("runBulkTransaction", () => {
  it("splits payload into chunks and executes each chunk", async () => {
    const items = Array.from({ length: 52 }, (_, i) => i + 1);
    const executed: number[] = [];

    const { results, metrics } = await runBulkTransaction(
      items,
      async (chunk) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        executed.push(...chunk);
        return chunk.map((n) => n * 2);
      },
      { chunkSize: 20, maxItems: 1000, maxRetries: 1 },
    );

    assert.strictEqual(results.length, 52);
    assert.deepStrictEqual(results.slice(0, 3), [2, 4, 6]);
    assert.strictEqual(executed.length, 52);
    assert.strictEqual(metrics.length, 3);
  });

  it("throws when payload exceeds maxItems", async () => {
    const items = Array.from({ length: 1001 }, (_, i) => i);
    try {
      await runBulkTransaction(items, async (chunk) => chunk, { maxItems: 1000 });
      assert.fail("Expected runBulkTransaction to throw");
    } catch (err) {
      assert.ok(err instanceof Error);
      assert.match((err as Error).message, /exceeds maximum allowed size/);
    }
  });

  it("retries transient errors and eventually succeeds", async () => {
    const items = [1, 2, 3];
    let attempts = 0;

    const { results, metrics } = await runBulkTransaction(
      items,
      async () => {
        attempts += 1;
        if (attempts < 2) {
          throw new Error("transient error");
        }
        return items.map((n) => n * 10);
      },
      { maxRetries: 3, chunkSize: 3 },
    );

    assert.deepStrictEqual(results, [10, 20, 30]);
    assert.strictEqual(attempts, 2);
    assert.strictEqual(metrics.length, 1);
    assert.strictEqual(metrics[0].retryCount, 1);
  });
});
