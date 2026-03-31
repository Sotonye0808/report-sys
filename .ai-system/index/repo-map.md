# Repository Map

> **Overview:** Visual map of the project folder structure with a brief description of each directory's purpose. Agents read this first when navigating the codebase. Updated whenever the folder structure changes.

---

## Folder Structure

```
project-root/
│
├── app/                          → Next.js App Router routes & server actions
│   ├── (auth)/                   → Authentication pages (login, register, forgot/reset password)
│   ├── (dashboard)/              → Authenticated dashboard routes (reports, analytics, users, org, templates)
│   ├── api/                      → Server-side API routes (Next.js route handlers)
│   ├── offline/                  → Offline fallback page (service worker awareness)
│   ├── layout.tsx                → Root layout (providers, fonts, metadata)
│   ├── page.tsx                  → Root landing redirect
│   ├── error.tsx                 → Global error boundary
│   ├── not-found.tsx             → 404 page
│   └── manifest.ts / robots.ts   → metadata endpoints
│
├── components/                   → UI primitives and shared components
│   └── ui/                       → Design-system building blocks (Button, Card, Table, Modal, etc.)
│
├── config/                       → App config (content strings, routes, role hierarchy, report templates)
│
├── lib/                          → Core libraries (data access, hooks, utils, email, design tokens)
│   ├── data/                     → Database adapters (Prisma, Redis, mock DB)
│   ├── design-system/            → Token helpers and Ant Design theme integration
│   ├── email/                    → Email provider (Resend)
│   ├── hooks/                    → React hooks (auth, offline sync, data fetching, service worker)
│   └── utils/                    → Utility functions (API, auth, offline caching, notifications)
│
├── modules/                      → Feature modules (reports, goals, analytics, users, org, templates, etc.) with advanced routes (org hierarchy fallback, analytics draft filtering, goals template grouping)
│
├── providers/                    → React providers (Theme, Antd, Auth)
│
├── prisma/                       → Prisma schema, migrations, seed data
│
├── public/                       → Static assets (manifest, icons, service worker)
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

| Directory     | Purpose                                                                      | Key Files                                                          |
| ------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `app/`        | Next.js App Router entrypoints, pages, layouts, and API route handlers       | `app/page.tsx`, `app/layout.tsx`, `app/api/*`, `app/(dashboard)/*` |
| `components/` | Shared UI components and design-system primitives                            | `components/ui/Button.tsx`, `components/ui/Table.tsx`              |
| `config/`     | Application configuration and business rules (roles, routes, templates, nav) | `config/routes.ts`, `config/roles.ts`, `config/reports.ts`         |
| `lib/`        | Library code for data access, utilities, hooks, and email                    | `lib/data/prisma.ts`, `lib/utils/api.ts`, `lib/email/resend.ts`    |
| `modules/`    | Feature modules that group UI, hooks, and API integration for a domain       | `modules/reports/*`, `modules/analytics/*`, `modules/users/*`      |
| `providers/`  | React context providers used by the app shell                                | `providers/AuthProvider.tsx`, `providers/AntdProvider.tsx`         |
| `prisma/`     | Database schema, migrations, and seed scripts                                | `prisma/schema.prisma`, `prisma/seed.ts`                           |
| `public/`     | Static assets served by Next.js                                              | `public/manifest.json`, `public/sw.js`                             |
| `types/`      | Global TypeScript types and enums used across the app                        | `types/global.d.ts`                                                |
| `.ai-system/` | AI tooling, documentation, and workflow helpers                              | `.ai-system/agents/`, `.ai-system/index/`                          |

---

## Entry Points

| Purpose                        | File                   |
| ------------------------------ | ---------------------- |
| Frontend entry (home/redirect) | `app/page.tsx`         |
| Root layout / providers        | `app/layout.tsx`       |
| Global error boundary          | `app/error.tsx`        |
| Auth API                       | `app/api/auth/*`       |
| Reports API                    | `app/api/reports/*`    |
| Prisma schema / migrations     | `prisma/schema.prisma` |
| Seed data                      | `prisma/seed.ts`       |
| Global type definitions        | `types/global.d.ts`    |
