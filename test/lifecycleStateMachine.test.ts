import assert from "node:assert";
import { describe, it } from "node:test";
import {
  canDiscardSession,
  canFinalizeSession,
  canUploadToSession,
  isAssetDeletable,
  isAssetReady,
  isAssetTemporary,
} from "../lib/assets/lifecycleStateMachine";
import { AssetSessionState, AssetState } from "../types/global";

describe("asset lifecycle state machine", () => {
  it("supports upload transitions", () => {
    assert.strictEqual(canUploadToSession(AssetSessionState.OPEN), true);
    assert.strictEqual(canUploadToSession(AssetSessionState.TEMP_UPLOADED), true);
    assert.strictEqual(canUploadToSession(AssetSessionState.FINALIZED), false);
  });

  it("supports idempotent finalize and discard guards", () => {
    assert.strictEqual(canFinalizeSession(AssetSessionState.TEMP_UPLOADED), true);
    assert.strictEqual(canFinalizeSession(AssetSessionState.FINALIZED), true);
    assert.strictEqual(canDiscardSession(AssetSessionState.DISCARDED), true);
    assert.strictEqual(canDiscardSession(AssetSessionState.OPEN), true);
  });

  it("classifies asset states for cleanup/final checks", () => {
    assert.strictEqual(isAssetReady(AssetState.READY), true);
    assert.strictEqual(isAssetTemporary(AssetState.TEMP), true);
    assert.strictEqual(isAssetDeletable(AssetState.DELETE_PENDING), true);
    assert.strictEqual(isAssetDeletable(AssetState.DELETED), false);
  });
});
