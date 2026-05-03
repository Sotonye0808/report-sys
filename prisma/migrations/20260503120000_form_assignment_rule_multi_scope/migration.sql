-- Multi-campus / multi-group scoping for FormAssignmentRule.
-- Strictly additive. Empty array = applies to all campuses (or all groups).
-- Legacy single-value `campusId` / `orgGroupId` columns stay in place.

ALTER TABLE "form_assignment_rules"
    ADD COLUMN IF NOT EXISTS "campusIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "form_assignment_rules"
    ADD COLUMN IF NOT EXISTS "orgGroupIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
