# Repair System — Error Knowledge Base

> **Overview:** A living knowledge base of errors encountered during development, their root causes, and how they were fixed. Agents should consult this before diagnosing new errors. Every fixed bug should be logged here to prevent recurrence.

---

## How to Use This File

- **Before debugging:** Search this file for patterns matching your current error
- **After fixing a bug:** Add an entry using the template at the bottom
- **Agents:** Reference this during the fix-build and self-heal cycles

---

## Error Log

> **Section summary:** Each error entry includes the symptom, cause, fix, and prevention strategy. Entries are added chronologically.

---

### [TEMPLATE — copy this for each new error]

```
## [Error Title / Short Description]

**Symptom:**
[What the developer or user sees — error message, broken behaviour, etc.]

**Root Cause:**
[The actual technical reason this happened]

**Fix Applied:**
[What change was made to resolve it]

**Prevention:**
[How to avoid this in future — pattern, lint rule, architecture change, etc.]

**Files Affected:**
[List of files that were changed]

**Date:** [YYYY-MM-DD]
```

---

## Known Error Patterns

> **Section summary:** Recurring error categories seen in this tech stack. Agents should check this section when they match the pattern before investigating further.

### React / Next.js

**Hydration Mismatch**

- Symptom: `Hydration failed because the initial UI does not match what was rendered on the server`
- Cause: Browser-only logic (window, localStorage, Date.now()) running during server render
- Fix: Wrap in `useEffect` or use `dynamic(() => import(...), { ssr: false })`
- Prevention: Never access browser APIs outside useEffect in components

**Missing Key Prop**

- Symptom: `Each child in a list should have a unique "key" prop`
- Cause: `.map()` rendering without a stable unique key
- Fix: Add `key={item.id}` — use a stable unique ID, not the array index

---

### Node.js / Backend

**Unhandled Promise Rejection**

- Symptom: Server crashes silently or logs `UnhandledPromiseRejectionWarning`
- Cause: async function missing try/catch, or `.catch()` not attached to promise
- Fix: Wrap async route handlers in try/catch, use an async error middleware
- Prevention: Always use a global async error wrapper for Express routes

**Database Connection Pool Exhausted**

- Symptom: Requests hang indefinitely under load
- Cause: Connection pool limit too low or connections not being released
- Fix: Increase pool size in config, ensure `client.release()` in finally blocks
- Prevention: Always release DB connections in finally, not just success path

---

### Configuration / Environment

**Missing Environment Variable**

- Symptom: `undefined` values in production, features silently broken
- Cause: Variable defined in `.env.local` but not in production environment
- Fix: Add to deployment environment variables and validate on startup
- Prevention: Add a startup validation check that throws if required env vars are missing

---

## Resolved Errors Archive

> **Section summary:** Errors that have been fully resolved and are unlikely to recur. Kept for reference.

[Entries move here when the underlying cause has been permanently fixed]

## Resend client initialization during build

**Symptom:**
Next.js build fails while collecting page data for `/api/auth/forgot-password` with runtime error `Missing API key. Pass it to the constructor new Resend("re_123")`.

**Root Cause:**
`lib/email/resend.ts` instantiated `new Resend(process.env.RESEND_API_KEY)` at module load, causing throw in build env with no key.

**Fix Applied:**

- `resend` is now created conditionally: `process.env.RESEND_API_KEY ? new Resend(...) : null`
- `sendEmail` now checks both API key and `resend` instance before sending email.

**Prevention:**

- Defer third-party client initialization behind environment validation.
- Normalize module behavior for missing credentials (no throw in module scope).

**Files Affected:**

- `lib/email/resend.ts`

**Date:** 2026-03-20

## Prisma import in report workflow

**Symptom:**
Deploy preview raised an error with `@prisma/client` import from `modules/reports/services/reportWorkflow.ts`.

**Root Cause:**
`reportWorkflow.ts` was referencing `Prisma.InputJsonValue` from `@prisma/client`; imported path not used elsewhere and caused mismatch in codebase style.

**Fix Applied:**

- Removed `import { Prisma } from "@prisma/client"`.
- Changed `sections` cast to `any` so workflow logic remains functional without direct Prisma type import.

**Prevention:**

- Prefer DB client abstractions or local JSON wrapper types for shared service code.

**Files Affected:**

- `modules/reports/services/reportWorkflow.ts`

**Date:** 2026-03-20

## Typescript import extension issue in tests

**Symptom:**
`npx tsc --noEmit` fails with `TS5097` for `../modules/reports/services/reportWorkflowUtils.ts` import path.

**Root Cause:**
TypeScript project doesn't allow `*.ts` extension in import paths.

**Fix Applied:**

- Updated `test/reportWorkflow.test.ts` to import `../modules/reports/services/reportWorkflowUtils`.

**Prevention:**

- Avoid explicit `.ts` extensions in import statements in TypeScript files unless `allowImportingTsExtensions` is enabled.

**Files Affected:**

- `test/reportWorkflow.test.ts`

**Date:** 2026-03-20

## ESLint v9 flat-config mismatch in local validation

**Symptom:**
`npm run lint` fails immediately with: `ESLint couldn't find an eslint.config.(js|mjs|cjs) file`.

**Root Cause:**
Project uses ESLint v9 but repository still relies on legacy `.eslintrc` expectations.

**Fix Applied:**

- No code-path workaround in feature slices; documented as pre-existing validation blocker during production-readiness implementation.

**Prevention:**

- Add `eslint.config.mjs` and migrate existing lint rules to flat config before enforcing lint in CI/local mandatory checks.

**Files Affected:**

- `package.json` (script invocation impacted)

**Date:** 2026-04-04

## Build failure in sandbox due blocked Google Fonts fetch

**Symptom:**
`npm run build` fails in restricted environment when `next/font` cannot fetch `Inter` and `JetBrains Mono`.

**Root Cause:**
Sandbox networking blocks Google Fonts origin used at build time by Next.js font optimization.

**Fix Applied:**

- No app-code behavior change in this slice; validated with targeted typecheck/tests and documented environment limitation.

**Prevention:**

- Use local font assets or `next/font/local` for fully offline/restricted build compatibility in CI/sandbox contexts.

**Files Affected:**

- `app/layout.tsx` (font import surface)

**Date:** 2026-04-04

## `npm run test` glob resolution mismatch

**Symptom:**
`npm run test` fails with `ERR_MODULE_NOT_FOUND` for literal path `test/**/*.test.ts`.

**Root Cause:**
Quoted glob is passed as a literal path to `tsx` under this shell/runtime combination.

**Fix Applied:**

- Used targeted `npx tsx <file>` execution for new regression tests during this slice; script-level fix deferred.

**Prevention:**

- Update test script to shell-agnostic glob expansion strategy (e.g., unquoted glob or node test runner integration).

**Files Affected:**

- `package.json` (test script behavior)

**Date:** 2026-04-04

## Pending write requests caused by Redis cursor termination mismatch

**Symptom:**
Profile and org hierarchy write operations stayed in pending state, UI remained in loading/processing, and client logs showed non-JSON 504 failures. Data appeared after manual refresh.

**Root Cause:**
`cache.invalidatePattern` loop termination compared cursor against numeric `0` only. Upstash scan can return terminal cursor as string `"0"`, causing non-terminating invalidation loops. Because some write routes awaited invalidation, responses timed out.

**Fix Applied:**

- Updated `lib/data/redis.ts` to treat both `0` and `"0"` as terminal cursors.
- Added exact-key optimization (direct `DEL`) for non-glob invalidation requests.
- Added timeout wrapping for scan/delete operations in invalidation path.
- Switched profile/org/hierarchy write invalidations to async non-blocking invalidation where safe.

**Prevention:**

- Never assume Redis scan cursor type; handle string/number terminal values.
- Keep cache invalidation off the critical response path for user-facing writes.
- Add regression tests covering cursor terminal type variants.

**Files Affected:**

- `lib/data/redis.ts`
- `modules/users/services/profileService.ts`
- `modules/org/services/orgWriteService.ts`
- `app/api/org/hierarchy/bulk/route.ts`

**Date:** 2026-04-04

## Push notification toggle mismatch with browser-enabled notifications

**Symptom:**
Push toggle appeared off even when browser notification permission was already granted. Toggling on could fail with generic error.

**Root Cause:**
UI initialization did not fully reconcile browser permission + existing push subscription + backend persistence state. Enable flow also did not robustly handle existing subscriptions or missing VAPID key.

**Fix Applied:**

- Added browser-state sync path in profile notifications tab.
- If subscription already exists, upsert backend record instead of forcing a new subscribe.
- Added explicit guard/message for missing `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- Converted VAPID key to `Uint8Array` for subscribe call compatibility.

**Prevention:**

- Treat push enabled state as `permission === granted` AND `subscription exists`.
- Reconcile backend subscription state on UI load.
- Validate VAPID env before attempting subscription creation.

**Files Affected:**

- `modules/users/components/ProfilePage.tsx`
- `config/content.ts`

**Date:** 2026-04-04
