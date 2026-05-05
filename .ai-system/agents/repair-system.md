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

### Impersonation / Preview

**SUPERADMIN previewing a campus-scoped role sees an empty Quick-Form list even though rules + assignees exist**

- Symptom: SUPERADMIN starts impersonation as USHER (or other campus/group-scoped role) WITHOUT picking a target user, opens `/quick-form`, sees zero assignments. Server logs show no errors.
- Root cause: `verifyAuth` resolves `auth.user.campusId = impersonatedScope.campusId ?? userProfile.campusId`. When no target user is picked, `impersonatedScope` is empty and SUPERADMIN's own profile typically has no campus. The materialiser (`recurringAssignmentService.materialiseAssignmentsForUser`) then short-circuits at `if (!campusId || !orgGroupId) continue;` — silently skipping every rule, regardless of whether `rule.campusIds` is empty (apply-to-all) or restricted.
- Fix: `ImpersonationStartDialog` now requires a target user when the impersonated role is in `CAMPUS_SCOPED_ROLES` or `GROUP_SCOPED_ROLES`. The submit is blocked with an inline error. `QuickFormLandingPage` additionally renders a friendly amber banner detecting "previewing without campus context" so legacy active sessions surface the gap instead of looking empty.
- Prevention: any future preview surface that relies on `auth.user.campusId` / `auth.user.orgGroupId` should null-coalesce to the same diagnostic banner pattern; the `auth.user.impersonation` field is the canonical detector.

---

### `/how-it-works` build-time prerender bails out

- Symptom: `npm run build` fails with `useSearchParams() should be wrapped in a suspense boundary at page "/how-it-works"`. Stack trace points into the prerender pipeline. Build worker exits with code 1.
- Root cause: the `<HowItWorksPage />` client component uses `useSearchParams` for the `?tab=` deep-link contract. Next 16's static-export contract requires every client component using that hook to live inside a `<Suspense>` boundary so prerender can bail to a fallback when the search-params snapshot is unknown.
- Fix: wrap the consumer in `<Suspense fallback={<LoadingSkeleton rows={6} />}>` inside `app/how-it-works/page.tsx` (already shipped).
- Prevention: any future server route mounting a client child that uses `useSearchParams` / `useRouter` / `usePathname` should wrap it at the seam. Dev mode tolerates the missing boundary; only `npm run build` catches it.

---

### Template builder UI changes only land on one of the two flows

- Symptom: a UX refactor of `TemplateDetailPage` (edit flow) ships clean, but `TemplateNewPage` (create flow) still shows the old UI. Caught 2026-05-04 when the Forms-style simplification — inline borderless name inputs, hidden settings palette, settings cog — only appeared on edit.
- Root cause: `TemplateNewPage.tsx` and `TemplateDetailPage.tsx` each maintain their own copy of `MetricRow`, the section-Collapse rendering, and the section settings panel. They were structured as siblings rather than around a shared builder component, so any change has to be ported twice. The header doc-comment in `TemplateNewPage` even reads "Mirrors TemplateDetailPage architecture" — i.e. duplication-by-design.
- Fix (immediate, 2026-05-04): patched both files to apply the same simplified pattern.
- Fix (durable, queued in task-queue.md → Backlog → "Template builder — extract shared `<TemplateBuilder>` component"): extract a single `<TemplateSectionsEditor>` that both pages render. Their own concerns stay focused on form metadata + save handlers + draft persistence + breadcrumbs.
- Prevention: never add a third copy of the builder. The new shared module is the canonical place for any future builder change. Pages with a doc-comment that says "Mirrors X architecture" are a smell — that comment should always link back to the shared component.

---

### Mutation routes silently bypassing the impersonation read-only gate

- Symptom: a new mutation route ships without going through `verifyAuth(req)`, so the impersonation chokepoint can't fire and a SUPERADMIN in `READ_ONLY` mode silently mutates real data.
- Fix: `npm run check:mutation-auth` (script `scripts/check-mutation-auth.ts`) statically scans every `app/api/**/route.ts` for `POST/PUT/PATCH/DELETE` exports and fails the build if any of them lacks a `verifyAuth(` call. Routes that are intentionally public (auth lifecycle: login / logout / refresh / register / forgot-password / reset-password / activate / email-verification confirm / email-change confirm) opt out via the file-level `// @public-mutation` annotation.
- Prevention: wire `npm run check:mutation-auth` into CI — running before `tsc --noEmit` is enough. The 9 existing public auth routes are already tagged.

---

## Resolved Errors Archive

> **Section summary:** Errors that have been fully resolved and are unlikely to recur. Kept for reference.

[Entries move here when the underlying cause has been permanently fixed]

## Form-assignment rule editor 400 on Add (USHER seed + scope coherence)

**Symptom:**
Clicking "Add assignment rule" in `/templates/[id]?tab=assignments` returned `POST /api/form-assignment-rules 400 Bad Request`.

**Root Cause:**
The editor seeded `role: USHER` on the create payload. USHER is in `CAMPUS_SCOPED_ROLES`, and `lib/data/formAssignmentRule.ts → validate` requires `campusId` for campus-scoped roles. The seed did not include a campus, so the server threw `FormAssignmentRuleValidationError("Role USHER is campus-scoped — campusId is required")`.

**Fix Applied:**
- Switched the editor to a deferred-create flow. "Add" now creates a CLIENT-side draft (`id: "draft-…"`) instead of POSTing immediately. The draft surfaces a "Save rule" button that only fires once the rule is coherent (role + metrics + scope).
- Added `isDraftReady` mirror of the server validator so users see the same friendly error inline before the request goes out.

**Prevention:**
Defer create calls until the payload satisfies server-side coherence checks. Surface inline validation that mirrors the server's rejection reasons.

**Files Affected:**
- `modules/templates/components/TemplateAssignmentsEditor.tsx`

**Date:** 2026-05-03

## CorrelationGroupSelect: empty options + overflow

**Symptom:**
The correlation-group select in the template editor showed no options (even when the user wanted to create a new group) and rendered far wider than its parent grid cell, breaking the layout.

**Root Cause:**
- `+ Create group "X"` only surfaced when the user typed AND the typed value wasn't already in the list. With no existing groups, the dropdown looked empty and the create affordance was undiscoverable.
- The component had no default width style, so AntDesign's Select shrank to its content width inside a flex/grid cell.
- Saved out-of-list values (legacy free-text rows) rendered as bare ids because they weren't in the option list.

**Fix Applied:**
- Default `style: { width: "100%" }` (caller can override).
- `notFoundContent` shows "Type a name to create a new correlation group" so the create affordance is discoverable from an empty state.
- The current `value` is included in the options when not present in the suggestion set, with a "(custom)" suffix.
- `popupMatchSelectWidth={false}` so long group names aren't truncated in the dropdown.

**Prevention:**
For free-text-with-suggestion selects: always include the current value in the options, default to full-width, and surface the create affordance from the empty state — not just on type.

**Files Affected:**
- `modules/templates/components/CorrelationGroupSelect.tsx`

**Date:** 2026-05-03

## Auto-sum configurator placement (per-metric → section-level)

**Symptom:**
Auto-total toggle + source picker lived inside each `MetricRow`. Created visual clutter on data metrics, hid auto-sums in the metric list, and made it awkward to define multiple totals per section or cross-section sums.

**Root Cause:**
Initial implementation co-located the configuration with the metric it produced. That mirrored the data model (each auto-sum IS a `ReportTemplateMetric`) but didn't match the operator's mental model (totals are a section-level concept).

**Fix Applied:**
- Stripped the auto-total block from `MetricRow`.
- Added `AutoSumPanel` per section: lists existing auto-sums (filtered from `section.metrics` where `isAutoTotal: true`), exposes "+ Add auto-sum" with a suggested name (`Total <SectionName>`), and lets each row pick scope (Same section / Cross-section) + sources (powered by grouped MetricSelect-style options).
- Filter `MetricRow` rendering to non-auto-total metrics so data metrics and totals don't co-mingle in the same list.
- Data model unchanged — auto-sums are still `ReportTemplateMetric` rows with `isAutoTotal: true`. Server-side recompute and validation are unaffected.

**Prevention:**
When a configuration concept has cardinality `>1` per parent and a different mental model, surface it in a dedicated panel attached to the parent, not inline on each child.

**Files Affected:**
- `modules/templates/components/TemplateDetailPage.tsx`

**Date:** 2026-05-03

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

**Date:** 2026-04-04

## Prisma migration drift with no-reset constraint

**Symptom:**
`prisma migrate dev` cannot proceed and suggests reset when migration history/drift checks fail, but environment policy disallows data loss.

**Root Cause:**
`migrate dev` performs shadow-database drift detection and may block in non-pristine environments; this can happen even when pending migrations are valid for deployment.

**Fix Applied:**

- Applied pending migrations non-destructively with `prisma migrate deploy`.
- Verified final state with `prisma migrate status` showing database schema up to date.

**Prevention:**

- Use `migrate deploy` for data-safe environments where reset is not permitted.
- Reserve `migrate dev` for development workflows where reset is explicitly acceptable.
- If history reconciliation is needed, use `prisma migrate resolve` instead of reset.

**Files Affected:**

- `prisma/migrations/*`
- `.ai-system/operations/diagnostics-runbook.md`

**Date:** 2026-04-21

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

## Aggregation no-data path returned generic 500

**Symptom:**
Aggregation preview/generate returned payloads like `success: false`, `error: "No reports found for the selected scope and period."`, `code: 500` for valid requests with zero matches.

**Root Cause:**
The aggregation service threw a generic `Error` for no-data conditions, and route-level handling fell through to `handleApiError`, which maps unknown errors to `500`.

**Fix Applied:**

- Added typed domain error `AggregationNoReportsError` in `lib/data/reportAggregation.ts`.
- Updated `app/api/reports/aggregate/route.ts` to map:
  - `AggregationNoReportsError` → `notFoundResponse` (`404`)
  - `zod` validation errors → `badRequestResponse` (`400`)

**Prevention:**

- Treat expected business no-data outcomes as typed domain errors.
- Handle domain/validation errors before calling generic API error wrappers.

**Files Affected:**

- `lib/data/reportAggregation.ts`
- `app/api/reports/aggregate/route.ts`

**Date:** 2026-04-05

## Prisma interactive transaction expiry in org hierarchy bulk writes

**Symptom:**
Hierarchy bulk mutation requests failed with errors like `Transaction already closed` / `A commit cannot be executed on an expired transaction`, often after about 5000ms, resulting in `500` responses.

**Root Cause:**
`app/api/org/hierarchy/bulk/route.ts` executed a long mixed create/update/delete loop inside a single interactive transaction without chunking and without explicit timeout override, causing transaction expiry under larger payloads.

**Fix Applied:**

- Refactored hierarchy bulk processing to use chunked execution (`runBulkTransaction`) instead of one monolithic transaction loop.
- Applied per-chunk Prisma transaction timeout policy (`15000ms`).
- Added request payload-size guard (`validateBulkPayloadLimit`) before execution.

**Prevention:**

- For bulk endpoints, always use chunked transaction helpers with explicit timeout policy.
- Enforce payload size and max item limits at route boundary.
- Avoid long interactive transactions that mix heterogeneous operations in one loop.

**Files Affected:**

- `app/api/org/hierarchy/bulk/route.ts`

**Date:** 2026-04-09

## Hierarchy bulk modal drafts overwritten on open

**Symptom:**
Users lost unsent hierarchy bulk edits when reopening the modal because the editor was always reseeded from live hierarchy data, overriding locally restored draft content.

**Root Cause:**
Modal open flow unconditionally reset `interactiveBulk`, `interactiveGroups`, `bulkText`, and `bulkDryRun`, bypassing the shared draft-restore behavior used by other forms.

**Fix Applied:**

- Wired hierarchy bulk state to shared `useFormPersistence` draft hook.
- Updated open-modal behavior to seed defaults only when editor state is effectively empty.
- Added `FormDraftBanner` clear/reset action to let users intentionally discard draft and reseed.

**Prevention:**

- Any form/modal using local draft restoration should avoid unconditional state reset on open.
- Prefer a single restore-aware seeding helper and explicit user-triggered reset action.

**Files Affected:**

- `modules/org/components/OrgPage.tsx`

**Date:** 2026-04-09

## Form-assignment rule rejected with 400 for campus-scoped roles

**Symptom:**
Creating a quick-form rule for a campus-scoped role (e.g. USHER) returned `400 Bad Request` even though templates are platform-scoped. The validator forced a single `campusId` on every campus-bound role, but admins reasonably expect to define a rule that fans out across all campuses (or a hand-picked subset).

**Root Cause:**
`lib/data/formAssignmentRule.ts → validate` required `campusId` whenever `role` was in `CAMPUS_SCOPED_ROLES`. UI seeded role=USHER as the default so the very first POST always failed coherence.

**Fix Applied:**
- Added additive `campusIds String[] @default([])` and `orgGroupIds String[] @default([])` columns to `form_assignment_rules` (migration `20260503120000_form_assignment_rule_multi_scope`).
- Removed the campus-required check from the validator; templates are platform-scoped and the materialiser keys reports off the user's own campus.
- New `ruleMatchesUser` helper: empty arrays + null legacy fields ⇒ rule applies to every campus / group; otherwise the user's own scope must intersect.
- UI editor switched to a multi-select per scope with placeholder **"Leave empty to apply to all campuses"**; PATCH body sends `campusIds`/`orgGroupIds` arrays and clears the legacy single-value column to avoid drift.

**Prevention:**
- When a model column expresses "scope", default to an array semantic (`empty = unbounded`). A single nullable scalar invites the wrong validator.
- Validator coherence checks must respect that templates and rules can be platform-scoped even when target roles are campus-bound — the user supplies their own campus at materialise time.

**Files Affected:**
- `prisma/schema.prisma`
- `prisma/migrations/20260503120000_form_assignment_rule_multi_scope/migration.sql`
- `lib/data/formAssignmentRule.ts`
- `lib/data/recurringAssignmentService.ts`
- `app/api/form-assignment-rules/route.ts`
- `app/api/form-assignment-rules/[id]/route.ts`
- `modules/templates/components/TemplateAssignmentsEditor.tsx`
- `types/global.ts`

**Date:** 2026-05-03

## Form-assignment editor active toggle stretched to full width

**Symptom:**
The "Active" Switch in the rule editor rendered with the full grid-column width instead of its compact pill, breaking the row's visual rhythm.

**Root Cause:**
The Switch sat directly inside a `flex flex-col` grid cell and inherited the cell's stretch behaviour. AntD's Switch is `display: inline-flex` by default, but inside a flex column it stretches.

**Fix Applied:**
Wrapped the Switch in a `<div className="flex items-center h-8">` so the Switch keeps its intrinsic width and the row keeps a consistent input-row height.

**Prevention:**
Inline controls that should keep their intrinsic width inside a flex column must be wrapped in an inline-flex anchor. Linting/visual review on any new Switch placed inside a flex/grid cell.

**Files Affected:**
- `modules/templates/components/TemplateAssignmentsEditor.tsx`

**Date:** 2026-05-03
