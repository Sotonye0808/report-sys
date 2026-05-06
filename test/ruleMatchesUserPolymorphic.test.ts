/**
 * test/ruleMatchesUserPolymorphic.test.ts
 *
 * Validates the polymorphic upgrade to `ruleMatchesUser` so that legacy +
 * new-substrate scope encodings are interchangeable. Pure-function test;
 * no DB.
 *
 * Run: DATABASE_URL=postgresql://localhost:5432/test npx tsx test/ruleMatchesUserPolymorphic.test.ts
 */

import { ruleMatchesUser } from "../lib/data/formAssignmentRule";
import { UserRole } from "../types/global";

let failed = 0;
function assert(cond: unknown, label: string) {
    if (!cond) {
        failed += 1;
        console.error(`✗ ${label}`);
    } else {
        console.log(`✓ ${label}`);
    }
}

const baseRule = {
    role: UserRole.USHER,
    assigneeId: null,
    campusId: null,
    orgGroupId: null,
    campusIds: [] as string[],
    orgGroupIds: [] as string[],
    unitIds: [] as string[],
};

const baseUser = {
    id: "user-1",
    role: UserRole.USHER,
    campusId: null as string | null,
    orgGroupId: null as string | null,
    unitId: null as string | null,
};

// 1) Empty scope → applies to every USHER.
assert(
    ruleMatchesUser(baseRule, { ...baseUser, campusId: "campus-x" }),
    "empty scope matches every user with the right role",
);

// 2) Direct assignee match wins regardless of role/scope.
assert(
    ruleMatchesUser({ ...baseRule, assigneeId: "user-1", role: null }, baseUser),
    "direct assignee match wins",
);

// 3) Legacy single-value campusId gates the rule.
assert(
    ruleMatchesUser(
        { ...baseRule, campusId: "campus-A" },
        { ...baseUser, campusId: "campus-A" },
    ),
    "legacy single-value campusId scope matches",
);
assert(
    !ruleMatchesUser(
        { ...baseRule, campusId: "campus-A" },
        { ...baseUser, campusId: "campus-B" },
    ),
    "legacy single-value campusId rejects mismatched user",
);

// 4) Array campusIds.
assert(
    ruleMatchesUser(
        { ...baseRule, campusIds: ["campus-A", "campus-B"] },
        { ...baseUser, campusId: "campus-B" },
    ),
    "campusIds array matches user.campusId",
);

// 5) Polymorphic unitIds — campus UUIDs are also OrgUnit ids per the migration.
assert(
    ruleMatchesUser(
        { ...baseRule, unitIds: ["campus-A"] },
        { ...baseUser, campusId: "campus-A" },
    ),
    "unitIds matches via legacy user.campusId",
);
assert(
    ruleMatchesUser(
        { ...baseRule, unitIds: ["unit-Z"] },
        { ...baseUser, unitId: "unit-Z" },
    ),
    "unitIds matches via user.unitId",
);
assert(
    !ruleMatchesUser(
        { ...baseRule, unitIds: ["unit-Z"] },
        { ...baseUser, unitId: "unit-Q" },
    ),
    "unitIds rejects mismatched user.unitId",
);

// 6) Mixed encoding — some legacy + some polymorphic.
assert(
    ruleMatchesUser(
        { ...baseRule, campusIds: ["campus-A"], unitIds: ["unit-B"] },
        { ...baseUser, unitId: "unit-B" },
    ),
    "mixed legacy + polymorphic scope matches via either bucket",
);

// 7) Role mismatch.
assert(
    !ruleMatchesUser(baseRule, { ...baseUser, role: UserRole.MEMBER }),
    "role mismatch rejects",
);

if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed`);
    process.exit(1);
}
console.log("\nAll ruleMatchesUser polymorphic tests passed.");
