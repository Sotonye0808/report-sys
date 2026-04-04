import { AssetSessionState, AssetState } from "@/types/global";

export function canUploadToSession(state: AssetSessionState): boolean {
  return state === AssetSessionState.OPEN || state === AssetSessionState.TEMP_UPLOADED;
}

export function canFinalizeSession(state: AssetSessionState): boolean {
  return state === AssetSessionState.TEMP_UPLOADED || state === AssetSessionState.FINALIZED;
}

export function canDiscardSession(state: AssetSessionState): boolean {
  return (
    state === AssetSessionState.OPEN ||
    state === AssetSessionState.TEMP_UPLOADED ||
    state === AssetSessionState.DISCARDED ||
    state === AssetSessionState.FINALIZED
  );
}

export function isAssetReady(state: AssetState): boolean {
  return state === AssetState.READY;
}

export function isAssetTemporary(state: AssetState): boolean {
  return state === AssetState.TEMP;
}

export function isAssetDeletable(state: AssetState): boolean {
  return (
    state === AssetState.TEMP ||
    state === AssetState.READY ||
    state === AssetState.DELETE_PENDING ||
    state === AssetState.DISCARDED
  );
}
