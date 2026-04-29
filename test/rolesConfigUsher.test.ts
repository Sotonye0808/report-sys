import assert from "node:assert";
import { describe, it } from "node:test";
import { ROLE_CONFIG } from "../config/roles";
import { HIERARCHY_ORDER, UserRole } from "../types/global.js";

describe("USHER role configuration", () => {
    it("registers USHER in ROLE_CONFIG with quick-form mode", () => {
        const cfg = ROLE_CONFIG[UserRole.USHER];
        assert.ok(cfg, "USHER must exist in ROLE_CONFIG");
        assert.strictEqual(cfg.dashboardMode, "quick-form");
        assert.strictEqual(cfg.canQuickFormFill, true);
        assert.strictEqual(cfg.canCreateReports, false);
        assert.strictEqual(cfg.canManageAdminConfig, false);
        assert.strictEqual(cfg.reportVisibilityScope, "own");
    });

    it("places USHER below DATA_ENTRY in HIERARCHY_ORDER", () => {
        assert.ok(HIERARCHY_ORDER[UserRole.USHER] > HIERARCHY_ORDER[UserRole.DATA_ENTRY]);
    });

    it("keeps SUPERADMIN as the only role with canManageAdminConfig", () => {
        const adminCapable = (Object.keys(ROLE_CONFIG) as UserRole[])
            .filter((r) => ROLE_CONFIG[r].canManageAdminConfig === true);
        assert.deepStrictEqual(adminCapable, [UserRole.SUPERADMIN]);
    });

    it("flips higher-up roles to scope-overview dashboard mode", () => {
        const expected: UserRole[] = [
            UserRole.SPO,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.CHURCH_MINISTRY,
            UserRole.GROUP_PASTOR,
            UserRole.GROUP_ADMIN,
        ];
        for (const role of expected) {
            assert.strictEqual(
                ROLE_CONFIG[role].dashboardMode,
                "scope-overview",
                `${role} should land on scope-overview`,
            );
        }
    });
});
