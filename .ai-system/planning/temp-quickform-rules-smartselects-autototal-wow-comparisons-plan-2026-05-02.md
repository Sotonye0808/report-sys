# Temp Plan — Quick-Form Rule Editor + Smart Selects + Auto-Total Metrics + Week-on-Week + Chart Polish + Metric/Report Comparison

> **Date:** 2026-05-02
> **Status:** Planning only. Tasks at the bottom are the canonical sequence — append to `task-queue.md` after approval.
> **Driver:** Close the missing entry point for assigning quick-form metric subsets to USHERs (today rules can only be inserted via direct DB writes), tighten free-text fields that should be search-selects, add a configurable auto-total metric type with traditional metric props (YoY, WoW, correlation, cumulative), introduce week-on-week comparison alongside the existing YoY, fix the campus-breakdown x-axis label rendering, and round out the analytics comparison surfaces with charts + correlation-aware insights for both metric-vs-metric and report-vs-report views.

---

## 1. Feature Summary

Six adjacent gaps surfaced from real use, bundled because they share substrate:

1. **Quick-form rule editor.** `FormAssignmentRule` model + materialise endpoint exist, but admins have no UI to actually pick "for this template, USHERs at this campus fill these N metrics every Sunday." Today the only path is direct SQL. We add a `/templates/[id]?tab=assignments` editor, a parallel mini-view inside the Admin Config Roles tab so role admins can see existing rules per role, and the underlying CRUD API.

2. **Smart selects everywhere.** Two free-text fields surface as concrete usability bugs: the **template metric mapping** in the imports wizard (typing template metric IDs by hand) and the **correlation group** field on metric/section editors (no awareness of groups already used in the template). Both convert to search-selects with grouped options + "create new" affordance. A small audit covers other free-text inputs that should be selects.

3. **Auto-total metric type.** A template metric can be flagged as `isAutoTotal` with a list of `autoTotalSourceMetricIds`; the report value is computed (sum) on save and rendered read-only on the form, with an auto-generated comment listing the source metrics. Default scope is the section; opt-in inter-section is allowed when the admin explicitly picks cross-section sources. All other metric props (YoY, WoW, cumulative, correlation) still apply.

4. **Week-on-Week comparison.** A peer to YoY: `capturesWoW` flag on the metric, server fills the prior-week value into the report payload as `wowGoal` / `wowAchieved` so the form shows a small read-only WoW indicator and analytics surfaces a WoW trend toggle. Non-blocking — silently degrades when the prior week's report doesn't exist.

5. **Campus-breakdown chart x-axis polish.** Long campus names overflow / overlap. Switch to a custom Recharts tick that rotates labels at small breakpoints, truncates with an ellipsis past N chars, and shows the full label in the tooltip. Where the data set is large, fall back to a horizontal-bar variant. Centralise in `chartUtils` so other charts can opt in.

6. **Comparison surfaces with charts + correlation-driven insights.** `MetricComparison` (compare 2-N metrics across periods/campuses) gets a Recharts time-series + a small correlation matrix + descriptive sentences ("metric A and metric B correlate strongly, r=0.82, n=14"). `ReportComparison` (compare 2-N reports side-by-side) adds per-metric mini charts plus the same insight summary. Both reuse `lib/data/insights.ts`.

---

## 2. Architecture Impact

| Layer | Affected | Change |
|---|---|---|
| `prisma/schema.prisma` | additive columns | `ReportTemplateMetric.isAutoTotal Boolean @default(false)`, `ReportTemplateMetric.autoTotalSourceMetricIds String[] @default([])`, `ReportTemplateMetric.autoTotalScope String? @default("SECTION")`, `ReportTemplateMetric.capturesWoW Boolean @default(false)` |
| `prisma/migrations` | one new SQL file | `20260502_*_auto_total_and_wow_metrics` — `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ... DEFAULT ...`. Strictly additive. `prisma migrate deploy` only |
| `types/global.ts` | `ReportTemplateMetric`, `ReportMetric`, `FormAssignmentRule` interfaces | Add `isAutoTotal`, `autoTotalSourceMetricIds`, `autoTotalScope`, `capturesWoW`. Add `wowGoal`/`wowAchieved` (optional) to `ReportMetric`. Add `FormAssignmentRule` interface (currently absent from globals despite the model existing) |
| `lib/data/autoTotal.ts` | **new** | `recomputeAutoTotals(reportSections)` — pure function, called from report save/edit paths |
| `lib/data/wow.ts` | **new** | `attachWeekOnWeekContext(report, prevWeekReport)` — pure function, called from report read paths |
| `lib/data/formAssignmentRule.ts` | **new** | `listForUser`, `listForTemplate`, `create`, `update`, `archive`. Validates metric subset belongs to the template and the assignee role + scope are coherent |
| `lib/data/reportShellService.ts` | extend | After building the section/metric tree, run `recomputeAutoTotals` so freshly-shelled reports already have totals zero-initialised correctly |
| `app/api/form-assignment-rules/...` | **new** | `GET /api/form-assignment-rules?templateId=...&role=...`, `POST`, `PATCH /:id`, `DELETE /:id` — SUPERADMIN + creators of the rule |
| `app/api/report-templates/[id]/route.ts` | extend | PATCH accepts `isAutoTotal`, `autoTotalSourceMetricIds`, `autoTotalScope`, `capturesWoW` per metric. Server validates: source metric IDs all belong to the template; auto-total source list cannot contain other auto-totals (no chaining); auto-total cannot self-reference |
| `app/api/reports/[id]/route.ts` | extend | After patching metric values, recompute auto-totals before persisting and stamp the auto-total comment |
| `app/api/reports/[id]/quick-views/route.ts` | extend | Already returns aggregated quick-view links; no change |
| `modules/templates/components/TemplateDetailPage.tsx` | extend + tab shell | Convert to a `Tabs` page (Sections \| Assignments). Sections tab: existing editor + new auto-total UI on each MetricRow + WoW toggle. Correlation group becomes search-select. Assignments tab: `<TemplateAssignmentsEditor />` |
| `modules/templates/components/TemplateAssignmentsEditor.tsx` | **new** | Per-template list of FormAssignmentRule rows with role + scope + metric subset multi-select + cadence override + active toggle |
| `modules/templates/components/MetricSelect.tsx` | **new** | Reusable search-select listing the template's metrics (grouped by section), used by auto-total source picker + correlation group recall + assignments metric picker |
| `modules/templates/components/CorrelationGroupSelect.tsx` | **new** | Search-select that surfaces existing groups in the current template + "+ Create group" option |
| `modules/imports/components/ImportWizardPage.tsx` | extend | Replace the per-column "Target" Select (already a Select, but populated only by free-text) with the existing `metricOptions` that are now organised as grouped options (template → section → metric) and search-enabled |
| `modules/admin-config/components/AdminConfigPage.tsx` | extend Roles tab | Per-role row gets a "Quick-form rules" link that routes to a filtered Assignments view (read-only summary) so admins managing roles can see what each role is currently bound to |
| `modules/reports/components/ReportSectionsForm.tsx` | extend | Render auto-total rows read-only with "Auto" tag + tooltip listing source metrics; render WoW indicator next to value when `capturesWoW` is set |
| `modules/analytics/components/AnalyticsPage.tsx` | extend | Add WoW toggle alongside YoY in the Trends section; pull WoW values from the same report payload (no extra round trip) |
| `modules/analytics/components/MetricComparisonPanel.tsx` | **new** | Multi-metric search-select + Recharts time-series + correlation matrix tile + insights sentences |
| `modules/analytics/components/ReportComparisonPanel.tsx` | **new** | Multi-report picker (already in `/reports/aggregate`-adjacent surfaces) + side-by-side metric table + per-metric mini chart + insights |
| `modules/analytics/chartUtils.ts` | extend | New `formatXAxisTick(label, opts)` helper + a `RotatedTick` Recharts custom tick component. CampusBreakdown migrates to it |
| `config/content.ts` | new namespaces | `templates.assignments`, `templates.autoTotal`, `templates.wow`, `analytics.comparison`, `metricSelect`, `correlationGroupSelect` |
| `.env.example` | none | No new env keys needed |

---

## 3. New Modules / Services

- **`lib/data/autoTotal.ts`** — `recomputeAutoTotals(sections, templateMetrics)` returns a new sections array with auto-total cell values + comments stamped. Pure; takes section snapshots and template metrics in, returns the updated snapshots out. Used by report write paths and `ensureReportShell`.
- **`lib/data/wow.ts`** — `attachWeekOnWeekContext(report, prevWeekReport)` returns the report payload with `wowGoal` / `wowAchieved` fields filled where the metric has `capturesWoW`. Pure.
- **`lib/data/formAssignmentRule.ts`** — CRUD service with metric-subset + scope coherence validation. Reused by the API routes.
- **`app/api/form-assignment-rules/route.ts`** + **`[id]/route.ts`** — REST endpoints (GET list, POST create, PATCH update, DELETE archive).
- **`modules/templates/components/TemplateAssignmentsEditor.tsx`** — primary entry point for quick-form rule CRUD.
- **`modules/templates/components/MetricSelect.tsx`** + **`CorrelationGroupSelect.tsx`** — reusable search-select primitives.
- **`modules/analytics/components/MetricComparisonPanel.tsx`** + **`ReportComparisonPanel.tsx`** — analytics comparison surfaces with charts + insights.

---

## 4. Data Flow

### 4a. Quick-form rule lifecycle (closes the gap)

```
Admin opens /templates/[id]
  → Tabs: "Sections" (existing editor) | "Assignments" (new)
  → Assignments tab: <TemplateAssignmentsEditor templateId={id} />
    fetches GET /api/form-assignment-rules?templateId={id}
    renders one row per rule:
      role select (USHER / DATA_ENTRY / etc.)
      campus + group scope (optional)
      metric subset multi-select (powered by MetricSelect, scoped to template)
      cadence override (optional)
      active toggle + delete
    "+ Add assignment rule" creates a draft row → POST on save
    PATCH on field change (debounced)

USHER login → /quick-form
  → existing POST /api/form-assignments/materialise
    expands the rules into per-period FormAssignment rows + ensures report shell
    → existing /api/form-assignments/[id]/quick-fill writes ReportMetric rows
Campus admin opens the report → values pre-populated, "auto-filled by USHER" badge unchanged
```

Mirror surface: Admin Config Roles tab gets a small "Quick-form rules" link per role that opens a filtered list (`?role=USHER`) so high-level admins can audit role bindings without leaving the namespace editor.

### 4b. Auto-total recomputation

```
Report PATCH /api/reports/[id] arrives with metric updates
  → load report + template + all template metrics
  → for each metric in the patch: write the new value
  → recomputeAutoTotals(sections, templateMetrics):
      for each metric m where m.isAutoTotal:
        sources = templateMetrics where id ∈ m.autoTotalSourceMetricIds
        scope guard: if m.autoTotalScope = "SECTION", reject sources from other sections
        sum the achieved values from the report's matching report-metric rows
        write the sum into the report-metric row for m
        stamp comment: "Auto-total of {source name list}"
  → persist
  → return updated report
```

`ensureReportShell` calls the same recompute after building the metric tree so a brand-new report shell already has zero totals seeded with the comment. Auto-total cells are read-only on the form (Server is source of truth).

### 4c. Week-on-Week context

```
Report GET /api/reports/[id] arrives
  → load report + template
  → if any metric has capturesWoW:
      load previous-week report for same campus + template (campusId, templateId, periodYear, periodWeek-1)
      attachWeekOnWeekContext(report, prev)
        for each metric where capturesWoW:
          report.metric.wowGoal = prev?.metric.monthlyAchieved
          report.metric.wowAchieved = report.metric.monthlyAchieved
  → return enriched payload
```

Form renders a small "WoW" indicator below the input. Analytics: a "Week-on-Week" toggle alongside YoY in the Trends panel.

### 4d. Smart selects

- **Template metric mapping (imports wizard)** → `MetricSelect` rendered with grouped options `[{ label: "Templates", options: [{ label: tplName, options: [{ label: sectionName, options: [{ value: metricId, label: metricName }] }] }] }]`. Search by name across all groups. Saved mapping rows show the human-readable path as the rendered value.
- **Correlation group field** → `CorrelationGroupSelect` reads existing groups from the template draft (via prop), shows them as suggestions, and offers "Create group: <typed text>" as the last option. Selection writes the resolved string. No more typo drift.

### 4e. Chart x-axis polish

`chartUtils.RotatedTick`:
- Default: rotate -30°, anchor end, dx=-6, dy=10, font size 11.
- Truncate labels longer than `maxChars` (default 14) with ellipsis; preserve full label in `<title>` for native tooltip + Recharts hover.
- At sm breakpoint, swap to a horizontal-bar layout via the consumer's `layout="vertical"` opt-in.

CampusBreakdown chart: pass `tick={<RotatedTick />}` and `interval={0}`. Sets a sensible `height` so labels don't overflow.

### 4f. Metric/report comparison surfaces

```
/analytics → "Compare metrics" tab opens MetricComparisonPanel
  multi-select metrics (MetricSelect)
  reuse loaded reports (no extra fetch)
  build pivot: rows = period, cols = metric; values = sum-or-mean depending on metric.calculationType
  render Recharts LineChart (one Line per metric)
  compute correlationMatrix(reports, metricIds, INSIGHTS_PEARSON_MIN_SAMPLES)
  render small heatmap below + sentence per pair with |r| >= 0.5

/analytics → "Compare reports" tab opens ReportComparisonPanel
  pick 2-N reports (search by campus/period)
  side-by-side table per metric: report A | report B | ... | YoY | WoW | gap
  per-metric mini sparkline
  insights sentences from summariseInsights(picked reports, options)
```

Both reuse `lib/data/insights.ts`; no new analytical logic.

---

## 5. UI/UX

- **Template tabs.** TemplateDetailPage gains AntDesign Tabs at top: "Sections" (existing body) | "Assignments". Tab key persisted in `?tab=` for deep links. `destroyInactiveTabPane: false` to preserve unsaved drafts when tab-switching.
- **Auto-total UI inline on each MetricRow:** an "Auto-total" toggle at the bottom of the row. When enabled:
  - Source metrics multi-select (defaults to all other non-auto-total metrics in the same section). Admin can deselect.
  - "Suggested name" input pre-filled with `Total ${sectionName}` (editable).
  - Advanced disclosure: "Use sources from other sections" toggle — when on, the multi-select expands to template-wide metrics. Server validates the scope flag matches the chosen sources.
- **WoW toggle** sits right next to the YoY toggle in MetricRow's TOGGLES set. Same surface, same vocabulary.
- **CorrelationGroupSelect** suggestions appear as a small chip strip under the input + a `+ Create group "X"` option in the dropdown.
- **MetricSelect** uses AntDesign `Select` with `mode="multiple"` (or single, depending on consumer), `showSearch`, `optionFilterProp="label"`, and the grouped option-tree shape above. Renders with section icons for visual scanning.
- **Assignments editor** (TemplateAssignmentsEditor): each rule is a card. Role select on the left, scope (campus/group) inputs in the middle, metric subset MetricSelect on the right, cadence override + active toggle below. Drag-handle for reordering (visual only).
- **CampusBreakdown chart**: rotated labels at 30°; long names truncated with native title tooltip; tightened bottom margin.
- **MetricComparison + ReportComparison panels** live as new tabs under `/analytics` (existing tab strip): "Overview" | "Metrics" (existing) | "Compare metrics" (new) | "Compare reports" (new) | "Trends" (existing) | "Compliance" (existing). Both panels bottom-anchor an "Insights" card with two-to-three short sentences from `summariseInsights`.
- **Mobile** — comparison surfaces stack vertically; correlation matrix becomes a list view under sm.

---

## 6. Risks + Edge Cases

- **Auto-total chaining** — must reject `auto-total → auto-total` to avoid feedback loops. Validation at template save time + report recompute time.
- **Auto-total scope drift** — if an admin moves a source metric to another section but the auto-total's scope is `SECTION`, recompute should silently drop the now-out-of-scope source AND surface a one-time validation warning so the admin notices and decides.
- **Auto-total + manual override** — auto-total cells are server-computed; the form must mark them `isLocked` so the user can't write a divergent value. ReportMetric.isLocked already exists; reuse it for auto-total cells.
- **WoW prior-week missing** — the previous week's report may not exist (first week, gap, vacation). Field simply omits `wowGoal` and the indicator hides. Never blocks save.
- **WoW + monthly templates** — only meaningful for weekly cadence. UI hides the indicator and the analytics toggle when the template's cadence is monthly/yearly.
- **Smart-select migration** — replacing free-text inputs with selects can break existing data shapes if a saved value isn't in the option list. Both `MetricSelect` (binds to UUIDs that already exist in the template) and `CorrelationGroupSelect` (string with create-on-the-fly) handle this gracefully — out-of-list values render as "Custom: <value>" with a soft warning.
- **TemplateAssignmentsEditor metric subset drift** — if a metric is deleted from the template but referenced in a rule's `metricIds`, server validation flags the rule as `requiresAttention` instead of throwing on materialise. UI surfaces the warning chip.
- **Backwards compat on existing templates** — every new field is nullable / defaulted (`isAutoTotal: false`, `autoTotalSourceMetricIds: []`, `capturesWoW: false`); legacy templates and reports continue to work unchanged.
- **Migration safety** — strictly additive (`ADD COLUMN IF NOT EXISTS ... DEFAULT ...`). Apply with `prisma migrate deploy`. Never `migrate reset`.
- **Comparison correlation cap** — already gated by `INSIGHTS_PEARSON_MIN_SAMPLES`; with too few periods we show "not enough data" instead of misleading r values.
- **Comparison perf** — comparison panels reuse already-loaded reports + run pure functions. No new API surface needed; if data grows, paginate the loaded report list rather than the comparison.
- **Chart polish regressions** — the rotated tick component must default to graceful fallback when label is short (no rotation if everything fits). Snapshot test the helper with mixed-length inputs.
- **Quick-form rule editor permission model** — only SUPERADMIN + the rule's `ownerId` can edit/delete. Other admins can read; copy a rule into their own scope to clone-with-edit.
- **Inter-section auto-total UX risk** — making cross-section configurable could trigger admin confusion. Hide behind a disclosure ("Advanced: cross-section sources") + an inline note warning that the section subtotal won't equal the auto-total when this is enabled.

---

## 7. Concrete Implementation Tasks (canonical sequence)

> Mirror in `task-queue.md` under "Planned Feature — Quick-Form Rule Editor + Smart Selects + Auto-Total + WoW + Chart Polish + Comparison Surfaces".

### Phase A — Schema + safe additive migration

1. Add `ReportTemplateMetric.isAutoTotal Boolean @default(false)`, `ReportTemplateMetric.autoTotalSourceMetricIds String[] @default([])`, `ReportTemplateMetric.autoTotalScope String? @default("SECTION")`, `ReportTemplateMetric.capturesWoW Boolean @default(false)` to `prisma/schema.prisma`.
2. Author `prisma/migrations/20260502_*_auto_total_and_wow_metrics/migration.sql` strictly additive (`ADD COLUMN IF NOT EXISTS ... DEFAULT ...`); apply with `prisma migrate deploy`.
3. Regenerate Prisma client; `npx prisma validate`.
4. Extend `types/global.ts` `ReportTemplateMetric` + `ReportMetric` with the new fields; add a `FormAssignmentRule` interface for client use.

### Phase B — FormAssignmentRule CRUD

5. Implement `lib/data/formAssignmentRule.ts` with metric-subset + scope coherence validators.
6. Add `app/api/form-assignment-rules/route.ts` (GET list, POST create) + `[id]/route.ts` (PATCH, DELETE archive). SUPERADMIN + rule owner authorised.
7. Build `modules/templates/components/MetricSelect.tsx` (grouped options, search, multi-select).
8. Build `modules/templates/components/TemplateAssignmentsEditor.tsx` reusing MetricSelect.
9. Convert `TemplateDetailPage` to AntDesign Tabs (`?tab=sections|assignments`); mount the new editor under "Assignments".
10. Add a "Quick-form rules" link per role inside the Roles editor in Admin Config that deep-links into `/templates?role=...` (read-only summary surface).

### Phase C — Auto-total metric type

11. Implement `lib/data/autoTotal.ts → recomputeAutoTotals(sections, templateMetrics)` + chain-detection guard.
12. Wire `recomputeAutoTotals` into `ensureReportShell` (so shells start with zero totals + correct comments) and into the report PATCH handler before persistence.
13. Validate the auto-total source list at template save time in `app/api/report-templates/[id]/route.ts` (no chaining, no self-reference, scope-coherent).
14. Extend `MetricRow` in `TemplateDetailPage` with the auto-total toggle + source MetricSelect + suggested-name input + scope advanced-disclosure.
15. Render auto-total cells read-only with "Auto" tag and tooltip in `ReportSectionsForm`.

### Phase D — Week-on-Week comparison

16. Implement `lib/data/wow.ts → attachWeekOnWeekContext(report, prevWeekReport)`.
17. Wire it into the report GET handler when at least one metric has `capturesWoW`.
18. Add `capturesWoW` to the `MetricRow` toggles in `TemplateDetailPage`.
19. Render a small "WoW" indicator next to the value in `ReportSectionsForm` when the metric has `capturesWoW` and the WoW context is present.
20. Add WoW toggle to the Analytics Trends panel; surface WoW values via the existing chart utilities.

### Phase E — Smart selects

21. Build `modules/templates/components/CorrelationGroupSelect.tsx` (reads existing groups from a `template` prop; "+ Create group" option).
22. Replace the free-text correlation-group inputs in `TemplateDetailPage` (metric-level + section-level) with `CorrelationGroupSelect`.
23. Replace the per-column "Target" Select in the imports wizard with `MetricSelect` rendered with grouped options.
24. Audit other free-text fields surfaced in templates / admin-config / imports for similar conversions.

### Phase F — Chart polish + comparison surfaces

25. Add `chartUtils.RotatedTick` + `formatXAxisTick(label, opts)`. Migrate CampusBreakdown chart to it.
26. Build `modules/analytics/components/MetricComparisonPanel.tsx` (multi-metric MetricSelect + Recharts LineChart + correlation matrix + insights).
27. Build `modules/analytics/components/ReportComparisonPanel.tsx` (multi-report picker + side-by-side table + per-metric mini chart + insights).
28. Mount both panels as new tabs under `/analytics`.

### Phase G — Tests + docs

29. `test/autoTotalRecompute.test.ts` — sum correctness; chain-guard; scope-drift guard; comment generation.
30. `test/wowAttach.test.ts` — prior-week presence/absence; non-blocking when missing.
31. `test/formAssignmentRuleValidator.test.ts` — metric-subset must belong to template; scope coherence with role.
32. `test/metricSelectGrouping.test.ts` — option grouping + search-by-name.
33. `test/correlationGroupSuggest.test.ts` — surfaces existing groups; "+ Create group" returns the typed string verbatim.
34. `test/chartRotatedTick.test.ts` — short-label fallback; long-label truncation with full title.
35. `test/metricComparisonInsights.test.ts` — insight strings degrade gracefully when below `INSIGHTS_PEARSON_MIN_SAMPLES`.
36. Update `.ai-system/agents/system-architecture.md` (modules + data-flow entries 49–54: rule editor, auto-total, WoW, smart selects, chart polish, comparison surfaces).
37. Update `.ai-system/agents/project-context.md` with the auto-total + WoW + rule-editor business constraints.
38. Update `diagnostics-runbook.md` with: auto-total chain-detection error path; WoW silent-degrade behaviour; rule editor "metric drift" warning chip.

---

## 8. Architecture Doc Updates Required

- **`system-architecture.md`** — add module rows for `lib/data/autoTotal.ts`, `lib/data/wow.ts`, `lib/data/formAssignmentRule.ts`, `modules/templates/components/{TemplateAssignmentsEditor,MetricSelect,CorrelationGroupSelect}.tsx`, `modules/analytics/components/{MetricComparisonPanel,ReportComparisonPanel}.tsx`. Append data-flow entries:
  - (49) Quick-form rule editor: TemplateAssignmentsEditor → CRUD via `/api/form-assignment-rules`. Mirror surface inside Admin Config Roles tab.
  - (50) Auto-total recompute: server-side computation on report save + on shell creation. Source list validated at template save (no chaining, no self-reference, scope-coherent).
  - (51) WoW context: server attaches `wowGoal`/`wowAchieved` from prior-week report when `capturesWoW`. Non-blocking on missing prior week.
  - (52) Smart selects: MetricSelect + CorrelationGroupSelect provide grouped, searchable options for template-bound free-text fields.
  - (53) Chart polish: `chartUtils.RotatedTick` standardises x-axis label rendering across analytics charts.
  - (54) Comparison surfaces: MetricComparisonPanel + ReportComparisonPanel render Recharts time-series + correlation matrix + insight sentences via `lib/data/insights.ts`.

- **`project-context.md`** — business constraints:
  - "Quick-form metric assignments are configured per-template via TemplateAssignmentsEditor and per-role via Admin Config. Direct DB writes to `form_assignment_rules` are not the supported path."
  - "Auto-total metrics are server-computed; the form renders them read-only and the comment is auto-generated. Cross-section sources require explicit admin opt-in."
  - "Week-on-Week comparison is opt-in per metric (`capturesWoW`); silently degrades when the prior-week report is unavailable."

- **`repair-system.md`** — log new patterns once seen (auto-total chain attempts, smart-select drift on legacy values, comparison surfaces with degraded sample counts).

---

## 9. Single-Pass Cut

All 38 tasks ship together when approved. Order: A → B → C → D → E → F → G. Tests run after each phase to surface regression early; final typecheck + `npm run build` at the end.

No code in this turn — awaiting plan approval.
