import assert from "node:assert";
import { describe, it } from "node:test";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/test_placeholder";

import {
    renderTemplatePreview,
    sanitiseEmailTemplatesPayload,
} from "../lib/email/templates/render";
import { EMAIL_TEMPLATE_DEFINITIONS } from "../lib/email/templates/definitions";

describe("renderTemplatePreview", () => {
    it("substitutes registered variables in subject + html", () => {
        const def = EMAIL_TEMPLATE_DEFINITIONS.invite;
        const result = renderTemplatePreview(def.id, {
            inviterName: "Pastor Sample",
            role: "Campus Admin",
            joinUrl: "https://example.com/join?token=t",
        });
        assert.ok(result);
        assert.match(result!.subject, /Harvesters Reporting/);
        assert.match(result!.html, /Pastor Sample/);
        assert.match(result!.html, /Campus Admin/);
        assert.match(result!.html, /https:\/\/example\.com\/join\?token=t/);
    });

    it("leaves unknown placeholders literal and reports them as missing", () => {
        const result = renderTemplatePreview(
            "invite",
            { inviterName: "X", role: "Y", joinUrl: "z" },
            {
                subject: "Hi {{inviterName}} — {{unknown_var}}",
                html: "<p>{{role}} — {{also_unknown}}</p>",
            },
        );
        assert.ok(result);
        // Unknown placeholders must remain literal
        assert.match(result!.subject, /\{\{unknown_var\}\}/);
        assert.match(result!.html, /\{\{also_unknown\}\}/);
        // Known placeholders are still substituted
        assert.match(result!.subject, /^Hi X/);
        assert.match(result!.html, /Y/);
    });

    it("reports missing variable values when value is undefined", () => {
        const result = renderTemplatePreview(
            "invite",
            { inviterName: "X", role: "", joinUrl: undefined },
        );
        assert.ok(result);
        assert.ok(result!.missingVars.includes("role"));
        assert.ok(result!.missingVars.includes("joinUrl"));
    });

    it("uses override subject + html when provided", () => {
        const result = renderTemplatePreview(
            "invite",
            { inviterName: "X", role: "Y", joinUrl: "z" },
            { subject: "Override subject", html: "<p>Override body</p>" },
        );
        assert.ok(result);
        assert.strictEqual(result!.subject, "Override subject");
        assert.match(result!.html, /Override body/);
        assert.strictEqual(result!.fromOverride, true);
    });

    it("returns null for unknown templateId", () => {
        const result = renderTemplatePreview("does-not-exist", {});
        assert.strictEqual(result, null);
    });
});

describe("sanitiseEmailTemplatesPayload", () => {
    it("drops template ids unknown to the registry", () => {
        const out = sanitiseEmailTemplatesPayload({
            overrides: {
                invite: { subject: "Override" },
                unknownThing: { subject: "Should be removed" },
            },
        });
        assert.ok(out.overrides);
        assert.ok(out.overrides!.invite);
        assert.strictEqual(out.overrides!.unknownThing, undefined);
    });

    it("drops empty entries (no subject and no html)", () => {
        const out = sanitiseEmailTemplatesPayload({
            overrides: {
                invite: {},
            },
        });
        assert.strictEqual(out.overrides!.invite, undefined);
    });

    it("preserves only subject when only subject is supplied", () => {
        const out = sanitiseEmailTemplatesPayload({
            overrides: {
                invite: { subject: "Just subject" },
            },
        });
        assert.deepStrictEqual(out.overrides!.invite, { subject: "Just subject" });
    });
});
