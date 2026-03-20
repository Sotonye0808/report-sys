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
