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

