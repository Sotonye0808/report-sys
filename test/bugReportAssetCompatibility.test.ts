import assert from "node:assert";
import { describe, it } from "node:test";

function normalizeScreenshot(report: {
  screenshotUrl?: string | null;
  screenshotAsset?: { secureUrl?: string | null } | null;
}) {
  return report.screenshotAsset?.secureUrl ?? report.screenshotUrl ?? undefined;
}

describe("bug report screenshot migration compatibility", () => {
  it("prefers managed asset secureUrl over legacy screenshotUrl", () => {
    const value = normalizeScreenshot({
      screenshotUrl: "https://legacy.example/image.png",
      screenshotAsset: { secureUrl: "https://res.cloudinary.com/image/upload/v1/new.png" },
    });
    assert.strictEqual(value, "https://res.cloudinary.com/image/upload/v1/new.png");
  });

  it("falls back to legacy screenshotUrl when asset is absent", () => {
    const value = normalizeScreenshot({
      screenshotUrl: "https://legacy.example/image.png",
      screenshotAsset: null,
    });
    assert.strictEqual(value, "https://legacy.example/image.png");
  });

  it("returns undefined when both are missing", () => {
    const value = normalizeScreenshot({ screenshotUrl: null, screenshotAsset: null });
    assert.strictEqual(value, undefined);
  });
});
