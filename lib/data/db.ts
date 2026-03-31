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

import { PrismaClient } from "@/prisma/generated";
import { PrismaPg } from "@prisma/adapter-pg";
import { prisma } from "./prisma";
import { cache } from "./redis";

function isPrismaTimeoutError(err: unknown): boolean {
    if (!err || typeof err !== "object") return false;
    const code = (err as any).code;
    return code === "ETIMEDOUT" || code === "P1001" || code === "P1010";
}

function createFallbackClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL is required for Prisma fallback");
    }

    return new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
}

async function withFallback<T>(
    runPrimary: () => Promise<T>,
    modelName?: string,
    methodName?: string,
    args?: unknown[],
) {
    try {
        return await runPrimary();
    } catch (err) {
        if (!isPrismaTimeoutError(err) || !process.env.DATABASE_URL) {
            throw err;
        }

        const fallback = createFallbackClient();
        try {
            if (modelName && methodName) {
                const modelDelegate = (fallback as any)[modelName];
                const fallbackMethod = modelDelegate?.[methodName];
                if (typeof fallbackMethod === "function") {
                    return await fallbackMethod.apply(modelDelegate, args);
                }
            }

            if (methodName && typeof (fallback as any)[methodName] === "function") {
                return await (fallback as any)[methodName].apply(fallback, args);
            }

            throw err;
        } finally {
            await fallback.$disconnect();
        }
    }
}

const dbProxy = new Proxy(prisma, {
    get(target, prop) {
        const value = (target as any)[prop];

        if (typeof value === "function") {
            return async (...args: any[]) =>
                withFallback(() => (value as any).apply(target, args), undefined, prop as string, args);
        }

        if (value && typeof value === "object") {
            return new Proxy(value, {
                get(modelTarget, method) {
                    const methodValue = (modelTarget as any)[method];
                    if (typeof methodValue === "function") {
                        return async (...args: any[]) =>
                            withFallback(
                                () => (methodValue as any).apply(modelTarget, args),
                                prop as string,
                                method as string,
                                args,
                            );
                    }
                    return methodValue;
                },
            });
        }

        return value;
    },
});

export const db = dbProxy as unknown as PrismaClient;

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
