import assert from "node:assert";
import { describe, it } from "node:test";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/test_placeholder";
process.env.JWT_SECRET ??= "dev-access-secret-change-me";

const { assertNotReadOnly } = await import("../lib/auth/permissions");
import { UserRole } from "../types/global.js";

function makeAuth(opts: { mode: "READ_ONLY" | "MUTATE" | null }): { user: AuthUser } {
    const impersonation = opts.mode
        ? {
              sessionId: "session-1",
              impersonatedRole: UserRole.GROUP_ADMIN,
              mode: opts.mode,
              expiresAt: new Date(Date.now() + 60_000).toISOString(),
          }
        : undefined;
    return {
        user: {
            id: "u1",
            email: "su@example.com",
            firstName: "S",
            lastName: "A",
            role: opts.mode ? UserRole.GROUP_ADMIN : UserRole.SUPERADMIN,
            actualRole: UserRole.SUPERADMIN,
            impersonation,
        },
    };
}

function makeReq(method: string, pathname: string) {
    return { method, url: `http://localhost${pathname}` };
}

describe("assertNotReadOnly", () => {
    it("allows GET requests under READ_ONLY impersonation", async () => {
        const out = await assertNotReadOnly(makeAuth({ mode: "READ_ONLY" }), makeReq("GET", "/api/reports"));
        assert.strictEqual(out.ok, true);
    });

    it("allows mutating requests when not impersonating", async () => {
        const out = await assertNotReadOnly(makeAuth({ mode: null }), makeReq("POST", "/api/reports"));
        assert.strictEqual(out.ok, true);
    });

    it("allows mutating requests in MUTATE mode", async () => {
        const out = await assertNotReadOnly(makeAuth({ mode: "MUTATE" }), makeReq("POST", "/api/reports"));
        assert.strictEqual(out.ok, true);
    });

    it("blocks POST/PUT/PATCH/DELETE in READ_ONLY mode with the documented code", async () => {
        for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
            const out = await assertNotReadOnly(makeAuth({ mode: "READ_ONLY" }), makeReq(method, "/api/reports"));
            assert.strictEqual(out.ok, false, `${method} should be blocked`);
            assert.strictEqual(out.code, "impersonation_readonly");
            assert.match(out.message ?? "", /read-only/i);
        }
    });

    it("allows allowlisted safe writes (notifications/read, impersonation/{stop,me})", async () => {
        const allowlist = [
            ["POST", "/api/notifications/abc-1234/read"],
            ["POST", "/api/notifications/read-all"],
            ["POST", "/api/impersonation/stop"],
            ["POST", "/api/impersonation/me"],
            ["POST", "/api/auth/logout"],
            ["POST", "/api/auth/refresh"],
        ] as const;
        for (const [method, path] of allowlist) {
            const out = await assertNotReadOnly(makeAuth({ mode: "READ_ONLY" }), makeReq(method, path));
            assert.strictEqual(out.ok, true, `${method} ${path} should be on the allowlist`);
        }
    });
});
