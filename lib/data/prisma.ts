/**
 * lib/data/prisma.ts
 * Prisma client singleton for server-side use.
 *
 * Prisma 7 uses the "client" engine type by default, which requires
 * accelerateUrl (Prisma Postgres / Accelerate) to be passed explicitly.
 */

import { PrismaClient } from "@/prisma/generated";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as typeof globalThis & {
    __prisma?: PrismaClient;
};

if (!globalForPrisma.__prisma) {
    const prismaConfig: ConstructorParameters<typeof PrismaClient>[0] = {
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    };

    // For local development and environments that don't use Prisma Data
    // Platform, avoid forcing accelerate URL to prevent external connection
    // attempts to accelerate.prisma-data.net.
    if (process.env.PRISMA_ACCELERATE_URL) {
        prismaConfig.accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
    } else {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error(
                "DATABASE_URL is required when PRISMA_ACCELERATE_URL is not configured"
            );
        }

        prismaConfig.adapter = new PrismaPg({ connectionString });
    }

    globalForPrisma.__prisma = new PrismaClient(prismaConfig);
}

export const prisma = globalForPrisma.__prisma;
export default prisma;
