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
