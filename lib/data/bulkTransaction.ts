/**
 * lib/data/bulkTransaction.ts
 * Shared bulk transaction orchestration for large, chunked DB writes.
 *
 * Goals:
 * - enforce a maximum payload item limit at the API layer
 * - split work into smaller chunks, each with a Prisma transaction boundary
 * - capture metrics (chunk size, latency, success/failure)
 * - support retry-on-transient-failure for chunk operations
 * - preserve order across final results
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type BulkTransactionOptions = {
  chunkSize?: number;
  maxItems?: number;
  maxConcurrent?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMessage?: string;
};

export type BulkChunkMetrics = {
  chunkIndex: number;
  totalChunks: number;
  chunkSize: number;
  durationMs: number;
  retryCount: number;
};

export type BulkTransactionResult<T> = {
  results: T[];
  metrics: BulkChunkMetrics[];
};

export async function runBulkTransaction<T, R>(
  items: T[],
  executeChunk: (chunk: T[]) => Promise<R[]>,
  options?: BulkTransactionOptions,
): Promise<BulkTransactionResult<R>> {
  const {
    chunkSize = 100,
    maxItems = 10000,
    maxConcurrent = 1,
    maxRetries = 2,
    retryDelayMs = 250,
  } = options ?? {};

  if (!Array.isArray(items)) {
    throw new Error("Bulk transaction payload must be an array.");
  }

  if (items.length === 0) {
    return { results: [], metrics: [] };
  }

  if (items.length > maxItems) {
    throw new Error(`Bulk payload exceeds maximum allowed size of ${maxItems} items.`);
  }

  if (chunkSize < 1) {
    throw new Error("chunkSize must be at least 1.");
  }

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  const totalChunks = chunks.length;
  const results: R[] = [];
  const metrics: BulkChunkMetrics[] = [];

  // NOTE: For transactional safety and DB contention, process chunks in sequence by default.
  // maxConcurrent > 1 can be used for specific workloads, but should be conservative.
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex];
    let retryCount = 0;
    while (true) {
      const startTs = Date.now();
      try {
        const chunkResult = await executeChunk(chunk);
        const durationMs = Date.now() - startTs;
        metrics.push({ chunkIndex, totalChunks, chunkSize: chunk.length, durationMs, retryCount });
        results.push(...chunkResult);
        break;
      } catch (err) {
        retryCount += 1;
        const durationMs = Date.now() - startTs;
        console.warn("[bulkTransaction] chunk failed", { chunkIndex, retryCount, err, durationMs });

        if (retryCount > maxRetries) {
          console.error("[bulkTransaction] chunk failed after max retries", { chunkIndex, retryCount, err });
          throw err;
        }

        await sleep(retryDelayMs * retryCount);
      }
    }

    if (maxConcurrent > 1) {
      // In this code path, we keep sequential in the bubble; no concurrency control here.
      // For advanced concurrency, external orchestration is recommended.
    }
  }

  console.info("[bulkTransaction] completed", {
    totalItems: items.length,
    totalChunks,
    chunkSize,
    maxRetries,
    metrics,
  });

  return { results, metrics };
}
