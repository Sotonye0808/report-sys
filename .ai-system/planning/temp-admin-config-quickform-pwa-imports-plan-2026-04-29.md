# Temp Plan — Admin Config + Quick Forms + Advanced Analytics + Imports + PWA + Bulk Invites

> **Date:** 2026-04-29
> **Status:** Active planning — supersedes the bullet-level planned-feature block in `task-queue.md` for the duration of this initiative. Concrete tasks at the bottom of this doc are the canonical sequence; mirror in `task-queue.md` once approved.
> **Driver:** Move every operational surface (roles, hierarchy levels, report/metric mappings, action-to-role bindings, dashboard widget bindings, invite/import templates, PWA copy) onto a config-driven, admin-editable substrate while preserving current `config/*` as immutable fallback. Add an USHER-style data-entry quick-form with metric-subset assignments, role-aware analytical landings (scope overview → drill-in), spreadsheet imports, PWA install + push prompt onboarding, and a bulk invite + pre-registration system.

---

## 1. Feature Summary

This initiative unifies six adjacent enhancements behind one substrate so each one stops re-inventing access control, copy, scope resolution, and audit:

1. **Admin-editable config** — promotes today's hardcoded `config/*` files (roles, hierarchy levels, report/metric mappings, capability bits, navigation gating, action-to-role bindings) to a versioned DB-backed store with a typed loader. Loader is **DB-first with `config/*` fallback**, cached per-namespace, and invalidated on write.
2. **USHER quick-form + form assignments** — introduces a new role (`USHER`) plus a `FormAssignment` entity that pins a specific report (current or scheduled) and a subset of metric IDs to one or more users. The assignee sees a minimal one-screen form for those metrics only, and (when configured) sees only their own input value on goals — never the section/template wider context.
3. **Role-aware analytics landings** — superadmin / CEO / Office-of-CEO / SPO / CHURCH_MINISTRY land on a scope overview (group performance ranking, top campus, compliance heatmap, period selector). Group roles land on campus rollup. Campus roles land on metric trend. USHERS land directly on assigned forms. Drill-in routes are dedicated pages (not modals).
4. **Comparison + correlation controls** — report-level and analytics-level toggles for which metrics participate in correlation; defaults configurable on the template, overridable per analytics view, with values cached in the user's analytics preferences (config-driven defaults, no hardcoded metric IDs anywhere).
5. **Spreadsheet import pipeline** — upload → parse (xlsx/csv) → field-mapping wizard (template/section/metric resolution) → validate (zod + duplicate / out-of-range / unknown-metric checks) → preview → commit (transactional, chunked). Mappings are saved as `ImportMappingProfile` rows so similar files reuse them.
6. **PWA install + push onboarding** — non-blocking banner that detects platform (iOS Safari, Android Chrome, desktop Chromium/Edge), shows OS-tailored steps from `config/content.ts`, and once installed prompts for push permission. Dismissals are persisted (per-user-per-platform) so the prompt does not re-pester.
7. **Bulk invites + pre-registration** — single-form bulk creation with same-role / mixed-role variants, plus an "import these emails as users right now" path that writes user rows with a server-issued placeholder password and sends a special activation link (forced password change on first sign-in). Existing-email collision is treated as a domain-level outcome (not an exception): respond with `linked_existing` or `already_registered` and surface the right CTA.

Every item above is **config-driven**: no role names, dashboard widget IDs, metric IDs, scope rules, push copy, or import-mapping shapes are hardcoded in modules. Config keys live in `config/*` (typed and authoritative on first boot), are mirrored to DB on first save, and are admin-editable from a new `Admin Config` surface.

---

## 2. Architecture Impact

| Layer | Affected | Change |
|---|---|---|
| `types/global.ts` | UserRole + RoleConfig + new domain interfaces | Add `USHER`, optional capability bits (`canQuickFormFill`, `canManageAdminConfig`, `canImportSpreadsheets`), and analytical-landing config |
| `config/roles.ts` | ROLE_CONFIG | Default capabilities for `USHER` + new bits; remains the immutable fallback |
| `config/nav.ts` | DASHBOARD_NAV_ITEMS | Add nav for Admin Config, Imports, Quick Forms, Bulk Invites; gating moves through the new loader |
| `config/content.ts` | new `adminConfig`, `imports`, `quickForm`, `pwaInstall`, `bulkInvites` namespaces | All copy added here; nothing inline in components |
| `prisma/schema.prisma` | new models | `AdminConfigEntry`, `FormAssignment`, `ImportJob`, `ImportJobItem`, `ImportMappingProfile`, `BulkInviteBatch`, `PwaPromptDismissal`, `UserActivationToken`; `User.role` enum gains `USHER`; `InviteLink` adds `batchId` |
| `lib/data/adminConfig.ts` | **new** | DB-first loader with `config/*` fallback, namespace-scoped cache (Redis + in-process), invalidation on write |
| `lib/data/formAssignment.ts` | **new** | Resolve assignments for user, narrow report payload to assigned metrics |
| `lib/data/importPipeline.ts` | **new** | Parse → validate → preview → commit, chunked transaction with compensation |
| `lib/auth/permissions.ts` | derived from loader | All `can*` checks read from loader (DB → config fallback) instead of `ROLE_CONFIG` directly |
| `app/api/admin-config` | **new** | GET (namespace), PUT (namespace, idempotent), POST (reset-to-fallback) |
| `app/api/form-assignments` | **new** | List for current user, list/create/update/delete for managers |
| `app/api/imports` | **new** | Create job, upload chunk, validate, preview, commit, status |
| `app/api/invite-links/bulk` | **new** | Bulk-create batch with same/different attrs |
| `app/api/users/preregister` | **new** | Pre-register existing emails as users with activation token |
| `app/api/auth/activate` | **new** | Activation flow that forces password change on first login |
| `app/api/notifications/pwa-dismissal` | **new** | Persist dismissal per (user, platform, kind) |
| `modules/admin-config/*` | **new** | Editor UI for each namespace, JSON-schema-driven forms |
| `modules/quick-form/*` | **new** | Assignee landing, single-metric input, autosave |
| `modules/imports/*` | **new** | Wizard: upload → mapping → preview → commit |
| `modules/dashboard/*` | refactor | Widget bindings via loader; role-overview vs role-detail panel split |
| `modules/users/components/InvitesPage.tsx` | extend | Bulk mode tab + pre-register tab |
| `components/ui/PwaInstallBanner.tsx` | **new** | OS-aware banner + push prompt; reads dismissal state from API |
| `app/(auth)/join/*` | extend | Honor query-param targeting (template, section, metricIds, periodHint) for auto-redirect into prefilled forms |
| `.env.example` | extend | Document any new toggles (e.g. `ADMIN_CONFIG_DB_ENABLED` to flag-gate substrate while DB warms up) |

---

## 3. Data Flow

### 3a. Admin config read

```
component → useAdminConfig(namespace)
        → /api/admin-config?ns=<ns>
        → app/api/admin-config/route.ts
        → lib/data/adminConfig.load(ns)
            ├── Redis cache hit?  → return
            ├── DB AdminConfigEntry rows for ns  → assemble + cache + return
            └── neither?  → return config/<ns>.ts  (immutable fallback)
```

Writes go through `adminConfig.write(ns, payload, actorId)` which does:
- zod validation against the namespace schema (declared once, used by both API and admin UI)
- write a new `AdminConfigEntry` row (versioned: previous row stays for audit)
- non-blocking Redis invalidation (`ns:adminConfig:*`)
- emit `AdminConfigEvent` (audit trail)

### 3b. Quick-form assignee path

```
USHER login → /quick-form
  → /api/form-assignments?userId=me&status=active
  → returns array of FormAssignment{ reportId, metricIds[], dueAt }
USHER taps assignment → /quick-form/[assignmentId]
  → /api/reports/{reportId}?metricIds=<csv>  (server narrows payload)
  → render only assigned metric inputs (single column, autosave on blur, 30s background save)
  → submit → /api/reports/{reportId}/quick-fill (server verifies assignment + metric IDs)
```

If a metric ID in the payload is NOT in the active assignment, request is rejected with `403 unauthorized_metric` — never silently dropped.

### 3c. Import pipeline

```
1) admin uploads file via wizard → POST /api/imports (creates ImportJob row, returns id)
2) browser uploads file body via PUT /api/imports/{id}/file (chunked)
3) server parses with sheet.js → returns inferred columns + sample rows
4) wizard renders mapping UI (column → template metric or template section)
5) admin saves mapping → POST /api/imports/{id}/mapping (zod-validated)
6) admin runs validate → POST /api/imports/{id}/validate (creates ImportJobItem rows w/ per-row outcome)
7) admin reviews preview → POST /api/imports/{id}/commit
   - chunked transaction (uses runBulkTransaction helper from org bulk pattern)
   - compensation: failure within a chunk rolls back chunk; whole-job rollback only if explicitly requested
8) on commit success, ImportMappingProfile auto-saved (named) so future similar files reuse mapping
```

### 3d. PWA install

```
On every authenticated page load:
  PwaInstallBanner reads dismissal cookie + GET /api/notifications/pwa-dismissal
  if neither set AND platform matches AND not already running standalone:
    show banner with platform-specific copy from config/content.ts
  on dismiss: PUT /api/notifications/pwa-dismissal { kind, platform, mode: 'snooze'|'never' }
  on install (Android prompt event captured):
    after window.matchMedia('(display-mode: standalone)') flips,
    show push prompt sub-banner if Notification.permission === 'default'
    permission grant → reuse existing push subscription flow
```

### 3e. Bulk invite + pre-register

```
Bulk invite (link only):
  POST /api/invite-links/bulk { entries: [{ email, role, scope, expires }], shared: { ... } }
  → creates BulkInviteBatch, then InviteLink rows referencing batchId
  → optional email send per entry
  → response includes per-entry outcome: { created | already_invited | already_registered }

Pre-register (creates user + activation link):
  POST /api/users/preregister { entries: [{ email, role, scope, firstName?, lastName? }] }
  for each entry:
    if user exists with matching email → respond 'already_registered' (NO password change)
    else create user with random password + UserActivationToken (one-time, hash-stored)
    fire activation email with /activate?token=<>
  Activation flow:
    user clicks /activate?token=...
    /api/auth/activate verifies token, forces password change
    on success, normal login session issued
```

---

## 4. UI/UX

### 4a. Role-aware dashboard landings (per user request)

Configured via `dashboardLayout` namespace (admin-editable):

| Role band | First-load panels | Drill-in pages |
|---|---|---|
| SUPERADMIN, OFFICE_OF_CEO, CEO, SPO, CHURCH_MINISTRY | Group performance ranking · Top campus · Org compliance heatmap · Period selector (week/month/quarter) · Recent submissions · Quick links to Admin Config | `/analytics/groups`, `/analytics/campus-leaderboard`, `/analytics/correlations`, `/analytics/quarterly` |
| GROUP_PASTOR, GROUP_ADMIN | Campus performance ranking inside their group · Top metric movers · Campus compliance · Pending review queue | `/analytics/group/<id>`, `/analytics/campus-detail/<id>` |
| CAMPUS_PASTOR, CAMPUS_ADMIN | This-week / this-month / this-quarter compliance · Goal vs achieved per metric · Pending submissions · Quick start | `/analytics/campus/<id>`, `/reports?campusId=...` |
| DATA_ENTRY | Outstanding back-fill periods · Recent entries · Quick start | `/reports/new` |
| USHER | List of active assignments (pinned) · Recent submissions · No analytics or template surfaces | `/quick-form/<assignmentId>` |
| MEMBER | Lobby (unchanged) | — |

Widgets are rendered from a `dashboardLayout.byRoleBand` config map. Each entry is `{ widgetId, panelSize, allowedRoles, dataSource }`. Widget components register themselves in a small registry; layout config picks which widgets render. **No role-specific JSX branches** — only registry lookup + filter.

### 4b. Quick-form

- Single column, large hit targets, autosave indicator, no template/section navigation.
- Each metric shows its label, optional helper, current input. Goals never visible.
- "Submit" only enabled when all required assigned metrics have values; partial submits become drafts.
- Empty-state on no active assignments.

### 4c. Admin Config surface

- Tabs per namespace: Roles, Hierarchy, Templates Mapping, Dashboards, Quick-form Assignments, Imports Mappings, PWA Copy, Invite Defaults, Email Copy.
- Each tab is a JSON-schema-driven form (we already have the zod schemas — derive UI fields from them) with diff preview vs. fallback.
- "Reset to defaults" reverts to `config/*` value (writes a tombstone row marking the namespace as fallback).
- All edits versioned with actor and timestamp.

### 4d. Imports wizard

- Stepper: Upload → Map columns → Preview → Confirm.
- "Use saved mapping" dropdown on step 2 if a profile matches the file shape.
- Per-row validation badges; row-level "fix and retry".

### 4e. PWA banner

- Sits above main content on first authenticated load. Dismissable. Re-shown after 14 days unless `mode: 'never'`.
- iOS shows Safari "Share → Add to Home Screen" steps with screenshots from `public/install/`. Android Chrome triggers the BeforeInstallPromptEvent flow when available.

### 4f. Auto-invite redirect

- `/join?token=<>&redirect=<encoded /reports/new?templateId=...&period=...&metricIds=...>` lands the user on registration → on completion, replays the encoded redirect target with hardened query-param parsing (whitelist of allowed targets).

---

## 5. Risks + Edge Cases

- **Loader fallback safety.** Bug in DB schema must not brick the app; loader returns `config/*` on parse failure or DB outage and emits a structured warning. Cache miss path also tolerates partial namespace data (use schema's `.partial().merge(default)`).
- **Permission inversion.** Admin must not be able to demote themselves out of `canManageAdminConfig`. Enforce a server-side invariant that at least one user retains the bit (similar guard for any "admin-required" capability).
- **USHER scope bleed.** Server must verify each metric write against the assignment's metric set on every payload — never trust client-sent metric IDs.
- **Import rollback.** Chunked commits create partial state on multi-chunk failure. Default behavior: all-or-nothing per job (compensation deletes inserted rows on abort) unless admin opts into "best effort" mode.
- **Bulk invite duplicate emails within payload.** Treat case-insensitively, dedupe before processing, return per-entry status keyed by normalized email.
- **Pre-register existing user.** Never overwrite credentials. Return `already_registered` and (if the requester has the right) trigger a separate "send activation reset" rather than silently rotating their password.
- **PWA dismissal storage.** Cookie + server row needed because users sign in on multiple devices; per-device dismissal is keyed by user agent class, not full UA string.
- **Config write race.** Two admins editing the same namespace concurrently — use optimistic concurrency: include `version` in PUT, reject with `409 conflict` if mismatched.
- **Activation token reuse.** One-time, hash-stored, expires after `ACTIVATION_TOKEN_TTL_HOURS` (default 72). Used token rotates so a leaked link cannot be reused.
- **Analytics correlation perf.** Correlation across many metrics is O(n²). Cap at config-driven `analytics.correlation.maxMetrics` (default 12) and surface "compare the rest" CTA to drill into a wider report.
- **Existing fallback drift.** When `config/*` and DB diverge meaningfully, the diff view in admin config must surface the gap so admins know they have an override.

---

## 6. Concrete Implementation Tasks (canonical sequence)

> These replace the bullet block under "Planned Feature — Admin Config + Quick Forms + Advanced Analytics + Imports + PWA + Invites" in `task-queue.md` once mirrored.

### Phase A — Foundation (this pass)

1. Add `USHER` role to `UserRole` enum in `types/global.ts` and `prisma/schema.prisma`; extend `ROLE_CONFIG` with USHER capabilities + new capability bits (`canQuickFormFill`, `canManageAdminConfig`, `canImportSpreadsheets`, `canBulkInvite`, `canViewScopeOverview`).
2. Add Prisma models: `AdminConfigEntry`, `FormAssignment`, `ImportJob`, `ImportJobItem`, `ImportMappingProfile`, `BulkInviteBatch`, `PwaPromptDismissal`, `UserActivationToken`. Add `batchId` to `InviteLink`.
3. Generate + apply migration via `prisma migrate dev` (or `migrate deploy` per data-safe policy).
4. Implement `lib/data/adminConfig.ts` with DB-first load + `config/*` fallback, Redis namespace cache, optimistic-lock writes, audit emit.
5. Implement `lib/data/formAssignment.ts` (resolve-for-user + verify-metric-subset).
6. Implement `lib/data/importPipeline.ts` (parse, mapping store, validate, preview, chunked commit + compensation; reuse `runBulkTransaction`).
7. Add API routes: `/api/admin-config` (GET/PUT/POST reset), `/api/form-assignments` (CRUD), `/api/imports` (job + steps), `/api/invite-links/bulk`, `/api/users/preregister`, `/api/auth/activate`, `/api/notifications/pwa-dismissal`.
8. Add `lib/auth/permissions.ts` reading from `adminConfig.load("roles")` with fallback to `ROLE_CONFIG`; route the existing `useRole`/`canTransitionReport` checks through it.
9. Update `config/content.ts`: namespaces `adminConfig`, `imports`, `quickForm`, `pwaInstall`, `bulkInvites`, `preregister`, `activation`. No copy inline anywhere.
10. Update `config/nav.ts`: gate via permission check, add new entries (Admin Config, Imports, Quick Forms, Bulk Invites).
11. Update `config/routes.ts`: add new app + API routes.

### Phase B — UI surfaces

12. `modules/admin-config/components/AdminConfigPage.tsx` with tabs per namespace, schema-driven forms, diff vs fallback, reset-to-defaults.
13. `modules/quick-form/components/QuickFormLandingPage.tsx` (assignment list) + `QuickFormFillPage.tsx` (single-assignment fill, autosave, submit).
14. `modules/imports/components/ImportWizardPage.tsx` (upload → mapping → preview → commit, with saved mapping selector).
15. Refactor `modules/dashboard/components/DashboardPage.tsx` into widget registry + role-band layout consumer.
16. `components/ui/PwaInstallBanner.tsx` with platform detection, OS copy, BeforeInstallPromptEvent capture, dismissal API integration.
17. `components/ui/PwaPushPrompt.tsx` (chained sub-banner after install) reusing existing push subscription flow.
18. Extend `modules/users/components/InvitesPage.tsx` with Bulk Invite tab + Pre-register tab + per-row outcome table.
19. Add `app/(auth)/join/page.tsx` query-param-aware redirect helper (whitelisted destinations).
20. Add `app/(auth)/activate/page.tsx` to consume `UserActivationToken` and force password change.
21. Add `modules/analytics` scope-overview presets (group / campus / metric movers / correlations) and metric-correlation toggle UI; correlation defaults read from template config + analytics namespace override.

### Phase C — Polish + tests + docs

22. Regression tests: `test/adminConfigLoader.test.ts` (DB hit, fallback, override drift, optimistic-lock conflict).
23. `test/formAssignmentEnforcement.test.ts` (assignment-bound metric subset, unauthorized metric rejection).
24. `test/importPipeline.test.ts` (mapping save/replay, chunked commit, compensation).
25. `test/bulkInviteAndPreregister.test.ts` (existing-email handling, activation flow, token reuse rejection).
26. `test/pwaInstallDismissal.test.ts` (per-platform dismissal persistence + re-show window).
27. `test/dashboardWidgetRegistry.test.ts` (role-band → widget set, no JSX branching).
28. Update `.ai-system/agents/system-architecture.md`: new modules row, new env keys, new data-flow numbered entries (admin-config, imports, quick-form, PWA, bulk invites).
29. Update `.ai-system/agents/project-context.md`: add USHER role to stakeholder table; add admin-config-driven note to business constraints.
30. Update `.env.example` with `ADMIN_CONFIG_DB_ENABLED`, `ACTIVATION_TOKEN_TTL_HOURS`, `IMPORT_MAX_FILE_BYTES`, `PWA_BANNER_REENGAGE_DAYS`.
31. Add diagnostics-runbook section for new write routes (where request IDs land, namespace cache keys, import-job state inspection).
32. Mirror finalized task block back into `.ai-system/planning/task-queue.md` and mark superseded items.

---

## 7. Architecture Doc Updates Required

- `.ai-system/agents/system-architecture.md`
  - Module breakdown: add rows for `lib/data/adminConfig.ts`, `lib/data/formAssignment.ts`, `lib/data/importPipeline.ts`, `modules/admin-config/*`, `modules/quick-form/*`, `modules/imports/*`.
  - Data flow: append entries (16) admin-config DB-first read with fallback; (17) form-assignment metric narrowing; (18) import pipeline chunked commit; (19) PWA dismissal persistence; (20) bulk invite + activation flow.
  - Configuration points: add new env keys.
  - Tech stack: add `xlsx` (import parsing) + note re-using existing `runBulkTransaction` helper.

- `.ai-system/agents/project-context.md`
  - Stakeholder roles table: add `USHER`.
  - Business constraints: add "Admin-editable config substrate must remain DB-first with `config/*` as immutable fallback; no role/widget/copy may be hardcoded in modules."

- `.ai-system/agents/repair-system.md`
  - Add patterns once we hit them: namespace cache invalidation drift, optimistic-lock conflicts, USHER metric leak attempts.

- `.ai-system/operations/diagnostics-runbook.md`
  - Add namespace cache key conventions.
  - Add import-job inspection commands.
  - Add activation-token diagnostic note (one-time-use signature mismatch).

---

## 8. Single-Pass Delivery Cut

A full single-pass landing of all 32 tasks above is bigger than is responsible to ship without staged review. The single-pass cut for THIS session is **Phase A (foundation) plus the smaller, lower-risk surfaces from Phase B**:

- All of Phase A (1–11).
- From Phase B: PWA install banner (16) + push prompt (17), Bulk invite extension (18), Activation page wiring (20), and `/join` query-param helper (19). These are self-contained and unblock the rest.

Bigger Phase B surfaces (Admin Config editor UI, Quick-form pages, Imports wizard, Dashboard widget registry, Analytics correlation UI) and all of Phase C are queued as discrete follow-up tasks in `task-queue.md` so subsequent passes can pick them up against a stable foundation. The foundation makes those follow-ups much smaller because the substrate already exists.
