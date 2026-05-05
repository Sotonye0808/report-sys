# Temp Plan — Polymorphic Org Units (deprecate hardcoded `Campus` / `OrgGroup` models)

> **Date:** 2026-05-04
> **Status:** Planning only — multi-day scope. Awaits explicit approval before implementation.
> **Driver:** The hardcoded `Campus` / `OrgGroup` Prisma models lock the platform into a fixed two-level hierarchy. Hierarchy LEVELS are already admin-editable through the `hierarchy` admin-config namespace + `resolveHierarchyLevels`, but the underlying *tables* still encode "Campus" and "OrgGroup" by name. The user wants the storage layer to mirror the runtime flexibility: admins can rename "Campus" → "Branch" or add a "Zone" level above Group, and the system Just Works.

---

## 1. Feature Summary

Replace the two concrete tables with a single polymorphic table:

```
model OrgUnit {
  id        String   @id @default(uuid())
  level     String   // foreign key to a runtime hierarchy level definition
  name      String
  description String?
  parentId  String?  // self-FK; null for root-level units
  ...same metadata fields as before (country, location, leaderId, adminId, etc.)
  parent    OrgUnit? @relation("OrgUnitChildren", fields: [parentId], references: [id])
  children  OrgUnit[] @relation("OrgUnitChildren")
}
```

The migration is the deepest piece — every existing FK that points to `campuses(id)` or `org_groups(id)` (`reports.campusId`, `reports.orgGroupId`, `users.campusId`, `users.orgGroupId`, `goals.campusId`, `metric_entries.campusId`, `invite_links.campusId`/`groupId`, `form_assignment_rules.campusIds[]`/`orgGroupIds[]`, `form_assignments.campusId`, `bug_reports.campusId`, etc.) needs to:
- still point at a real table (now `org_units`),
- preserve the existing UUIDs (one-to-one row migration so no FK breaks),
- keep working under read paths that filter `level = 'CAMPUS'` for the campus-style lookup.

---

## 2. Architecture Impact

| Layer | Affected | Change |
|---|---|---|
| `prisma/schema.prisma` | new model + back-fill | Add `OrgUnit`. Mark `Campus` + `OrgGroup` as deprecated (keep as views during transition). Add `level` foreign-key on every former `campusId`/`orgGroupId` carrier where it's useful for filtering. |
| `prisma/migrations` | additive shape, then back-fill, then read-redirection | Three migrations: (a) `CREATE TABLE org_units` + dual-write triggers, (b) back-fill rows from `campuses` + `org_groups`, (c) flip read paths to `org_units` while leaving the legacy tables untouched. |
| `lib/data/orgUnit.ts` | **new** | CRUD + tree query helpers (`listByLevel`, `tree`, `ancestors`, `descendants`). |
| `lib/data/orgUnitMatcher.ts` | **new** | "Is unit X within scope Y?" helper used by aggregation + form-assignment matching. |
| `app/api/org/units/*` | **new** | Generic org CRUD endpoints replacing the per-table `/api/org/campuses` + `/api/org/groups` surfaces (which stay alive as thin wrappers during the cut-over). |
| `modules/org/components/OrgPage.tsx` | refactor | Tree + table both render `OrgUnit` rows; "Campus" / "Group" become labels resolved through the hierarchy admin-config snapshot. The hierarchy editor in Admin Config now creates real `OrgUnit` rows (not just level definitions) when the admin adds/removes a level. |
| Every read site that filters `where: { campusId: ... }` | safe rename | Update to `where: { unitId: ..., unit: { level: 'CAMPUS' } }` — but the legacy column is preserved, so existing UI filters keep working through a compatibility shim. |
| `config/hierarchy.ts` | reduce to fallback | Stays as the typed fallback for `hierarchy` namespace, but no longer defines runtime structure — the admin-config payload + `org_units` table do. |
| Every UI label that says "Campus" or "Group" | content-driven | Read the level label from `resolveHierarchyLevels()` — already implemented for some surfaces; needs to be threaded through `OrgPage`, `UsersListPage`, invite flows, report aggregation UI, etc. |

---

## 3. New Modules / Services

- **`lib/data/orgUnit.ts`** — CRUD + tree helpers.
- **`lib/data/orgUnitMatcher.ts`** — scope-matching reused by aggregation, form-assignment materialiser, dashboard widget context.
- **`app/api/org/units/*`** — REST CRUD.
- **`modules/org/components/OrgUnitTree.tsx`** — reusable tree view that renders any depth + admin-defined labels.

---

## 4. Data Flow

### 4a. Migration cut-over (safe, three-phase)

```
Phase A (additive):
  CREATE TABLE org_units (...)
  Back-fill org_units from org_groups (level='GROUP') + campuses (level='CAMPUS').
  Add `unitId` + `parentUnitId` columns alongside legacy FKs on every carrier.
  Triggers keep org_units in sync when callers still write to campuses/org_groups.

Phase B (read-redirect):
  Switch read queries to org_units. Legacy tables stay populated by triggers
  but no new code reads them. UI labels resolve through hierarchy admin-config.

Phase C (deprecate writes):
  Replace legacy write endpoints with thin wrappers that write to org_units.
  Drop triggers. Legacy tables stay as VIEWs over org_units for any
  forgotten consumer; admins can rename levels at runtime through Admin Config.

Phase D (eventual cleanup, weeks later):
  After confirming nothing reads legacy tables, drop the views. Optional —
  keeping them costs nothing.
```

### 4b. Runtime label resolution

Every UI surface that currently hardcodes "Campus" / "Group" reads the label from `resolveHierarchyLevels()` (already in place for some flows). The legacy `Campus` / `OrgGroup` model NAMES become an internal implementation detail; the user-facing word is whatever the admin set in `hierarchy.levels[i].label`.

---

## 5. UI/UX

- **OrgPage** becomes a tree view. Each level's label is admin-controlled (Admin Config → Hierarchy). Admins can add/remove levels; depth is variable.
- **All other surfaces** that say "Campus" or "Group" (UsersListPage, Invites, Goals, Reports filter, Aggregation scope picker, Dashboard widgets) read labels from the hierarchy snapshot.
- **No data loss**: every existing campus + group row migrates to `org_units` with the same UUID, so every existing report / user / goal / invite continues to resolve correctly.

---

## 6. Risks + Edge Cases

- **FK cascade interactions**: dropping/replacing FKs on every carrier table is the highest-risk part. Three-phase migration with dual-write keeps both legacy + new paths live during the cut-over.
- **Trigger churn**: the dual-write triggers run on every campus/group write. Acceptable at this org's volume; benchmark before cut-over.
- **Hardcoded "Campus" strings in module code**: a sweep is needed. ESLint custom rule `no-hardcoded-org-label` should fail the build when "Campus" / "Group" / "campusId" appears in user-facing strings outside `config/hierarchy.ts`.
- **Aggregation engine**: today filters by `campusId`/`orgGroupId`. Needs to switch to a `unitId` + `level` predicate that accepts any depth.
- **Existing form-assignment rules** carry `campusIds[]` and `orgGroupIds[]` arrays. Migration: rename to `unitIds[]` + a `levelHint` (so "any unit at level X" stays expressible). Legacy columns stay readable for back-compat.

---

## 7. Concrete Implementation Tasks (canonical sequence)

### Phase A — Schema + safe additive migration

1. Add `OrgUnit` model to `prisma/schema.prisma` with self-FK + level + parent + name + metadata fields. Strictly additive.
2. Author migration `*_org_units_backfill` that:
   - `CREATE TABLE org_units IF NOT EXISTS`
   - `INSERT INTO org_units` from `org_groups` (level='GROUP') + `campuses` (level='CAMPUS', parent=org_groups.id)
   - Adds `unitId` columns alongside every legacy `campusId`/`orgGroupId` FK carrier.
   - Triggers: any write to `campuses` or `org_groups` mirrors into `org_units`.
3. Regenerate Prisma client; `npx prisma validate`.

### Phase B — Read paths

4. Implement `lib/data/orgUnit.ts` (CRUD + tree).
5. Implement `lib/data/orgUnitMatcher.ts` (scope match).
6. Add `/api/org/units` REST surface (GET / POST / PATCH / DELETE).
7. Refactor `OrgPage` to render `OrgUnit` rows with admin-configurable labels.
8. Sweep every hardcoded "Campus" / "Group" string in UI surfaces; resolve via `resolveHierarchyLevels()`.
9. Update aggregation engine (`/api/reports/aggregate` + `lib/data/reportAggregation.ts`) to filter by `unitId` + `level`.
10. Update form-assignment materialiser to use `unitIds[]` + `levelHint`.

### Phase C — Write paths + deprecation

11. Replace legacy `/api/org/campuses` + `/api/org/groups` endpoints with thin wrappers that write to `org_units`.
12. Drop dual-write triggers; legacy tables become VIEWs over `org_units`.
13. Update Admin Config "Hierarchy" tab so adding a level creates `org_units` rows for that level, removing creates a tombstone (soft-delete).

### Phase D — Cleanup + lint

14. Add ESLint rule `no-hardcoded-org-label` that fails when "Campus" / "Group" / "campusId" appears in user-facing strings outside the hierarchy config.
15. Update `.ai-system/agents/system-architecture.md`, `project-context.md`, `repair-system.md` with the new substrate + the migration playbook.
16. Add regression tests: tree CRUD, scope-match correctness, aggregation across arbitrary depth.

---

## 8. Architecture Doc Updates Required

- **`system-architecture.md`** — new module breakdown rows + data-flow entries documenting the polymorphic substrate + migration phases.
- **`project-context.md`** — reaffirm the constraint: "Hierarchy depth + level labels are admin-editable. The two-level Group→Campus shape is a default, not a hard requirement."
- **`repair-system.md`** — once seen, log: dual-write divergence patterns, FK constraint violations during the cut-over.

---

## 9. Single-Pass Cut

This feature is **multi-day work** with serious migration risk. It should NOT roll into the current pass. After approval, Phase A (schema + back-fill + dual-write triggers) is the minimum that buys runtime flexibility; Phase B–D can stage over subsequent passes once Phase A is validated in production.

No code in this turn — awaiting plan approval.
