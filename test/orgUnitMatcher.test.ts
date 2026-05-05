/**
 * test/orgUnitMatcher.test.ts
 *
 * Pure-function checks on the orgUnitMatcher's `mergeLegacyScope` helper —
 * the part that runs without any DB. The full `unitInScope` path is covered
 * by integration tests once the Prisma test harness is available.
 *
 *   npx tsx test/orgUnitMatcher.test.ts
 */

import { mergeLegacyScope } from "../lib/data/orgUnitMatcher";

let failed = 0;
function assertEq<T>(actual: T, expected: T, label: string) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
        failed += 1;
        console.error(`✗ ${label}\n  expected: ${e}\n  actual:   ${a}`);
    } else {
        console.log(`✓ ${label}`);
    }
}

// All-empty input collapses to an empty array.
assertEq(mergeLegacyScope({}), [], "empty input → []");

// Legacy single-value campusId + orgGroupId merge into an array.
assertEq(
    mergeLegacyScope({ campusId: "c1", orgGroupId: "g1" }),
    ["c1", "g1"],
    "legacy single-value scope merges into array",
);

// Array fields combined with legacy single-values, deduplicated.
assertEq(
    mergeLegacyScope({
        unitIds: ["u1", "u2"],
        campusIds: ["c1"],
        campusId: "c1", // duplicate of campusIds[0]
        orgGroupIds: ["g1"],
        orgGroupId: "g2",
    }).sort(),
    ["c1", "g1", "g2", "u1", "u2"],
    "array + single-value merge with dedupe",
);

// Falsy entries dropped.
assertEq(
    mergeLegacyScope({
        unitIds: ["u1", "", "u2"],
        campusIds: [null as never, "c1"],
        campusId: undefined as unknown as string,
    }).sort(),
    ["c1", "u1", "u2"],
    "falsy entries are filtered out",
);

if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed`);
    process.exit(1);
}
console.log("\nAll orgUnitMatcher unit tests passed.");
