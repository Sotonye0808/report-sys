-- Add enum values for new notification events
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'NotificationType' AND e.enumlabel = 'EMAIL_VERIFICATION_REQUIRED'
    ) THEN
        ALTER TYPE "NotificationType" ADD VALUE 'EMAIL_VERIFICATION_REQUIRED';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'NotificationType' AND e.enumlabel = 'EMAIL_VERIFIED'
    ) THEN
        ALTER TYPE "NotificationType" ADD VALUE 'EMAIL_VERIFIED';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'NotificationType' AND e.enumlabel = 'EMAIL_CHANGE_REQUESTED'
    ) THEN
        ALTER TYPE "NotificationType" ADD VALUE 'EMAIL_CHANGE_REQUESTED';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'NotificationType' AND e.enumlabel = 'EMAIL_CHANGED'
    ) THEN
        ALTER TYPE "NotificationType" ADD VALUE 'EMAIL_CHANGED';
    END IF;
END $$;

-- Create enum for email action token type
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailActionType') THEN
        CREATE TYPE "EmailActionType" AS ENUM ('VERIFY_PRIMARY_EMAIL', 'CONFIRM_PENDING_EMAIL');
    END IF;
END $$;

-- Add email verification/change columns to users
ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "pendingEmail" TEXT,
    ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "emailVerificationSentAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "pendingEmailRequestedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "pendingEmailSentAt" TIMESTAMP(3);

-- unique pending email (nulls allowed)
CREATE UNIQUE INDEX IF NOT EXISTS "users_pendingEmail_key" ON "users"("pendingEmail");

-- Store one-time tokens for verification/change-email flows
CREATE TABLE IF NOT EXISTS "email_action_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "EmailActionType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "targetEmail" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "invalidatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "email_action_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_action_tokens_tokenHash_key" ON "email_action_tokens"("tokenHash");
CREATE INDEX IF NOT EXISTS "email_action_tokens_userId_type_usedAt_idx" ON "email_action_tokens"("userId", "type", "usedAt");
CREATE INDEX IF NOT EXISTS "email_action_tokens_expiresAt_idx" ON "email_action_tokens"("expiresAt");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'email_action_tokens_userId_fkey'
    ) THEN
        ALTER TABLE "email_action_tokens"
            ADD CONSTRAINT "email_action_tokens_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
