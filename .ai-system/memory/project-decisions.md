# Project Decisions

> **Overview:** Log of significant architectural, technical, and product decisions made during development. Agents consult this before proposing changes to avoid contradicting prior reasoning. Each entry records what was decided, why, and what the alternatives were.

---

## Decision Format

```
## [Decision Title]

**Decision:** [What was decided]
**Date:** [YYYY-MM-DD]
**Made by:** [Developer / AI agent / team]

**Reason:**
[Why this choice was made]

**Alternatives Considered:**
[What else was evaluated and why it was rejected]

**Implications:**
[What this decision affects going forward]
```

---

## Decisions

## Form Draft Persistence / Local Storage Fallback

**Decision:** Use a universal form persistence pattern with local storage + IndexedDB draft caching, plus explicit UI status notifications via `FormDraftBanner` and `useFormPersistence` hooking. Keep existing `useDraftCache` but augment with localStorage fallback for browser and worker compatibility.
**Date:** 2026-03-25
**Made by:** AI assistant (code implementation session)

**Reason:** Users reported loss of form state on refresh; a generic solution is required for all forms and must be easily extensible for future form pages.

**Alternatives Considered:** continue relying on existing `useDraftCache` (IDB-only, reports/templates/goals only), or add per-page custom implement. Rejected because it does not address broad coverage and resilience.

**Implications:** All forms can now safely store user-entered state across refreshes and sessions; future new forms should use `useFormPersistence` to auto-include this behavior.

## Prisma Auto-Transaction Timeout Limit

**Decision:** Align transaction timeout value with Accelerate limit (15 seconds) on all long-running `db.$transaction` usages (goals bulk, template update). Avoid arbitrary larger values to prevent invalid param errors. Benefit from smaller chunked transactions where needed.
**Date:** 2026-03-25
**Made by:** AI assistant (code implementation session)

**Reason:** Errors reported that `interactive transactions ... max timeout of 15000ms` were thrown; 120s was invalid in the environment.

**Alternatives Considered:** Increase external server limit at configuration. Rejected because we need code compatibility across deployments and user-specified environment may not always permit.

**Implications:** Code is safe under Accelerate constraints; in heavy update flows we may also need to minimize per-transaction work.

## Shared Chunked Bulk Transaction Utility

**Decision:** Introduce `runBulkTransaction` utility in `lib/data/bulkTransaction.ts` and wire bulk endpoint use via `app/api/goals/bulk/route.ts`. Enforce a global `validateBulkLimit` cap (default 10000 items) in middleware grammar.
**Date:** 2026-03-25
**Made by:** AI assistant (code implementation session)

**Reason:** Provide 100% no-size-fail behavior for large bulk writes while preserving ACID per chunk and rollback on failures.

**Alternatives Considered:** Keep route-specific chunk loops only. Rejected due code duplication and maintenance risk.

**Implications:** New bulk endpoints can reuse the same logic. Chunk metrics add observability and retry behavior improves transient failure handling.

