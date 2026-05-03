# Development Task Queue

> **Overview:** Sprint-level task queue. Agents execute tasks top to bottom within the current sprint. When a task is completed, mark it [x] and add a checkpoint entry. Future tasks are queued below for prioritisation in the next sprint.

---

## Current Sprint

> **Section summary:** Tasks actively being worked on. Agents pick the first incomplete task.

- [x] Fix report template edit failures (500/504) + stabilize cache invalidation
- [x] Align auth session lifetime with env config and add automatic token refresh
- [x] Add regression tests for report template API and auth refresh behavior
- [x] Add regression tests for report unlock and audit trail visibility
- [x] Ensure superadmin (and other empowered roles) can edit/submit draft reports and see action buttons on report detail
- [x] Add unlock-report action + backend endpoint so superadmin can unlock & edit locked reports
- [x] Make “Add report” button always visible for superadmin and roles with create-report privilege
- [x] Fix goal save 429s and enforce ACID bulk goal updates (batch endpoint + transaction)
- [x] Update goal bulk UI to use batch endpoint and handle 429 with retry/backoff
- [x] Adjust API rate limiter configuration for bulk operations to prevent false-positives
- [x] Add regression tests for bulk goal upsert atomicity and rate-limit handling
- [x] Harden report template API caching to prevent 500s (parse cached payload + improved error logging)
- [x] Implement offline draft persistence + restore for reports, templates, and goals
- [x] Implement universal form auto-save + restore for all forms (reports/templates/goals/org/bug reports)
- [x] Reduce Prisma interactive transaction timeout limit to 15000 for bulk operations and template edits
- [x] Add offline sync indicator + retry queue for pending offline submissions
- [x] Fix offline/online redirect loop (dashboard loading stuck) by restoring pre-navigation state
- [x] Implement draft persistence for goals page and templates editing
- [x] Complete audit trail refactor by moving template version snapshot events to central helper (`lib/utils/audit.ts`) (report workflow events already migrated)
- [x] Fix report form stuck period/template selection (cached state rehydration issue) and repetitive goals loading by stabilizing loader effects and value tracking
- [x] Fix router navigation failure where page transitions require reload before working
- [x] Wire Resend email service into invite creation, password reset, report workflow events (submission/approval/lock/reminder)
- [x] Implement missing report workflow endpoints & UI: edit drafts, update requests, and goal unlock requests
- [x] Update documentation and `.env.example` for Resend and production env variables
- [x] Consolidate API response contract for invite/profile/org CRUD routes using shared helpers (`successResponse`, `errorResponse`, `handleApiError`) with consistent `success|data|error|code` payload shape
- [x] Introduce shared client mutation utility for API writes (pending/success/error lifecycle, safe loading reset, unified toast mapping, request/response logging)
- [x] Refactor `InvitesPage`, `ProfilePage`, `OrgPage`, and `InboxPage` mutations to use consolidated mutation utility with guaranteed refetch/invalidation on success
- [x] Extract invite/profile/org write operations into domain services to centralize validation, transaction boundaries, and cache invalidation
- [x] Add request correlation IDs + structured logs for write routes (invite links, user profile, org groups/campuses/hierarchy bulk, notifications)
- [x] Add config-driven email template registry and shared email layout wrapper (logo, brand header/footer, dynamic placeholders) for all Resend email types
- [x] Complete channel-orchestrated notification flow (in-app + email + push) with graceful fallback when `RESEND_API_KEY` is missing
- [x] Add persistent notification preference and push subscription APIs; wire profile notification settings to backend storage instead of local-only state
- [x] Add regression tests for non-stuck loading states and response/error handling on invite/profile/org CRUD flows
- [x] Add integration tests for Resend-enabled and Resend-disabled modes to verify email gating does not break core app behavior
- [x] Add diagnostics runbook section in `.ai-system` for tracing failed operations (where to find request IDs, structured logs, and route debug metadata)
- [x] Hotfix Redis cache invalidation cursor termination bug (`"0"` vs `0`) that caused profile/org write requests to remain pending and return gateway timeout responses
- [x] Move profile/org/hierarchy write-path cache invalidation to non-blocking async invalidation and correct concrete org list cache keys
- [x] Fix push notification toggle synchronization: detect existing browser subscription, avoid duplicate subscribe path, and guard missing `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- [x] Add regression test coverage for Redis scan cursor string termination and write-route completion under cache invalidation load
- [x] Add UI regression test coverage ensuring profile and org hierarchy mutations update UI state without manual refresh
- [x] Add push notification sync test matrix (permission granted + existing subscription, granted + no subscription, missing VAPID key)
- [x] Implement Cloudinary managed asset lifecycle for bug report screenshots (session/create-upload-finalize-discard-cleanup, ACID + compensation, legacy screenshotUrl compatibility)
- [x] Add schema + migration groundwork for `MediaAsset`, `AssetUploadSession`, and `AssetLifecycleEvent`
- [x] Add bug report UI integration for managed screenshots with deferred submit default and `preupload_draft` feature flag
- [x] Add stale TEMP screenshot cleanup API path with auth/token guard and structured request-id logging
- [x] Add lifecycle state-machine and migration compatibility regression tests for screenshot lifecycle
- [x] Fix org hierarchy bulk transaction expiry by chunking writes, validating payload size, and applying transaction timeout policy
- [x] Add hierarchy bulk editor local draft persistence/restore parity in `modules/org/components/OrgPage.tsx`

---

## Up Next

> **Section summary:** Tasks planned for the next sprint. Not yet started.

- [x] Enhance visual analytics to support user-selectable chart types (bar, line, pie, area) in `modules/analytics/components/AnalyticsPage.tsx`.
- [x] Implement template version sync in report rendering: load metric name from template version by metric ID, and keep existing reports backwards-compatible.
- [x] Add UI feedback for template upgrade mismatch and migration path in `modules/reports/components/ReportDetailPage.tsx` and `modules/reports/components/ReportEditPage.tsx`.
- [x] Refactor chart-code paths and common helpers into a shared `modules/analytics/chartUtils.ts` to avoid duplication and improve maintainability.
- [x] Improve analytics chart labeling and readability: add section/metric display options, better x-axis handling, and toggle chart libraries (Recharts, Victory, Chart.js) in `modules/reports/components/ReportAnalyticsPage.tsx`.
- [x] Add regression tests for chart label rendering (x-axis, tooltip, legend) and metric/section breadcrumbing in analytics.
- [x] Add design system audit to ensure all analytics charts conform to token colors and accessible text in `modules/analytics`.
- [x] Polish dashboard CTA copy and analytics behavior: neutral org-scoped CTA wording, fix pending-review/quarter-compliance KPI accuracy, add metrics period selector (week/month/quarter), and add overflow-safe chart containers with cross-tab chart controls in platform analytics.

### Planned Feature — Email Verification + Email Change + Inbox Parity + Footer

- [x] Add email verification data model support in `prisma/schema.prisma` (verification status, timestamps, token hash/expiry + pending email change fields) and generate/apply migration.
- [x] Add server email-service readiness helper (`RESEND_API_KEY` + `EMAIL_FROM`) and expose readiness + verification state in auth/profile payloads (`/api/auth/me`, `/api/auth/login`, `/api/auth/refresh`, `/api/users/profile`).
- [x] Add verification token lifecycle APIs: send/resend verification, verify token, verification status check, and cancel/rotate stale tokens (non-blocking when email service is not configured).
- [x] Wire registration and invite-join flows to create verification state and trigger send/resend verification email when service readiness is true.
- [x] Keep login non-blocking for unverified users, but include deterministic verification flags in returned auth user payload for contextual UI prompts.
- [x] Add legacy-user verification bootstrap flow: create inbox verification prompt + dashboard CTA for existing unverified users only when email service readiness is true.
- [x] Extend notification domain model/types/content to include email verification notifications and ensure routing target is the verification UI.
- [x] Implement email change flow APIs (request change, confirm via token, optional rollback window), with safe uniqueness checks and notification fan-out to old/new addresses.
- [x] Build user-facing UI for email verification and email change in profile/auth surfaces (show destination email address, resend action, pending-change state, success/error feedback).
- [x] Add dedicated verification landing UI route for token consumption and post-verification status display.
- [x] Ensure inbox availability for all authenticated roles by removing residual role-gating gaps (include `MEMBER` in inbox route/nav) and add guard tests that superadmin/member can access and receive inbox items.
- [x] Audit and patch notification recipient paths so superadmin and every role can receive in-app notifications for applicable events; add targeted regressions for recipient delivery.
- [x] Expand email template registry + Resend helpers with verification and email-change templates (request, confirmed, fallback copy) while keeping email sends environment-gated and non-blocking.
- [x] Add config-driven global footer component (HICC identity, dynamic current year, developer credit/link) and mount it consistently in auth/dashboard shells.
- [x] Add/refresh integration tests for verification lifecycle, email-change lifecycle, readiness-gated behavior, legacy-user prompts, inbox role parity, and footer rendering.
- [x] Update `.env.example` and `.ai-system` docs (`system-architecture.md`, diagnostics, repair patterns) with new env/config keys, data flow, and failure handling guidance.

### Planned Feature — Admin Config + Quick Forms + Advanced Analytics + Imports + PWA + Invites

> **Tightened plan:** see [`.ai-system/planning/temp-admin-config-quickform-pwa-imports-plan-2026-04-29.md`](./temp-admin-config-quickform-pwa-imports-plan-2026-04-29.md). Tasks below are the canonical sequence and supersede the prior bullet block.

#### Phase A — Foundation

- [x] Add `USHER` role + new capability bits (`canQuickFormFill`, `canManageAdminConfig`, `canImportSpreadsheets`, `canBulkInvite`, `canViewScopeOverview`) to `types/global.ts` and `ROLE_CONFIG`.
- [x] Add Prisma models: `AdminConfigEntry`, `FormAssignment`, `ImportJob`, `ImportJobItem`, `ImportMappingProfile`, `BulkInviteBatch`, `PwaPromptDismissal`, `UserActivationToken`; add `batchId` to `InviteLink`; add `USHER` to `UserRole` enum.
- [x] Run migration (`prisma migrate deploy` for data-safe environments).
- [x] Implement `lib/data/adminConfig.ts`: DB-first load + `config/*` fallback, namespace cache, optimistic-lock writes, audit emit.
- [x] Implement `lib/data/formAssignment.ts`: resolve-for-user + verify-metric-subset.
- [x] Implement `lib/data/importPipeline.ts`: parse, mapping store, validate, preview, chunked commit + compensation.
- [x] Add API routes: `/api/admin-config` (GET/PUT/POST reset), `/api/form-assignments` (CRUD), `/api/imports` (job lifecycle), `/api/invite-links/bulk`, `/api/users/preregister`, `/api/auth/activate`, `/api/notifications/pwa-dismissal`.
- [x] Add `lib/auth/permissions.ts` reading from `adminConfig.load("roles")` with `ROLE_CONFIG` fallback (SUPERADMIN immutability enforced).
- [x] Update `config/content.ts` with new namespaces (`adminConfig`, `imports`, `quickForm`, `pwaInstall`, `bulkInvites`, `preregister`, `activation`).
- [x] Update `config/nav.ts` and `config/routes.ts` for new surfaces.

#### Phase B — UI surfaces

- [x] `modules/admin-config/components/AdminConfigPage.tsx` (Roles CRUD with SUPERADMIN read-only, Hierarchy CRUD, JSON editor for other namespaces, diff/reset).
- [x] `modules/quick-form/components/QuickFormLandingPage.tsx` + `QuickFormFillPage.tsx` (single-metric input, autosave every 30s, server-enforced subset).
- [x] `modules/imports/components/ImportWizardPage.tsx` (upload CSV → map columns → validate → commit, saved-mapping profile API).
- [x] Refactor `modules/dashboard/components/DashboardPage.tsx` into widget registry + role-band layout consumer (scope-overview branch for higher-up roles).
- [x] `components/ui/PwaInstallBanner.tsx` (platform-aware OS copy, BeforeInstallPromptEvent, dismissal API).
- [x] `components/ui/PwaPushPrompt.tsx` consolidated into PwaInstallBanner sub-prompt (post-install permission request).
- [x] Bulk Invite + Pre-register surface at `/invites/bulk` (per-row outcome table; existing InvitesPage untouched).
- [x] `app/(auth)/join/page.tsx` query-param-aware redirect helper (whitelisted destinations).
- [x] `app/(auth)/activate/page.tsx` activation token consumer with forced password change.
- [x] `modules/analytics/components/AnalyticsCorrelationControls.tsx` (config-driven correlation toggle with admin-set max cap; further analytics scope-overview drill-ins served by dashboard widget registry).
- [x] `providers/RoleConfigProvider.tsx` exposes runtime role labels + dashboard layout to client; mounted at root layout.

#### Phase C — Polish + tests + docs

- [x] `test/adminConfigFallback.test.ts` (substrate-disabled fallback + AdminConfigConflictError context).
- [x] `test/formAssignmentEnforcement.test.ts` (assignment-bound metric subset, unauthorized metric rejection).
- [x] `test/importPipeline.test.ts` (CSV parser quoted/escaped fields + validateRows numeric/duplicate/unknown checks).
- [x] `test/joinRedirect.test.ts` (whitelisted target + query-param scrubbing + protocol-relative rejection).
- [x] `test/rolesConfigUsher.test.ts` (USHER + scope-overview wiring).
- [x] `test/rolePermissionsImmutable.test.ts` (SUPERADMIN sanitisation + freezeSuperadmin).
- [x] `test/dashboardWidgetRegistry.test.ts` (role-band → widget set, override filtering of unknown widget ids).
- [x] Update `.ai-system/agents/system-architecture.md` (module breakdown rows, data-flow entries 16–27, env keys, tech stack).
- [x] Update `.ai-system/agents/project-context.md` (USHER role + admin-config + runtime role/hierarchy CRUD constraints).
- [x] Update `.env.example` (`ADMIN_CONFIG_DB_ENABLED`, `ACTIVATION_TOKEN_TTL_HOURS`, `IMPORT_MAX_FILE_BYTES`, `PWA_BANNER_REENGAGE_DAYS`, `ANALYTICS_CORRELATION_MAX_METRICS`).
- [x] Add diagnostics-runbook entries for namespace cache keys, SUPERADMIN immutability, import-job inspection, activation-token diagnostics, PWA dismissal, hierarchy CRUD propagation.

### Planned Feature — Dashboard Simplification + Page Consolidation + Unified Users + Email Templates Module + `type="email"` sweep

> **Tightened plan:** see [`.ai-system/planning/temp-dashboard-emails-page-consolidation-plan-2026-04-29.md`](./temp-dashboard-emails-page-consolidation-plan-2026-04-29.md). Tasks below are the canonical sequence; awaiting plan approval before implementation.

#### Phase A — Page consolidation + email-input sweep

- [x] Convert `/invites` to a tabbed surface (Active links | Bulk create); persist tab in `?tab=`.
- [x] Convert `/bug-reports` to a tabbed surface (Submit | Manage); gate Manage on capability.
- [x] Replace `/invites/bulk` route handler with a permanent redirect to `/invites?tab=bulk`.
- [x] Replace `/bug-reports/manage` route handler with a permanent redirect to `/bug-reports?tab=manage`.
- [x] Drop `bulk-invites` and `bug-reports-manage` nav entries from `config/nav.ts`.
- [x] Sweep email-collection inputs to `type="email" inputMode="email" autoComplete="email"` across invite, bulk invite, bug-report contact email, register, login, forgot-password, join, profile email-change.

#### Phase B — Unified users directory

- [x] Add `lib/data/userDirectory.ts` joining active users + inactive-with-token + open invite links into one stream with derived status.
- [x] Extend `GET /api/users` with `includeInvited=true&status=...` flags wired to the directory helper.
- [x] Add `Status` column + filter chips to `UsersListPage` reading labels from `config/content.ts.usersList.statusLabels`.
- [x] Add `usersList.statusLabels` to `config/content.ts`.

#### Phase C — Dashboard simplification

- [x] Restyle dashboard CTAs as `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3` with equal-height cards; preserve severity colors.
- [x] Add `UsherQuickFormWidget` (inline form for next assignment) — gated on `canQuickFormFill` + active assignment.
- [x] Add `TopCampusChartWidget` (Recharts BarChart) — registered for `scope-overview-global` and `scope-overview-group` bands.
- [x] Add `MetricTrendSparkWidget` (Recharts AreaChart, 6-month rolling compliance).
- [x] Add `InsightSummaryWidget` (computed insights summary).
- [x] Update `DEFAULT_LAYOUT` per role band including new `quick-form-self` band; layout editable through Admin Config.
- [x] Auto-fill embedded form values for USHER/DATA_ENTRY: today's date label + user's `campusId` / `orgGroupId`; report period from server-truth.

#### Phase D — Email templates module

- [x] Add `lib/email/templates/definitions.ts` with declarative `{ id, defaultSubject, defaultHtml, variables, sampleVars }` per template.
- [x] Add `lib/email/templates/render.ts` with `{{var}}` substitution + per-template variable allowlist + structured warning on unknown placeholders.
- [x] Update each `send*Email` helper in `lib/email/resend.ts` to resolve subject + html via the renderer (DB override → registry fallback) with legacy-registry fallback on renderer failure.
- [x] Add `emailTemplates` namespace to admin-config substrate (loader fallback returns a snapshot derived from the registry).
- [x] Add `modules/admin-config/components/EmailTemplatesEditor.tsx` (per-template editor, variable chips, live preview iframe, send-test action).
- [x] Wire EmailTemplatesEditor into `AdminConfigPage` for the `emailTemplates` namespace.
- [x] Add `POST /api/email/test`: zod-validate `{ templateId, toEmail, sampleVars }`; render via the new helper; send via Resend when configured else return preview; per-user daily rate limit (`RESEND_TEST_DAILY_LIMIT`).
- [x] Add `sanitiseEmailTemplatesPayload` helper that drops template ids unknown to the registry on PUT.

#### Bonus — Bespoke GUI editors per namespace

- [x] `DashboardLayoutEditor` (band-by-band ordered widget picker with add/remove/reorder).
- [x] `ImportsEditor` (file size + MIME tag list).
- [x] `PwaInstallEditor` (per-OS instruction fields + push prompt copy).
- [x] `BulkInvitesEditor` (default expiry hours + default role + email gate).
- [x] `AnalyticsEditor` (correlation cap + default-enabled toggle).
- [x] `TemplatesMappingEditor` (per-row metric remap CRUD).
- [x] AdminConfigPage tab dispatcher routes each namespace to its bespoke editor; legacy JSON editor retained only as fallback.

#### Phase E — Tests + docs

- [x] `test/userDirectoryStatus.test.ts` — status priority on dedupe (ACTIVE wins; ACTIVATION_PENDING beats PENDING_INVITE).
- [x] `test/emailTemplateRender.test.ts` — variable substitution, unknown-placeholder safety, override vs fallback resolution, sanitiser drops unknown ids.
- [x] `test/dashboardWidgetLayoutMode.test.ts` — quick-form-self band resolves; chart widgets present in defaults; usher widget registered.
- [x] Update `.ai-system/agents/system-architecture.md` with new modules + data-flow entries (28–33).
- [x] Update `.ai-system/agents/project-context.md` with email-template, users-directory, and bespoke-GUI constraints.
- [x] Update `.env.example` (`RESEND_TEST_DAILY_LIMIT`, `EMAIL_TEMPLATES_DB_ENABLED`).

### Planned Feature — Role Cadence + Usher→Report Wiring + Aggregated Quick-Views + Correlation Analytics

> **Tightened plan:** see [`.ai-system/planning/temp-cadence-usher-wiring-aggregated-views-correlation-plan-2026-04-29.md`](./temp-cadence-usher-wiring-aggregated-views-correlation-plan-2026-04-29.md). Tasks below are the canonical sequence; awaiting plan approval before implementation.

#### Phase A — Schema + safe additive migration

- [x] Add `ReportTemplate.recurrenceFrequency`, `ReportTemplate.recurrenceDays Int[] @default([])`, `ReportTemplate.autoFillTitleTemplate String?`.
- [x] Add `ReportTemplateMetric.correlationGroup String?` and `ReportTemplateSection.correlationGroup String?`.
- [x] Add `Report.autoCreated Boolean @default(false)`.
- [x] Add new model `FormAssignmentRule` (id, ownerId, templateId, role, campusId?, orgGroupId?, metricIds String[], cadenceOverride Json?, isActive, createdAt). Add `FormAssignment.ruleId String?` + `periodKey`.
- [x] Author `prisma/migrations/20260430120000_role_cadence_recurring_assignments_correlation/migration.sql` strictly additive (`ADD COLUMN IF NOT EXISTS ... DEFAULT ...`); apply with `prisma migrate deploy` only.
- [x] Regenerate Prisma client; `npx prisma validate`.

#### Phase B — Cadence + report shell + recurring assignments

- [x] Extend `RoleConfig` with optional `cadence` and seed fallbacks (USHER Sun+Wed weekly; CAMPUS_ADMIN Sun/Mon weekly; DATA_ENTRY any-day backdated; CAMPUS_PASTOR weekly review; group roles weekly; 48 h default deadline).
- [x] Add `roleCadence` admin-config namespace + fallback derived from `RoleConfig.cadence`.
- [x] Add `correlation` admin-config namespace + fallback (`pearsonMinSamples`, `topMoverWindow`, `enableInsights`, `summarySentences`).
- [x] Implement `lib/utils/cadence.ts` (period math, weekday utilities, deadline resolution).
- [x] Implement `lib/utils/reportTitle.ts` (placeholder allowlist + safe substitution).
- [x] Implement `lib/data/reportShellService.ts` with idempotent `ensureReportShell` keyed on `(campusId, templateId, periodKey)`.
- [x] Implement `lib/data/recurringAssignmentService.ts` (rule resolution + materialisation, calling `ensureReportShell`).
- [x] Add `POST /api/form-assignments/materialise` invoking the service for the calling user.
- [x] Update `QuickFormLandingPage` to call materialise on mount before listing assignments.
- [ ] Show "Last filled by USHER" badge on `ReportEditPage` per metric. *(deferred: requires explicit `lastQuickFillById` column; tracked separately)*

#### Phase C — Auto-fill report title + period at create time

- [x] Add `lib/auth/permissions.ts → resolveRoleCadence(role)` reading `roleCadence` namespace with fallback.
- [x] Wire `ReportNewPage` to read role cadence + template recurrence + render auto-fill title + pre-select period values; all editable.
- [ ] Add inline helper text "auto-filled · editable" below title and period inputs (config-driven copy). *(minor polish; deferred)*

#### Phase D — Aggregated quick-view buttons

- [x] Implement `GET /api/reports/[id]/quick-views` returning monthly/quarterly/yearly link + `sourceCount` per scope; cache 60 s.
- [x] Build `modules/reports/components/QuickViewAggregateBar.tsx` (three CTA pills, disabled when `sourceCount === 0`).
- [x] Mount the bar on `ReportDetailPage`.
- [ ] `/reports/aggregate` query-param prefill verification *(manual smoke remaining)*.

#### Phase E — Correlation in template editor + descriptive analytics

- [x] Add `correlationGroup` field to template editor at metric and section levels.
- [x] Persist via PUT `/api/report-templates/[id]`; legacy clients keep working.
- [x] Implement `lib/data/insights.ts` pure functions (top mover, biggest gap, Pearson, trend slope, correlation matrix, summariseInsights).
- [x] `InsightSummaryWidget` upgrade ready — structured payload available; current widget content remains compatible.
- [x] Add `CorrelationMatrixWidget` (list view; Pearson gated by min-samples).
- [x] Add `MetricMoversWidget` (top movers per current period).
- [x] Update `DEFAULT_LAYOUT` per role band to include the new widgets where appropriate.

#### Phase F — Admin Config GUI editors

- [x] Build `RoleCadenceEditor.tsx` (weekday checkbox row, frequency dropdown, deadline hours number, title template input with placeholder chips).
- [x] Build `CorrelationEditor.tsx` (Pearson min samples, top-mover window, enableInsights toggle, sentence templates table).
- [x] Wire both into `AdminConfigPage` — replace JSON editors for `roleCadence` and `correlation` namespaces.

#### Phase G — Tests + docs

- [x] `test/cadenceUtils.test.ts` — period math edges (Sun midnight, ISO weeks, weekday wrap, deadline anchor).
- [x] `test/reportTitleRender.test.ts` — placeholder allowlist + unknown-placeholder safety + numeric placeholders.
- [x] `test/insightsAlgorithms.test.ts` — Pearson correctness; min-samples gate; top-mover ordering; biggest-gap sort; summariseInsights structure; correlation matrix gating.
- [x] `test/templateCorrelationFieldOptional.test.ts` — old template payloads (without `correlationGroup`) render without error.
- [x] `test/migrationAdditiveSafety.test.ts` — migration adds columns only; no DROP / RENAME / TRUNCATE.
- [ ] `test/recurringAssignmentMaterialisation.test.ts` — *(integration; deferred until Prisma test harness is in place)*
- [ ] `test/quickViewAvailability.test.ts` — *(integration; deferred until Prisma test harness is in place)*
- [x] Update `.ai-system/agents/system-architecture.md` — new modules + data-flow entries (34–43).
- [x] Update `.ai-system/agents/project-context.md` — backward-compat constraint + non-destructive migration rule + admin-editable cadence note.
- [x] Update `.env.example` (`INSIGHTS_PEARSON_MIN_SAMPLES`, `INSIGHTS_TOP_MOVER_WINDOW_PERIODS`, `INSIGHTS_ENABLED`).
- [x] Add diagnostics-runbook entries: materialisation idempotency check, quick-view probe cache key, insight algorithm thresholds, cadence + auto-fill, migration safety lock.

### Planned Feature — Superadmin Role Impersonation / Preview

> **Tightened plan:** see [`.ai-system/planning/temp-superadmin-role-impersonation-plan-2026-04-30.md`](./temp-superadmin-role-impersonation-plan-2026-04-30.md). Tasks below are the canonical sequence; awaiting plan approval before implementation.

#### Phase A — Schema + safe additive migration

- [x] Add `ImpersonationSession` and `ImpersonationEvent` models to `prisma/schema.prisma` (strictly additive).
- [x] Author `prisma/migrations/20260501120000_impersonation_sessions/migration.sql` with `CREATE TABLE IF NOT EXISTS`. No DROP/RENAME. Apply via `prisma migrate deploy`.
- [x] Regenerate Prisma client; `npx prisma validate`.

#### Phase B — Auth + session core

- [x] `lib/auth/impersonation.ts` — sign/verify cookie, `startSession`, `stopSession`, `changeMode`, `recordEvent`, `loadActiveSession`.
- [x] `lib/auth/impersonationContext.ts` — request-scoped accessor (memoised via React `cache()`).
- [x] Extend `lib/utils/auth.ts → verifyAuth` to return `effectiveRole`, `actualRole`, `impersonation` summary; back-compat: `auth.user.role = effectiveRole`.
- [x] Add `assertNotReadOnly(auth, req)` to `lib/auth/permissions.ts` with allowlist; gate is wired into `verifyAuth` itself so all mutation endpoints inherit it.
- [x] Add `IMPERSONATION_TTL_MINUTES`, `IMPERSONATION_ENABLED`, `IMPERSONATION_COOKIE_NAME` to `.env.example`.

#### Phase C — APIs

- [x] `app/api/impersonation/start/route.ts` (SUPERADMIN-only; reject SUPERADMIN target; write STARTED event).
- [x] `app/api/impersonation/stop/route.ts` (clear cookie; write STOPPED event).
- [x] `app/api/impersonation/me/route.ts` (return active session for caller).
- [x] `app/api/impersonation/mode/route.ts` (PATCH READ_ONLY ↔ MUTATE).
- [x] `/api/auth/me` returns `effectiveRole` + `actualRole` + `impersonation` (already on `auth.user`).
- [x] Mutation gate inherited via `verifyAuth` chokepoint — no per-handler wrapping required.

#### Phase D — UI

- [x] Extend `providers/AuthProvider.tsx` with `startImpersonation`, `stopImpersonation`, `switchImpersonationMode`.
- [x] Add `lib/hooks/useImpersonation.ts`.
- [x] `components/ui/ImpersonationBanner.tsx` (sticky banner + countdown + mode toggle + exit + Ctrl+Shift+E) mounted in dashboard layout.
- [x] `modules/admin-config/components/ImpersonationStartDialog.tsx` (role select + user typeahead + mode toggle); mounted in dashboard header + Users table row action.
- [x] `UsersListPage` row action "Preview as this user" (SUPERADMIN-only).
- [x] `Ctrl+Shift+E` keyboard escape handler (in banner).
- [x] `config/content.ts` `impersonation` namespace.
- [x] `config/routes.ts` API routes added.

#### Phase E — Audit + safety net

- [x] `IMPERSONATION_*` event family lives in `lib/auth/impersonation.ts → recordEvent`; `lib/utils/audit.ts → createReportEvent` mirrors mutations into the active session as `MUTATION_APPLIED`.
- [x] Audit tagging via `tagImpersonationIfActive` reads `impersonationContext` and writes a session event for every domain audit emission.
- [ ] Email + push fan-out footer ("(by SUPERADMIN previewing as <Role>)") — *deferred to follow-up; audit log already captures the context*.
- [x] `app/api/impersonation/sessions/route.ts` — paginated history (SUPERADMIN-only).
- [x] Admin Config "Impersonation log" tab via `ImpersonationLogPanel`.

#### Phase F — Tests + docs

- [x] `test/impersonationGuard.test.ts` — `assertNotReadOnly` blocks mutations in READ_ONLY mode; allowlist passes.
- [ ] `test/impersonationSessionFlow.test.ts` — *(integration; deferred until Prisma test harness is in place)*.
- [x] `test/impersonationCookieSecurity.test.ts` — token signature + audience + tampered + expired token rejections.
- [x] `test/impersonationMigrationAdditiveSafety.test.ts` — additive-only guard.
- [x] Update `.ai-system/agents/system-architecture.md` (modules + data-flow entries 44–48 + env keys).
- [x] Update `.ai-system/agents/project-context.md` (impersonation business constraint).
- [x] Update diagnostics-runbook (trace impersonated mutations; force-end stuck sessions; gate response; toggles; migration safety).
- [x] Update `.env.example` (`IMPERSONATION_TTL_MINUTES`, `IMPERSONATION_ENABLED`).

#### Phase G — Follow-ups (queued, not in initial pass)

- [ ] CI lint rule: fail when a route exports POST/PUT/PATCH/DELETE without calling `assertNotReadOnly` or marking `safeForReadOnly: true`.
- [ ] "Replay session" affordance — read-only walkthrough of every page visited in a past session.
- [ ] Optional `record-only` mode capturing intent without storing payloads.

### Planned Feature — Quick-Form Rule Editor + Smart Selects + Auto-Total Metrics + Week-on-Week + Chart Polish + Comparison Surfaces

> **Tightened plan:** see [`.ai-system/planning/temp-quickform-rules-smartselects-autototal-wow-comparisons-plan-2026-05-02.md`](./temp-quickform-rules-smartselects-autototal-wow-comparisons-plan-2026-05-02.md). Tasks below are the canonical sequence — awaiting approval before implementation.

#### Phase A — Schema + safe additive migration

- [x] Add `ReportTemplateMetric.isAutoTotal`, `autoTotalSourceMetricIds`, `autoTotalScope`, `capturesWoW`.
- [x] Author `prisma/migrations/20260502120000_auto_total_and_wow_metrics/migration.sql` strictly additive; apply with `prisma migrate deploy`.
- [x] Regenerate Prisma client; `npx prisma validate`.
- [x] Extend `types/global.ts` `ReportTemplateMetric` + `ReportMetric` with the new fields; add `FormAssignmentRule` interface.

#### Phase B — FormAssignmentRule CRUD (closes the missing entry point)

- [x] `lib/data/formAssignmentRule.ts` with metric-subset + scope coherence validators.
- [x] `app/api/form-assignment-rules/route.ts` (GET list, POST create) + `[id]/route.ts` (PATCH, DELETE archive). SUPERADMIN + rule owner authorised.
- [x] `modules/templates/components/MetricSelect.tsx` (grouped options, search, multi-select).
- [x] `modules/templates/components/TemplateAssignmentsEditor.tsx` reusing MetricSelect.
- [x] Wrap `TemplateDetailPage` body in AntDesign Tabs (Sections | Quick-form assignments); mount editor under the Assignments tab.

#### Phase C — Auto-total metric type

- [x] `lib/data/autoTotal.ts → recomputeAutoTotals` + `validateAutoTotalConfig` + `buildAutoTotalComment`.
- [x] Wire `recomputeAutoTotals` into `ensureReportShell` (post-create) and into the report PUT handler (pre-persist).
- [x] Validate the auto-total source list at template save time (no chaining, no self-reference, scope-coherent).
- [x] Extend `MetricRow` in `TemplateDetailPage` with the auto-total toggle + source multi-select + scope dropdown.
- [x] Render auto-total cells read-only with "AUTO" tag + tooltip in `ReportSectionsForm`.

#### Phase D — Week-on-Week comparison

- [x] `lib/data/wow.ts` (`applyWowContext` pure + `attachWeekOnWeekContext` async).
- [x] Wired into report GET when at least one metric has `capturesWoW`; non-blocking on missing prior week.
- [x] Add `capturesWoW` toggle to MetricRow in `TemplateDetailPage`.
- [x] Render WoW delta indicator in `ReportSectionsForm` live-stats row with prior/current tooltip.

#### Phase E — Smart selects

- [x] `modules/templates/components/CorrelationGroupSelect.tsx` (existing groups + `+ Create group "X"`).
- [x] Replace free-text correlation-group inputs in `TemplateDetailPage` (metric-level + section-level) with `CorrelationGroupSelect`.
- [x] Convert imports wizard "Target" picker to grouped options (System / template → section → metric) with search.

#### Phase F — Chart polish + comparison surfaces

- [x] `chartUtils.RotatedTick` + `formatXAxisTick`. CampusBreakdown chart migrated.
- [x] `modules/analytics/components/MetricComparisonPanel.tsx` (multi-metric MetricSelect + Recharts LineChart + correlation matrix + insights).
- [x] `modules/analytics/components/ReportComparisonPanel.tsx` (multi-report picker + per-metric BarChart + insights).
- [x] Mount both panels as new tabs under `/analytics` ("Compare metrics", "Compare reports").

#### Phase G — Tests + docs

- [x] `test/autoTotalRecompute.test.ts` (12 ✓) — sum correctness; chain + self-ref + scope-drift guards; comment dedupe + sort.
- [x] `test/wowAttach.test.ts` (3 ✓) — prior-week presence/absence; non-blocking on missing prior; opt-in only.
- [x] `test/metricComparisonInsights.test.ts` (6 ✓) — Pearson gating + correctness + zero-variance null + biggestGap order + summariseInsights structure.
- [x] Update `.ai-system/agents/system-architecture.md` (modules + data-flow entries 49–54 + env keys).
- [x] Update `.ai-system/agents/project-context.md` (rule editor + auto-total + WoW business constraints).
- [x] Update `diagnostics-runbook.md` with chain-detection error path, WoW silent-degrade, smart-select drift, RotatedTick adoption guidance, comparison min-samples behaviour.

---

## Backlog

> **Section summary:** Known work that needs to be done but hasn't been scheduled yet.

- [ ] [Backlog item 1]
- [ ] [Backlog item 2]

---

## Completed This Sprint

> **Section summary:** Tasks finished in the current sprint. Cleared at sprint end and moved to dev-history.md.

- [x] Fix report template edit failures (500/504) + stabilize cache invalidation
- [x] Align auth session lifetime with env config and add automatic token refresh
- [x] Ensure superadmin (and other empowered roles) can edit/submit draft reports and see action buttons on report detail
- [x] Add unlock-report action + backend endpoint so superadmin can unlock & edit locked reports
- [x] Make “Add report” button always visible for superadmin and roles with create-report privilege
- [x] Add create report privilege to Office of CEO role

---

## Notes

- New feature request: aggregated report generation (weekly/monthly/quarterly/yearly) with template/version compatibility, group/campus hierarchy, metric-level include/exclude, and aggregated analytics+chart export.
- Keep ACL: users can only aggregate data they are authorized to see (campus/group scope, CEO, SUPERADMIN, etc.).

## Pending tasks (added for aggregated rollup feature)

Verification note (2026-04-05): aggregate route/page/service are present but feature is still failing in real usage (selected scope load failure). Keep this section open until end-to-end aggregation succeeds and is validated with tests.

- [x] Add report aggregation API kernel decorators and zod schemas in `app/api/reports/aggregate`.
- [x] Extend report data model / response types in `types/global.d.ts` to carry `aggregationSource` and `aggregatedFrom` metadata.
- [x] Implement `lib/data/reportAggregation.ts` service to create/validate aggregated reports by template, version, campus/group, status, and metric calculations.
- [x] Add org hierarchy context helper in `modules/org` to resolve parent group/campus rollup sets in aggregation UI.
- [x] Add `modules/reports/components/ReportAggregationPage.tsx` with interactive stepper: choose scope (campus/group/CEO), date range, template/version, status filter, metric selector/deselector, and preview metrics.
- [x] Add data visualization embedding to export (spreadsheet charts/worksheet summary) in `modules/analytics/components/AnalyticsPage.tsx`/export utility.
- [x] Add automated tests for aggregation correctness (sum/average/snapshot logic, mismatch template versions fallback strategy) in `test/aggregation.test.ts`.
- [x] Add Aggregated reports nav entry + breadcrumbs coverage in `modules/reports`.
- [x] Document aggregation behavior in `.ai-system` architecture/project notes (and product docs when introduced).

Verification note (2026-04-05, this session): aggregation scope defaulting/locking was fixed for campus/group roles and preview/generate now guard missing scope; metadata fields (`aggregationSource`, `aggregatedFrom`) were added in shared types + aggregation responses; `test/aggregation.test.ts` now covers sum/average/snapshot and role/scope enforcement. Remaining aggregation UI/doc tasks stay open due metric selector and docs backlog.

Verification note (2026-04-05, this session): aggregation no-result behavior now returns domain `404` instead of generic `500`, and group-scope query matching now checks both `orgGroupId` and group campus IDs to reduce false-negative “no reports” matches on mixed legacy/current data paths.

Verification note (2026-04-05, this session): aggregation now honors `includeDrafts` end-to-end in API criteria defaults, monthly/weekly period filters can be left unset for year-wide scope, metric selector is enabled and template-driven, and Analytics year auto-aligns to latest available scoped report year to avoid empty-current-year false negatives.

Verification note (2026-04-05, this session): Added `test/taskQueueRemainingRegressions.test.ts` to cover auth refresh/report template cache-safe parsing, unlock/history envelope contracts, and role-scope rollup/no-refresh guard behavior for campus/group/global paths.

## Next dev steps

1. Code implementation plan validation with product stakeholder.
2. Implement API contracts and schema updates.
3. Build frontend wizard and tie to service layer.
4. Add tests, then run `npm run build` + user flow QA.

[Any context agents need to know about current sprint constraints, blockers, or priorities]
