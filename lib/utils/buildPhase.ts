/**
 * lib/utils/buildPhase.ts
 *
 * Tiny helper for detecting whether the current process is running inside
 * `next build`'s "Collecting page data" worker. Next.js sets
 * `process.env.NEXT_PHASE` to `"phase-production-build"` for that pass; we
 * use it to short-circuit data-substrate reads (admin-config, Redis cache)
 * so the build doesn't burn time on Redis timeouts + Prisma round-trips
 * that can never succeed in the build sandbox.
 *
 * Runtime behaviour stays unchanged — `NEXT_PHASE` is unset in production
 * server runs, so the substrate paths execute normally.
 */

export const NEXT_BUILD_PHASE = "phase-production-build" as const;

export function isBuildPhase(): boolean {
    return process.env.NEXT_PHASE === NEXT_BUILD_PHASE;
}
