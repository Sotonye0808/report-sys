-- Superadmin role-impersonation / preview
-- Strictly additive. No DROP, no RENAME, no destructive change. Apply with `prisma migrate deploy`.

-- ── Enums ────────────────────────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE "ImpersonationMode" AS ENUM ('READ_ONLY', 'MUTATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ImpersonationEndReason" AS ENUM ('USER', 'EXPIRED', 'TOKEN_INVALIDATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ImpersonationEventType" AS ENUM (
        'STARTED',
        'STOPPED',
        'MODE_CHANGED',
        'MUTATION_BLOCKED',
        'MUTATION_APPLIED',
        'PAGE_VISITED',
        'AUTH_REJECTED',
        'EVENT_LIMIT_REACHED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ── impersonation_sessions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "impersonation_sessions" (
    "id"                 TEXT PRIMARY KEY,
    "superadminId"       TEXT NOT NULL,
    "impersonatedRole"   "UserRole" NOT NULL,
    "impersonatedUserId" TEXT,
    "mode"               "ImpersonationMode" NOT NULL DEFAULT 'READ_ONLY',
    "startedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt"          TIMESTAMP(3) NOT NULL,
    "endedAt"            TIMESTAMP(3),
    "endedReason"        "ImpersonationEndReason",
    "eventCount"         INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "impersonation_sessions_superadminId_endedAt_idx"
    ON "impersonation_sessions" ("superadminId", "endedAt");

CREATE INDEX IF NOT EXISTS "impersonation_sessions_startedAt_idx"
    ON "impersonation_sessions" ("startedAt");

DO $$ BEGIN
    ALTER TABLE "impersonation_sessions"
        ADD CONSTRAINT "impersonation_sessions_superadminId_fkey"
        FOREIGN KEY ("superadminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "impersonation_sessions"
        ADD CONSTRAINT "impersonation_sessions_impersonatedUserId_fkey"
        FOREIGN KEY ("impersonatedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ── impersonation_events ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "impersonation_events" (
    "id"            TEXT PRIMARY KEY,
    "sessionId"     TEXT NOT NULL,
    "type"          "ImpersonationEventType" NOT NULL,
    "path"          TEXT,
    "method"        TEXT,
    "status"        INTEGER,
    "requestId"     TEXT,
    "payloadDigest" TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "impersonation_events_sessionId_createdAt_idx"
    ON "impersonation_events" ("sessionId", "createdAt");

CREATE INDEX IF NOT EXISTS "impersonation_events_type_createdAt_idx"
    ON "impersonation_events" ("type", "createdAt");

DO $$ BEGIN
    ALTER TABLE "impersonation_events"
        ADD CONSTRAINT "impersonation_events_sessionId_fkey"
        FOREIGN KEY ("sessionId") REFERENCES "impersonation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
