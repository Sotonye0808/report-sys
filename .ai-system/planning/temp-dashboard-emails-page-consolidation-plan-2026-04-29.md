# Temp Plan — Dashboard Simplification + Page Consolidation + Unified Users + Email Templates Module + `type="email"` Sweep

> **Date:** 2026-04-29
> **Status:** Planning only. Tasks at the bottom are the canonical sequence; mirror in `task-queue.md` once approved.
> **Driver:** Make `/dashboard` the place where each role does the next obvious thing without leaving the page (insights, visualizations, embedded form for ushers), reduce route surface area by collapsing bulk-invites + bug-report-manage into their parent pages, surface invited/pre-registered users in the users table with status, and graduate email content to admin-editable config with a test/preview surface. Sweep email-collection inputs to HTML5 `type="email"`.

---

## 1. Feature Summary

Five adjacent improvements bundled because they share substrate (admin-config, role-aware rendering, dashboard widget registry) and share a single regression surface (auth → email → invite → onboarding flow):

1. **Dashboard simplification.** `/dashboard` becomes the role's primary work surface: CTAs render as a 2/3/4-column responsive grid (mobile/tablet/desktop) instead of a vertical stack; group and CEO bands see top-campus + metric-trend chart widgets and a one-paragraph "insight summary"; USHER / DATA_ENTRY see their next assignment as an inline editable card with autofill (`period`, `campusId`, `orgGroupId` from user profile, all editable).
2. **Page consolidation.** `/invites/bulk` and `/bug-reports/manage` are folded into `/invites?tab=bulk` and `/bug-reports?tab=manage` respectively. Old routes 308-redirect to the unified URL with the right tab key. Two nav entries are removed.
3. **Unified users directory.** `/users` lists active users + pre-registered users (inactive + activation token) + open invite links not yet consumed, each with a derived `status` (`ACTIVE` | `INACTIVE` | `ACTIVATION_PENDING` | `PENDING_INVITE`). Filter chips above the table.
4. **Email templates module.** Subject + HTML for every email template moves to the admin-config substrate (DB-first → hardcoded fallback). Admin Config gains an "Email Templates" tab with per-template editor, a variable allowlist surfaced as chips, a live preview, and a "Send test email" action. `lib/email/resend.ts` resolves rendered content via the new renderer instead of importing literals.
5. **`type="email"` sweep.** Every email-collection input across invites, bulk-invites, preregister, bug-report contact, register, forgot/reset/change password, email-change UI, and email-test surface gets `type="email" inputMode="email"`.

---

## 2. Architecture Impact

| Layer | Affected | Change |
|---|---|---|
| `modules/dashboard/components/DashboardPage.tsx` | CTA strip + new widget mounts | Replace vertical CTA stack with grid; render `UsherQuickFormWidget` when role has `canQuickFormFill` and there is ≥ 1 active assignment; expose `TopCampusChartWidget`, `MetricTrendSparkWidget`, `InsightSummaryWidget` to scope-overview bands |
| `modules/dashboard/widgets/registry.tsx` | Widget registry | Register four new widgets; extend `DEFAULT_LAYOUT` with new ids per band (no JSX branching, registry-only) |
| `modules/users/components/InvitesPage.tsx` | Tab shell | Wrap existing body in Tabs; second tab embeds `BulkInvitesPage` body. Tab key persisted in `?tab=` |
| `modules/bug-reports/components/BugReportsPage.tsx` | Tab shell | Same pattern; "Manage" tab visible only when capability allows |
| `app/(dashboard)/invites/bulk/page.tsx` | Deprecate | 308 → `/invites?tab=bulk` |
| `app/(dashboard)/bug-reports/manage/page.tsx` | Deprecate | 308 → `/bug-reports?tab=manage` |
| `config/nav.ts` | Nav entries | Drop `bulk-invites` and `bug-reports-manage` items |
| `modules/users/components/UsersListPage.tsx` | Status column + filter chips | New column reads derived status; filter chips above table |
| `app/api/users/route.ts` | Listing endpoint | Accept `?includeInvited=true&status=...`; delegate to unified directory helper |
| `lib/data/userDirectory.ts` | **new** | Joins active users + inactive-with-token + open-invite-links into one paginated stream with derived status |
| `lib/email/templates/registry.ts` | Refactor | Each template exports `{ id, defaultSubject, defaultHtml, variables: string[] }` so the loader can read fallback shape |
| `lib/email/templates/render.ts` | **new** | `{{var}}` substitution with strict per-template allowlist; unknown placeholders left literal + structured warning |
| `lib/email/resend.ts` | Helpers | Each `send*Email` resolves `(subject, html)` through the renderer (DB override → fallback) before calling `sendEmail` |
| `lib/data/adminConfig.ts` | Fallback registry | Add `emailTemplates` namespace with default snapshot derived from registry exports |
| `modules/admin-config/components/EmailTemplatesEditor.tsx` | **new** | Per-template editor + variable docs + live preview + "Send test" action |
| `modules/admin-config/components/AdminConfigPage.tsx` | Tab dispatcher | Replace generic JSON editor for `emailTemplates` with `EmailTemplatesEditor`; keep JSON editor as fallback for advanced users |
| `app/api/email/test/route.ts` | **new** | POST `{ templateId, toEmail, sampleVars }` → renders + sends (or returns preview when service disabled); per-user daily rate limit |
| `config/content.ts` | New copy namespaces | `usersList.statusLabels`, `dashboardWidgets`, `emailTemplates.adminLabels`, `bulkInvites.tabs`, `bugReports.tabs` |
| `config/routes.ts` | API routes | Add `/api/email/test`; keep both `/invites/bulk` and `/invites` route paths during the redirect window |
| Forms | `type="email"` sweep | Audit and update existing email-collection inputs across the auth + invite + bug-report + email-change surfaces |
| `.env.example` | New env | `RESEND_TEST_DAILY_LIMIT` (default 50); `EMAIL_TEMPLATES_DB_ENABLED` (default true; mirrors `ADMIN_CONFIG_DB_ENABLED` semantics) |

---

## 3. New Modules / Services

- **`lib/data/userDirectory.ts`** — `listDirectory(scope, filters): { rows, total }` returning rows with shape `{ id, email, firstName, lastName, role, status, source: "user" | "invite", invitedAt?, activationExpiresAt?, lastSignInAt? }`.
- **`lib/email/templates/render.ts`** — `renderTemplate(templateId, vars): { subject, html, missingVars: string[] }`. Caches loaded `emailTemplates` namespace per request.
- **`lib/email/templates/registry.ts`** — refactor existing static templates into `Record<string, EmailTemplateDefinition>` with declared `variables`.
- **`modules/admin-config/components/EmailTemplatesEditor.tsx`** — split-pane editor + preview + send-test flow.
- **`app/api/email/test/route.ts`** — test send endpoint with rate limit + readiness fallback.
- **Dashboard widgets** (`modules/dashboard/widgets/*Widget.tsx`):
  - `UsherQuickFormWidget` — inline assignment fill card (compact reuse of QuickFormFillPage logic).
  - `TopCampusChartWidget` — Recharts BarChart of approved-report counts per campus, capped at 5.
  - `MetricTrendSparkWidget` — Recharts AreaChart of compliance % over the last 6 months.
  - `InsightSummaryWidget` — text card with computed "biggest mover", "compliance delta vs last quarter", config-driven copy templates from admin-config `dashboardLayout.insights`.

---

## 4. Data Flow

### 4a. Embedded usher form on dashboard

```
USHER → /dashboard
  → DashboardPage routes USHER/DATA_ENTRY through scope-overview branch (if role has canQuickFormFill and active assignment exists)
  → UsherQuickFormWidget fetches /api/form-assignments?scope=me&status=active
  → If exactly 1 active: render inline (period, campusId, orgGroupId pre-filled from user profile, editable)
  → If >1: render the next-due as inline + a "more" link to /quick-form
  → On Save Draft / Submit: existing /api/form-assignments/[id]/quick-fill (no new server logic)
```

Auto-fill priority:
1. Assignment's `reportId` resolves the canonical period (server-truth) — this wins over local date.
2. User's `campusId` / `orgGroupId` pre-fill scope fields.
3. Today's date is only used when neither the assignment nor the report carry a period (e.g. weekly with rolling period).

### 4b. CTA grid

The existing CTA list (weekly-due, pending-approval, pending-review, drafts, requires-edits, verify-email) becomes:

```
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
  {visible.map(cta => <CtaCard … />)}
</div>
```

Severity color preserved via existing `typeStyles`. Each card has fixed height + ellipsis on long messages.

### 4c. Page consolidation

```
GET /invites/bulk      → 308 /invites?tab=bulk
GET /bug-reports/manage → 308 /bug-reports?tab=manage

Inside /invites:
  Tabs(activeKey = ?tab ?? "links") {
    "links": <InvitesActiveTab />     (existing InvitesPage body, unchanged)
    "bulk":  <BulkInvitesTab />       (existing BulkInvitesPage body, hoisted)
  }

Inside /bug-reports:
  Tabs(activeKey = ?tab ?? "submit") {
    "submit": <BugReportSubmitTab />  (existing /bug-reports body)
    "manage": <BugReportManageTab />  (existing /bug-reports/manage body, gated on capability)
  }
```

`destroyInactiveTabPane: false` so each tab's draft state survives switches. Tab change `router.replace()` updates `?tab=` without remount.

### 4d. Unified users directory

```
GET /api/users?includeInvited=true&status=ACTIVE,PENDING_INVITE
  → lib/data/userDirectory.listDirectory(scope, filters)
    1. Active users (existing query)
    2. Inactive users with non-expired UserActivationToken → status: ACTIVATION_PENDING
    3. Open InviteLink rows (isActive=true, usedAt=null, expiresAt > now) NOT matching an existing user email → status: PENDING_INVITE
    4. Merge (dedupe on email, ACTIVE > ACTIVATION_PENDING > PENDING_INVITE)
    5. Apply scope filtering (campus/group/global)
    6. Sort: ACTIVE then ACTIVATION_PENDING then PENDING_INVITE; secondary sort by createdAt desc
```

Status column: Tag (green/blue/orange/default). Filter chips above the table.

### 4e. Email templates module

```
Resolution path on send:
  send*Email(params) → renderTemplate(templateId, vars)
    → loadAdminConfig("emailTemplates")
        ├── DB row exists for templateId → use its subject + html
        └── otherwise → use registry default
    → substitute {{var}} for each known variable; skip unknown placeholders + warn
    → return { subject, html, missingVars }
  → sendEmail({ to, subject, html })

Editor write path:
  Admin saves emailTemplates namespace → admin-config PUT
    → loader sanitises payload: only registered templateIds; only registered variable refs accepted in subject/html; unknown placeholders accepted but warned about

Test send:
  POST /api/email/test { templateId, toEmail, sampleVars }
    → rate-limit (RESEND_TEST_DAILY_LIMIT per user per day)
    → renderTemplate(templateId, sampleVars)
    → if RESEND_API_KEY missing: return { preview: { subject, html }, mode: "preview-only" }
    → else: sendEmail + return { preview, mode: "sent", messageId }
```

---

## 5. UI/UX

- **CTA grid:** 2/3/4 cols at sm/md/lg; equal-height cards; severity colors + icons preserved; ellipsis on long messages with optional "more" expand. No new color tokens — design tokens only.
- **USHER inline widget:** single-column card, large inputs, autosave indicator, "Save draft" + "Submit". Heading shows next due date + section name. Below the card a small "X more assignments" link.
- **Top campus chart:** BarChart with brand-token colors, max 5 campuses, click → `/analytics`. Tooltip uses existing analytics formatter.
- **Metric trend spark:** AreaChart, height 80px, 6-month window, click → `/analytics?metricId=...`.
- **Insight summary:** plain text card with 1–2 sentences computed server-side from already-loaded reports payload — no extra round trip.
- **Tabs in /invites and /bug-reports:** AntDesign Tabs; tab key persisted in `?tab=`; back/forward navigation works; deep-linkable.
- **Status column + filter chips:** chips look like the existing `status` chip pattern in /reports; clicking toggles filter.
- **Email templates editor:** split-pane (left: subject input + Monaco-style textarea for HTML; right: live preview iframe sandboxed). Variable allowlist shown as chips below subject — clicking a chip inserts `{{var}}` at cursor. "Send test" opens a small modal asking for a recipient.
- **Email inputs:** `type="email" inputMode="email" autoComplete="email"` on every email-collection input. Server-side trim + lowercase remains the source of truth.

---

## 6. Risks + Edge Cases

- **USHER with multiple assignments** — show only next-due inline; others linked. Avoid clutter.
- **Auto-fill collision with assignment-bound period** — assignment is server-truth; client-side date never overrides.
- **Page-consolidation deep links** — keep old route folders for at least one release; 308 redirect with `?tab=` so bookmarks survive.
- **Tab draft loss on switch** — `destroyInactiveTabPane: false` + existing `useFormPersistence` prevents loss.
- **Status race on directory** — if a user accepts an invite during list rendering, the user row should win over the invite row at next refetch (dedupe on email + status priority).
- **Unknown email template vars** — leave literal `{{...}}`; render warns; admin sees a yellow "unmatched variable" pill in editor.
- **Test-send abuse** — per-user daily rate limit; test endpoint requires authenticated SUPERADMIN/admin-capable role.
- **Email service disabled at runtime** — test endpoint returns preview only; UI tags clearly.
- **Recharts perf on dashboard** — cap data points; use `ResponsiveContainer` height=80–160 to keep paint cheap.
- **`type="email"` validation strictness** — older browsers may reject valid + addresses (`a+b@c.com`); use `pattern` only when the form already enforces a stricter rule.
- **Removing nav entries** — ensure cached nav payloads on the client refresh after login (existing `RoleConfigProvider` reload covers this).

---

## 7. Concrete Implementation Tasks (canonical sequence)

> Mirror in `task-queue.md` under a "Planned Feature — Dashboard Simplification + Email Templates + Page Consolidation" block.

### Phase A — Page consolidation + email-input sweep

1. Convert `/invites` to a tabbed surface (Active links | Bulk create); persist tab in `?tab=`.
2. Convert `/bug-reports` to a tabbed surface (Submit | Manage); gate Manage on capability.
3. Replace `/invites/bulk` route handler with a 308 redirect to `/invites?tab=bulk`.
4. Replace `/bug-reports/manage` route handler with a 308 redirect to `/bug-reports?tab=manage`.
5. Drop `bulk-invites` and `bug-reports-manage` nav entries from `config/nav.ts`.
6. Sweep email-collection inputs to `type="email" inputMode="email" autoComplete="email"` across invite, bulk invite, preregister, bug-report contact email, register, forgot-password, reset-password, email-change UI.

### Phase B — Unified users directory

7. Add `lib/data/userDirectory.ts` joining active users + inactive-with-token + open invite links into one stream with derived status; respect scope filtering.
8. Extend `GET /api/users` with `includeInvited=true&status=...` flags wired to the directory helper.
9. Add `Status` column + filter chips to `UsersListPage` reading labels from `config/content.ts.usersList.statusLabels`.
10. Add `usersList.statusLabels` to `config/content.ts`.

### Phase C — Dashboard simplification

11. Restyle dashboard CTAs as `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3` of equal-height cards; preserve severity colors; ellipsis long messages.
12. Add `UsherQuickFormWidget` to `modules/dashboard/widgets/`; render only when role has `canQuickFormFill` + ≥ 1 active assignment.
13. Add `TopCampusChartWidget` (Recharts BarChart) — registered for `scope-overview-global` and `scope-overview-group` bands.
14. Add `MetricTrendSparkWidget` (Recharts AreaChart, 6-month window).
15. Add `InsightSummaryWidget` reading insight templates from `dashboardLayout.insights` admin-config (with sane fallback strings in `config/content.ts`).
16. Update `DEFAULT_LAYOUT` per role band to include new widget ids; surface them to Admin Config via the dashboardLayout JSON editor.
17. Auto-fill embedded form values for USHER/DATA_ENTRY: today's date when assignment lacks period, user's `campusId`, user's `orgGroupId`. All editable.

### Phase D — Email templates module

18. Refactor `lib/email/templates/registry.ts` so each template exports `{ id, defaultSubject, defaultHtml, variables: string[] }`.
19. Add `lib/email/templates/render.ts` with `{{var}}` substitution + per-template variable allowlist + structured warning on unknown placeholders.
20. Update each `send*Email` helper in `lib/email/resend.ts` to resolve subject + html via the renderer (DB override → fallback).
21. Add `emailTemplates` namespace to admin-config substrate (loader fallback returns a snapshot derived from the registry).
22. Add `modules/admin-config/components/EmailTemplatesEditor.tsx` (per-template editor, variable chips, live preview, send-test).
23. Wire EmailTemplatesEditor into `AdminConfigPage` for the `emailTemplates` namespace.
24. Add `POST /api/email/test`: zod-validate `{ templateId, toEmail, sampleVars }`; render via the new helper; send via Resend when configured else return preview; per-user daily rate limit (`RESEND_TEST_DAILY_LIMIT`).
25. Add a `sanitiseEmailTemplatesPayload` helper that drops template ids unknown to the registry on PUT (defence in depth).

### Phase E — Tests + docs

26. `test/userDirectoryStatus.test.ts` — derive status from user/invite/activation states; ACTIVE wins over PENDING_INVITE; ACTIVATION_PENDING preferred over PENDING_INVITE.
27. `test/emailTemplateRender.test.ts` — variable substitution, unknown-placeholder safety, fallback resolution, override resolution.
28. `test/dashboardCtaGrid.test.tsx` — grid renders 2/3/4 cols at the documented breakpoints (class assertion).
29. `test/dashboardWidgetRegistryUpdates.test.ts` — usher inline form widget registers; new widget ids resolve from layout overrides; widget gating by capability.
30. `test/pageConsolidationRedirects.test.ts` — `/invites/bulk` → `/invites?tab=bulk`; `/bug-reports/manage` → `/bug-reports?tab=manage` (308 + correct query).
31. `test/emailInputType.test.ts` — every email-collection input renders with `type="email"` (DOM smoke test where applicable, AST/regex sweep otherwise).
32. Update `.ai-system/agents/system-architecture.md` with new modules + data-flow entries (28–31).
33. Update `.ai-system/agents/project-context.md` with the two new business constraints (admin-editable email templates; users table is the canonical directory).
34. Update `.env.example` (`RESEND_TEST_DAILY_LIMIT`, `EMAIL_TEMPLATES_DB_ENABLED`).
35. Update diagnostics-runbook with: 308 redirect paths for consolidated pages; email-test rate-limit response codes; template render fallback path and unknown-placeholder warning location.

---

## 8. Architecture Doc Updates Required

- **`system-architecture.md`** — module breakdown rows for `lib/data/userDirectory.ts`, `lib/email/templates/render.ts`, `modules/admin-config/components/EmailTemplatesEditor.tsx`, `modules/dashboard/widgets/{UsherQuickFormWidget,TopCampusChartWidget,MetricTrendSparkWidget,InsightSummaryWidget}.tsx`. Append data-flow entries: (28) page-consolidation 308 redirects; (29) unified user directory query with derived status; (30) email template render with placeholder allowlist + DB-first override; (31) test-send endpoint readiness gating + rate limit. Add env keys.
- **`project-context.md`** — business constraints:
  - "Email content (subjects, HTML, placeholder variables) must be admin-editable through the substrate. Hardcoded templates remain as immutable fallbacks; the variable allowlist is fixed by the registry."
  - "Users table is the canonical user directory: it must surface invited and pre-registered users with status, not just active accounts. Filters live in `config/content.ts.usersList.statusLabels`."
- **`repair-system.md`** — log new patterns once they appear (e.g., template render unknown-placeholder warnings, status race in unified directory).

---

## 9. Single-Pass Cut

All 35 tasks are in scope for a single implementation pass when approved. Order: A → B → C → D → E. Tests run after each phase to catch regressions early; final typecheck at the end.

No code in this turn — awaiting plan approval.
