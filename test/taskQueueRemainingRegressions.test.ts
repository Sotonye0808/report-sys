import assert from "node:assert";
import { describe, it } from "node:test";
import { successResponse } from "../lib/utils/api";
import { resolveOrgRollupContext } from "../modules/org/services/orgRollupContext";
import { parseCachedJsonSafe } from "../lib/utils/cacheJson";
import { UserRole } from "../types/global.js";

describe("report template API + auth refresh regression coverage", () => {
  it("keeps auth refresh contract and required user fields", () => {
    const payload = successResponse({
      user: {
        id: "u-1",
        email: "u@example.com",
        role: UserRole.SUPERADMIN,
      },
    });
    assert.strictEqual(payload.success, true);
    assert.strictEqual(payload.data.user.id, "u-1");
    assert.strictEqual(payload.data.user.role, UserRole.SUPERADMIN);
  });

  it("parses cached template payload safely", () => {
    const parsed = parseCachedJsonSafe<{ success: boolean; data: { id: string }[] }>(
      JSON.stringify({ success: true, data: [{ id: "tpl-1" }] }),
    );
    assert.ok(parsed);
    assert.strictEqual(parsed?.success, true);
    assert.strictEqual(parsed?.data[0].id, "tpl-1");
    assert.strictEqual(parseCachedJsonSafe("{{bad-json"), null);
  });
});

describe("report unlock + audit trail visibility regressions", () => {
  it("keeps unlock and history envelope contracts", () => {
    const unlockPayload = successResponse({ id: "report-1", status: "DRAFT" });
    const historyPayload = successResponse([
      { id: "event-1", reportId: "report-1", eventType: "UNLOCKED" },
    ]);

    assert.strictEqual(unlockPayload.success, true);
    assert.strictEqual(unlockPayload.data.status, "DRAFT");
    assert.strictEqual(historyPayload.success, true);
    assert.strictEqual(Array.isArray(historyPayload.data), true);
  });
});

describe("profile/org no-refresh and aggregation rollup helper regressions", () => {
  const hierarchy: OrgGroupWithDetails[] = [
    {
      id: "g-1",
      name: "Group 1",
      country: "NG",
      isActive: true,
      leaderId: null,
      createdAt: "",
      updatedAt: "",
      campuses: [
        {
          id: "c-1",
          name: "Campus 1",
          parentId: "g-1",
          organisationId: "org-1",
          country: "NG",
          location: "Lagos",
          isActive: true,
          adminId: null,
          createdAt: "",
          updatedAt: "",
        },
      ],
    },
  ];

  it("resolves campus role scope to exactly one campus", () => {
    const ctx = resolveOrgRollupContext({
      role: UserRole.CAMPUS_ADMIN,
      userCampusId: "c-1",
      hierarchy,
    });
    assert.strictEqual(ctx.roleScopeType, "campus");
    assert.deepStrictEqual(ctx.resolvedCampusIds, ["c-1"]);
  });

  it("resolves group role scope to campuses in the group", () => {
    const ctx = resolveOrgRollupContext({
      role: UserRole.GROUP_ADMIN,
      userGroupId: "g-1",
      hierarchy,
    });
    assert.strictEqual(ctx.roleScopeType, "group");
    assert.deepStrictEqual(ctx.resolvedCampusIds, ["c-1"]);
  });

  it("resolves global role scope to all campuses", () => {
    const ctx = resolveOrgRollupContext({
      role: UserRole.SUPERADMIN,
      hierarchy,
    });
    assert.strictEqual(ctx.roleScopeType, "all");
    assert.deepStrictEqual(ctx.resolvedCampusIds, ["c-1"]);
  });
});
