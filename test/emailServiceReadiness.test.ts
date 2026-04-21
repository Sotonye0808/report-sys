import assert from "node:assert";
import { describe, it } from "node:test";
import { getAppUrl, isEmailServiceReady } from "../lib/utils/emailServiceReadiness.js";

describe("email service readiness helper", () => {
    it("returns true only when required env vars are present", () => {
        const previous = {
            RESEND_API_KEY: process.env.RESEND_API_KEY,
            EMAIL_FROM: process.env.EMAIL_FROM,
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        };

        process.env.RESEND_API_KEY = "re_test";
        process.env.EMAIL_FROM = "Harvesters <noreply@example.com>";
        process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
        assert.strictEqual(isEmailServiceReady(), true);

        delete process.env.RESEND_API_KEY;
        assert.strictEqual(isEmailServiceReady(), false);

        process.env.RESEND_API_KEY = previous.RESEND_API_KEY;
        process.env.EMAIL_FROM = previous.EMAIL_FROM;
        process.env.NEXT_PUBLIC_APP_URL = previous.NEXT_PUBLIC_APP_URL;
    });

    it("normalizes app URL by removing trailing slash", () => {
        const previous = process.env.NEXT_PUBLIC_APP_URL;
        process.env.NEXT_PUBLIC_APP_URL = "https://example.com/";
        assert.strictEqual(getAppUrl(), "https://example.com");
        process.env.NEXT_PUBLIC_APP_URL = previous;
    });
});
