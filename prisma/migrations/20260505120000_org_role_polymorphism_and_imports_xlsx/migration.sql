-- Migration: Org/Role polymorphism + Imports xlsx
--
-- Strictly additive. No DROP, no RENAME, no TRUNCATE. Existing rows in
-- `campuses`, `org_groups`, `users`, `reports`, `invite_links`,
-- `form_assignment_rules`, `import_jobs` are untouched. New tables and
-- columns ride alongside the legacy shapes; the back-fill at the bottom is
-- idempotent (`ON CONFLICT DO NOTHING`) so re-running never overwrites.
--
-- Apply with `prisma migrate deploy`. Never `migrate reset` against a
-- data-bearing environment.

-- ──────────────────────────────────────────────────────────────────────────
-- 1) Polymorphic org-unit substrate
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "org_units" (
    "id"          TEXT PRIMARY KEY,
    "code"        TEXT,
    "level"       TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "parentId"    TEXT,
    "rootKey"     TEXT NOT NULL DEFAULT 'primary',
    "country"     TEXT,
    "location"    TEXT,
    "address"     TEXT,
    "phone"       TEXT,
    "leaderId"    TEXT,
    "adminId"     TEXT,
    "metadata"    JSONB,
    "isActive"    BOOLEAN NOT NULL DEFAULT TRUE,
    "archivedAt"  TIMESTAMPTZ,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "org_units_parent_fkey" FOREIGN KEY ("parentId") REFERENCES "org_units"("id") ON DELETE SET NULL,
    CONSTRAINT "org_units_leader_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "org_units_admin_fkey"  FOREIGN KEY ("adminId")  REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "org_units_root_level_idx"  ON "org_units" ("rootKey", "level");
CREATE INDEX IF NOT EXISTS "org_units_parent_idx"      ON "org_units" ("parentId");
CREATE INDEX IF NOT EXISTS "org_units_level_idx"       ON "org_units" ("level");

-- ──────────────────────────────────────────────────────────────────────────
-- 2) Runtime-managed Role substrate
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "roles" (
    "id"                    TEXT PRIMARY KEY,
    "code"                  TEXT NOT NULL UNIQUE,
    "label"                 TEXT NOT NULL,
    "description"           TEXT,
    "hierarchyOrder"        INTEGER NOT NULL DEFAULT 50,
    "dashboardMode"         TEXT NOT NULL DEFAULT 'scope-overview',
    "reportVisibilityScope" TEXT NOT NULL DEFAULT 'own',
    "capabilities"          JSONB NOT NULL,
    "cadence"               JSONB,
    "isSystem"              BOOLEAN NOT NULL DEFAULT FALSE,
    "archivedAt"            TIMESTAMPTZ,
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "roles_archived_idx" ON "roles" ("archivedAt");

CREATE TABLE IF NOT EXISTS "role_scopes" (
    "id"        TEXT PRIMARY KEY,
    "roleId"    TEXT NOT NULL,
    "unitId"    TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "role_scopes_role_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE,
    CONSTRAINT "role_scopes_unit_fkey" FOREIGN KEY ("unitId") REFERENCES "org_units"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "role_scopes_role_unit_uniq" ON "role_scopes" ("roleId", "unitId");
CREATE INDEX IF NOT EXISTS "role_scopes_unit_idx" ON "role_scopes" ("unitId");

-- ──────────────────────────────────────────────────────────────────────────
-- 3) Additive columns on legacy carriers (all NULL-safe)
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE "users"                 ADD COLUMN IF NOT EXISTS "roleId" TEXT;
ALTER TABLE "users"                 ADD COLUMN IF NOT EXISTS "unitId" TEXT;
ALTER TABLE "reports"               ADD COLUMN IF NOT EXISTS "unitId" TEXT;
ALTER TABLE "invite_links"          ADD COLUMN IF NOT EXISTS "targetRoleId" TEXT;
ALTER TABLE "invite_links"          ADD COLUMN IF NOT EXISTS "unitId" TEXT;
ALTER TABLE "form_assignment_rules" ADD COLUMN IF NOT EXISTS "roleId" TEXT;
ALTER TABLE "form_assignment_rules" ADD COLUMN IF NOT EXISTS "unitIds" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "import_jobs"           ADD COLUMN IF NOT EXISTS "fileFormat" TEXT;
ALTER TABLE "import_jobs"           ADD COLUMN IF NOT EXISTS "selectedSheet" TEXT;

-- FK constraints (added only when both sides exist, ON DELETE SET NULL so a
-- removed unit/role doesn't cascade-delete users/reports).
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_roleId_fkey'
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey"
            FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_unitId_fkey'
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_unitId_fkey"
            FOREIGN KEY ("unitId") REFERENCES "org_units"("id") ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reports_unitId_fkey'
    ) THEN
        ALTER TABLE "reports" ADD CONSTRAINT "reports_unitId_fkey"
            FOREIGN KEY ("unitId") REFERENCES "org_units"("id") ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "users_roleId_idx"  ON "users"        ("roleId");
CREATE INDEX IF NOT EXISTS "users_unitId_idx"  ON "users"        ("unitId");
CREATE INDEX IF NOT EXISTS "reports_unitId_idx" ON "reports"     ("unitId");
CREATE INDEX IF NOT EXISTS "invite_links_unitId_idx" ON "invite_links" ("unitId");

-- ──────────────────────────────────────────────────────────────────────────
-- 4) Idempotent back-fill — preserves existing UUIDs so every legacy FK
--    resolves through either the legacy table OR the new org_units table.
--    Re-runnable: ON CONFLICT DO NOTHING.
-- ──────────────────────────────────────────────────────────────────────────

-- 4a. OrgGroup → OrgUnit (level=GROUP, parent=null, rootKey=primary)
INSERT INTO "org_units" (
    "id", "level", "name", "description", "parentId", "rootKey",
    "country", "leaderId", "isActive", "createdAt", "updatedAt"
)
SELECT
    g."id",
    'GROUP',
    g."name",
    g."description",
    NULL,
    'primary',
    g."country",
    g."leaderId",
    g."isActive",
    g."createdAt",
    g."updatedAt"
FROM "org_groups" g
ON CONFLICT ("id") DO NOTHING;

-- 4b. Campus → OrgUnit (level=CAMPUS, parent=group's UUID)
INSERT INTO "org_units" (
    "id", "level", "name", "description", "parentId", "rootKey",
    "country", "location", "address", "phone", "adminId",
    "isActive", "createdAt", "updatedAt"
)
SELECT
    c."id",
    'CAMPUS',
    c."name",
    c."description",
    c."parentId",
    'primary',
    c."country",
    c."location",
    c."address",
    c."phone",
    c."adminId",
    c."isActive",
    c."createdAt",
    c."updatedAt"
FROM "campuses" c
ON CONFLICT ("id") DO NOTHING;

-- 4c. Built-in Role rows seeded from the UserRole enum. The seed script
--     `scripts/seed-roles-and-units.ts` populates label + capabilities at
--     deploy time; here we just guarantee a row exists so the FK column
--     can be back-filled on User without referential gaps.
INSERT INTO "roles" ("id", "code", "label", "capabilities", "isSystem", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'SUPERADMIN',     'Superadmin',         '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'SPO',            'SPO',                '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'CEO',            'CEO',                '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'OFFICE_OF_CEO',  'Office of CEO',      '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'CHURCH_MINISTRY','Church Ministry',    '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'GROUP_PASTOR',   'Group Pastor',       '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'GROUP_ADMIN',    'Group Admin',        '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'CAMPUS_PASTOR',  'Campus Pastor',      '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'CAMPUS_ADMIN',   'Campus Admin',       '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'DATA_ENTRY',     'Data Entry',         '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'USHER',          'Usher',              '{}'::jsonb, TRUE, NOW(), NOW()),
    (gen_random_uuid()::text, 'MEMBER',         'Member',             '{}'::jsonb, TRUE, NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

-- 4d. Back-fill User.roleId from the matching Role row when null. Idempotent.
UPDATE "users" u
SET "roleId" = r."id"
FROM "roles" r
WHERE u."roleId" IS NULL
  AND r."code" = u."role"::text;

-- 4e. Back-fill User.unitId from User.campusId or orgGroupId. Prefers campus.
UPDATE "users" u
SET "unitId" = COALESCE(u."campusId", u."orgGroupId")
WHERE u."unitId" IS NULL
  AND (u."campusId" IS NOT NULL OR u."orgGroupId" IS NOT NULL);

-- 4f. Back-fill Report.unitId from campusId.
UPDATE "reports" r
SET "unitId" = r."campusId"
WHERE r."unitId" IS NULL
  AND r."campusId" IS NOT NULL;

-- 4g. Back-fill InviteLink.unitId from campusId or groupId.
UPDATE "invite_links" il
SET "unitId" = COALESCE(il."campusId", il."groupId")
WHERE il."unitId" IS NULL
  AND (il."campusId" IS NOT NULL OR il."groupId" IS NOT NULL);

-- 4h. Back-fill InviteLink.targetRoleId from targetRole enum.
UPDATE "invite_links" il
SET "targetRoleId" = r."id"
FROM "roles" r
WHERE il."targetRoleId" IS NULL
  AND il."targetRole" IS NOT NULL
  AND r."code" = il."targetRole"::text;

-- 4i. Back-fill FormAssignmentRule.roleId + unitIds from the legacy columns.
UPDATE "form_assignment_rules" far
SET "roleId" = r."id"
FROM "roles" r
WHERE far."roleId" IS NULL
  AND far."role" IS NOT NULL
  AND r."code" = far."role"::text;

UPDATE "form_assignment_rules"
SET "unitIds" = ARRAY(
    SELECT DISTINCT x FROM unnest(
        COALESCE("campusIds", '{}'::TEXT[]) || COALESCE("orgGroupIds", '{}'::TEXT[])
    ) AS x WHERE x IS NOT NULL
)
WHERE COALESCE(array_length("unitIds", 1), 0) = 0;

-- 4j. Back-fill ImportJob.fileFormat for legacy rows. Treat anything stored
--     today as CSV (the only supported format pre-this-migration).
UPDATE "import_jobs"
SET "fileFormat" = 'CSV'
WHERE "fileFormat" IS NULL
  AND "storageRef" IS NOT NULL;
