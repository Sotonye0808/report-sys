# Development Task Queue

> **Overview:** Sprint-level task queue. Agents execute tasks top to bottom within the current sprint. When a task is completed, mark it [x] and add a checkpoint entry. Future tasks are queued below for prioritisation in the next sprint.

---

## Current Sprint

> **Section summary:** Tasks actively being worked on. Agents pick the first incomplete task.

- [x] Fix report template edit failures (500/504) + stabilize cache invalidation
- [x] Align auth session lifetime with env config and add automatic token refresh
- [ ] Add regression tests for report template API and auth refresh behavior
- [ ] Add regression tests for report unlock and audit trail visibility
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
- [ ] Complete audit trail refactor by moving template version snapshot events to central helper (`lib/utils/audit.ts`) (report workflow events already migrated)
- [ ] Fix report form stuck period/template selection (cached state rehydration issue) and repetitive goals loading by stabilizing loader effects and value tracking
- [ ] Fix router navigation failure where page transitions require reload before working
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
- [ ] Add UI regression test coverage ensuring profile and org hierarchy mutations update UI state without manual refresh
- [x] Add push notification sync test matrix (permission granted + existing subscription, granted + no subscription, missing VAPID key)
- [x] Implement Cloudinary managed asset lifecycle for bug report screenshots (session/create-upload-finalize-discard-cleanup, ACID + compensation, legacy screenshotUrl compatibility)
- [x] Add schema + migration groundwork for `MediaAsset`, `AssetUploadSession`, and `AssetLifecycleEvent`
- [x] Add bug report UI integration for managed screenshots with deferred submit default and `preupload_draft` feature flag
- [x] Add stale TEMP screenshot cleanup API path with auth/token guard and structured request-id logging
- [x] Add lifecycle state-machine and migration compatibility regression tests for screenshot lifecycle

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
- [ ] Add org hierarchy context helper in `modules/org` to resolve parent group/campus rollup sets in aggregation UI.
- [x] Add `modules/reports/components/ReportAggregationPage.tsx` with interactive stepper: choose scope (campus/group/CEO), date range, template/version, status filter, metric selector/deselector, and preview metrics.
- [x] Add data visualization embedding to export (spreadsheet charts/worksheet summary) in `modules/analytics/components/AnalyticsPage.tsx`/export utility.
- [x] Add automated tests for aggregation correctness (sum/average/snapshot logic, mismatch template versions fallback strategy) in `test/aggregation.test.ts`.
- [x] Add Aggregated reports nav entry + breadcrumbs coverage in `modules/reports`.
- [ ] Document aggregation behavior in `.ai-system` architecture/project notes (and product docs when introduced).

Verification note (2026-04-05, this session): aggregation scope defaulting/locking was fixed for campus/group roles and preview/generate now guard missing scope; metadata fields (`aggregationSource`, `aggregatedFrom`) were added in shared types + aggregation responses; `test/aggregation.test.ts` now covers sum/average/snapshot and role/scope enforcement. Remaining aggregation UI/doc tasks stay open due metric selector and docs backlog.

Verification note (2026-04-05, this session): aggregation no-result behavior now returns domain `404` instead of generic `500`, and group-scope query matching now checks both `orgGroupId` and group campus IDs to reduce false-negative “no reports” matches on mixed legacy/current data paths.

Verification note (2026-04-05, this session): aggregation now honors `includeDrafts` end-to-end in API criteria defaults, monthly/weekly period filters can be left unset for year-wide scope, metric selector is enabled and template-driven, and Analytics year auto-aligns to latest available scoped report year to avoid empty-current-year false negatives.

Verification note (2026-04-05, this session): Redis cursor termination and push sync matrix tests were added as targeted regressions; profile/org no-refresh remains open for full UI-level regression harness.

## Next dev steps

1. Code implementation plan validation with product stakeholder.
2. Implement API contracts and schema updates.
3. Build frontend wizard and tie to service layer.
4. Add tests, then run `npm run build` + user flow QA.

[Any context agents need to know about current sprint constraints, blockers, or priorities]
