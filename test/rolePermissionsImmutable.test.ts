import assert from "node:assert";
import { describe, it } from "node:test";
import { sanitiseRoleConfigPayload, freezeSuperadmin } from "../lib/auth/permissions";
import { ROLE_CONFIG } from "../config/roles";
import { UserRole } from "../types/global.js";

describe("SUPERADMIN immutability", () => {
    it("rejects attempts to override superadmin label or critical capabilities", () => {
        const malicious = {
            [UserRole.SUPERADMIN]: {
                label: "Demoted",
                canManageAdminConfig: false,
                canLockReports: false,
                reportVisibilityScope: "own" as const,
            },
        };
        const cleaned = sanitiseRoleConfigPayload(malicious);
        const fallback = ROLE_CONFIG[UserRole.SUPERADMIN];
        const supplied = cleaned[UserRole.SUPERADMIN]!;
        assert.strictEqual(supplied.label, fallback.label);
        assert.strictEqual(supplied.canManageAdminConfig, fallback.canManageAdminConfig);
        assert.strictEqual(supplied.canLockReports, fallback.canLockReports);
        assert.strictEqual(supplied.reportVisibilityScope, fallback.reportVisibilityScope);
    });

    it("leaves non-superadmin role overrides untouched", () => {
        const benign = {
            [UserRole.GROUP_ADMIN]: { label: "Group Lead", canSetGoals: false },
        };
        const cleaned = sanitiseRoleConfigPayload(benign);
        assert.strictEqual(cleaned[UserRole.GROUP_ADMIN]!.label, "Group Lead");
        assert.strictEqual(cleaned[UserRole.GROUP_ADMIN]!.canSetGoals, false);
    });

    it("freezeSuperadmin restores immutable keys even when caller tries to override them", () => {
        const fallback = ROLE_CONFIG[UserRole.SUPERADMIN];
        const tampered: RoleConfig = {
            ...fallback,
            label: "Tampered",
            canManageAdminConfig: false,
            canLockReports: false,
            dashboardMode: "report-fill",
        };
        const frozen = freezeSuperadmin(tampered, fallback);
        assert.strictEqual(frozen.label, fallback.label);
        assert.strictEqual(frozen.canManageAdminConfig, fallback.canManageAdminConfig);
        assert.strictEqual(frozen.canLockReports, fallback.canLockReports);
        assert.strictEqual(frozen.dashboardMode, fallback.dashboardMode);
    });

    it("freezeSuperadmin is a no-op for non-superadmin roles", () => {
        const cfg = { ...ROLE_CONFIG[UserRole.GROUP_ADMIN], label: "Group Lead" };
        const out = freezeSuperadmin(cfg, ROLE_CONFIG[UserRole.GROUP_ADMIN]);
        assert.strictEqual(out.label, "Group Lead");
    });
});
