import assert from "node:assert";
import { describe, it } from "node:test";

/**
 * Smoke-level test for the admin-config loader. Verifies the substrate-disabled
 * branch (no DB connection required), exercises the registered fallbacks, and
 * sanity-checks that AdminConfigConflictError carries useful context.
 *
 * Full DB-hit + cache + invalidation coverage is queued for the integration
 * layer once a Prisma test harness is in place.
 */

// Prisma client requires DATABASE_URL to be defined at module load even if no
// connection is opened. Provide a benign placeholder for the substrate-disabled
// branch.
process.env.DATABASE_URL ??= "postgresql://localhost:5432/test_placeholder";

const adminConfigModule = await import("../lib/data/adminConfig");
const { loadAdminConfig, AdminConfigConflictError } = adminConfigModule;
type AdminConfigNamespaceName = Parameters<typeof loadAdminConfig>[0];

describe("adminConfig loader (substrate disabled)", () => {
    const previous = process.env.ADMIN_CONFIG_DB_ENABLED;

    it("returns fallback payloads when ADMIN_CONFIG_DB_ENABLED=false", async () => {
        process.env.ADMIN_CONFIG_DB_ENABLED = "false";
        const namespaces: AdminConfigNamespaceName[] = [
            "roles",
            "hierarchy",
            "dashboardLayout",
            "templatesMapping",
            "imports",
            "pwaInstall",
            "bulkInvites",
            "analytics",
        ];
        for (const ns of namespaces) {
            const snap = await loadAdminConfig(ns);
            assert.strictEqual(snap.namespace, ns);
            assert.strictEqual(snap.source, "fallback");
            assert.strictEqual(snap.version, 0);
            assert.ok(snap.payload && typeof snap.payload === "object");
        }
        process.env.ADMIN_CONFIG_DB_ENABLED = previous;
    });

    it("AdminConfigConflictError carries namespace + version context", () => {
        const err = new AdminConfigConflictError("roles", 1, 3);
        assert.strictEqual(err.name, "AdminConfigConflictError");
        assert.strictEqual(err.namespace, "roles");
        assert.strictEqual(err.expectedVersion, 1);
        assert.strictEqual(err.actualVersion, 3);
        assert.match(err.message, /roles/);
        assert.match(err.message, /v1/);
        assert.match(err.message, /v3/);
    });
});
