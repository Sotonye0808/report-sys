import assert from "node:assert";
import { describe, it } from "node:test";
import { ROLE_CONFIG } from "../config/roles";
import { UserRole } from "../types/global.js";

describe("ROLE_CONFIG report visibility", () => {
  it("keeps data entry users scoped to own reports", () => {
    assert.strictEqual(ROLE_CONFIG[UserRole.DATA_ENTRY].reportVisibilityScope, "own");
  });

  it("keeps campus pastor/admin scoped to campus", () => {
    assert.strictEqual(ROLE_CONFIG[UserRole.CAMPUS_ADMIN].reportVisibilityScope, "campus");
    assert.strictEqual(ROLE_CONFIG[UserRole.CAMPUS_PASTOR].reportVisibilityScope, "campus");
  });

  it("keeps group pastor/admin scoped to group", () => {
    assert.strictEqual(ROLE_CONFIG[UserRole.GROUP_ADMIN].reportVisibilityScope, "group");
    assert.strictEqual(ROLE_CONFIG[UserRole.GROUP_PASTOR].reportVisibilityScope, "group");
  });
});
