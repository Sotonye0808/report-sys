# Temp Plan — Build hygiene + quick-form (final) + name-resolution + public-copy plain-language sweep + remaining deferred work

> **Date:** 2026-05-06
> **Status:** Planning only. Awaits explicit approval before any code is written.
> **Driver:** Five concrete defects + the deferred follow-ups from the 2026-05-05 polymorphism pass surfaced during a build/preview session:
> 1. `next build` produces noisy (but non-fatal) Prisma + Redis errors during the page-data collection step, adding several minutes of timeout waits.
> 2. Quick form **still** shows no assignments when SUPERADMIN previews as USHER even after the visibility fix — root cause is *not* the report visibility check; it's the materialiser silently skipping rules when the target user lacks an `orgGroupId`.
> 3. UI surfaces (e.g. ProfilePage) render raw `campusId` UUIDs where a human-readable campus name belongs.
> 4. Public-page fallbacks shipped in the 2026-05-05 pass leak engineering jargon ("polymorphic substrate", "Pearson r", "config-driven", "additive migrations"). Public copy should read for everyday users; admins must have an obvious entry point to rewrite it.
> 5. Several deferred follow-ups from the prior plan need to land (aggregation engine + form-assignment matcher polymorphic upgrade, auth `roleId` resolver wiring, ESLint label rules, project-context.md update).

---

## 1. Feature summary

A targeted clean-up + finish-the-job pass:

- **Build hygiene.** Detect `process.env.NEXT_PHASE === "phase-production-build"` inside `loadAdminConfig` and short-circuit DB + Redis reads to fallback. Silences the build noise, slashes the build time by the Redis timeout window, and keeps runtime behaviour identical.
- **Quick-form, root-causefix.** The materialiser short-circuits at `if (!campusId || !orgGroupId) continue;` whenever the user's `orgGroupId` is null — but every campus already carries `parentId` pointing at its group, so the materialiser can *derive* `orgGroupId` from `campusId`. Fix it once, and the impersonation + production flows both stop silently dropping rules.
- **Name resolution everywhere.** Anywhere an FK id (campus / group / unit / role / user) is rendered to a user, resolve it through a small `useEntityNames(ids)` hook + a server-side `resolveEntityNames(ids)` helper so a stale id never leaks into the UI. ProfilePage today renders `user.campusId` directly — that's the immediate bug; the fix is shaped to also catch invites, reports, aggregation summaries, and analytics surfaces.
- **Public-copy plain-language sweep + visible admin entry point.** Rewrite the 2026-05-05 fallbacks in `config/content.ts` with non-technical language (no "substrate", "schema", "polymorphic", "Pearson r", "enum"). Surface a one-click "Edit page copy" CTA in the dashboard header for SUPERADMIN that deep-links into the matching Admin Config tab so admins can find the editor without hunting.
- **Deferred follow-ups.** Wire `unitInScope` through aggregation + the form-assignment matcher. Wire `auth.user.roleId` through the permissions resolver. Add ESLint `no-hardcoded-org-label` + `no-hardcoded-role-label` rules. Update `project-context.md` + `project-plan.md` with the polymorphic substrate constraints. Add deferred test coverage where the harness allows.

---

## 2. Architecture impact

| Layer | Affected | Change |
|---|---|---|
| `lib/data/adminConfig.ts` | extend | Detect build phase; return typed fallback without hitting DB or Redis. Same for `loadPublicCopy`. |
| `lib/data/recurringAssignmentService.ts` | bugfix | Derive `orgGroupId` from `campus.parentId` when caller passes `campusId` but `orgGroupId` is null. Keeps existing call sites unchanged. |
| `lib/data/formAssignmentRule.ts → ruleMatchesUser` | extend | Accept `unitIds[]` from the matcher; legacy `campusIds`/`orgGroupIds` continue to resolve for back-compat. |
| `lib/data/reportAggregation.ts` | extend | Filter by `unitInScope(reportUnitId, [scopeUnitId])` when the new `unitId` columns are populated; legacy `campusId`/`orgGroupId` equality stays as a parallel check. |
| `lib/auth/permissions.ts` | extend | New `resolveEffectiveRole(authUser)` reads from `Role` table when `auth.user.roleId` is set; otherwise overlays the legacy `roles` admin-config namespace as today. |
| `lib/data/entityNames.ts` | **new** | Shared resolver: `resolveCampusName(id)`, `resolveGroupName(id)`, `resolveUnitName(id)`, `resolveRoleLabel(code)`, `resolveUserName(id)`. Cached per request. |
| `lib/hooks/useEntityNames.ts` | **new** | Client hook that batches id → name lookups via a single `/api/labels/resolve` round-trip. |
| `app/api/labels/resolve/route.ts` | **new** | POST `{ campusIds, groupIds, unitIds, roleIds, userIds }` → `{ campuses, groups, units, roles, users }` keyed by id. Heavily cached. |
| `modules/users/components/ProfilePage.tsx` | bugfix | Render `useEntityNames` output instead of raw `user.campusId`. |
| `components/ui/AdminConfigShortcut.tsx` | **new** | Floating CTA visible to SUPERADMIN on public pages: "Edit page copy" → `/admin-config?tab=<ns>`. Hidden for guests. |
| `config/content.ts` | rewrite fallbacks | Strip technical terms from `landing.features`, `howItWorks.tabs[*].sections + faqs`, `aboutPage.sections`, `privacyPage.sections`, `termsPage.sections`. Every claim phrased for everyday users. |
| `eslint config` | new rules | `no-hardcoded-org-label` (fires on `"Campus"`/`"Group"`/`"campusId"` outside the resolver path) and `no-hardcoded-role-label` (fires on user-facing role label literals outside `config/roles.ts`). |
| `.ai-system/agents/project-context.md` + `project-plan.md` | refresh | Document polymorphic substrate constraints + tick Phase 6 items. |

---

## 3. New modules / services

- `lib/data/entityNames.ts` — server-side batched resolver (campus / group / unit / role / user) with a per-request memoisation map.
- `lib/hooks/useEntityNames.ts` — client hook batched via a single API call; drops back to "—" when the resource is gone (don't render UUIDs in failure states either).
- `app/api/labels/resolve/route.ts` — POST endpoint feeding the hook.
- `components/ui/AdminConfigShortcut.tsx` — superadmin-only edit-this-page affordance.
- `lib/utils/buildPhase.ts` — small helper exporting `isBuildPhase()` so caller boundaries don't sprinkle env checks.

---

## 4. Data flow

### 4a. Build-time short-circuit

```
next build → "Collecting page data" worker
    ↓
app/page.tsx renders → loadPublicCopy("landing")
    ↓
loadAdminConfig("landing")
    ↓
isBuildPhase()? → return fallback NOW (no DB, no Redis)
    : (existing DB-first / Redis-cache path)
    ↓
public page renders with fallback content
```

Build noise eliminated. Runtime requests in production behave exactly as today (substrate-first, fallback on miss).

### 4b. Quick-form materialise fix

```
SUPERADMIN previews as USHER (target user with campusId, no orgGroupId)
    ↓
QuickFormLandingPage POSTs /api/form-assignments/materialise
    ↓
materialiseAssignmentsForUser({ userId, role: USHER, campusId: target.campusId, orgGroupId: null })
    ↓
For each matching rule:
    campusId = input.campusId
    orgGroupId =
        input.orgGroupId
        ?? rule.orgGroupId
        ?? (campusId && (await campus.findUnique({ where: { id: campusId } }))?.parentId)
        ?? null
    if (!campusId || !orgGroupId) continue;   ← still safe; only fires when truly nothing resolves
    ↓
ensureReportShell({ campusId, orgGroupId, … }) creates report shell
    ↓
FormAssignment row materialised; quick form renders.
```

The lookup is one tiny `findUnique({ select: { parentId: true } })` per rule cycle — negligible cost; results can be memoised across rules in the same call.

### 4c. Name resolution

```
ProfilePage mounts → useEntityNames({ campusIds: [user.campusId] })
    ↓
hook batches a single POST /api/labels/resolve
    ↓
endpoint runs resolveCampusName / resolveGroupName / etc. server-side, returns { campuses: { [id]: name }, … }
    ↓
hook hands { campuses }[user.campusId] back to ProfilePage
    ↓
ProfilePage renders the name; falls back to the original id only if the resource genuinely no longer exists (rare; renders as "Unknown campus" rather than the UUID).
```

### 4d. Public-copy plain-language

```
Editor (admin) → /admin-config?tab=landing       (or "Edit this page" CTA on /)
    ↓
LandingCopyEditor reads the substrate snapshot
    ↓
Admin types/edits → POST /api/admin-config/landing
    ↓
Substrate stores DB override
    ↓
Public pages render the admin's text on next request

Hard-coded fallback text in config/content.ts is now jargon-free,
so even with no admin override the page reads naturally.
```

---

## 5. UI/UX considerations (per design-system.md)

- The new `AdminConfigShortcut` uses the same floating-affordance pattern as `<HelpLink />` — bottom-right, visible to SUPERADMIN only, opens the deep-linked tab. Reuses design tokens; no raw colours.
- `useEntityNames` always renders something — name on success, `"Unknown <kind>"` on the rare not-found, never the UUID. Loading state is a small `<Skeleton.Input size="small" />` so layouts don't jump.
- Public-page rewrites use second-person voice and short sentences. Examples:
  - **Before:** "Pearson correlations across template-defined metric groups, top-mover deltas, biggest-gap rankings — gated by a sample-size floor so the numbers stay honest."
  - **After:** "See which numbers move together, who's growing fastest, and where attention is needed — without crunching the data yourself."
- "Edit this page" CTA copy: "Edit page copy →". Tooltip explains the deep-link.

---

## 6. Risks + edge cases

- **Build-phase detection unreliable.** If `process.env.NEXT_PHASE` isn't set in some Next.js phases, `isBuildPhase()` returns false and the existing fallback path still kicks in safely. Net: no regression vs today.
- **Quick-form fix interacts with existing rows.** A rule that *intentionally* used null orgGroupId to mean "skip" doesn't exist — the schema requires both legs to materialise a shell. So deriving orgGroupId from campus is always strictly more correct.
- **Name-resolution latency on cold paths.** Hook is deliberately batched + the endpoint reads from a memoised in-process map per request. Worst case is one extra ~50ms round-trip on first paint; pages cache their resolved set in component state thereafter.
- **Public-copy admin entry point already exists** (Admin Config → Landing / How It Works / etc. tabs). The new shortcut is purely a discoverability boost; it's hidden for non-admins so there's no leak.
- **Aggregation polymorphic upgrade.** Today aggregation reads campusId-equality. Adding `unitInScope` as a *parallel* check (not a replacement) means legacy queries continue to work; multi-tree scopes also get covered. Zero regression risk if both checks run.
- **roleId resolver upgrade.** The existing `auth.user.role` enum stays the source of truth for back-compat; `auth.user.roleId` is consulted *first* and falls back to enum when null. Custom roles get capability resolution; built-ins keep working unchanged.
- **ESLint label rules** must allow the resolver paths (`config/hierarchy.ts`, `config/roles.ts`, `lib/data/entityNames.ts`, `lib/auth/permissions.ts`) so the rule doesn't block its own implementation.

---

## 7. Concrete implementation tasks (canonical sequence — append to task-queue.md)

### Phase A — Build hygiene

1. Add `lib/utils/buildPhase.ts` exporting `isBuildPhase()`.
2. Short-circuit `loadAdminConfig` to return the typed fallback when `isBuildPhase()` is true. Skip Redis cache reads + DB queries entirely on that path.
3. Verify with `npm run build` that the [adminConfig] / [cache] noise disappears and the build still succeeds.

### Phase B — Quick-form materialise (root-cause fix)

4. In `lib/data/recurringAssignmentService.ts`, derive `orgGroupId` from the campus's `parentId` when the caller supplies `campusId` but no `orgGroupId`. Memoise the lookup across rules in the same call.
5. Add a regression test (`test/recurringAssignmentDerivesGroupFromCampus.test.ts`) — pure function unit test using a stubbed prisma surface where possible.

### Phase C — Name resolution everywhere

6. Add `lib/data/entityNames.ts` with batched lookups + per-request memoisation.
7. Add `app/api/labels/resolve/route.ts` (auth-required POST).
8. Add `lib/hooks/useEntityNames.ts` with single-batch fetch + cache.
9. Refactor `modules/users/components/ProfilePage.tsx` to use the hook for campus + group labels.
10. Sweep any remaining surfaces that render `campusId` / `orgGroupId` / `unitId` / `roleId` / `userId` as raw text — Reports detail header, invites table, aggregation scope summary, analytics filter chips, dashboard widgets — and route them through the hook.

### Phase D — Public-copy plain-language sweep + admin entry point

11. Rewrite `config/content.ts` `landing.features` (6 entries) in plain language. No "substrate", "polymorphic", "config-driven", "Pearson r", "enum", "additive migrations".
12. Rewrite `howItWorks.tabs[*].sections + faqs` (every tab) in plain language; preserve the playgroundIds.
13. Rewrite `aboutPage.sections`, `privacyPage.sections`, `termsPage.sections` in plain language.
14. Add `components/ui/AdminConfigShortcut.tsx` (floating "Edit page copy" affordance, SUPERADMIN-only) and mount it in the public-page layouts (`/`, `/how-it-works`, `/about`, `/privacy`, `/terms`).
15. Add a `helpAnchors`-style entry mapping each public page to its Admin Config tab so the CTA's deep link resolves correctly.

### Phase E — Deferred polymorphic propagation

16. Refactor `lib/data/reportAggregation.ts` to add `unitInScope(reportUnitId, [scopeUnitId])` as a parallel scope check alongside the existing campusId/orgGroupId equality. Falls back to legacy when `unitId` is null.
17. Refactor `lib/data/formAssignmentRule.ts → ruleMatchesUser` to accept `unitIds[]` and dispatch via `mergeLegacyScope` so single-tree, multi-tree, and legacy-only rules all match.
18. Refactor `lib/auth/permissions.ts → resolveRoleConfig` to read the runtime `Role` table when `auth.user.roleId` is set, falling back to the legacy enum overlay otherwise.

### Phase F — Lint sweep

19. Add ESLint rule `no-hardcoded-org-label` (allowlist: `config/hierarchy.ts`, `lib/data/orgUnit.ts`, `lib/data/entityNames.ts`).
20. Add ESLint rule `no-hardcoded-role-label` (allowlist: `config/roles.ts`, `lib/data/role.ts`, `lib/data/entityNames.ts`).
21. Tag pre-existing string literals discovered by the rules with comment-line ignores where unavoidable; convert the rest to resolver calls.

### Phase G — Tests + docs

22. `test/buildPhaseShortCircuit.test.ts` — `loadAdminConfig` returns fallback when `NEXT_PHASE=phase-production-build`, hits Redis/DB otherwise.
23. `test/recurringAssignmentDerivesGroupFromCampus.test.ts` — campus-only user resolves orgGroupId via `campus.parentId`.
24. `test/entityNamesResolver.test.ts` — batch lookup, missing-id fallback, dedup.
25. `test/aggregationPolymorphicScope.test.ts` — legacy column-equality + `unitInScope` both produce the same result on seed data.
26. Update `.ai-system/agents/project-context.md` with multi-tree hierarchy + role CRUD + public-copy substrate constraints.
27. Update `.ai-system/planning/project-plan.md` Phase 6: tick "Admin-editable configuration system" + "Excel/Spreadsheet import"; add "Multi-tree polymorphic hierarchy" + "Plain-language public copy" lines.
28. Update `.ai-system/agents/repair-system.md` with three new error entries: build-phase noise, materialise-skip-on-null-orgGroupId, raw-id leakage.

---

## 8. Architecture doc updates required

- **`system-architecture.md`** — add module rows for `lib/data/entityNames.ts` + `lib/hooks/useEntityNames.ts` + `app/api/labels/resolve/route.ts` + `lib/utils/buildPhase.ts` + `components/ui/AdminConfigShortcut.tsx`. Add data-flow entries 79–84 covering: build-phase short-circuit, materialise group-derivation, label-resolver pipeline, polymorphic aggregation, polymorphic role resolver, plain-language public-copy contract.
- **`project-context.md`** — add a section: "Public-page copy is admin-editable. Hard-coded fallbacks must read for everyday users; technical terms belong in `system-architecture.md` only."
- **`repair-system.md`** — see task 28 above.
- **`project-plan.md`** — see task 27 above.

---

## 9. Single-pass cut

This is **one focused pass** of a few hours work. The five tracks share ~60% of the same files (admin-config loader, content.ts, public-page layouts, hierarchy + role resolvers) so bundling them avoids three rounds of cross-cutting changes.

Recommended order: A (build noise quietens immediately and shortens every subsequent build cycle) → B (quick-form unblocked) → C (name resolution) → D (plain-language + admin entry point) → E (polymorphic propagation) → F + G (lint + tests + docs).

**No code in this turn — awaiting plan approval per `plan-feature.md` contract.**
