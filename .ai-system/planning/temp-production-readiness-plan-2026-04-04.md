# Temporary Implementation Plan - Production Readiness Consolidation

Date: 2026-04-04
Owner: Cloud autonomous implementation session
Scope: Consolidate API and DB operation reliability for weak CRUD paths, complete notification channel wiring, and finalize Resend-ready email integration without breaking no-key deployments.

---

## 1) Feature Summary

This feature improves production readiness by unifying how write operations are executed and observed across the app.

Primary outcomes:

- Eliminate stuck loading states by standardizing client mutation lifecycle handling.
- Ensure all write APIs return a consistent response contract and robust error payload.
- Centralize DB write logic and cache invalidation for invite/profile/org operations.
- Add structured logs and request correlation IDs for faster root-cause debugging.
- Complete email/notification channel readiness so in-app, email, and push flows are predictable.
- Keep email optional: when RESEND_API_KEY is missing, app behavior remains fully functional.

---

## 2) Architecture Impact

Existing modules/services affected:

- app/api/invite-links/\*
- app/api/users/profile/route.ts
- app/api/org/groups/\*
- app/api/org/campuses/\*
- app/api/org/hierarchy/\*
- app/api/notifications/\*
- modules/users/components/InvitesPage.tsx
- modules/users/components/ProfilePage.tsx
- modules/org/components/OrgPage.tsx
- modules/notifications/components/InboxPage.tsx
- lib/utils/api.ts
- lib/hooks/useApiData.ts (read path) plus new write utility/hook
- lib/data/db.ts, lib/data/redis.ts (cache and tracing touchpoints)
- lib/email/resend.ts (template/layout composition extension)
- lib/utils/notifications.ts and lib/utils/audit.ts (channel orchestration)

---

## 3) New Modules/Services Required

1. lib/utils/apiMutation.ts (or lib/hooks/useApiMutation.ts)

- Unified write helper for POST/PUT/PATCH/DELETE
- Guarantees loading reset in all code paths
- Normalizes success/error extraction
- Emits structured client logs with requestId

2. lib/server/requestContext.ts (or similar)

- Request correlation ID generation/propagation for API handlers
- Lightweight context metadata for logs

3. modules/common/services/operationResult.ts (optional naming)

- Shared type contract for API responses and mutation result mapping

4. lib/email/templates/

- Shared email shell/layout (logo, typography, footer)
- Config-driven template builders per event (invite, password reset, report status, reminders)

5. Notification channel orchestrator

- Optional placement: lib/utils/notificationOrchestrator.ts
- Single entrypoint to fan out in-app + email + push per event and preference

6. Push subscription persistence API + storage

- API routes for subscribe/unsubscribe/list self preference state
- DB model integration if absent, or fallback cache table strategy

---

## 4) Data Flow (Target)

Write operation lifecycle:

1. UI action triggers unified mutation helper.
2. Helper assigns client request id, sets pending state, issues fetch.
3. API route validates input (Zod), verifies auth, then delegates to domain service.
4. Domain service executes DB writes (transaction where multi-step), invalidates cache keys/patterns.
5. Route returns normalized response: success/data or success:false/error/code/requestId.
6. Mutation helper resolves, clears pending state, maps toast message, triggers refetch/invalidation.
7. For eventful writes, notification orchestrator dispatches:
   - in-app always when configured,
   - email if preference allows and RESEND_API_KEY exists,
   - push if subscription exists and browser permission remains granted.
8. Failures emit structured logs (route, actor, requestId, validation/db/error metadata).

---

## 5) UI/UX Considerations (Aligned to design-system.md + current project principles)

- Keep all user-visible copy config-driven in config/content.ts.
- Ensure every mutating action has explicit pending, success, and error state.
- Replace generic error-only messaging with actionable messages where possible.
- Keep existing component primitives (Button, Modal, EmptyState, LoadingSkeleton, Table) and tokenized classes.
- Preserve keyboard/focus accessibility and descriptive labels in forms and dialogs.
- Do not regress mobile behavior in modal forms and table actions.
- For notification settings, sync UI toggle state to backend truth (not local-only assumptions).

---

## 6) Risks and Edge Cases

1. Partial success risk:

- DB write succeeds but email/push fails.
- Mitigation: Treat notification channels as non-blocking post-commit operations with independent logging.

2. Cache shape mismatch:

- Cached payload returned as string/object inconsistently.
- Mitigation: Central decode helper before response serialization.

3. Loading deadlocks in UI:

- Early returns before state reset.
- Mitigation: mandatory finally path inside unified mutation helper.

4. Role scope drift:

- Invite/org writes bypass hierarchy constraints.
- Mitigation: central domain service validations shared by all relevant routes.

5. Missing RESEND_API_KEY in production/staging:

- Should not throw or block request lifecycle.
- Mitigation: explicit feature gating and non-fatal warning logs.

6. Push subscription drift:

- Browser subscription exists but backend lacks mapping.
- Mitigation: sync endpoint on toggle and periodic reconciliation check on profile load.

7. Logging sensitive data leakage:

- Debug payloads may include sensitive fields.
- Mitigation: redact secrets/passwords/tokens before logging.

---

## 7) Concrete Implementation Tasks

These tasks were appended to .ai-system/planning/task-queue.md:

- Consolidate API response contract for invite/profile/org CRUD routes using shared helpers.
- Introduce shared client mutation utility for API writes.
- Refactor InvitesPage/ProfilePage/OrgPage/InboxPage mutations to use consolidated mutation utility.
- Extract invite/profile/org write operations into domain services.
- Add request correlation IDs and structured logs for write routes.
- Add config-driven email template registry and shared email layout wrapper.
- Complete channel-orchestrated notification flow (in-app + email + push) with no-key fallback.
- Add persistent notification preference and push subscription APIs.
- Add regression tests for non-stuck loading and response/error handling on invite/profile/org CRUD.
- Add integration tests for RESEND_API_KEY present/absent behavior.
- Add diagnostics runbook section in .ai-system for tracing failures.

---

## 8) Required Architecture Doc Updates (system-architecture.md)

Update sections after implementation:

1. Data Flow

- Document unified write mutation flow and requestId tracing.

2. Module Breakdown

- Add api mutation utility, notification orchestrator, and email template registry modules.

3. Configuration Points

- Clarify required/optional notification env vars:
  - RESEND_API_KEY (optional but enables email channel)
  - EMAIL_FROM (optional override)
  - NEXT_PUBLIC_APP_URL (required for absolute links in emails)
  - NEXT_PUBLIC_VAPID_PUBLIC_KEY (required for push subscription)

4. Known Constraints and Technical Debt

- Note fallback behavior when RESEND_API_KEY is missing.
- Note push channel dependency on browser support and subscription persistence.

---

## Execution Notes For Cloud Session

- Follow .ai-system/agents/general-instructions.md ordering and update protocol.
- Implement in small vertical slices, validating each affected module before moving on.
- Keep all user-facing copy config-driven.
- Avoid introducing any new hardcoded route strings or role literals.
- Add or update tests alongside each migration slice.
- At completion: update task queue checkboxes, checkpoints/session-log.md, summaries/dev-history.md, and any changed architecture docs.

---

## Audit Addendum — 2026-04-04 (Post-cloud Incident Review)

### Confirmed Incident Symptoms

- Profile update requests intermittently returned 504 with non-JSON body observed by `apiMutation` as `invalid JSON response`.
- Org hierarchy bulk writes remained pending in browser/network until timeout, while DB mutations were eventually visible after page refresh.
- Push notification toggle showed OFF despite browser notification permission already granted, and ON toggle path could error.

### Root Causes Identified

1. Redis cache invalidation loop termination bug:

- `lib/data/redis.ts` compared scan cursor to numeric `0` only.
- Upstash scan cursor may return string `"0"`, causing non-terminating invalidation loops.

2. Blocking invalidation on write-path request critical path:

- Profile and org services awaited cache invalidation before responding.
- Combined with cursor bug, this produced request hang and upstream gateway timeouts.

3. Push state sync gap and toggle flow fragility:

- UI state initialization used only `getSubscription` and did not reliably reconcile existing browser subscription with backend state.
- Toggle ON path requested subscription without robustly handling already-subscribed state and missing VAPID key.

### Hotfixes Applied

- Fixed Redis invalidation cursor completion logic for both numeric and string terminal cursors.
- Optimized invalidation for non-glob exact keys to direct `DEL` (no SCAN).
- Added timeout wrapping around SCAN/DEL inside invalidation path.
- Switched profile/org/hierarchy write invalidations to non-blocking async invalidation.
- Corrected hierarchy bulk invalidation key targets for org list caches.
- Hardened push UI toggle flow:
  - Sync from browser permission + existing subscription.
  - Upsert existing subscription to backend when detected.
  - Guard missing `NEXT_PUBLIC_VAPID_PUBLIC_KEY` with explicit config-driven message.
  - Avoid duplicate subscribe path if subscription already exists.

### Remaining Validation Work (Required Before Declaring Stable)

- Add regression tests for Redis cursor termination and response completion timing.
- Add end-to-end UI regression coverage for profile/org immediate post-mutation updates.
- Add push sync matrix tests across permission/subscription/VAPID scenarios.
