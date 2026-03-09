/**
 * lib/data/prisma.ts
 * Prisma client singleton for server-side use.
 *
 * Prisma 7 uses the "client" engine type by default, which requires
 * accelerateUrl (Prisma Postgres / Accelerate) to be passed explicitly.
 */

import { PrismaClient } from "@/prisma/generated";

const globalForPrisma = globalThis as typeof globalThis & {
    __prisma?: PrismaClient;
};

if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.__prisma;
export default prisma;
