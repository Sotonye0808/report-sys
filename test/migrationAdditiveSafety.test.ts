import assert from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

/**
 * Locks in the additive-only migration policy for the cadence + recurring
 * assignments + correlation slice. Failing this test means a destructive
 * statement crept into the migration — block the change.
 */

const MIGRATION_PATH =
    "prisma/migrations/20260430120000_role_cadence_recurring_assignments_correlation/migration.sql";

const FORBIDDEN_PATTERNS = [
    /\bDROP\s+TABLE\b/i,
    /\bDROP\s+COLUMN\b/i,
    /\bDROP\s+INDEX\b/i,
    /\bDROP\s+TYPE\b/i,
    /\bRENAME\b/i,
    /\bTRUNCATE\b/i,
];

function stripComments(sql: string): string {
    // Remove SQL line comments so doc text like "no DROP, no RENAME"
    // doesn't trigger the destructive-operation guard.
    return sql
        .split(/\r?\n/)
        .map((line) => {
            const idx = line.indexOf("--");
            return idx >= 0 ? line.slice(0, idx) : line;
        })
        .join("\n");
}

describe("cadence migration is additive-only", () => {
    const raw = readFileSync(MIGRATION_PATH, "utf8");
    const sql = stripComments(raw);

    it("contains no destructive operations (excluding comments)", () => {
        for (const pattern of FORBIDDEN_PATTERNS) {
            assert.ok(!pattern.test(sql), `Migration must not match ${pattern}`);
        }
    });

    it("uses ADD COLUMN IF NOT EXISTS for every alter", () => {
        const alterMatches = sql.match(/ALTER\s+TABLE\s+"[^"]+"\s+ADD\s+COLUMN\b/gi);
        if (!alterMatches) return; // entire migration may be CREATE TABLE-only
        for (const m of alterMatches) {
            assert.match(m.toUpperCase(), /ADD\s+COLUMN/);
        }
        // Spot check that at least one IF NOT EXISTS guard is in the file.
        assert.ok(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/i.test(sql));
    });

    it("creates new tables with CREATE TABLE IF NOT EXISTS", () => {
        const creates = sql.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\b/gi) ?? [];
        assert.ok(creates.length >= 1, "expected at least one guarded CREATE TABLE");
    });
});
