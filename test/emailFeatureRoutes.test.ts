import assert from "node:assert";
import { describe, it } from "node:test";
import { API_ROUTES, APP_ROUTES } from "../config/routes.js";

describe("email verification and change routes", () => {
    it("exposes public verification landing path", () => {
        assert.strictEqual(APP_ROUTES.verifyEmail, "/verify-email");
    });

    it("exposes all auth API paths for verification and email change", () => {
        assert.strictEqual(API_ROUTES.auth.emailVerificationRequest, "/api/auth/email-verification/request");
        assert.strictEqual(API_ROUTES.auth.emailVerificationConfirm, "/api/auth/email-verification/confirm");
        assert.strictEqual(API_ROUTES.auth.emailVerificationStatus, "/api/auth/email-verification/status");
        assert.strictEqual(API_ROUTES.auth.emailChangeRequest, "/api/auth/email-change/request");
        assert.strictEqual(API_ROUTES.auth.emailChangeConfirm, "/api/auth/email-change/confirm");
    });
});
