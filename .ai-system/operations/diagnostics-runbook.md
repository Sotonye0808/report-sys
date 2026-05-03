# Diagnostics Runbook — Failed Operations

## Goal

Provide a fast path to trace write-operation failures across client and API layers.

## 1) Identify Request Correlation ID

- Check browser/network response headers for `x-request-id`.
- For client mutation failures, inspect console logs from `lib/utils/apiMutation.ts`:
  - `[apiMutation] request failed`
  - `[apiMutation] network failure`

## 2) Trace API-Side Structured Logs

- Search server logs by `requestId`.
- New write-path logs include route metadata and sensitive-field redaction via:
  - `lib/server/requestContext.ts`
  - `lib/utils/serverLogger.ts`

## 3) Expected Response Contract

All consolidated write routes return:

- Success: `{ success: true, data, requestId? }`
- Failure: `{ success: false, error, code, requestId? }`

If payload shape differs, route is not yet on the unified contract path.

## 4) Notification Channel Debugging

- In-app notifications: `lib/utils/notifications.ts` / `lib/utils/notificationOrchestrator.ts`
- Email channel:
  - Gated by `RESEND_API_KEY`
  - If key missing, email dispatch is skipped (non-fatal)
- Push channel:
  - Subscription persistence via `/api/notifications/push-subscriptions`
  - Preference state via `/api/notifications/preferences`

## 5) Common Environment Validation Blockers

- Lint: ESLint v9 flat config missing (`eslint.config.*`)
- Build in restricted network: Google Fonts fetch blocked
- Full test script: quoted glob resolution issue in current shell

Use targeted `npx tsx` test execution + `npm run typecheck` until tooling pass lands.

## 5b) Email Verification and Change Flow Diagnostics

- Readiness gate:
  - `RESEND_API_KEY`, `EMAIL_FROM`, and `NEXT_PUBLIC_APP_URL` must all be present.
  - If any is missing, email-send paths should skip safely and return non-fatal readiness flags.
- Token flow endpoints:
  - `POST /api/auth/email-verification/request`
  - `POST /api/auth/email-verification/confirm`
  - `GET /api/auth/email-verification/status`
  - `POST /api/auth/email-change/request`
  - `POST /api/auth/email-change/confirm`
- Verification landing route:
  - `/verify-email?token=<token>&mode=verify|change`

## 5c) Migration Drift Remediation Without Data Loss

- If reset is not allowed, do not run `prisma migrate reset`.
- Use non-destructive migration application first:
  - `npx prisma migrate deploy`
- If migration history and database state diverge, reconcile migration history explicitly with `prisma migrate resolve` (`--applied` or `--rolled-back`) before deploy.
- Validate final state with:
  - `npx prisma migrate status`

## 6) Known Incident Signature — Pending Writes + 504 + Non-JSON Error

Symptoms:

- Browser network tab shows write request pending for a long duration.
- UI remains in processing/loading state until timeout.
- Client logs include `[apiMutation] invalid JSON response` with status `504`.
- Data appears updated only after manual refresh.

Primary Cause (resolved hotfix on 2026-04-04):

- Redis invalidation scan loop used terminal check `cursor !== 0` only.
- Upstash can return terminal cursor as string `"0"`, causing loop continuation and blocking route completion.

Fast Verification:

1. Confirm route logs show request entered write handler and DB mutation completed.
2. Check if response was delayed before cache invalidation completion.
3. Verify `lib/data/redis.ts` includes string-and-number cursor completion check and exact-key fast path.

Mitigation Pattern:

- Keep cache invalidation non-blocking for write critical path where possible.
- Prefer async invalidation (`invalidatePatternAsync`) after successful DB commit.
- Use exact-key delete path for non-glob patterns to avoid full keyspace scan.

---

## Admin Config + Quick Forms + Imports + PWA + Activation

Added 2026-04-29.

### Admin Config namespace cache keys

- Redis key prefix: `hrs:adminConfig:ns:<namespace>`
- TTL controlled by `ADMIN_CONFIG_CACHE_TTL_SECONDS` (default 300s).
- Substrate gate: `ADMIN_CONFIG_DB_ENABLED=false` makes every loader read return the typed `config/*` fallback without touching DB or cache.
- A namespace with no DB row returns `source: "fallback"` and `version: 0`. After the first save, `version >= 1` and `source: "db"`.
- Optimistic-lock conflict: PUT returns HTTP `409` with body `code: 409, error: "Admin config conflict on namespace ..."`. Retry by GETting the namespace, re-applying edits, and re-PUTting with the new `version` as `baseVersion`.

### SUPERADMIN immutability

- Server side: `sanitiseRoleConfigPayload` strips overrides for SUPERADMIN's `label`, `dashboardMode`, `reportVisibilityScope`, `canManageAdminConfig`, `canManageUsers`, `canManageOrg`, `canLockReports` before write.
- If a SUPERADMIN appears demoted in a UI cache, force-reload the role config public endpoint (`/api/admin-config/public`) — the override on disk has been silently dropped on the immutable keys.

### Form assignment metric leak attempts

- Quick-fill writes are gated by `verifyMetricSubset`. Submitting a metric outside the assigned subset returns HTTP `403` with body `error: "Unauthorized metric ids: <list>"`.
- The same constraint is applied to the `submit: true` flow — a partial-submit cannot complete an assignment with metrics outside the subset.
- Diagnostic command (DB):
  ```sql
  SELECT id, "assigneeId", "reportId", "metricIds", "completedAt"
  FROM form_assignments
  WHERE id = '<assignmentId>';
  ```

### Import job inspection

- Per-row outcomes:
  ```sql
  SELECT outcome, count(*)
  FROM import_job_items
  WHERE "jobId" = '<jobId>'
  GROUP BY outcome;
  ```
- Validation summary lives at `import_jobs.validationSummary`, commit summary at `import_jobs.commitSummary`.
- A job stuck in `VALIDATED` is normal — commit must be triggered explicitly via `POST /api/imports/[id]/commit`.

### Activation token diagnostics

- Tokens are stored hashed (SHA-256). One-time use: `usedAt` is set on success.
- `expiresAt` is `now + ACTIVATION_TOKEN_TTL_HOURS` (default 72h).
- A reused or expired token returns HTTP `400` with body `error: "Activation link ..."`. Surface this directly to the user — the right CTA is "ask your admin to send a new activation link", not "retry".

### PWA install dismissal

- Per-device suppression: `localStorage["hrs:pwa:dismissal"]` (JSON array of `{kind, platform, mode, nextEligibleAt}`).
- Per-user cross-device suppression: `pwa_prompt_dismissals` table, unique on `(userId, kind, platform)`.
- Re-engagement window: `PWA_BANNER_REENGAGE_DAYS` (default 14). `mode: never` suppresses indefinitely until the user clears it.

### Hierarchy CRUD

- After saving the `hierarchy` namespace, all callers of `resolveHierarchyLevels()` see the new shape on the next loader read (cache TTL caps the propagation delay at `ADMIN_CONFIG_CACHE_TTL_SECONDS`).
- The fallback (`ORG_HIERARCHY_CONFIG`) is still the GROUP → CAMPUS structure. If the override is malformed (missing `level` or `label`), the loader silently rejects the entry — diff via `diffAgainstFallback("hierarchy")` to spot drift.

---

## Role Cadence + Recurring Assignments + Aggregated Quick-Views + Correlation Analytics

Added 2026-04-30.

### Materialise endpoint idempotency

- USHER landing page calls `POST /api/form-assignments/materialise` on mount.
- Server expands every active `FormAssignmentRule` matching the user (by id, or by role + scope) into per-period `FormAssignment` rows keyed on `(ruleId, assigneeId, periodKey)`.
- Repeat calls within the same period return the same rows — no duplicates. If you see duplicates, check that the `periodKey` column was populated on the existing rows.
- Diagnostic:
  ```sql
  SELECT "ruleId", "periodKey", count(*)
  FROM form_assignments
  WHERE "assigneeId" = '<userId>'
  GROUP BY "ruleId", "periodKey" HAVING count(*) > 1;
  ```

### Quick-view probe cache

- `GET /api/reports/[id]/quick-views` returns counts only — never writes.
- Cache key: `quickViews:<reportId>:<role>` for 60 seconds.
- If the bar shows stale source counts, wait out the TTL or `DEL` the key in Redis.

### Insight algorithm thresholds

- `INSIGHTS_PEARSON_MIN_SAMPLES` (default 5): below this, Pearson returns null and no correlation is rendered.
- `INSIGHTS_TOP_MOVER_WINDOW_PERIODS` (default 4): how many recent periods feed the per-campus delta.
- `INSIGHTS_ENABLED=false` disables every insight surface globally.

### Cadence + auto-fill

- `roleCadence` admin-config namespace overlays `ROLE_CONFIG.cadence`. SUPERADMIN is filtered out — no cadence applies.
- `ReportNewPage` reads template's `recurrenceFrequency` + `autoFillTitleTemplate` to pre-fill period and title; both remain editable.
- If auto-fill silently drops a placeholder, the template references a key not on the allowlist (`{campus}`, `{group}`, `{period}`, `{weekNumber}`, `{monthName}`, `{quarter}`, `{year}`).

### Migration safety

- Migration `20260430120000_role_cadence_recurring_assignments_correlation` is strictly additive: every column uses `ADD COLUMN IF NOT EXISTS … DEFAULT …`; the new `form_assignment_rules` table is `CREATE TABLE IF NOT EXISTS`; FK constraints are guarded with `EXCEPTION WHEN duplicate_object`.
- `test/migrationAdditiveSafety.test.ts` regresses this — never relax the forbidden-pattern list without a written exception.

---

## Superadmin Role Impersonation / Preview

Added 2026-05-01.

### Trace an impersonated mutation

- Cookie name: `hrs_impersonation` (`IMPERSONATION_COOKIE_NAME`).
- Token JWT carries `audience: "impersonation"` and is signed with `JWT_SECRET`.
- Every concrete mutation under impersonation is mirrored as a `MUTATION_APPLIED` row in `impersonation_events`. SQL:
  ```sql
  SELECT s.id, s."superadminId", s."impersonatedRole", s.mode,
         e.type, e.path, e.method, e.status, e."createdAt"
  FROM impersonation_sessions s
  JOIN impersonation_events e ON e."sessionId" = s.id
  WHERE s."superadminId" = '<userId>'
  ORDER BY e."createdAt" DESC
  LIMIT 100;
  ```

### Force-end a stuck session

- The cookie is HttpOnly + Secure + SameSite=Lax — it expires automatically at TTL.
- To revoke server-side immediately:
  ```sql
  UPDATE impersonation_sessions
  SET "endedAt" = now(), "endedReason" = 'TOKEN_INVALIDATED'
  WHERE id = '<sessionId>' AND "endedAt" IS NULL;
  ```
- The next `loadActiveSession()` will detect the row is ended and clear the cookie.

### Read-only gate response

- Blocked mutations return HTTP 403 with body `{ success: false, error, code: "impersonation_readonly" }`.
- Allowlist (does not block under READ_ONLY): `/api/notifications/[id]/read`, `/api/notifications/read-all`, `/api/impersonation/{stop,me}`, `/api/auth/{me,refresh,logout}`.
- Each block writes a `MUTATION_BLOCKED` event into the session log (path + method + status).

### Toggles

- `IMPERSONATION_ENABLED=false` disables the feature entirely. `loadActiveSession()` returns null and `startSession()` throws `ImpersonationDisabledError`.
- `IMPERSONATION_TTL_MINUTES` (default 30) caps any session length. Sessions past `expiresAt` are auto-ended on the next `loadActiveSession()` call.

### Migration safety

- Migration `20260501120000_impersonation_sessions` is strictly additive: every enum guarded with `EXCEPTION WHEN duplicate_object`; tables use `CREATE TABLE IF NOT EXISTS`; FK constraints guarded the same way.
- `test/impersonationMigrationAdditiveSafety.test.ts` regresses this — never relax the forbidden-pattern list without a written exception.

---

## Quick-Form Rules + Auto-Total + Week-on-Week + Comparison surfaces

Added 2026-05-02.

### Quick-form rule editor

- UI: `/templates/[id]?tab=assignments` (TemplateAssignmentsEditor).
- API: `GET /api/form-assignment-rules?templateId=...&role=...`, `POST`, `PATCH /:id`, `DELETE /:id`.
- Validation rejects:
  - empty `metricIds`
  - metric ids that don't belong to the template
  - campus-scoped roles without a `campusId` (USHER, CAMPUS_*, DATA_ENTRY)
  - group-scoped roles without `orgGroupId` or `campusId` (GROUP_*)
- Materialise (USHER landing on `/quick-form`) reads these rules and creates per-period `FormAssignment` rows + report shells idempotently.

### Auto-total metric

- Server is source of truth: `recomputeAutoTotals` runs on report PATCH and on `ensureReportShell`.
- Validation at template save (`POST/PUT /api/report-templates/[id]`): rejects chains (auto-total → auto-total), self-references, and SECTION-scoped totals that pull from another section.
- The auto-total cell carries `isLocked: true`; the form renders it read-only with an "AUTO" tag and the auto-generated comment in the tooltip.
- Diagnostic: a recomputed total comment matches the regex `^Auto-total of /` followed by the source names, sorted alphabetically.

### Week-on-Week

- Opt-in per metric via `capturesWoW: true`.
- `attachWeekOnWeekContext` runs in `GET /api/reports/[id]` only when the template has at least one WoW metric AND the period is weekly.
- Prior-week lookup keyed on `(campusId, templateId, periodYear, periodWeek - 1)`. ISO week 1 wraps to last week of prior year.
- Non-blocking: if no prior-week report exists, `wowGoal` is `null` and the form indicator hides.
- The indicator in `ReportSectionsForm` reads `values.wowGoal` / `values.wowAchieved` directly from the payload — no extra round trip.

### Smart selects

- `MetricSelect` builds grouped options (template → section → metric); out-of-list values render as "Custom: <id>" so legacy refs still display.
- `CorrelationGroupSelect` reads existing groups from the current template draft (`sections` prop) and offers `+ Create group "X"` as the last option.
- Imports wizard's per-column "Target" picker uses the same grouped pattern with `optionFilterProp="label"` for search.

### Chart x-axis polish

- `chartUtils.RotatedTick` rotates labels longer than `maxChars` (default 14) and embeds the full label in `<title>`.
- Migrated CampusBreakdown chart to it. To migrate a new chart, set `<XAxis tick={<RotatedTick maxChars={14} />} interval={0} height={56} />` and add `margin={{ bottom: 40 }}` to the chart so labels don't overflow.

### Comparison surfaces

- `/analytics → Compare metrics` and `/analytics → Compare reports` are new tabs. Both reuse the analytics page's already-loaded report list (no new fetches).
- Pearson is gated by min-samples (5); below that the matrix shows `n/a (need ≥ 5 samples)` rather than misleading numbers.
- Insight sentences only appear for pairs with `|r| ≥ 0.5`.
