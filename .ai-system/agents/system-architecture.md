# System Architecture

> **Overview:** Harvesters Reporting System is a full-stack Next.js (App Router) application built for church leadership reporting, analytics, and workflows. It combines a modular frontend surface (feature modules under `modules/`) with a lightweight server-side API layer powered by Next.js Route Handlers, Prisma-backed persistence, and optional offline support via a service worker.

---

## Architecture Diagram

> **Section summary:** Text-based overview of system layers and how they connect.

```
Browser (React + Ant Design UI)
        ↓ (HTTP / fetch)
Next.js App Router (app/ + server actions)
        ↓ (Route handlers)
API Layer (app/api/*) → Auth / Reports / Users / Org / Notifications / Assets
        ↓
Business logic (modules/* + config/* + lib/utils)
        ↓
Data layer (Prisma client + Redis cache + query services)
        ↓
PostgreSQL (via Prisma)  /  Upstash Redis  /  Resend email
```

---

## Module Breakdown

> **Section summary:** Each module listed here has a single defined responsibility. Agents should not modify a module's scope without updating this document.

| Module              | Responsibility                                                                        | Key Files                                                                                                                   | Dependencies                                            |
| ------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `app/`              | Next.js routes, layouts, and API handlers                                             | `app/layout.tsx`, `app/page.tsx`, `app/api/*`, `app/(dashboard)/*`                                                          | `providers/*`, `modules/*`, `config/*`, `lib/*`         |
| `components/ui/`    | Shared UI primitives and composable building blocks                                   | `components/ui/*`                                                                                                           | `antd`, tokens/content config                           |
| `providers/`        | Theme, UI framework, and auth context composition                                     | `providers/ThemeProvider.tsx`, `providers/AntdProvider.tsx`, `providers/AuthProvider.tsx`                                   | `next-themes`, `antd`, `lib/utils/api`                  |
| `config/`           | Routes, roles, navigation, report settings, and copy                                  | `config/routes.ts`, `config/nav.ts`, `config/roles.ts`, `config/reports.ts`, `config/content.ts`                            | `types/global.ts`                                       |
| `modules/reports`   | Report workflows, detail/edit/analytics/aggregation UI, workflow services             | `modules/reports/components/*`, `modules/reports/services/reportWorkflow.ts`                                                | `lib/data`, `lib/utils`, `config/*`                     |
| `modules/analytics` | Analytics pages/charts and chart utility logic                                        | `modules/analytics/components/AnalyticsPage.tsx`, `modules/analytics/chartUtils.ts`                                         | `lib/utils/exportReports`, `app/api/analytics/*`        |
| `modules/org`       | Group/campus hierarchy management, write operations, and rollup scope context helpers | `modules/org/components/OrgPage.tsx`, `modules/org/services/orgWriteService.ts`, `modules/org/services/orgRollupContext.ts` | `lib/data`, `lib/utils`, `config/*`                     |
| `lib/data/`         | Prisma/Redis data boundary and query helpers                                          | `lib/data/prisma.ts`, `lib/data/db.ts`, `lib/data/redis.ts`, `lib/data/reportAggregation.ts`                                | `prisma/generated`, `@upstash/redis`                    |
| `lib/assets/`       | Managed Cloudinary upload session lifecycle and cleanup                               | `lib/assets/cloudinaryAdapter.ts`, `lib/assets/lifecycleService.ts`, `lib/assets/lifecycleStateMachine.ts`                  | `app/api/assets/*`, `app/api/bug-reports/*`, `prisma/*` |
| `lib/server/`       | Request context metadata (request IDs, route context)                                 | `lib/server/requestContext.ts`                                                                                              | `app/api/*`                                             |
| `lib/utils/`        | API envelope helpers, logging, mutation lifecycle, offline, notifications             | `lib/utils/api.ts`, `lib/utils/serverLogger.ts`, `lib/utils/apiMutation.ts`, `lib/utils/notificationOrchestrator.ts`        | `modules/*`, `app/api/*`                                |
| `lib/email/`        | Resend delivery and templated email generation                                        | `lib/email/resend.ts`, `lib/email/templates/registry.ts`                                                                    | `resend`, `config/content.ts`                           |
| `lib/data/adminConfig.ts` | DB-first admin-config loader with `config/*` fallback, namespace cache, optimistic-lock writes | `lib/data/adminConfig.ts`                                                                                            | `prisma/*`, `lib/data/redis.ts`                         |
| `lib/auth/permissions.ts` | Server-side resolved role + hierarchy reads with SUPERADMIN immutability guard | `lib/auth/permissions.ts`                                                                                            | `lib/data/adminConfig.ts`, `config/roles.ts`            |
| `lib/data/formAssignment.ts` | Assignment lookup + metric-subset enforcement for quick-form writes         | `lib/data/formAssignment.ts`                                                                                          | `prisma/*`                                              |
| `lib/data/importPipeline.ts` | CSV parser + validator + chunked transactional commit for spreadsheet imports | `lib/data/importPipeline.ts`                                                                                       | `prisma/*`                                              |
| `lib/utils/joinRedirect.ts` | Whitelisted query-param redirect resolver for /join post-registration flow      | `lib/utils/joinRedirect.ts`                                                                                          | `config/routes.ts`                                      |
| `providers/RoleConfigProvider.tsx` | Client provider exposing public admin-config snapshot (role labels, hierarchy, dashboard layout) | `providers/RoleConfigProvider.tsx`                                                                | `app/api/admin-config/public/*`                         |
| `modules/admin-config` | Superadmin-only Admin Config UI with bespoke editors for roles + hierarchy + JSON for other namespaces | `modules/admin-config/components/AdminConfigPage.tsx`                                                              | `app/api/admin-config/*`                                |
| `modules/quick-form`   | USHER / DATA_ENTRY assignment landing + fill surface (single-screen, autosave) | `modules/quick-form/components/QuickFormLandingPage.tsx`, `modules/quick-form/components/QuickFormFillPage.tsx`            | `app/api/form-assignments/*`                            |
| `modules/imports`      | Spreadsheet import wizard (upload → map → validate → commit)                        | `modules/imports/components/ImportWizardPage.tsx`                                                                          | `app/api/imports/*`, `lib/data/importPipeline.ts`       |
| `modules/dashboard/widgets` | Dashboard widget registry consumed by ScopeOverviewGrid for higher-up roles    | `modules/dashboard/widgets/registry.tsx`                                                                                   | `lib/hooks/useApiData.ts`, admin-config layout namespace |
| `modules/bulk-invites` | Bulk invite + pre-register surfaces                                                | `modules/bulk-invites/components/BulkInvitesPage.tsx`                                                                       | `app/api/invite-links/bulk/*`, `app/api/users/preregister/*` |
| `modules/analytics/components/AnalyticsCorrelationControls.tsx` | Config-driven correlation toggle with admin-set max-metric cap   | `modules/analytics/components/AnalyticsCorrelationControls.tsx`                                                          | admin-config `analytics` namespace                      |
| `components/ui/PwaInstallBanner.tsx` | Non-blocking PWA install + push prompt banner with platform detection and dismissal API | `components/ui/PwaInstallBanner.tsx`                                                            | `app/api/notifications/pwa-dismissal/*`                 |
| `prisma/`           | Schema, migrations, generated client, seed                                            | `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/generated/*`, `prisma/seed.ts`                                       | `@prisma/client`, `@prisma/adapter-pg`                  |

---

## Data Flow

> **Section summary:** How a typical request moves through the system from entry point to response.

### Standard Request Flow

```
1) Browser renders a page under app/(dashboard).
2) Page components call `useApiData` / fetch helpers to call `/api/*` route handlers.
3) Route handler validates input (zod), checks auth via cookies (JWT), and dispatches to a service function in `lib/data/*` or `modules/*`.
4) Service calls Prisma (or mock DB) and optionally caches results in Redis.
5) Response is serialized and returned to the client.
6) Client updates UI state based on API response.
7) Hierarchy and aggregation endpoints (e.g. `/api/org/hierarchy`, `/api/reports/aggregate`) may pre-filter results by role scope and include source metadata for audit.
8) Write endpoints generate/propagate request correlation IDs (`x-request-id`) and emit structured redacted logs for diagnostics.
9) Client write actions use unified mutation helper (`apiMutation`) with consistent pending/success/error lifecycle to prevent stuck loading states.
10) Notification fan-out is orchestrated by channel preference: in-app first, email when `RESEND_API_KEY` + user preference allow, and push when subscription exists.
11) Bug report screenshots now use managed asset lifecycle sessions (`/api/assets/sessions`): create → optional temp upload (`preupload_draft`) → finalize/discard, with deferred submit as default mode.
12) Asset lifecycle writes use DB transactions for state and compensating Cloudinary deletes on downstream DB failures; stale TEMP assets are cleaned by `/api/assets/cleanup`.
13) Aggregation preview/generate treats no matching source reports as domain not-found (`404`) rather than generic server failure, improving user error handling.
14) Aggregation UI now resolves scope defaults/options through a shared org rollup helper (`resolveOrgRollupContext`) so campus/group/global role constraints stay consistent.
15) Email security flow is readiness-gated by `RESEND_API_KEY` + `EMAIL_FROM` + `NEXT_PUBLIC_APP_URL`: registration/login/auth refresh can trigger non-blocking verification prompts, profile UI can resend/request change, and token confirmation is completed via `/verify-email` with Route Handlers under `/api/auth/email-verification/*` and `/api/auth/email-change/*`.
16) Admin-config substrate (`/api/admin-config`, `/api/admin-config/[ns]`, `/api/admin-config/[ns]/reset`) loads namespaces DB-first with `config/*` fallback. Loader returns the typed fallback on DB failure or when `ADMIN_CONFIG_DB_ENABLED=false`. Writes are versioned with optimistic-lock conflict detection (`409`) and async cache invalidation under the `adminConfig:ns:*` key prefix.
17) Form assignments (`/api/form-assignments`, `/api/form-assignments/[id]`) pin a metric subset of a report to one or more assignees (USHER / DATA_ENTRY). Quick-form fills must verify the metric set on each write — never trust client-supplied metric IDs.
18) Bulk invites (`/api/invite-links/bulk`) and pre-registration (`/api/users/preregister`) write a `BulkInviteBatch` and per-entry outcomes (`created` / `already_invited` / `already_registered` / `preregistered` / `activation_skipped` / `failed`). Pre-register creates inactive users with one-time `UserActivationToken` rows; existing active users are never overwritten.
19) Activation flow (`/activate?token=...` → `/api/auth/activate`) verifies a SHA-256 token hash, forces a new password, marks the user active, and issues a sign-in cookie. Tokens are one-time and rotate on use.
20) PWA install + push prompt banner (`components/ui/PwaInstallBanner.tsx`) is mounted in the dashboard layout. Dismissals are stored both in `localStorage` (per device) and `/api/notifications/pwa-dismissal` (per user across devices). Re-engagement window is `PWA_BANNER_REENGAGE_DAYS` for `mode: snooze` and indefinite for `mode: never`.
21) `/join?token=...&redirect=<encoded path>` sanitises the redirect target via `lib/utils/joinRedirect.ts`. Only whitelisted authenticated routes survive (`/reports/new`, `/reports`, `/reports/aggregate`, `/quick-form`, `/goals`, `/imports`); on success the user is redirected to login with `?from=<sanitised>` so the existing login flow can replay the destination.
22) Roles are runtime-CRUDable through Admin Config: `lib/auth/permissions.ts` resolves the role config map by overlaying the `roles` admin-config namespace on top of `ROLE_CONFIG`. SUPERADMIN is **immutable** — `sanitiseRoleConfigPayload` strips any override of its label, dashboard mode, visibility scope, or core capabilities (`canManageAdminConfig`, `canManageUsers`, `canManageOrg`, `canLockReports`). Non-SUPERADMIN labels, capabilities, and hierarchy order are freely editable; the public client cache lives in `RoleConfigProvider`.
23) Hierarchy levels are runtime-CRUDable through the `hierarchy` admin-config namespace. The Admin Config UI lets admins add/remove/reorder levels and bind leader/admin roles per level. `resolveHierarchyLevels()` returns the override when present, otherwise falls back to `ORG_HIERARCHY_CONFIG` so existing data and code paths remain valid.
24) `/api/admin-config/public` returns the merged role map + hierarchy + dashboard layout + PWA copy for any authenticated user. Sensitive namespace contents (e.g. import limits) stay behind the superadmin-only `/api/admin-config` listing endpoint.
25) `DashboardPage` routes higher-up roles (`dashboardMode === "scope-overview"`) into `ScopeOverviewGrid`, which loads role-band widget IDs from the `dashboardLayout` admin-config namespace (`byRoleBand`) with a built-in default. Widgets register themselves in `modules/dashboard/widgets/registry.tsx`; new widgets just add a registration entry. USHER lands on `/quick-form` directly via role config.
26) `/api/form-assignments/[id]/quick-fill` enforces metric-subset assignments server-side via `verifyMetricSubset`. Any submitted templateMetricId outside the assignment's whitelist is rejected with `403`; the locked-metric set is also respected and reported per row.
27) `/api/imports/*` runs the spreadsheet import pipeline: upload (PUT body capped by `IMPORT_MAX_FILE_BYTES`) → map columns to template metric IDs → validate per-row (numeric coercion, duplicate detection, unknown-metric rejection) → commit in chunks with per-chunk transaction boundaries and item-level outcome persistence (`ImportJobItem.outcome`).
```

### Authentication Flow

```
1) User logs in via `/login` page; API call to `app/api/auth/login`.
2) Server verifies credentials (bcrypt) and issues JWT in an httpOnly cookie.
3) `providers/AuthProvider` calls `app/api/auth/me` on mount to load user profile and role.
4) Auth provider exposes `user`, `role`, and helper actions to pages and modules.
5) Protected routes redirect to `/login` if unauthenticated.
```

### Data Persistence Flow

```
1) Primary persistence is PostgreSQL through Prisma (production) or mock DB (local/dev).
2) Redis (Upstash) is used for rate limiting and caching (e.g., reports, org data).
3) Prisma schema drives types and migrations; `prisma/seed.ts` seeds initial data.
```

---

## Configuration Points

> **Section summary:** All configurable values are listed here. Nothing should be hardcoded in source files that appears in this section.

| Config Key                                 | Purpose                                                                                | Location | Default                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------- | -------- | ------------------------------------- |
| `NEXT_PUBLIC_API_URL`                      | Base URL for client API calls (if needed)                                              | `.env*`  | `undefined` (defaults to same origin) |
| `DATABASE_URL`                             | Prisma database connection string                                                      | `.env*`  | Not set (required for production)     |
| `REDIS_URL`                                | Upstash Redis connection                                                               | `.env*`  | Not set (optional)                    |
| `RESEND_API_KEY`                           | Resend email API key                                                                   | `.env*`  | Not set (optional)                    |
| `EMAIL_FROM`                               | Sender identity for outbound email                                                     | `.env*`  | `Harvesters Reporting <noreply@...>`  |
| `EMAIL_VERIFICATION_TOKEN_TTL_HOURS`       | Verification-link lifetime in hours                                                    | `.env*`  | `24`                                  |
| `EMAIL_CHANGE_TOKEN_TTL_HOURS`             | Change-email confirmation-link lifetime in hours                                       | `.env*`  | `24`                                  |
| `JWT_SECRET`                               | JWT signing secret                                                                     | `.env*`  | Not set (required for auth)           |
| `NEXTAUTH_URL`                             | NextAuth base URL (if used)                                                            | `.env*`  | Not set                               |
| `NEXT_PUBLIC_APP_URL`                      | Absolute app URL for email deep links                                                  | `.env*`  | Not set (recommended in production)   |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`             | Browser push subscription public key                                                   | `.env*`  | Not set (optional, required for push) |
| `NEXT_PUBLIC_BUG_REPORT_ASSET_UPLOAD_MODE` | Bug screenshot upload mode (`deferred_submit` default, `preupload_draft` feature mode) | `.env*`  | `deferred_submit`                     |
| `CLOUDINARY_CLOUD_NAME`                    | Cloudinary cloud name                                                                  | `.env*`  | Not set (required for managed assets) |
| `CLOUDINARY_API_KEY`                       | Cloudinary API key                                                                     | `.env*`  | Not set (required for managed assets) |
| `CLOUDINARY_API_SECRET`                    | Cloudinary API secret                                                                  | `.env*`  | Not set (required for managed assets) |
| `CLOUDINARY_ROOT_FOLDER`                   | Root folder segment for managed assets                                                 | `.env*`  | Not set (required for managed assets) |
| `CLOUDINARY_PROJECT_ASSET_FOLDER`          | Project folder segment for managed assets                                              | `.env*`  | Not set (required for managed assets) |
| `ASSET_CLEANUP_TOKEN`                      | Optional shared secret for cleanup endpoint invocation                                 | `.env*`  | Not set                               |
| `PRISMA_ACCELERATE_URL`                    | Optional Prisma Accelerate URL (when used)                                             | `.env*`  | Not set                               |
| `REPORT_REMINDER_HOURS`                    | Deadline reminder lead-time in hours                                                   | `.env*`  | `24`                                  |
| `ADMIN_CONFIG_DB_ENABLED`                  | Toggle DB-backed admin-config substrate (false → always fallback to `config/*`)        | `.env*`  | `true`                                |
| `ADMIN_CONFIG_CACHE_TTL_SECONDS`           | Redis TTL for namespace snapshots                                                      | `.env*`  | `300`                                 |
| `ACTIVATION_TOKEN_TTL_HOURS`               | Pre-register activation link lifetime in hours                                         | `.env*`  | `72`                                  |
| `IMPORT_MAX_FILE_BYTES`                    | Max spreadsheet upload bytes                                                           | `.env*`  | `10485760`                            |
| `PWA_BANNER_REENGAGE_DAYS`                 | Days to suppress PWA install/push banner after a snooze                                | `.env*`  | `14`                                  |
| `ANALYTICS_CORRELATION_MAX_METRICS`        | Cap on metrics included in correlation views                                           | `.env*`  | `12`                                  |

---

## Tech Stack

> **Section summary:** Core technologies in use. New dependencies should be added here when introduced.

| Layer      | Technology                       | Version                         |
| ---------- | -------------------------------- | ------------------------------- |
| Frontend   | Next.js (App Router)             | 16.x                            |
| UI Library | Ant Design                       | 6.x                             |
| Charting   | Recharts                         | 3.x                             |
| Theming    | Next-Themes                      | 0.x                             |
| Styling    | Tailwind CSS & CSS variables     | 4.x                             |
| Backend    | Node.js (Next.js route handlers) | (Node version from environment) |
| Database   | PostgreSQL (Prisma) / Mock DB    | Prisma 7.x                      |
| Cache      | Upstash Redis                    | 1.x                             |
| Email      | Resend                           | 6.x                             |
| Auth       | JWT (jose/jsonwebtoken)          | 9.x                             |

---

## Known Constraints & Technical Debt

> **Section summary:** Limitations and known issues that affect architecture decisions. Agents should be aware of these before proposing changes.

- The runtime data layer now expects Prisma-backed PostgreSQL connectivity (`DATABASE_URL` and optional `PRISMA_ACCELERATE_URL`).
- Auth and access control are role-based; permissions are defined in `config/roles.ts` and must be updated when adding new roles or capabilities.
- Some feature modules still rely on `any` types due to legacy data shapes; type tightening is a priority before release.
- Offline sync is experimental and depends on service worker support; current implementation is a best-effort cache.
- Form autosave/draft persistence is implemented with `lib/hooks/useDraftCache` / `useFormPersistence` and should be used in all long forms to avoid data loss on refresh.
- Org hierarchy load path now includes server-side fallback in `app/api/org/hierarchy/route.ts` to avoid Prisma Accelerate EAI_AGAIN and timeout failures (drift from original single upstream service design).
- Analytics routes now support explicit `includeDrafts` and status controls in `app/api/analytics/overview` and `app/api/analytics/metrics` to align dashboard output with user filtering controls.
- Goals page now supports template group panels and per-campus metric matrix (collapsible sections), and this requires careful state scoping in `modules/goals/components/GoalsPage.tsx`.
- Email provider initialization must be environment-safe: `lib/email/resend.ts` now uses an optional client instance when `RESEND_API_KEY` is missing, preventing build-time failures.
- Email verification/change state is persisted on `users` with one-time `email_action_tokens`; all verification/change operations are non-blocking when email service readiness is false.
- Cache invalidation in write paths should avoid blocking request completion. Redis scan cursors can be returned as numeric or string terminal values (`0` / `"0"`), so invalidation loops must handle both.
- In environments with migration history drift risk, prefer `prisma migrate deploy` for non-destructive migration application and avoid `migrate reset` unless explicitly approved.
- Push notification UI state must reconcile browser permission, existing service worker subscription, and backend subscription persistence to avoid false-disabled toggle states.
- Notification preference and push-subscription persistence currently uses cache-backed storage (`lib/utils/notificationPreferences.ts`) as a transitional durability layer; migration to relational persistence is recommended for long-term reliability.
- Write-route diagnostics now depend on request ID propagation and structured logging; all new write endpoints should include request context via `lib/server/requestContext.ts`.
- Bug report migration currently supports both legacy `screenshotUrl` and managed `screenshotAssetId`; read paths should continue preferring managed asset URL when present.
- Aggregation still has pending UX polish (stepper completeness, metric selector ergonomics, and nav/breadcrumb discoverability) even after query/response hardening.
- Report form persistence now gates restoration until defaults are loaded to prevent period/template rehydration loops and repeated goals fetches.
- Report analytics refresh action now uses router replace/navigation refresh flow instead of hard browser reload to avoid route-state regressions.

---

## Architecture History

> **Section summary:** Log of major architectural changes. See also memory/architecture-history.md for full details.

| Date       | Change                                    | Reason                                                                    |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| 2025-11-XX | Migrated from Next.js Pages to App Router | Leverage server components and route handlers for modern Next.js patterns |
| 2025-12-XX | Added modular `modules/*` structure       | Improve feature ownership and reduce coupling between domains             |
