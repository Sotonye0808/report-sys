# Repository Map

> **Overview:** Visual map of the project folder structure with a brief description of each directory's purpose. Agents read this first when navigating the codebase. Updated whenever the folder structure changes.

---

## Folder Structure

```
project-root/
│
├── app/                          → Next.js App Router routes + API handlers
│   ├── (auth)/                   → Public authentication pages
│   ├── (dashboard)/              → Authenticated feature routes (reports/analytics/goals/org/users/etc.)
│   ├── api/                      → Route handlers (auth, reports, aggregation, goals, org, notifications, assets)
│   ├── offline/                  → Offline fallback route
│   └── layout.tsx + page.tsx     → App shell + root entrypoints
│
├── components/                   → UI primitives and shared components
│   └── ui/                       → Design-system building blocks (Button, Card, Table, Modal, etc.)
│
├── config/                       → Config + business rules (content, roles, routes, nav, reports)
│
├── lib/                          → Shared libraries (data, assets lifecycle, hooks, server helpers, utils)
│   ├── assets/                   → Cloudinary adapter + lifecycle service/state machine
│   ├── data/                     → Database adapters (Prisma, Redis, mock DB)
│   ├── design-system/            → Token helpers and Ant Design theme integration
│   ├── email/                    → Email provider (Resend)
│   ├── hooks/                    → React hooks (auth, offline sync, data fetching, service worker)
│   ├── server/                   → Request context helpers (request ID, metadata)
│   └── utils/                    → Utility functions (API, auth, offline caching, notifications)
│
├── modules/                      → Feature modules (reports, analytics, goals, org, users, templates, notifications, auth)
│
├── providers/                    → React providers (Theme, Antd, Auth)
│
├── prisma/                       → Prisma schema, migrations, seed data
│   └── generated/                → Generated Prisma client
│
├── public/                       → Static assets (manifest, icons, service worker)
│
├── test/                         → Node/TS regression tests
│
├── types/                        → Global TypeScript type declarations
│
├── .ai-system/                   → AI assist tooling, docs, and workflow automation
│
├── .github/                      → GitHub configuration, CI, and project planning docs
└── relics/                       → Legacy reference files (copied from earlier versions)
```

---

## Directory Descriptions

| Directory     | Purpose                                                    | Key Files                                                                  |
| ------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `app/`        | Next.js App Router pages/layouts and server route handlers | `app/page.tsx`, `app/layout.tsx`, `app/api/*`, `app/(dashboard)/*`         |
| `components/` | Shared UI components and design-system primitives          | `components/ui/Button.tsx`, `components/ui/Table.tsx`                      |
| `config/`     | Application configuration and role/routing/content rules   | `config/routes.ts`, `config/roles.ts`, `config/content.ts`                 |
| `lib/`        | Shared data/hooks/utils/email/assets/server helpers        | `lib/data/prisma.ts`, `lib/assets/lifecycleService.ts`, `lib/utils/api.ts` |
| `modules/`    | Domain feature modules                                     | `modules/reports/*`, `modules/analytics/*`, `modules/users/*`              |
| `providers/`  | React context providers used by the app shell              | `providers/AuthProvider.tsx`, `providers/AntdProvider.tsx`                 |
| `prisma/`     | Database schema, migrations, and seed scripts              | `prisma/schema.prisma`, `prisma/seed.ts`                                   |
| `public/`     | Static assets served by Next.js                            | `public/manifest.json`, `public/sw.js`                                     |
| `test/`       | Targeted regression and unit tests                         | `test/aggregation.test.ts`, `test/reportWorkflow.test.ts`                  |
| `types/`      | Global TypeScript types and enums used across the app      | `types/global.d.ts`                                                        |
| `.ai-system/` | AI tooling, documentation, and workflow helpers            | `.ai-system/agents/`, `.ai-system/index/`                                  |

---

## Entry Points

| Purpose                        | File                   |
| ------------------------------ | ---------------------- |
| Frontend entry (home/redirect) | `app/page.tsx`         |
| Root layout / providers        | `app/layout.tsx`       |
| Global error boundary          | `app/error.tsx`        |
| Auth API                       | `app/api/auth/*`       |
| Reports API                    | `app/api/reports/*`    |
| Asset lifecycle API            | `app/api/assets/*`     |
| Prisma schema / migrations     | `prisma/schema.prisma` |
| Seed data                      | `prisma/seed.ts`       |
| Global type definitions        | `types/global.d.ts`    |
