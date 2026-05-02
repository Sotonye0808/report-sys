-- Admin Config + Quick Forms + Imports + Bulk Invites + PWA + Activation
-- Adds USHER role + new domain models. Non-destructive.

-- AlterEnum: add USHER to UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'USHER';

-- CreateEnum: ImportJobStatus
DO $$ BEGIN
    CREATE TYPE "ImportJobStatus" AS ENUM ('DRAFT', 'FILE_UPLOADED', 'MAPPED', 'VALIDATED', 'COMMITTED', 'FAILED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: ImportRowOutcome
DO $$ BEGIN
    CREATE TYPE "ImportRowOutcome" AS ENUM ('OK', 'WARNING', 'ERROR', 'COMMITTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: BulkInviteKind
DO $$ BEGIN
    CREATE TYPE "BulkInviteKind" AS ENUM ('INVITE_LINK', 'PRE_REGISTER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: PwaPromptKind
DO $$ BEGIN
    CREATE TYPE "PwaPromptKind" AS ENUM ('INSTALL', 'PUSH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: PwaPromptPlatform
DO $$ BEGIN
    CREATE TYPE "PwaPromptPlatform" AS ENUM ('IOS', 'ANDROID', 'DESKTOP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: PwaDismissalMode
DO $$ BEGIN
    CREATE TYPE "PwaDismissalMode" AS ENUM ('snooze', 'never');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable: invite_links add batchId + recipientEmail
ALTER TABLE "invite_links"
    ADD COLUMN IF NOT EXISTS "recipientEmail" TEXT,
    ADD COLUMN IF NOT EXISTS "batchId" TEXT;

-- CreateTable: admin_config_entries
CREATE TABLE IF NOT EXISTS "admin_config_entries" (
    "id"         TEXT PRIMARY KEY,
    "namespace"  TEXT NOT NULL,
    "version"    INTEGER NOT NULL DEFAULT 1,
    "payload"    JSONB NOT NULL,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "actorId"    TEXT,
    "notes"      TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "admin_config_entries_namespace_version_idx" ON "admin_config_entries" ("namespace", "version");
CREATE INDEX IF NOT EXISTS "admin_config_entries_namespace_createdAt_idx" ON "admin_config_entries" ("namespace", "createdAt");
ALTER TABLE "admin_config_entries"
    ADD CONSTRAINT "admin_config_entries_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: form_assignments
CREATE TABLE IF NOT EXISTS "form_assignments" (
    "id"           TEXT PRIMARY KEY,
    "reportId"     TEXT NOT NULL,
    "assigneeId"   TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "metricIds"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "dueAt"        TIMESTAMP(3),
    "completedAt"  TIMESTAMP(3),
    "cancelledAt"  TIMESTAMP(3),
    "notes"        TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "form_assignments_assigneeId_completedAt_idx" ON "form_assignments" ("assigneeId", "completedAt");
CREATE INDEX IF NOT EXISTS "form_assignments_reportId_idx" ON "form_assignments" ("reportId");
ALTER TABLE "form_assignments"
    ADD CONSTRAINT "form_assignments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "form_assignments_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "form_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: import_mapping_profiles (referenced by import_jobs)
CREATE TABLE IF NOT EXISTS "import_mapping_profiles" (
    "id"         TEXT PRIMARY KEY,
    "ownerId"    TEXT NOT NULL,
    "templateId" TEXT,
    "name"       TEXT NOT NULL,
    "mapping"    JSONB NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "import_mapping_profiles_ownerId_templateId_idx" ON "import_mapping_profiles" ("ownerId", "templateId");
ALTER TABLE "import_mapping_profiles"
    ADD CONSTRAINT "import_mapping_profiles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: import_jobs
CREATE TABLE IF NOT EXISTS "import_jobs" (
    "id"                TEXT PRIMARY KEY,
    "ownerId"           TEXT NOT NULL,
    "templateId"        TEXT,
    "status"            "ImportJobStatus" NOT NULL DEFAULT 'DRAFT',
    "fileName"          TEXT,
    "fileMime"          TEXT,
    "fileBytes"         INTEGER,
    "storageRef"        TEXT,
    "mappingProfileId"  TEXT,
    "mapping"           JSONB,
    "validationSummary" JSONB,
    "commitSummary"     JSONB,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "import_jobs_ownerId_status_idx" ON "import_jobs" ("ownerId", "status");
ALTER TABLE "import_jobs"
    ADD CONSTRAINT "import_jobs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "import_jobs_mappingProfileId_fkey" FOREIGN KEY ("mappingProfileId") REFERENCES "import_mapping_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: import_job_items
CREATE TABLE IF NOT EXISTS "import_job_items" (
    "id"               TEXT PRIMARY KEY,
    "jobId"            TEXT NOT NULL,
    "rowIndex"         INTEGER NOT NULL,
    "rawValues"        JSONB NOT NULL,
    "normalizedValues" JSONB,
    "outcome"          "ImportRowOutcome" NOT NULL DEFAULT 'OK',
    "errors"           TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "import_job_items_jobId_outcome_idx" ON "import_job_items" ("jobId", "outcome");
ALTER TABLE "import_job_items"
    ADD CONSTRAINT "import_job_items_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: bulk_invite_batches
CREATE TABLE IF NOT EXISTS "bulk_invite_batches" (
    "id"           TEXT PRIMARY KEY,
    "createdById"  TEXT NOT NULL,
    "kind"         "BulkInviteKind" NOT NULL,
    "sharedAttrs"  JSONB,
    "totalEntries" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount"  INTEGER NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL
);
CREATE INDEX IF NOT EXISTS "bulk_invite_batches_createdById_createdAt_idx" ON "bulk_invite_batches" ("createdById", "createdAt");
ALTER TABLE "bulk_invite_batches"
    ADD CONSTRAINT "bulk_invite_batches_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Wire invite_links.batchId FK
DO $$ BEGIN
    ALTER TABLE "invite_links"
        ADD CONSTRAINT "invite_links_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "bulk_invite_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
CREATE INDEX IF NOT EXISTS "invite_links_batchId_idx" ON "invite_links" ("batchId");

-- CreateTable: pwa_prompt_dismissals
CREATE TABLE IF NOT EXISTS "pwa_prompt_dismissals" (
    "id"             TEXT PRIMARY KEY,
    "userId"         TEXT NOT NULL,
    "kind"           "PwaPromptKind" NOT NULL,
    "platform"       "PwaPromptPlatform" NOT NULL,
    "mode"           "PwaDismissalMode" NOT NULL DEFAULT 'snooze',
    "nextEligibleAt" TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "pwa_prompt_dismissals_userId_kind_platform_key" ON "pwa_prompt_dismissals" ("userId", "kind", "platform");
ALTER TABLE "pwa_prompt_dismissals"
    ADD CONSTRAINT "pwa_prompt_dismissals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: user_activation_tokens
CREATE TABLE IF NOT EXISTS "user_activation_tokens" (
    "id"        TEXT PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "user_activation_tokens_userId_expiresAt_idx" ON "user_activation_tokens" ("userId", "expiresAt");
ALTER TABLE "user_activation_tokens"
    ADD CONSTRAINT "user_activation_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
