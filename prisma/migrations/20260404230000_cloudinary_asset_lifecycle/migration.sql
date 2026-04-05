-- CreateEnum
CREATE TYPE "AssetDomain" AS ENUM ('BUG_REPORT_SCREENSHOT');

-- CreateEnum
CREATE TYPE "AssetProvider" AS ENUM ('CLOUDINARY', 'LEGACY_URL');

-- CreateEnum
CREATE TYPE "AssetState" AS ENUM ('TEMP', 'READY', 'DISCARDED', 'DELETE_PENDING', 'DELETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AssetUploadMode" AS ENUM ('DEFERRED_SUBMIT', 'PREUPLOAD_DRAFT');

-- CreateEnum
CREATE TYPE "AssetSessionState" AS ENUM ('OPEN', 'TEMP_UPLOADED', 'FINALIZED', 'DISCARDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AssetLifecycleEventType" AS ENUM ('SESSION_CREATED', 'TEMP_UPLOADED', 'FINALIZED', 'DISCARDED', 'CLEANUP_DELETED', 'CLEANUP_FAILED', 'COMPENSATION_DELETED', 'COMPENSATION_FAILED');

-- AlterTable
ALTER TABLE "bug_reports" ADD COLUMN "screenshotAssetId" TEXT;

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "domain" "AssetDomain" NOT NULL,
    "provider" "AssetProvider" NOT NULL DEFAULT 'CLOUDINARY',
    "state" "AssetState" NOT NULL DEFAULT 'TEMP',
    "publicId" TEXT,
    "secureUrl" TEXT,
    "resourceType" TEXT DEFAULT 'image',
    "format" TEXT,
    "bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "mimeType" TEXT,
    "originalFileName" TEXT,
    "folder" TEXT,
    "metadata" JSONB,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "discardedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_upload_sessions" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "domain" "AssetDomain" NOT NULL,
    "mode" "AssetUploadMode" NOT NULL DEFAULT 'DEFERRED_SUBMIT',
    "state" "AssetSessionState" NOT NULL DEFAULT 'OPEN',
    "activeAssetId" TEXT,
    "idempotencyKey" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "discardedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "asset_upload_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_lifecycle_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "assetId" TEXT,
    "actorId" TEXT,
    "eventType" "AssetLifecycleEventType" NOT NULL,
    "details" JSONB,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_lifecycle_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_publicId_key" ON "media_assets"("publicId");

-- CreateIndex
CREATE INDEX "media_assets_ownerId_state_idx" ON "media_assets"("ownerId", "state");

-- CreateIndex
CREATE INDEX "media_assets_domain_state_idx" ON "media_assets"("domain", "state");

-- CreateIndex
CREATE INDEX "media_assets_createdAt_idx" ON "media_assets"("createdAt");

-- CreateIndex
CREATE INDEX "asset_upload_sessions_ownerId_state_idx" ON "asset_upload_sessions"("ownerId", "state");

-- CreateIndex
CREATE INDEX "asset_upload_sessions_domain_state_idx" ON "asset_upload_sessions"("domain", "state");

-- CreateIndex
CREATE INDEX "asset_upload_sessions_expiresAt_idx" ON "asset_upload_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "asset_upload_sessions_ownerId_idempotencyKey_key" ON "asset_upload_sessions"("ownerId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "asset_lifecycle_events_sessionId_createdAt_idx" ON "asset_lifecycle_events"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "asset_lifecycle_events_assetId_createdAt_idx" ON "asset_lifecycle_events"("assetId", "createdAt");

-- CreateIndex
CREATE INDEX "asset_lifecycle_events_eventType_createdAt_idx" ON "asset_lifecycle_events"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "bug_reports_screenshotAssetId_idx" ON "bug_reports"("screenshotAssetId");

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_screenshotAssetId_fkey" FOREIGN KEY ("screenshotAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_upload_sessions" ADD CONSTRAINT "asset_upload_sessions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_upload_sessions" ADD CONSTRAINT "asset_upload_sessions_activeAssetId_fkey" FOREIGN KEY ("activeAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_lifecycle_events" ADD CONSTRAINT "asset_lifecycle_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "asset_upload_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_lifecycle_events" ADD CONSTRAINT "asset_lifecycle_events_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_lifecycle_events" ADD CONSTRAINT "asset_lifecycle_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
