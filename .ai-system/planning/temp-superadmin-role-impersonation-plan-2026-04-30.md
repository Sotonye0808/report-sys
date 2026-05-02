# Temp Plan — Superadmin Role Impersonation / Preview

> **Date:** 2026-04-30
> **Status:** Planning only. No code in this turn. Tasks at the bottom are the canonical sequence; mirror in `task-queue.md` once approved.
> **Driver:** Let SUPERADMIN safely **preview the app as another role** (e.g. land on the GROUP_ADMIN dashboard, walk an USHER's quick-form flow) so QA, training, and "what does this user actually see?" diagnostics can happen without seeding throwaway accounts. The original SUPERADMIN identity stays intact for audit; mutations are gated behind an explicit "make changes" toggle and every state-changing action is tagged in the audit log.

---

## 1. Feature Summary

**Impersonation session.** SUPERADMIN starts a session targeting a role (and optionally a specific user account) from a new "Impersonate" affordance in the user menu / Admin Config / users table. The server signs an `impersonation` JWT alongside the regular access token; subsequent API calls and SSR pages compute an `effectiveRole` (= the impersonated role) while keeping `actorId` = the SUPERADMIN's id. A site-wide banner makes the mode unmistakable and offers one-click exit.

**Two safety modes**, surfaced in the start dialog and editable mid-session:
- **`read-only`** (default): every mutating API endpoint short-circuits with `403 impersonation_readonly` (audit-logged but not applied). Reads, navigation, and form-state changes are unaffected so the SUPERADMIN can walk a flow end-to-end without touching production data.
- **`mutate`**: writes proceed, but every audit row gets `actorImpersonating: true` + `impersonatedRole: <role>` + `impersonatedUserId?: <id>`. Notifications/emails generated as a side-effect carry the same tag so users can later see "this was done by superadmin while previewing as you".

**Everything time-limited.** Sessions expire after `IMPERSONATION_TTL_MINUTES` (default 30). Refresh extends only with explicit user gesture. Cookie is marked `Secure; HttpOnly; SameSite=Lax` and signed with `JWT_SECRET`; presence is also reflected in `/api/auth/me` so the client banner always agrees with the server.

**Targeted vs. role-wide.** Two start modes:
- **Role-only**: effective role overrides + scope inferred from `roleVisibilityScope` (e.g. previewing as CAMPUS_ADMIN with no user → scope falls back to "first campus you can see"). Useful for blank-slate UX checks.
- **As-user**: pick a specific user (by email/role/scope filter) to inherit their `campusId`, `orgGroupId`, profile preferences, and notification-preference shape. Useful for replication-of-bug diagnostics.

**Audit-everything.** Start, stop, refresh, every mutation while impersonating, every login attempt while impersonating-cookie is present — all written through the existing `lib/utils/audit.ts` with a new `IMPERSONATION_*` event family. Read-only access also emits a session-summary event on stop with the page paths visited (capped to 50, deduped) for full traceability.

**Out of scope for this slice** (explicit non-goals):
- Non-SUPERADMIN impersonation. Only SUPERADMIN can start a session.
- Impersonating SUPERADMIN itself (UI hides the option; server rejects).
- Cross-user data export/spoofing of cryptographic identity (no token re-issuance for the impersonated user; their session is unaffected).

---

## 2. Architecture Impact

| Layer | Affected | Change |
|---|---|---|
| `prisma/schema.prisma` | additive | Add `ImpersonationSession` model: `id`, `superadminId`, `impersonatedRole UserRole`, `impersonatedUserId String?`, `mode ('READ_ONLY' \| 'MUTATE')`, `startedAt`, `expiresAt`, `endedAt?`, `endedReason ('USER' \| 'EXPIRED' \| 'TOKEN_INVALIDATED')?`, `eventCount Int @default(0)`. Plus `ImpersonationEvent` (sessionId, type `STARTED \| STOPPED \| MUTATION_BLOCKED \| MUTATION_APPLIED \| PAGE_VISITED \| AUTH_REJECTED`, path, method, status, timestamp, requestId, payloadDigest String?). Strictly additive migration (`ADD COLUMN IF NOT EXISTS` / `CREATE TABLE IF NOT EXISTS`). |
| `lib/utils/auth.ts` | extend | `verifyAuth` returns enriched `AuthUser` with `actualRole`, `effectiveRole`, `impersonation?: { sessionId, mode, expiresAt }`. Existing callers reading `auth.user.role` switch over time — for v1, set `auth.user.role = effectiveRole` (back-compat) and surface `actualRole` for audit/logging only. |
| `lib/auth/impersonation.ts` | **new** | Sign/verify an `IMPERSONATION_TOKEN` cookie (separate from the access token so revoking impersonation doesn't sign-out the user). Helpers: `startSession(superadmin, target)`, `stopSession(sessionId, reason)`, `attachToCookies(res, token)`, `verifySessionFromCookies()`. |
| `lib/auth/permissions.ts` | wrap | Add `assertNotReadOnly(auth, req)` — returns 403 with `code: "impersonation_readonly"` if `auth.user.impersonation?.mode === "READ_ONLY"` and the request method is mutating (POST/PUT/PATCH/DELETE). Allowlist a handful of safe writes (e.g. `/api/notifications/.../read` is harmless and improves preview fidelity). |
| `app/api/impersonation/start/route.ts` | **new** | POST `{ impersonatedRole, impersonatedUserId?, mode? }` → SUPERADMIN-only; rejects when `impersonatedRole === SUPERADMIN`; rejects user-target where target is also SUPERADMIN; returns the new cookie. |
| `app/api/impersonation/stop/route.ts` | **new** | POST → drops the cookie + writes `STOPPED` event. |
| `app/api/impersonation/me/route.ts` | **new** | GET → returns the active session (or `null`); used by the banner + `useImpersonation()` hook. |
| `app/api/auth/me/route.ts` | extend | Already returns the auth user; add `effectiveRole` + `impersonation` summary so the client doesn't need a second roundtrip. |
| `lib/utils/audit.ts` | extend | New event family `IMPERSONATION_*`. The existing audit helper accepts the actor; impersonation context (sessionId, impersonatedRole, impersonatedUserId) is added to the event payload by all mutation handlers via a tiny `lib/auth/impersonationContext.ts` accessor. |
| `app/api/**/route.ts` (mutation handlers) | one-line touch | At the top of each mutating handler, call `assertNotReadOnly(auth, req)`. Audit entries automatically pick up impersonation context via the new accessor (no per-route changes beyond the gate call). |
| `providers/AuthProvider.tsx` | extend | Surface `effectiveRole` + `impersonation` on the auth context; consumers continue reading `user.role` (which is now the effective role). Add `startImpersonation` / `stopImpersonation` actions. |
| `components/ui/ImpersonationBanner.tsx` | **new** | Sticky top banner mounted in the dashboard layout when `impersonation` is non-null. Shows actual identity, impersonated role/user, mode (READ_ONLY / MUTATE), countdown to expiry, "Switch mode", "Exit". |
| `modules/admin-config/components/...` | optional | "Start impersonation" CTA in the Roles tab + Users table row action. |
| `modules/users/components/UsersListPage.tsx` | extend | Per-row "Preview as this user" action (SUPERADMIN-only), which jumps to a pre-filled start dialog. |
| `config/content.ts` | new namespace | `impersonation` (banner copy, toast strings, mode labels, audit event labels). |
| `config/routes.ts` | extend | API routes for `/api/impersonation/{start,stop,me}`. |
| `.env.example` | new env | `IMPERSONATION_TTL_MINUTES` (default 30), `IMPERSONATION_ENABLED` (default true). |

---

## 3. New Modules / Services

- **`lib/auth/impersonation.ts`** — signs/verifies the `IMPERSONATION_TOKEN` cookie (same JWT secret family, separate `aud`), persists `ImpersonationSession`/`ImpersonationEvent`, and provides `loadActiveSession()` for handlers.
- **`lib/auth/impersonationContext.ts`** — request-scoped accessor (uses Next's `cookies()` + cached helper) that handlers can read for audit context without re-verifying the JWT.
- **`app/api/impersonation/{start,stop,me}/route.ts`** — minimal endpoints, all SUPERADMIN-only.
- **`components/ui/ImpersonationBanner.tsx`** — sticky banner + countdown.
- **`modules/admin-config/components/ImpersonationStartDialog.tsx`** — start dialog (role select, user lookup, mode toggle, optional duration override capped at TTL).
- **`lib/hooks/useImpersonation.ts`** — read-only hook over the auth context that exposes `{ active, mode, expiresAt, exit }`.

---

## 4. Data Flow

### 4a. Start

```
SUPERADMIN clicks "Preview as <role>" or "Preview as <user>"
  → POST /api/impersonation/start { impersonatedRole, impersonatedUserId?, mode='READ_ONLY' }
    → auth.role === SUPERADMIN ? else 403
    → impersonatedRole !== SUPERADMIN ? else 400
    → if impersonatedUserId: load profile; reject if SUPERADMIN; capture campusId/orgGroupId
    → create ImpersonationSession row
    → write ImpersonationEvent { type: STARTED, sessionId, ... }
    → sign IMPERSONATION_TOKEN { sessionId, superadminId, impersonatedRole, impersonatedUserId?, mode, exp }
    → set-cookie (HttpOnly, Secure, SameSite=Lax, Path=/, Expires=ttl)
  → response: { session: { ... } }
Client AuthProvider re-fetches /api/auth/me → effectiveRole flips → UI reflects.
```

### 4b. Mutating request while impersonating

```
POST /api/some/write
  → verifyAuth → returns AuthUser with impersonation = { mode: 'READ_ONLY', sessionId }
  → assertNotReadOnly(auth, req) → 403 impersonation_readonly
    → ImpersonationEvent { type: MUTATION_BLOCKED, path, method, status: 403 }
  → response 403 with friendly toast in UI

(if mode === 'MUTATE')
  → handler proceeds normally
  → audit emit picks up impersonation context → ImpersonationEvent { type: MUTATION_APPLIED, path, method, status: 2xx }
  → resulting domain audit row carries actorImpersonating + impersonatedRole tags
```

### 4c. Stop / expire / token-invalidated

```
SUPERADMIN clicks Exit (or TTL elapses, or another start replaces it):
  → POST /api/impersonation/stop
    → ImpersonationSession.endedAt = now, endedReason = 'USER'|'EXPIRED'|'TOKEN_INVALIDATED'
    → write ImpersonationEvent STOPPED
    → clear cookie
  → next /api/auth/me returns no impersonation → banner unmounts → effectiveRole = actualRole.
```

### 4d. Audit replay

```
Admin Config → "Impersonation log" tab (superadmin-only)
  → GET /api/impersonation/sessions?... lists past sessions with summary counts.
  → row click → events table for that session.
  → exportable CSV.
```

---

## 5. UI/UX

- **ImpersonationBanner** — full-width, color-token sticky bar pinned just under the dashboard header. States:
  - Default (READ_ONLY): info-tinted; copy "Previewing as <Role>{ for <Name>}? — read-only · expires in 23m". CTAs: `Switch to mutate`, `Exit preview`.
  - Mutate: warning-tinted; copy "Mutate mode — actions take real effect". CTAs: `Back to read-only`, `Exit preview`.
  - Expiring soon (<2 min): pulse animation + "Extend 30 min" CTA.
- **Start dialog** — role select + optional user typeahead (filterable by role/scope) + mode toggle + optional duration (snap to 5/15/30 min, capped at TTL).
- **User table row action** — SUPERADMIN-only "Preview as this user" with caret menu (mode default).
- **Toast on mutation block** — friendly: "Read-only preview — switch to mutate mode to apply changes, or exit preview."
- **Affordances always reversible** — Exit returns the user to where they were before starting (server passes through `?from=` or stores last-page in session start payload).
- **Keyboard escape hatch** — `Ctrl+Shift+E` triggers Exit.

---

## 6. Risks + Edge Cases

- **Privilege escalation** — the impersonation token must NEVER let a non-SUPERADMIN user mint one. Server-side `verifyAuth` checks `actualRole === SUPERADMIN` before accepting any session start; `loadActiveSession` ignores tokens whose `superadminId` no longer maps to a SUPERADMIN account.
- **Capability mismatch** — impersonating a role with capabilities the SUPERADMIN's actual role lacks must NOT grant the SUPERADMIN's actual identity new powers. Audit context records both `actualRole` (always SUPERADMIN) and `effectiveRole` so this stays clear post-hoc.
- **Mutation in `MUTATE` mode** — actions take real effect; treat audit log as the contract. Notifications generated to other users include "(by SUPERADMIN previewing as <Role>)" footer when impersonation is detected at fan-out time.
- **Self-immortality** — SUPERADMIN cannot impersonate SUPERADMIN; cannot demote their own access; can always exit (ESC + cookie clear path that doesn't require auth).
- **Session collision** — only one active session per SUPERADMIN; starting a new one auto-stops the prior with `endedReason: TOKEN_INVALIDATED`.
- **Token leak** — cookie is HttpOnly + Secure + SameSite=Lax. Token tied to `superadminId`; if the SUPERADMIN account is deactivated, all their sessions auto-fail at `loadActiveSession` time.
- **Unknown route writes** — every mutation handler that doesn't call `assertNotReadOnly` is a hole. We mitigate via a route-mounted helper `withImpersonationGuard(handler)` and lint rule that fails CI if a route module exports POST/PUT/PATCH/DELETE without invoking the helper. (Lint rule itself is a separate task in the queue; the helper ships in v1.)
- **Side-effect plumbing** — emails and push notifications must surface impersonation context. The `lib/email/templates/render.ts` flow gets an optional `actorContext` parameter that templates can render in a footer line; defaulted to none.
- **Read-only allowlist drift** — the `assertNotReadOnly` helper consults a small whitelist (mark notification read, log a page-visit telemetry, etc.). New routes can opt-in via `safeForReadOnly: true` on the handler, gated by review.
- **State pollution by the SUPERADMIN's own session** — the impersonation cookie is a separate cookie from the access token. Stopping impersonation clears only that cookie; the SUPERADMIN's session continues uninterrupted.
- **Test isolation** — playwright/cypress fixtures for impersonation must NOT spill across tests; rely on per-test cookie reset (already standard).
- **Audit volume** — page-visit events can balloon. Cap per-session event count at 500; on overflow, summarise to a single `EVENT_LIMIT_REACHED` row.

---

## 7. Concrete Tasks (canonical sequence)

> Mirror in `task-queue.md` under "Planned Feature — Superadmin Role Impersonation / Preview".

### Phase A — schema + safe additive migration

1. Add `ImpersonationSession` and `ImpersonationEvent` models in `prisma/schema.prisma`. Strictly additive.
2. Author `prisma/migrations/20260501_*_impersonation_sessions/migration.sql` (`CREATE TABLE IF NOT EXISTS`, no DROP/RENAME). Apply via `prisma migrate deploy`.
3. Regenerate Prisma client; `npx prisma validate`.

### Phase B — auth + session core

4. Add `lib/auth/impersonation.ts` (sign/verify cookie, start/stop session, `loadActiveSession`).
5. Add `lib/auth/impersonationContext.ts` (request-scoped accessor for audit handlers).
6. Extend `lib/utils/auth.ts → verifyAuth` to return `effectiveRole` + `impersonation` summary; keep `auth.user.role = effectiveRole` for back-compat. Add `actualRole` field for audit/logging.
7. Add `assertNotReadOnly(auth, req)` to `lib/auth/permissions.ts` with allowlist + `safeForReadOnly` opt-in.
8. Add `IMPERSONATION_TTL_MINUTES` (default 30), `IMPERSONATION_ENABLED` (default true) to `.env.example` + read in the impersonation module.

### Phase C — APIs

9. `app/api/impersonation/start/route.ts` — POST handler, SUPERADMIN-only, rejects SUPERADMIN as a target, writes `STARTED` event.
10. `app/api/impersonation/stop/route.ts` — POST handler, clears cookie, writes `STOPPED` event.
11. `app/api/impersonation/me/route.ts` — GET, returns active session for the calling SUPERADMIN.
12. `app/api/auth/me/route.ts` — extend response with `effectiveRole`, `actualRole`, `impersonation`.
13. Wrap every existing mutation handler with `assertNotReadOnly(auth, req)` (touch points are obvious from the existing route file inventory; one-line addition each).

### Phase D — UI

14. Extend `providers/AuthProvider.tsx` with `effectiveRole`, `impersonation`, `startImpersonation`, `stopImpersonation`.
15. Add `lib/hooks/useImpersonation.ts`.
16. Add `components/ui/ImpersonationBanner.tsx` (sticky banner + countdown + mode toggle + exit) and mount in the dashboard layout.
17. Add `modules/admin-config/components/ImpersonationStartDialog.tsx` (role select + user typeahead + mode + duration).
18. Add "Preview as this user" row action in `UsersListPage` (SUPERADMIN-only).
19. Add `Ctrl+Shift+E` keyboard escape handler.
20. `config/content.ts` `impersonation` namespace (banner copy, mode labels, toast text).
21. `config/routes.ts` API routes added.

### Phase E — audit + safety net

22. Extend `lib/utils/audit.ts` with `IMPERSONATION_*` event family.
23. Add domain audit tagging: every existing audit emit reads impersonation context and adds `actorImpersonating`, `impersonatedRole`, `impersonatedUserId`.
24. Email + push fan-out helpers append "(by SUPERADMIN previewing as <Role>)" footer when impersonation context is present.
25. `app/api/impersonation/sessions/route.ts` — paginated list of historical sessions with counts (SUPERADMIN-only).
26. Admin Config new tab "Impersonation log" rendering session list + events drilldown.

### Phase F — tests + docs

27. `test/impersonationGuard.test.ts` — `assertNotReadOnly` blocks POST/PUT/PATCH/DELETE in READ_ONLY mode; allowlist passes; non-impersonated traffic untouched.
28. `test/impersonationSessionFlow.test.ts` — start → stop lifecycle; SUPERADMIN-target rejection; expired-session rejection.
29. `test/impersonationCookieSecurity.test.ts` — token signature + `actualRole === SUPERADMIN` verification; tampered token rejected.
30. `test/impersonationMigrationAdditiveSafety.test.ts` — same forbidden-pattern guard as cadence migration.
31. Update `.ai-system/agents/system-architecture.md` with new modules + data-flow entries (44–48): start/stop lifecycle, read-only gate, audit tagging, impersonation log surface, env keys.
32. Update `.ai-system/agents/project-context.md` with new business constraint: "SUPERADMIN may impersonate any non-SUPERADMIN role for time-limited preview; mutations are gated and tagged in audit. SUPERADMIN identity stays the actor of record."
33. Update diagnostics-runbook with: how to trace an impersonated mutation in audit, how to force-end a stuck session, env toggles.
34. Update `.env.example` (`IMPERSONATION_TTL_MINUTES`, `IMPERSONATION_ENABLED`).

### Phase G — follow-ups (queued, not in initial pass)

- Lint rule that fails CI if a mutation route exports POST/PUT/PATCH/DELETE without calling `assertNotReadOnly` or marking `safeForReadOnly: true`.
- "Replay session" affordance that opens a read-only walkthrough of every page visited in a past session (uses the captured PAGE_VISITED events).
- Open a third mode `record-only` that captures intent without storing payloads — useful for compliance demos.

---

## 8. Architecture Doc Updates

- **`system-architecture.md`** — add module rows for `lib/auth/impersonation.ts`, `lib/auth/impersonationContext.ts`, `app/api/impersonation/*`, `components/ui/ImpersonationBanner.tsx`, `modules/admin-config/components/ImpersonationStartDialog.tsx`. Append data-flow entries (44–48): start/stop lifecycle; read-only gate; audit tagging; session log surface; env toggles. Add new env keys to the env table.
- **`project-context.md`** — business constraints: SUPERADMIN may impersonate any non-SUPERADMIN role for time-limited preview; mutations are gated and tagged; SUPERADMIN identity remains the actor of record; impersonating SUPERADMIN is forbidden by both UI and server.
- **`repair-system.md`** — log patterns once they appear (token-tampered rejection, stuck session at TTL boundary).

---

## 9. Single-Pass Cut

All Phase A → Phase F is in scope for one continuous implementation pass when approved. Phase G is queued explicitly so the lint rule and replay UX can land in a follow-up without blocking the core feature.

No code in this turn — awaiting plan approval.
