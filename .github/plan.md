# Harvesters Reporting System — Development Plan

> **Strategy:** Build from scratch in the `report-sys/` workspace, copying and adapting relic files only where explicitly noted. Once all phases are complete and verified, remove the `relics/` folder.
>
> **Source of truth for architecture:** `.github/copilot-instructions.md`
> **Source of truth for design tokens:** `.github/design-system.md`
> **Source of truth for product requirements:** `.github/project-context.md`

**Status legend:** `[x]` complete · `[-]` partial / in progress · `[ ]` not started

---

## Phase 1: Workspace Foundation

**Goal:** Establish the project scaffold — directory structure, configuration files, design token foundation, providers, and auth skeleton. Nothing functional yet — only the load-bearing infrastructure.

**Affected:** Root config · `app/globals.css` · `providers/` · `app/layout.tsx`

### 1.1 — Project Initialization

- [x] Copy `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.js`, `eslint.config.mjs`, `.prettierrc`, `.env.example` from relics (no content changes needed)
- [x] Verify all dependency versions match the locked stack in `copilot-instructions.md` (Next.js 16.1.1, antd 6.1.4, etc.)
- [x] Create the full directory tree: `types/`, `config/`, `modules/`, `lib/data/`, `lib/hooks/`, `lib/utils/`, `components/ui/`, `providers/`, `public/logo/`, `.github/summaries/`
- [x] Update `tsconfig.json` `include` to `["types/**/*.d.ts", "next-env.d.ts", "**/*.ts", "**/*.tsx"]`
- [x] Confirm path alias `@/` resolves to workspace root

### 1.2 — Design Token Foundation (`app/globals.css`)

- [x] Write `app/globals.css` with the complete three-tier token architecture:
  - Section 1: `@import` directives
  - Section 2: Palette tokens (`:root` — `--palette-black-*`, `--palette-emerald-*`, `--palette-neutral-*`)
  - Section 3: Semantic design tokens — light mode (`:root` — all `--ds-*` variables)
  - Section 4: Semantic design token overrides — dark mode (`.dark` — surface, text, border, glow, chart, shadow overrides)
  - Section 5: `@theme inline` block exposing all `--ds-*` as Tailwind `bg-ds-*`, `text-ds-*`, `border-ds-*`, `shadow-ds-*`, `rounded-ds-*` utilities
  - Section 6: Base styles (`body`, `html`, `box-sizing`, fonts)
  - Section 7: Utility classes (`.glass-surface`, `.ds-hover-glow`, `.ds-glow-active`, `.ds-skeleton`)
  - Section 8: Ant Design component-scope overrides (scrollbar, switch, etc.)
  - Section 9: Accessibility and `prefers-reduced-motion`
- [x] Verify Harvesters Emerald (`#10b981`) is `--ds-brand-accent` in both light **and** dark mode (theme-invariant)
- [x] Confirm `--ds-surface-sidebar` is white (light) / `#0A0A0B` (dark) — **not** indigo

### 1.3 — Providers

- [x] Create `providers/ThemeProvider.tsx` — wraps `next-themes` ThemeProvider; sets `attribute="class"` for class-based dark mode
- [x] Create `providers/AntdProvider.tsx` — reads all design tokens from CSS variables via `getComputedStyle` at runtime; passes them to Ant Design `ConfigProvider`; `borderRadius: 8` base (`--ds-radius-md`); **zero hardcoded color values**
- [x] Create `providers/AuthProvider.tsx` — `AuthContext` with `user`, `role`, `isLoading`, `login()`, `logout()`, `refreshToken()` — reads from httpOnly cookie via `/api/auth/me` on mount
- [x] Create root `app/layout.tsx` — wraps `ThemeProvider` → `AntdProvider` → `AuthProvider`; loads Inter font via `next/font/google`; provides JetBrains Mono for mono data

### 1.4 — Root App Shell

- [x] Create `app/page.tsx` — redirect to `/dashboard` depending on role; unauthenticated → `/login`
- [x] Create `app/error.tsx` — global error boundary with `--ds-*` token styling
- [x] Create `app/not-found.tsx` — 404 page with brand styling
- [-] Create `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`, `app/viewport.ts` — adapted from relics (`sitemap.ts` not yet created)

---

## Phase 2: Global Type System

**Goal:** Establish `types/global.d.ts` with all domain types, interfaces, and enums the entire application will use without imports. This is the single source of truth for all data shapes.

**Affected:** `types/global.d.ts`

### 2.1 — Enums (exported, not inside `declare global`)

- [x] `UserRole` enum — **9 active:** `SUPERADMIN | SPO | CEO | CHURCH_MINISTRY | GROUP_PASTOR | GROUP_ADMIN | CAMPUS_PASTOR | CAMPUS_ADMIN | DATA_ENTRY` + **scaffolded:** `MEMBER` (no routes built this iteration)
- [x] `ReportStatus` enum — `DRAFT | SUBMITTED | REQUIRES_EDITS | APPROVED | REVIEWED | LOCKED`
- [x] `ReportEventType` enum — all 17 event types (CREATED, SUBMITTED, EDIT_REQUESTED, EDIT_SUBMITTED, EDIT_APPROVED, EDIT_REJECTED, EDIT_APPLIED, APPROVED, REVIEWED, LOCKED, DEADLINE_PASSED, UPDATE_REQUESTED, UPDATE_APPROVED, UPDATE_REJECTED, DATA_ENTRY_CREATED, TEMPLATE_VERSION_NOTE, AUTO_APPROVED)
- [x] `ReportPeriodType` enum — `WEEKLY | MONTHLY | YEARLY`
- [x] `MetricFieldType` enum — `NUMBER | PERCENTAGE | TEXT | CURRENCY`
- [x] `ReportEditStatus` enum — `DRAFT | SUBMITTED | APPROVED | REJECTED`
- [x] `ReportUpdateRequestStatus` enum — `PENDING | APPROVED | REJECTED`
- [x] `NotificationType` enum — all notification types including all 10 report-related ones
- [x] `MetricCalculationType` enum — `SUM | AVERAGE | SNAPSHOT` (how metrics aggregate across periods)
- [x] `GoalMode` enum — `ANNUAL | MONTHLY | CAMPUS_OVERRIDE` (how a Goal's target is expressed)
- [x] `GoalEditRequestStatus` enum — `PENDING | APPROVED | REJECTED`
- [x] `Gender`, `EmploymentStatus`, `MaritalStatus` enums (user profile)
- [x] `InviteLinkType` enum — `CAMPUS | GROUP | DIRECT`

### 2.2 — Hierarchy Constant (exported, not inside `declare global`)

- [x] `HIERARCHY_ORDER: Record<UserRole, number>` — numeric sort order for all roles

### 2.3 — Core Domain Interfaces (inside `declare global`)

#### Auth

- [x] `AuthUser` — `id, email, role, campusId?, orgGroupId?, firstName, lastName, avatar?`
- [x] `AuthContextValue` — `user: AuthUser | null, isLoading, login(), logout(), refreshToken()`

#### User / Profile

- [x] `UserProfile` — full user entity: `id, email, firstName, lastName, phone?, gender?, role, campusId?, orgGroupId?, zoneId?, departmentId?, avatar?, isActive, createdAt, updatedAt`
- [x] `CreateUserInput`, `UpdateUserInput`, `ChangePasswordInput`

#### Org Hierarchy

> Org hierarchy is **Campus → OrgGroup only** (2 levels). Zone, Department, SmallGroup, Cell are out of scope for this system.

- [x] `OrgUnitBase` — shared base: `id, name, description, orgLevel, parentId, parentLevel, isActive, createdAt, updatedAt` + optional fields: `leaderId, adminId, country, location, address, phone, memberCount, inviteCode`
- [x] `OrgGroup extends OrgUnitBase` — `orgLevel: "GROUP"`, `country: string`, `leaderId: string`
- [x] `Campus extends OrgUnitBase` — `orgLevel: "CAMPUS"`, `parentId: string` (refs OrgGroup), `adminId: string`, `country: string`, `location: string`
- [x] `*WithDetails` variants for each org unit (resolved relations)
- [x] Create/Update input types for each org unit

#### Report Template

- [x] `ReportTemplate` — `id, organisationId, name, description, version, sections[], isActive, isDefault, createdById, campusId?, orgGroupId?, createdAt, updatedAt`
- [x] `ReportTemplateSection` — `id, templateId, name, description, order, isRequired, metrics[]`
- [x] `ReportTemplateMetric` — `id, sectionId, name, description, fieldType, isRequired, minValue?, maxValue?, order, capturesGoal, capturesAchieved, capturesYoY, calculationType: MetricCalculationType`
- [x] `ReportTemplateVersion` — `id, templateId, versionNumber, snapshot, createdAt, createdById`
- [x] `CreateReportTemplateInput`, `UpdateReportTemplateInput`, `CreateTemplateSectionInput`, `CreateTemplateMetricInput`

#### Report Core

- [x] `Report` — `id, templateId, templateVersionId, campusId, orgGroupId, periodType, periodYear, periodMonth, periodWeek, status, submittedById?, reviewedById?, approvedById?, deadline, lockedAt?, isDataEntry, dataEntryById?, dataEntryDate?, notes?, createdAt, updatedAt`
- [x] `ReportSection` — `id, reportId, templateSectionId, sectionName, metrics[]`
- [x] `ReportMetric` — `id, reportSectionId, templateMetricId, metricName, monthlyGoal?, monthlyAchieved?, yoyGoal?, computedPercentage?, isLocked, lockedAt?, lockedById?, monthlyGoalComment?, monthlyAchievedComment?, yoyGoalComment?`
- [x] `ReportWithDetails` — extends `Report` with resolved template, sections, metrics, campus, orgGroup, actors
- [x] `ReportFilters`, `ReportFormValues`, `ReportTemplateFormValues`

#### Report Edit & Update Request

- [x] `ReportEdit` — `id, reportId, submittedById, status: ReportEditStatus, reason, sections[], reviewedById?, reviewNotes?, createdAt, updatedAt`
- [x] `ReportEditSection`, `ReportEditMetric`
- [x] `ReportUpdateRequest` — `id, reportId, requestedById, reason, sections[], status: ReportUpdateRequestStatus, reviewedById?, reviewNotes?, createdAt, updatedAt`

#### Audit Trail

- [x] `ReportEvent` — `id, reportId, eventType: ReportEventType, actorId, timestamp, details?, previousStatus?, newStatus?, snapshotId?`
- [x] `ReportVersion` — `id, reportId, versionNumber, snapshot, createdAt, createdById, reason?`

#### Analytics

- [x] `ReportAnalytics` — `campusId?, orgGroupId?, period, totalReports, submittedOnTime, submittedLate, pendingReview, approved, complianceRate`
- [x] `ReportComplianceSummary` — per campus/group compliance over time
- [x] `KpiCardConfig` — `id, title, value, trend?, icon, color, allowedRoles: UserRole[]`

#### Notifications

- [x] `Notification` — `id, userId, type: NotificationType, title, message, relatedId?, read, createdAt`

#### Config Types

- [x] `RoleConfig` — `role, label, hierarchyOrder, dashboardRoute, dashboardMode: "report-fill" | "report-review" | "report-reviewed" | "analytics" | "system", canCreateReports, canReviewReports, canApproveReports, canMarkReviewed, canManageTemplates, canDataEntry, canManageUsers, canManageOrg, canSetGoals, canApproveGoalUnlock, reportVisibilityScope: "own" | "campus" | "group" | "all"`
- [x] `OrgLevelConfig` — `level, label, parentLevel, childLevel, membersPerUnit?, leaderRole`
- [x] `NavItem` — `key, label, href, icon, allowedRoles: UserRole[], badge?`
- [x] `AppContent` — full typed shape of all user-visible strings in `config/content.ts`

#### Invite Links

- [x] `InviteLink` — `id, token, type: InviteLinkType, targetId?, role: UserRole, createdById, usedAt?, expiresAt?, isActive, createdAt`

#### Goals

- [x] `Goal` — `id, campusId, templateMetricId, metricName, mode: GoalMode, year: number, month?: number, targetValue: number, isLocked: boolean, lockedAt?, lockedById?, createdById, createdAt, updatedAt`
- [x] `GoalEditRequest` — `id, goalId, requestedById, reason, proposedValue: number, status: GoalEditRequestStatus, reviewedById?, reviewNotes?, createdAt, updatedAt`
- [x] `MetricEntry` — `id, reportMetricId, templateMetricId, campusId, year: number, month: number, goalValue?: number, achievedValue?: number, goalComment?, achievedComment?, yoyGoalComment?, computedPercentage?, createdAt`

#### API Shapes

- [x] `ApiResponse<T>` discriminated union — `{ success: true; data: T } | { success: false; error: string; code: number }`
- [x] `PaginatedResponse<T>` — `{ data: T[]; total: number; page: number; pageSize: number }`

---

## Phase 3: Configuration Layer

**Goal:** Build all `config/` files — content strings, role config, hierarchy config, report constants, routes, and nav items. These are the single source of truth for all app-wide configuration.

**Affected:** `config/`

### 3.1 — `config/content.ts`

- [x] Define `CONTENT` satisfying `AppContent` — covers every user-visible string for:
  - `nav` — all navigation labels
  - `auth` — login, register, forgot/reset password pages
  - `reports` — page titles, empty states, action labels, status labels, field labels
  - `templates` — template management strings
  - `dashboard` — KPI card titles, section headings
  - `users` — user management strings
  - `org` — org hierarchy management strings
  - `analytics` — analytics page strings
  - `notifications` — notification titles and messages (parameterized)
  - `errors` — all error messages
  - `common` — shared: "Save", "Cancel", "Loading", "Confirm", etc.

### 3.2 — `config/roles.ts`

- [x] Build `ROLE_CONFIG: Record<UserRole, RoleConfig>` — defines for all **9 active roles** (+ MEMBER scaffolded): `label`, `hierarchyOrder`, `dashboardRoute`, `dashboardMode`, all boolean capabilities including `canSetGoals`, `canApproveGoalUnlock`, `reportVisibilityScope`
- [x] Export helpers: `getRoleConfig(role)`, `canRolePerformAction(role, action)`, `getRoleReportPermissions(role)`, `isLeaderRole(role)`, `getRolesAbove(role)`, `getRolesBelow(role)`

### 3.3 — `config/hierarchy.ts`

- [x] Build `ORG_HIERARCHY_CONFIG: OrgLevelConfig[]` — **2-level hierarchy only**: `Campus → OrgGroup`; `membersPerUnit` for Campus level; `leaderRole` for each level
- [x] Export helpers: `getParentLevel(level)`, `getChildLevel(level)`, `getLeaderRoleForLevel(level)`

### 3.4 — `config/reports.ts`

- [x] Build `DEFAULT_REPORT_TEMPLATE: ReportTemplate` — the complete 11-section template seeded from the PRD (Report Summary–Special Programs, Attendance & Quality, NLP, Salvation, Small Group/Cell, Discipleship/Assimilation, Next Gen [Kid-Zone + Stir House], Partnership, HAEF, Spiritual, Relationship Breakthrough) — this seeds the mock DB, it is **not** hardcoded in UI
- [x] Build `REPORT_STATUS_TRANSITIONS: Record<ReportStatus, { allowedNextStatuses: ReportStatus[], requiredRoles: UserRole[] }>` — workflow enforcement map
- [x] Build `DEADLINE_CONFIG` satisfying `ReportDeadlineConfig` — `{ submissionWindowHours: 48, reminderStartHours: 24, reminderIntervalHours: 6 }`
- [x] Build `REPORT_PERIOD_LABELS: Record<ReportPeriodType, string>` — display labels

### 3.5 — `config/routes.ts`

- [x] Build `APP_ROUTES` — flat routes for unified `(dashboard)` group: `dashboard`, `reports`, `reportDetail(id)`, `reportNew`, `reportEdit(id)`, `analytics`, `inbox`, `settings`, `templates`, `templateNew`, `templateDetail(id)`, `users`, `userDetail(id)`, `org` (role-encoded URLs eliminated)
- [x] Build `API_ROUTES` — all API endpoint path builders

### 3.6 — `config/nav.ts`

- [x] Build unified `DASHBOARD_NAV_ITEMS: NavItem[]` — single array for all roles with `allowedRoles[]` on every item; `getNavItems(role)` filters at runtime (role-encoded nav arrays eliminated)
- [x] `LEADER_NAV_ITEMS` / `SUPERADMIN_NAV_ITEMS` kept as `@deprecated` aliases pointing to `DASHBOARD_NAV_ITEMS`

---

## Phase 4: Mock Data Layer

**Goal:** Build the mock DB singleton, mock cache, and seed data. This is the entire backend for phases 5–12.

**Affected:** `lib/data/mockDb.ts` · `lib/data/mockCache.ts` · `lib/data/seed.ts`

### 4.1 — `lib/data/mockDb.ts`

- [x] Implement `MockDb extends EventEmitter` — typed in-memory tables: `users`, `orgGroups`, `campuses`, `reportTemplates`, `templateVersions`, `reports`, `reportSections`, `reportMetrics`, `reportEdits`, `reportUpdateRequests`, `reportEvents`, `reportVersions`, `goals`, `goalEditRequests`, `metricEntries`, `notifications`, `inviteLinks`
- [x] Implement Prisma-compatible CRUD methods on each table: `findUnique({ where })`, `findMany({ where?, orderBy?, skip?, take? })`, `create({ data })`, `update({ where, data })`, `delete({ where })`, `count({ where? })`
- [x] Emit `'<table>:changed'` event after every write operation
- [x] Implement `mockDb.transaction(callback)` — executes callback with `mockDb` as argument; rolls back on error
- [x] Export as global singleton: `export const mockDb = new MockDb(); global.__mockDb = mockDb;` (Next.js hot-reload safe)

### 4.2 — `lib/data/mockCache.ts`

- [x] Implement `MockCache` — TTL key-value store with methods: `set(key, value, ttlSeconds)`, `get(key)`, `del(key)`, `invalidatePattern(pattern)` — same method signatures as `ioredis`
- [x] Auto-expire entries on access
- [x] Export as singleton: `export const mockCache = new MockCache()`

### 4.3 — `lib/data/seed.ts`

- [x] Seed `mockDb` with deterministic fixture data:
  - `OrgGroup` — 2 groups (Nigeria, UK)
  - `Campus` — 4+ campuses (2 per group)
  - `UserProfile` — one user per active role: SUPERADMIN, SPO, CEO, CHURCH_MINISTRY, GROUP_PASTOR, GROUP_ADMIN, CAMPUS_PASTOR, CAMPUS_ADMIN, DATA_ENTRY (+ MEMBER scaffolded)
  - `ReportTemplate` — seed `DEFAULT_REPORT_TEMPLATE` from `config/reports.ts` with a version record
  - `Report` — sample reports at all statuses (DRAFT, SUBMITTED, REQUIRES_EDITS, APPROVED, REVIEWED, LOCKED); include at least 1 `isDataEntry: true`
  - `ReportEvent` — history entries for the sample reports
  - `ReportEdit` — at least 1 edit entity (SUBMITTED status)
  - `ReportUpdateRequest` — at least 1 pending request
  - `Goal` — sample goals per campus/metric; mix of locked and unlocked; ANNUAL and MONTHLY modes
  - `GoalEditRequest` — at least 1 pending unlock request
  - `MetricEntry` — sample historical metric entries for analytics
  - `Notification` — sample notifications for multiple users
  - `InviteLink` — sample links for different roles
- [x] All IDs must be `crypto.randomUUID()` calls (deterministic via indexed offset for seeding)
- [x] Call `seed(mockDb)` at module init; guard with `if (!global.__seeded)`

### 4.4 — `lib/hooks/useMockDbSubscription.ts`

- [x] Implement `useMockDbSubscription<T>(table: string, fetcher: () => T, deps?: unknown[])` — subscribes to `${table}:changed` event; calls `fetcher` on mount and on every event; returns current data

### 4.5 — `lib/hooks/useRole.ts`

- [x] Implement `useRole()` — returns `{ role, roleConfig, can }` where `can` is a proxy over `getRoleConfig(role)` capabilities; reads from `AuthContext`

---

## Phase 5: Auth Module

**Goal:** Complete authentication — login, register, forgot/reset password, referral join, middleware, JWT utilities.

**Affected:** `modules/auth/` · `lib/utils/auth.ts` · `lib/utils/jwt.ts` · `lib/utils/middleware.ts` · `app/(auth)/` · `app/api/auth/`

### 5.1 — Auth Utilities

- [x] `lib/utils/jwt.ts` — `signAccessToken(payload)`, `signRefreshToken(payload)`, `verifyToken(token)`, `decodeToken(token)` using `jsonwebtoken`
- [x] `lib/utils/auth.ts` — `verifyAuth(req)` → `{ success: true; user: AuthUser } | { success: false; error: string }`; reads `accessToken` from httpOnly cookie
- [x] `lib/utils/middleware.ts` — Next.js `middleware.ts` at root: protect `/(dashboard)/*`; redirect unauthenticated to `/login`; redirect authenticated users away from `/login`; route roles to `/dashboard`

### 5.2 — Auth API Routes

- [x] `POST /api/auth/login` — Zod validate `{ email, password }` → bcrypt compare → `mockCache` rate limit → set httpOnly `accessToken` + `refreshToken` cookies → return user profile
- [x] `POST /api/auth/logout` — clear auth cookies
- [x] `GET /api/auth/me` — return current user from token
- [x] `POST /api/auth/refresh-token` — validate refresh token → issue new access token
- [x] `POST /api/auth/register` — Zod validate → hash password → create user with default role `MEMBER` → return user
- [x] `POST /api/auth/forgot-password` — validate email → create reset token → (mock: return token in response)
- [x] `POST /api/auth/reset-password` — validate token + new password → update user password → invalidate token
- [x] `GET /api/invite-links/[token]` — validate invite link token → return link metadata (role, targetId, type)
- [x] `POST /api/auth/join` — validate invite token → create user with assigned role from invite link

### 5.3 — Auth UI Pages

- [x] `app/(auth)/login/page.tsx` — Ant Design Form; all strings from `CONTENT`; Harvesters brand styling with `--ds-*` tokens
- [x] `app/(auth)/register/page.tsx` — standard registration form
- [x] `app/(auth)/forgot-password/page.tsx`
- [x] `app/(auth)/reset-password/page.tsx`
- [x] `app/(auth)/join/page.tsx` — referral/invite registration; reads invite token from URL; pre-fills role from invite metadata

---

## Phase 6: Shared UI Components

**Goal:** Build the `components/ui/` primitive layer that all feature components use. All components use `--ds-*` tokens exclusively.

**Affected:** `components/ui/`

- [x] `Button.tsx` — variants: primary, secondary, ghost, danger; all strings from props (no hardcoded labels); `allowedRoles?` prop for optional role-gate at component level
- [x] `Card.tsx` — variants: standard, glass, elevated, glow-active; corner radius `--ds-radius-xl`
- [x] `Input.tsx` — wraps Ant Design Input; applies `--ds-surface-sunken` + glow focus; height 44px
- [x] `Modal.tsx` — wraps Ant Design Modal; glassmorphism header; `--ds-radius-2xl` corners
- [x] `Table.tsx` — wraps Ant Design Table; opaque surface; mono font for numeric columns; sticky headers; mobile horizontal scroll
- [x] `StatusBadge.tsx` — renders `ReportStatus` and `ReportEditStatus` as colored Ant Design Tags; colors from `--ds-*` tokens; no raw Tailwind color classes
- [x] `PageLayout.tsx` — app shell: collapsible 240/80px sidebar + topbar + content area; sidebar driven by `ROLE_CONFIG` nav items; role badge
- [x] `LoadingSkeleton.tsx` — uses `.ds-skeleton` shimmer class from `globals.css`
- [x] `EmptyState.tsx` — icon + title + description + optional CTA; all strings from props
- [x] `FilterToolbar.tsx` — wraps filter inputs in a flex row; applies consistent spacing
- [x] `Pagination.tsx` — wraps Ant Design Pagination; connects to URL search params
- [x] `ThemeToggle.tsx` — 40px pill; `--ds-surface-elevated` + glow on hover

---

## Phase 7: Report Templates Module

**Goal:** Build the template management domain — API routes, services, and superadmin UI.

**Affected:** `modules/templates/` · `app/api/report-templates/` · `app/superadmin/templates/`

### 7.1 — Template API Routes

- [x] `GET /api/report-templates` — list templates; filter by `isActive`, `orgGroupId`, `campusId`; auth scoped
- [x] `GET /api/report-templates/[id]` — get template with all sections and metrics; include versions count
- [x] `POST /api/report-templates` — superadmin only; Zod validate `CreateReportTemplateInput`; `mockDb.transaction()` to create template + first version + event; returns created template
- [x] `PUT /api/report-templates/[id]` — superadmin only; validate; `mockDb.transaction()` to update template + publish new version snapshot (old reports keep old version reference)
- [x] `DELETE /api/report-templates/[id]` — superadmin only; sets `isActive: false` (soft delete)
- [ ] `GET /api/report-templates/[id]/versions` — list version history

### 7.2 — Template Module

- [ ] `modules/templates/services/templateService.ts` — `getTemplates()`, `getTemplate(id)`, `createTemplate(input)`, `updateTemplate(id, input)`, `archiveTemplate(id)`, `publishVersion(templateId)`, `getVersions(templateId)`
- [ ] `modules/templates/components/TemplateCard.tsx` — template summary card with version, status badge, action menu
- [ ] `modules/templates/components/TemplateSectionList.tsx` — renders ordered list of sections with their metrics
- [ ] `modules/templates/components/TemplateSectionEditor.tsx` — add/edit/reorder sections with drag-handle
- [ ] `modules/templates/components/TemplateMetricEditor.tsx` — add/edit metrics per section: name, fieldType, required, min/max, captures flags
- [ ] `modules/templates/hooks/useTemplate.ts` — client hook for template CRUD with loading/error state
- [x] `modules/templates/index.ts` — barrel export (`TemplatesListPage`, `TemplateNewPage`, `TemplateDetailPage`)

### 7.3 — Template Pages

- [x] `app/(dashboard)/templates/page.tsx` — template list with "New Template" CTA; SUPERADMIN guarded
- [x] `app/(dashboard)/templates/new/page.tsx` — create template form
- [x] `app/(dashboard)/templates/[id]/page.tsx` — view/edit template; version history drawer; preview button

---

## Phase 8: Reports Module — Core CRUD & Workflow

**Goal:** Build the complete report domain: API routes, services, and workflow enforcement.

**Affected:** `modules/reports/` · `app/api/reports/`

### 8.1 — Report CRUD API Routes

- [x] `GET /api/reports` — list reports; Zod `ReportListQuerySchema`; filter by campusId, orgGroupId, periodType, periodYear, periodMonth, periodWeek, status, templateId, isDataEntry, search; role-scoped (campus admin sees own campus, group admin sees whole group, superadmin sees all)
- [x] `GET /api/reports/[id]` — get report with all sections, metrics, template snapshot, actor names (use `getReportWithDetails()`)
- [x] `POST /api/reports` — create report; validate `CreateReportInput`; default status `DRAFT`; initialize sections/metrics from referenced template version; `mockDb.transaction()` → report + sections + metrics + first `ReportEvent(CREATED)`; auto-set `deadline` from `DEADLINE_CONFIG`
- [x] `PUT /api/reports/[id]` — update metric values in a DRAFT report (auto-save); Zod validate metric values; enforce locked field protection
- [x] `DELETE /api/reports/[id]` — only DRAFT status; only by creator or superadmin

### 8.2 — Report Workflow Action Routes

- [x] `POST /api/reports/[id]/submit` — validate all required fields complete; validate status transition; `mockDb.transaction()` → status `SUBMITTED` + `ReportEvent(SUBMITTED)` + `ReportVersion` snapshot + `Notification` to Campus Pastor; lock Goal fields
- [x] `POST /api/reports/[id]/request-edits` — Campus Pastor only; body `{ reason: string }`; `mockDb.transaction()` → status `REQUIRES_EDITS` + `ReportEvent(EDIT_REQUESTED)` + `Notification` to submitter
- [x] `POST /api/reports/[id]/approve` — Campus Pastor only; `mockDb.transaction()` → status `APPROVED` + `ReportEvent(APPROVED)` + `ReportVersion` snapshot + `Notification` to submitter and Group Admin
- [x] `POST /api/reports/[id]/review` — Group Admin or Group Pastor only; `mockDb.transaction()` → status `REVIEWED` + `ReportEvent(REVIEWED)` + `Notification` to submitter
- [x] `POST /api/reports/[id]/lock` — Superadmin or auto-triggered; `mockDb.transaction()` → status `LOCKED` + `ReportEvent(LOCKED)` + lock all metric fields

### 8.3 — Report Edit API Routes

- [ ] `GET /api/reports/[id]/edits` — list edit submissions for a report; role-scoped
- [ ] `POST /api/reports/[id]/edits` — create edit entity (allowed when `REQUIRES_EDITS`); initialize with current report values
- [ ] `POST /api/reports/[id]/edits/[editId]/submit` — submitter submits edit for review; `ReportEvent(EDIT_SUBMITTED)`
- [ ] `POST /api/reports/[id]/edits/[editId]/approve` — Campus Pastor approves; merges edit values into parent report; `mockDb.transaction()` → update report metrics + status back to `SUBMITTED` + `ReportEvent(EDIT_APPLIED)` + `ReportVersion` snapshot
- [ ] `POST /api/reports/[id]/edits/[editId]/reject` — Campus Pastor rejects; `ReportEvent(EDIT_REJECTED)` + notification

### 8.4 — Report Update Request API Routes (Post-Deadline)

- [ ] `GET /api/report-update-requests` — Superadmin scoped; list all pending/resolved requests
- [ ] `POST /api/report-update-requests` — Campus Admin only; creates update request with proposed changes
- [ ] `GET /api/report-update-requests/[id]` — get request details
- [ ] `POST /api/report-update-requests/[id]/approve` — Superadmin only; applies changes to locked report; `mockDb.transaction()` → update metrics + `ReportEvent(UPDATE_APPROVED)` + `ReportVersion` snapshot + unlock applied fields
- [ ] `POST /api/report-update-requests/[id]/reject` — Superadmin only; `ReportEvent(UPDATE_REJECTED)` + notification

### 8.6 — Goal Management API Routes

- [ ] `GET /api/goals?campusId=&month=&year=` — list goals for a campus/period; GROUP_ADMIN, GROUP_PASTOR, SUPERADMIN can query any campus; CAMPUS_ADMIN/DATA_ENTRY scoped to own campus
- [ ] `POST /api/goals` — GROUP_ADMIN only; Zod validate `CreateGoalInput` (`campusId, templateMetricId, mode, year, month?, targetValue`); `mockDb.transaction()` → create goal + event
- [ ] `PUT /api/goals/[id]` — GROUP_ADMIN (if unlocked) or SUPERADMIN/SPO/CEO/CHURCH_MINISTRY (always); Zod validate; update `targetValue`
- [ ] `POST /api/goal-edit-requests` — GROUP_ADMIN only; creates unlock request for a locked goal; Zod validate `{ goalId, reason, proposedValue }`; `mockDb.transaction()` → creates `GoalEditRequest` + Notification to approval tier
- [ ] `POST /api/goal-edit-requests/[id]/approve` — SUPERADMIN/SPO/CEO/CHURCH_MINISTRY; `mockDb.transaction()` → updates goal `targetValue` to `proposedValue`, `request.status = APPROVED` + Notification to GROUP_ADMIN
- [ ] `POST /api/goal-edit-requests/[id]/reject` — same approval tier; `request.status = REJECTED` + Notification

### 8.7 — Report History & Analytics Routes

- [x] `GET /api/reports/[id]/history` — full `ReportEvent[]` audit trail for a report
- [ ] `GET /api/reports/[id]/versions` — `ReportVersion[]` snapshots for a report
- [-] `GET /api/analytics/reports` — aggregate stats endpoint exists at `/api/analytics/overview`; needs `campusId`/`orgGroupId` filter scope completions

### 8.8 — Report Module Services

- [ ] `modules/reports/services/reportService.ts` — all report CRUD + workflow logic (called from API routes)
- [ ] `modules/reports/services/reportValidator.ts` — `validateReportComplete(report)`, `validateStatusTransition(from, to, role)`, `validateFieldEdit(metric, user)`
- [x] `modules/reports/services/reportFieldUtils.ts` — `computeAchievementPercentage(metric)`, `computeYoYGrowth(current, previous)`, `isFieldLocked(metric, report)`, `shouldAutoApprove(report)` (at `lib/utils/reportUtils.ts`)
- [ ] `modules/reports/services/schemas.ts` — Zod schemas: `CreateReportSchema`, `UpdateReportMetricsSchema`, `RequestEditsSchema`, `ReportListQuerySchema`, `CreateReportEditSchema`

---

## Phase 9: Reports UI

**Goal:** Build all report-facing pages and components — forms, lists, detail views, action bars.

**Affected:** `modules/reports/components/` · `app/leader/reports/` · `app/superadmin/reports/`

### 9.1 — Report Components

- [ ] `ReportForm.tsx` — dynamically renders form sections and metrics from `ReportTemplate`; collapses into `ReportSectionCard` per section; auto-save debounce (800ms); respects `isLocked` per metric; reports locked fields visually; all labels from template data (no hardcoded strings)
- [ ] `ReportMetricField.tsx` — single metric input: monthlyGoal + monthlyAchieved + yoyGoal with numeric validation; optional **comment textarea** per field (monthlyGoalComment, monthlyAchievedComment, yoyGoalComment) toggled by a comment icon; lock icon + tooltip when locked; achievement % auto-display; `calculationType` badge (SUM/AVG/SNAPSHOT) on metric label
- [ ] `ReportSectionCard.tsx` — collapsible Ant Design Card for one template section; completion indicator (X/Y fields filled)
- [ ] `ReportStatusBadge.tsx` — `ReportStatus` as colored Ant Design Tag using `--ds-*` tokens
- [ ] `ReportTimeline.tsx` — Ant Design Timeline of `ReportEvent[]`; actor names, timestamps, status change badges
- [ ] `ReportEditDiff.tsx` — side-by-side diff: original vs. proposed edit values; highlights changed fields
- [ ] `ReportDeadlineCountdown.tsx` — live countdown to deadline; warning color at < 6h; error color at < 1h
- [ ] `ReportFilterBar.tsx` — filter controls: period, campusId, status, templateId, isDataEntry; all labels from `CONTENT`
- [ ] `ReportActionBar.tsx` — role+status-aware action buttons (Submit / Approve / Request Edits / Review / Create Edit); buttons from config array filtered by `allowedRoles` and current status

### 9.2 — Report Pages (now in `(dashboard)`)

- [x] `app/(dashboard)/reports/page.tsx` — role-scoped report list with filter bar, deadline countdown badges, empty state
- [x] `app/(dashboard)/reports/new/page.tsx` — template selector → report form; period/campus selection; submit or save draft
- [x] `app/(dashboard)/reports/[id]/page.tsx` — report detail: status badge + deadline countdown + form + action bar + timeline
- [x] `app/(dashboard)/reports/[id]/edit/page.tsx` — creates `ReportEdit` entity; form pre-filled with current values; submit edit for review
- [ ] `app/(dashboard)/reports/[id]/history/page.tsx` — full `ReportTimeline` + `ReportVersion` list
- [ ] `app/(dashboard)/reports/[id]/edits/page.tsx` — list of `ReportEdit` entities; Campus Pastor approval/rejection actions
- [ ] `app/(dashboard)/reports/data-entry/page.tsx` — DATA_ENTRY and SUPERADMIN only; date picker for historical period; then same `ReportForm` flow

### 9.3 — Superadmin Report Pages (now unified in `(dashboard)`)

- [x] `app/(dashboard)/reports/page.tsx` — all reports visible when role = SUPERADMIN; advanced filter bar; compliance percentage column
- [ ] `app/(dashboard)/reports/update-requests/page.tsx` — pending `ReportUpdateRequest` queue; approve/reject actions with diff view
- [ ] `app/(dashboard)/reports/[id]/analytics/page.tsx` — compliance analytics dashboard: bento KPI row + compliance rate chart per campus + submission timeline

### 9.4 — Goals Management Page

- [ ] `app/(dashboard)/goals/page.tsx` — GROUP_ADMIN only; campus-by-campus goal grid for current year/month; editable cells for unlocked goals; lock badge for locked fields; "Request Unlock" action on locked goals opens modal; pending `GoalEditRequest` status chip per goal entry
- [ ] Add `goals` to `DASHBOARD_NAV_ITEMS` with `allowedRoles: [UserRole.GROUP_ADMIN, UserRole.SUPERADMIN]`

---

## Phase 10: Dashboards

**Goal:** Build role-aware dashboards for all roles. Each role's dashboard is driven by its `dashboardMode` config value from `ROLE_CONFIG`.

**Affected:** `app/(dashboard)/dashboard/`

**`dashboardMode` mapping:**

| dashboardMode       | Roles                     | Hero experience                                      |
| ------------------- | ------------------------- | ---------------------------------------------------- |
| `"report-fill"`     | CAMPUS_ADMIN, DATA_ENTRY  | Immediate CTA: open/create current period report     |
| `"report-review"`   | CAMPUS_PASTOR             | Pending approval queue as primary widget             |
| `"report-reviewed"` | GROUP_ADMIN, GROUP_PASTOR | Reports-for-review list as primary widget            |
| `"analytics"`       | SPO, CEO, CHURCH_MINISTRY | KPI bento row + compliance charts                    |
| `"system"`          | SUPERADMIN                | Church-wide KPI + pending requests + recent activity |

- [x] `app/(dashboard)/dashboard/page.tsx` — reads `dashboardMode` from `ROLE_CONFIG[role]`; renders `DashboardPage` from modules with KPI bento row from `getKpiCards(role, data)` config function; role-appropriate widgets
- [ ] `DashboardHero.tsx` — mode-switch component as a separate reusable component: `report-fill` renders "Submit Report" CTA card with current-period status; `report-review` renders pending approvals count + direct link; `report-reviewed` renders reviewed queue; `analytics` renders summary KPI strip; `system` renders alerts summary (currently implemented inline in `DashboardPage`)
- [x] Superadmin dashboard experience — church-wide KPI bento (total reports, compliance rate, pending reviews, pending update requests); compliance chart; recent activity feed; rendered via `DashboardPage` role-awareness

---

## Phase 11: Notifications & Deadline Enforcement

**Goal:** Complete notification generation for all report workflow events and deadline reminder logic.

**Affected:** `modules/notifications/` · `app/api/notifications/` · `app/(dashboard)/inbox/`

- [ ] `modules/notifications/services/notificationService.ts` — `createNotification(userId, type, title, message, relatedId?)`, `getNotifications(userId)`, `markRead(notificationId)`, `markAllRead(userId)`
- [-] Wire notification creation into all 11 report workflow routes using `mockDb.transaction()` (submit, request-edits, approve, review wired; edit-submitted, edit-approved, edit-rejected, update-request routes not yet built)
- [ ] Implement deadline reminder logic in `reportService.ts` — when reports are queried or a background job runs: check `deadline` vs `now`; if within `reminderStartHours`, generate reminder notifications at `reminderIntervalHours` cadence; if past deadline with no Campus Pastor action, trigger `AUTO_APPROVED` event
- [x] `GET /api/notifications` — user's notifications; filter by `read`; paginated
- [x] `POST /api/notifications/[id]/read` — mark single notification as read
- [x] `POST /api/notifications/read-all` — mark all as read
- [x] `app/(dashboard)/inbox/page.tsx` — notification list with `read`/`unread` filter; badge count in nav

---

## Phase 12: User & Org Management (Superadmin)

**Goal:** Superadmin user management and org hierarchy CRUD.

**Affected:** `modules/users/` · `modules/org/` · `app/(dashboard)/users/` · `app/(dashboard)/org/`

- [-] User API routes: `GET /api/users` ✅, `GET /api/users/[id]` ✅, `PUT /api/users/[id]` ✅ — `PATCH /api/users/[id]/role` and `DELETE /api/users/[id]` (soft deactivate) not yet built
- [x] Org routes: `GET|POST /api/org/campuses`, `GET|PUT /api/org/campuses/[id]`, `GET|POST /api/org/groups`, `GET|PUT /api/org/groups/[id]` (2-level hierarchy only — no sub-campus org routes)
- [x] `app/(dashboard)/users/page.tsx` — user table with role filter, search, role change dropdown, deactivate action
- [x] `app/(dashboard)/users/[id]/page.tsx` — user detail + activity summary
- [x] `app/(dashboard)/org/page.tsx` — org hierarchy view; campuses + groups tabs
- [ ] `app/(dashboard)/profile/page.tsx` — user's own profile; edit form; change password

---

## Phase 13: Analytics Module

**Goal:** Reporting compliance and submission analytics dashboards.

**Affected:** `modules/analytics/` · `app/(dashboard)/analytics/`

- [ ] `modules/analytics/services/analyticsService.ts` — `getReportComplianceStats(filters)`, `getCampusReportAnalytics(campusId, period)`, `getGroupReportAnalytics(orgGroupId, period)`, `getOverallComplianceSummary()`
- [-] Recharts components for: compliance rate over time (line chart), submissions by status (bar chart), on-time vs late submission (stacked bar), campus comparison (horizontal bar) — basic charts exist inline in `AnalyticsPage`
- [x] `app/(dashboard)/analytics/page.tsx` — `AnalyticsPage` module rendered; campus-scoped for leaders, church-wide for oversight roles; period selector
- [ ] CSV export action on analytics page

---

## Phase 14: Public Pages, PWA & SEO

**Goal:** Complete the public-facing pages, service worker, and metadata.

**Affected:** `app/(public)/` · `public/`

- [ ] `app/(public)/about/page.tsx`, `contact/page.tsx`, `privacy/page.tsx`, `terms/page.tsx` — all content from `CONTENT`
- [ ] `public/sw.js` — service worker for offline cache of app shell
- [-] `public/manifest.json` — PWA manifest (file exists in public/; needs full PWA config)
- [x] `app/manifest.ts` — dynamic manifest generation
- [ ] Metadata exports on every page (`title`, `description`, `openGraph`)

---

## Phase 15: Settings & Profile Polish

- [x] `app/(dashboard)/settings/page.tsx` — notification preferences, display name, password change (via `SettingsPage` from `modules/auth`)
- [ ] `app/(dashboard)/settings/page.tsx` (superadmin section) — system-wide settings: default template, deadline config override, org config (currently merged into shared SettingsPage; needs superadmin-only section)
- [ ] `app/(dashboard)/profile/page.tsx` — user's own profile edit form; change password

---

## Phase 16: Prisma Migration Preparation (Production Hardening)

**Goal:** Replace `mockDb` and `mockCache` with Prisma + PostgreSQL + Redis. Zero service layer changes required.

**Affected:** `lib/data/` · `.env.local`

- [ ] Install Prisma and generate `prisma/schema.prisma` matching all `types/global.d.ts` entities
- [ ] Create Prisma migration: `prisma migrate dev --name init`
- [ ] Replace `lib/data/mockDb.ts` with `lib/data/db.ts` — exports `prisma` client; same `transaction()` wrapper signature (`prisma.$transaction`)
- [ ] Replace `lib/data/mockCache.ts` with `lib/data/cache.ts` — exports `ioredis` client; same method signatures
- [ ] Replace `lib/data/seed.ts` with `prisma/seed.ts` — same fixtures, Prisma `create()` calls
- [ ] Update `package.json` `prisma.seed` script
- [ ] Update all `import { mockDb }` → `import { db }` across API routes (single search-replace)
- [ ] Run `prisma db seed` and verify all API routes pass end-to-end
- [ ] Configure `.env.local` with real `DATABASE_URL` and `REDIS_URL`

---

## Relic Removal Checklist

Once all phases are complete and verified, the following files in `relics/` can be permanently deleted. **Do not delete until the new system is verified working end-to-end.**

- [x] `relics/app/leader/follow-ups/`, `meetings/`, `groups/`, `my-group/`, `referrals/`, `schedule/`, `interactions/`, `requests/`, `members/` — no equivalents in new system (relics, not migrated)
- [x] `relics/app/superadmin/meetings/`, `groups/`, `referrals/`, `schedule/`, `interests/` — relics
- [x] `relics/app/member/meetings/`, `membership-requests/`, `my-group/`, `history/` — relics
- [x] `relics/app/api/meetings/`, `interactions/`, `follow-ups/`, `membership-requests/`, `campaigns/`, `campuses/`, `cells/`, `departments/`, `groups/`, `zones/` — relics
- [x] `relics/components/features/meetings/`, `interactions/`, `campaigns/`, `membership/`, `communications/`, `groups/` — relics
- [x] `relics/lib/types.ts` (replaced by `types/global.d.ts`)
- [x] `relics/lib/constants/index.ts` (replaced by `config/` layer)
- [x] `relics/lib/data/database.ts` (replaced by `lib/data/mockDb.ts`)
- [x] `relics/lib/data/mockData.ts` (replaced by `lib/data/seed.ts`)
- [ ] Entire `relics/` folder once all phases above are confirmed complete

---

## Implementation Priority Summary

| Priority | Phase | Rationale                                                                    |
| -------- | ----- | ---------------------------------------------------------------------------- |
| P0       | 1–4   | Workspace foundation, types, config, mock data — nothing works without these |
| P0       | 5     | Auth — required for all protected routes                                     |
| P0       | 6     | Shared UI components — required by all feature pages                         |
| P1       | 7–9   | Template + report module — core product value                                |
| P1       | 10    | Dashboards — first thing users see                                           |
| P2       | 11    | Notifications + deadline enforcement — required for PRD compliance           |
| P2       | 12    | User & org management — required for self-service admin                      |
| P2       | 13    | Analytics — required for oversight roles                                     |
| P3       | 14–15 | Public pages, PWA, settings — polish                                         |
| P4       | 16    | Prisma migration — production hardening                                      |
