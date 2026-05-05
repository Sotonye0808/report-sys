# Temp Plan — Admin-editable public content + xlsx imports + role/org CRUD + multi-tree polymorphic hierarchy

> **Date:** 2026-05-05
> **Status:** Planning only. Multi-pass scope; awaiting explicit approval before any code is written.
> **Driver:** Closing the remaining "config-driven from end to end" gaps. Public landing/how-it-works/FAQ content needs an admin substrate; xlsx imports throw a Prisma-flavoured error today; roles need full CRUD including CREATE; the org hierarchy is locked into a single Group→Campus chain and needs to support multiple parallel branches (e.g. Groups + Departments at the same level) at variable depth — without breaking existing data or any existing scope check.

---

## 1. Feature summary

Five tightly coupled deliverables shipped together because they cross the same admin-config + hierarchy boundary:

1. **Public-content admin substrate.** Landing page, How It Works tabs/sections/FAQs, footer copy, About/Privacy/Terms become admin-editable through `landing` + `howItWorks` + `publicCopy` admin-config namespaces with hardcoded fallbacks in `config/content.ts`. Fallbacks are refreshed to reflect the *current* state of the platform (auto-totals, correlation panel, week-on-week, impersonation, polymorphic hierarchy).
2. **More How-It-Works playgrounds.** Add interactive demos for analytics chart types, template creation flow + downstream effect on reports/analytics, correlation grouping, auto-sum chaining, insights summary, aggregation, and spreadsheet imports. Mirror real pipelines client-side so users can preview behavior without DB writes.
3. **Spreadsheet imports — fix xlsx + improve robustness.** Today's pipeline is CSV-only; uploading `.xlsx` falls into `parseCsv` which produces garbage rows that downstream Prisma operations choke on. Adopt SheetJS (`xlsx`) for `.xlsx`/`.xls` and exhaustively test header detection, empty-row skip, multi-sheet selection, and graceful errors.
4. **Roles CRUD (with CREATE) + optional org scope.** Today only existing enum members are editable; admins cannot add a new role. Introduce a runtime-managed `Role` table. Existing `UserRole` enum values become *built-in seeded rows* (immutable for SUPERADMIN, otherwise editable). Each role optionally pins to one or more `OrgUnit` IDs (e.g. "Group Admin" can scope to "GROUP" level only, or to a specific subtree). Single source of truth: `lib/auth/permissions.ts` resolves runtime capabilities from this table; the existing `ROLE_CONFIG` becomes the typed fallback.
5. **Polymorphic multi-tree org hierarchy.** Replace `Campus` + `OrgGroup` tables with a single polymorphic `OrgUnit` (self-FK, level, parent, metadata). Support multiple **roots** in parallel — e.g. one root tree of "Groups → Campuses" and a parallel root of "Departments → Sub-departments" — with optional cross-tree role assignment. Existing two-level "Group → Campus" stays as the seeded default; **no current data is touched** (back-fill migration preserves UUIDs and runs every existing FK through a compatibility layer).

---

## 2. Architecture impact

| Layer | Affected | Change |
|---|---|---|
| `prisma/schema.prisma` | new tables, additive only | Add `OrgUnit`, `OrgUnitRoot`, `Role`, `RoleScope`, `PublicCopyEntry`, `ImportJob.fileFormat` enum. Mark `Campus` + `OrgGroup` as views over `OrgUnit` (Phase B). Add `roleId` (string FK to `Role.id`) alongside the legacy `role` enum on `User`, `InviteLink`, `FormAssignmentRule`. |
| `prisma/migrations` | three additive phases | (A) `CREATE TABLE org_units`, `CREATE TABLE roles`, `CREATE TABLE public_copy_entries`, dual-write triggers; (B) flip read paths to the new tables; (C) replace legacy write endpoints with thin wrappers + drop triggers. No `DROP COLUMN`, no `RENAME`, no `TRUNCATE`. |
| `lib/data/orgUnit.ts` | **new** | Tree CRUD + `listByLevel` + `tree(rootId?)` + `descendants` + `ancestors`. Multi-root capable. |
| `lib/data/orgUnitMatcher.ts` | **new** | Polymorphic scope-match used by aggregation + form-assignment matcher + report visibility. |
| `lib/data/role.ts` | **new** | Role CRUD with built-in/system-protected flag, capability subset validator (cannot grant SUPERADMIN-only bits), and scope binding (`RoleScope.unitId[]`). |
| `lib/data/publicCopy.ts` | **new** | Read-write helpers for `landing`/`howItWorks`/`publicCopy` namespaces with optimistic-lock parity vs `lib/data/adminConfig.ts`. |
| `lib/data/importPipeline.ts` | extend | Add xlsx parsing branch (`parseXlsx(buf)` via `xlsx` package), unify under a `parseSpreadsheet(buf, mime)` dispatcher; preserve current CSV behavior. |
| `app/api/imports/[id]/file/route.ts` | accept xlsx | Persist binary in `Buffer` form (Base64 in `storageRef` if local; otherwise pass through the existing storage path). Reject malformed xlsx with a 400, not a 500. |
| `app/api/admin-config/[ns]/route.ts` | extend | Recognise the new `landing`, `howItWorks`, `publicCopy` namespaces; sanitise payloads (no scripts, no protocol-relative URLs, max length per field). |
| `app/api/org/units/*` | **new** | `GET`/`POST`/`PATCH`/`DELETE` for tree CRUD; legacy `/api/org/groups` + `/api/org/campuses` become 1-line wrappers that pre-fill `level: "GROUP"` / `level: "CAMPUS"`. |
| `app/api/roles/*` | **new** | `GET`/`POST`/`PATCH`/`DELETE` for runtime role CRUD; SUPERADMIN role row is system-protected. |
| `modules/admin-config/components/AdminConfigPage.tsx` | extend | Add `RolesEditor` v2 (with CREATE), `OrgUnitTreeEditor` (multi-root + variable-depth tree), `LandingCopyEditor`, `HowItWorksEditor` (drag-reorder tabs + sections + FAQs). |
| `modules/how-it-works/playgrounds.tsx` | extend | Register new playgrounds: `analytics-chart-toggle`, `template-builder-effect`, `correlation-matrix-builder`, `auto-sum-chain`, `insight-summary-preview`, `aggregation-rollup`, `import-wizard-demo`. |
| `app/page.tsx` + `app/how-it-works/page.tsx` + `app/about/page.tsx` + `app/privacy/page.tsx` + `app/terms/page.tsx` | DB-first read | Render content from the new namespaces with `config/content.ts` as the typed fallback. |
| `config/content.ts` | refresh fallbacks | Update `landing.features`, `howItWorks.tabs[*].sections + faqs + playgroundIds` to reflect the platform's *current* state at the end of this work. |
| `config/roles.ts` | back-compat | Keep `ROLE_CONFIG` as the typed fallback / built-in seed source — Roles table seeds from this on first migration. |
| `config/hierarchy.ts` | back-compat | Same role: typed fallback + initial seed. Multi-root capability arrives via the runtime table; the file's two-level shape stays as the default. |
| ESLint | new rule | `no-hardcoded-org-label` and `no-hardcoded-role-label` lints fire when the user-facing string `Campus`/`Group`/role labels appear outside the hierarchy/role config. |

---

## 3. New modules / services

- `lib/data/orgUnit.ts` — polymorphic CRUD + tree query helpers (multi-root aware).
- `lib/data/orgUnitMatcher.ts` — `unitInScope(targetUnitId, scopeUnitIds)`, `descendantsOf(unitId)`, used by aggregation + report visibility + form assignments.
- `lib/data/role.ts` — `listRoles`, `createRole`, `updateRole`, `deleteRole` (soft via `archivedAt`), plus capability-subset validator and `resolveCapabilities(roleId)`.
- `lib/data/publicCopy.ts` — DB-backed reads with sanitisation + version conflict.
- `lib/data/importPipeline.ts` — extended with `parseSpreadsheet(buf, mime)` dispatching to `parseCsv` or `parseXlsx`.
- `modules/admin-config/components/RolesEditorV2.tsx` — full CRUD with create dialog, archive (soft-delete), capability + scope picker.
- `modules/admin-config/components/OrgUnitTreeEditor.tsx` — multi-root tree with drag-reorder, level swap, name + metadata fields.
- `modules/admin-config/components/LandingCopyEditor.tsx` — hero/features/quickLinks editor with field-level validation.
- `modules/admin-config/components/HowItWorksEditor.tsx` — tab + section + FAQ editor with drag-reorder + playground id picker.
- `modules/how-it-works/playgrounds.tsx` — registry extended with seven new demos (see §6).
- `scripts/seed-roles-and-units.ts` — one-shot back-fill + seed for `Role` and `OrgUnit` from existing data.

---

## 4. Data flow

### 4a. Migration cut-over (additive, three phases)

**Phase A (additive, idempotent):**
1. `CREATE TABLE org_units` (self-FK, `level`, `name`, `parentId`, metadata, `rootKey` for multi-tree grouping).
2. `INSERT INTO org_units` from existing `org_groups` (level=`GROUP`, parentId=null, rootKey=`primary`) + `campuses` (level=`CAMPUS`, parentId=parent group's UUID, rootKey=`primary`). Same UUIDs preserved.
3. Add `unitId` columns alongside every legacy `campusId`/`orgGroupId` FK carrier (`reports`, `users`, `goals`, `metric_entries`, `invite_links`, `form_assignments`, `bug_reports`, `form_assignment_rules.unitIds[]`). Back-fill from the corresponding legacy column.
4. Triggers: any write to `campuses` or `org_groups` mirrors into `org_units` with the right `level`.
5. `CREATE TABLE roles` (id, code uppercase, label, hierarchyOrder, capabilities jsonb, dashboardMode, reportVisibilityScope, isSystem boolean, archivedAt). Back-fill from `UserRole` enum values + `ROLE_CONFIG`. SUPERADMIN gets `isSystem=true` and is immutable.
6. `CREATE TABLE role_scopes` (roleId, unitId) for optional org-unit pinning.
7. `CREATE TABLE public_copy_entries` (namespace, payload, version, updatedAt, updatedBy).

**Phase B (read-redirect):**
8. Switch every read path that currently filters on `campusId` / `orgGroupId` to the matcher (`unitInScope`). Legacy columns still mirror; new code never reads them.
9. Public pages (`/`, `/how-it-works`, `/about`, `/privacy`, `/terms`) read from `public_copy_entries` with `config/content.ts` as fallback.
10. Roles UI reads runtime `Role` rows; `ROLE_CONFIG` becomes seed-only.

**Phase C (deprecate writes):**
11. `/api/org/groups` + `/api/org/campuses` become thin wrappers that write through `org_units`.
12. Drop dual-write triggers; legacy tables survive as VIEWs (zero-cost compat).

### 4b. Multi-root hierarchy semantics

```
OrgUnit
├── id              uuid
├── code            string?      (admin-set short slug, optional)
├── level           string       (e.g. "GROUP" | "CAMPUS" | "DEPARTMENT" — admin-defined)
├── name            string
├── parentId        uuid?        (null for roots)
├── rootKey         string       (groups roots into "trees" — e.g. "primary", "departments")
├── metadata        jsonb        (country, location, leaderUnitId, etc.)
├── archivedAt      timestamptz?
└── createdAt/updatedAt
```

The same database holds two parallel trees:
- `rootKey="primary"`: GROUP → CAMPUS (the existing structure, seeded).
- `rootKey="departments"`: DEPARTMENT → SUB_DEPARTMENT (admin-created later).

Roles can scope across trees via `RoleScope.unitId[]`. A single user can hold one role with units from both trees ("Cross-functional admin"). This is intentional flexibility.

### 4c. Imports xlsx flow

```
1) Wizard upload accepts .csv | .xlsx | .xls (mime detection).
2) /api/imports/[id]/file persists raw bytes (CSV: text; xlsx: base64-encoded buffer).
3) /api/imports/[id]/mapping  → parseSpreadsheet(buf, mime) → header detection
4) Wizard user maps columns → templateMetricId
5) /api/imports/[id]/validate → row-by-row coercion, duplicate + unknown-metric checks
6) /api/imports/[id]/commit  → chunked Prisma transaction, item-level outcomes
```

Failure surface: malformed xlsx returns `{ code: "import_parse_failed", reason: <human-readable> }` with `400`, never a Prisma stack trace. Multi-sheet xlsx prompts the user to pick a sheet (defaults to the first non-empty sheet).

### 4d. Public copy resolution

```
SSR page → loadAdminConfig("howItWorks")
        → if substrate disabled OR no override → fallback to config/content.ts
        → render
       (no client-side flicker)
```

Server fetch is cached with the same `adminConfig:ns:*` key prefix used by other namespaces, so the substrate behavior is consistent.

---

## 5. UI/UX considerations (per `design-system.md`)

- All new editors live inside `AdminConfigPage` tabs and reuse the existing `Snapshot` + version-conflict pattern — operators recognise the shape immediately.
- The `OrgUnitTreeEditor` is built on Ant `Tree` with drag-and-drop, level-name editing inline, and a "Convert to root" action so admins can promote a subtree into a parallel root.
- `RolesEditorV2` adds a `+ New role` button at the top; the create dialog asks for code (uppercase slug), label, capability subset + visibility scope + dashboard mode + (optional) scope pin. Built-in roles are tagged `Built-in` and cannot be deleted (only archived).
- `HowItWorksEditor` is tab-bar of tabs (each editable: title, slug, sections, FAQs, playgroundIds picker) with drag-reorder.
- New playgrounds use `<PageLayout variant="card">` framing (matches existing playgrounds).
- Public pages remain server-rendered first; client-side hydration is via the same `<Suspense fallback={...}>` pattern already in `/how-it-works`.
- Imports wizard adds a sheet-picker step (only when xlsx has multiple non-empty sheets) and a non-blocking "preview parsed headers" panel so the user knows the parser found the right row.
- Design-tokens only: every new button, card, and chip uses `--ds-*`; no raw Tailwind colors.

---

## 6. New playgrounds (registry additions in `modules/how-it-works/playgrounds.tsx`)

| ID | Title | What it demos |
|---|---|---|
| `analytics-chart-toggle` | Chart type toggle | Same dataset rendered as bar / line / area / pie via Recharts; identical to platform analytics. |
| `template-builder-effect` | Template → report → analytics | Toggle "captures goal", "captures WoW", "auto-total" and watch a synthetic report render with the corresponding cells, then a synthetic analytics view shaped by those flags. |
| `correlation-matrix-builder` | Correlation grouping | Drag two synthetic metrics into a group, see Pearson r appear; drag a third in, see the 3×3 heatmap. Mirrors the `CorrelationGroupsPanel` UX. |
| `auto-sum-chain` | Auto-sum scope toggle | Switch between SECTION and TEMPLATE scope, see source picker re-scope, watch the read-only total update. |
| `insight-summary-preview` | Insights summary | Top-mover + biggest-gap + compliance-delta sentences computed live from a synthetic dataset. |
| `aggregation-rollup` | Quick-view aggregation | Pick monthly / quarterly / yearly, see a synthetic aggregate computed from 12 weekly source rows. Mirrors `QuickViewAggregateBar` + the aggregation engine output. |
| `import-wizard-demo` | Import preview | Drop a tiny CSV in-browser, see the mapping step + validation outcomes, with no DB writes. Helps admins rehearse the flow before the real import. |

Each playground is a pure client component reusing the same `lib/data/insights.ts` + `lib/data/autoTotal.ts` functions used in production — that's the point: the demo *is* the algorithm.

---

## 7. Risks + edge cases

- **xlsx parser bundle size.** SheetJS is ~600 KB minified. Mitigation: dynamic-import `xlsx` only inside the imports route (server-side) and only after the file is sniffed as xlsx. The wizard client never loads it.
- **Buffer storage in `ImportJob.storageRef`.** Today the column is text and stores raw CSV. For xlsx we'll persist base64 with a `fileFormat` discriminator. Existing rows keep working unchanged.
- **Role enum drift.** Postgres enums can't gain values at runtime without a migration. Mitigation: store role assignments as `roleId: string` (FK to `Role.id`) on `User`/`InviteLink`/`FormAssignmentRule` *alongside* the legacy enum column. New code reads `roleId`; legacy paths fall back to the enum. After a couple weeks the enum becomes vestigial — but it's never dropped.
- **SUPERADMIN immutability under role CRUD.** The Role table flag `isSystem=true` enforces immutability *and* the API rejects edits on the SUPERADMIN row. Same protection as today, just expressed at the data layer.
- **Multi-root hierarchy + aggregation.** Existing aggregation engine assumes Group→Campus. With multi-root, an aggregation request needs an explicit `rootKey` or a `unitId` (already polymorphic). Mitigation: legacy "campus/group/global" CTAs keep working; new aggregation surfaces (Departments etc.) ship behind a "Choose a tree" picker.
- **Migration order.** `org_units` must back-fill before any other table's `unitId` column does. The migration sequence is critical and must run in a single `prisma migrate deploy` invocation in a maintenance window.
- **Admin-editable public copy injection vector.** Admins are trusted (SUPERADMIN-only writes), but we still sanitise: no `<script>`, no `javascript:` URLs, no protocol-relative `//foo`, max field lengths, allowlisted markdown subset for body fields.
- **How-It-Works structural drift.** When the structure of `howItWorks` changes (new field on a tab), the fallback typed shape in `config/content.ts` and the editor schema must move together. Add a small zod schema in `lib/data/publicCopy.ts` that both sides validate against to prevent drift.
- **Playground breakage on backend evolution.** If `lib/data/insights.ts` signatures change, playgrounds break silently. Add a unit test that imports each registered playground and asserts mount-without-error against the current insight surface.

---

## 8. Concrete implementation tasks (canonical sequence — append to task-queue.md)

### Phase A — Schema + safe additive migration

1. Add `OrgUnit` (with `rootKey`, `level`, self-FK, metadata) + `Role` (with `isSystem`, capabilities jsonb) + `RoleScope` (roleId, unitId) + `PublicCopyEntry` to `prisma/schema.prisma`. Strictly additive.
2. Add `unitId` columns + `roleId` columns alongside every legacy carrier (`reports`, `users`, `goals`, `metric_entries`, `invite_links`, `form_assignments`, `bug_reports`, `form_assignment_rules`).
3. Author migration `*_org_role_polymorphism_and_public_copy` with `CREATE TABLE IF NOT EXISTS`, `INSERT INTO ... SELECT ...` back-fills, and dual-write triggers on `org_groups` + `campuses`. No `DROP`, no `RENAME`. Apply via `prisma migrate deploy`.
4. Author `scripts/seed-roles-and-units.ts` — idempotent seeder that writes built-in roles from `ROLE_CONFIG` (with `isSystem=true` for SUPERADMIN; `isSystem=false` for the rest) and creates the seed `rootKey="primary"` tree from `ORG_HIERARCHY_CONFIG`.
5. Regenerate Prisma client; `npx prisma validate`.

### Phase B — Read paths

6. Implement `lib/data/orgUnit.ts` (CRUD + multi-root tree).
7. Implement `lib/data/orgUnitMatcher.ts` (`unitInScope`, `descendantsOf`).
8. Implement `lib/data/role.ts` (CRUD with system-protected guard + capability validator).
9. Implement `lib/data/publicCopy.ts` (zod-validated read/write with optimistic lock).
10. Add `app/api/org/units/*`, `app/api/roles/*`, `app/api/public-copy/*` route surfaces.
11. Refactor `app/api/reports/[id]/route.ts` + `app/api/reports/aggregate/route.ts` + `lib/data/reportAggregation.ts` to call `unitInScope` instead of equality on `campusId`/`orgGroupId`. Legacy column still readable for back-compat.
12. Refactor `lib/data/recurringAssignmentService.ts` + `lib/data/formAssignmentRule.ts` to use `unitIds[]` + the matcher.
13. Refactor `lib/auth/permissions.ts` to read `Role`-table rows first, falling back to `ROLE_CONFIG`. `verifyAuth` returns `auth.user.role` from the Role table when present.
14. Refactor `app/page.tsx` + `app/how-it-works/page.tsx` + `app/about/page.tsx` + `app/privacy/page.tsx` + `app/terms/page.tsx` to read content from the new namespaces with `config/content.ts` fallback.

### Phase C — Imports xlsx fix

15. Add `xlsx` (SheetJS) as a server-only dependency. Implement `parseXlsx(buf): SheetParseResult` (returns `{ sheets: [{ name, rows: string[][] }] }`).
16. Refactor `lib/data/importPipeline.ts` → `parseSpreadsheet(input: { mime, buffer | text })` dispatcher; `parseCsv` stays unchanged.
17. Update `app/api/imports/[id]/file/route.ts` to accept `.xlsx`/`.xls` mimes (allowlisted via admin-config `imports.allowedMimes`); persist as base64 with `fileFormat: "XLSX"` discriminator.
18. Update `app/api/imports/[id]/mapping/route.ts` to dispatch + return per-sheet sample rows.
19. Update `app/api/imports/[id]/validate/route.ts` + `commit/route.ts` to iterate the chosen sheet's rows.
20. Update `modules/imports/components/ImportWizardPage.tsx` to: (a) accept the wider mime set, (b) prompt for sheet selection on multi-sheet xlsx, (c) surface friendly parse-error messages.

### Phase D — Admin Config UI extensions

21. Build `RolesEditorV2.tsx` with CREATE dialog (code + label + capability picker + visibility scope + dashboard mode + optional scope-unit pin). Replace the existing `RolesEditor` mounting.
22. Build `OrgUnitTreeEditor.tsx` (multi-root, variable-depth, drag-reorder, level rename inline, archive/restore action).
23. Build `LandingCopyEditor.tsx` (hero, features list, quick-links, footer).
24. Build `HowItWorksEditor.tsx` (tabs + sections + FAQs + playgroundIds picker, drag-reorder).
25. Mount all four editors as new tabs under Admin Config; legacy JSON editor remains as fallback for unknown namespaces only.

### Phase E — How-It-Works playgrounds

26. Add the seven new playgrounds (§6) to `modules/how-it-works/playgrounds.tsx`:
    `analytics-chart-toggle`, `template-builder-effect`, `correlation-matrix-builder`, `auto-sum-chain`, `insight-summary-preview`, `aggregation-rollup`, `import-wizard-demo`.
27. Update each tab in the `howItWorks` fallback to reference the appropriate `playgroundIds` (overview gets `analytics-chart-toggle`; ushers keeps `quick-form-demo`; campus-admin gets `auto-sum-chain` + `template-builder-effect`; group-leadership gets `aggregation-rollup`; executive gets `insight-summary-preview` + `correlation-matrix-builder`; admin-config gets `import-wizard-demo`).

### Phase F — Hardcoded-fallback refresh

28. Update `config/content.ts → landing.features` to mention the polymorphic hierarchy + multi-tree + role CRUD as live capabilities.
29. Refresh `config/content.ts → howItWorks.tabs[*].sections + faqs` so every claim matches the platform's current state at the end of this work (auto-totals + WoW + correlation panel + impersonation + multi-tree hierarchy + role CRUD).
30. Add an `aboutPage` + `privacyPage` + `termsPage` namespace stub in `config/content.ts` so the new editor has something to read on first save.

### Phase G — Tests + docs

31. `test/orgUnitTreeCrud.test.ts` — multi-root tree creation, descendants, ancestors, archive flow.
32. `test/orgUnitMatcher.test.ts` — `unitInScope` correctness across single-root, multi-root, archived, deeply-nested cases.
33. `test/roleCrudPermissions.test.ts` — SUPERADMIN write rejection, capability-subset validator, scope-binding round-trip.
34. `test/publicCopySanitise.test.ts` — script tag, javascript URL, protocol-relative URL all rejected.
35. `test/xlsxImportParse.test.ts` — single-sheet, multi-sheet, empty rows, formula cells, malformed xlsx (rejection with `import_parse_failed`).
36. `test/playgroundsMount.test.ts` — every registered playground mounts without error against current `lib/data/insights.ts` + `autoTotal.ts` signatures.
37. `test/migrationAdditiveSafety.test.ts` extension — new migration adds columns + tables only; no DROP/RENAME/TRUNCATE.
38. Update `.ai-system/agents/system-architecture.md` — module breakdown rows + data-flow entries 65–80.
39. Update `.ai-system/agents/project-context.md` — multi-tree hierarchy + role CRUD constraints + public-copy substrate.
40. Update `.ai-system/agents/repair-system.md` with the xlsx parse error + playbook for the dual-write trigger drift case.
41. Update `.env.example` (`PUBLIC_COPY_DB_ENABLED`, `IMPORT_ALLOWED_MIMES`, `IMPORT_XLSX_MAX_SHEETS`).
42. Update `.ai-system/planning/project-plan.md` Phase 6 entries: tick "Admin-editable configuration system", "Excel/Spreadsheet import"; add a new "Multi-tree polymorphic hierarchy" line.

### Phase H — Cleanup + lint

43. Add ESLint rule `no-hardcoded-org-label` (fires on user-facing "Campus" / "Group" outside `config/hierarchy.ts` + `lib/data/orgUnit.ts`).
44. Add ESLint rule `no-hardcoded-role-label` (fires on user-facing role names outside `config/roles.ts` + `lib/data/role.ts`).
45. Sweep every UI surface that says "Campus" / "Group" / role label and resolve through `resolveHierarchyLevels()` + `resolveRoleConfig()`.

---

## 9. Architecture doc updates required

- **`system-architecture.md`** — add module rows for `lib/data/{orgUnit,orgUnitMatcher,role,publicCopy}.ts` + `app/api/{org/units,roles,public-copy}/*` + the new admin editors. Add data-flow entries 65–80 covering: polymorphic OrgUnit reads, multi-root tree, role CRUD with isSystem flag, public copy substrate, xlsx parser dispatch, ESLint enforcement.
- **`project-context.md`** — reaffirm: "Hierarchy depth + level labels + tree count are admin-editable. Roles are runtime-CRUDable except SUPERADMIN. Public copy is admin-editable with hardcoded fallbacks."
- **`repair-system.md`** — add error entries for: xlsx parse failure path (with the friendly error code), dual-write trigger divergence detection, role-system-protection bypass attempt, public-copy XSS attempt.

---

## 10. Single-pass cut

This is **multi-day, multi-pass** work. The recommended cut:

1. **Pass 1 (1–2 days):** Phase A schema + Phase C xlsx fix. Lowest-risk first; gives admins the xlsx fix immediately while the polymorphism back-fill bakes.
2. **Pass 2 (2–3 days):** Phase B read paths + Phase D admin editors + Phase E playgrounds.
3. **Pass 3 (1 day):** Phase F (fallback refresh) + Phase G (tests + docs) + Phase H (lint sweep).

Each pass is independently shippable and rollback-safe (additive-only migrations, dual-write triggers keep legacy paths alive, fallback content always available).

**No code in this turn — awaiting plan approval per `plan-feature.md` contract.**
