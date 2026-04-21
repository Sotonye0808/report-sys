import assert from "node:assert";
import { describe, it } from "node:test";
import { getNavItems } from "../config/nav.js";
import { UserRole } from "../types/global.js";

describe("inbox role parity", () => {
    it("shows inbox nav item for MEMBER", () => {
        const memberNav = getNavItems(UserRole.MEMBER);
        assert.ok(memberNav.some((item) => item.key === "inbox"));
    });

    it("shows inbox nav item for SUPERADMIN", () => {
        const superadminNav = getNavItems(UserRole.SUPERADMIN);
        assert.ok(superadminNav.some((item) => item.key === "inbox"));
    });
});
