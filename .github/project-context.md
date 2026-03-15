---

# Project Context Redirect — Harvesters Reporting System

> **IMPORTANT:** This file is no longer the source of truth for project context. All AI agents, Copilot, and automation tools must reference `.ai-system/agents/project-context.md` for the canonical project context, user roles, constraints, and out-of-scope features.

All .github AI/dev artifacts are now pointers only. Do not update this file except to change the redirect location.

`SPO`, `CEO`, and `CHURCH_MINISTRY` correspond directly to the PRD stakeholders. They share `/leader` routing. Their `ROLE_CONFIG` entries set `reportVisibilityScope: "all"`, `dashboardMode: "analytics"`, and `canApproveGoalUnlock: true`. They have no report-filling or report-approval capabilities.

---

## 4. Organizational Hierarchy

For this iteration, the org hierarchy is simplified to the two primary reporting units:

```
Campus (has Campus Pastor + Campus Admin)
  └── OrgGroup (country-scoped; has Group Admin + Group Pastor;
                executive oversight by SPO / CEO / Church Ministry)
```

- **Campus** — the fundamental reporting unit. Each report is created and submitted at campus level.
- **OrgGroup** — country-scoped group of campuses. Group Admin sets goals that cascade to all campuses in the group.
- Sub-campus units (Zone, Department, SmallGroup, Cell) are **not in scope** for this system. They belonged to the CRM layer and have been removed entirely — no interfaces, no DB tables, no API routes.
- `ORG_HIERARCHY_CONFIG` in `config/hierarchy.ts` reflects this two-level structure.
- Reports flow upward: **Campus Admin → Campus Pastor → Group Admin → Group Pastor → Church Ministry/SPO/CEO**

---

## 5. Report Workflow

### 5.1 Status State Machine

```
DRAFT → SUBMITTED → REQUIRES_EDITS → SUBMITTED → APPROVED → REVIEWED → LOCKED
                                                             ↑ (if no action at deadline)
                                                          AUTO_APPROVED
```

| Status           | Description                        | Actor                      |
| ---------------- | ---------------------------------- | -------------------------- |
| `DRAFT`          | Report created, being filled       | Campus Admin, Data Entry   |
| `SUBMITTED`      | Submitted for review               | Campus Admin               |
| `REQUIRES_EDITS` | Campus Pastor has flagged issues   | Campus Pastor              |
| `APPROVED`       | Campus Pastor has approved         | Campus Pastor              |
| `REVIEWED`       | Group-level has marked as reviewed | Group Admin / Group Pastor |
| `LOCKED`         | Past deadline; no further edits    | System / Superadmin        |

### 5.2 Deadline & Reminder Logic

- Reports have a **48-hour submission window** from the period end
- At **24 hours remaining**: first reminder notification to submitter
- Every **6 hours after**: escalating reminder notifications
- At **deadline with no Campus Pastor action**: auto-approve triggers (`AUTO_APPROVED` event)
- Post-deadline edits require a `ReportUpdateRequest` approved by Superadmin

### 5.3 Edit Workflow

A `ReportEdit` is a separate entity created when `REQUIRES_EDITS` is requested:

- The edit contains proposed changes to metric values
- The **original report is preserved** until the edit is approved
- On approval: edit values merge into the parent report; status returns to `SUBMITTED`
- On rejection: edit is rejected; original report status unchanged

### 5.4 Post-Deadline Update Requests

After a report is `LOCKED`, changes require a `ReportUpdateRequest`:

- Campus Admin submits request with proposed changes and reason
- Superadmin reviews, approves, or rejects
- On approval: changes are applied to the locked report; override event recorded

### 5.5 Goal Management System

Goals are **group-governed**, owned by `GROUP_ADMIN`. They are standalone entities — not merely fields on a report metric.

**Goal Creation Modes:**

| Mode            | Description                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| Annual Mode     | GROUP_ADMIN sets goals for all 12 months at once                                     |
| Monthly Mode    | GROUP_ADMIN sets goals for individual months                                         |
| Campus Override | GROUP_ADMIN sets different goals for a specific campus, overriding the group default |

**Goal Hierarchy:**

- Default: Group Goal applies to all campuses in the group
- Override: Campus-specific Goal takes precedence over group goal for that campus
- `Goal` stores `groupId` + optional `campusId` — `campusId` present means it's a campus override

**Goal Locking:**

- Goals are locked after the first report submission for that period
- Locked goals are read-only; the form renders them as non-editable
- To unlock: `GROUP_ADMIN` submits a `GoalEditRequest` with a reason
- Exec roles (`SPO`, `CEO`, `CHURCH_MINISTRY`, `SUPERADMIN`) can approve/reject unlock requests, or directly override without a request

**GoalEditRequest flow:**

```
GROUP_ADMIN submits GoalEditRequest (reason required)
  → Exec/Superadmin reviews
  → APPROVED: goal is unlocked, values updated, re-locked after save
  → REJECTED: reason returned to requester via notification
```

### 5.6 Metric Calculation Types

Every metric in a template must be tagged with a `calculationType`. This governs how weekly metric entries roll up to monthly values:

| Type       | Aggregation                       | Chart type in analytics | Examples                             |
| ---------- | --------------------------------- | ----------------------- | ------------------------------------ |
| `SUM`      | Sum of all weekly entries         | Trend line              | Salvation, Church Planting, Partners |
| `AVERAGE`  | Arithmetic mean of weekly entries | Rolling average line    | Attendance (Sunday, Workers, etc.)   |
| `SNAPSHOT` | Last reported value in the period | Point-in-time bar       | Number of Workers, Number of Cells   |

`calculationType` lives on `ReportTemplateMetric`. It is set when the template is created/edited by Superadmin.

### 5.7 Year-on-Year (YoY) Logic

YoY is **not** a manual input field by default. The system resolves it automatically via a priority chain:

| Priority | Source                                                                     |
| -------- | -------------------------------------------------------------------------- |
| 1        | Same metric, same campus, same period last year (from stored reports)      |
| 2        | Group Admin manual entry (on the Goal entity's `yoyValue` field)           |
| 3        | Calculated estimate: rolling average / growth trend from available history |
| 4        | Safe zero fallback                                                         |

On the report form, YoY displays as a **read-only computed value** unless no historical data exists, in which case `GROUP_ADMIN` or exec roles can enter it manually via the Goal management screen.

### 5.8 Field-Level Comments

Every metric value — in weekly entries, monthly entries, goals, and YoY — supports an optional contextual comment:

```
Metric Value Input
Metric Comment (optional text)
```

This is distinct from the report-level `notes` field. Comments provide context for anomalous values at the individual metric level.

**Use cases:**

- Attendance spike → "Joint service with visiting campus"
- Salvation drop → "Heavy rainfall weekend"
- High partnership → "Special giving drive"

Affects:

- `ReportMetric`: `monthlyGoalComment?`, `monthlyAchievedComment?`, `yoyGoalComment?`
- `MetricEntry` (weekly): `comment?` field alongside `value`
- Report form UI: collapsible comment input below each metric value field

---

## 6. Report Templates (Data-Driven)

Templates are **not hardcoded** — they are entities stored in the mock DB (and future Prisma DB), managed by Superadmin. The UI renders forms dynamically from template definitions.

### 6.1 Template Structure

```
ReportTemplate
  ├── version (incremented on each update)
  ├── sections[] (ordered)
  │   ├── ReportTemplateSection
  │   │   ├── name, description, order, isRequired
  │   │   └── metrics[] (ordered)
  │   │       └── ReportTemplateMetric
  │   │           ├── name, description, fieldType
  │   │           ├── calculationType: MetricCalculationType (SUM | AVERAGE | SNAPSHOT)
  │   │           ├── capturesGoal, capturesAchieved, capturesYoY
  │   │           └── isRequired, minValue, maxValue
  └── ReportTemplateVersion[] (snapshots of each published version)
```

### 6.2 Default 11-Section Template (seeded from `config/reports.ts`)

1. **Report Summary – Special Programs** — Church Planting Program + Program Metrics (Reach, Distribution, Volunteers, Registration, Attendance, Salvation, Assimilation, Next Step, Workers Attendance, First Timers)
2. **Attendance & Quality of Program** — Sunday/First Timer/Workers/Midweek Attendance; Service Quality indicators (Sound, Light, Staging, Music, Parking, Greeters, Ushers)
3. **NLP** — NLP Peak Attendance
4. **Salvation** — Salvation in Cell (Outreach), Salvation in Church
5. **Small Group / Cell** — Number of Cells/Small Groups, Number of Leaders, Number of Assistant Leaders, Attendance
6. **Discipleship / Assimilation** — Course name, Number of Courses, Attendance, Number of Pastoral Leaders
7. **Next Gen — Kid-Zone** — Total/First Timer Attendance, Assimilation, Return Rate, Parental Engagement, Success Rate, Workers Attendance
8. **Next Gen — Stir House** — Same metrics as Kid-Zone
9. **Partnership** — Number of Partners
10. **HAEF** — Project Reach, Project Impact
11. **Spiritual** — Number of People Baptized
12. **Relationship Breakthrough** — Number of Marriages Conducted, Babies Dedicated, Testimonies Captured

### 6.3 Field Locking Rules

| Field             | Lock Trigger                                         |
| ----------------- | ---------------------------------------------------- |
| Monthly Goal      | Locked after first report submission                 |
| Year-on-Year Goal | Locked after first report submission                 |
| Monthly Achieved  | Editable until month end, then locked                |
| Any locked field  | Superadmin can override; logs `FIELD_UNLOCKED` event |

### 6.4 Key Metric Capture

Each metric captures up to three values, each with an optional field-level comment:

| Value            | Comment field             | Description                                                    |
| ---------------- | ------------------------- | -------------------------------------------------------------- |
| Monthly Goal     | `monthlyGoalComment?`     | Target for this month (governed by Goal entity, see §5.5)      |
| Monthly Achieved | `monthlyAchievedComment?` | Actual result; editable until month-end lock                   |
| YoY Goal         | `yoyGoalComment?`         | Auto-resolved (see §5.7); GROUP_ADMIN can set manually if none |

Auto-calculated on the `ReportMetric` instance: `computedPercentage = (monthlyAchieved / monthlyGoal) * 100`

For metrics with a weekly reporting cadence, monthly values are derived from `MetricEntry` records per `calculationType` (SUM / AVERAGE / SNAPSHOT) rather than entered directly.

---

## 7. Domain Entities

### Core Entities

| Entity                  | Description                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `UserProfile`           | User accounts with role, org assignment, profile fields                 |
| `OrgGroup`              | Top-level organizational group (country-scoped, e.g., Nigeria)          |
| `Campus`                | Physical campus under an OrgGroup                                       |
| `ReportTemplate`        | Superadmin-managed report form definition                               |
| `ReportTemplateSection` | Named section within a template                                         |
| `ReportTemplateMetric`  | Individual field within a section; includes `calculationType`           |
| `ReportTemplateVersion` | Snapshot of a template at a point in time                               |
| `Report`                | A submitted report for a campus/period against a template version       |
| `ReportSection`         | Instance of a template section on a specific report                     |
| `ReportMetric`          | Instance of a template metric capturing values + optional comments      |
| `MetricEntry`           | Individual weekly (or sub-period) metric reading; feeds monthly rollup  |
| `Goal`                  | Group Admin-owned target for a metric in a specific period; lockable    |
| `GoalEditRequest`       | Request to unlock a locked Goal; requires exec approval                 |
| `ReportEdit`            | Proposed changes to a submitted report (separate entity until approved) |
| `ReportUpdateRequest`   | Post-deadline/post-lock change request requiring Superadmin approval    |
| `ReportEvent`           | Immutable audit log entry for any state change on a report              |
| `ReportVersion`         | Full snapshot of a report at a significant state change                 |
| `Notification`          | In-app notification for a user                                          |
| `InviteLink`            | Referral/invite token for role-assigned registration                    |

---

## 8. Data Layer Architecture

### 8.1 Mock DB Singleton (`lib/data/mockDb.ts`)

The mock DB is a globally instantiated `EventEmitter` singleton with a Prisma-compatible CRUD surface. It will be replaced by the real Prisma client in Phase 16 with **zero service layer changes**.

```
MockDb (EventEmitter)
  ├── Tables: users, orgGroups, campuses
  ├── Tables: reportTemplates, templateVersions, reportTemplateSections, reportTemplateMetrics
  ├── Tables: reports, reportSections, reportMetrics, metricEntries
  ├── Tables: goals, goalEditRequests
  ├── Tables: reportEdits, reportUpdateRequests
  ├── Tables: reportEvents, reportVersions
  ├── Tables: notifications, inviteLinks
  ├── CRUD surface: findUnique, findMany, create, update, delete, count (per table)
  ├── Emits: '<table>:changed' after every write
  └── transaction(callback): atomic multi-table operations
```

> Sub-campus tables (`zones`, `departments`, `smallGroups`, `cells`) are **not present** — they are permanently out of scope.

**ACID simulation:**

- **Atomicity:** All multi-table writes use `mockDb.transaction(callback)`
- **Consistency:** Zod schemas at API boundary + service-layer business rule guards
- **Isolation:** read-then-write inside a single transaction callback
- **Durability:** absent in dev (in-memory); PostgreSQL WAL in production (Phase 16)

### 8.2 Mock Cache (`lib/data/mockCache.ts`)

TTL key-value store simulating Redis. Same method signatures as `ioredis`:

- `set(key, value, ttlSeconds)`, `get(key)`, `del(key)`, `invalidatePattern(pattern)`
- Cache key conventions: `report:{id}`, `template:{id}`, `analytics:campus:{campusId}:{period}`, `user:{id}`
- Auto-expire on access (lazy TTL check)

### 8.3 Seed Data (`lib/data/seed.ts`)

Deterministic fixtures providing a complete working dataset:

- 2 `OrgGroup` records (Nigeria, UK)
- 4+ `Campus` records (2 per group)
- One user per active role (9 seed users: SUPERADMIN, SPO, CEO, CHURCH_MINISTRY, GROUP_PASTOR, GROUP_ADMIN, CAMPUS_PASTOR, CAMPUS_ADMIN, DATA_ENTRY)
- Default 11-section report template with `calculationType` on every metric + a version record
- Sample `Goal` records for multiple metrics/periods with some locked, some with pending `GoalEditRequest`
- Sample `MetricEntry` records simulating weekly submissions
- Sample reports at all statuses across multiple campuses and periods
- Sample `ReportEvent` history, `ReportEdit`, `ReportUpdateRequest`, `Notification`, `InviteLink` records

### 8.4 Phase 16 Production Swap

To migrate to Prisma + PostgreSQL:

1. Generate `prisma/schema.prisma` matching all `global.d.ts` interfaces
2. Replace `lib/data/mockDb.ts` with `lib/data/db.ts` that exports `prisma` client wrapped in the same `transaction()` signature (`prisma.$transaction`)
3. Replace `lib/data/mockCache.ts` with `lib/data/cache.ts` using `ioredis`
4. Single import path change across all API routes: `mockDb` → `db`
5. No changes in `modules/*/services/` required

---

## 9. Role & Permission Matrix

| Capability              | SUPERADMIN | SPO | CEO | CHURCH_MINISTRY | GROUP_PASTOR | GROUP_ADMIN | CAMPUS_PASTOR | CAMPUS_ADMIN | DATA_ENTRY |
| ----------------------- | ---------- | --- | --- | --------------- | ------------ | ----------- | ------------- | ------------ | ---------- |
| Create report           | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ✅           | ✅         |
| Submit report           | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ✅           | ✅         |
| Fill report sections    | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ✅           | ✅         |
| Request edits           | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ✅            | ❌           | ❌         |
| Approve report          | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ✅            | ❌           | ❌         |
| Mark reviewed           | ✅         | ❌  | ❌  | ❌              | ✅           | ✅          | ❌            | ❌           | ❌         |
| Lock report             | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ❌           | ❌         |
| Data entry (historical) | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ❌           | ✅         |
| Approve update request  | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ❌           | ❌         |
| Manage templates        | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ❌           | ❌         |
| Manage users            | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ❌           | ❌         |
| Manage org              | ✅         | ❌  | ❌  | ❌              | ❌           | ❌          | ❌            | ❌           | ❌         |
| View analytics (full)   | ✅         | ✅  | ✅  | ✅              | ✅           | ✅          | limited       | limited      | ❌         |
| View own campus reports | ✅         | ✅  | ✅  | ✅              | ✅           | ✅          | ✅            | ✅           | ✅         |
| **Set goals**           | ✅         | ❌  | ❌  | ❌              | ❌           | ✅          | ❌            | ❌           | ❌         |
| **Approve goal unlock** | ✅         | ✅  | ✅  | ✅              | ❌           | ❌          | ❌            | ❌           | ❌         |
| **Edit locked goal**    | ✅         | ✅  | ✅  | ✅              | ❌           | ❌          | ❌            | ❌           | ❌         |
| **Request goal unlock** | ❌         | ❌  | ❌  | ❌              | ❌           | ✅          | ❌            | ❌           | ❌         |

**Report Visibility Scope** (drives data filtering in API routes):

- `"all"` — SUPERADMIN, SPO, CEO, CHURCH_MINISTRY, GROUP_PASTOR, GROUP_ADMIN
- `"campus"` — CAMPUS_PASTOR, CAMPUS_ADMIN, DATA_ENTRY
- `"own"` — MEMBER (scaffolded)

---

## 10. Role-Aware Rendering Architecture

All leader-tier roles share the **same URL routes** under `/leader/*`. Role differentiation happens at the rendering layer, not the URL layer.

### How It Works

1. `ROLE_CONFIG` in `config/roles.ts` defines every role's capabilities
2. The leader layout reads `user.role` from `AuthContext`
3. The sidebar nav is built by filtering `LEADER_NAV_ITEMS` by `allowedRoles.includes(role)`
4. Page sections render by filtering section config arrays by `allowedRoles.includes(role)`
5. Action buttons render by filtering action config arrays by `allowedRoles.includes(role)` and current `report.status`
6. API routes enforce role permissions via `verifyAuth()` + `getRoleConfig(role).canX` checks

### Dashboard Mode

Each role's `ROLE_CONFIG` includes a `dashboardMode` field that determines the dashboard hero section:

| dashboardMode       | Roles                           | Dashboard Hero                                                                                                                                         |
| ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `"report-fill"`     | `CAMPUS_ADMIN`, `DATA_ENTRY`    | Active period report card with **"Fill Report"** CTA; if DRAFT/REQUIRES_EDITS period report exists, opens directly; otherwise CTA creates and opens it |
| `"report-review"`   | `CAMPUS_PASTOR`                 | Reports pending approval list with **"Review Reports"** CTA as hero                                                                                    |
| `"report-reviewed"` | `GROUP_ADMIN`, `GROUP_PASTOR`   | Reports awaiting group mark-as-reviewed with **"Mark Reviewed"** CTA                                                                                   |
| `"analytics"`       | `SPO`, `CEO`, `CHURCH_MINISTRY` | Analytics overview bento as hero; full read-only posture                                                                                               |
| `"system"`          | `SUPERADMIN`                    | Church-wide: compliance rate KPIs + pending update requests + recent activity                                                                          |

This is driven **entirely** by config — no role-split dashboard pages.

### Example: `/leader/reports/[id]`

This single page serves Campus Admin (edit mode), Campus Pastor (approve/request-edits mode), Group Admin (mark-reviewed mode), and Data Entry (view-only mode) — driven entirely by `ROLE_CONFIG` and status-filtered action configs.

---

## 11. API Design

All API routes follow REST conventions and return a standard envelope:

- **Success:** `{ success: true, data: T }`
- **Paginated:** `{ success: true, data: T[], total: number, page: number, pageSize: number }`
- **Error:** `{ success: false, error: string, code: number }`

### HTTP Status Codes

| Code | When                                       |
| ---- | ------------------------------------------ |
| 200  | Successful GET/PUT                         |
| 201  | Successful POST                            |
| 400  | Validation error (Zod parse failure)       |
| 401  | No valid auth token                        |
| 403  | Authenticated but insufficient role        |
| 404  | Resource not found                         |
| 409  | Conflict (e.g., invalid status transition) |
| 500  | Unexpected server error                    |

### Route Inventory

```
Auth:
  POST /api/auth/login
  POST /api/auth/logout
  GET  /api/auth/me
  POST /api/auth/refresh-token
  POST /api/auth/register
  POST /api/auth/forgot-password
  POST /api/auth/reset-password
  POST /api/auth/join
  GET  /api/invite-links/[token]
  POST /api/invite-links

Users:
  GET    /api/users
  GET    /api/users/[id]
  PUT    /api/users/[id]
  PATCH  /api/users/[id]/role
  DELETE /api/users/[id]

Org:
  GET|POST /api/org/campuses
  GET|PUT  /api/org/campuses/[id]
  GET|POST /api/org/groups
  GET|PUT  /api/org/groups/[id]

Report Templates:
  GET    /api/report-templates
  GET    /api/report-templates/[id]
  POST   /api/report-templates
  PUT    /api/report-templates/[id]
  DELETE /api/report-templates/[id]
  GET    /api/report-templates/[id]/versions

Reports:
  GET    /api/reports
  GET    /api/reports/[id]
  POST   /api/reports
  PUT    /api/reports/[id]
  DELETE /api/reports/[id]
  POST   /api/reports/[id]/submit
  POST   /api/reports/[id]/request-edits
  POST   /api/reports/[id]/approve
  POST   /api/reports/[id]/review
  POST   /api/reports/[id]/lock
  GET    /api/reports/[id]/history
  GET    /api/reports/[id]/versions
  GET    /api/reports/[id]/edits
  POST   /api/reports/[id]/edits
  POST   /api/reports/[id]/edits/[editId]/submit
  POST   /api/reports/[id]/edits/[editId]/approve
  POST   /api/reports/[id]/edits/[editId]/reject

Update Requests:
  GET    /api/report-update-requests
  POST   /api/report-update-requests
  GET    /api/report-update-requests/[id]
  POST   /api/report-update-requests/[id]/approve
  POST   /api/report-update-requests/[id]/reject

Analytics:
  GET /api/analytics/reports

Goals:
  GET  /api/goals?campusId=&month=&year=
  POST /api/goals
  PUT  /api/goals/[id]
  POST /api/goal-edit-requests
  POST /api/goal-edit-requests/[id]/approve
  POST /api/goal-edit-requests/[id]/reject

Notifications:
  GET  /api/notifications
  POST /api/notifications/[id]/read
  POST /api/notifications/read-all
```

---

## 12. Integration Readiness Notes

This system is designed to federate into a broader Harvesters CRM in the future:

1. **UUID IDs everywhere** — All entity IDs use `crypto.randomUUID()`. Matches CRM entity IDs.
2. **`organisationId` scaffolded** — `ReportTemplate`, `Report`, and top-level org entities all carry `organisationId` for multi-tenant federation.
3. **Module barrel exports** — Each `modules/<domain>/index.ts` provides a clean integration surface. A CRM host app can import modules without touching internal files.
4. **Stateless JWT auth** — Uses JWT + httpOnly cookies. Compatible with any SSO or identity federation layer.
5. **REST API conventions** — All routes follow REST conventions that can be placed behind an API gateway without modification.
6. **No hardcoded IDs** — `NEXT_PUBLIC_ORG_ID` from environment variables. Org IDs are never literals.
7. **Config-driven** — Role capabilities, hierarchy, and workflow are in config files, not in conditional logic. CRM integration can override configs without touching component code.

---

## 13. Relic Carry-Forward Table

The `relics/` folder contains the previous Harvesters Small Groups CRM. The following table documents what is being adapted, what is being discarded, and what is being built net-new.

### CARRY FORWARD (with modifications)

| Relic Source                                                | Target in New System              | Modifications Required                                                     |
| ----------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `relics/app/(auth)/`                                        | `app/(auth)/`                     | Content strings → `CONTENT`; styling → `--ds-*` tokens; keep logic         |
| `relics/providers/AuthProvider.tsx`                         | `providers/AuthProvider.tsx`      | Route logic updated for new roles; `/leader` for all leader-tier           |
| `relics/providers/AntdProvider.tsx`                         | `providers/AntdProvider.tsx`      | Remove hardcoded values; bridge all tokens from CSS vars                   |
| `relics/providers/ThemeProvider.tsx`                        | `providers/ThemeProvider.tsx`     | No changes required                                                        |
| `relics/lib/types.ts` (enums only)                          | `types/global.d.ts`               | All enums adapted; interfaces rewritten to new architecture                |
| `relics/lib/utils/auth.ts`                                  | `lib/utils/auth.ts`               | Minimal changes — role validation updated                                  |
| `relics/lib/utils/jwt.ts`                                   | `lib/utils/jwt.ts`                | No changes required                                                        |
| `relics/lib/utils/middleware.ts`                            | `lib/utils/middleware.ts`         | All leader-tier roles → `/leader/*`; DATA_ENTRY added                      |
| `relics/app/globals.css`                                    | `app/globals.css`                 | Replace parallel token systems with single `--ds-*` architecture           |
| `relics/components/ui/`                                     | `components/ui/`                  | Rewrite using `--ds-*` tokens; fix indigo sidebar; remove hardcoded colors |
| `relics/app/api/reports/`                                   | `app/api/reports/`                | Already substantially built in relics; minor adaptations                   |
| `relics/app/api/report-templates/`                          | `app/api/report-templates/`       | Carry forward; validate Zod schemas                                        |
| `relics/app/api/report-update-requests/`                    | `app/api/report-update-requests/` | Carry forward                                                              |
| `relics/app/api/invite-links/`                              | `app/api/invite-links/`           | Carry forward                                                              |
| `relics/app/api/notifications/`                             | `app/api/notifications/`          | Adapt to report-only notification types                                    |
| `relics/app/api/analytics/`                                 | `app/api/analytics/`              | Keep report analytics; remove member/group CRM analytics                   |
| `relics/app/leader/reports/`                                | `app/leader/reports/`             | Adapt to new module/config architecture                                    |
| `relics/app/superadmin/reports/`                            | `app/superadmin/reports/`         | Adapt to new architecture                                                  |
| `relics/app/profile/`                                       | `app/profile/`                    | Carry forward; update styling                                              |
| Design system tokens from `relics/.github/design-system.md` | `app/globals.css`                 | Fully carried forward — `--ds-*` token system                              |

### REMOVE (relics to discard)

| Relic                                                                                                                                     | Reason                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `relics/app/api/meetings/`                                                                                                                | CRM relic — meeting scheduling                            |
| `relics/app/api/interactions/`                                                                                                            | CRM relic — interaction logging                           |
| `relics/app/api/follow-ups/`                                                                                                              | CRM relic — follow-up reminders                           |
| `relics/app/api/membership-requests/`                                                                                                     | CRM relic — group membership                              |
| `relics/app/api/campaigns/`                                                                                                               | CRM relic — campaigns                                     |
| `relics/app/api/campuses/`, `zones/`, `cells/`, `departments/`, `groups/`                                                                 | Replaced by `/api/org/*` pattern                          |
| `relics/app/leader/meetings/`, `follow-ups/`, `groups/`, `my-group/`, `referrals/`, `schedule/`, `interactions/`, `requests/`, `members/` | CRM relic pages                                           |
| `relics/app/superadmin/meetings/`, `groups/`, `referrals/`, `schedule/`, `interests/`                                                     | CRM relic pages                                           |
| `relics/app/member/meetings/`, `membership-requests/`, `my-group/`, `history/`                                                            | CRM relic pages                                           |
| `relics/components/features/meetings/`, `interactions/`, `campaigns/`, `membership/`, `communications/`, `groups/`                        | CRM relic components                                      |
| `relics/lib/data/database.ts`                                                                                                             | Replaced by `lib/data/mockDb.ts` (EventEmitter singleton) |
| `relics/lib/data/mockData.ts`                                                                                                             | Replaced by `lib/data/seed.ts`                            |
| `relics/lib/constants/index.ts`                                                                                                           | Replaced by `config/` layer                               |
| `relics/lib/types.ts`                                                                                                                     | Replaced by `types/global.d.ts`                           |
| "Church Fellowship CRM" all naming in UI                                                                                                  | Not this system                                           |

### BUILD NET-NEW

| Feature                                                                            | Description                                                       |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `types/global.d.ts`                                                                | New global ambient type declarations                              |
| `config/` (all files)                                                              | content.ts, roles.ts, hierarchy.ts, reports.ts, routes.ts, nav.ts |
| `lib/data/mockDb.ts`                                                               | EventEmitter singleton with Prisma-compatible CRUD                |
| `lib/data/mockCache.ts`                                                            | TTL cache with ioredis-compatible API                             |
| `lib/data/seed.ts`                                                                 | Deterministic seed fixtures                                       |
| `lib/hooks/useMockDbSubscription.ts`                                               | Live DB subscription hook                                         |
| `lib/hooks/useRole.ts`                                                             | Role capabilities hook                                            |
| `modules/reports/`, `templates/`, `users/`, `org/`, `analytics/`, `notifications/` | Full modular domain architecture                                  |
| `DEFAULT_REPORT_TEMPLATE` (11 sections)                                            | Seeded template config                                            |
| `ROLE_CONFIG`                                                                      | Data-driven role capabilities                                     |
| `ORG_HIERARCHY_CONFIG`                                                             | Data-driven hierarchy                                             |
| Report edit entity workflow                                                        | Separate `ReportEdit` entity; preserves original                  |
| Post-deadline update request workflow                                              | `ReportUpdateRequest` → Superadmin approval                       |
| Full audit trail                                                                   | `ReportEvent` + `ReportVersion` on every state change             |
| Data entry role & interface                                                        | Historical report back-fill capability                            |
