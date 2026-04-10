import assert from "node:assert";
import { describe, it } from "node:test";
import { ROLE_CONFIG } from "../config/roles";
import { UserRole } from "../types/global.js";

describe("ROLE_CONFIG report visibility", () => {
  it("allows data entry to access all-campus reports", () => {
    assert.strictEqual(ROLE_CONFIG[UserRole.DATA_ENTRY].reportVisibilityScope, "all");
  });

  it("keeps campus pastor/admin scoped to campus", () => {
    assert.strictEqual(ROLE_CONFIG[UserRole.CAMPUS_ADMIN].reportVisibilityScope, "campus");
    assert.strictEqual(ROLE_CONFIG[UserRole.CAMPUS_PASTOR].reportVisibilityScope, "campus");
  });
});
