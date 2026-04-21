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
