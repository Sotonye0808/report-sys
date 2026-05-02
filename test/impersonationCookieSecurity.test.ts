import assert from "node:assert";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET ??= "dev-access-secret-change-me";
process.env.IMPERSONATION_TTL_MINUTES ??= "30";

const SECRET = process.env.JWT_SECRET!;

/**
 * Mirrors the sign/verify contract used inside lib/auth/impersonation.ts so we
 * can exercise the cryptographic guarantees without pulling the Prisma layer
 * (which would require DATABASE_URL + a live cookie store).
 */

describe("impersonation token signature", () => {
    it("is verifiable when signed with the right secret + audience", () => {
        const token = jwt.sign(
            { sessionId: "s1", superadminId: "u1", impersonatedRole: "GROUP_ADMIN", mode: "READ_ONLY" },
            SECRET,
            { expiresIn: 60, audience: "impersonation" },
        );
        const decoded = jwt.verify(token, SECRET, { audience: "impersonation" }) as Record<string, unknown>;
        assert.strictEqual(decoded.sessionId, "s1");
        assert.strictEqual(decoded.superadminId, "u1");
        assert.strictEqual(decoded.mode, "READ_ONLY");
    });

    it("rejects tokens signed with a different secret", () => {
        const token = jwt.sign({ sessionId: "s1" }, "evil-secret", {
            expiresIn: 60,
            audience: "impersonation",
        });
        assert.throws(() => jwt.verify(token, SECRET, { audience: "impersonation" }));
    });

    it("rejects tokens with the wrong audience", () => {
        const token = jwt.sign({ sessionId: "s1" }, SECRET, {
            expiresIn: 60,
            audience: "wrong",
        });
        assert.throws(() => jwt.verify(token, SECRET, { audience: "impersonation" }));
    });

    it("rejects tampered payloads", () => {
        const token = jwt.sign({ sessionId: "s1" }, SECRET, {
            expiresIn: 60,
            audience: "impersonation",
        });
        // Flip one character in the signature segment.
        const parts = token.split(".");
        parts[2] = parts[2].slice(0, -1) + (parts[2].slice(-1) === "a" ? "b" : "a");
        const tampered = parts.join(".");
        assert.throws(() => jwt.verify(tampered, SECRET, { audience: "impersonation" }));
    });

    it("rejects expired tokens", () => {
        const token = jwt.sign({ sessionId: "s1" }, SECRET, {
            expiresIn: -10,
            audience: "impersonation",
        });
        assert.throws(() => jwt.verify(token, SECRET, { audience: "impersonation" }));
    });
});
