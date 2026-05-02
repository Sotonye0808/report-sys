import assert from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const MIGRATION_PATH =
    "prisma/migrations/20260501120000_impersonation_sessions/migration.sql";

const FORBIDDEN_PATTERNS = [
    /\bDROP\s+TABLE\b/i,
    /\bDROP\s+COLUMN\b/i,
    /\bDROP\s+INDEX\b/i,
    /\bDROP\s+TYPE\b/i,
    /\bRENAME\b/i,
    /\bTRUNCATE\b/i,
];

function stripComments(sql: string): string {
    return sql
        .split(/\r?\n/)
        .map((line) => {
            const idx = line.indexOf("--");
            return idx >= 0 ? line.slice(0, idx) : line;
        })
        .join("\n");
}

describe("impersonation migration is additive-only", () => {
    const raw = readFileSync(MIGRATION_PATH, "utf8");
    const sql = stripComments(raw);

    it("contains no destructive operations (excluding comments)", () => {
        for (const pattern of FORBIDDEN_PATTERNS) {
            assert.ok(!pattern.test(sql), `Migration must not match ${pattern}`);
        }
    });

    it("creates the new tables with CREATE TABLE IF NOT EXISTS", () => {
        const creates = sql.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+"impersonation_(sessions|events)"/gi) ?? [];
        assert.strictEqual(creates.length, 2);
    });

    it("guards every new enum + FK with EXCEPTION duplicate_object", () => {
        const guards = sql.match(/EXCEPTION\s+WHEN\s+duplicate_object\s+THEN\s+null/gi) ?? [];
        assert.ok(guards.length >= 5, `expected guarded enum + FK blocks, found ${guards.length}`);
    });
});
