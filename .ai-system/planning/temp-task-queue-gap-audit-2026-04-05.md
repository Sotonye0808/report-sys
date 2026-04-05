# Task Queue Gap Audit and Cloud Handoff

Date: 2026-04-05 (refreshed)
Scope: Reconcile queue with current repository state after cloud pass and local follow-up fixes

---

## 1) Queue Count Snapshot

Source: `.ai-system/planning/task-queue.md`

- Raw checked items: 58
- Raw unchecked items: 12
- Placeholder backlog items (non-actionable): 2
  - `[Backlog item 1]`
  - `[Backlog item 2]`

Actionable remaining tasks after reconciliation: 10

---

## 2) Recent Reconciliation Updates

1. Confirmed and kept complete:

- Offline sync indicator + retry queue
- Aggregated export chart embedding
- Aggregation metadata support (`aggregationSource`, `aggregatedFrom`)
- Aggregation test suite bootstrap (`test/aggregation.test.ts`)

2. New follow-up fix landed:

- Aggregation no-data case now returns `404` (domain not-found) instead of generic `500`
- Group-scope query now matches both `orgGroupId` and campuses under selected group (legacy/mixed-path resilience)

Evidence:

- `app/api/reports/aggregate/route.ts`
- `lib/data/reportAggregation.ts`
- `test/aggregation.test.ts`

---

## 3) Remaining Actionable Tasks (10)

### A. Current Sprint Open

1. Add regression tests for report template API and auth refresh behavior
2. Add regression tests for report unlock and audit trail visibility
3. Complete audit trail refactor by moving template version snapshot events to central helper (`lib/utils/audit.ts`)
4. Fix report form stuck period/template selection and repetitive goals loading
5. Fix router navigation failure where page transitions require reload before working
6. Add UI regression tests ensuring profile/org hierarchy mutations update UI state without manual refresh

### B. Aggregated Rollup Feature Open / Partial

7. Add org hierarchy context helper for rollup scope resolution
8. Complete `ReportAggregationPage` interactive stepper + metric selector behavior
9. Add aggregated reports nav entry + breadcrumbs coverage
10. Document aggregation behavior in `.ai-system` architecture/project notes (plus product docs when introduced)

---

## 4) Aggregation Status (Known user issue)

Current status:

- API now correctly distinguishes “no matching reports” from server failure (`404` vs `500`).
- Scope query was hardened for group selection mismatch edge cases.

Still open:

- UI guidance/stepper depth and metric-selector flow completion.
- Full end-to-end role matrix validation in integrated runtime (campus/group/global actors).

---

## 5) Cloud Session Prompt (Ready to Paste)

Read first:

- `.ai-system/agents/general-instructions.md`
- `.ai-system/planning/task-queue.md`
- `.ai-system/agents/system-architecture.md`
- `.ai-system/agents/repair-system.md`
- `.ai-system/planning/temp-task-queue-gap-audit-2026-04-05.md`

Task:
Close the verified remaining actionable tasks from the queue (10 items), with priority on aggregation UX completion and regression coverage.

Critical priorities:

1. Complete aggregation UI flow (scope/date/template/metric selector) and add nav/breadcrumb discoverability.
2. Finish open regression suites:
   - report template API + auth refresh
   - report unlock + audit trail visibility
   - profile/org UI no-refresh behavior
3. Complete audit helper adoption for template version snapshot events.
4. Resolve report form loader-state drift and router transition reload issue.
5. Update architecture/project notes for finalized aggregation behavior.

Execution requirements:

- Keep all user-facing text config-driven (`config/content.ts`).
- Keep strict TypeScript + Zod boundaries.
- Preserve role-aware behavior in `config/roles.ts`.
- Keep request-id structured logging on failure-critical paths.

Validation gates:

- `npm run -s typecheck` passes.
- New/updated targeted tests pass (or blockers documented with evidence).
- Aggregation flow validated for at least one campus role, one group role, and one global role.

Required docs updates before close:

- `.ai-system/planning/task-queue.md`
- `.ai-system/checkpoints/session-log.md`
- `.ai-system/summaries/dev-history.md`
- `.ai-system/agents/system-architecture.md` (if behavior changes)
- `.ai-system/agents/repair-system.md` (if new repair pattern emerges)

---

## 6) Context Refresh Note

RepoMix snapshot remains available for cloud context:

- `repomix-current.txt` regenerated on 2026-04-05
