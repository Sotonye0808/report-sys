/**
 * lib/data/db.ts
 * Unified database access layer.
 * Re-exports Prisma client as `db` and provides transaction helper.
 * This replaces mockDb as the canonical import for all API routes.
 *
 * Usage:
 *   import { db } from "@/lib/data/db";
 *   const reports = await db.report.findMany({ where: { campusId } });
 *
 * Transactions:
 *   await db.$transaction(async (tx) => {
 *     const report = await tx.report.create({ data: {...} });
 *     await tx.reportEvent.create({ data: {...} });
 *   });
 */

import { prisma } from "./prisma";
import { cache } from "./redis";

export const db = prisma;

/**
 * Invalidate cache patterns after a write operation.
 * Call this after any mutating DB operation.
 */
export async function invalidateCache(...patterns: string[]): Promise<void> {
    await Promise.all(patterns.map((p) => cache.invalidatePattern(p)));
}

export { cache } from "./redis";
export { prisma } from "./prisma";
export default db;
