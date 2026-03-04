# Harvesters Reporting System — Repair & Refactor Instructions

> **Purpose:** This document guides the refactoring chat in systematically transforming relic code into the clean Reporting System architecture. Follow the audit and fix protocols in order. Violations are grouped by type with exact fix patterns.

---

## Table of Contents

1. [Pre-Session Checklist](#1-pre-session-checklist)
2. [Broad Audit Checklist](#2-broad-audit-checklist)
3. [Fix Protocol 1 — Hardcoded Strings → `config/content.ts`](#3-fix-protocol-1--hardcoded-strings)
4. [Fix Protocol 2 — Inline Arrays → Typed Config Objects](#4-fix-protocol-2--inline-arrays)
5. [Fix Protocol 3 — Missing `allowedRoles`](#5-fix-protocol-3--missing-allowedroles)
6. [Fix Protocol 4 — `any` Types → Strict TypeScript](#6-fix-protocol-4--any-types)
7. [Fix Protocol 5 — Missing Zod Schemas at API Boundaries](#7-fix-protocol-5--missing-zod-schemas)
8. [Fix Protocol 6 — Cross-Module Internal Imports](#8-fix-protocol-6--cross-module-imports)
9. [Fix Protocol 7 — Raw Tailwind Colors → `ds-*` Tokens](#9-fix-protocol-7--raw-tailwind-colors)
10. [Fix Protocol 8 — Relic Feature Removal](#10-fix-protocol-8--relic-feature-removal)
11. [Fix Protocol 9 — Unhealthy Data Layer Patterns](#11-fix-protocol-9--unhealthy-data-layer-patterns)
12. [Fix Protocol 10 — Route Architecture Violations](#12-fix-protocol-10--route-architecture-violations)
13. [Per-Phase Relic Carry-Forward Registry](#13-per-phase-relic-carry-forward-registry)
14. [Session Audit Log Format](#14-session-audit-log-format)
15. [Completion Verification Checklist](#15-completion-verification-checklist)

---

## 1. Pre-Session Checklist

Before starting any repair session, confirm the following are in place:

- [ ] `app/globals.css` contains all `--ds-*` tokens (palette + semantic + `@theme inline`)
- [ ] `types/global.d.ts` exists with all enums and domain interfaces in `declare global {}`
- [ ] `config/content.ts` exists (even if partially populated)
- [ ] `config/roles.ts` has `ROLE_CONFIG: Record<UserRole, RoleConfig>`
- [ ] `config/routes.ts` has `APP_ROUTES` and `API_ROUTES`
- [ ] `lib/data/mockDb.ts` is the EventEmitter singleton (not the flat relic `database.ts`)
- [ ] `lib/data/mockCache.ts` TTL cache exists
- [ ] `providers/AntdProvider.tsx` uses CSS-var bridge (no hardcoded tokens)

If any of the above are missing, implement them **first** before attempting individual file repairs.

---

## 2. Broad Audit Checklist

Run this audit on every file being refactored. Check each box as resolved.

### Strings & Content

- [ ] No string literals inside JSX elements (headings, labels, button text, placeholder, empty state copy, error messages)
- [ ] All user-visible strings reference `CONTENT.*` from `config/content.ts`
- [ ] No `"Church Fellowship CRM"` or `"church"` or `"ministry"` terminology in UI copy (system name: `"Harvesters Reporting System"`)

### Types

- [ ] No `any` type annotations
- [ ] No `as any` casts
- [ ] No untyped `await req.json()` without Zod parse immediately after
- [ ] No local `type` re-declarations for domain entities (they live in `global.d.ts`)
- [ ] Every function parameter and return value explicitly typed
- [ ] `satisfies` used for config objects requiring completeness guarantees

### Architecture

- [ ] No `useState` / `useEffect` in Server Components
- [ ] No `fetch` inside `useEffect` (server data fetching belongs in RSC or API routes)
- [ ] No direct imports into `modules/<domain>/components/` or `modules/<domain>/services/` from outside that module — only through `index.ts`
- [ ] No inline config arrays that should be in a typed config file
- [ ] `allowedRoles: UserRole[]` present on every nav item, column config, KPI card config, section config, and action button config that drives rendered UI

### API Routes

- [ ] Auth checked first (`verifyAuth` before any logic)
- [ ] Request body parsed with a Zod schema (not raw `req.json()`)
- [ ] Query params parsed with a Zod schema
- [ ] All status codes covered: 401, 403, 404, 400, 500
- [ ] Multi-table writes inside `mockDb.transaction()`
- [ ] Cache invalidated after writes
- [ ] `ReportEvent` record created inside the same transaction for all significant report state changes

### Data Layer

- [ ] No flat in-memory arrays used for persistent data (use `mockDb.*`)
- [ ] No ad-hoc in-memory caches (use `mockCache`)
- [ ] No bare sequential multi-table writes outside `transaction()`

### Design Tokens

- [ ] No raw Tailwind palette classes for semantic purpose (`gray-800`, `blue-600`, `white`, `black`)
- [ ] No `dark:bg-*` / `dark:text-*` inline class overrides (token layer handles dark mode)
- [ ] No hardcoded hex values in component files or in `AntdProvider`
- [ ] No forced sidebar dark styling (`theme="dark"` or `from-indigo-600`)

### Relic Features

- [ ] No meeting-related code (meetings table, schedules, attendance)
- [ ] No interaction logging (calls, check-ins, follow-ups in CRM sense)
- [ ] No membership request screens
- [ ] No campaign references
- [ ] No small-group pastoral care community management
- [ ] No CRM-style follow-up reminders

---

## 3. Fix Protocol 1 — Hardcoded Strings

**Detection:** Any string literal inside JSX that is user-visible.

**Pattern:**

```tsx
// ❌ VIOLATING
<h1>Reports</h1>
<p>No reports found. Submit your first report.</p>
<Button>Submit Report</Button>
<Input placeholder="Search reports..." />
```

**Fix Steps:**

1. Identify the string and its semantic context
2. Add or locate the appropriate key in `config/content.ts`
3. Replace the literal with `CONTENT.<domain>.<key>`

```tsx
// ✅ REPAIRED
import { CONTENT } from "@/config/content";

<h1>{CONTENT.reports.pageTitle}</h1>
<p>{CONTENT.reports.emptyState.description}</p>
<Button>{CONTENT.reports.actions.submit}</Button>
<Input placeholder={CONTENT.reports.search.placeholder} />
```

**`config/content.ts` pattern:**

```ts
// config/content.ts
export const CONTENT = {
  reports: {
    pageTitle: "Reports",
    emptyState: {
      title: "No Reports Yet",
      description: "No reports found matching your criteria.",
    },
    actions: {
      submit: "Submit Report",
      approve: "Approve",
      reject: "Require Edits",
      lock: "Lock Report",
    },
    search: {
      placeholder: "Search reports…",
    },
  },
} satisfies AppContent;
```

**Reminder:** Every domain module needs its own section in `CONTENT`. The `AppContent` interface in `global.d.ts` must match the shape and be used with `satisfies` for completeness checking.

---

## 4. Fix Protocol 2 — Inline Arrays

**Detection:** Repeating JSX blocks, or local arrays of objects that describe repeated UI.

**Pattern:**

```tsx
// ❌ VIOLATING — copy-pasted stat cards
<StatCard title="Total Reports" value={42} trend="+12%" />
<StatCard title="Submitted" value={18} trend="+5%" />
<StatCard title="Pending" value={6} trend="-2%" />

// ❌ VIOLATING — inline column definition
<Table
  columns={[
    { title: "Campus", dataIndex: "campusId" },
    { title: "Period", dataIndex: "period" },
    { title: "Status", dataIndex: "status" },
  ]}
  dataSource={reports}
/>
```

**Fix Steps:**

1. Extract the config array to the appropriate `modules/<domain>/config.ts`
2. Type the array items with the appropriate interface (e.g., `KpiCardConfig`, `TableColumnConfig`)
3. Add `allowedRoles: UserRole[]` to each item
4. Render via `.map()`

```tsx
// ✅ REPAIRED — config driven
import { getKpiCards } from "@/modules/reports/config";
import { REPORT_TABLE_COLUMNS } from "@/modules/reports/config";

const kpiCards = getKpiCards(currentRole, analyticsData);
{
  kpiCards.map((card) => <StatCard key={card.id} {...card} />);
}

const visibleColumns = REPORT_TABLE_COLUMNS.filter((col) =>
  col.allowedRoles.includes(currentRole),
);
<Table columns={visibleColumns} dataSource={reports} />;
```

---

## 5. Fix Protocol 3 — Missing `allowedRoles`

**Detection:** Any config item array (nav items, column configs, KPI card configs, section configs, action button configs) that lacks `allowedRoles: UserRole[]`.

**Pattern:**

```ts
// ❌ VIOLATING
const NAV_ITEMS = [
  { key: "reports", label: "Reports", href: "/leader/reports" },
];

const COLUMNS = [{ title: "Campus", dataIndex: "campusId" }];
```

**Fix Steps:**

1. Add `allowedRoles: UserRole[]` to the item interface
2. Populate `allowedRoles` with the correct set of roles that should see this item
3. Apply a `.filter(item => item.allowedRoles.includes(currentRole))` at render time

```ts
// ✅ REPAIRED
const NAV_ITEMS: NavItem[] = [
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

// At render time:
const visibleNav = NAV_ITEMS.filter((item) =>
  item.allowedRoles.includes(user.role),
);
```

**Role Reference:**

```
SUPERADMIN        → superadmin/* routes only
SPO               → leader/*
CEO               → leader/*
CHURCH_MINISTRY   → leader/*
CAMPUS_ADMIN      → leader/*
CAMPUS_PASTOR     → leader/*
GROUP_ADMIN       → leader/*
GROUP_PASTOR      → leader/*
DATA_ENTRY        → leader/*
MEMBER            → scaffolded only (no routes this iteration)
```

---

## 6. Fix Protocol 4 — `any` Types

**Detection:** `any` type annotation, `as any` cast, or untyped function parameters.

**Pattern:**

```ts
// ❌ VIOLATING
const handleSubmit = async (values: any) => { ... };
const report = data as any;
const getConfig = (role: any) => { ... };
```

**Fix Steps:**

1. Replace `any` with the correct domain type from `global.d.ts`
2. For genuinely unknown data, use `unknown` and add a type guard
3. Use `satisfies` for config object completeness
4. Use discriminated unions for multiple possible shapes

```ts
// ✅ REPAIRED
const handleSubmit = async (values: ReportFormValues): Promise<void> => { ... };
const report = data as Report; // only if the type is actually guaranteed
const getConfig = (role: UserRole): RoleConfig => ROLE_CONFIG[role];

// For unknown external data:
const parsed: unknown = await req.json();
const body = CreateReportSchema.parse(parsed); // Zod makes it typed
```

---

## 7. Fix Protocol 5 — Missing Zod Schemas

**Detection:** Any `req.json()` call without immediate Zod `.parse()`. Any query param access without schema validation.

**Pattern:**

```ts
// ❌ VIOLATING
export async function POST(req: NextRequest) {
  const body = await req.json(); // unvalidated
  await mockDb.reports.create({ data: body });
}

export async function GET(req: NextRequest) {
  const campusId = new URL(req.url).searchParams.get("campusId"); // unvalidated
}
```

**Fix Steps:**

1. Create a Zod schema in `modules/<domain>/services/schemas.ts`
2. Parse immediately after `req.json()` or `searchParams`
3. Wrap in `try/catch` returning `400` on parse failure

```ts
// ✅ REPAIRED
// modules/reports/services/schemas.ts
import { z } from "zod";

export const CreateReportSchema = z.object({
  templateId: z.string().uuid(),
  campusId: z.string().uuid(),
  periodType: z.nativeEnum(ReportPeriodType),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

export const ReportListQuerySchema = z.object({
  campusId: z.string().uuid().optional(),
  status: z.nativeEnum(ReportStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// app/api/reports/route.ts
export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: 401 });

  let body: z.infer<typeof CreateReportSchema>;
  try {
    body = CreateReportSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 },
    );
  }
  // ...
}
```

---

## 8. Fix Protocol 6 — Cross-Module Internal Imports

**Detection:** Any import that reaches inside `modules/<domain>/components/` or `modules/<domain>/services/` from outside that module, bypassing `index.ts`.

**Pattern:**

```ts
// ❌ VIOLATING — from another module or from a page
import { buildReportPayload } from "@/modules/reports/services/reportBuilder";
import ReportForm from "@/modules/reports/components/ReportForm";
import { useReport } from "@/modules/reports/hooks/useReport";
```

**Fix Steps:**

1. Ensure the target module's `index.ts` barrel exports the required item
2. Change the import to reference the barrel

```ts
// ✅ REPAIRED
import { ReportForm, ReportService, useReport } from "@/modules/reports";
```

**Barrel `index.ts` pattern:**

```ts
// modules/reports/index.ts
export { ReportService } from "./services/reportService";
export { ReportForm } from "./components/ReportForm";
export { ReportList } from "./components/ReportList";
export { useReport } from "./hooks/useReport";
export { useReportList } from "./hooks/useReportList";
// ← NO type exports here — types live in global.d.ts
```

---

## 9. Fix Protocol 7 — Raw Tailwind Colors → `ds-*` Tokens

**Detection:** Any raw Tailwind palette class used for semantic color purpose.

**Common Violating Patterns → Correct Replacement:**

| Violating Class                                | Replacement                     |
| ---------------------------------------------- | ------------------------------- |
| `bg-white` / `dark:bg-slate-800`               | `bg-ds-surface-elevated`        |
| `bg-gray-50` / `dark:bg-gray-900`              | `bg-ds-surface-base`            |
| `bg-gray-100` / `dark:bg-gray-800`             | `bg-ds-surface-sunken`          |
| `text-gray-900` / `dark:text-white`            | `text-ds-text-primary`          |
| `text-gray-600` / `dark:text-gray-400`         | `text-ds-text-secondary`        |
| `text-gray-500` / `dark:text-gray-400`         | `text-ds-text-subtle`           |
| `border-gray-100` / `dark:border-slate-700`    | `border-ds-border-base`         |
| `border-gray-200` / `dark:border-gray-700`     | `border-ds-border-base`         |
| `text-blue-600` (stat/metric)                  | `text-ds-chart-1`               |
| `text-green-600` (stat/metric)                 | `text-ds-chart-2`               |
| `text-purple-600` (stat/metric)                | `text-ds-chart-3`               |
| `text-orange-600` (stat/metric)                | `text-ds-chart-4`               |
| `bg-indigo-600/700/800` (sidebar)              | `bg-ds-surface-sidebar`         |
| `from-indigo-600 via-indigo-700 to-indigo-800` | `bg-ds-surface-sidebar`         |
| `text-green-500` (accent/CTA)                  | `text-ds-brand-accent`          |
| `bg-green-500` (accent button)                 | `bg-ds-brand-accent`            |
| `rounded-xl` (card)                            | `rounded-[var(--ds-radius-xl)]` |
| `rounded-lg` (button/input)                    | `rounded-[var(--ds-radius-lg)]` |
| `shadow-lg`                                    | `shadow-ds-lg`                  |
| `shadow-xl`                                    | `shadow-ds-xl`                  |

**Sidebar-specific fix:**

```tsx
// ❌ VIOLATING — relic sidebar
<Sider
  theme="dark"
  className="bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800"
>

// ✅ REPAIRED — theme-aware
<Sider className="bg-ds-surface-sidebar border-r border-ds-border-base">
```

**Ant Design ConfigProvider fix:**

```tsx
// ❌ VIOLATING
theme={{ token: { colorPrimary: "#1B4B3E", colorBgBase: "#ffffff" } }}

// ✅ REPAIRED
theme={{ token: {
  colorPrimary: getCSSVar('--ds-brand-accent'),
  colorBgBase:  getCSSVar('--ds-surface-base'),
}}}
```

---

## 10. Fix Protocol 8 — Relic Feature Removal

The following relic feature surfaces must be **completely removed** — not repurposed. Remove files, routes, components, and all references.

### Removal Checklist

| Area                                       | What to Remove                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Meeting scheduling                         | `app/api/meetings/`, `app/leader/meetings/`, `app/superadmin/meetings/`, `app/member/meetings/`, any `meetings` table in mockDb, `Meeting` type if not adapted |
| Interaction logging                        | `app/api/interactions/`, `app/leader/interactions/`, `Interaction` interface if CRM-specific                                                                   |
| Follow-up reminders                        | `app/api/follow-ups/`, `app/leader/follow-ups/`, follow-up notification types                                                                                  |
| Membership requests                        | `app/api/membership-requests/`, `app/member/membership-requests/`                                                                                              |
| Campaign management                        | `app/api/campaigns/`, all campaign references in nav and analytics                                                                                             |
| Small group community tools                | Any "community management" routes that aren't hierarchy/admin                                                                                                  |
| CRM-style group creation for pastoral care | `app/leader/groups/` if it manages pastoral CRM groups (not org hierarchy)                                                                                     |
| "Church Fellowship CRM" naming             | All files, strings, comments, meta tags, `<title>` values                                                                                                      |

### How to Remove

1. Delete the file/folder
2. Remove all imports referencing the deleted file
3. Remove the API route from `config/routes.ts`
4. Remove any nav item from `config/nav.ts`
5. Remove the data table from `lib/data/mockDb.ts` and `lib/data/seed.ts`
6. Remove the type from `types/global.d.ts` if it's exclusively CRM-specific
7. Run TypeScript compiler (`tsc --noEmit`) to surface all remaining references

### What to Keep (Even if it Looks Like a Relic)

| Relic Feature                       | Keep? | Action                                                       |
| ----------------------------------- | ----- | ------------------------------------------------------------ |
| Auth (JWT + httpOnly cookie)        | ✅    | Adapt to new user roles + Reporting System                   |
| User model + profiles               | ✅    | Keep, update `UserRole` enum, remove CRM fields              |
| Org hierarchy types + routes        | ✅    | Keep Campus + OrgGroup (2-level only); no zones/dept/SG/Cell |
| Invite link / referral registration | ✅    | Keep as-is                                                   |
| Notification infrastructure         | ✅    | Adapt to report-lifecycle notifications only                 |
| Analytics infrastructure            | ✅    | Adapt to report analytics                                    |
| Design tokens (`--ds-*`)            | ✅    | Major repair required (see Protocol 7)                       |
| Report templates + reports          | ✅    | Core system — deeply adapt                                   |

---

## 11. Fix Protocol 9 — Unhealthy Data Layer Patterns

**Detection:** Bare sequential multi-table writes, ad-hoc in-memory caches, direct flat-file `database.ts` usage.

### Pattern A — Sequential Writes → Transaction

```ts
// ❌ VIOLATING
const report = await mockDb.reports.create({ data: payload });
await mockDb.reportEvents.create({ data: { reportId: report.id } });
await mockDb.notifications.create({ data: { userId: reviewer.id } });
```

```ts
// ✅ REPAIRED
const report = await mockDb.transaction(async (tx) => {
  const r = await tx.reports.create({ data: payload });
  await tx.reportEvents.create({
    data: {
      reportId: r.id,
      eventType: ReportEventType.CREATED,
      actorId: auth.user.id,
      timestamp: new Date().toISOString(),
    },
  });
  await tx.notifications.create({
    data: {
      userId: reviewerId,
      type: NotificationType.REPORT_SUBMITTED,
      reportId: r.id,
    },
  });
  return r;
});
```

### Pattern B — Ad-hoc Cache → mockCache

```ts
// ❌ VIOLATING
const reportCache: Record<string, Report> = {};
const cached = reportCache[id];
```

```ts
// ✅ REPAIRED
import { mockCache } from "@/lib/data/mockCache";

const cached = await mockCache.get(`report:${id}`);
if (cached) return JSON.parse(cached) as Report;

const report = await mockDb.reports.findUnique({ where: { id } });
await mockCache.set(`report:${id}`, JSON.stringify(report), 300);
return report;
```

### Pattern C — Missing Cache Invalidation

Every mutation must invalidate relevant cache keys:

```ts
// After report update:
await mockCache.invalidatePattern(`report:${id}*`);
await mockCache.invalidatePattern(`reports:campus:${report.campusId}*`);
```

### Pattern D — Missing `{table}:changed` Event

After any mockDb mutation, emit the appropriate event for live UI updates:

```ts
// In mockDb.ts transaction / create / update wrappers:
mockDb.emit("reports:changed");
mockDb.emit("notifications:changed");
```

---

## 12. Fix Protocol 10 — Route Architecture Violations

**Detection:** Role-split routes (separate pages per role for the same feature), or features placed under wrong layout.

### Consolidated Routes Pattern

All leader-tier roles (everyone between MEMBER and SUPERADMIN) live under `/leader/*`:

```
/leader/dashboard     → all leader roles, role-aware sections
/leader/reports       → all leader roles, role-aware columns and actions
/leader/analytics     → all leader roles, role-aware KPIs
/leader/inbox         → all leader roles
/leader/settings      → all leader roles
```

**Role-aware rendering replaces route splitting:**

```tsx
// ❌ VIOLATING — route split
// app/campus-pastor/reports/page.tsx
// app/group-admin/reports/page.tsx
// app/zonal-leader/reports/page.tsx

// ✅ REPAIRED — single route
// app/leader/reports/page.tsx
const sections = REPORT_DETAIL_SECTIONS.filter((s) =>
  s.allowedRoles.includes(user.role),
);
{
  sections.map((section) => (
    <section.Component key={section.id} report={report} />
  ));
}
```

### Role-to-Route Assignment

| Role             | Route Prefix    |
| ---------------- | --------------- |
| `SUPERADMIN`     | `/superadmin/*` |
| All leader roles | `/leader/*`     |
| `MEMBER`         | `/member/*`     |

Auth middleware must redirect users to their correct prefix on login. The `ROLE_CONFIG` should include `defaultRoute` for each role.

---

## 13. Per-Phase Relic Carry-Forward Registry

Track which relic files are being adapted (not deleted) and the status of their repair.

| Relic File                             | Target Location                 | Status       | Notes                                                   |
| -------------------------------------- | ------------------------------- | ------------ | ------------------------------------------------------- |
| `relics/lib/types.ts`                  | `types/global.d.ts`             | Adapt        | Remove CRM-only types; migrate enums as regular exports |
| `relics/app/globals.css`               | `app/globals.css`               | Major repair | Full `--ds-*` token rebuild                             |
| `relics/providers/AntdProvider.tsx`    | `providers/AntdProvider.tsx`    | Repair       | CSS-var bridge, remove hardcoded tokens                 |
| `relics/providers/AuthProvider.tsx`    | `providers/AuthProvider.tsx`    | Minor adapt  | New UserRole set                                        |
| `relics/providers/ThemeProvider.tsx`   | `providers/ThemeProvider.tsx`   | Carry as-is  | Identical role                                          |
| `relics/components/ui/Button.tsx`      | `components/ui/Button.tsx`      | Token repair | Replace raw colors                                      |
| `relics/components/ui/Card.tsx`        | `components/ui/Card.tsx`        | Token repair | Replace raw colors                                      |
| `relics/components/ui/Table.tsx`       | `components/ui/Table.tsx`       | Token repair | Replace raw colors                                      |
| `relics/components/ui/StatusBadge.tsx` | `components/ui/StatusBadge.tsx` | Adapt        | New status set                                          |
| `relics/app/api/auth/`                 | `app/api/auth/`                 | Adapt        | New session/role logic                                  |
| `relics/app/api/reports/`              | `app/api/reports/`              | Major adapt  | New workflow + templates                                |
| `relics/app/api/report-templates/`     | `app/api/report-templates/`     | Adapt        | Fully keep                                              |
| `relics/app/api/invite-links/`         | `app/api/invite-links/`         | Carry as-is  | No changes needed                                       |
| `relics/app/api/notifications/`        | `app/api/notifications/`        | Adapt        | Report-lifecycle only                                   |
| `relics/app/(auth)/`                   | `app/(auth)/`                   | Minor adapt  | Same structure                                          |
| `relics/app/profile/`                  | `app/profile/`                  | Carry as-is  | —                                                       |
| `relics/app/offline/`                  | `app/offline/`                  | Carry as-is  | —                                                       |
| `relics/lib/data/database.ts`          | `lib/data/mockDb.ts`            | Full replace | EventEmitter singleton                                  |
| `relics/lib/utils/auth.ts`             | `lib/utils/auth.ts`             | Adapt        | Same JWT pattern                                        |
| `relics/lib/utils/jwt.ts`              | `lib/utils/jwt.ts`              | Carry as-is  | —                                                       |

---

## 14. Session Audit Log Format

Save session logs in `.github/summaries/session-{date}-{seq}.md`. Each session documents exactly what was touched, what passed, and what remains.

```markdown
# Repair Session — {DATE} — Session {N}

## Scope

Files targeted this session:

- app/api/reports/route.ts
- modules/reports/config.ts
- app/leader/reports/page.tsx

## Fixes Applied

### Hardcoded Strings (Protocol 1)

- [x] app/leader/reports/page.tsx — 6 strings extracted to CONTENT.reports.\*

### Inline Arrays (Protocol 2)

- [x] app/leader/reports/page.tsx — REPORT_TABLE_COLUMNS moved to modules/reports/config.ts
- [x] app/leader/dashboard/page.tsx — KPI array moved to modules/reports/config.ts

### Missing allowedRoles (Protocol 3)

- [x] config/nav.ts — all 9 nav items now have allowedRoles

### `any` Types (Protocol 4)

- [x] app/api/reports/route.ts — body typed via Zod inference

### Zod Schemas (Protocol 5)

- [x] modules/reports/services/schemas.ts — created with CreateReportSchema, ReportListQuerySchema

### Cross-Module Imports (Protocol 6)

- None found in this session

### Raw Tailwind Colors (Protocol 7)

- [x] app/leader/reports/page.tsx — 4 blue/green raw classes replaced
- [x] providers/AntdProvider.tsx — hardcoded hex replaced with getCSSVar()

### Relic Removal (Protocol 8)

- [x] app/api/meetings/ — deleted
- [x] app/leader/meetings/ — deleted

### Data Layer (Protocol 9)

- [x] app/api/reports/route.ts POST — sequential writes moved into transaction()

### Route Architecture (Protocol 10)

- No violations found in this session

## TypeScript Errors After Session

- 0 errors (run: tsc --noEmit)

## Remaining Violations (Carry to Next Session)

- modules/analytics/ — not yet created
- app/leader/analytics/ — still uses inline config array

## Next Session Target

- modules/analytics/ — create full module
- app/leader/analytics/ — refactor to use config-driven sections
```

---

## 15. Completion Verification Checklist

Run this final verification after all phases are complete. All boxes must be checked before discarding the `relics/` folder.

### Core Infrastructure

- [ ] `app/globals.css` — complete `--ds-*` token set; `@theme inline` block present
- [ ] `types/global.d.ts` — all domain types in `declare global {}`; all enums exported
- [ ] `config/content.ts` — every user-visible string covered
- [ ] `config/roles.ts` — `ROLE_CONFIG` with all **9 active roles** (+ MEMBER scaffolded)
- [ ] `config/hierarchy.ts` — `ORG_HIERARCHY_CONFIG` array
- [ ] `config/nav.ts` — all nav items with `allowedRoles`
- [ ] `config/routes.ts` — `APP_ROUTES` and `API_ROUTES` typed constants
- [ ] `lib/data/mockDb.ts` — EventEmitter singleton with `transaction()` support
- [ ] `lib/data/mockCache.ts` — TTL cache with ioredis-compatible API
- [ ] `lib/data/seed.ts` — deterministic fixtures covering all roles + all report states
- [ ] `providers/AntdProvider.tsx` — 100% CSS-var driven, zero hardcoded tokens

### Module Completeness

- [ ] `modules/auth/` — services, hooks, components, config, index barrel
- [ ] `modules/reports/` — services, hooks, components, config, index barrel
- [ ] `modules/templates/` — services, hooks, components, config, index barrel
- [ ] `modules/goals/` — services, hooks, components, config, index barrel (Goal + GoalEditRequest workflows)
- [ ] `modules/users/` — services, hooks, components, config, index barrel
- [ ] `modules/org/` — services, hooks, components, config, index barrel (Campus + OrgGroup only)
- [ ] `modules/analytics/` — services, hooks, components, config, index barrel
- [ ] `modules/notifications/` — services, hooks, components, config, index barrel

### Route Architecture

- [ ] `/leader/*` covers all leader-tier roles (SPO, CEO, CHURCH_MINISTRY, GROUP_PASTOR, GROUP_ADMIN, CAMPUS_PASTOR, CAMPUS_ADMIN, DATA_ENTRY — no role-split routes)
- [ ] `/superadmin/*` routes complete
- [ ] `/member/*` routes scaffolded (no pages built this iteration)
- [ ] `/(auth)/` complete (login, register, forgot-password, reset-password, join)

### API Routes

- [ ] All routes in `API_ROUTES` have a corresponding `app/api/*/route.ts`
- [ ] All routes auth-check first, validate with Zod, handle all 5xx/4xx cases
- [ ] No route uses bare `req.json()` without Zod parse

### Design System

- [ ] Zero raw Tailwind palette classes in component files
- [ ] Zero `dark:bg-*` / `dark:text-*` inline overrides in component files
- [ ] Sidebar uses `bg-ds-surface-sidebar` (not indigo)
- [ ] AntdProvider uses `getCSSVar()` for all token values

### Relic Removal

- [ ] `relics/app/api/meetings/` deleted
- [ ] `relics/app/api/interactions/` deleted
- [ ] `relics/app/api/follow-ups/` deleted
- [ ] `relics/app/api/campaigns/` deleted
- [ ] `relics/app/api/membership-requests/` deleted
- [ ] All meeting/interaction/follow-up/campaign routes removed from `config/routes.ts`
- [ ] All CRM nav items removed from `config/nav.ts`
- [ ] `tsc --noEmit` — 0 errors
- [ ] No `"Church Fellowship CRM"` anywhere in codebase (`grep -r "Church Fellowship" .`)
- [ ] No `"church"` in any `<title>` or `<meta>` tag

### Final

- [ ] `relics/` folder can be safely deleted
- [ ] `tsc --noEmit` passes clean
- [ ] Application builds: `next build` passes clean
- [ ] All **9 active roles** (SUPERADMIN through DATA_ENTRY) can log in and reach correct routes in dev
