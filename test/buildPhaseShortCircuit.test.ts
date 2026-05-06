/**
 * test/buildPhaseShortCircuit.test.ts
 *
 * Validates the build-phase short-circuit added to `loadAdminConfig`.
 * Run:  DATABASE_URL=postgresql://localhost:5432/test npx tsx test/buildPhaseShortCircuit.test.ts
 */

let failed = 0;
function assert(cond: unknown, label: string) {
    if (!cond) {
        failed += 1;
        console.error(`✗ ${label}`);
    } else {
        console.log(`✓ ${label}`);
    }
}

async function main() {
    // Set NEXT_PHASE before importing — buildPhase reads on each call.
    process.env.NEXT_PHASE = "phase-production-build";
    const { isBuildPhase, NEXT_BUILD_PHASE } = await import("../lib/utils/buildPhase");
    assert(NEXT_BUILD_PHASE === "phase-production-build", "build phase constant");
    assert(isBuildPhase() === true, "isBuildPhase returns true under NEXT_PHASE=phase-production-build");

    // Now load adminConfig — should return the typed fallback without
    // touching DB / Redis at all (those calls would normally throw or
    // log noisy errors against an unreachable Postgres / Redis instance).
    const { loadAdminConfig } = await import("../lib/data/adminConfig");
    const snap = await loadAdminConfig("landing");
    assert(snap.source === "fallback", "loadAdminConfig short-circuits to fallback in build phase");
    assert(snap.version === 0, "fallback returns version 0");
    assert(snap.payload && typeof snap.payload === "object", "fallback payload is an object");

    // Different namespace; same short-circuit.
    const aboutSnap = await loadAdminConfig("aboutPage");
    assert(aboutSnap.source === "fallback", "build phase short-circuits aboutPage too");

    // Reset for hygiene.
    delete process.env.NEXT_PHASE;
    assert(isBuildPhase() === false, "isBuildPhase returns false after env unset");

    if (failed > 0) {
        console.error(`\n${failed} assertion(s) failed`);
        process.exit(1);
    }
    console.log("\nAll build-phase short-circuit tests passed.");
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});
