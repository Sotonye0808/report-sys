import assert from "node:assert";
import { describe, it } from "node:test";

// The registry module imports React + a hook helper that triggers ESM-loader
// edge cases under tsx. Use dynamic import after stubbing the hook surface.
process.env.DATABASE_URL ??= "postgresql://localhost:5432/test_placeholder";

const mod = await import("../modules/dashboard/widgets/registry");
const { getWidget, resolveLayout, DEFAULT_LAYOUT } = mod;

describe("dashboard widget registry", () => {
    it("exposes the documented default widget set", () => {
        const ids = ["group-performance", "top-campus", "org-compliance", "recent-submissions", "pending-review-queue", "admin-quick-links"];
        for (const id of ids) {
            assert.ok(getWidget(id), `widget ${id} should be registered`);
        }
    });

    it("returns an unknown widget as undefined", () => {
        assert.strictEqual(getWidget("does-not-exist"), undefined);
    });

    it("resolves the global band by default for scope=all", () => {
        const layout = resolveLayout("all");
        assert.strictEqual(layout.bandKey, "scope-overview-global");
        assert.deepStrictEqual(
            layout.widgets.map((w) => w.id),
            DEFAULT_LAYOUT["scope-overview-global"],
        );
    });

    it("resolves the campus band for scope=campus", () => {
        const layout = resolveLayout("campus");
        assert.strictEqual(layout.bandKey, "scope-overview-campus");
    });

    it("honours layout overrides per band", () => {
        const layout = resolveLayout("group", {
            "scope-overview-group": ["top-campus", "recent-submissions"],
        });
        assert.deepStrictEqual(
            layout.widgets.map((w) => w.id),
            ["top-campus", "recent-submissions"],
        );
    });

    it("filters out unknown widget ids in an override silently", () => {
        const layout = resolveLayout("all", {
            "scope-overview-global": ["org-compliance", "made-up-widget", "top-campus"],
        });
        assert.deepStrictEqual(
            layout.widgets.map((w) => w.id),
            ["org-compliance", "top-campus"],
        );
    });
});
