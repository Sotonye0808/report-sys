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
- [ ] Add offline sync indicator + retry queue for pending offline submissions
- [x] Fix offline/online redirect loop (dashboard loading stuck) by restoring pre-navigation state
- [x] Implement draft persistence for goals page and templates editing
- [ ] Implement central audit trail helper (`lib/utils/audit.ts`) and refactor report events + template version snapshots to use it
- [ ] Fix report form stuck period/template selection (cached state rehydration issue) and repetitive goals loading by stabilizing loader effects and value tracking
- [ ] Fix router navigation failure where page transitions require reload before working
- [ ] Wire Resend email service into invite creation, password reset, report workflow events (submission/approval/lock/reminder)
- [x] Implement missing report workflow endpoints & UI: edit drafts, update requests, and goal unlock requests
- [x] Update documentation and `.env.example` for Resend and production env variables

---

## Up Next

> **Section summary:** Tasks planned for the next sprint. Not yet started.

- [x] Enhance visual analytics to support user-selectable chart types (bar, line, pie, area) in `modules/analytics/components/AnalyticsPage.tsx`.
- [x] Implement template version sync in report rendering: load metric name from template version by metric ID, and keep existing reports backwards-compatible.
- [x] Add UI feedback for template upgrade mismatch and migration path in `modules/reports/components/ReportDetailPage.tsx` and `modules/reports/components/ReportEditPage.tsx`.
- [x] Refactor chart-code paths and common helpers into a shared `modules/analytics/chartUtils.ts` to avoid duplication and improve maintainability.

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

- [ ] Add report aggregation API kernel decorators and zod schemas in `app/api/reports/aggregate`.
- [ ] Extend report data model / response types in `types/global.d.ts` to carry `aggregationSource` and `aggregatedFrom` metadata.
- [ ] Implement `lib/data/reportAggregation.ts` service to create/validate aggregated reports by template, version, campus/group, status, and metric calculations.
- [ ] Add org hierarchy context helper in `modules/org` to resolve parent group/campus rollup sets in aggregation UI.
- [ ] Add `modules/reports/components/ReportAggregationPage.tsx` with interactive stepper: choose scope (campus/group/CEO), date range, template/version, status filter, metric selector/deselector, and preview metrics.
- [ ] Add data visualization embedding to export (spreadsheet charts/worksheet summary) in `modules/analytics/components/AnalyticsPage.tsx`/export utility.
- [ ] Add automated tests for aggregation correctness (sum/average/snapshot logic, mismatch template versions fallback strategy) in `test/aggregation.test.ts`.
- [ ] Update `config/routes.ts` nav to include Aggregated reports route; update breadcrumbs in `modules/reports`.
- [ ] Document aggregation behavior in `docs/` and `hypersystem` architecture notes.

## Next dev steps

1. Code implementation plan validation with product stakeholder.
2. Implement API contracts and schema updates.
3. Build frontend wizard and tie to service layer.
4. Add tests, then run `npm run build` + user flow QA.

[Any context agents need to know about current sprint constraints, blockers, or priorities]
