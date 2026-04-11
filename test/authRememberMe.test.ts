import assert from "node:assert";
import { describe, it } from "node:test";
import {
  getAccessTokenExpiry,
  getRefreshTokenExpiry,
} from "../lib/utils/authSession";

describe("remember-me auth session config", () => {
  it("resolves longer expiries for remember-me sessions", () => {
    assert.strictEqual(getAccessTokenExpiry(false), "15m");
    assert.strictEqual(getRefreshTokenExpiry(false), "7d");
    assert.strictEqual(getAccessTokenExpiry(true), "30d");
    assert.strictEqual(getRefreshTokenExpiry(true), "90d");
  });
});
