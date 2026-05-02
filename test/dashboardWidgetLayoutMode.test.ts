import assert from "node:assert";
import { describe, it } from "node:test";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/test_placeholder";

const { resolveLayout, DEFAULT_LAYOUT, getWidget } = await import(
    "../modules/dashboard/widgets/registry"
);

describe("dashboard layout — quick-form mode + new widgets", () => {
    it("resolves the quick-form-self band when mode='quick-form'", () => {
        const layout = resolveLayout("own", undefined, "quick-form");
        assert.strictEqual(layout.bandKey, "quick-form-self");
        assert.deepStrictEqual(
            layout.widgets.map((w) => w.id),
            DEFAULT_LAYOUT["quick-form-self"],
        );
    });

    it("includes new chart widgets in the global scope band by default", () => {
        const layout = resolveLayout("all");
        const ids = layout.widgets.map((w) => w.id);
        assert.ok(ids.includes("top-campus-chart"));
        assert.ok(ids.includes("metric-trend-spark"));
        assert.ok(ids.includes("insight-summary"));
    });

    it("registers usher-quick-form widget so the inline form can render", () => {
        const widget = getWidget("usher-quick-form");
        assert.ok(widget);
        assert.strictEqual(widget!.id, "usher-quick-form");
    });

    it("falls back to overview band when mode is something other than quick-form", () => {
        const layout = resolveLayout("group", undefined, "scope-overview");
        assert.strictEqual(layout.bandKey, "scope-overview-group");
    });
});
