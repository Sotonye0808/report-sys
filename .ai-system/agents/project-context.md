# Project Context

> **IMPORTANT:** This file is the canonical project context for the Harvesters Reporting System. All AI agents and automation must reference `.ai-system/` as the single source of truth. Any .github AI/dev artifacts are pointers only.

---

## Project Purpose

The Harvesters Central Reporting System is a **standalone, role-based web application** for Harvesters International Christian Center. It standardizes report collection, review, approval, and analytics across all campuses and groups, replacing fragmented Excel/WhatsApp/Word processes with a single, auditable, and analytics-ready system. The system is designed for future federation into a broader CRM platform, with all entities using UUIDs and no hardcoded org IDs.

---

## Project Purpose

> **Section summary:** What this project does and why it exists.

[Describe the project goal in plain language]

---

## Target Users

### Stakeholder & User Roles

| Role            | Label           | Route       | Primary Responsibility                                                                                          |
| --------------- | --------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| SUPERADMIN      | Super Admin     | /superadmin | Full system access: template management, user management, goal overrides, org management, data entry            |
| SPO             | Senior Pastor   | /leader     | Reviews all group reports for executive oversight; approves goal unlock requests; read-all analytics            |
| CEO             | CEO             | /leader     | Reviews all group reports for final oversight; approves goal unlock requests; read-all analytics                |
| CHURCH_MINISTRY | Church Ministry | /leader     | Reviews and stores all reports; approves goal unlock requests; primary record-keeper with full analytics access |
| GROUP_PASTOR    | Group Pastor    | /leader     | Reviews all campus reports under their group; marks reports as Reviewed                                         |
| GROUP_ADMIN     | Group Admin     | /leader     | Sets goals (annual/monthly per metric, with campus overrides); consolidates campus reports; marks Reviewed      |
| CAMPUS_PASTOR   | Campus Pastor   | /leader     | Reviews submitted campus reports; approves or requests edits                                                    |
| CAMPUS_ADMIN    | Campus Admin    | /leader     | Primary report filler; compiles and submits consolidated campus report                                          |
| DATA_ENTRY      | Data Entry      | /leader     | Enters historical/back-filled reports with custom date selection; no review/approval capabilities               |
| USHER           | Usher           | /quick-form | Quick-form data entry only; sees only metrics assigned to them via `FormAssignment` and never the goal context  |
| MEMBER          | Member          | /member     | Scaffolded only — defined in enums and ROLE_CONFIG but no routes built in this iteration                        |

---

## Business Constraints

## Business Constraints

- Must support strict role-based access and hierarchical report flow
- All user-visible strings and repeated UI must be config-driven (see `config/content.ts`)
- All domain types and enums are global (see `types/global.d.ts`)
- No relic CRM features (see Out of Scope)
- All IDs are UUIDs; no hardcoded org/campus/group IDs
- Design tokens (`--ds-*`) are the only allowed color/spacing source
- Admin-editable config substrate (`lib/data/adminConfig.ts`) must remain DB-first with `config/*` as the immutable fallback. No role names, dashboard widget IDs, metric IDs, push install copy, or import-mapping shapes may be hardcoded in module code — bind them through the namespace loader so admins can tune them at runtime without a deploy.
- Role labels, capabilities, hierarchy order, dashboard mode, and visibility scope are runtime-CRUDable for every role **except SUPERADMIN**, which is absolute. `lib/auth/permissions.ts` (`sanitiseRoleConfigPayload` + `freezeSuperadmin`) enforces this server-side regardless of payload contents.
- Hierarchy levels are runtime-CRUDable in shape and depth (group → campus today, but admins can add/remove/reorder levels and bind leader/admin roles per level via the `hierarchy` admin-config namespace). All hierarchy-aware code reads through `resolveHierarchyLevels()` with `ORG_HIERARCHY_CONFIG` as the immutable fallback.
- Per-role cadence (frequency, expected weekdays, deadline hours, auto-fill title template) is admin-editable through the `roleCadence` namespace with hardcoded `RoleConfig.cadence` fallbacks. Cadence drives recurring-assignment expansion, report-shell auto-creation, and the auto-filled report title + period. SUPERADMIN does not fill reports and has no cadence.
- Existing reports and templates must continue to function when new optional fields are absent. Read paths must null-coalesce to safe defaults: legacy templates resolve recurrence from role cadence, legacy reports without `autoCreated` are treated as user-created, metrics without `correlationGroup` are silently excluded from correlation analytics rather than raising.
- Migrations against any data-bearing environment are strictly additive. Never use `prisma migrate reset` or any destructive operation; apply with `prisma migrate deploy`. Drift resolution uses `prisma migrate resolve` only when explicitly approved.
- SUPERADMIN may impersonate any non-SUPERADMIN role for time-limited preview (default 30 min). Mutations are gated by a server-enforced read-only mode by default; switching to mutate mode tags every audit row + side-effect with the impersonation context. SUPERADMIN identity always remains the actor of record. Impersonating SUPERADMIN is forbidden by both UI and server.
- Quick-form assignment rules (`FormAssignmentRule`) are admin-editable through `/templates/[id]?tab=assignments`. Direct DB writes are not the supported path; the editor enforces metric-subset belongs to template + role/scope coherence.
- Auto-total metric values are server-computed (sum) on every report write. The form renders auto-total cells read-only with an "AUTO" tag; the comment is auto-generated listing the source metric names. SECTION-scoped totals only sum same-section sources; cross-section opt-in requires `autoTotalScope: "TEMPLATE"`. Chains and self-references are rejected at template save time.
- Week-on-Week comparison is opt-in per metric (`capturesWoW: true`). Server attaches prior-week values to the report payload before returning to the client; missing prior-week reports degrade silently (no error, no indicator). Only meaningful for weekly-cadence templates.
- Email content (subjects, HTML, placeholder variables) is admin-editable through the `emailTemplates` admin-config namespace. Hardcoded templates in `lib/email/templates/definitions.ts` remain the immutable fallback; the per-template variable allowlist is fixed by the registry and not extensible at runtime.
- Users table is the canonical user directory: it surfaces invited (`PENDING_INVITE`) and pre-registered (`ACTIVATION_PENDING`) users alongside active accounts. Filters live in `config/content.ts.usersList.statusLabels`.
- AdminConfigPage uses bespoke GUI editors for every namespace; the JSON editor is retained only as a defensive fallback for unknown namespaces.

---

## Current Project Phase

## Current Project Phase

Phase: Active Development
Active sprint focus: Production readiness, bug fixes, and quarterly summaries feature

Aggregation closure note (2026-04-05):
- Role-aware aggregation scope resolution now uses shared org rollup context helper behavior (campus/group/global-safe defaults).
- Aggregation retrieval remains draft-inclusive by default (`includeDrafts`) and is validated in targeted tests for campus/group/global paths.

---

## Tech Decisions Already Made

## Tech Decisions Already Made

| Decision                    | Reason                                           |
| --------------------------- | ------------------------------------------------ |
| Next.js 16+ App Router      | Modern SSR/SSG, strict typing, future federation |
| TypeScript strict mode      | Safety, maintainability, integration readiness   |
| Ant Design v6 + Tailwind v4 | Design system, rapid UI, token-driven theming    |
| Zod at all API boundaries   | Runtime type safety                              |
| JWT + httpOnly cookies      | Secure, scalable auth                            |
| All domain types global     | No per-file type imports, easier federation      |
| No relic CRM features       | Prevents scope creep, keeps system focused       |

---

## Out of Scope

## Out of Scope

- Meeting scheduling and attendance tracking
- Interaction logging (calls, check-ins, follow-ups in the CRM sense)
- Membership join/transfer requests (CRM-style group membership)
- Campaign management
- Small group / cell community management
- "Church Fellowship CRM" naming anywhere in UI or code
- Follow-up reminder system (CRM-style)

---

## External Integrations

> **Section summary:** Third-party services and APIs this project connects to.

| Service   | Purpose        | Auth Method              |
| --------- | -------------- | ------------------------ |
| [service] | [what it does] | [API key / OAuth / etc.] |

---

## Substrate Constraints (added 2026-05-06)

> Decisions baked into the platform's design that future agents need to honour:

- **Polymorphic org units.** The platform stores every "scope" entity (campus, group, department, zone, anything an admin defines) in a single `OrgUnit` table with a self-FK + `level` + `rootKey`. Multiple parallel trees coexist (e.g. a `primary` tree of Group → Campus alongside a `departments` tree). Existing `Campus` + `OrgGroup` rows mirror into `OrgUnit` with the same UUIDs, so legacy FKs continue to resolve. Any new feature that asks "what scopes does this user belong to?" should consult `lib/data/orgUnitMatcher.ts → unitInScope(target, scopes)` rather than equality on `campusId` / `orgGroupId`.
- **Runtime role substrate.** Roles are CRUD-able at runtime via the `Role` table + `RolesEditorV2` UI. Built-in rows mirror the `UserRole` enum and are protected from delete; SUPERADMIN is fully immutable. Custom roles can be created without a deploy. Capability checks should prefer `hasCapabilityForUser(user, capability)` (reads runtime Role first, falls back to enum overlay) when the runtime substrate matters.
- **Public-copy substrate.** Every public-facing page (landing, how-it-works, about, privacy, terms, footer) is admin-editable through Admin Config namespaces with hardcoded fallbacks in `config/content.ts`. The hardcoded fallbacks **must read for everyday users**: no "polymorphic substrate", "Pearson r", "additive migrations", "PostgreSQL", "Cloudinary", "Resend", "config-driven", "enum", or other engineering jargon. Technical terminology belongs in `system-architecture.md` only.
- **Build-time DB safety.** Server components that read from the substrate (`loadAdminConfig`, `loadPublicCopy`, etc.) automatically short-circuit to the typed fallback when `NEXT_PHASE === "phase-production-build"`. New data-fetching server components should consult `isBuildPhase()` from `lib/utils/buildPhase.ts` if they hit remote infrastructure.
- **Name resolution.** The UI never renders raw FK UUIDs. Use `useEntityNames` (client) or `resolveEntityNames` (server) to turn ids into human-readable names. The `check:no-hardcoded-labels` audit script enforces that user-facing strings don't hardcode hierarchy / role labels — both belong in the substrate.
- **Migrations are additive.** Every new column / table / index uses `IF NOT EXISTS` and idempotent back-fills. No `DROP`, no `RENAME`, no `TRUNCATE` against data-bearing environments. Apply migrations via `prisma migrate deploy` only; `migrate reset` is forbidden in production.
