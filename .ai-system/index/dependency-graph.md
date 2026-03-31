# Dependency Graph

> **Overview:** Maps how modules depend on each other. Agents use this to understand the impact of changes before modifying a module. Updated whenever new dependencies are introduced or modules are refactored.

---

## Module Dependency Map

```
app/layout.tsx
  → providers/ThemeProvider (theme context)
  → providers/AntdProvider (design tokens)
  → providers/AuthProvider (auth context)

providers/AuthProvider
  → lib/utils/api (fetch wrapper)
  → lib/utils/auth (auth helper functions)
  → app/api/auth routes

app/(dashboard)/... pages
  → modules/* UI components
  → lib/hooks/useApiData (data fetching)
  → config/routes (navigation)
  → config/roles (permission logic)

modules/reports
  → lib/utils/api
  → config/reports (template definitions, workflow rules)
  → lib/data/prisma (server-side DB access)
  → lib/utils/exportReports (export logic)

modules/analytics
  → lib/utils/api
  → lib/data/prisma
  → config/reports (report definitions)
  → app/api/analytics/overview and app/api/analytics/metrics route handlers (draft/status filtering)

lib/data/prisma.ts
  → prisma/ (schema & generated client)
  → lib/data/redis.ts (cache layer; optional)

lib/data/redis.ts
  → @upstash/redis (remote Redis client)

lib/email/resend.ts
  → resend (email provider)

lib/hooks/useOfflineSync.ts
  → lib/utils/offlineCache (localStorage wrapper)
  → service worker (public/sw.js)

config/*
  → types/global.d.ts (shared types)

modules/*
  → components/ui/* (shared UI primitives)
```

---

## External Dependencies

> **Section summary:** Third-party packages and what they're used for. Review before adding new packages.

| Package                        | Purpose                                          | Used In                               |
| ------------------------------ | ------------------------------------------------ | ------------------------------------- |
| `next`                         | React framework with app router + server actions | `app/` routes, API handlers           |
| `react` / `react-dom`          | UI rendering                                     | frontend components                   |
| `antd` / `@ant-design/cssinjs` | Component library and theming                    | UI components                         |
| `prisma` / `@prisma/client`    | ORM and database access                          | `lib/data/prisma.ts`, `prisma/*`      |
| `@upstash/redis`               | Redis cache for rate limiting and caching        | `lib/data/redis.ts`                   |
| `@upstash/ratelimit`           | Rate limiting helper for API routes              | `lib/api` route handlers              |
| `resend`                       | Email delivery (transactional emails)            | `lib/email/resend.ts`                 |
| `jose`, `jsonwebtoken`         | JWT creation/verification                        | Auth API routes                       |
| `bcryptjs`                     | Password hashing                                 | Auth API routes                       |
| `zod`                          | Input validation / schemas                       | API route validation                  |
| `date-fns`, `dayjs`            | Date manipulation                                | analytics, report filters, formatting |
| `xlsx`                         | Export reports to Excel                          | `lib/utils/exportReports.ts`          |
| `idb-keyval`                   | Browser storage for offline caching              | `lib/utils/offlineCache.ts`           |

---

## Circular Dependency Warnings

> **Section summary:** Any detected circular dependencies that need to be resolved.

- No explicit circular dependencies detected in the current codebase. (Monitor during refactors.)

---

## Dependency Rules

> **Section summary:** Rules about which modules may depend on which others. Prevents architectural decay.

- UI components (`components/ui/`) should not depend on feature modules (`modules/*`).
- Feature modules may depend on `lib/` and `config/`, but core libs (`lib/`) must not depend on feature modules.
- `config/` files should not depend on React or UI layer.
- API route handlers (`app/api/*`) can depend on `lib/data` and `lib/utils`, but must avoid importing client-only modules.
