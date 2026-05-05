/**
 * test/publicCopySanitise.test.ts
 *
 * Sanitisation contract for the publicCopy substrate. Run with:
 *   npx tsx test/publicCopySanitise.test.ts
 */

import { sanitisePublicCopyPayload } from "../lib/data/publicCopy";

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

// 1) Strips <script> blocks.
assertEq(
    sanitisePublicCopyPayload("Hello <script>alert(1)</script> world"),
    "Hello  world",
    "drops <script> ... </script>",
);

// 2) Strips standalone <script src="..."> tags too.
assertEq(
    sanitisePublicCopyPayload('Hi <script src="evil.js"> there'),
    "Hi  there",
    "drops standalone <script src=...> tag",
);

// 3) Neutralises javascript: URLs.
assertEq(
    sanitisePublicCopyPayload("Click javascript:alert(1) here"),
    "Click blocked:alert(1) here",
    "neutralises javascript: pseudo-protocol",
);

// 4) Strips protocol-relative // prefix.
assertEq(
    sanitisePublicCopyPayload("//evil.example/path"),
    "/evil.example/path",
    "collapses //evil to /evil",
);

// 5) Recurses into objects + arrays.
assertEq(
    sanitisePublicCopyPayload({
        title: "Hi <script>x</script> there",
        sections: [{ heading: "javascript:bad", body: "ok" }],
    }),
    {
        title: "Hi  there",
        sections: [{ heading: "blocked:bad", body: "ok" }],
    },
    "recurses into nested objects + arrays",
);

// 6) Leaves clean strings + non-strings untouched.
assertEq(sanitisePublicCopyPayload("Plain copy."), "Plain copy.", "no-op on clean string");
assertEq(sanitisePublicCopyPayload(42 as unknown as string), 42 as never, "passes through numbers");
assertEq(sanitisePublicCopyPayload(null as unknown as string), null as never, "passes through null");

if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed`);
    process.exit(1);
}
console.log("\nAll publicCopy sanitisation tests passed.");
