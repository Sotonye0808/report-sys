/**
 * scripts/seed-roles-and-units.ts
 *
 * Idempotent seeder for the runtime substrate added in the
 * `20260505120000_org_role_polymorphism_and_imports_xlsx` migration.
 *
 * Run after the migration:
 *
 *   npx tsx scripts/seed-roles-and-units.ts
 *   # or in dry-run mode (no writes; reports what would happen):
 *   npx tsx scripts/seed-roles-and-units.ts --dry
 *
 * What this does:
 *   - Mirrors every existing OrgGroup → OrgUnit (level=GROUP) by UUID.
 *   - Mirrors every existing Campus → OrgUnit (level=CAMPUS) by UUID.
 *   - Seeds a Role row for every UserRole enum value with capabilities + label
 *     pulled from `config/roles.ts` (SUPERADMIN gets `isSystem=true`).
 *   - Back-fills `User.roleId`, `User.unitId`, `Report.unitId`,
 *     `InviteLink.unitId`, `FormAssignmentRule.roleId` + `unitIds` from the
 *     legacy columns.
 *
 * Safe to re-run. Never overwrites a populated value, never touches legacy
 * tables. The same logic powers the admin "Reconcile" action in Admin Config.
 */

import "dotenv/config";
import { reconcileSubstrate } from "../lib/data/reconcile";

const DRY = process.argv.includes("--dry") || process.argv.includes("--dry-run");

async function main() {
    console.log(`[seed-roles-and-units] ${DRY ? "DRY-RUN — no writes" : "Reconciling substrate"}`);
    const report = await reconcileSubstrate({ dryRun: DRY });
    console.log(JSON.stringify(report, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("[seed-roles-and-units] Error:", e);
        process.exit(1);
    });
