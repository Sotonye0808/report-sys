# Dependency Graph

> **Overview:** Maps how modules depend on each other. Agents use this to understand the impact of changes before modifying a module. Updated whenever new dependencies are introduced or modules are refactored.

---

## Module Dependency Map

```
app/layout.tsx
  → providers/ThemeProvider
  → providers/AntdProvider
  → providers/AuthProvider

providers/AuthProvider
  → lib/utils/api
  → app/api/auth/me + app/api/auth/refresh

app/(dashboard)/... pages
  → modules/* UI components
  → lib/hooks/useApiData
  → lib/utils/apiMutation (write actions)
  → config/routes + config/nav + config/roles

modules/reports
  → lib/utils/api + lib/utils/exportReports
  → lib/data/reportAggregation + lib/data/orgHierarchy
  → modules/reports/services/reportWorkflow
  → config/reports + config/content

modules/analytics
  → lib/utils/api
  → modules/analytics/chartUtils
  → app/api/analytics/* route handlers

app/api/* (write routes)
  → lib/server/requestContext
  → lib/utils/serverLogger
  → lib/utils/api (standard envelope helpers)
  → modules/*/services or lib/data/*

app/api/bug-reports/* + app/api/assets/*
  → lib/assets/lifecycleService
  → lib/assets/lifecycleStateMachine
  → lib/assets/cloudinaryAdapter
  → prisma MediaAsset / AssetUploadSession / AssetLifecycleEvent models

lib/data/db.ts
  → lib/data/prisma.ts
  → lib/data/redis.ts
  → prisma/generated client

lib/data/redis.ts
  → @upstash/redis

lib/email/resend.ts
  → resend
  → lib/email/templates/registry

lib/hooks/useOfflineSync.ts
  → lib/utils/offlineQueue + lib/utils/offlineFetch
  → public/sw.js

config/*
  → types/global.ts

modules/*
  → components/ui/*
  → lib/*
```

---

## External Dependencies

> **Section summary:** Third-party packages and what they're used for. Review before adding new packages.

| Package                                            | Purpose                                          | Used In                                            |
| -------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| `next`                                             | React framework with app router + server actions | `app/` routes, API handlers                        |
| `react` / `react-dom`                              | UI rendering                                     | frontend components                                |
| `antd` / `@ant-design/cssinjs`                     | Component library and theming                    | UI components                                      |
| `prisma` / `@prisma/client` / `@prisma/adapter-pg` | ORM and PostgreSQL adapter                       | `lib/data/prisma.ts`, `lib/data/db.ts`, `prisma/*` |
| `@upstash/redis`                                   | Redis cache for rate limiting and caching        | `lib/data/redis.ts`                                |
| `@upstash/ratelimit`                               | Rate limiting helper for API routes              | `lib/api` route handlers                           |
| `resend`                                           | Email delivery (transactional emails)            | `lib/email/resend.ts`                              |
| `jose`, `jsonwebtoken`                             | JWT creation/verification                        | Auth API routes                                    |
| `bcryptjs`                                         | Password hashing                                 | Auth API routes                                    |
| `zod`                                              | Input validation / schemas                       | API route validation                               |
| `date-fns`, `dayjs`                                | Date manipulation                                | analytics, report filters, formatting              |
| `xlsx`                                             | Export reports to Excel                          | `lib/utils/exportReports.ts`                       |
| `idb-keyval`                                       | Browser storage for offline caching              | `lib/utils/offlineCache.ts`                        |

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
- Asset lifecycle transitions must go through `lib/assets/*` services to keep DB state and Cloudinary cleanup consistent.
