# Task Queue Gap Audit and Cloud Handoff

Date: 2026-04-05
Scope: Verify unchecked tasks vs implementation reality, then prepare cloud-session execution prompt

---

## 1) Queue Count Snapshot

Source: `.ai-system/planning/task-queue.md`

- Raw checked items: 51
- Raw unchecked items: 19

Reconciliation from code audit:

- Verified done and checkbox-corrected in this audit pass: 2
  - Offline sync indicator + retry queue
  - Aggregated export chart embedding in export utility
- Placeholder backlog items (non-actionable): 2
  - `[Backlog item 1]`
  - `[Backlog item 2]`

Actionable remaining tasks after reconciliation: 17

---

## 2) Verified Done (Checkboxes corrected)

1. Add offline sync indicator + retry queue for pending offline submissions

Evidence:

- `components/ui/OfflineIndicator.tsx`
- `lib/hooks/useOfflineSync.ts`
- `lib/utils/offlineQueue.ts`
- `lib/utils/offlineFetch.ts`

2. Add data visualization embedding to export (spreadsheet charts/worksheet summary)

Evidence:

- `lib/utils/exportReports.ts` (`exportAggregatedReport` writes `Chart Data` sheet)
- `modules/reports/components/ReportAggregationPage.tsx` uses `exportAggregatedReport`

---

## 3) Remaining Actionable Tasks (17)

### A. Current Sprint Open

1. Add regression tests for report template API and auth refresh behavior
2. Add regression tests for report unlock and audit trail visibility
3. Implement central audit trail helper and refactor report events + template version snapshots to use it
4. Fix report form stuck period/template selection and repetitive goals loading
5. Fix router navigation failure where page transitions require reload before working
6. Wire Resend email service into invite creation, password reset, report workflow events (submission/approval/lock/reminder)
7. Add regression tests for Redis scan cursor string termination and write-route completion under cache invalidation load
8. Add UI regression tests ensuring profile/org hierarchy mutations update UI state without manual refresh
9. Add push notification sync test matrix

### B. Aggregated Rollup Feature Open / Partial

10. Add report aggregation API kernel decorators and zod schemas (`app/api/reports/aggregate`) — partial
11. Extend report data model/response types for `aggregationSource` and `aggregatedFrom`
12. Implement `lib/data/reportAggregation.ts` robustness and correctness for template/version/scope/status calculations — partial
13. Add org hierarchy context helper for rollup scope resolution
14. Complete `ReportAggregationPage` interactive stepper + metric selector behavior — partial
15. Add automated aggregation correctness tests in `test/aggregation.test.ts`
16. Update nav + breadcrumbs for aggregate route coverage — partial
17. Document aggregation behavior in project docs/hypersystem notes

---

## 4) Aggregation Failure Focus (Known user issue)

Observed user issue:

- Aggregation consistently fails with selected scope load errors.

Current implementation gaps likely contributing:

- Scope UX and role constraints are mismatched for some role/scope combinations.
- Aggregation page has disabled metric selector and incomplete guided flow.
- No automated aggregation test harness (`test/aggregation.test.ts`) to lock behavior.
- Missing report-level metadata fields (`aggregationSource`, `aggregatedFrom`) reduce traceability and debugging.

---

## 5) Cloud Session Prompt (Ready to Paste)

Read first:

- `.ai-system/agents/general-instructions.md`
- `.ai-system/planning/task-queue.md`
- `.ai-system/agents/system-architecture.md`
- `.ai-system/agents/repair-system.md`
- `.ai-system/planning/aggregated-report-feature-plan.md`
- `.ai-system/planning/cloudinary-asset-lifecycle-implementation-blueprint-2026-04-04.md`
- `.ai-system/planning/temp-task-queue-gap-audit-2026-04-05.md`

Task:
Close the verified remaining actionable tasks from the task queue (17 items), with first priority on fixing aggregated report generation failures and then completing production-readiness test coverage.

Critical priorities:

1. Fix aggregated report scope failure end-to-end so selected scope loads and preview/generate work reliably.
2. Add missing aggregation tests (`test/aggregation.test.ts`) for sum/average/snapshot and scope/role behavior.
3. Complete metadata support (`aggregationSource`, `aggregatedFrom`) in types/API responses.
4. Complete remaining production-readiness regression tests:
   - report template API + auth refresh
   - report unlock + audit trail visibility
   - Redis cursor termination/write completion
   - profile/org UI mutation no-refresh behavior
   - push sync matrix
5. Finish Resend reminder wiring so report deadline reminder path is actually dispatched (not only templated).

Execution requirements:

- Keep all user-facing text config-driven (`config/content.ts`).
- Keep strict TypeScript and Zod validation boundaries.
- Keep role-aware behavior consistent with `config/roles.ts` and existing route policy.
- Use request-id structured logs on new write/failure-critical paths.
- Avoid regressions in cloudinary screenshot lifecycle and existing report workflows.

Task-queue hygiene requirement:

- Mark tasks `[x]` only when implemented and validated.
- Leave partial tasks unchecked and add short verification notes when needed.

Validation gates before finishing:

- `npm run -s typecheck` passes.
- New/updated targeted tests run and pass (or clearly documented blockers with evidence).
- Aggregation user flow validated for at least:
  - one campus-scoped role
  - one group-scoped role
  - one global role

Required docs updates in this session:

- `.ai-system/planning/task-queue.md` (checkbox status + notes)
- `.ai-system/checkpoints/session-log.md`
- `.ai-system/summaries/dev-history.md`
- `.ai-system/agents/system-architecture.md` (if architecture behavior changed)
- `.ai-system/agents/repair-system.md` (for newly discovered/fixed issue patterns)

Final report format expected from cloud session:

1. Completed tasks (with file evidence)
2. Remaining tasks (if any) with blocker reason
3. Aggregation bug root cause + fix summary
4. Test results summary
5. Risk notes and immediate next recommendations

---

## 6) Context Refresh Note

RepoMix snapshot refreshed via MCP for cloud context:

- `repomix-current.txt` regenerated on 2026-04-05
