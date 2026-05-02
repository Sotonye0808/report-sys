# Temp Plan — Role Cadence + Usher→Report Wiring + Aggregated Quick-Views + Correlation Analytics + Safe Migration

> **Date:** 2026-04-29
> **Status:** Planning only. No code written this turn. Tasks at the bottom are the canonical sequence; mirror in `task-queue.md` after approval.
> **Driver:** Make submitted-by-role cadence + auto-fill, usher→report value propagation, aggregated rollup quick-views, and template-correlation-driven insights all explicit, config-driven, abstractable, and safe to land on top of existing template/report rows that don't carry the new fields.

---

## 1. Feature Summary

This bundle threads four loosely-coupled enhancements that share substrate (admin-config namespaces, the form-assignment + report-quick-fill flow, the aggregation engine, and the template editor):

1. **Role cadence + auto-fill.** Every role that fills reports carries a runtime-editable cadence: `frequency` (weekly / twice-weekly / monthly / quarterly / yearly / any), `expectedDays` (weekday slots), `deadlineHours` (default 48), and `autoFillTitle` (template literal). The cadence drives report title + period defaults at creation time. Fallback shipped in code: ushers Sun + Wed; campus admin Sun/Mon weekly; data entry any-day backdated; 48 h deadline; weekly frequency. Admins edit through Admin Config without a deploy.

2. **Usher→Report value propagation (recurring assignments).** Ushers' submissions flow into the campus report for the same period — no double entry by the campus admin. Today, `FormAssignment` binds one assignee to one specific `reportId`; quick-fill writes into that report's `ReportMetric` rows. We add **recurring assignment templates** (`FormAssignmentRule`) that the server expands per-period: when a USHER opens `/quick-form` on Sunday, the system materialises (or returns) the active `FormAssignment` for that period and ensures the underlying weekly `Report` shell exists for the campus + template. The campus admin sees the usher-filled values pre-populated and editable when they open the weekly report.

3. **Aggregated quick-view buttons.** Campus admin sees "View monthly / quarterly / yearly" CTAs on the report detail and dashboard; group admin sees the same scoped to all campuses in their group; CEO/SPO/Office of CEO/Church Ministry see scope-global rollups. Each CTA hits the existing `/api/reports/aggregate` engine with the right scope + period and lands on a generated aggregated report (no new write). Works across any defined org level since hierarchy is admin-editable.

4. **Correlation analytics + descriptive insights.** Template editor exposes "correlation groups" at the metric and section level (a metric belongs to zero or one correlation group; metrics in the same group form a Pearson-correlation matrix when there is enough data). Analytics pages and dashboard insight widgets compute real algorithms: top-mover (largest period-over-period delta), biggest-gap (largest goal-vs-achieved deficit), Pearson correlation across grouped metrics, and trend slope across the last N periods. Each insight is a tiny pure function so they are testable and reusable from any analytical surface.

Throughout, **safety on existing data is non-negotiable**. New columns are nullable with safe defaults at read-time; we never use `prisma migrate reset`; migrations are additive; old templates and old reports keep working unchanged.

---

## 2. Architecture Impact

| Layer | Affected | Change |
|---|---|---|
| `prisma/schema.prisma` | Additive columns + new model | Add `ReportTemplate.recurrenceFrequency`, `ReportTemplate.recurrenceDays Int[]`, `ReportTemplate.autoFillTitleTemplate String?`. Add `ReportTemplateMetric.correlationGroup String?`. Add `ReportTemplateSection.correlationGroup String?`. Add new model `FormAssignmentRule` (recurring assignment) referenced as `FormAssignment.ruleId` (nullable). Add `Report.autoCreated Boolean @default(false)`. All nullable / defaulted; migration is additive only |
| `prisma/migrations` | New non-destructive SQL migration | `20260430_*_role_cadence_recurring_assignments_correlation` — uses `ALTER TABLE ... ADD COLUMN ... DEFAULT ...` (PostgreSQL accepts). No rename, no drop. Apply via `prisma migrate deploy` per existing data-safe protocol |
| `config/roles.ts` (fallback) | Per-role cadence baseline | Add `cadence?: { frequency: ReportFrequency; expectedDays: number[]; deadlineHours: number; autoFillTitleTemplate?: string }` to `RoleConfig`. Hardcoded values for USHER, CAMPUS_ADMIN, DATA_ENTRY, etc. |
| `lib/data/adminConfig.ts` | Two new namespaces | `roleCadence` (per-role overrides) + `correlation` (cross-template defaults like `pearsonMinSamples`, `topMoverWindow`, `enableInsights`). Fallbacks derived from `config/roles.ts` and `config/content.ts` |
| `lib/auth/permissions.ts` | Cadence resolver | `resolveRoleCadence(role)` returns merged cadence (admin-config override → ROLE_CONFIG fallback → SUPERADMIN cadence is irrelevant; SUPERADMIN never fills). Used by report creation + assignment materialisation |
| `lib/data/formAssignment.ts` | Recurrence expansion | `materialiseAssignmentForUser(userId, role, periodOverride?)` — for each active `FormAssignmentRule` matching the user (by role / campus / explicit assignee), compute current-period boundaries from cadence, look up or create a `FormAssignment` row pinned to the right `reportId`, and ensure that report exists |
| `lib/data/reportShellService.ts` | **new** | `ensureReportShell({ templateId, campusId, orgGroupId, periodType, periodYear, periodMonth?, periodWeek? }, actorId)` — idempotent upsert. Builds report sections + metrics from the template, sets cadence-derived deadline, sets `autoCreated: true`. Used by recurring assignments and the "create draft for this period" path |
| `lib/utils/cadence.ts` | **new** | Pure functions for period math (current-week, next-occurrence-of-weekday, period-bounds, ISO week resolution). No DB calls — easy to test |
| `lib/utils/reportTitle.ts` | **new** | `renderTitle(template: string, vars: { campus, group, period, weekNumber, monthName, quarter, year })`. Allowlisted placeholders only |
| `lib/data/insights.ts` | **new** | Pure analytical functions: `topMover`, `biggestGap`, `pearsonCorrelation`, `trendSlope`, `complianceDelta`, `summariseInsights(reports, options)`. No DB calls |
| `lib/data/reportAggregation.ts` | Helper export | Add `quickViewAggregateRequest(scope, period)` building the same payload the aggregate API accepts, so quick-view buttons share one shape |
| `app/api/form-assignments/materialise/route.ts` | **new** | `POST /api/form-assignments/materialise` — server-side expansion the USHER's quick-form landing calls before listing assignments. Idempotent |
| `app/api/reports/[id]/quick-views/route.ts` | **new** | `GET /api/reports/[id]/quick-views` — returns precomputed aggregated-report URLs (monthly / quarterly / yearly) for the report's campus + period, plus an `availability` flag noting whether the rollup has any source data |
| `app/api/templates/[id]/route.ts` | Extend | PATCH accepts new optional fields (`recurrenceFrequency`, `recurrenceDays`, `autoFillTitleTemplate`, per-metric `correlationGroup`, per-section `correlationGroup`). Ignored by older clients |
| `modules/reports/components/ReportNewPage.tsx` | Auto-fill on create | Read role cadence + template recurrence; pre-fill `period`, `periodType`, `title`. All editable |
| `modules/reports/components/ReportDetailPage.tsx` | Quick-view CTAs | Mount `<QuickViewAggregateBar />` showing monthly / quarterly / yearly buttons (visible when `availability` allows); each links to the aggregated report page with prefilled scope + period |
| `modules/reports/components/ReportEditPage.tsx` | Show "auto-filled by USHER" badge | Per-metric badge when the metric value was last updated by a USHER quick-fill (read-only hint; admin can still edit) |
| `modules/quick-form/components/QuickFormLandingPage.tsx` | Materialise on mount | Calls the new materialise endpoint before fetching assignments |
| `modules/dashboard/widgets/registry.tsx` | Insight widgets upgraded | `InsightSummaryWidget` reads from `lib/data/insights.ts` (configurable enable from `correlation` namespace); add `CorrelationMatrixWidget` (Recharts heatmap) when groups + samples are sufficient; add `MetricMoversWidget` |
| `modules/templates/components/TemplateEditor.tsx` | Cadence + correlation UI | Section-level + metric-level "Correlation group" select + free-text input; template-level "Recurrence frequency", "Expected days" multi-select, "Auto-fill title template" with placeholder docs |
| `modules/admin-config` | Two new GUI editors | `RoleCadenceEditor` (per-role cadence with weekday picker + frequency dropdown + deadline hours + title template); `CorrelationEditor` (insight thresholds and Pearson minimum samples) |
| `config/content.ts` | New namespaces | `roleCadence` (frequency labels, day names), `quickViews` (CTA copy), `insights` (algorithm-output sentence templates), `templates.correlation` (label copy), `reports.autoFilledByUsher` |
| `.env.example` | New env keys | `INSIGHTS_PEARSON_MIN_SAMPLES` (default 5), `INSIGHTS_TOP_MOVER_WINDOW_PERIODS` (default 4), `INSIGHTS_ENABLED` (default true) |

---

## 3. New Modules / Services

- **`lib/utils/cadence.ts`** — pure period math utilities: `getCurrentPeriod(frequency, asOf)`, `nextOccurrence(weekday, asOf)`, `weekKey(date)`, `monthKey(date)`, `quarterKey(date)`, `withinDeadline(period, deadlineHours, now)`. No DB.
- **`lib/utils/reportTitle.ts`** — `renderTitle(template, vars)` with allowlisted placeholders (`{campus}`, `{group}`, `{period}`, `{weekNumber}`, `{monthName}`, `{quarter}`, `{year}`). Unknown placeholders left literal + warned in logs.
- **`lib/data/reportShellService.ts`** — `ensureReportShell(input, actorId)` idempotent upsert. Builds full sections+metrics from the template, applies role cadence to compute `deadline`, sets `autoCreated: true`, never overwrites an existing report's `status`.
- **`lib/data/insights.ts`** — pure analytical functions:
  - `topMover(reports, metricId, windowPeriods)` → `{ campusId, delta, percent }[]`
  - `biggestGap(reports)` → `{ metricId, goal, achieved, gap }[]` (sorted)
  - `pearsonCorrelation(samplesA, samplesB)` → `r ∈ [-1, 1]` or null when below `INSIGHTS_PEARSON_MIN_SAMPLES`
  - `correlationMatrix(reports, group)` — pairs every metric in a correlation group across periods/campuses
  - `trendSlope(values, options)` — simple linear regression slope
  - `summariseInsights(reports, options)` — composes a small structured payload the InsightSummaryWidget renders into config-driven sentence templates.
- **`lib/data/recurringAssignmentService.ts`** — wraps `FormAssignmentRule` resolution + materialisation. Pure server-side; idempotent.
- **`app/api/form-assignments/materialise/route.ts`** — POST endpoint USHER landing calls.
- **`app/api/reports/[id]/quick-views/route.ts`** — GET endpoint for report quick-views.
- **`modules/reports/components/QuickViewAggregateBar.tsx`** — small CTA bar, config-driven copy.
- **`modules/admin-config/components/RoleCadenceEditor.tsx`** + **`CorrelationEditor.tsx`** — bespoke GUIs to replace JSON editors for the two new namespaces (continues the GUI-first principle).
- **`modules/templates/components/CorrelationGroupField.tsx`** — small reusable widget the template editor mounts at the metric and section level.

---

## 4. Data Flow

### 4a. Usher fills → campus report auto-populates

```
USHER opens /quick-form
  → POST /api/form-assignments/materialise
      → for each active FormAssignmentRule matching user (role/campus/templateId):
          - cadence = resolveRoleCadence(USHER) [Sun + Wed weekly fallback]
          - period  = cadence-derived current period (e.g. ISO week 17 of 2026)
          - report  = ensureReportShell({ templateId, campusId, periodType, periodYear, periodWeek }, actorId=usher.id)
          - assignment = upsert FormAssignment (reportId=report.id, assigneeId=usher.id, metricIds=rule.metricIds)
      → return materialised assignments
USHER picks one → existing /quick-form/[id] flow
USHER quick-fills → existing /api/form-assignments/[id]/quick-fill writes ReportMetric rows on the report
Campus admin opens the same report → metrics already pre-filled (with "auto-filled by USHER" badge)
Campus admin edits / submits as today
```

### 4b. Auto-fill report title + period at creation

```
ReportNewPage loads
  → resolves role cadence + template recurrence + ensure shell
  → form initial values:
      periodType = templateOrCadenceFrequency
      periodYear/periodWeek/periodMonth = currentPeriod(cadence, today)
      title      = renderTitle(template.autoFillTitleTemplate, { campus, period, ... })
  → user can override every field before submit
```

### 4c. Aggregated quick-view buttons

```
Report detail loads
  → GET /api/reports/[id]/quick-views
      → for { monthly, quarterly, yearly }:
          - scope = inferScope(viewerRole, report.campusId, report.orgGroupId)
          - probe `reportAggregation.findSourceReports(scope, period)` (no write, just count)
          - returns { period, scope, sourceCount, link }
  → render <QuickViewAggregateBar /> with three CTAs
  → click: navigate to /reports/aggregate?scope=...&period=... (existing surface, prefilled)
  → preview/generate uses the existing aggregation engine
```

### 4d. Correlation + insights computation

```
Analytics page or dashboard insight widget
  → loads scoped reports (already in memory for the dashboard)
  → for each correlationGroup in the active templates:
      - collect paired metric samples across reports
      - compute Pearson r if samples >= INSIGHTS_PEARSON_MIN_SAMPLES
      - render heatmap cell (CorrelationMatrixWidget) or sentence ("Strong positive correlation between Souls and Decisions, r=0.82, n=14")
  → for top-mover: per metric, compute period-over-period delta across the last N periods, surface top movers
  → for biggest-gap: per current-period metric, compute (goal - achieved) sorted desc
  → InsightSummaryWidget pulls the structured payload and renders config-driven sentence templates (insights.summarySentences in admin-config / fallback in CONTENT.insights)
```

---

## 5. UI/UX

- **Quick-view CTA bar** lives directly on the report detail page (and on the dashboard for campus/group/CEO bands). Three pill buttons; disabled when `availability.sourceCount === 0` with tooltip "No data yet for this rollup".
- **Auto-fill title + period** uses a non-intrusive helper text under the title input — "auto-filled from <Template> · editable". Period selector pre-selected, fully editable.
- **Auto-filled by USHER badge** is a subtle Tag next to the metric input on report edit; tooltip names the assignee and timestamp.
- **Template editor correlation UI** sits inline under each metric (a small "Correlation group" select + free-text input) and at the section level (one shared group). Help text explains the algorithm in one sentence.
- **Cadence editor in Admin Config** uses weekday checkbox row, frequency dropdown, deadline hours number, title template input with placeholder chips.
- **InsightSummaryWidget** renders 1–3 short sentences chosen from a config-driven template registry. Sentences degrade gracefully when there's no data.
- **CorrelationMatrixWidget** uses Recharts ScatterChart or a small custom heatmap colored with brand tokens; cells show `r` value; min-samples gate prevents misleading numbers.
- **Mobile** — quick-view bar wraps to two rows; correlation matrix becomes a list view (cards) under sm breakpoint.

---

## 6. Risks + Edge Cases

- **Old templates without recurrence fields** — read paths use `templateOrCadenceFrequency = template.recurrenceFrequency ?? roleCadence.frequency ?? "WEEKLY"`. Title template falls back to a built-in literal. No template breaks.
- **Old reports without auto-fill flag** — all new columns nullable; `autoCreated` defaults to `false`.
- **Migration safety** — strictly additive (`ADD COLUMN ... DEFAULT ...`), no `migrate reset`, no rename, no drop. Apply with `prisma migrate deploy`. If shadow-database drift detection blocks `migrate dev`, document the workaround (already in repair-system).
- **Idempotency of materialisation** — `ensureReportShell` keys on `(campusId, templateId, periodYear, periodMonth/Week)`; concurrent calls produce one row, not duplicates. Use a unique index on that tuple where present, plus DB-level upsert.
- **USHER campus drift** — if the usher is later moved to a different campus mid-period, the materialised assignment for the old campus stays (don't silently delete data). Surface a notice on the landing page.
- **Auto-fill title placeholder injection** — allowlist-only; unknown placeholders left literal. No `{eval(...)}` or HTML injection.
- **Aggregation availability flicker** — the quick-views endpoint should only count, not generate. Cache for 60s per (scope, period) to avoid hot-loop on report-detail mount.
- **Pearson on too-few samples** — gated by `INSIGHTS_PEARSON_MIN_SAMPLES` (default 5); below threshold, no correlation surfaced. Misleading numbers prevented.
- **Correlation group typos** — group names are free-text, but the editor offers existing groups in a dropdown to encourage reuse. Mismatched groups simply won't pair, which is the correct fail-soft.
- **Cadence change while a report is in-flight** — only future periods use the new cadence. Active reports keep their original deadline + title (don't rewrite history).
- **Backwards-compat at quick-fill time** — the existing `/api/form-assignments/[id]/quick-fill` already writes by `templateMetricId` lookup on the report; if the report was just shell-created the metric rows exist (built from the template). If a metric is later added to the template after report creation, the quick-fill silently skips it (already today). Keep this behavior.
- **Multiple ushers per metric** — quick-fill writes are last-writer-wins. Acceptable for v1; surface the latest writer in the badge.
- **Abstractability** — `FormAssignmentRule` is generic enough that it can later target a metric subset of any role + frequency, not just USHER. Same pipeline can be reused for "weekly attendance entry" etc.

---

## 7. Concrete Implementation Tasks (canonical sequence)

Mirror in `task-queue.md` under a new "Planned Feature — Role Cadence + Usher Wiring + Aggregated Quick-Views + Correlation Analytics" block.

### Phase A — schema + safe migration

1. Add columns to `prisma/schema.prisma`: `ReportTemplate.recurrenceFrequency`, `recurrenceDays Int[] @default([])`, `autoFillTitleTemplate String?`; `ReportTemplateMetric.correlationGroup String?`; `ReportTemplateSection.correlationGroup String?`; `Report.autoCreated Boolean @default(false)`.
2. Add new model `FormAssignmentRule` (id, ownerId, templateId, role, campusId?, orgGroupId?, metricIds String[], cadenceOverride Json?, isActive, createdAt). Add `FormAssignment.ruleId String?` (nullable FK).
3. Author `prisma/migrations/20260430_*_role_cadence_recurring_assignments_correlation/migration.sql` using `ADD COLUMN IF NOT EXISTS ... DEFAULT ...`. Strictly additive; non-destructive. No rename, no drop. Apply via `prisma migrate deploy`.
4. Regenerate Prisma client; `npx prisma validate`.

### Phase B — cadence + report shell + recurring assignments

5. Extend `RoleConfig` with optional `cadence` and seed fallbacks for USHER (Sun + Wed weekly, 48 h), CAMPUS_ADMIN (Sun/Mon weekly, 48 h), DATA_ENTRY (any-day, 96 h), CAMPUS_PASTOR (weekly review), GROUP_PASTOR/GROUP_ADMIN (weekly).
6. Add `roleCadence` admin-config namespace + fallback derived from `RoleConfig.cadence`.
7. Add `correlation` admin-config namespace + fallback (`{ pearsonMinSamples, topMoverWindow, enableInsights, summarySentences }`).
8. Implement `lib/utils/cadence.ts` (period math, weekday utilities, deadline resolution).
9. Implement `lib/utils/reportTitle.ts` (placeholder allowlist + safe substitution).
10. Implement `lib/data/reportShellService.ts` with idempotent `ensureReportShell` keyed on `(campusId, templateId, periodKey)`.
11. Implement `lib/data/recurringAssignmentService.ts` (rule resolution + materialisation, calling `ensureReportShell`).
12. Add `POST /api/form-assignments/materialise` invoking the service for the calling user.
13. Update `QuickFormLandingPage` to call materialise on mount, then list active assignments.
14. Surface a "Last filled by USHER" badge on `ReportEditPage` per metric (using existing `lockedById`/`updatedAt` proxies — extend ReportMetric with `lastQuickFillById` if a follow-up needs explicit attribution).

### Phase C — auto-fill report title + period at create time

15. Add `lib/auth/permissions.ts → resolveRoleCadence(role)` reading `roleCadence` namespace with fallback.
16. Wire `ReportNewPage` to read role cadence + template recurrence + render auto-fill title + pre-select period values. All editable.
17. Add inline helper text "auto-filled · editable" below title and period inputs (config-driven copy).

### Phase D — aggregated quick-view buttons

18. Add `lib/data/reportAggregation.ts → quickViewAggregateRequest(scope, period)`.
19. Implement `GET /api/reports/[id]/quick-views` returning monthly/quarterly/yearly link + sourceCount per scope (no aggregation write; just probe). Cache per (reportId) for 60 s.
20. Build `modules/reports/components/QuickViewAggregateBar.tsx` (three CTA pills, disabled when `sourceCount === 0`).
21. Mount the bar on `ReportDetailPage` and as a small dashboard widget for campus/group/CEO bands.
22. Reuse existing `/reports/aggregate` page; ensure it handles incoming query params for scope + period (already present per recent work — verify and patch if needed).

### Phase E — correlation in template editor + descriptive analytics

23. Add `correlationGroup` field to template editor at metric and section levels (free-text + suggestion dropdown).
24. Persist via PATCH `/api/templates/[id]`; ignore unknown fields on legacy clients.
25. Implement `lib/data/insights.ts` pure functions (top mover, biggest gap, Pearson, trend slope, correlation matrix, summariseInsights).
26. Upgrade `InsightSummaryWidget` to render config-driven sentences from the structured payload returned by `summariseInsights`.
27. Add `CorrelationMatrixWidget` (Recharts heatmap or fallback list view); gate on min-samples.
28. Add `MetricMoversWidget` (top movers per current period).
29. Update `DEFAULT_LAYOUT` per role band to include the new widgets where appropriate.

### Phase F — Admin Config GUI editors

30. Build `RoleCadenceEditor.tsx` (weekday checkbox row, frequency dropdown, deadline hours number, title template input with placeholder chips).
31. Build `CorrelationEditor.tsx` (Pearson min samples, top-mover window, enableInsights toggle, sentence templates table).
32. Wire both into `AdminConfigPage` — replace JSON editors for `roleCadence` and `correlation` namespaces.

### Phase G — Tests + docs

33. `test/cadenceUtils.test.ts` — period math edges (Sun midnight, ISO weeks across year boundary, leap year).
34. `test/reportTitleRender.test.ts` — placeholder allowlist + unknown-placeholder safety.
35. `test/recurringAssignmentMaterialisation.test.ts` — idempotency on concurrent calls; correct period-keying; campus drift handling.
36. `test/insightsAlgorithms.test.ts` — Pearson correctness on canned samples; min-samples gate; top-mover ordering; biggest-gap sorting; summariseInsights structure.
37. `test/quickViewAvailability.test.ts` — sourceCount probe path; cache TTL.
38. `test/templateCorrelationFieldOptional.test.ts` — old template payload (without correlationGroup) renders without error; new field optional.
39. `test/migrationAdditiveSafety.test.ts` (or scripted SQL inspection) — migration adds columns only; no DROP, no RENAME, no REFERENCES re-bind on existing tables.
40. Update `.ai-system/agents/system-architecture.md` — new modules + data-flow entries (32–37): cadence resolution, recurring-assignment materialisation, ensureReportShell, quick-view probe, correlation analytics, safe additive migration policy.
41. Update `.ai-system/agents/project-context.md` — business constraint: "Existing templates and reports must continue to work without runtime errors when new optional fields are absent. Migrations are strictly additive; no destructive operations."
42. Update `.ai-system/agents/repair-system.md` once new patterns appear (e.g., usher campus drift, correlation min-samples confusion).
43. Update `.env.example` (`INSIGHTS_PEARSON_MIN_SAMPLES`, `INSIGHTS_TOP_MOVER_WINDOW_PERIODS`, `INSIGHTS_ENABLED`).
44. Add diagnostics-runbook entries: materialisation idempotency check, quick-view probe cache key, insight algorithm thresholds.

---

## 8. Architecture Doc Updates Required

- **`system-architecture.md`** — append data-flow entries:
  - (32) USHER materialise endpoint expands `FormAssignmentRule` per period and calls `ensureReportShell` — idempotent upsert keyed on `(campusId, templateId, periodKey)`.
  - (33) Cadence resolution: `resolveRoleCadence(role)` reads `roleCadence` admin-config namespace (DB-first) with `RoleConfig.cadence` fallback. Drives report-create auto-fill, deadline, and assignment expansion.
  - (34) Aggregated quick-views: `/api/reports/[id]/quick-views` returns monthly/quarterly/yearly probe results without writing; UI links into the existing aggregation engine with prefilled scope.
  - (35) Correlation algorithms: `lib/data/insights.ts` exposes pure functions (Pearson, top mover, biggest gap, trend slope) gated by `INSIGHTS_PEARSON_MIN_SAMPLES`. Sentence templates for InsightSummaryWidget come from `correlation` admin-config namespace.
  - (36) Migration discipline: new schema fields are nullable / defaulted; migrations are strictly additive; `prisma migrate deploy` only.
  - (37) Backward compat: old templates without `recurrenceFrequency` resolve to role cadence; old reports without `autoCreated` are treated as user-created; old metrics without `correlationGroup` are excluded from correlation matrices, not erroring.

- **`project-context.md`** — business constraints:
  - "Existing reports and templates must continue to function when new optional fields are absent. Read paths must null-coalesce to safe defaults."
  - "Migrations against the production database are strictly additive. Never use `prisma migrate reset` or any destructive operation; apply with `prisma migrate deploy`. Drift resolution uses `prisma migrate resolve` only when explicitly approved."
  - "Per-role cadence (frequency, expected days, deadline) is admin-editable through the substrate. SUPERADMIN does not fill reports and has no cadence."

- **`repair-system.md`** — log patterns once they appear (materialisation idempotency, correlation min-samples confusion, ushers moved mid-period).

---

## 9. Single-Pass Cut

The full Phase A → Phase G is in scope for one implementation pass when approved. Migration runs first (Phase A), then cadence + report shell + recurring assignments (Phase B), then auto-fill (C), quick-views (D), correlation (E), Admin Config GUIs (F), tests + docs (G). Tests run after each phase to surface regression early. Final typecheck + run all new tests at the end.

No code in this turn — awaiting plan approval.
