import assert from "node:assert";
import { describe, it } from "node:test";
import { sanitiseJoinRedirect } from "../lib/utils/joinRedirect";
import { APP_ROUTES } from "../config/routes";

describe("sanitiseJoinRedirect", () => {
    it("falls back to dashboard on null/empty/undefined", () => {
        assert.strictEqual(sanitiseJoinRedirect(null), APP_ROUTES.dashboard);
        assert.strictEqual(sanitiseJoinRedirect(undefined), APP_ROUTES.dashboard);
        assert.strictEqual(sanitiseJoinRedirect(""), APP_ROUTES.dashboard);
    });

    it("rejects protocol-relative and absolute URLs", () => {
        assert.strictEqual(sanitiseJoinRedirect("//evil.com"), APP_ROUTES.dashboard);
        assert.strictEqual(sanitiseJoinRedirect("http://evil.com/x"), APP_ROUTES.dashboard);
        assert.strictEqual(sanitiseJoinRedirect("https://evil.com/x"), APP_ROUTES.dashboard);
    });

    it("rejects targets that are not in the whitelist", () => {
        assert.strictEqual(sanitiseJoinRedirect("/users"), APP_ROUTES.dashboard);
        assert.strictEqual(sanitiseJoinRedirect("/admin-config"), APP_ROUTES.dashboard);
    });

    it("preserves whitelisted targets without query", () => {
        assert.strictEqual(
            sanitiseJoinRedirect(encodeURIComponent("/reports")),
            APP_ROUTES.reports,
        );
        assert.strictEqual(
            sanitiseJoinRedirect(encodeURIComponent("/quick-form")),
            APP_ROUTES.quickForm,
        );
    });

    it("filters query parameters to the per-target whitelist", () => {
        const out = sanitiseJoinRedirect(
            encodeURIComponent(
                "/reports/new?templateId=abc&period=2026-04&malicious=1&campusId=cmp",
            ),
        );
        assert.ok(out.startsWith(APP_ROUTES.reportNew + "?"));
        const query = new URLSearchParams(out.split("?")[1]);
        assert.strictEqual(query.get("templateId"), "abc");
        assert.strictEqual(query.get("period"), "2026-04");
        assert.strictEqual(query.get("campusId"), "cmp");
        assert.strictEqual(query.get("malicious"), null);
    });

    it("rejects user-info smuggling via @", () => {
        assert.strictEqual(
            sanitiseJoinRedirect(encodeURIComponent("/reports@evil.com")),
            APP_ROUTES.dashboard,
        );
    });

    it("returns fallback when query value exceeds the 200-char limit", () => {
        const longValue = "x".repeat(250);
        const out = sanitiseJoinRedirect(
            encodeURIComponent(`/reports/new?templateId=${longValue}`),
        );
        // overlong template id stripped; pathname still allowed
        assert.strictEqual(out, APP_ROUTES.reportNew);
    });
});
