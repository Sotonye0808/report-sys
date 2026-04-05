# Task Queue Gap Audit and Cloud Handoff

Date: 2026-04-05 (handoff refresh)
Scope: Final cloud handoff for all remaining implementation work

---

## 1) Queue Count Snapshot

Source: `.ai-system/planning/task-queue.md`

- Raw checked items: 60
- Raw unchecked items: 10
- Placeholder backlog items (non-actionable): 2
  - `[Backlog item 1]`
  - `[Backlog item 2]`

Actionable remaining tasks after reconciliation: 8

---

## 2) Latest Implemented Context (Do Not Rework)

Completed in current local session and already reflected in queue verification notes:

- Aggregation now supports draft-inclusive retrieval defaults end-to-end (`includeDrafts`) and robust status resolution.
- Aggregation period filters for month/week can be left unset for year-wide matching.
- Aggregation metric selector is enabled and template-driven in UI.
- Aggregated reports nav entry added for authorized roles.
- Analytics overview/metrics/quarterly endpoints now parse and honor draft-inclusion flags consistently.
- Analytics page now auto-aligns year to latest available scoped report year when current year has no data.

Key evidence files:

- `app/api/reports/aggregate/route.ts`
- `lib/data/reportAggregation.ts`
- `modules/reports/components/ReportAggregationPage.tsx`
- `app/api/analytics/overview/route.ts`
- `app/api/analytics/metrics/route.ts`
- `app/api/analytics/quarterly/route.ts`
- `modules/analytics/components/AnalyticsPage.tsx`
- `config/nav.ts`

---

## 3) Remaining Actionable Tasks (8)

### A. Current Sprint Open

1. Add regression tests for report template API and auth refresh behavior
2. Add regression tests for report unlock and audit trail visibility
3. Complete audit trail refactor by moving template version snapshot events to central helper (`lib/utils/audit.ts`)
4. Fix report form stuck period/template selection and repetitive goals loading
5. Fix router navigation failure where page transitions require reload before working
6. Add UI regression tests ensuring profile/org hierarchy mutations update UI state without manual refresh

### B. Aggregated Rollup Feature Open / Partial

7. Add org hierarchy context helper for rollup scope resolution
8. Document aggregation behavior in `.ai-system` architecture/project notes (plus product docs when introduced)

---

## 4) Cloud Session Prompt (Ready to Paste)

Read first:

- `.ai-system/agents/general-instructions.md`
- `.ai-system/planning/task-queue.md`
- `.ai-system/agents/system-architecture.md`
- `.ai-system/agents/repair-system.md`
- `.ai-system/planning/temp-task-queue-gap-audit-2026-04-05.md`

Task:
Complete all 8 remaining actionable tasks from the queue, in order of risk reduction and user impact.

Priority order:

1. Regression coverage:
   report template API + auth refresh; report unlock + audit trail visibility; profile/org UI no-refresh behavior
2. Runtime correctness fixes:
   report form stuck period/template selection and repetitive goals loading; router navigation requiring manual reload
3. Architecture consistency:
   complete template snapshot migration to central audit helper; add org hierarchy rollup helper for aggregation
4. Documentation closure:
   finalize aggregation behavior notes in `.ai-system` architecture/project docs

Execution requirements:

- Keep all user-facing strings in `config/content.ts`.
- Preserve strict TypeScript + Zod boundaries.
- Keep role-aware behavior aligned to `config/roles.ts`.
- Keep request-id structured logging on failure-critical paths.
- Do not regress already-landed aggregation and analytics draft-retrieval behavior.

Validation gates:

- `npm run -s typecheck` passes.
- New/updated tests pass (or blockers documented with evidence and next action).
- Manual aggregation smoke check confirms draft-inclusive retrieval for at least:
  - one campus role
  - one group role
  - one global role

Required docs updates before close:

- `.ai-system/planning/task-queue.md`
- `.ai-system/checkpoints/session-log.md`
- `.ai-system/summaries/dev-history.md`
- `.ai-system/agents/system-architecture.md` (if behavior changed)
- `.ai-system/agents/repair-system.md` (if new repair pattern found)

Required final cloud report format:

1. Completed items with file evidence
2. Remaining items + blocker reasons (if any)
3. Test/typecheck results
4. Risk notes and immediate follow-up recommendation

---

## 5) Context Refresh Note

Repo snapshot available for cloud context:

- `repomix-current.txt` (regenerated 2026-04-05)
