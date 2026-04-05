import { db } from "@/lib/data/db";
import { logServerError, logServerInfo, logServerWarn } from "@/lib/utils/serverLogger";
import {
  AssetDomain,
  AssetLifecycleEventType,
  AssetSessionState,
  AssetState,
  AssetUploadMode,
} from "@/types/global";
import type { Prisma } from "@/prisma/generated";
import { canDiscardSession, canFinalizeSession, canUploadToSession, isAssetDeletable } from "@/lib/assets/lifecycleStateMachine";
import {
  destroyImageFromCloudinary,
  isCloudinaryConfigured,
  uploadImageToCloudinary,
} from "@/lib/assets/cloudinaryAdapter";

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

const TEMP_TTL_HOURS = 24;

function tempExpiry(now = new Date()) {
  return new Date(now.getTime() + TEMP_TTL_HOURS * 60 * 60 * 1000);
}

async function appendEvent(tx: Tx, input: {
  eventType: AssetLifecycleEventType;
  sessionId?: string;
  assetId?: string;
  actorId?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}) {
  await tx.assetLifecycleEvent.create({
    data: {
      eventType: input.eventType,
      sessionId: input.sessionId,
      assetId: input.assetId,
      actorId: input.actorId,
      requestId: input.requestId,
      details: input.details as Prisma.InputJsonValue | undefined,
    },
  });
}

async function deleteCloudinaryWithTracking(assetId: string, requestId?: string) {
  const asset = await db.mediaAsset.findUnique({ where: { id: assetId } });
  if (!asset?.publicId) {
    return;
  }

  try {
    await destroyImageFromCloudinary({ publicId: asset.publicId, requestId });
    await db.$transaction(async (tx) => {
      await tx.mediaAsset.update({
        where: { id: asset.id },
        data: {
          state: AssetState.DELETED,
          discardedAt: asset.discardedAt ?? new Date(),
          expiresAt: null,
        },
      });
      await appendEvent(tx, {
        eventType: AssetLifecycleEventType.CLEANUP_DELETED,
        assetId: asset.id,
        requestId,
      });
    });
  } catch (error) {
    await db.$transaction(async (tx) => {
      await tx.mediaAsset.update({
        where: { id: asset.id },
        data: { state: AssetState.DELETE_PENDING },
      });
      await appendEvent(tx, {
        eventType: AssetLifecycleEventType.CLEANUP_FAILED,
        assetId: asset.id,
        requestId,
        details: { message: error instanceof Error ? error.message : "unknown" },
      });
    });

    logServerError("[asset-lifecycle] cloudinary delete failed", {
      requestId,
      assetId: asset.id,
      publicId: asset.publicId,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function createUploadSession(input: {
  ownerId: string;
  domain: AssetDomain;
  mode: AssetUploadMode;
  idempotencyKey?: string;
  requestId?: string;
}) {
  if (input.idempotencyKey) {
    const existing = await db.assetUploadSession.findFirst({
      where: {
        ownerId: input.ownerId,
        idempotencyKey: input.idempotencyKey,
      },
      include: { activeAsset: true },
    });

    if (existing) {
      return existing;
    }
  }

  const session = await db.$transaction(async (tx) => {
    const created = await tx.assetUploadSession.create({
      data: {
        ownerId: input.ownerId,
        domain: input.domain,
        mode: input.mode,
        idempotencyKey: input.idempotencyKey,
        requestId: input.requestId,
        expiresAt: tempExpiry(),
      },
      include: { activeAsset: true },
    });

    await appendEvent(tx, {
      eventType: AssetLifecycleEventType.SESSION_CREATED,
      sessionId: created.id,
      actorId: input.ownerId,
      requestId: input.requestId,
      details: { mode: input.mode },
    });

    return created;
  });

  logServerInfo("[asset-lifecycle] session created", {
    requestId: input.requestId,
    sessionId: session.id,
    ownerId: input.ownerId,
    mode: input.mode,
  });

  return session;
}

export async function uploadTempAssetToSession(input: {
  sessionId: string;
  ownerId: string;
  dataUrl: string;
  fileName?: string;
  mimeType?: string;
  requestId?: string;
}) {
  const session = await db.assetUploadSession.findUnique({
    where: { id: input.sessionId },
    include: { activeAsset: true },
  });

  if (!session || session.ownerId !== input.ownerId) {
    throw new Error("Upload session not found or access denied.");
  }

  if (!canUploadToSession(session.state as AssetSessionState)) {
    throw new Error("Upload session is not in an uploadable state.");
  }

  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured for uploads.");
  }

  const uploaded = await uploadImageToCloudinary({
    dataUrl: input.dataUrl,
    domain: session.domain as AssetDomain,
    fileName: input.fileName,
    requestId: input.requestId,
  });

  let oldAssetId: string | undefined;

  try {
    const result = await db.$transaction(async (tx) => {
      const asset = await tx.mediaAsset.create({
        data: {
          ownerId: input.ownerId,
          domain: session.domain,
          provider: "CLOUDINARY",
          state: AssetState.TEMP,
          publicId: uploaded.publicId,
          secureUrl: uploaded.secureUrl,
          resourceType: uploaded.resourceType,
          format: uploaded.format,
          bytes: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,
          mimeType: input.mimeType,
          originalFileName: input.fileName,
          folder: uploaded.folder,
          requestId: input.requestId,
          expiresAt: tempExpiry(),
        },
      });

      oldAssetId = session.activeAssetId ?? undefined;

      if (oldAssetId) {
        await tx.mediaAsset.update({
          where: { id: oldAssetId },
          data: {
            state: AssetState.DISCARDED,
            discardedAt: new Date(),
            expiresAt: tempExpiry(),
          },
        });
      }

      const updatedSession = await tx.assetUploadSession.update({
        where: { id: session.id },
        data: {
          activeAssetId: asset.id,
          state: AssetSessionState.TEMP_UPLOADED,
          expiresAt: tempExpiry(),
        },
        include: { activeAsset: true },
      });

      await appendEvent(tx, {
        eventType: AssetLifecycleEventType.TEMP_UPLOADED,
        sessionId: updatedSession.id,
        assetId: asset.id,
        actorId: input.ownerId,
        requestId: input.requestId,
      });

      return updatedSession;
    });

    if (oldAssetId) {
      void deleteCloudinaryWithTracking(oldAssetId, input.requestId);
    }

    logServerInfo("[asset-lifecycle] temp uploaded", {
      requestId: input.requestId,
      sessionId: result.id,
      assetId: result.activeAssetId,
      ownerId: input.ownerId,
    });
    return result;
  } catch (error) {
    try {
      await destroyImageFromCloudinary({ publicId: uploaded.publicId, requestId: input.requestId });
    } catch (compensationError) {
      logServerError("[asset-lifecycle] upload compensation failed", {
        requestId: input.requestId,
        publicId: uploaded.publicId,
        error:
          compensationError instanceof Error
            ? compensationError.message
            : "unknown",
      });
    }

    throw error;
  }
}

export async function finalizeUploadSession(input: {
  sessionId: string;
  ownerId: string;
  requestId?: string;
}) {
  const session = await db.assetUploadSession.findUnique({
    where: { id: input.sessionId },
    include: { activeAsset: true },
  });

  if (!session || session.ownerId !== input.ownerId) {
    throw new Error("Upload session not found or access denied.");
  }

  if (session.state === AssetSessionState.FINALIZED) {
    return session;
  }

  if (!canFinalizeSession(session.state as AssetSessionState)) {
    throw new Error("Upload session cannot be finalized in current state.");
  }

  if (!session.activeAssetId) {
    throw new Error("Cannot finalize a session without an uploaded asset.");
  }

  const finalized = await db.$transaction(async (tx) => {
    await tx.mediaAsset.update({
      where: { id: session.activeAssetId! },
      data: {
        state: AssetState.READY,
        finalizedAt: new Date(),
        expiresAt: null,
      },
    });

    const updated = await tx.assetUploadSession.update({
      where: { id: session.id },
      data: {
        state: AssetSessionState.FINALIZED,
        finalizedAt: new Date(),
        expiresAt: null,
      },
      include: { activeAsset: true },
    });

    await appendEvent(tx, {
      eventType: AssetLifecycleEventType.FINALIZED,
      sessionId: updated.id,
      assetId: updated.activeAssetId ?? undefined,
      actorId: input.ownerId,
      requestId: input.requestId,
    });

    return updated;
  });

  logServerInfo("[asset-lifecycle] session finalized", {
    requestId: input.requestId,
    sessionId: finalized.id,
    assetId: finalized.activeAssetId,
    ownerId: input.ownerId,
  });
  return finalized;
}

export async function discardUploadSession(input: {
  sessionId: string;
  ownerId: string;
  requestId?: string;
}) {
  const session = await db.assetUploadSession.findUnique({
    where: { id: input.sessionId },
    include: { activeAsset: true },
  });

  if (!session || session.ownerId !== input.ownerId) {
    throw new Error("Upload session not found or access denied.");
  }

  if (!canDiscardSession(session.state as AssetSessionState)) {
    throw new Error("Upload session cannot be discarded in current state.");
  }

  if (session.state === AssetSessionState.DISCARDED) {
    return session;
  }

  const discarded = await db.$transaction(async (tx) => {
    if (session.activeAssetId) {
      await tx.mediaAsset.update({
        where: { id: session.activeAssetId },
        data: {
          state: AssetState.DELETE_PENDING,
          discardedAt: new Date(),
          expiresAt: tempExpiry(),
        },
      });
    }

    const updated = await tx.assetUploadSession.update({
      where: { id: session.id },
      data: {
        state: AssetSessionState.DISCARDED,
        discardedAt: new Date(),
        expiresAt: tempExpiry(),
      },
      include: { activeAsset: true },
    });

    await appendEvent(tx, {
      eventType: AssetLifecycleEventType.DISCARDED,
      sessionId: updated.id,
      assetId: updated.activeAssetId ?? undefined,
      actorId: input.ownerId,
      requestId: input.requestId,
    });

    return updated;
  });

  if (discarded.activeAssetId) {
    void deleteCloudinaryWithTracking(discarded.activeAssetId, input.requestId);
  }

  logServerInfo("[asset-lifecycle] session discarded", {
    requestId: input.requestId,
    sessionId: discarded.id,
    assetId: discarded.activeAssetId,
    ownerId: input.ownerId,
  });
  return discarded;
}

export async function resolveReadyAssetForBugReport(input: {
  ownerId: string;
  screenshotAssetId?: string;
  screenshotDataUrl?: string;
  screenshotFileName?: string;
  screenshotMimeType?: string;
  requestId?: string;
}): Promise<{ asset: Awaited<ReturnType<typeof db.mediaAsset.findUnique>>; createdNow: boolean }> {
  if (input.screenshotAssetId && input.screenshotDataUrl) {
    throw new Error("Provide screenshotAssetId or screenshotDataUrl, not both.");
  }

  if (input.screenshotAssetId) {
    const existing = await db.mediaAsset.findUnique({ where: { id: input.screenshotAssetId } });
    if (!existing || existing.ownerId !== input.ownerId) {
      throw new Error("Screenshot asset not found or access denied.");
    }

    if (existing.state === AssetState.TEMP) {
      const updated = await db.mediaAsset.update({
        where: { id: existing.id },
        data: {
          state: AssetState.READY,
          finalizedAt: new Date(),
          expiresAt: null,
        },
      });
      return { asset: updated, createdNow: false };
    }

    if (existing.state === AssetState.READY) {
      return { asset: existing, createdNow: false };
    }

    throw new Error("Screenshot asset is not in a valid state for bug report submission.");
  }

  if (!input.screenshotDataUrl) {
    return { asset: null, createdNow: false };
  }

  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured for uploads.");
  }

  const uploaded = await uploadImageToCloudinary({
    dataUrl: input.screenshotDataUrl,
    domain: AssetDomain.BUG_REPORT_SCREENSHOT,
    fileName: input.screenshotFileName,
    requestId: input.requestId,
  });

  try {
    const created = await db.$transaction(async (tx) => {
      const asset = await tx.mediaAsset.create({
        data: {
          ownerId: input.ownerId,
          domain: AssetDomain.BUG_REPORT_SCREENSHOT,
          provider: "CLOUDINARY",
          state: AssetState.READY,
          publicId: uploaded.publicId,
          secureUrl: uploaded.secureUrl,
          resourceType: uploaded.resourceType,
          format: uploaded.format,
          bytes: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,
          mimeType: input.screenshotMimeType,
          originalFileName: input.screenshotFileName,
          folder: uploaded.folder,
          requestId: input.requestId,
          finalizedAt: new Date(),
          expiresAt: null,
        },
      });

      await appendEvent(tx, {
        eventType: AssetLifecycleEventType.FINALIZED,
        assetId: asset.id,
        actorId: input.ownerId,
        requestId: input.requestId,
        details: { source: "bug_report_submission" },
      });

      return asset;
    });
    return { asset: created, createdNow: true };
  } catch (error) {
    try {
      await destroyImageFromCloudinary({ publicId: uploaded.publicId, requestId: input.requestId });
      logServerWarn("[asset-lifecycle] compensated upload during bug report failure", {
        requestId: input.requestId,
        publicId: uploaded.publicId,
      });
    } catch (compensationError) {
      logServerError("[asset-lifecycle] compensation failed after bug report asset failure", {
        requestId: input.requestId,
        publicId: uploaded.publicId,
        error:
          compensationError instanceof Error
            ? compensationError.message
            : "unknown",
      });
    }

    throw error;
  }
}

export async function cleanupStaleTempAssets(input: {
  now?: Date;
  maxAgeHours?: number;
  requestId?: string;
  dryRun?: boolean;
}) {
  const now = input.now ?? new Date();
  const cutoff = new Date(now.getTime() - (input.maxAgeHours ?? TEMP_TTL_HOURS) * 60 * 60 * 1000);

  const staleAssets = await db.mediaAsset.findMany({
    where: {
      state: { in: [AssetState.TEMP, AssetState.DELETE_PENDING, AssetState.DISCARDED] },
      OR: [
        { expiresAt: { lte: now } },
        { createdAt: { lte: cutoff } },
      ],
    },
    select: { id: true, publicId: true, state: true },
    take: 200,
    orderBy: { createdAt: "asc" },
  });

  if (input.dryRun) {
    return {
      scanned: staleAssets.length,
      deleted: 0,
      failed: 0,
      staleAssetIds: staleAssets.map((asset) => asset.id),
    };
  }

  let deleted = 0;
  let failed = 0;

  for (const asset of staleAssets) {
    if (!isAssetDeletable(asset.state as AssetState)) {
      continue;
    }

    try {
      await deleteCloudinaryWithTracking(asset.id, input.requestId);
      deleted += 1;
    } catch {
      failed += 1;
    }
  }

  const result = {
    scanned: staleAssets.length,
    deleted,
    failed,
    staleAssetIds: staleAssets.map((asset) => asset.id),
  };
  logServerInfo("[asset-lifecycle] stale temp cleanup completed", {
    requestId: input.requestId,
    scanned: result.scanned,
    deleted: result.deleted,
    failed: result.failed,
  });
  return result;
}
