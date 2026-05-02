-- Role Cadence + Recurring Assignments + Correlation Analytics
-- Strictly additive. No DROP, no RENAME, no destructive change. Apply with `prisma migrate deploy`.

-- ── Templates: recurrence + auto-fill title ─────────────────────────────────
ALTER TABLE "report_templates"
    ADD COLUMN IF NOT EXISTS "recurrenceFrequency"   "ReportPeriodType",
    ADD COLUMN IF NOT EXISTS "recurrenceDays"        INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    ADD COLUMN IF NOT EXISTS "autoFillTitleTemplate" TEXT;

-- ── Sections + metrics: correlation group ────────────────────────────────────
ALTER TABLE "report_template_sections"
    ADD COLUMN IF NOT EXISTS "correlationGroup" TEXT;

ALTER TABLE "report_template_metrics"
    ADD COLUMN IF NOT EXISTS "correlationGroup" TEXT;

-- ── Reports: autoCreated flag ────────────────────────────────────────────────
ALTER TABLE "reports"
    ADD COLUMN IF NOT EXISTS "autoCreated" BOOLEAN NOT NULL DEFAULT false;

-- ── FormAssignment: ruleId + periodKey ───────────────────────────────────────
ALTER TABLE "form_assignments"
    ADD COLUMN IF NOT EXISTS "ruleId"    TEXT,
    ADD COLUMN IF NOT EXISTS "periodKey" TEXT;

CREATE INDEX IF NOT EXISTS "form_assignments_ruleId_periodKey_idx"
    ON "form_assignments" ("ruleId", "periodKey");

-- ── FormAssignmentRule: new model ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "form_assignment_rules" (
    "id"              TEXT PRIMARY KEY,
    "ownerId"         TEXT NOT NULL,
    "templateId"      TEXT NOT NULL,
    "role"            "UserRole",
    "assigneeId"      TEXT,
    "campusId"        TEXT,
    "orgGroupId"      TEXT,
    "metricIds"       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "cadenceOverride" JSONB,
    "isActive"        BOOLEAN NOT NULL DEFAULT true,
    "notes"           TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "form_assignment_rules_templateId_isActive_idx"
    ON "form_assignment_rules" ("templateId", "isActive");

CREATE INDEX IF NOT EXISTS "form_assignment_rules_role_isActive_idx"
    ON "form_assignment_rules" ("role", "isActive");

CREATE INDEX IF NOT EXISTS "form_assignment_rules_assigneeId_isActive_idx"
    ON "form_assignment_rules" ("assigneeId", "isActive");

-- FK constraints (idempotent — guarded by exception handlers)
DO $$ BEGIN
    ALTER TABLE "form_assignment_rules"
        ADD CONSTRAINT "form_assignment_rules_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "form_assignment_rules"
        ADD CONSTRAINT "form_assignment_rules_templateId_fkey"
        FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "form_assignment_rules"
        ADD CONSTRAINT "form_assignment_rules_assigneeId_fkey"
        FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "form_assignments"
        ADD CONSTRAINT "form_assignments_ruleId_fkey"
        FOREIGN KEY ("ruleId") REFERENCES "form_assignment_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
