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
API Layer (app/api/*) → Auth / Reports / Users / Org / Notifications
        ↓
Business logic (modules/* + config/* + lib/utils)
        ↓
Data layer (Prisma / Redis cache / mock DB)
        ↓
PostgreSQL (via Prisma)  /  Upstash Redis  /  Resend email
```

---

## Module Breakdown

> **Section summary:** Each module listed here has a single defined responsibility. Agents should not modify a module's scope without updating this document.

| Module              | Responsibility                                                                                                                                  | Key Files                                                                                                                                  | Dependencies                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | --- | -------------------------- | ---------------------------------------------------------------------- | -------------------------- | -------------------------------------------- |
| `app/`              | Next.js App Router routes + layouts + global error handling                                                                                     | `app/layout.tsx`, `app/page.tsx`, `app/(dashboard)/`                                                                                       | `providers/*`, `modules/*`, `config/*` |
| `components/ui/`    | Shared UI primitives and design system components                                                                                               | `components/ui/*`                                                                                                                          | `antd`, config tokens                  |
| `providers/`        | React context providers for theme, Ant Design, and auth                                                                                         | `providers/ThemeProvider.tsx`, `providers/AntdProvider.tsx`, `providers/AuthProvider.tsx`                                                  | `next-themes`, `antd`, `lib/utils/api` |
| `config/`           | Business configuration and content definition (routes, roles, templates)                                                                        | `config/routes.ts`, `config/roles.ts`, `config/reports.ts`                                                                                 | Types, constants                       |
| `modules/`          | Feature modules that implement UI + domain logic for reports, analytics, users, etc.                                                            | `modules/reports/*`, `modules/analytics/*`                                                                                                 | `lib/hooks`, `lib/utils`, `config/*`   |
| `modules/analytics` | Interactive analytics, configurable UI charts, axis label mode support (auto/short/full), tooltips, and export with trend/pie/line/area toolset | `modules/analytics/components/AnalyticsPage.tsx`, `modules/reports/components/ReportAnalyticsPage.tsx`, `modules/analytics/chartUtils.tsx` | `lib/utils/exportReports`, `lib/data`  |
| `modules/org/`      | Organization hierarchy management (groups, campuses, future multi-level org structure)                                                          | `modules/org/*`                                                                                                                            | `lib/data`, `config/*`, `lib/hooks/*`  |     | `lib/data/orgHierarchy.ts` | Org hierarchy helper service (role scope filtering, hierarchical tree) | `lib/data/orgHierarchy.ts` | `lib/data`, `modules/org`, `modules/reports` |
| `lib/data/`         | Data access layer with Prisma, Redis, and mock DB adapters                                                                                      | `lib/data/prisma.ts`, `lib/data/redis.ts`, `lib/data/db.ts`                                                                                | `prisma`, `@upstash/redis`             |
| `lib/email/`        | Email delivery via Resend                                                                                                                       | `lib/email/resend.ts`                                                                                                                      | `resend`                               |
| `lib/hooks/`        | Shared React hooks (auth, offline sync, data fetching)                                                                                          | `lib/hooks/*`                                                                                                                              | `lib/utils/*`                          |
| `prisma/`           | Database schema, migrations, and seed data                                                                                                      | `prisma/schema.prisma`, `prisma/seed.ts`                                                                                                   | `@prisma/client`                       |

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

| Config Key            | Purpose                                   | Location | Default                               |
| --------------------- | ----------------------------------------- | -------- | ------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL for client API calls (if needed) | `.env*`  | `undefined` (defaults to same origin) |
| `DATABASE_URL`        | Prisma database connection string         | `.env*`  | Not set (required for production)     |
| `REDIS_URL`           | Upstash Redis connection                  | `.env*`  | Not set (optional)                    |
| `RESEND_API_KEY`      | Resend email API key                      | `.env*`  | Not set (optional)                    |
| `JWT_SECRET`          | JWT signing secret                        | `.env*`  | Not set (required for auth)           |
| `NEXTAUTH_URL`        | NextAuth base URL (if used)               | `.env*`  | Not set                               |

---

## Tech Stack

> **Section summary:** Core technologies in use. New dependencies should be added here when introduced.

| Layer      | Technology                       | Version                         |
| ---------- | -------------------------------- | ------------------------------- |
| Frontend   | Next.js (App Router)             | 16.x                            |
| UI Library | Ant Design                       | 6.x                             |
| Styling    | Tailwind CSS & CSS variables     | 4.x                             |
| Backend    | Node.js (Next.js route handlers) | (Node version from environment) |
| Database   | PostgreSQL (Prisma) / Mock DB    | Prisma 7.x                      |
| Cache      | Upstash Redis                    | 1.x                             |
| Email      | Resend                           | 6.x                             |
| Auth       | JWT (jose/jsonwebtoken)          | 9.x                             |

---

## Known Constraints & Technical Debt

> **Section summary:** Limitations and known issues that affect architecture decisions. Agents should be aware of these before proposing changes.

- The system currently uses a mock database for local development; production relies on Prisma + PostgreSQL.
- Auth and access control are role-based; permissions are defined in `config/roles.ts` and must be updated when adding new roles or capabilities.
- Some feature modules still rely on `any` types due to legacy data shapes; type tightening is a priority before release.
- Offline sync is experimental and depends on service worker support; current implementation is a best-effort cache.
- Form autosave/draft persistence is implemented with `lib/hooks/useDraftCache` / `useFormPersistence` and should be used in all long forms to avoid data loss on refresh.
- Org hierarchy load path now includes server-side fallback in `app/api/org/hierarchy/route.ts` to avoid Prisma Accelerate EAI_AGAIN and timeout failures (drift from original single upstream service design).
- Analytics routes now support explicit `includeDrafts` and status controls in `app/api/analytics/overview` and `app/api/analytics/metrics` to align dashboard output with user filtering controls.
- Goals page now supports template group panels and per-campus metric matrix (collapsible sections), and this requires careful state scoping in `modules/goals/components/GoalsPage.tsx`.
- Email provider initialization must be environment-safe: `lib/email/resend.ts` now uses an optional client instance when `RESEND_API_KEY` is missing, preventing build-time failures.

---

## Architecture History

> **Section summary:** Log of major architectural changes. See also memory/architecture-history.md for full details.

| Date       | Change                                    | Reason                                                                    |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| 2025-11-XX | Migrated from Next.js Pages to App Router | Leverage server components and route handlers for modern Next.js patterns |
| 2025-12-XX | Added modular `modules/*` structure       | Improve feature ownership and reduce coupling between domains             |
