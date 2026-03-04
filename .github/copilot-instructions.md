# GitHub Copilot Instructions — Harvesters Reporting System

> These instructions govern **all** code generation for this project.
> Every rule below is non-negotiable. Read the entire file before writing a single line.

---

## 1. Project Identity

**System:** Harvesters International Christian Center — Central Reporting System
**Purpose:** A standalone, role-based web application enabling hierarchical report submission, review, approval, and analytics across all Harvesters campuses and groups.
**Framework:** Next.js 16+ (App Router) · TypeScript strict · Ant Design v6 · Tailwind CSS v4 · Zod · JWT + httpOnly cookies

This system is **standalone today** but architected for future federation into a broader CRM platform. Every decision must preserve that integration path.

---

## 2. Folder & File Structure

```
report-sys/
├── types/
│   └── global.d.ts           ← declare global {} — ALL domain types and enums
├── config/
│   ├── content.ts            ← every user-visible string
│   ├── roles.ts              ← ROLE_CONFIG: Record<UserRole, RoleConfig>
│   ├── hierarchy.ts          ← ORG_HIERARCHY_CONFIG array
│   ├── reports.ts            ← DEFAULT_REPORT_TEMPLATE, REPORT_STATUS_TRANSITIONS, DEADLINE_CONFIG
│   ├── routes.ts             ← APP_ROUTES, API_ROUTES typed constants
│   └── nav.ts                ← nav item arrays with allowedRoles[]
├── modules/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── config.ts
│   │   └── index.ts          ← barrel: export only services + components, never re-export types
│   ├── reports/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── config.ts
│   │   └── index.ts
│   ├── templates/            ← report template management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── config.ts
│   │   └── index.ts
│   ├── goals/                ← Goal + GoalEditRequest workflows
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── config.ts
│   │   └── index.ts
│   ├── users/
│   │   └── (same structure)
│   ├── org/                  ← org hierarchy (campuses, groups, zones, etc.)
│   │   └── (same structure)
│   ├── analytics/
│   │   └── (same structure)
│   └── notifications/
│       └── (same structure)
├── lib/
│   ├── data/
│   │   ├── mockDb.ts         ← EventEmitter singleton — all domain tables, CRUD, transaction()
│   │   ├── mockCache.ts      ← TTL key-value store — same API surface as ioredis
│   │   └── seed.ts           ← deterministic fixtures seeding mockDb
│   ├── hooks/
│   │   ├── useMockDbSubscription.ts
│   │   └── useRole.ts
│   └── utils/
│       ├── auth.ts
│       ├── jwt.ts
│       ├── reportFieldUtils.ts
│       └── middleware.ts
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       ├── StatusBadge.tsx
│       ├── PageLayout.tsx
│       ├── LoadingSkeleton.tsx
│       ├── EmptyState.tsx
│       ├── FilterToolbar.tsx
│       ├── Pagination.tsx
│       └── ThemeToggle.tsx
├── providers/
│   ├── AntdProvider.tsx
│   ├── AuthProvider.tsx
│   └── ThemeProvider.tsx
├── app/
│   ├── globals.css           ← single source of truth for all --ds-* tokens
│   ├── layout.tsx
│   ├── page.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── manifest.ts
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── viewport.ts
│   ├── (auth)/               ← login, register, forgot-password, reset-password, join
│   ├── (public)/             ← about, contact, privacy, terms
│   ├── api/                  ← REST API routes
│   │   ├── auth/
│   │   ├── reports/
│   │   ├── report-templates/
│   │   ├── report-update-requests/
│   │   ├── users/
│   │   ├── org/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── invite-links/
│   ├── leader/               ← ALL roles between MEMBER and SUPERADMIN
│   │   ├── layout.tsx        ← role-aware sidebar from ROLE_CONFIG
│   │   ├── dashboard/
│   │   ├── reports/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── inbox/
│   ├── member/               ← MEMBER role only
│   ├── superadmin/           ← SUPERADMIN role only
│   │   ├── dashboard/
│   │   ├── reports/
│   │   ├── templates/
│   │   ├── users/
│   │   ├── org/
│   │   └── analytics/
│   ├── profile/
│   └── offline/
└── public/
    ├── manifest.json
    ├── sw.js
    └── logo/
```

---

## 3. Architecture Principles — Non-Negotiable

### Principle 1: Dynamic Over Static — No Hardcoding

Every user-visible string must live in `config/content.ts` and be referenced by key. No string literals in JSX.

```tsx
// ✅ CORRECT
import { CONTENT } from "@/config/content";
<h1>{CONTENT.reports.pageTitle}</h1>
<p>{CONTENT.reports.emptyState.description}</p>

// ❌ WRONG
<h1>Reports</h1>
<p>No reports found. Submit your first report.</p>
```

`config/content.ts` is typed with `satisfies` to guarantee completeness:

```ts
// config/content.ts
export const CONTENT = {
  reports: {
    pageTitle: "Reports",
    emptyState: { title: "No Reports Yet", description: "..." },
    actions: { submit: "Submit Report", approve: "Approve" },
    // ...
  },
} satisfies AppContent;
```

---

### Principle 2: Object-Driven & Config-Driven Rendering

Any repeating UI element is a typed config array rendered via `.map()`. No copy-pasted JSX blocks.

```tsx
// ✅ CORRECT — stat cards from config
const kpiCards = getKpiCards(role, data); // returns KpiCardConfig[]
{kpiCards.map(card => <StatCard key={card.id} {...card} />)}

// ❌ WRONG — copy-paste JSX
<StatCard title="Total Reports" value={42} />
<StatCard title="Approved" value={18} />
<StatCard title="Pending" value={6} />
```

```tsx
// ✅ CORRECT — table columns from config
import { REPORT_TABLE_COLUMNS } from "@/modules/reports/config";
<Table columns={REPORT_TABLE_COLUMNS.filter(c => c.allowedRoles.includes(role))} dataSource={reports} />

// ❌ WRONG — inline columns array
<Table columns={[{ title: "Campus", dataIndex: "campusId" }, ...]} dataSource={reports} />
```

---

### Principle 3: Modular Domain Architecture

Each business domain in `modules/<domain>/` with `components/`, `hooks/`, `services/`, `config.ts`, `index.ts`. No cross-module imports except through the target module's `index.ts`.

```ts
// ✅ CORRECT — import through barrel
import { ReportService, ReportForm } from "@/modules/reports";

// ❌ WRONG — import internal module file directly
import { buildReportPayload } from "@/modules/reports/services/reportBuilder";
import ReportForm from "@/modules/reports/components/ReportForm";
```

Module `index.ts` exports only services and components — **never re-declare types** (they live in `types/global.d.ts`).

```ts
// modules/reports/index.ts
export { ReportService } from "./services/reportService";
export { ReportForm } from "./components/ReportForm";
export { useReport } from "./hooks/useReport";
// ← no type exports here
```

---

### Principle 4: TypeScript Strict Mode — No `any`

All data shapes are fully typed. Use `satisfies`, discriminated unions, and `unknown` over `any`. Zod at every API boundary.

```ts
// ✅ CORRECT
const config = {
  deadline: 48,
  reminderStart: 24,
} satisfies ReportDeadlineConfig;

// Zod at API boundary
const body = ReportSubmitSchema.parse(await req.json());

// ✅ CORRECT — discriminated union
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: number };

// ❌ WRONG
const config: any = { deadline: 48 };
const body = await req.json(); // unvalidated
```

---

### Principle 5: Role-Aware Rendering — No Role-Split Pages

ONE page route per feature. Role-based rendering at component/section level via `allowedRoles: UserRole[]` on every config item.

```tsx
// ✅ CORRECT — one route, role-filtered sections
// app/leader/reports/[id]/page.tsx
const sections = REPORT_DETAIL_SECTIONS.filter((s) =>
  s.allowedRoles.includes(user.role),
);
{
  sections.map((section) => (
    <section.Component key={section.id} report={report} />
  ));
}

// ❌ WRONG — role-split routes
// app/campus-pastor/reports/[id]/page.tsx  ← duplicates /leader/reports/[id]/page.tsx
// app/campus-admin/reports/[id]/page.tsx  ← same
```

`allowedRoles` must appear on:

- Nav items in `config/nav.ts`
- Page section configs
- KPI card configs
- Table column configs
- Action button configs

```ts
// config/nav.ts
export const LEADER_NAV_ITEMS: NavItem[] = [
  {
    key: "reports",
    label: CONTENT.nav.reports,
    href: APP_ROUTES.leader.reports,
    icon: FileTextOutlined,
    allowedRoles: [
      UserRole.CAMPUS_ADMIN,
      UserRole.CAMPUS_PASTOR,
      UserRole.GROUP_ADMIN,
      UserRole.GROUP_PASTOR,
      UserRole.SPO,
      UserRole.CEO,
      UserRole.CHURCH_MINISTRY,
      UserRole.DATA_ENTRY,
    ],
  },
];
```

---

### Principle 6: Global Ambient Type Declarations

All core domain types and enums are declared inside `declare global {}` in `types/global.d.ts` and referenced in `tsconfig.json` `include`. No per-file type imports for domain types.

```ts
// types/global.d.ts
export {}; // makes this a module
declare global {
  interface Report { id: string; status: ReportStatus; ... }
  interface ReportTemplate { ... }
  enum UserRole { SUPERADMIN = "SUPERADMIN", ... }
  // ...
}

// tsconfig.json
{ "include": ["types/**/*.d.ts", "next-env.d.ts", ...] }
```

```tsx
// ✅ CORRECT — no import needed for Report or UserRole
function ReportCard({ report }: { report: Report }) { ... }

// ❌ WRONG
import type { Report } from "@/lib/types"; // ← if it should be global, don't import it
```

Enums **cannot** be in `declare global` (TypeScript limitation). Place them in `types/global.d.ts` as regular exports, **not** inside `declare global {}`, and they will be auto-included via `tsconfig.json` include.

---

### Principle 7: Mock DB Mirrors Production — ACID-Aware Simulation

`lib/data/mockDb.ts` is a globally-instantiated EventEmitter singleton with Prisma-compatible CRUD surface.

```ts
// ACID usage
// ✅ CORRECT — multi-table write inside transaction
await mockDb.transaction(async (tx) => {
  const report = await tx.reports.create({ data: reportPayload });
  await tx.reportEvents.create({ data: { reportId: report.id, eventType: "CREATED", ... } });
  await tx.notifications.create({ data: { userId: campusPastorId, ... } });
});

// ❌ WRONG — bare sequential awaits
const report = await mockDb.reports.create({ data: reportPayload });
await mockDb.reportEvents.create({ data: { reportId: report.id, ... } }); // not atomic
```

```ts
// Cache usage — same API surface as ioredis
// ✅ CORRECT
await mockCache.set(`report:${id}`, JSON.stringify(report), 300); // TTL seconds
const cached = await mockCache.get(`report:${id}`);
await mockCache.invalidatePattern(`report:${reportId}:*`);

// ❌ WRONG
const cached = reportCache[id]; // ad-hoc in-memory map
```

`useMockDbSubscription` hook — subscribes to table change events for live UI:

```ts
// ✅ CORRECT — live UI updates
const reports = useMockDbSubscription<Report[]>("reports", () =>
  mockDb.reports.findMany({ where: { campusId: user.campusId } }),
);
// Re-renders whenever mockDb emits "reports:changed"
```

---

### Principle 8: Integration Readiness

```ts
// ✅ CORRECT — UUID IDs everywhere
const report: Report = { id: crypto.randomUUID(), ... };

// ✅ CORRECT — organisationId scaffolded on top-level entities
interface ReportTemplate { id: string; organisationId: string; ... }

// ✅ CORRECT — no hardcoded org IDs
const HARVESTERS_ORG_ID = process.env.NEXT_PUBLIC_ORG_ID!;

// ❌ WRONG
const HARVESTERS_ORG_ID = "harvesters-001"; // hardcoded
```

API routes follow REST conventions wrappable behind an API gateway:

- `GET /api/reports` — not `GET /api/getReports`
- `POST /api/reports/:id/submit` — not `POST /api/submitReport`

---

## 4. Naming Conventions

| Artefact         | Convention                  | Example                                      |
| ---------------- | --------------------------- | -------------------------------------------- |
| React components | PascalCase                  | `ReportForm.tsx`, `StatCard.tsx`             |
| Hooks            | camelCase with `use` prefix | `useReport.ts`, `useRole.ts`                 |
| Services         | camelCase                   | `reportService.ts`                           |
| Config files     | camelCase                   | `content.ts`, `roles.ts`                     |
| API route files  | lowercase hyphenated        | `report-templates/route.ts`                  |
| Utilities        | camelCase                   | `reportFieldUtils.ts`, `formatDate.ts`       |
| Type files       | camelCase                   | declared in `global.d.ts`                    |
| Constants        | SCREAMING_SNAKE_CASE        | `REPORT_STATUS_TRANSITIONS`, `ROLE_CONFIG`   |
| CSS tokens       | `--ds-*` semantic prefix    | `--ds-brand-accent`, `--ds-surface-elevated` |

---

## 5. Component Rules

### Server vs Client

- Default to **Server Components** (no `'use client'`)
- Add `'use client'` only when the component uses: browser APIs, event handlers, `useState`, `useEffect`, Ant Design interactive components
- Data fetching belongs in Server Components or API routes — never `useEffect` + `fetch`

### Props Shape

Every component has an explicit typed interface using `interface`, not `type`:

```tsx
interface ReportFormProps {
  template: ReportTemplate;
  report?: Report;
  mode: "create" | "edit" | "view";
  onSave?: (values: ReportFormValues) => Promise<void>;
}

export function ReportForm({
  template,
  report,
  mode,
  onSave,
}: ReportFormProps) {
  // ...
}
```

### String Rules: Zero Literals in JSX

Every heading, label, placeholder, tooltip, empty state, button text, and error message must come from `config/content.ts`. The only allowed literal strings in JSX are: whitespace, ARIA values that are programmatic, and interpolation variables.

### allowedRoles on Every Config Item

Every config object that drives rendered UI must carry `allowedRoles: UserRole[]`. Components filter by the current user's role before rendering:

```ts
const visibleColumns = REPORT_TABLE_COLUMNS.filter((col) =>
  col.allowedRoles.includes(currentRole),
);
```

---

## 6. API Route Patterns

```ts
// app/api/reports/route.ts — standard pattern
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { mockDb } from "@/lib/data/mockDb";
import { ReportListQuerySchema } from "@/modules/reports/services/schemas";

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: 401 });

  const query = ReportListQuerySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams),
  );

  const reports = await mockDb.reports.findMany({
    where: buildReportFilter(query, auth.user),
  });

  return NextResponse.json({ success: true, data: reports });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = CreateReportSchema.parse(await req.json());

  const report = await mockDb.transaction(async (tx) => {
    const r = await tx.reports.create({
      data: { ...body, createdById: auth.user.id },
    });
    await tx.reportEvents.create({
      data: {
        reportId: r.id,
        eventType: ReportEventType.CREATED,
        actorId: auth.user.id,
        timestamp: new Date().toISOString(),
      },
    });
    return r;
  });

  return NextResponse.json({ success: true, data: report }, { status: 201 });
}
```

**Rules:**

- Always verify auth first
- Always parse request body/query with a Zod schema before use
- Multi-table writes inside `mockDb.transaction()`
- Return `{ success: true, data: T }` on success, `{ success: false, error: string }` on failure
- Invalidate cache after writes: `await mockCache.invalidatePattern(\`report:${id}\*\`)`

---

## 7. State Management Rules

| State type                       | Where it lives                                             |
| -------------------------------- | ---------------------------------------------------------- |
| Server data (read)               | Server Components + API routes                             |
| Mutations                        | Server Actions or API routes (never `useEffect` + `fetch`) |
| Auth + user role                 | `AuthContext` (client)                                     |
| UI state (modals, filters, form) | `useState` in Client Components                            |
| Live DB subscriptions            | `useMockDbSubscription` hook                               |
| Cached server data               | `mockCache` (server-side)                                  |

No global client-side state management library (Redux, Zustand, Jotai) unless explicitly introduced and justified.

---

## 8. Code Quality Checklist

Before any file is considered complete, verify:

- [ ] No string literals in JSX — all strings from `config/content.ts`
- [ ] No repeating JSX blocks — all repetition rendered via `.map()` from config
- [ ] No `any` types — strict TypeScript throughout
- [ ] Zod schema at every API boundary (request body and query params)
- [ ] Multi-table writes inside `mockDb.transaction()`
- [ ] `allowedRoles` present on every config item driving UI
- [ ] No cross-module internal imports — only through `index.ts` barrel
- [ ] No hardcoded org IDs, campus IDs, or group IDs
- [ ] All IDs are UUIDs (`crypto.randomUUID()`)
- [ ] Design tokens used (`ds-*` classes / CSS vars) — no raw Tailwind colors
- [ ] Dark mode correct — semantic tokens only, never `dark:bg-gray-800` etc.
- [ ] Server Components by default — `'use client'` only when necessary
- [ ] Loading and error states handled (`loading.tsx`, `error.tsx`, empty states)

---

## 9. Design Token Rules

Use `--ds-*` semantic tokens exclusively. Never use raw Tailwind palette classes for semantic purpose.

```tsx
// ✅ CORRECT
<div className="bg-ds-surface-elevated border border-ds-border-base rounded-[var(--ds-radius-xl)] shadow-ds-md">

// ❌ WRONG
<div className="bg-white dark:bg-slate-800 border border-gray-200 rounded-xl shadow-lg">
```

Full token reference → see `.github/design-system.md`.

---

## 10. Relic Prohibition

The following features from the old CRM codebase are **relics** and must NOT be referenced, imported, or rebuilt in this system:

- Meeting scheduling and attendance tracking (meetings, attendance tables)
- Interaction logging (calls, check-ins, follow-ups in the CRM sense)
- Membership join/transfer requests (CRM-style group membership)
- Campaign management
- Small group / cell community management (creating groups for pastoral care)
- "Church Fellowship CRM" naming anywhere in UI or code
- Follow-up reminder system (CRM-style)

The only features carried forward from the relics are:

- Auth system (JWT + httpOnly cookies) — adapted
- User model and profile management — adapted with new roles
- Org hierarchy types (Campus, Zone, etc.) — adapted
- Design system tokens (`--ds-*`) — fully carried forward
- Notification infrastructure — adapted for report notifications only
- Analytics infrastructure — adapted for report analytics only
- Invite link / referral registration — carried forward as-is
- API route structure and patterns — carried forward

---

## 11. File Writing Protocol

1. Always read surrounding files before editing to understand context
2. In API routes, always handle: 401 (unauth), 403 (forbidden role), 404 (not found), 400 (validation), 500 (unexpected)
3. In Server Components, handle loading and empty states explicitly
4. After adding a new API route, update `config/routes.ts`
5. After adding a new nav item, add `allowedRoles` to it in `config/nav.ts`
6. After any mockDb write, emit the appropriate `{table}:changed` event
7. After any significant state change on a Report, create a `ReportEvent` record in the same transaction
8. Store summaries in `.github/summaries/` — never in root or src

---

## 12. Tech Stack Versions (Do Not Downgrade)

| Dependency        | Version |
| ----------------- | ------- |
| next              | 16.1.1  |
| react / react-dom | 19.2.3  |
| antd              | 6.1.4   |
| @ant-design/icons | 6.1.0   |
| tailwindcss       | 4.x     |
| zod               | 4.x     |
| typescript        | 5.x     |
| jsonwebtoken      | 9.x     |
| bcryptjs          | 3.x     |
| recharts          | 3.x     |
| date-fns          | 4.x     |
| dayjs             | 1.x     |
