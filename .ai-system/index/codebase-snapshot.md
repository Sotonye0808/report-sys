This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: package.json, app/**, config/**, lib/**, modules/**, providers/**, prisma/schema.prisma, types/**, .github/**, .ai-system/**
- Files matching these patterns are excluded: node_modules/**, .next/**, prisma/generated/**, relics/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.ai-system/agents/agent-bootstrap.md
.ai-system/agents/design-system.md
.ai-system/agents/general-instructions.md
.ai-system/agents/project-context.md
.ai-system/agents/repair-system.md
.ai-system/agents/system-architecture.md
.ai-system/checkpoints/session-log.md
.ai-system/commands/bootstrap-project.md
.ai-system/commands/dev-cycle.md
.ai-system/commands/fix-build.md
.ai-system/commands/generate-architecture.md
.ai-system/commands/plan-feature.md
.ai-system/commands/refactor-codebase.md
.ai-system/commands/self-heal.md
.ai-system/commands/update-ai-system.md
.ai-system/index/dependency-graph.md
.ai-system/index/repo-map.md
.ai-system/memory/architecture-history.md
.ai-system/memory/lessons-learned.md
.ai-system/memory/project-decisions.md
.ai-system/planning/project-plan.md
.ai-system/planning/task-queue.md
.ai-system/summaries/dev-history.md
.ai-system/testing/test-plan.md
.ai-system/testing/test-results.md
.github/abstract/reporting-logic-considerations.md
.github/copilot-instructions.md
.github/design-system.md
.github/plan.md
.github/project-context.md
.github/repair-instructions.md
.github/summaries/production-readiness-sprint.md
app/(auth)/forgot-password/layout.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/join/layout.tsx
app/(auth)/join/page.tsx
app/(auth)/layout.tsx
app/(auth)/login/layout.tsx
app/(auth)/login/page.tsx
app/(auth)/register/layout.tsx
app/(auth)/register/page.tsx
app/(auth)/reset-password/layout.tsx
app/(auth)/reset-password/page.tsx
app/(dashboard)/analytics/loading.tsx
app/(dashboard)/analytics/page.tsx
app/(dashboard)/bug-reports/manage/page.tsx
app/(dashboard)/bug-reports/page.tsx
app/(dashboard)/dashboard/loading.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/goals/loading.tsx
app/(dashboard)/goals/page.tsx
app/(dashboard)/inbox/loading.tsx
app/(dashboard)/inbox/page.tsx
app/(dashboard)/invites/loading.tsx
app/(dashboard)/invites/page.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/org/page.tsx
app/(dashboard)/profile/page.tsx
app/(dashboard)/reports/[id]/edit/page.tsx
app/(dashboard)/reports/[id]/page.tsx
app/(dashboard)/reports/loading.tsx
app/(dashboard)/reports/new/page.tsx
app/(dashboard)/reports/page.tsx
app/(dashboard)/settings/page.tsx
app/(dashboard)/templates/[id]/page.tsx
app/(dashboard)/templates/loading.tsx
app/(dashboard)/templates/new/page.tsx
app/(dashboard)/templates/page.tsx
app/(dashboard)/users/[id]/page.tsx
app/(dashboard)/users/loading.tsx
app/(dashboard)/users/page.tsx
app/api/analytics/metrics/route.ts
app/api/analytics/overview/route.ts
app/api/analytics/quarterly/route.ts
app/api/auth/change-password/route.ts
app/api/auth/forgot-password/route.ts
app/api/auth/login/route.ts
app/api/auth/logout/route.ts
app/api/auth/me/route.ts
app/api/auth/refresh/route.ts
app/api/auth/register/route.ts
app/api/auth/reset-password/route.ts
app/api/bug-reports/[id]/route.ts
app/api/bug-reports/route.ts
app/api/goals/[id]/route.ts
app/api/goals/[id]/unlock-request/route.ts
app/api/goals/for-report/route.ts
app/api/goals/route.ts
app/api/invite-links/[id]/route.ts
app/api/invite-links/route.ts
app/api/invite-links/validate/[token]/route.ts
app/api/notifications/[id]/read/route.ts
app/api/notifications/read-all/route.ts
app/api/notifications/route.ts
app/api/org/campuses/[id]/route.ts
app/api/org/campuses/route.ts
app/api/org/groups/[id]/route.ts
app/api/org/groups/route.ts
app/api/report-templates/[id]/route.ts
app/api/report-templates/route.ts
app/api/reports/[id]/approve/route.ts
app/api/reports/[id]/history/route.ts
app/api/reports/[id]/lock/route.ts
app/api/reports/[id]/request-edit/route.ts
app/api/reports/[id]/review/route.ts
app/api/reports/[id]/route.ts
app/api/reports/[id]/submit/route.ts
app/api/reports/route.ts
app/api/users/[id]/route.ts
app/api/users/profile/route.ts
app/api/users/route.ts
app/error.tsx
app/globals.css
app/layout.tsx
app/manifest.ts
app/not-found.tsx
app/offline/page.tsx
app/page.tsx
app/robots.ts
app/viewport.ts
config/content.ts
config/hierarchy.ts
config/nav.ts
config/reports.ts
config/roles.ts
config/routes.ts
lib/data/db.ts
lib/data/prisma.ts
lib/data/redis.ts
lib/design-system/antd-theme.ts
lib/design-system/tokens.ts
lib/email/resend.ts
lib/hooks/useApiData.ts
lib/hooks/useDraftCache.ts
lib/hooks/useRole.ts
lib/hooks/useServiceWorker.ts
lib/utils/api.ts
lib/utils/auth.ts
lib/utils/exportReports.ts
lib/utils/formatDate.ts
lib/utils/reportUtils.ts
modules/analytics/components/AnalyticsPage.tsx
modules/analytics/index.ts
modules/auth/components/SettingsPage.tsx
modules/auth/index.ts
modules/bug-reports/components/BugReportManagePage.tsx
modules/bug-reports/components/BugReportPage.tsx
modules/bug-reports/index.ts
modules/dashboard/components/DashboardPage.tsx
modules/dashboard/index.ts
modules/goals/components/GoalsPage.tsx
modules/goals/index.ts
modules/notifications/components/InboxPage.tsx
modules/notifications/index.ts
modules/org/components/OrgPage.tsx
modules/org/index.ts
modules/reports/components/ExportDialog.tsx
modules/reports/components/ReportDetailPage.tsx
modules/reports/components/ReportEditPage.tsx
modules/reports/components/ReportNewPage.tsx
modules/reports/components/ReportSectionsForm.tsx
modules/reports/components/ReportsListPage.tsx
modules/reports/index.ts
modules/templates/components/TemplateDetailPage.tsx
modules/templates/components/TemplateNewPage.tsx
modules/templates/components/TemplatesListPage.tsx
modules/templates/index.ts
modules/users/components/InvitesPage.tsx
modules/users/components/ProfilePage.tsx
modules/users/components/UserDetailPage.tsx
modules/users/components/UsersListPage.tsx
modules/users/index.ts
package.json
prisma/schema.prisma
providers/AntdProvider.tsx
providers/AuthProvider.tsx
providers/ThemeProvider.tsx
types/global.d.ts
types/global.ts
```

# Files

## File: .ai-system/agents/agent-bootstrap.md
````markdown
# Agent Bootstrap

> **Overview:** A one-shot prompt for generating the full `.ai-system` documentation for a brand new project. Run this in Continue or Cline at the start of a project. It produces all required agent files with project-specific content derived from the actual codebase.

---

## Master Bootstrap Prompt

Paste this into Continue or Cline to initialize the system:

```
You are an AI development orchestrator.

Your task: Initialize the complete .ai-system documentation for this repository.

Step 1 — Scan the repository
- Detect languages, frameworks, entry points, folder structure
- Identify architectural patterns (service layer, MVC, monorepo, etc.)
- Map all major modules and their dependencies

Step 2 — Generate all documentation files

Create each file with:
- A short overview summary at the top (3–5 sentences)
- Section summaries at the start of each major section
- Accurate content derived from the actual codebase, not assumptions
- Clear, skimmable formatting

FILES TO CREATE:

.ai-context.md
  → Project name, purpose, stack summary, key modules list

.ai-system/agents/general-instructions.md
  → Agent protocol, core principles, execution steps, role table

.ai-system/agents/system-architecture.md
  → Architecture diagram, module breakdown, data flow, config points

.ai-system/agents/project-context.md
  → Project purpose, users, constraints, tech decisions made

.ai-system/agents/design-system.md
  → Colour palette (if detectable), component patterns, UX principles

.ai-system/agents/repair-system.md
  → Pre-populate with known patterns for the detected tech stack

.ai-system/planning/project-plan.md
  → Feature checklist inferred from codebase state

.ai-system/planning/task-queue.md
  → Immediate actionable improvement tasks

.ai-system/index/repo-map.md
  → Folder structure with purpose of each directory

.ai-system/index/dependency-graph.md
  → Module relationships as a text diagram

.ai-system/checkpoints/session-log.md
  → Blank template ready for first entry

.ai-system/memory/project-decisions.md
  → Blank with header, ready for entries

.ai-system/memory/lessons-learned.md
  → Blank with header, ready for entries

.ai-system/summaries/dev-history.md
  → First entry: "Initial project scan and .ai-system setup"

Step 3 — Report
After generating all files, list:
- What was generated
- Key architecture findings
- Recommended first tasks
```

---

## With Directive

```
Execute command: agent-bootstrap.md
Directive: [additional context about the project]

Examples:
Directive: This is a greenfield project — generate an ideal architecture for a Next.js marketplace app
Directive: Prioritise identifying technical debt and ordering the task queue by impact
Directive: The project uses Tailwind and Ant Design — include both in the design system
```
````

## File: .ai-system/agents/design-system.md
````markdown
# Design System

> **Overview:** [FILL IN — Describes the visual language, component patterns, and UX principles for this project. Agents building UI must read this before writing any frontend code.]

---

## Visual Language

> **Section summary:** Core visual identity — colours, typography, spacing.

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| primary | [#hex] | [buttons, links, CTAs] |
| secondary | [#hex] | [accents, highlights] |
| background | [#hex] | [page background] |
| surface | [#hex] | [cards, modals] |
| text-primary | [#hex] | [main body text] |
| text-muted | [#hex] | [labels, captions] |
| danger | [#hex] | [errors, destructive actions] |
| success | [#hex] | [confirmations] |

### Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Heading 1 | [font] | [size] | [weight] |
| Heading 2 | [font] | [size] | [weight] |
| Body | [font] | [size] | [weight] |
| Caption | [font] | [size] | [weight] |
| Code | [font] | [size] | [weight] |

### Spacing Scale

[e.g. 4px base unit: 4, 8, 12, 16, 24, 32, 48, 64]

---

## Component Patterns

> **Section summary:** Standard UI components used across the project. New components should follow these patterns before inventing new ones.

### Buttons
- Primary: [describe style and usage]
- Secondary: [describe]
- Destructive: [describe]
- Disabled state: [describe]

### Forms
- Input fields: [style and validation rules]
- Error messages: [placement and style]
- Submit buttons: [loading state behaviour]

### Navigation
- [describe nav pattern: sidebar / topnav / tabs]

### Cards / Containers
- [describe card pattern, shadow, border radius]

### Modals / Dialogs
- [describe pattern for confirmations, forms, alerts]

---

## UX Principles

> **Section summary:** Guiding rules for how the interface should feel and behave.

1. [e.g. Always show loading state for async actions]
2. [e.g. Destructive actions require confirmation]
3. [e.g. Error messages must explain what the user can do to fix the problem]
4. [e.g. Mobile-first — all layouts must work at 320px wide]

---

## Responsive Breakpoints

| Breakpoint | Value | Target |
|------------|-------|--------|
| sm | [e.g. 640px] | Mobile |
| md | [e.g. 768px] | Tablet |
| lg | [e.g. 1024px] | Desktop |
| xl | [e.g. 1280px] | Wide screens |

---

## Accessibility Requirements

> **Section summary:** Minimum accessibility standards to follow.

- All interactive elements must have keyboard focus states
- Colour contrast must meet WCAG AA (4.5:1 for text)
- Images must have alt text
- Forms must have associated labels
````

## File: .ai-system/agents/general-instructions.md
````markdown
# AI Development Protocol — General Instructions

> **Overview:** This is the master instruction file for all AI agents working on this project. Every agent session should begin by reading this file. It defines how agents think, what they reference, and how they behave during development.

---

## Documents to Reference

Always consult the following files before taking action, in this order:

1. `.ai-system/planning/task-queue.md` — what needs to be done next
2. `.ai-system/planning/project-plan.md` — overall project goals and progress
3. `.ai-system/agents/system-architecture.md` — how the system is structured
4. `.ai-system/agents/design-system.md` — UI/UX rules and component patterns
5. `.ai-system/agents/project-context.md` — project background and constraints
6. `.ai-system/agents/repair-system.md` — known errors and how to avoid/fix them
7. `.ai-system/memory/project-decisions.md` — past architectural decisions and their reasoning

---

## Core Principles

- **Modular architecture** — each module has a single, clear responsibility
- **Configuration-driven** — behaviour is controlled via config, not hardcoded
- **Readable code** — clarity over cleverness; future developers must understand it
- **Minimal dependencies** — don't add packages you don't need
- **Explicit error handling** — every failure path should be handled deliberately
- **Consistency** — follow existing patterns in the codebase before inventing new ones

---

## Execution Protocol

### Before implementing any feature:
1. Read task-queue.md and identify the first incomplete task
2. Confirm the task aligns with system-architecture.md
3. Check repair-system.md for relevant known issues
4. If architecture changes are needed, update system-architecture.md first

### After completing any task:
1. Mark the task done [x] in task-queue.md
2. Update .ai-system/checkpoints/session-log.md
3. Add a summary to .ai-system/summaries/dev-history.md
4. If architecture changed, update system-architecture.md
5. If errors were encountered and fixed, log them in repair-system.md
6. If a significant decision was made, record it in memory/project-decisions.md

---

## Agent Roles

| Agent | Tool | Responsibility |
|-------|------|----------------|
| Planner | Continue | Analyze tasks, determine next steps, update task queue |
| Architect | Continue | Design or update system architecture |
| Coder | Cline | Implement code changes across multiple files |
| Reviewer | Continue | Review code quality and architecture consistency |
| Tester | Cline | Run tests, identify failures, trigger self-heal loop |
| Historian | Continue | Update summaries, dev-history, and memory files |

---

## Tone and Output Format

- Explain reasoning briefly before acting
- When proposing architecture changes, describe the change before implementing
- When encountering ambiguity, ask one clarifying question rather than guessing
- Keep file edits focused — do not touch modules unrelated to the current task
````

## File: .ai-system/agents/project-context.md
````markdown
# Project Context

> **Overview:** [FILL IN — Brief description of the project, its purpose, who it's for, and what problem it solves. This is the first thing any agent should read to understand the "why" behind the work.]

---

## Project Purpose

> **Section summary:** What this project does and why it exists.

[Describe the project goal in plain language]

---

## Target Users

> **Section summary:** Who uses this system and what they need from it.

| User Type | Needs | Key Interactions |
|-----------|-------|-----------------|
| [user type] | [what they need] | [how they interact] |

---

## Business Constraints

> **Section summary:** Non-negotiable requirements that affect how we build.

- [e.g. Must work offline]
- [e.g. Data must stay on-premise]
- [e.g. Must support mobile browsers]

---

## Current Project Phase

> **Section summary:** Where the project stands right now in its development lifecycle.

Phase: [ Planning | Active Development | Stabilization | Maintenance ]

Active sprint focus: [describe current focus]

---

## Tech Decisions Already Made

> **Section summary:** Decisions that are locked in and should not be revisited unless explicitly flagged.

| Decision | Reason |
|----------|--------|
| [decision] | [why it was made] |

---

## Out of Scope

> **Section summary:** Things we are explicitly not building in this project.

- [List exclusions here to prevent scope creep]

---

## External Integrations

> **Section summary:** Third-party services and APIs this project connects to.

| Service | Purpose | Auth Method |
|---------|---------|------------|
| [service] | [what it does] | [API key / OAuth / etc.] |
````

## File: .ai-system/agents/repair-system.md
````markdown
# Repair System — Error Knowledge Base

> **Overview:** A living knowledge base of errors encountered during development, their root causes, and how they were fixed. Agents should consult this before diagnosing new errors. Every fixed bug should be logged here to prevent recurrence.

---

## How to Use This File

- **Before debugging:** Search this file for patterns matching your current error
- **After fixing a bug:** Add an entry using the template at the bottom
- **Agents:** Reference this during the fix-build and self-heal cycles

---

## Error Log

> **Section summary:** Each error entry includes the symptom, cause, fix, and prevention strategy. Entries are added chronologically.

---

### [TEMPLATE — copy this for each new error]

```
## [Error Title / Short Description]

**Symptom:**
[What the developer or user sees — error message, broken behaviour, etc.]

**Root Cause:**
[The actual technical reason this happened]

**Fix Applied:**
[What change was made to resolve it]

**Prevention:**
[How to avoid this in future — pattern, lint rule, architecture change, etc.]

**Files Affected:**
[List of files that were changed]

**Date:** [YYYY-MM-DD]
```

---

## Known Error Patterns

> **Section summary:** Recurring error categories seen in this tech stack. Agents should check this section when they match the pattern before investigating further.

### React / Next.js

**Hydration Mismatch**
- Symptom: `Hydration failed because the initial UI does not match what was rendered on the server`
- Cause: Browser-only logic (window, localStorage, Date.now()) running during server render
- Fix: Wrap in `useEffect` or use `dynamic(() => import(...), { ssr: false })`
- Prevention: Never access browser APIs outside useEffect in components

**Missing Key Prop**
- Symptom: `Each child in a list should have a unique "key" prop`
- Cause: `.map()` rendering without a stable unique key
- Fix: Add `key={item.id}` — use a stable unique ID, not the array index

---

### Node.js / Backend

**Unhandled Promise Rejection**
- Symptom: Server crashes silently or logs `UnhandledPromiseRejectionWarning`
- Cause: async function missing try/catch, or `.catch()` not attached to promise
- Fix: Wrap async route handlers in try/catch, use an async error middleware
- Prevention: Always use a global async error wrapper for Express routes

**Database Connection Pool Exhausted**
- Symptom: Requests hang indefinitely under load
- Cause: Connection pool limit too low or connections not being released
- Fix: Increase pool size in config, ensure `client.release()` in finally blocks
- Prevention: Always release DB connections in finally, not just success path

---

### Configuration / Environment

**Missing Environment Variable**
- Symptom: `undefined` values in production, features silently broken
- Cause: Variable defined in `.env.local` but not in production environment
- Fix: Add to deployment environment variables and validate on startup
- Prevention: Add a startup validation check that throws if required env vars are missing

---

## Resolved Errors Archive

> **Section summary:** Errors that have been fully resolved and are unlikely to recur. Kept for reference.

[Entries move here when the underlying cause has been permanently fixed]
````

## File: .ai-system/agents/system-architecture.md
````markdown
# System Architecture

> **Overview:** [FILL IN after running bootstrap-project command — 3–5 sentence description of what this system does and how it is structured at a high level.]

---

## Architecture Diagram

> **Section summary:** Text-based overview of system layers and how they connect.

```
[Generated by bootstrap-project or generate-architecture command]

Example:
Client (Browser / Mobile)
        ↓
    Next.js Frontend
        ↓
    API Layer (REST / GraphQL)
        ↓
    Service Layer
        ↓
    Data Access Layer
        ↓
    PostgreSQL / External APIs
```

---

## Module Breakdown

> **Section summary:** Each module listed here has a single defined responsibility. Agents should not modify a module's scope without updating this document.

| Module | Responsibility | Key Files | Dependencies |
|--------|----------------|-----------|--------------|
| [module name] | [what it does] | [files] | [what it depends on] |

---

## Data Flow

> **Section summary:** How a typical request moves through the system from entry point to response.

### Standard Request Flow
```
[describe the path a request takes]
```

### Authentication Flow
```
[describe the auth path if applicable]
```

### Data Persistence Flow
```
[describe how data is saved and retrieved]
```

---

## Configuration Points

> **Section summary:** All configurable values are listed here. Nothing should be hardcoded in source files that appears in this section.

| Config Key | Purpose | Location | Default |
|------------|---------|----------|---------|
| [key] | [what it controls] | [.env / config file] | [value] |

---

## Tech Stack

> **Section summary:** Core technologies in use. New dependencies should be added here when introduced.

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | [e.g. Next.js] | [version] |
| Backend | [e.g. Node.js / Express] | [version] |
| Database | [e.g. PostgreSQL] | [version] |
| Auth | [e.g. JWT] | — |

---

## Known Constraints & Technical Debt

> **Section summary:** Limitations and known issues that affect architecture decisions. Agents should be aware of these before proposing changes.

- [List constraints here]

---

## Architecture History

> **Section summary:** Log of major architectural changes. See also memory/architecture-history.md for full details.

| Date | Change | Reason |
|------|--------|--------|
| [date] | [what changed] | [why] |
````

## File: .ai-system/checkpoints/session-log.md
````markdown
# Development Checkpoints — Session Log

> **Overview:** Running log of development sessions. Each entry records what was completed, what comes next, and which files were modified. Agents write here at the end of every session so work can be resumed without re-reading the entire codebase.

---

## How to Use

- Agents write an entry after completing each major task
- Each entry should be resumable — a future agent reading only the latest entry should know exactly where things stand
- If work is interrupted, record the exact stopping point

---

## Log Format

```
## Session [number] — [date]

**Completed:**
[What was finished this session]

**Files Modified:**
- [file path] — [what changed]

**Next Task:**
[Exact next step — be specific]

**Notes / Blockers:**
[Anything the next agent needs to know]
```

---

## Sessions

---

## Session 1 — [DATE]

**Completed:**
Initial .ai-system setup and project bootstrap

**Files Modified:**
- .ai-system/ (entire directory created)

**Next Task:**
Run dev-cycle.md to begin first development task from task-queue.md

**Notes / Blockers:**
None — fresh project start
````

## File: .ai-system/commands/bootstrap-project.md
````markdown
# Bootstrap Project Command

> **Overview:** Run this once per new repository to auto-generate the entire `.ai-system` documentation structure. It analyzes your actual codebase and populates all agent files with project-specific content.

---

## Prompt (paste into Continue or Cline)

```
You are an AI development orchestrator initializing a structured AI engineering system.

TASK: Analyze this repository and generate a complete .ai-system documentation structure.

Steps:
1. Scan the repository — detect languages, frameworks, folder structure, entry points, and dependencies
2. Identify the main architectural patterns in use (MVC, service layer, monorepo, etc.)
3. Create or update the following files with accurate, project-specific content:

FILES TO GENERATE:
- .ai-system/ai-context.md        → project overview, stack, key modules
- .ai-system/agents/system-architecture.md  → actual architecture based on code scan
- .ai-system/agents/design-system.md        → UI/UX patterns detected or to be defined
- .ai-system/agents/project-context.md      → goals, constraints, stakeholders
- .ai-system/agents/repair-system.md        → known issues and error patterns (empty if new project)
- .ai-system/planning/project-plan.md       → high-level feature checklist
- .ai-system/planning/task-queue.md         → immediate actionable tasks
- .ai-system/index/repo-map.md             → folder structure and purpose of each directory
- .ai-system/index/dependency-graph.md     → module relationships
- .ai-system/checkpoints/session-log.md    → blank checkpoint template
- .ai-system/memory/project-decisions.md   → blank decisions log
- .ai-system/memory/lessons-learned.md     → blank lessons log
- .ai-system/summaries/dev-history.md      → blank history log

REQUIREMENTS FOR ALL FILES:
- Begin every file with a short overview summary (3–5 sentences max)
- Begin every major section with a 1–2 sentence summary paragraph
- Keep language clear and skimmable — the goal is fast orientation
- Architecture must reflect actual code, not assumptions
- Task queue must contain real, actionable next steps

Run this now and create all files.
```

---

## With Optional Directive

If you want to give the bootstrapper extra context:

```
Execute command: bootstrap-project.md
Directive: [your instructions here]

Examples:
Directive: This is a Next.js + Node.js marketplace app. Focus on modular service architecture.
Directive: Prioritize config-driven design and environment variable management in the task queue.
Directive: The project is greenfield — generate opinionated starter architecture for a REST API.
```
````

## File: .ai-system/commands/dev-cycle.md
````markdown
# Dev Cycle Command

> **Overview:** The master autonomous development loop. Run this to execute a full plan → implement → review → test → document cycle. Best used at the start of each working session or after completing a task.

---

## Prompt (paste into Continue, then hand off implementation to Cline)

```
You are running the AI development cycle for this project.

Before doing anything, read:
- .ai-context.md
- .ai-system/agents/system-architecture.md
- .ai-system/planning/task-queue.md
- .ai-system/checkpoints/session-log.md

Then execute the following pipeline:

PLAN
- Identify the first incomplete task in task-queue.md
- Confirm it aligns with system-architecture.md
- If architecture needs updating first, flag it

IMPLEMENT
- Make code changes safely — only touch files related to the task
- Follow the design system and architecture patterns
- Do not introduce new dependencies without noting them

REVIEW
- Check the implementation against system-architecture.md
- Flag any inconsistencies or architecture drift
- Suggest improvements if found

TEST
- Identify test cases for the implementation
- If tests exist, verify they pass
- If tests are missing, list what should be tested

DOCUMENT
- Update .ai-system/checkpoints/session-log.md with completed task and files modified
- Update .ai-system/summaries/dev-history.md with a brief summary
- Update .ai-system/agents/repair-system.md if any errors were encountered and fixed
- Mark the completed task as done [x] in task-queue.md

Explain your reasoning at each step before acting.
```

---

## With Optional Directive

```
Execute command: dev-cycle.md
Directive: [your instruction here]

Examples:
Directive: Focus only on the authentication module today
Directive: Prioritize fixing the broken API response formatter before new features
Directive: Work in small safe commits — do not refactor anything not directly related to the task
```
````

## File: .ai-system/commands/fix-build.md
````markdown
# Fix Build Command

> **Overview:** The self-healing loop. Run this when tests are failing, the build is broken, or you've hit a runtime error. The agent diagnoses, fixes, and documents the fix in the repair system so future agents avoid the same problem.

---

## Prompt

```
Read:
- .ai-system/agents/repair-system.md
- .ai-system/testing/test-results.md (if it exists)
- .ai-system/testing/failure-analysis.md (if it exists)

TASK: Run the self-healing development loop.

Steps:
1. Examine the error or failing test
2. Check repair-system.md for known patterns that match this error
3. Identify the root cause — do not guess, trace the actual execution path
4. Implement the minimal fix — do not refactor unrelated code
5. Verify the fix resolves the error
6. Update .ai-system/agents/repair-system.md with:
   - error description
   - root cause
   - solution applied
   - prevention strategy
7. Update .ai-system/testing/test-results.md
8. Update .ai-system/checkpoints/session-log.md

If the error is complex, break it into sub-problems and solve each one.
```

---

## With Directive

```
Execute command: fix-build.md
Directive: [describe the error or paste the error message]

Examples:
Directive: TypeError: Cannot read properties of undefined reading 'map' in UserList component
Directive: Database connection pool exhausted under load — fix and add connection limit config
Directive: Next.js hydration mismatch on the dashboard page
```
````

## File: .ai-system/commands/generate-architecture.md
````markdown
# Generate Architecture Command

> **Overview:** Use this to produce or refresh the system architecture documentation. Can be run on an existing codebase to document what's there, or on a greenfield project to design what should be built.

---

## Prompt

```
Read:
- .ai-context.md
- .ai-system/index/repo-map.md
- .ai-system/index/dependency-graph.md
- .ai-system/memory/project-decisions.md

TASK: Generate or update the system architecture documentation.

Produce the following in .ai-system/agents/system-architecture.md:

1. Overview summary (3–5 sentences describing the system)

2. System diagram (text-based, showing layers and relationships)

3. Module breakdown
   - Name of each module
   - Responsibility
   - Dependencies
   - Key files

4. Data flow
   - How a typical request flows through the system
   - Authentication path if applicable
   - Data persistence path

5. Configuration points
   - What is configurable
   - Where config is defined
   - Environment variables in use

6. Known constraints or technical debt

Each section must begin with a 1–2 sentence summary.
Architecture must reflect actual code — do not invent structure that doesn't exist.
```

---

## With Directive

```
Execute command: generate-architecture.md
Directive: [your architectural goal]

Examples:
Directive: Design the architecture for a new microservices migration
Directive: Document the current monolith before we begin refactoring
Directive: Add a proposed event-driven layer to the existing architecture doc
```
````

## File: .ai-system/commands/plan-feature.md
````markdown
# Plan Feature Command

> **Overview:** Use this before implementing any new feature. It analyzes architecture impact, identifies required modules, and updates the task queue with concrete steps before any code is written.

---

## Prompt

```
Read the following before responding:
- .ai-context.md
- .ai-system/agents/system-architecture.md
- .ai-system/agents/design-system.md
- .ai-system/planning/project-plan.md
- .ai-system/planning/task-queue.md

TASK: Plan the implementation of a new feature.

Produce:
1. Feature summary — what it does and why it's needed
2. Architecture impact — which existing modules are affected
3. New modules or services required
4. Data flow — how data moves through the feature
5. UI/UX considerations aligned with design-system.md
6. Potential risks or edge cases
7. List of concrete implementation tasks → append these to task-queue.md
8. Any architecture doc updates needed → note them for system-architecture.md

Do not write any code yet. Planning only.
```

---

## With Directive

```
Execute command: plan-feature.md
Directive: [describe the feature]

Examples:
Directive: implement role-based authentication with JWT and refresh tokens
Directive: add a real-time notifications system using WebSockets
Directive: build a configurable export module that supports CSV, PDF, and JSON
```
````

## File: .ai-system/commands/refactor-codebase.md
````markdown
# Refactor Codebase Command

> **Overview:** Use this to improve the structure, modularity, or design of existing code. The agent analyzes the repo, proposes changes, updates documentation, and implements safely — without breaking unrelated modules.

---

## Prompt

```
Read the following:
- .ai-context.md
- .ai-system/agents/system-architecture.md
- .ai-system/index/repo-map.md
- .ai-system/index/dependency-graph.md
- .ai-system/memory/project-decisions.md

TASK: Refactor the codebase to improve quality.

Steps:
1. Analyze current folder structure and identify problems
   - tight coupling
   - repeated logic
   - missing abstractions
   - config hardcoded in source files
   - modules doing too many things

2. Propose a refactored architecture
   - describe new folder structure
   - define module boundaries
   - identify what moves where

3. Update .ai-system/agents/system-architecture.md with proposed changes

4. Add refactoring tasks to .ai-system/planning/task-queue.md

5. Implement the refactor safely
   - move one module at a time
   - verify imports still resolve
   - do not change logic — only structure, unless instructed

6. After completion:
   - update repo-map.md
   - update dependency-graph.md
   - log the refactor in dev-history.md
```

---

## With Directive

```
Execute command: refactor-codebase.md
Directive: [your refactor goal]

Examples:
Directive: convert the project to a config-driven modular architecture
Directive: extract all database logic into a dedicated data access layer
Directive: standardise all API responses through a single response formatter utility
```
````

## File: .ai-system/commands/self-heal.md
````markdown
# Self-Heal Command

> **Overview:** Automated quality loop. Runs the full test → diagnose → fix → document cycle. Best used after large implementations or when you want the agent to proactively find and fix issues.

---

## Prompt (use with Cline for execution)

```
Run the self-healing development loop.

Steps:
1. Run available tests or linting checks
2. Collect all failures and warnings
3. For each failure:
   a. Identify root cause
   b. Check .ai-system/agents/repair-system.md for known patterns
   c. Implement the minimal fix
   d. Document the fix in repair-system.md
4. Re-run tests to confirm fixes
5. Repeat until all tests pass or failures are documented as known issues
6. Update .ai-system/testing/test-results.md
7. Update .ai-system/testing/failure-analysis.md for any unresolved issues
8. Update .ai-system/checkpoints/session-log.md

Do not refactor code unrelated to the failures.
Do not introduce new features during this loop.
```
````

## File: .ai-system/commands/update-ai-system.md
````markdown
# Update AI System Command

> **Overview:** Maintenance command. Run at the end of a sprint or after major changes to keep all agent documentation synchronized with the actual state of the codebase.

---

## Prompt

```
Read all files in .ai-system/ and compare them against the current repository state.

TASK: Synchronize the AI development system with the codebase.

Update the following:
1. .ai-system/index/repo-map.md
   - reflect any new or removed directories
   - update purpose descriptions if modules changed

2. .ai-system/index/dependency-graph.md
   - update module relationships
   - flag new dependencies introduced

3. .ai-system/index/file-summaries/
   - generate or update summaries for modified modules
   - remove summaries for deleted files

4. .ai-system/agents/system-architecture.md
   - flag any architecture drift (code doesn't match docs)
   - update architecture to reflect current state

5. .ai-system/planning/project-plan.md
   - mark completed items [x]
   - add newly discovered tasks

6. .ai-system/summaries/dev-history.md
   - add a sprint summary for work completed

7. .ai-system/memory/lessons-learned.md
   - document any recurring issues or newly discovered patterns

Report what was updated and what inconsistencies were found.
```

---

## With Directive

```
Execute command: update-ai-system.md
Directive: [focus area if needed]

Examples:
Directive: Focus on updating summaries after the authentication module refactor
Directive: Specifically check for architecture drift in the services layer
```
````

## File: .ai-system/index/dependency-graph.md
````markdown
# Dependency Graph

> **Overview:** Maps how modules depend on each other. Agents use this to understand the impact of changes before modifying a module. Updated whenever new dependencies are introduced or modules are refactored.

---

## Module Dependency Map

```
[Generated by bootstrap-project or update-ai-system commands]

Example (text diagram):

AuthService
  → UserModel (reads/writes users)
  → JWTUtils (token generation)
  → EmailService (sends verification emails)

UserController
  → AuthService
  → UserService

UserService
  → UserModel
  → CacheLayer
```

---

## External Dependencies

> **Section summary:** Third-party packages and what they're used for. Review before adding new packages.

| Package | Purpose | Used In |
|---------|---------|---------|
| [package] | [purpose] | [modules] |

---

## Circular Dependency Warnings

> **Section summary:** Any detected circular dependencies that need to be resolved.

[None detected / list any here]

---

## Dependency Rules

> **Section summary:** Rules about which modules may depend on which others. Prevents architectural decay.

- Controllers may depend on Services — not the other way around
- Services may depend on Models — not the other way around
- Utils must have no dependencies on application modules
- Config module must not depend on any application code
````

## File: .ai-system/index/repo-map.md
````markdown
# Repository Map

> **Overview:** Visual map of the project folder structure with a brief description of each directory's purpose. Agents read this first when navigating the codebase. Updated whenever the folder structure changes.

---

## Folder Structure

```
[Generated by bootstrap-project or update-ai-system commands]

Example:
project-root/
│
├── src/                    → Frontend source code
│   ├── components/         → Reusable UI components
│   ├── pages/              → Route-level page components
│   ├── hooks/              → Custom React hooks
│   └── styles/             → Global styles and theme
│
├── server/                 → Backend source code
│   ├── controllers/        → Request handlers
│   ├── services/           → Business logic layer
│   ├── models/             → Database models / schemas
│   ├── middleware/         → Express middleware
│   └── utils/              → Shared utilities
│
├── config/                 → Configuration files
├── scripts/                → Build and utility scripts
├── tests/                  → Test suites
└── .ai-system/             → AI development system
```

---

## Directory Descriptions

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| [dir] | [what it contains] | [important files] |

---

## Entry Points

| Purpose | File |
|---------|------|
| Frontend dev server | [e.g. src/pages/_app.tsx] |
| Backend server | [e.g. server/index.js] |
| Config loading | [e.g. config/index.js] |
| Environment validation | [e.g. config/env.js] |
````

## File: .ai-system/memory/architecture-history.md
````markdown
# Architecture History

> **Overview:** Chronological record of how the system architecture has evolved. Useful for understanding why things are structured the way they are, and for identifying patterns in how the codebase has grown.

---

## History

### [DATE] — Initial Architecture

**State:**
[Describe the initial structure]

**Rationale:**
[Why it was structured this way at the start]

---

[New entries added here as architecture evolves]
````

## File: .ai-system/memory/lessons-learned.md
````markdown
# Lessons Learned

> **Overview:** Practical knowledge accumulated during development — things that worked well, things that didn't, and patterns worth repeating. Different from repair-system.md (which tracks errors); this file tracks development process insights and architectural wisdom.

---

## Entry Format

```
## [Lesson Title]

**Context:**
[What situation this came from]

**What We Learned:**
[The insight or pattern discovered]

**Apply When:**
[When future agents/developers should use this knowledge]
```

---

## Lessons

[Entries added here as lessons are discovered]
````

## File: .ai-system/memory/project-decisions.md
````markdown
# Project Decisions

> **Overview:** Log of significant architectural, technical, and product decisions made during development. Agents consult this before proposing changes to avoid contradicting prior reasoning. Each entry records what was decided, why, and what the alternatives were.

---

## Decision Format

```
## [Decision Title]

**Decision:** [What was decided]
**Date:** [YYYY-MM-DD]
**Made by:** [Developer / AI agent / team]

**Reason:**
[Why this choice was made]

**Alternatives Considered:**
[What else was evaluated and why it was rejected]

**Implications:**
[What this decision affects going forward]
```

---

## Decisions

[Entries added here as decisions are made]
````

## File: .ai-system/planning/project-plan.md
````markdown
# Project Plan

> **Overview:** High-level feature checklist for the project. Agents update checkboxes as work is completed. Sections represent major development phases. See task-queue.md for granular, sprint-level tasks.

---

## Phase 1 — Foundation

> **Section summary:** Core infrastructure that everything else depends on.

- [ ] Repository structure and folder conventions established
- [ ] Configuration system implemented (env vars, config files)
- [ ] Logging framework in place
- [ ] Error handling middleware / global error boundaries
- [ ] CI/CD pipeline (if applicable)

---

## Phase 2 — Core Features

> **Section summary:** The primary features that define the product's value.

- [ ] [Feature 1]
- [ ] [Feature 2]
- [ ] [Feature 3]

---

## Phase 3 — Secondary Features

> **Section summary:** Supporting features that enhance the core experience.

- [ ] [Feature 4]
- [ ] [Feature 5]

---

## Phase 4 — Quality & Polish

> **Section summary:** Reliability, performance, and user experience improvements.

- [ ] Unit test coverage for core modules
- [ ] Integration tests for critical paths
- [ ] Performance audit and optimisation
- [ ] Accessibility audit
- [ ] Error states and loading states complete

---

## Phase 5 — Launch Preparation

> **Section summary:** Final steps before production deployment.

- [ ] Production environment configured
- [ ] Security audit (auth, input validation, secrets)
- [ ] Documentation complete
- [ ] Deployment pipeline tested

---

## Completed

> **Section summary:** Features fully shipped. Archived here for reference.

- [x] [Completed item]
````

## File: .ai-system/planning/task-queue.md
````markdown
# Development Task Queue

> **Overview:** Sprint-level task queue. Agents execute tasks top to bottom within the current sprint. When a task is completed, mark it [x] and add a checkpoint entry. Future tasks are queued below for prioritisation in the next sprint.

---

## Current Sprint

> **Section summary:** Tasks actively being worked on. Agents pick the first incomplete task.

- [ ] [First task — be specific: "Extract database queries from userController.js into userService.js"]
- [ ] [Second task]
- [ ] [Third task]

---

## Up Next

> **Section summary:** Tasks planned for the next sprint. Not yet started.

- [ ] [Queued task 1]
- [ ] [Queued task 2]

---

## Backlog

> **Section summary:** Known work that needs to be done but hasn't been scheduled yet.

- [ ] [Backlog item 1]
- [ ] [Backlog item 2]

---

## Completed This Sprint

> **Section summary:** Tasks finished in the current sprint. Cleared at sprint end and moved to dev-history.md.

- [x] [Completed task]

---

## Notes

[Any context agents need to know about current sprint constraints, blockers, or priorities]
````

## File: .ai-system/summaries/dev-history.md
````markdown
# Development History

> **Overview:** Chronological log of completed development work. Each sprint ends with a summary entry. Agents add entries after completing tasks. Useful for understanding what has been built and when decisions were made.

---

## Entry Format

```
## [Date] — [Sprint or Session Title]

**Summary:**
[2–4 sentence overview of what was accomplished]

**Completed:**
- [task 1]
- [task 2]

**Key Changes:**
- [important architectural or behavioural change]

**Next Sprint Focus:**
[What comes next]
```

---

## History

---

## [DATE] — Project Initialization

**Summary:**
Project repository created and .ai-system documentation structure initialized. Bootstrap prompt run to establish initial architecture understanding. Task queue populated with first sprint tasks.

**Completed:**
- .ai-system directory created with all template files
- Initial project scan completed

**Key Changes:**
- None yet — project start

**Next Sprint Focus:**
Begin first development tasks from task-queue.md
````

## File: .ai-system/testing/test-plan.md
````markdown
# Test Plan

> **Overview:** Defines what needs to be tested and at what level. Agents reference this when writing tests or running the self-heal loop. Updated as new features are added.

---

## Unit Tests

> **Section summary:** Tests for individual functions and modules in isolation.

- [ ] [Module / function to test]
- [ ] Service layer functions
- [ ] Utility functions
- [ ] Data transformation logic

---

## Integration Tests

> **Section summary:** Tests for how modules work together, including database operations and API routes.

- [ ] API route responses (happy path)
- [ ] API route error handling
- [ ] Database CRUD operations
- [ ] Authentication flow

---

## End-to-End Tests

> **Section summary:** Tests that simulate real user journeys through the system.

- [ ] [Critical user flow 1]
- [ ] [Critical user flow 2]

---

## Performance Tests

> **Section summary:** Tests to verify the system performs acceptably under expected load.

- [ ] API response time under normal load
- [ ] Database query performance
- [ ] Page load times (frontend)
````

## File: .ai-system/testing/test-results.md
````markdown
# Test Results

> **Overview:** Latest test run results. Updated by agents after running the self-heal loop or test suite. Gives a quick snapshot of current project health.

---

## Last Run

**Date:** [DATE]
**Run by:** [Agent / developer]

**Results:**
| Suite | Passed | Failed | Skipped |
|-------|--------|--------|---------|
| Unit | — | — | — |
| Integration | — | — | — |
| E2E | — | — | — |

**Overall Status:** [ Passing | Failing | Partial ]

---

## Active Failures

| Test | Error | Status | Assigned To |
|------|-------|--------|------------|
| [test name] | [error message] | [Investigating / Fixed / Wont Fix] | [agent/dev] |

---

## History

| Date | Passed | Failed | Notes |
|------|--------|--------|-------|
| [date] | [n] | [n] | [notes] |
````

## File: .github/copilot-instructions.md
````markdown
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
````

## File: .github/design-system.md
````markdown
# Harvesters Reporting System — Design System

> **Status:** Specification locked. All implementation must reference this document.
> **Source of truth:** `app/globals.css` — all tokens defined once here.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Token Architecture](#2-token-architecture)
3. [Token Reference — Full Specification](#3-token-reference)
4. [Typography System](#4-typography-system)
5. [Layout System](#5-layout-system)
6. [Component Guidelines](#6-component-guidelines)
7. [Glassmorphism Rules](#7-glassmorphism-rules)
8. [Glow Border Strategy](#8-glow-border-strategy)
9. [Motion System](#9-motion-system)
10. [Data Visualization Aesthetic](#10-data-visualization-aesthetic)
11. [Visual Hierarchy Pattern](#11-visual-hierarchy-pattern)
12. [Responsiveness Strategy](#12-responsiveness-strategy)
13. [Ant Design Token Bridge](#13-ant-design-token-bridge)
14. [Implementation File Structure](#14-implementation-file-structure)
15. [Token Migration Map](#15-token-migration-map)
16. [Design Anti-Patterns](#16-design-anti-patterns)

---

## 1. Design Philosophy

### Core Direction

The Harvesters Reporting System UI is built around **data-first minimalism** anchored on the organisation's true brand identity: **sharp black**. The Harvesters Emerald (`#10b981`) is the **single controlled accent** — used for CTAs, interactive states, active nav items, and focused highlights. This creates a high-contrast, premium feel appropriate for a leadership reporting tool that must handle dense data clearly.

**Design keywords:** Precision · Contrast · Structure · Depth · Air · Grid · Subtle Glow · Systematic

### Principles

1. **Brand-black anchor.** Black is not merely a dark mode background — it is the foundational brand tone. Light mode is clean and minimal; dark mode is deeply black with selective depth.
2. **Single accent.** Only one active accent at a time — Harvesters Emerald. This ensures glow and interactive states carry real visual weight.
3. **Single source of truth.** All design values are defined once in `app/globals.css`. Ant Design tokens and all component classes are derived references — never independent definitions.
4. **Semantic over palette.** Components reference `ds-surface-elevated`, not `gray-800`. A full brand refresh requires changing a handful of lines in `globals.css`.
5. **Glassmorphism with restraint.** Glass surfaces appear only on KPI cards and analytics overview blocks. All report data screens (tables, forms, dense data) use clear, opaque surfaces for readability.
6. **Glow with intention.** Glow borders are reserved for interaction emphasis: active sidebar items, selected cards, focused inputs. Never decorative at rest.
7. **Dark mode as a first-class variant.** Every token has a light and dark value. The accent color is identical in both themes; only surfaces and text adapt.

---

## 2. Token Architecture

Tokens are organized in three tiers. Components **never** reference Tier 1 directly.

```
Tier 1: Palette Tokens (raw hex — defined once in :root, never used in component classes)
   e.g., --palette-emerald-500: #10b981

Tier 2: Semantic Design Tokens (reference palette tokens — describe purpose)
   e.g., --ds-brand-accent: var(--palette-emerald-500)
         --ds-surface-elevated: var(--palette-neutral-0)

Tier 3: Tailwind Utility Exposure (@theme inline — Tier 2 exposed as Tailwind classes)
   e.g., bg-ds-surface-elevated, text-ds-text-primary, border-ds-border-base
```

### Semantic Token Categories

| Category            | Prefix           | Purpose                              |
| ------------------- | ---------------- | ------------------------------------ |
| Brand / Accent      | `--ds-brand-*`   | Single accent + brand black scale    |
| Status / Functional | `--ds-status-*`  | Success, warning, error, info        |
| Surfaces            | `--ds-surface-*` | Backgrounds for every layer          |
| Text                | `--ds-text-*`    | Typography colors at every hierarchy |
| Borders             | `--ds-border-*`  | Component borders, dividers          |
| Glow                | `--ds-glow-*`    | Interactive box-shadow values        |
| Charts              | `--ds-chart-*`   | Categorical chart series colors      |
| Shape               | `--ds-radius-*`  | Border radius scale                  |
| Shadows             | `--ds-shadow-*`  | Elevation shadows                    |
| Typography          | `--ds-font-*`    | Font family stacks                   |

---

## 3. Token Reference

### Light Mode — `:root`

```css
:root {
  /* ── Palette ── */

  /* Brand Black Scale */
  --palette-black-base: #0a0a0b;
  --palette-black-soft: #111214;
  --palette-black-elevated: #16171a;

  /* Emerald Accent Scale (Harvesters green — single accent) */
  --palette-emerald-900: #064e3b;
  --palette-emerald-700: #047857;
  --palette-emerald-600: #059669;
  --palette-emerald-500: #10b981;
  --palette-emerald-400: #34d399;
  --palette-emerald-200: #a7f3d0;
  --palette-emerald-50: #ecfdf5;

  /* Neutral Scale */
  --palette-neutral-950: #0a0a0a;
  --palette-neutral-900: #0f172a;
  --palette-neutral-800: #1e293b;
  --palette-neutral-700: #374151;
  --palette-neutral-600: #4b5563;
  --palette-neutral-500: #64748b;
  --palette-neutral-400: #94a3b8;
  --palette-neutral-300: #cbd5e1;
  --palette-neutral-200: #e5e7eb;
  --palette-neutral-100: #f1f5f9;
  --palette-neutral-50: #f8f9fb;
  --palette-neutral-0: #ffffff;

  /* ── Brand / Accent ── */
  --ds-brand-accent: var(--palette-emerald-500); /* #10b981 — theme-invariant */
  --ds-brand-accent-hover: var(--palette-emerald-600);
  --ds-brand-accent-subtle: var(--palette-emerald-50);
  --ds-brand-black: var(--palette-black-base);
  --ds-brand-black-soft: var(--palette-black-soft);
  --ds-brand-black-elevated: var(--palette-black-elevated);

  /* ── Status ── */
  --ds-status-success: #15803d;
  --ds-status-warning: #b45309;
  --ds-status-error: #dc2626;
  --ds-status-info: var(--palette-emerald-700);

  /* ── Surfaces ── */
  --ds-surface-base: var(--palette-neutral-50);
  --ds-surface-elevated: var(--palette-neutral-0);
  --ds-surface-sunken: var(--palette-neutral-100);
  --ds-surface-overlay: var(--palette-neutral-0);
  --ds-surface-sidebar: var(--palette-neutral-0);
  --ds-surface-header: var(--palette-neutral-0);
  --ds-surface-glass: rgba(255, 255, 255, 0.7);

  /* ── Text ── */
  --ds-text-primary: var(--palette-neutral-900);
  --ds-text-secondary: var(--palette-neutral-500);
  --ds-text-subtle: var(--palette-neutral-400);
  --ds-text-inverse: var(--palette-neutral-0);
  --ds-text-link: var(--palette-emerald-600);

  /* ── Borders ── */
  --ds-border-base: var(--palette-neutral-200);
  --ds-border-strong: var(--palette-neutral-300);
  --ds-border-subtle: var(--palette-neutral-100);
  --ds-border-glass: rgba(255, 255, 255, 0.6);

  /* ── Glow ── */
  --ds-glow-accent-soft: 0 0 0 1px rgba(16, 185, 129, 0.2);
  --ds-glow-accent-strong: 0 0 20px rgba(16, 185, 129, 0.25);

  /* ── Chart / Categorical ── */
  --ds-chart-1: #2563eb; /* Reports / Users */
  --ds-chart-2: #10b981; /* Groups / Campuses */
  --ds-chart-3: #7c3aed; /* Templates */
  --ds-chart-4: #ea580c; /* Deadlines / Alerts */
  --ds-chart-5: #0891b2; /* Analytics */
  --ds-chart-6: #be185d; /* Special */

  /* ── Shape ── */
  --ds-radius-sm: 4px;
  --ds-radius-md: 8px;
  --ds-radius-lg: 12px;
  --ds-radius-xl: 20px;
  --ds-radius-2xl: 24px;
  --ds-radius-full: 9999px;

  /* ── Shadows ── */
  --ds-shadow-sm:
    0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --ds-shadow-md:
    0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --ds-shadow-lg:
    0 12px 20px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06);
  --ds-shadow-xl:
    0 24px 32px -8px rgb(0 0 0 / 0.12), 0 8px 16px -6px rgb(0 0 0 / 0.07);

  /* ── Typography ── */
  --ds-font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ds-font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
}
```

### Dark Mode — `.dark` (overrides only)

```css
.dark {
  /* ── Surfaces ── */
  --ds-surface-base: var(--palette-black-base);
  --ds-surface-elevated: var(--palette-black-soft);
  --ds-surface-sunken: var(--palette-black-base);
  --ds-surface-overlay: var(--palette-black-soft);
  --ds-surface-sidebar: var(--palette-black-base);
  --ds-surface-header: var(--palette-black-soft);
  --ds-surface-glass: rgba(255, 255, 255, 0.04);

  /* Brand accent stays #10b981 — theme-invariant */
  --ds-brand-accent-subtle: rgba(16, 185, 129, 0.12);

  /* ── Status ── */
  --ds-status-success: #4ade80;
  --ds-status-warning: #fbbf24;
  --ds-status-error: #f87171;
  --ds-status-info: var(--palette-emerald-400);

  /* ── Text ── */
  --ds-text-primary: #f8fafc;
  --ds-text-secondary: var(--palette-neutral-400);
  --ds-text-subtle: #475569;
  --ds-text-inverse: var(--palette-neutral-900);
  --ds-text-link: var(--palette-emerald-400);

  /* ── Borders ── */
  --ds-border-base: rgba(255, 255, 255, 0.08);
  --ds-border-strong: rgba(255, 255, 255, 0.14);
  --ds-border-subtle: rgba(255, 255, 255, 0.04);
  --ds-border-glass: rgba(255, 255, 255, 0.08);

  /* ── Glow ── */
  --ds-glow-accent-soft: 0 0 0 1px rgba(16, 185, 129, 0.25);
  --ds-glow-accent-strong: 0 0 20px rgba(16, 185, 129, 0.3);

  /* ── Chart — brighter for dark backgrounds ── */
  --ds-chart-1: #60a5fa;
  --ds-chart-2: #34d399;
  --ds-chart-3: #a78bfa;
  --ds-chart-4: #fb923c;
  --ds-chart-5: #22d3ee;
  --ds-chart-6: #f472b6;

  /* ── Shadows ── */
  --ds-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3);
  --ds-shadow-md:
    0 4px 8px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.35);
  --ds-shadow-lg:
    0 12px 20px -4px rgb(0 0 0 / 0.6), 0 4px 8px -4px rgb(0 0 0 / 0.4);
  --ds-shadow-xl:
    0 24px 32px -8px rgb(0 0 0 / 0.7), 0 8px 16px -6px rgb(0 0 0 / 0.5);
}
```

### Tailwind Utility Exposure — `@theme inline`

Paste this block in `app/globals.css` immediately after the token definitions. This exposes all `--ds-*` tokens as Tailwind utility classes with the `ds-` prefix.

```css
@theme inline {
  /* Brand */
  --color-ds-brand-accent: var(--ds-brand-accent);
  --color-ds-brand-accent-hover: var(--ds-brand-accent-hover);
  --color-ds-brand-accent-subtle: var(--ds-brand-accent-subtle);
  --color-ds-brand-black: var(--ds-brand-black);
  --color-ds-brand-black-soft: var(--ds-brand-black-soft);
  --color-ds-brand-black-elevated: var(--ds-brand-black-elevated);

  /* Status */
  --color-ds-status-success: var(--ds-status-success);
  --color-ds-status-warning: var(--ds-status-warning);
  --color-ds-status-error: var(--ds-status-error);
  --color-ds-status-info: var(--ds-status-info);

  /* Surfaces */
  --color-ds-surface-base: var(--ds-surface-base);
  --color-ds-surface-elevated: var(--ds-surface-elevated);
  --color-ds-surface-sunken: var(--ds-surface-sunken);
  --color-ds-surface-overlay: var(--ds-surface-overlay);
  --color-ds-surface-sidebar: var(--ds-surface-sidebar);
  --color-ds-surface-header: var(--ds-surface-header);
  --color-ds-surface-glass: var(--ds-surface-glass);

  /* Text */
  --color-ds-text-primary: var(--ds-text-primary);
  --color-ds-text-secondary: var(--ds-text-secondary);
  --color-ds-text-subtle: var(--ds-text-subtle);
  --color-ds-text-inverse: var(--ds-text-inverse);
  --color-ds-text-link: var(--ds-text-link);

  /* Borders */
  --color-ds-border-base: var(--ds-border-base);
  --color-ds-border-strong: var(--ds-border-strong);
  --color-ds-border-subtle: var(--ds-border-subtle);
  --color-ds-border-glass: var(--ds-border-glass);

  /* Charts */
  --color-ds-chart-1: var(--ds-chart-1);
  --color-ds-chart-2: var(--ds-chart-2);
  --color-ds-chart-3: var(--ds-chart-3);
  --color-ds-chart-4: var(--ds-chart-4);
  --color-ds-chart-5: var(--ds-chart-5);
  --color-ds-chart-6: var(--ds-chart-6);

  /* Radii */
  --radius-ds-sm: var(--ds-radius-sm);
  --radius-ds-md: var(--ds-radius-md);
  --radius-ds-lg: var(--ds-radius-lg);
  --radius-ds-xl: var(--ds-radius-xl);
  --radius-ds-2xl: var(--ds-radius-2xl);
  --radius-ds-full: var(--ds-radius-full);

  /* Shadows */
  --shadow-ds-sm: var(--ds-shadow-sm);
  --shadow-ds-md: var(--ds-shadow-md);
  --shadow-ds-lg: var(--ds-shadow-lg);
  --shadow-ds-xl: var(--ds-shadow-xl);

  /* Typography */
  --font-ds-sans: var(--ds-font-sans);
  --font-ds-mono: var(--ds-font-mono);
}
```

---

## 4. Typography System

### Fonts

| Role           | Stack                                                                | Usage                         |
| -------------- | -------------------------------------------------------------------- | ----------------------------- |
| Sans (primary) | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | All UI text, headings, labels |
| Mono           | `"JetBrains Mono", "Fira Code", monospace`                           | Data tables, numeric values   |

Both loaded via `next/font/google` in `app/layout.tsx`.

### Scale

| Level   | Size                 | Weight  | Letter-spacing | Usage                                        |
| ------- | -------------------- | ------- | -------------- | -------------------------------------------- |
| Display | 36–42px              | 700     | `-0.03em`      | Large stat values in KPI cards               |
| H1      | 30px / `text-3xl`    | 700     | `-0.025em`     | Page titles                                  |
| H2      | 24px / `text-2xl`    | 600     | `-0.02em`      | Section headers                              |
| H3      | 20px / `text-xl`     | 600     | `-0.01em`      | Card headers, section titles on report forms |
| Body    | 15px / `text-[15px]` | 400     | `0`            | Standard prose, form labels                  |
| Small   | 13px / `text-[13px]` | 400     | `0`            | Form hints, field labels, metadata           |
| Meta    | 12px / `text-xs`     | 400–500 | `0.01em`       | Timestamps, read/unread badges               |

### Rules

- Tight letter-spacing on all headings (`-0.01em` to `-0.03em`)
- **Never use pure white (`#FFFFFF`) for body text in dark mode** — use `--ds-text-primary` (`#F8FAFC`)
- Semi-bold (`font-semibold`) for section headers, not bold
- Mono font (`font-ds-mono`) for all numerical data cells in report metric tables
- Line height: `1.5` body · `1.2` headings · `1.8` dense tables

---

## 5. Layout System

### App Shell

```
+--------------------------------------------------+
|  Sidebar (240px / collapsed 80px) |  Main Area  |
|                                   +-------------|
|  - Brand mark + logo              |  Top Header |
|  - Navigation items               +-------------|
|  - Role badge                     |  Content    |
|  - Collapse toggle                |  (scrolls)  |
+-----------------------------------+-------------+
```

| Property          | Desktop     | Tablet          | Mobile          |
| ----------------- | ----------- | --------------- | --------------- |
| Sidebar width     | 240px       | Hidden → Drawer | Hidden → Drawer |
| Sidebar collapsed | 80px        | —               | —               |
| Outer padding     | 24px        | 16px            | 12px            |
| Content max-width | none (full) | —               | —               |

### Bento Grid (KPI / Analytics Sections)

The KPI and analytics sections use a **12-column bento grid**. Report data screens (tables, forms) do **not** use bento — they use standard full-width layouts.

```
Desktop (12-col):
+------------------+------------------+---------+---------+
|  Large Block     |  Large Block     |   SM    |   SM    |
|   (span-6)       |   (span-6)       | (span3) | (span3) |
+-------+----------+------------------+---------+---------+
|  SM   |  Wide Analytics Block (span-9)                  |
|(span3)|                                                  |
+-------+--------------------------------------------------+
```

**Bento rules:**

- `--ds-radius-xl` (20px) on all bento cells
- Mixed heights; KPI min-height `120px`, analytics min-height `240px`
- Gap: `gap-4` (16px)
- Tablet: 6-col · Mobile: single column

### Page Anatomy

Every authenticated page follows this strict top-to-bottom structure:

```
1. Page Header       H1 title + context/date + primary CTA
2. KPI Bento Row     3–5 stat cards (glass surface variant)
3. Primary Data      Main table / list / report form (opaque, no glass)
4. Analytics Row     Charts, trends, sparklines
5. Secondary         Activity feed, quick actions (e.g., report timeline)
```

**Section header pattern:**

```tsx
<div className="flex items-center gap-3 mb-4">
  <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">
    Section Title
  </h2>
  <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
</div>
```

---

## 6. Component Guidelines

### Sidebar

| Property        | Value                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Background      | `bg-ds-surface-sidebar` (white light / `#0A0A0B` dark)                                          |
| Border-right    | `1px solid var(--ds-border-base)`                                                               |
| Active nav item | `bg-ds-brand-accent-subtle` + `text-ds-brand-accent` + `box-shadow: var(--ds-glow-accent-soft)` |
| Hover nav item  | `bg-ds-surface-sunken`                                                                          |
| Text            | `text-ds-text-primary` (theme-aware — do **not** force dark)                                    |

> The sidebar is **theme-aware** — it uses `--ds-surface-sidebar` which is white in light mode and deep black in dark mode. There is **no** `bg-indigo-*` or forced dark background.

### Cards

Four variants, all with `--ds-radius-xl` (20px) corners:

| Variant         | When to Use                               | Style                                                                          |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| **Standard**    | Tables, report forms, CRM data            | `bg-ds-surface-elevated`, `border-ds-border-base`, `shadow-ds-md`              |
| **Glass**       | KPI stat cards, analytics overview blocks | `bg-ds-surface-glass`, `backdrop-filter: blur(12px)`, `border-ds-border-glass` |
| **Elevated**    | Featured / highlighted content            | `bg-ds-surface-elevated`, `shadow-ds-lg`                                       |
| **Glow-active** | Selected / expanded card                  | Standard + `box-shadow: var(--ds-glow-accent-strong)`                          |

### Report Status Badge Colors

| Status         | Token                    |
| -------------- | ------------------------ |
| DRAFT          | `--ds-text-subtle`       |
| SUBMITTED      | `--ds-chart-1` (blue)    |
| REQUIRES_EDITS | `--ds-status-warning`    |
| APPROVED       | `--ds-status-success`    |
| REVIEWED       | `--ds-chart-2` (emerald) |
| LOCKED         | `--ds-text-secondary`    |

### KPI Card — Stat Type Colors

| Stat Type              | Old (relic)       | New Token         |
| ---------------------- | ----------------- | ----------------- |
| Reports / Users        | `text-blue-600`   | `text-ds-chart-1` |
| Campuses / Groups      | `text-green-600`  | `text-ds-chart-2` |
| Templates              | `text-purple-600` | `text-ds-chart-3` |
| Deadlines / Alerts     | `text-orange-600` | `text-ds-chart-4` |
| Compliance / Analytics | —                 | `text-ds-chart-5` |

### Buttons

| Variant       | Style                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| **Primary**   | `bg-ds-brand-accent` · white text · `rounded-[var(--ds-radius-lg)]` (12px)              |
| **Secondary** | Transparent · `border-ds-border-base` · hover: `box-shadow: var(--ds-glow-accent-soft)` |
| **Ghost**     | Text only · `text-ds-text-secondary` · hover: `text-ds-brand-accent`                    |
| **Danger**    | `bg-ds-status-error` · white text                                                       |

### Tables

Tables are report-critical. Clarity above all. **Never** apply glass to tables.

```
Background:  bg-ds-surface-elevated (both modes via token)
Border:      border-ds-border-base
Wrapper:     rounded-[var(--ds-radius-lg)] overflow-hidden
Row hover:   bg-ds-brand-accent-subtle
Headers:     sticky, font-semibold, text-ds-text-secondary
Numeric cols: font-ds-mono
```

### Forms / Inputs

```css
/* Target dimensions */
height: 44px; /* WCAG minimum touch target */
border-radius: var(--ds-radius-lg); /* 12px */
border: 1px solid var(--ds-border-base);
background: var(--ds-surface-sunken);
font-size: 15px;
color: var(--ds-text-primary);

/* Focus */
border-color: var(--ds-brand-accent);
box-shadow: var(--ds-glow-accent-soft);
outline: none;
```

Labels are always **above inputs**, never inline-only or placeholder-only.

### Modals

```css
.ds-modal {
  border-radius: var(--ds-radius-2xl); /* 24px */
}
.ds-modal-header {
  background: var(--ds-surface-glass);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--ds-border-glass);
}
```

Motion: `opacity(0→1)` + `scale(0.97→1.00)`, 200ms ease-in-out.

### Theme Toggle

- Rounded pill, 40×40px
- `bg-ds-surface-elevated` · `border-ds-border-base`
- Hover: `box-shadow: var(--ds-glow-accent-soft)`

---

## 7. Glassmorphism Rules

### Apply glass to:

- KPI / stat cards (in bento section)
- Analytics overview blocks
- Modal headers

### Never apply glass to:

- Data tables
- Report form fields or inputs
- Dense list screens (report list, user list)
- Sidebar navigation items
- Any element where text readability is paramount

### Implementation

**Dark mode:**

```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

**Light mode:**

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.6);
```

A `@layer utilities` class `.glass-surface` is defined in `globals.css`:

```css
@layer utilities {
  .glass-surface {
    background: var(--ds-surface-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--ds-border-glass);
  }
}
```

Glass surfaces require a non-flat parent background to produce a meaningful blur effect.

---

## 8. Glow Border Strategy

### Apply to:

| Context                  | Token                     |
| ------------------------ | ------------------------- |
| Active sidebar nav item  | `--ds-glow-accent-soft`   |
| Selected / active card   | `--ds-glow-accent-strong` |
| Hovered interactive card | `--ds-glow-accent-soft`   |
| Focused input            | `--ds-glow-accent-soft`   |
| Active filter button     | `--ds-glow-accent-soft`   |

### Never apply to:

- Decorative elements at rest
- All cards simultaneously
- Table rows
- Static text or headings

### CSS Classes (defined in `globals.css`)

```css
@layer utilities {
  .ds-hover-glow:hover {
    box-shadow: var(--ds-glow-accent-soft);
    border-color: var(--ds-brand-accent);
    transition:
      box-shadow 200ms ease-in-out,
      border-color 200ms ease-in-out;
  }

  .ds-glow-active {
    box-shadow: var(--ds-glow-accent-strong);
    border-color: var(--ds-brand-accent);
  }
}
```

---

## 9. Motion System

### Principles

- Motion is **purposeful** — it reinforces interaction, not decoration
- Duration: 150–250ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- Never use bounce, overshoot, or looping decorative animations

### Standard Transitions

| Context          | Effect                             | Duration    |
| ---------------- | ---------------------------------- | ----------- |
| Card hover       | `translateY(-2px)` + soft glow     | 200ms       |
| Sidebar collapse | width transition                   | 250ms       |
| Modal open       | `scale(0.97→1.0)` + `opacity(0→1)` | 200ms       |
| Button press     | `scale(0.98)`                      | 100ms       |
| Loading shimmer  | animated gradient                  | 1500ms loop |

### Skeleton Loading Shimmer

```css
@keyframes ds-shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.ds-skeleton {
  background: linear-gradient(
    90deg,
    var(--ds-surface-sunken) 25%,
    rgba(16, 185, 129, 0.06) 50%,
    var(--ds-surface-sunken) 75%
  );
  background-size: 200% 100%;
  animation: ds-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--ds-radius-md);
}
```

`prefers-reduced-motion` suppression must be preserved globally in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Data Visualization Aesthetic

All charts use Recharts. Apply these rules:

- **Series colors:** `--ds-chart-1` through `--ds-chart-6` — never raw Tailwind color classes
- **Area fills:** gradient from accent at `1.0` opacity (top) to `0.0` (baseline)
- **Bars:** rounded top corners (`borderRadius: 4`)
- **Lines:** smooth curves (`type="monotone"`), `strokeWidth: 2`
- **Grid lines:** `--ds-border-subtle` — faint horizontal only, no vertical
- **Axis labels:** `--ds-text-secondary`, `font-ds-mono` for numerical values
- **Dark mode:** Use brighter chart token variants (automatically applied via CSS var)

---

## 11. Visual Hierarchy Pattern

Every page follows this structure — non-negotiable:

```
1. Page Header     H1 title + context/date + primary CTA
                   └─ Section divider: 2px accent-colored underline

2. KPI Bento Row   3–5 stat cards (glass surface variant)
                   └─ Mixed card sizes for visual weight

3. Primary Data    Main table, list, or report form
                   └─ Standard card · no glass · full width

4. Analytics Row   Charts, trends, sparklines
                   └─ Standard or glass card · scrollable on mobile

5. Secondary       Activity logs, quick actions, related info
                   └─ Standard card · no glass
```

---

## 12. Responsiveness Strategy

### Breakpoints

| Name    | Range        | Tailwind prefix |
| ------- | ------------ | --------------- |
| Mobile  | `< 768px`    | (default)       |
| Tablet  | `768–1024px` | `md:`           |
| Desktop | `> 1024px`   | `lg:`           |

### Rules

- **Sidebar:** Hidden on mobile/tablet → Ant Design `<Drawer>`. Desktop: collapsible 240px → 80px.
- **Bento grids:** 12-col desktop · 6-col tablet · single-col mobile
- **Charts:** Horizontal scroll wrapper on mobile (`overflow-x: auto`)
- **Tables:** Horizontal scroll container on mobile/tablet
- **Outer padding:** `p-6` desktop · `p-4` tablet · `p-3` mobile
- **Report forms:** Single column on mobile; 2-col metric grid on tablet+

---

## 13. Ant Design Token Bridge

`providers/AntdProvider.tsx` reads CSS variables at runtime. **Zero hardcoded values.**

```tsx
// providers/AntdProvider.tsx
"use client";
import { ConfigProvider, theme } from "antd";
import { useTheme } from "next-themes";

const getCSSVar = (name: string) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    : "";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: getCSSVar("--ds-brand-accent"),
          colorBgBase: getCSSVar("--ds-surface-base"),
          colorTextBase: getCSSVar("--ds-text-primary"),
          colorSuccess: getCSSVar("--ds-status-success"),
          colorWarning: getCSSVar("--ds-status-warning"),
          colorError: getCSSVar("--ds-status-error"),
          colorInfo: getCSSVar("--ds-status-info"),
          borderRadius: 8,
          fontFamily: getCSSVar("--ds-font-sans"),
        },
      }}>
      {children}
    </ConfigProvider>
  );
}
```

---

## 14. Implementation File Structure

```
app/
  globals.css              ← ALL tokens: palette + semantic + @theme inline
                              .glass-surface .ds-hover-glow .ds-skeleton utilities
                              prefers-reduced-motion + base styles

providers/
  AntdProvider.tsx         ← CSS var bridge — zero hardcoded values

lib/
  design-system/
    tokens.ts              ← TS constants mirroring CSS token names (for dynamic inline styles)
    antd-theme.ts          ← Ant Design token builder helper function
```

### `globals.css` Section Order

```
1. @import (Tailwind + fonts)
2. :root — Palette tokens
3. :root — Semantic tokens light mode
4. .dark — Semantic token dark overrides
5. @theme inline — Tailwind utility exposure
6. body, html, box-sizing base styles
7. @layer utilities — .glass-surface .ds-hover-glow .ds-glow-active .ds-skeleton
8. Ant Design component-scope overrides (antd .ant-* where needed)
9. Scrollbar styling
10. Accessibility / prefers-reduced-motion
```

---

## 15. Token Migration Map

When adapting any relic code, replace old patterns with new `ds-*` tokens:

| Old Pattern                                   | Replace With                                  |
| --------------------------------------------- | --------------------------------------------- |
| `bg-indigo-600/700/800` (sidebar)             | `bg-ds-surface-sidebar`                       |
| `bg-white dark:bg-slate-800`                  | `bg-ds-surface-elevated`                      |
| `dark:bg-gray-800`                            | `bg-ds-surface-elevated`                      |
| `from-slate-50 dark:from-gray-900`            | `bg-ds-surface-base`                          |
| `text-gray-900 dark:text-white`               | `text-ds-text-primary`                        |
| `text-gray-600 dark:text-gray-400`            | `text-ds-text-secondary`                      |
| `text-gray-500 dark:text-gray-400`            | `text-ds-text-subtle`                         |
| `border-gray-100 dark:border-slate-700`       | `border-ds-border-base`                       |
| `text-blue-600 dark:text-blue-400` (stat)     | `text-ds-chart-1`                             |
| `text-green-600 dark:text-green-400` (stat)   | `text-ds-chart-2`                             |
| `text-purple-600 dark:text-purple-400` (stat) | `text-ds-chart-3`                             |
| `text-orange-600 dark:text-orange-400` (stat) | `text-ds-chart-4`                             |
| `bg-church-primary` / `text-church-primary`   | `bg-ds-brand-accent` / `text-ds-brand-accent` |
| `rounded-xl` (cards)                          | `rounded-[var(--ds-radius-xl)]`               |
| `rounded-lg` (buttons, inputs)                | `rounded-[var(--ds-radius-lg)]`               |
| `shadow-lg hover:shadow-xl`                   | `shadow-ds-md hover:shadow-ds-lg`             |
| `colorPrimary: "#1B4B3E"` in AntdProvider     | `getCSSVar('--ds-brand-accent')`              |
| Any hardcoded hex in `AntdProvider`           | `getCSSVar('--ds-*')`                         |

---

## 16. Design Anti-Patterns

Explicitly prohibited in this codebase:

| Anti-pattern                                                             | Why                                                           |
| ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Glow on every card at rest                                               | Glow loses emphasis — reserved for interaction states only    |
| Glass on data tables or report forms                                     | Glass impairs readability in dense data contexts              |
| Multiple concurrent accent colors                                        | Single accent rule — Harvesters Emerald only                  |
| Inconsistent radius values                                               | Use `--ds-radius-*` tokens exclusively                        |
| Raw Tailwind color classes (`blue-600`, `gray-800`) for semantic purpose | Use `ds-*` classes only                                       |
| `dark:` inline overrides in component classes                            | Color adaptation is handled by the semantic token layer       |
| Pure white `#FFFFFF` for body text in dark mode                          | Use `--ds-text-primary` (`#F8FAFC`)                           |
| Heavy drop shadows in dark mode                                          | Glow for depth; heavy shadows disappear on dark surfaces      |
| Forcing sidebar to always dark                                           | Sidebar must respect active theme                             |
| `theme="dark"` on Ant Design `<Sider>`                                   | Sidebar theming via CSS tokens, not Ant Design dark mode prop |
| More than 5 KPI cards in one bento row                                   | Max 5 KPIs with varied sizing                                 |
| Hardcoded color in `AntdProvider`                                        | 100% CSS-var driven                                           |
| "Church Fellowship CRM" anywhere in UI copy                              | This is the Reporting System                                  |
````

## File: .github/plan.md
````markdown
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
````

## File: .github/project-context.md
````markdown
# Harvesters Reporting System — Project Context

> **Last Updated:** March 2026
> **Status:** Planning complete — build in progress

---

## 1. System Purpose

The Harvesters Central Reporting System is a **standalone, role-based web application** built for Harvesters International Christian Center. It replaces the current fragmented process where campus administrators collect and submit reports in various formats (Excel, WhatsApp, Word documents) with no standardization, accountability, or centralized storage.

The system standardizes report collection across all campuses and groups by:

1. Providing **superadmin-configurable report templates** with strategic indicators and key metrics
2. Enabling **hierarchical report submission** — campus departmental leaders fill sections, campus admins compile and submit, the submission flows upward through campus pastors, group admins/pastors, to church ministry, SPO, and CEO
3. Enforcing **deadlines with escalating reminders** and automatic approval fallback
4. Maintaining a **full audit trail** — every state change, edit, and approval is recorded with actor and timestamp
5. Providing **analytics dashboards** for compliance rates, on-time submission, and cross-campus performance comparisons

This system is **standalone today** but designed for future federation into a broader Harvesters CRM platform. Every entity uses UUIDs, every module is barrel-exported, and no IDs are hardcoded — integration with other systems requires minimal changes.

---

## 2. Organizational Context

**Organization:** Harvesters International Christian Center
**Founded:** December 13, 2003, by Pastor Bolaji Idowu
**Scale:** 70,000+ worshippers across Nigeria, United Kingdom, and United States
**Mission:** Changing lives by pioneering thriving churches in key global cities that bring hope, connect people with God, influence culture, and lead people to become fully devoted followers of Christ

---

## 3. Stakeholder & User Roles

The system has **9 active roles** derived directly from the PRD, plus `MEMBER` scaffolded in types/config for future activation (no routes built in this iteration). All non-SUPERADMIN roles are routed to the `/leader` path and rendered dynamically based on their specific role.

> **Roles not in this system:** `ZONAL_LEADER`, `HOD`, `SMALL_GROUP_LEADER`, `CELL_LEADER` belonged to the CRM layer and are permanently out of scope. The config-driven architecture means removing them only requires changes to `types/global.d.ts` and `config/roles.ts`.

| Role              | Label           | Route         | Primary Responsibility                                                                                          |
| ----------------- | --------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| `SUPERADMIN`      | Super Admin     | `/superadmin` | Full system access: template management, user management, goal overrides, org management, data entry            |
| `SPO`             | Senior Pastor   | `/leader`     | Reviews all group reports for executive oversight; approves goal unlock requests; read-all analytics            |
| `CEO`             | CEO             | `/leader`     | Reviews all group reports for final oversight; approves goal unlock requests; read-all analytics                |
| `CHURCH_MINISTRY` | Church Ministry | `/leader`     | Reviews and stores all reports; approves goal unlock requests; primary record-keeper with full analytics access |
| `GROUP_PASTOR`    | Group Pastor    | `/leader`     | Reviews all campus reports under their group; marks reports as Reviewed                                         |
| `GROUP_ADMIN`     | Group Admin     | `/leader`     | Sets goals (annual/monthly per metric, with campus overrides); consolidates campus reports; marks Reviewed      |
| `CAMPUS_PASTOR`   | Campus Pastor   | `/leader`     | Reviews submitted campus reports; approves or requests edits                                                    |
| `CAMPUS_ADMIN`    | Campus Admin    | `/leader`     | Primary report filler; compiles and submits consolidated campus report                                          |
| `DATA_ENTRY`      | Data Entry      | `/leader`     | Enters historical/back-filled reports with custom date selection; no review/approval capabilities               |
| `MEMBER`          | Member          | `/member`     | Scaffolded only — defined in enums and ROLE_CONFIG but no routes built in this iteration                        |

### Role Hierarchy Order

```
SUPERADMIN (0) → SPO (1) → CEO (2) → CHURCH_MINISTRY (3) →
GROUP_PASTOR (4) → GROUP_ADMIN (5) → CAMPUS_PASTOR (6) → CAMPUS_ADMIN (7) →
DATA_ENTRY (8) → MEMBER (9, scaffolded)
```

### Executive Stakeholder Notes

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
````

## File: .github/repair-instructions.md
````markdown
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
````

## File: .github/summaries/production-readiness-sprint.md
````markdown
# Production-Readiness Sprint — March 2026

## Group A — Bug Fixes (Critical)

- [x] A1: Dashboard template count — use `isActive` instead of `isDefault`
- [x] A2: Invite link `DELETE` handler (405 fix)
- [x] A3: OFFICE_OF_CEO templates access
- [x] A4: Offline auth — don't clear user on network failure

## Group B — Role & Access Audit

- [x] B1: Nav-to-page role consistency pass (all pages)

## Group C — Offline / PWA

- [x] C1: SW serves cached pages before `/offline` fallback
- [x] C2: SW error isolation (try/catch + global handlers)
- [x] C3: "Remember me" persistence in sign-in form

## Group D — Performance

- [x] D1: loading.tsx skeletons, Link prefetch, SW stale-while-revalidate

## Group E — UI/UX Fixes

- [x] E1: Goals monthly grid horizontal scroll
- [x] E2: Table row click navigation
- [x] E3: Registration redirect / stuck loading
- [x] E4: Expired invite link dedicated states
- [x] E5: Tooltip text color (light mode)
- [x] E6: System theme dark mode consistency

## Group F — Invite Link Enhancements

- [x] F1: Campus + group assignment fields in create form

## Group G — Quarterly Summaries (New Feature)

- [x] G1: Types & config (QuarterlySummary, routes, content)
- [x] G2: API route `GET /api/analytics/quarterly`
- [x] G3: Analytics "Quarterly" tab panel
- [x] G4: Dashboard KPI card for current quarter

## Group H — Export Dialog Enhancement

- [x] H1: ExportDialog component with options
- [x] H2: Extended export functions (multi-sheet, metrics)
- [x] H3: ExportDialog wired into ReportsListPage

---

## Logo Update

- [x] Replaced "H" lettermarks in join/register pages with Harvesters brand logo
- [x] Verified layout.tsx metadata, manifest.ts, sw.js push icons, dashboard sidebar, login page — all correct
````

## File: app/(auth)/forgot-password/layout.tsx
````typescript
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.auth.forgotTitle as string,
  description: CONTENT.seo.forgotPasswordDescription,
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
````

## File: app/(auth)/forgot-password/page.tsx
````typescript
"use client";

/**
 * app/(auth)/forgot-password/page.tsx
 */

import { useState } from "react";
import { Form } from "antd";
import Link from "next/link";
import { MailOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ForgotFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [form] = Form.useForm<ForgotFormValues>();

  const handleSubmit = async (values: ForgotFormValues) => {
    setLoading(true);
    try {
      const res = await fetch(API_ROUTES.auth.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      setSent(true);
      if (json.devToken) setDevToken(json.devToken);
    } catch {
      /* still show success to prevent enumeration */
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-8 shadow-ds-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-ds-brand-accent/10 rounded-ds-xl flex items-center justify-center mx-auto mb-4">
              <MailOutlined className="text-2xl text-ds-brand-accent" />
            </div>
            <h1 className="text-2xl font-bold text-ds-text-primary">
              {CONTENT.auth.forgotTitle as string}
            </h1>
            <p className="text-sm text-ds-text-secondary mt-1">
              {CONTENT.auth.forgotSubtitle as string}
            </p>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-ds-text-primary">
                If an account exists for that email, we&rsquo;ve sent reset instructions.
              </p>

              {/* Dev hint */}
              {devToken && (
                <div className="bg-ds-surface-sunken rounded-ds-lg p-3 text-left mt-4">
                  <p className="text-xs font-semibold text-ds-text-subtle mb-1">
                    Dev Mode — Reset Token
                  </p>
                  <p className="text-xs font-mono break-all text-ds-text-primary">{devToken}</p>
                  <Link
                    href={`${APP_ROUTES.resetPassword}?token=${devToken}`}
                    className="text-xs text-ds-brand-accent mt-2 inline-block"
                  >
                    Open reset page →
                  </Link>
                </div>
              )}

              <Link href={APP_ROUTES.login} className="text-sm text-ds-brand-accent block mt-4">
                {CONTENT.auth.loginLink as string}
              </Link>
            </div>
          ) : (
            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
              <Form.Item
                name="email"
                label={CONTENT.auth.emailLabel as string}
                rules={[
                  { required: true, message: CONTENT.auth.errors.emailRequired as string },
                  { type: "email", message: "Enter a valid email address." },
                ]}
              >
                <Input
                  size="large"
                  placeholder={CONTENT.auth.emailPlaceholder as string}
                  prefix={<MailOutlined className="text-ds-text-subtle" />}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                {CONTENT.auth.sendResetLink as string}
              </Button>

              <p className="text-center text-sm text-ds-text-secondary mt-4">
                {CONTENT.auth.alreadyHaveAccount as string}{" "}
                <Link href={APP_ROUTES.login} className="text-ds-brand-accent">
                  {CONTENT.auth.loginLink as string}
                </Link>
              </p>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
````

## File: app/(auth)/layout.tsx
````typescript
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ds-surface-sunken flex items-center justify-center p-4">
      {/* Subtle brand gradient backdrop */}
      <div className="fixed inset-0 bg-gradient-to-br from-ds-brand-accent-subtle/30 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
````

## File: app/(auth)/login/layout.tsx
````typescript
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.auth.loginTitle as string,
  description: CONTENT.seo.loginDescription,
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
````

## File: app/(auth)/register/layout.tsx
````typescript
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.auth.registerTitle as string,
  description: CONTENT.seo.registerDescription,
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
````

## File: app/(auth)/reset-password/layout.tsx
````typescript
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.auth.resetTitle as string,
  description: CONTENT.seo.resetPasswordDescription,
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
````

## File: app/(auth)/reset-password/page.tsx
````typescript
"use client";

/**
 * app/(auth)/reset-password/page.tsx
 */

import { useState, Suspense } from "react";
import { Form } from "antd";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LockOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<ResetFormValues>();

  const handleSubmit = async (values: ResetFormValues) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([
        { name: "confirmPassword", errors: [CONTENT.auth.errors.passwordsDoNotMatch as string] },
      ]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.auth.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? (CONTENT.auth.errors.serverError as string));
        return;
      }
      setDone(true);
    } catch {
      setError(CONTENT.auth.errors.serverError as string);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-ds-state-error mb-4">
          {CONTENT.auth.errors.invalidToken as string}
        </p>
        <Link href={APP_ROUTES.forgotPassword} className="text-ds-brand-accent text-sm">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-ds-text-primary">Your password has been reset successfully.</p>
        <Link href={APP_ROUTES.login} className="text-ds-brand-accent text-sm block">
          {CONTENT.auth.loginLink as string}
        </Link>
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
      {error && (
        <div className="bg-ds-state-error/10 border border-ds-state-error/30 rounded-ds-lg p-3 mb-4">
          <p className="text-xs text-ds-state-error">{error}</p>
        </div>
      )}

      <Form.Item
        name="password"
        label={CONTENT.auth.newPasswordLabel as string}
        rules={[
          { required: true, message: CONTENT.auth.errors.passwordRequired as string },
          { min: 8, message: CONTENT.auth.errors.passwordTooShort as string },
        ]}
      >
        <Input.Password size="large" prefix={<LockOutlined className="text-ds-text-subtle" />} />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label={CONTENT.auth.confirmPasswordLabel as string}
        rules={[{ required: true, message: "Please confirm your password." }]}
      >
        <Input.Password size="large" prefix={<LockOutlined className="text-ds-text-subtle" />} />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" block loading={loading}>
        {CONTENT.auth.resetButton as string}
      </Button>

      <p className="text-center text-sm text-ds-text-secondary mt-4">
        {CONTENT.auth.alreadyHaveAccount as string}{" "}
        <Link href={APP_ROUTES.login} className="text-ds-brand-accent">
          {CONTENT.auth.loginLink as string}
        </Link>
      </p>
    </Form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-8 shadow-ds-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-ds-brand-accent/10 rounded-ds-xl flex items-center justify-center mx-auto mb-4">
              <LockOutlined className="text-2xl text-ds-brand-accent" />
            </div>
            <h1 className="text-2xl font-bold text-ds-text-primary">
              {CONTENT.auth.resetTitle as string}
            </h1>
            <p className="text-sm text-ds-text-secondary mt-1">
              {CONTENT.auth.resetSubtitle as string}
            </p>
          </div>

          <Suspense
            fallback={<div className="animate-pulse h-40 bg-ds-surface-sunken rounded-ds-lg" />}
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
````

## File: app/(dashboard)/analytics/loading.tsx
````typescript
import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonBlock height="h-8" width="w-40" />
      <SkeletonBlock height="h-10" width="w-full" />
      <LoadingSkeleton rows={6} />
    </div>
  );
}
````

## File: app/(dashboard)/bug-reports/page.tsx
````typescript
import type { Metadata } from "next";
import { BugReportPage } from "@/modules/bug-reports";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.bugReports.pageTitle as string,
  description: CONTENT.seo.bugReportsDescription,
};

export default function BugReportsPage() {
  return <BugReportPage />;
}
````

## File: app/(dashboard)/dashboard/loading.tsx
````typescript
import { LoadingSkeleton, SkeletonBlock, SkeletonCard } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <SkeletonBlock height="h-8" width="w-48" />
        <SkeletonBlock height="h-10" width="w-32" />
      </div>
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Content skeleton */}
      <LoadingSkeleton rows={6} />
    </div>
  );
}
````

## File: app/(dashboard)/goals/loading.tsx
````typescript
import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock height="h-8" width="w-28" />
        <div className="flex gap-2">
          <SkeletonBlock height="h-10" width="w-40" />
          <SkeletonBlock height="h-10" width="w-24" />
        </div>
      </div>
      <SkeletonBlock height="h-10" width="w-full" />
      <LoadingSkeleton rows={8} />
    </div>
  );
}
````

## File: app/(dashboard)/inbox/loading.tsx
````typescript
import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonBlock height="h-8" width="w-28" />
      <LoadingSkeleton rows={6} />
    </div>
  );
}
````

## File: app/(dashboard)/invites/loading.tsx
````typescript
import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonBlock height="h-8" width="w-36" />
      <SkeletonBlock height="h-12" width="w-full" />
      <LoadingSkeleton rows={5} />
    </div>
  );
}
````

## File: app/(dashboard)/reports/loading.tsx
````typescript
import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock height="h-8" width="w-36" />
        <SkeletonBlock height="h-10" width="w-36" />
      </div>
      <SkeletonBlock height="h-10" width="w-full" />
      <LoadingSkeleton rows={8} />
    </div>
  );
}
````

## File: app/(dashboard)/settings/page.tsx
````typescript
import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/config/routes";

// Settings are now consolidated into the Profile page (Appearance + Notifications tabs).
export default function Page() {
  redirect(`${APP_ROUTES.profile}?tab=appearance`);
}
````

## File: app/(dashboard)/templates/loading.tsx
````typescript
import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock height="h-8" width="w-36" />
        <SkeletonBlock height="h-10" width="w-36" />
      </div>
      <LoadingSkeleton rows={5} />
    </div>
  );
}
````

## File: app/(dashboard)/users/loading.tsx
````typescript
import { LoadingSkeleton, SkeletonBlock } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonBlock height="h-8" width="w-28" />
      <LoadingSkeleton rows={6} />
    </div>
  );
}
````

## File: app/api/analytics/quarterly/route.ts
````typescript
/**
 * app/api/analytics/quarterly/route.ts
 * GET /api/analytics/quarterly
 *
 * Returns a detailed quarterly summary: totals, compliance, QoQ delta,
 * and per-campus breakdown for the selected quarter.
 *
 * Query params:
 *   year?    — defaults to current year
 *   quarter? — 1-4, defaults to current quarter
 *   campusId? — filter to a single campus
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus } from "@/types/global";

const QuerySchema = z.object({
    year: z.coerce.number().optional(),
    quarter: z.coerce.number().min(1).max(4).optional(),
    campusId: z.string().optional(),
});

function getQuarterMonths(q: number): number[] {
    return [(q - 1) * 3 + 1, (q - 1) * 3 + 2, (q - 1) * 3 + 3];
}

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const query = QuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));

    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const quarter = query.quarter ?? Math.ceil((now.getMonth() + 1) / 3);

    const cacheKey = `analytics:quarterly:${auth.user.id}:${year}:Q${quarter}:${query.campusId ?? "all"}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];

    /* ── Build where clause ─────────────────────────────────────────────── */
    const months = getQuarterMonths(quarter);
    const where: Record<string, unknown> = {
        periodYear: year,
        periodMonth: { in: months },
    };
    if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
        where.campusId = auth.user.campusId;
    }
    if (query.campusId) where.campusId = query.campusId;

    const reports = await db.report.findMany({ where });

    /* ── Previous quarter data for QoQ comparison ─────────────────────── */
    const prevQ = quarter === 1 ? 4 : quarter - 1;
    const prevYear = quarter === 1 ? year - 1 : year;
    const prevMonths = getQuarterMonths(prevQ);
    const prevWhere: Record<string, unknown> = {
        periodYear: prevYear,
        periodMonth: { in: prevMonths },
    };
    if (where.campusId) prevWhere.campusId = where.campusId;
    if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
        prevWhere.campusId = auth.user.campusId;
    }
    const prevReports = await db.report.findMany({ where: prevWhere });

    /* ── Compute totals ────────────────────────────────────────────────── */
    function computeTotals(rpts: typeof reports) {
        const total = rpts.length;
        const submitted = rpts.filter((r) => r.status !== ReportStatus.DRAFT).length;
        const approved = rpts.filter((r) =>
            [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status as ReportStatus),
        ).length;
        const compliance = submitted > 0 ? Math.round((approved / submitted) * 100) : 0;
        return { total, submitted, approved, compliance };
    }

    const current = computeTotals(reports);
    const previous = computeTotals(prevReports);

    const qoqDelta = {
        total: current.total - previous.total,
        submitted: current.submitted - previous.submitted,
        approved: current.approved - previous.approved,
        compliance: current.compliance - previous.compliance,
    };

    /* ── Campus breakdown ──────────────────────────────────────────────── */
    const campusMap: Record<string, { submitted: number; approved: number; total: number }> = {};
    for (const r of reports) {
        if (!campusMap[r.campusId]) campusMap[r.campusId] = { submitted: 0, approved: 0, total: 0 };
        campusMap[r.campusId].total++;
        if (r.status !== ReportStatus.DRAFT) campusMap[r.campusId].submitted++;
        if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status as ReportStatus)) {
            campusMap[r.campusId].approved++;
        }
    }
    const campusBreakdown = Object.entries(campusMap)
        .map(([campusId, stats]) => ({
            campusId,
            total: stats.total,
            submitted: stats.submitted,
            approved: stats.approved,
            complianceRate: stats.submitted > 0 ? Math.round((stats.approved / stats.submitted) * 100) : 0,
        }))
        .sort((a, b) => b.complianceRate - a.complianceRate);

    /* ── Monthly breakdown within quarter ──────────────────────────────── */
    const monthlyBreakdown = months.map((m) => {
        const monthReports = reports.filter((r) => r.periodMonth === m);
        const totals = computeTotals(monthReports);
        return { month: m, label: `${year}-${String(m).padStart(2, "0")}`, ...totals };
    });

    const data = {
        year,
        quarter,
        label: `${year} Q${quarter}`,
        current,
        previous: { ...previous, label: `${prevYear} Q${prevQ}` },
        qoqDelta,
        campusBreakdown,
        monthlyBreakdown,
    };

    const response = { success: true, data };
    await cache.set(cacheKey, JSON.stringify(response), 120);
    return NextResponse.json(response);
}
````

## File: app/api/bug-reports/[id]/route.ts
````typescript
/**
 * app/api/bug-reports/[id]/route.ts
 * GET   /api/bug-reports/:id — get single bug report
 * PATCH /api/bug-reports/:id — update status / admin notes (SUPERADMIN only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import {
    successResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole, BugReportStatus } from "@/types/global";

/* ── Update schema ─────────────────────────────────────────────────────────── */

const UpdateBugReportSchema = z.object({
    status: z.nativeEnum(BugReportStatus).optional(),
    adminNotes: z.string().max(5000).optional(),
});

/* ── GET ───────────────────────────────────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;

        const bugReport = await db.bugReport.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
        if (!bugReport) return notFoundResponse("Bug report not found.");

        // Non-superadmins can only view their own reports
        if (auth.user.role !== UserRole.SUPERADMIN && bugReport.createdById !== auth.user.id) {
            return forbiddenResponse("You do not have access to this bug report.");
        }

        return NextResponse.json(successResponse(bugReport));
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── PATCH ─────────────────────────────────────────────────────────────────── */

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        if (auth.user.role !== UserRole.SUPERADMIN) {
            return forbiddenResponse("Only SUPERADMIN can update bug reports.");
        }

        const { id } = await params;
        const body = UpdateBugReportSchema.parse(await req.json());

        const existing = await db.bugReport.findUnique({ where: { id } });
        if (!existing) return notFoundResponse("Bug report not found.");

        const updated = await db.bugReport.update({
            where: { id },
            data: {
                ...(body.status !== undefined && { status: body.status }),
                ...(body.adminNotes !== undefined && { adminNotes: body.adminNotes }),
            },
        });

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/bug-reports/route.ts
````typescript
/**
 * app/api/bug-reports/route.ts
 * GET  /api/bug-reports — list bug reports (own for regular users, all for SUPERADMIN)
 * POST /api/bug-reports — create a new bug report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import {
    successResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole, BugReportCategory } from "@/types/global";

/* ── Schemas ───────────────────────────────────────────────────────────────── */

const CreateBugReportSchema = z.object({
    category: z.nativeEnum(BugReportCategory),
    description: z.string().min(10).max(2000),
    screenshotUrl: z.string().optional(),
    contactEmail: z.string().email(),
});

const ListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.string().optional(),
    category: z.nativeEnum(BugReportCategory).optional(),
});

/* ── GET ───────────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const params = Object.fromEntries(new URL(req.url).searchParams);
        const query = ListQuerySchema.parse(params);
        const { page, pageSize, status, category } = query;

        const where: Record<string, unknown> = {};

        // Non-superadmins only see their own bug reports
        if (auth.user.role !== UserRole.SUPERADMIN) {
            where.createdById = auth.user.id;
        }

        if (status) where.status = status;
        if (category) where.category = category;

        const [bugReports, total] = await Promise.all([
            db.bugReport.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    createdBy: {
                        select: { id: true, firstName: true, lastName: true, email: true },
                    },
                },
            }),
            db.bugReport.count({ where }),
        ]);

        return NextResponse.json(
            successResponse({ bugReports, total, page, pageSize }),
        );
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── POST ──────────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const body = CreateBugReportSchema.parse(await req.json());

        const bugReport = await db.bugReport.create({
            data: {
                category: body.category,
                description: body.description,
                screenshotUrl: body.screenshotUrl ?? null,
                contactEmail: body.contactEmail,
                createdById: auth.user.id,
            },
        });

        return NextResponse.json(successResponse(bugReport), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/invite-links/[id]/route.ts
````typescript
/**
 * app/api/invite-links/[id]/route.ts
 * DELETE /api/invite-links/:id — revoke an invite link (set isActive: false)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const ALLOWED_ROLES = [
    UserRole.SUPERADMIN,
    UserRole.CAMPUS_ADMIN,
    UserRole.CAMPUS_PASTOR,
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
];

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await verifyAuth(req, ALLOWED_ROLES);
    if (!auth.success) {
        return NextResponse.json(
            { success: false, error: auth.error },
            { status: auth.status ?? 401 },
        );
    }

    const { id } = await params;

    const link = await db.inviteLink.findUnique({ where: { id } });
    if (!link) {
        return NextResponse.json(
            { success: false, error: "Invite link not found" },
            { status: 404 },
        );
    }

    // Only the creator or a SUPERADMIN can revoke
    if (link.createdById !== auth.user.id && auth.user.role !== UserRole.SUPERADMIN) {
        return NextResponse.json(
            { success: false, error: "You can only revoke your own invite links" },
            { status: 403 },
        );
    }

    if (!link.isActive) {
        return NextResponse.json(
            { success: false, error: "Invite link is already revoked" },
            { status: 400 },
        );
    }

    const updated = await db.inviteLink.update({
        where: { id },
        data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: updated });
}
````

## File: app/api/invite-links/validate/[token]/route.ts
````typescript
/**
 * app/api/invite-links/validate/[token]/route.ts
 * GET /api/invite-links/validate/:token  — validate invite link (public — no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/data/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const link = await db.inviteLink.findUnique({ where: { token } });

  if (!link) {
    return NextResponse.json({ success: false, error: "Invalid or expired invite link." }, { status: 404 });
  }

  if (link.usedAt) {
    return NextResponse.json({ success: false, error: "This invite link has already been used." }, { status: 410 });
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return NextResponse.json({ success: false, error: "This invite link has expired." }, { status: 410 });
  }

  /* Return public-safe subset */
  return NextResponse.json({
    success: true,
    data: {
      token: link.token,
      targetRole: link.targetRole,
      campusId: link.campusId,
      groupId: link.groupId,
      expiresAt: link.expiresAt,
    },
  });
}
````

## File: app/error.tsx
````typescript
"use client";

import { useEffect } from "react";
import { Button } from "antd";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-ds-surface-base px-6 text-center">
      <div className="w-16 h-16 rounded-ds-2xl bg-ds-status-error-bg flex items-center justify-center text-3xl">
        ⚠
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-semibold text-ds-text-primary">{CONTENT.errors.errorTitle}</h1>
        <p className="text-ds-text-secondary">{CONTENT.errors.errorDescription}</p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 text-xs text-left bg-ds-surface-sunken border border-ds-border-subtle rounded-ds-lg p-4 overflow-auto max-h-40">
            {error.message}
          </pre>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} type="primary" size="large">
          {CONTENT.errors.errorCta}
        </Button>
        <Button href={APP_ROUTES.dashboard} size="large">
          {CONTENT.nav.dashboard}
        </Button>
      </div>
    </div>
  );
}
````

## File: app/globals.css
````css
/* ══════════════════════════════════════════════════════════════════════════════
   1. IMPORTS
   ══════════════════════════════════════════════════════════════════════════════ */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

/* ══════════════════════════════════════════════════════════════════════════════
   2. PALETTE TOKENS  +  3. SEMANTIC TOKENS — LIGHT (:root)
   ══════════════════════════════════════════════════════════════════════════════ */
:root {
  /* ── Palette ─────────────────────────────────────────── */
  --palette-black-base: #0a0a0b;
  --palette-black-soft: #111214;
  --palette-black-elevated: #16171a;

  --palette-emerald-900: #064e3b;
  --palette-emerald-700: #047857;
  --palette-emerald-600: #059669;
  --palette-emerald-500: #10b981;
  --palette-emerald-400: #34d399;
  --palette-emerald-200: #a7f3d0;
  --palette-emerald-50: #ecfdf5;

  --palette-neutral-950: #0a0a0a;
  --palette-neutral-900: #0f172a;
  --palette-neutral-800: #1e293b;
  --palette-neutral-700: #374151;
  --palette-neutral-600: #4b5563;
  --palette-neutral-500: #64748b;
  --palette-neutral-400: #94a3b8;
  --palette-neutral-300: #cbd5e1;
  --palette-neutral-200: #e5e7eb;
  --palette-neutral-100: #f1f5f9;
  --palette-neutral-50: #f8f9fb;
  --palette-neutral-0: #ffffff;

  /* ── Brand / Accent ──────────────────────────────────── */
  --ds-brand-accent: var(--palette-emerald-500);
  --ds-brand-accent-hover: var(--palette-emerald-600);
  --ds-brand-accent-subtle: var(--palette-emerald-50);
  --ds-brand-black: var(--palette-black-base);
  --ds-brand-black-soft: var(--palette-black-soft);
  --ds-brand-black-elevated: var(--palette-black-elevated);

  /* ── Status ──────────────────────────────────────────── */
  --ds-status-success: #15803d;
  --ds-status-warning: #b45309;
  --ds-status-error: #dc2626;
  --ds-status-info: var(--palette-emerald-700);

  /* ── Surfaces ────────────────────────────────────────── */
  --ds-surface-base: var(--palette-neutral-50);
  --ds-surface-elevated: var(--palette-neutral-0);
  --ds-surface-sunken: var(--palette-neutral-100);
  --ds-surface-overlay: var(--palette-neutral-0);
  --ds-surface-sidebar: var(--palette-neutral-0);
  --ds-surface-header: var(--palette-neutral-0);
  --ds-surface-glass: rgba(255, 255, 255, 0.7);

  /* ── Text ────────────────────────────────────────────── */
  --ds-text-primary: var(--palette-neutral-900);
  --ds-text-secondary: var(--palette-neutral-500);
  --ds-text-subtle: var(--palette-neutral-400);
  --ds-text-inverse: var(--palette-neutral-0);
  --ds-text-link: var(--palette-emerald-600);

  /* ── Borders ─────────────────────────────────────────── */
  --ds-border-base: var(--palette-neutral-200);
  --ds-border-strong: var(--palette-neutral-300);
  --ds-border-subtle: var(--palette-neutral-100);
  --ds-border-glass: rgba(255, 255, 255, 0.6);

  /* ── Glow ────────────────────────────────────────────── */
  --ds-glow-accent-soft: 0 0 0 1px rgba(16, 185, 129, 0.2);
  --ds-glow-accent-strong: 0 0 20px rgba(16, 185, 129, 0.25);

  /* ── Chart / Categorical ─────────────────────────────── */
  --ds-chart-1: #2563eb;
  --ds-chart-2: #10b981;
  --ds-chart-3: #7c3aed;
  --ds-chart-4: #ea580c;
  --ds-chart-5: #0891b2;
  --ds-chart-6: #be185d;

  /* ── Shape ───────────────────────────────────────────── */
  --ds-radius-sm: 4px;
  --ds-radius-md: 8px;
  --ds-radius-lg: 12px;
  --ds-radius-xl: 20px;
  --ds-radius-2xl: 24px;
  --ds-radius-full: 9999px;

  /* ── Shadows ─────────────────────────────────────────── */
  --ds-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --ds-shadow-md: 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --ds-shadow-lg: 0 12px 20px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06);
  --ds-shadow-xl: 0 24px 32px -8px rgb(0 0 0 / 0.12), 0 8px 16px -6px rgb(0 0 0 / 0.07);

  /* ── Typography ──────────────────────────────────────── */
  --ds-font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ds-font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
}

/* ══════════════════════════════════════════════════════════════════════════════
   4. SEMANTIC TOKENS — DARK OVERRIDE (.dark)
   ══════════════════════════════════════════════════════════════════════════════ */
.dark {
  /* ── Surfaces ────────────────────────────────────────── */
  --ds-surface-base: var(--palette-black-base);
  --ds-surface-elevated: var(--palette-black-soft);
  --ds-surface-sunken: var(--palette-black-base);
  --ds-surface-overlay: var(--palette-black-soft);
  --ds-surface-sidebar: var(--palette-black-base);
  --ds-surface-header: var(--palette-black-soft);
  --ds-surface-glass: rgba(255, 255, 255, 0.04);

  /* ── Brand accent — UNCHANGED across themes ──────────── */
  --ds-brand-accent-subtle: rgba(16, 185, 129, 0.12);

  /* ── Status ──────────────────────────────────────────── */
  --ds-status-success: #4ade80;
  --ds-status-warning: #fbbf24;
  --ds-status-error: #f87171;
  --ds-status-info: var(--palette-emerald-400);

  /* ── Text ────────────────────────────────────────────── */
  --ds-text-primary: #f8fafc;
  --ds-text-secondary: var(--palette-neutral-400);
  --ds-text-subtle: #475569;
  --ds-text-inverse: var(--palette-neutral-900);
  --ds-text-link: var(--palette-emerald-400);

  /* ── Borders ─────────────────────────────────────────── */
  --ds-border-base: rgba(255, 255, 255, 0.08);
  --ds-border-strong: rgba(255, 255, 255, 0.14);
  --ds-border-subtle: rgba(255, 255, 255, 0.04);
  --ds-border-glass: rgba(255, 255, 255, 0.08);

  /* ── Glow ────────────────────────────────────────────── */
  --ds-glow-accent-soft: 0 0 0 1px rgba(16, 185, 129, 0.25);
  --ds-glow-accent-strong: 0 0 20px rgba(16, 185, 129, 0.3);

  /* ── Chart — brighter for dark backgrounds ───────────── */
  --ds-chart-1: #60a5fa;
  --ds-chart-2: #34d399;
  --ds-chart-3: #a78bfa;
  --ds-chart-4: #fb923c;
  --ds-chart-5: #22d3ee;
  --ds-chart-6: #f472b6;

  /* ── Shadows — deeper in dark mode ───────────────────── */
  --ds-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3);
  --ds-shadow-md: 0 4px 8px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.35);
  --ds-shadow-lg: 0 12px 20px -4px rgb(0 0 0 / 0.6), 0 4px 8px -4px rgb(0 0 0 / 0.4);
  --ds-shadow-xl: 0 24px 32px -8px rgb(0 0 0 / 0.7), 0 8px 16px -6px rgb(0 0 0 / 0.5);
}

/* ══════════════════════════════════════════════════════════════════════════════
   5. @THEME INLINE — Tailwind Utility Exposure
   ══════════════════════════════════════════════════════════════════════════════ */
@theme inline {
  /* Brand */
  --color-ds-brand-accent: var(--ds-brand-accent);
  --color-ds-brand-accent-hover: var(--ds-brand-accent-hover);
  --color-ds-brand-accent-subtle: var(--ds-brand-accent-subtle);
  --color-ds-brand-black: var(--ds-brand-black);
  --color-ds-brand-black-soft: var(--ds-brand-black-soft);
  --color-ds-brand-black-elevated: var(--ds-brand-black-elevated);

  /* Status */
  --color-ds-status-success: var(--ds-status-success);
  --color-ds-status-warning: var(--ds-status-warning);
  --color-ds-status-error: var(--ds-status-error);
  --color-ds-status-info: var(--ds-status-info);

  /* Surfaces */
  --color-ds-surface-base: var(--ds-surface-base);
  --color-ds-surface-elevated: var(--ds-surface-elevated);
  --color-ds-surface-sunken: var(--ds-surface-sunken);
  --color-ds-surface-overlay: var(--ds-surface-overlay);
  --color-ds-surface-sidebar: var(--ds-surface-sidebar);
  --color-ds-surface-header: var(--ds-surface-header);
  --color-ds-surface-glass: var(--ds-surface-glass);

  /* Text */
  --color-ds-text-primary: var(--ds-text-primary);
  --color-ds-text-secondary: var(--ds-text-secondary);
  --color-ds-text-subtle: var(--ds-text-subtle);
  --color-ds-text-inverse: var(--ds-text-inverse);
  --color-ds-text-link: var(--ds-text-link);

  /* Borders */
  --color-ds-border-base: var(--ds-border-base);
  --color-ds-border-strong: var(--ds-border-strong);
  --color-ds-border-subtle: var(--ds-border-subtle);
  --color-ds-border-glass: var(--ds-border-glass);

  /* Charts */
  --color-ds-chart-1: var(--ds-chart-1);
  --color-ds-chart-2: var(--ds-chart-2);
  --color-ds-chart-3: var(--ds-chart-3);
  --color-ds-chart-4: var(--ds-chart-4);
  --color-ds-chart-5: var(--ds-chart-5);
  --color-ds-chart-6: var(--ds-chart-6);

  /* Radii */
  --radius-ds-sm: var(--ds-radius-sm);
  --radius-ds-md: var(--ds-radius-md);
  --radius-ds-lg: var(--ds-radius-lg);
  --radius-ds-xl: var(--ds-radius-xl);
  --radius-ds-2xl: var(--ds-radius-2xl);
  --radius-ds-full: var(--ds-radius-full);

  /* Shadows */
  --shadow-ds-sm: var(--ds-shadow-sm);
  --shadow-ds-md: var(--ds-shadow-md);
  --shadow-ds-lg: var(--ds-shadow-lg);
  --shadow-ds-xl: var(--ds-shadow-xl);

  /* Typography */
  --font-ds-sans: var(--ds-font-sans);
  --font-ds-mono: var(--ds-font-mono);
}

/* ══════════════════════════════════════════════════════════════════════════════
   6. BASE STYLES
   ══════════════════════════════════════════════════════════════════════════════ */
body {
  background: var(--ds-surface-base);
  color: var(--ds-text-primary);
  font-family: var(--ds-font-sans);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
}

* {
  box-sizing: border-box;
}

html,
body {
  max-width: 100vw;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--ds-surface-sunken);
}
::-webkit-scrollbar-thumb {
  background: var(--ds-border-strong);
  border-radius: var(--ds-radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--ds-text-subtle);
}

/* ══════════════════════════════════════════════════════════════════════════════
   7. UTILITY CLASSES
   ══════════════════════════════════════════════════════════════════════════════ */
@layer utilities {
  .transition-base {
    transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-surface {
    background: var(--ds-surface-glass);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    border: 1px solid var(--ds-border-glass);
  }

  .ds-hover-glow:hover {
    box-shadow: var(--ds-glow-accent-soft);
    border-color: var(--ds-brand-accent);
    transition:
      box-shadow 200ms ease-in-out,
      border-color 200ms ease-in-out;
  }

  .ds-glow-active {
    box-shadow: var(--ds-glow-accent-strong);
    border-color: var(--ds-brand-accent);
  }
}

@keyframes ds-shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.ds-skeleton {
  background: linear-gradient(
    90deg,
    var(--ds-surface-sunken) 25%,
    rgba(16, 185, 129, 0.06) 50%,
    var(--ds-surface-sunken) 75%
  );
  background-size: 200% 100%;
  animation: ds-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--ds-radius-md);
}

/* ══════════════════════════════════════════════════════════════════════════════
   8. COMPONENT-SCOPE OVERRIDES
   ══════════════════════════════════════════════════════════════════════════════ */
/* Switch — only override colors; let Ant Design own dimensions and thumb positioning */
[class*="ant-switch"] {
  vertical-align: middle !important;
}
[class*="ant-switch"][class*="ant-switch-checked"] {
  background-color: var(--ds-brand-accent) !important;
}
[class*="ant-switch"][class*="ant-switch-checked"]:hover:not([disabled]) {
  background-color: var(--ds-brand-accent-hover) !important;
}

.ant-table {
  border-radius: var(--ds-radius-lg) !important;
  overflow: hidden;
}
.ant-table-thead > tr > th {
  background: var(--ds-surface-sunken) !important;
  border-bottom: 1px solid var(--ds-border-base) !important;
  font-weight: 600 !important;
  color: var(--ds-text-primary) !important;
}
.ant-table-tbody > tr:nth-child(even) > td {
  background: var(--ds-surface-base) !important;
}
.ant-table-tbody > tr:nth-child(odd) > td {
  background: var(--ds-surface-elevated) !important;
}
.ant-table-tbody > tr:hover > td {
  background: var(--ds-brand-accent-subtle) !important;
}
.ant-table-tbody > tr > td {
  border-bottom: 1px solid var(--ds-border-subtle) !important;
  color: var(--ds-text-primary) !important;
}
.ant-modal-content {
  border-radius: var(--ds-radius-2xl) !important;
  overflow: hidden;
}
.ant-modal-header {
  background: var(--ds-surface-glass) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  backdrop-filter: blur(12px) !important;
  border-bottom: 1px solid var(--ds-border-glass) !important;
}
.ant-input,
.ant-select-selector,
.ant-picker {
  border-radius: var(--ds-radius-lg) !important;
  border-color: var(--ds-border-base) !important;
  background: var(--ds-surface-sunken) !important;
}
.ant-input:focus,
.ant-input-focused,
.ant-select-focused .ant-select-selector {
  border-color: var(--ds-brand-accent) !important;
  box-shadow: var(--ds-glow-accent-soft) !important;
}

/* ══════════════════════════════════════════════════════════════════════════════
   9. ACCESSIBILITY & MOTION
   ══════════════════════════════════════════════════════════════════════════════ */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

*:focus-visible {
  outline: 2px solid var(--ds-brand-accent);
  outline-offset: 2px;
  border-radius: 2px;
}
*:focus:not(:focus-visible) {
  outline: none;
}

.text-muted {
  color: var(--ds-text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
````

## File: app/not-found.tsx
````typescript
import { Button } from "antd";
import Link from "next/link";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-ds-surface-base px-6 text-center">
      <div className="space-y-1">
        <p className="text-8xl font-bold text-ds-brand-accent">404</p>
        <h1 className="text-2xl font-semibold text-ds-text-primary">
          {CONTENT.errors.notFoundTitle}
        </h1>
        <p className="text-ds-text-secondary max-w-sm">{CONTENT.errors.notFoundDescription}</p>
      </div>
      <Link href={APP_ROUTES.dashboard}>
        <Button type="primary" size="large">
          {CONTENT.errors.notFoundCta}
        </Button>
      </Link>
    </div>
  );
}
````

## File: app/offline/page.tsx
````typescript
"use client";

/**
 * app/offline/page.tsx
 * Shown by the service worker when the user is offline and no cached page exists.
 */

import { WifiOutlined, ReloadOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import Button from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-ds-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ds-surface-elevated border border-ds-border-base mb-6">
          <WifiOutlined className="text-4xl text-ds-text-subtle" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-ds-text-primary tracking-tight mb-2">
          {(CONTENT.offline?.title as string) ?? "You're Offline"}
        </h1>
        <p className="text-sm text-ds-text-secondary mb-8 leading-relaxed">
          {(CONTENT.offline?.description as string) ??
            "It looks like you've lost your internet connection. Check your connection and try again."}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 items-center">
          <Button
            type="primary"
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            {(CONTENT.offline?.retryButton as string) ?? "Try Again"}
          </Button>
          <p className="text-xs text-ds-text-subtle">
            {(CONTENT.offline?.hint as string) ??
              "Previously viewed pages may still be accessible from cache."}
          </p>
        </div>

        {/* Brand mark */}
        <div className="mt-12">
          <div className="inline-flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-ds-brand-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-xs text-ds-text-subtle font-medium">
              Harvesters Reporting System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
````

## File: app/page.tsx
````typescript
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/utils/auth";
import { ROLE_DASHBOARD_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

/**
 * Root page — server component.
 * Reads the auth cookie and redirects to the appropriate dashboard.
 * Unauthenticated users are sent to /login.
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME ?? "hrs_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    redirect("/login");
  }

  const role = payload.role as UserRole;
  const dashboardRoute = ROLE_DASHBOARD_ROUTES[role] ?? "/login";
  redirect(dashboardRoute);
}
````

## File: app/robots.ts
````typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            disallow: "/", // internal system — disallow all crawlers
        },
    };
}
````

## File: app/viewport.ts
````typescript
import type { Viewport } from "next";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f8f9fb" },
        { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
    ],
};
````

## File: lib/data/db.ts
````typescript
/**
 * lib/data/db.ts
 * Unified database access layer.
 * Re-exports Prisma client as `db` and provides transaction helper.
 * This replaces mockDb as the canonical import for all API routes.
 *
 * Usage:
 *   import { db } from "@/lib/data/db";
 *   const reports = await db.report.findMany({ where: { campusId } });
 *
 * Transactions:
 *   await db.$transaction(async (tx) => {
 *     const report = await tx.report.create({ data: {...} });
 *     await tx.reportEvent.create({ data: {...} });
 *   });
 */

import { prisma } from "./prisma";
import { cache } from "./redis";

export const db = prisma;

/**
 * Invalidate cache patterns after a write operation.
 * Call this after any mutating DB operation.
 */
export async function invalidateCache(...patterns: string[]): Promise<void> {
    await Promise.all(patterns.map((p) => cache.invalidatePattern(p)));
}

export { cache } from "./redis";
export { prisma } from "./prisma";
export default db;
````

## File: lib/data/prisma.ts
````typescript
/**
 * lib/data/prisma.ts
 * Prisma client singleton for server-side use.
 *
 * Prisma 7 uses the "client" engine type by default, which requires
 * accelerateUrl (Prisma Postgres / Accelerate) to be passed explicitly.
 */

import { PrismaClient } from "@/prisma/generated";

const globalForPrisma = globalThis as typeof globalThis & {
    __prisma?: PrismaClient;
};

if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.__prisma;
export default prisma;
````

## File: lib/design-system/tokens.ts
````typescript
/**
 * Design System Tokens — TypeScript Constants
 *
 * Mirrors the CSS custom properties from app/globals.css so TypeScript code
 * (recharts fills, inline styles, etc.) can reference the same source of truth.
 *
 * Usage:
 *   import { DS, palette, chartColors } from "@/lib/design-system/tokens";
 *   <Bar fill={DS.chart[1]} />
 */

/* ── Palette (raw hex) ───────────────────────────────────────────── */
export const palette = {
    black: {
        base: "#0A0A0B",
        soft: "#111214",
        elevated: "#16171A",
    },
    emerald: {
        900: "#064e3b",
        700: "#047857",
        600: "#059669",
        500: "#10b981",
        400: "#34d399",
        200: "#a7f3d0",
        50: "#ecfdf5",
    },
    neutral: {
        950: "#0a0a0a",
        900: "#0f172a",
        800: "#1e293b",
        700: "#374151",
        600: "#4b5563",
        500: "#64748b",
        400: "#94a3b8",
        300: "#cbd5e1",
        200: "#e5e7eb",
        100: "#f1f5f9",
        50: "#f8f9fb",
        0: "#ffffff",
    },
} as const;

/* ── CSS Variable Reference Helper ──────────────────────────────── */
export const cssVar = (name: string) => `var(${name})`;

/* ── Semantic Token References (matching app/globals.css) ────────── */
export const DS = {
    brand: {
        accent: cssVar("--ds-brand-accent"),
        accentHover: cssVar("--ds-brand-accent-hover"),
        accentSubtle: cssVar("--ds-brand-accent-subtle"),
        black: cssVar("--ds-brand-black"),
        blackSoft: cssVar("--ds-brand-black-soft"),
        blackElevated: cssVar("--ds-brand-black-elevated"),
    },
    status: {
        success: cssVar("--ds-status-success"),
        successBg: cssVar("--ds-status-success-bg"),
        warning: cssVar("--ds-status-warning"),
        warningBg: cssVar("--ds-status-warning-bg"),
        error: cssVar("--ds-status-error"),
        errorBg: cssVar("--ds-status-error-bg"),
        info: cssVar("--ds-status-info"),
        infoBg: cssVar("--ds-status-info-bg"),
    },
    surface: {
        base: cssVar("--ds-surface-base"),
        elevated: cssVar("--ds-surface-elevated"),
        sunken: cssVar("--ds-surface-sunken"),
        overlay: cssVar("--ds-surface-overlay"),
        sidebar: cssVar("--ds-surface-sidebar"),
        header: cssVar("--ds-surface-header"),
        glass: cssVar("--ds-surface-glass"),
    },
    text: {
        primary: cssVar("--ds-text-primary"),
        secondary: cssVar("--ds-text-secondary"),
        subtle: cssVar("--ds-text-subtle"),
        inverse: cssVar("--ds-text-inverse"),
        link: cssVar("--ds-text-link"),
    },
    border: {
        base: cssVar("--ds-border-base"),
        strong: cssVar("--ds-border-strong"),
        subtle: cssVar("--ds-border-subtle"),
        glass: cssVar("--ds-border-glass"),
    },
    chart: {
        1: cssVar("--ds-chart-1"),
        2: cssVar("--ds-chart-2"),
        3: cssVar("--ds-chart-3"),
        4: cssVar("--ds-chart-4"),
        5: cssVar("--ds-chart-5"),
        6: cssVar("--ds-chart-6"),
    },
    radius: {
        sm: cssVar("--ds-radius-sm"),
        md: cssVar("--ds-radius-md"),
        lg: cssVar("--ds-radius-lg"),
        xl: cssVar("--ds-radius-xl"),
        "2xl": cssVar("--ds-radius-2xl"),
        full: cssVar("--ds-radius-full"),
    },
    shadow: {
        sm: cssVar("--ds-shadow-sm"),
        md: cssVar("--ds-shadow-md"),
        lg: cssVar("--ds-shadow-lg"),
        xl: cssVar("--ds-shadow-xl"),
    },
    font: {
        sans: cssVar("--ds-font-sans"),
        mono: cssVar("--ds-font-mono"),
    },
} as const;

/**
 * Static chart hex colors for recharts and similar libs that need hex directly.
 * Branch on isDark from your theme context.
 */
export const chartColors = {
    light: ["#2563eb", "#10b981", "#7c3aed", "#ea580c", "#0891b2", "#be185d"],
    dark: ["#60a5fa", "#34d399", "#a78bfa", "#fb923c", "#22d3ee", "#f472b6"],
} as const;

export default DS;
````

## File: lib/email/resend.ts
````typescript
/**
 * lib/email/resend.ts
 *
 * Resend email client — initialised from RESEND_API_KEY env var.
 * All outbound emails flow through the helpers below.
 *
 * Set these env vars before going live:
 *   RESEND_API_KEY   — Resend API key
 *   EMAIL_FROM       — Verified sender, e.g. "Harvesters <noreply@harvesters.org>"
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "Harvesters Reporting <noreply@harvesters.org>";

/* ── Low-level send ─────────────────────────────────────────────────────────── */

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("[email] RESEND_API_KEY not set — skipping email send:", subject);
        return null;
    }

    const { data, error } = await resend.emails.send({
        from: FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
    });

    if (error) {
        console.error("[email] Failed to send:", error);
        throw new Error(error.message);
    }

    return data;
}

/* ── Domain-specific email helpers ──────────────────────────────────────────── */

export async function sendInviteEmail(params: {
    to: string;
    inviterName: string;
    role: string;
    joinUrl: string;
}) {
    return sendEmail({
        to: params.to,
        subject: "You've been invited to Harvesters Reporting System",
        html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <div style="background:#10b981;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Harvesters Reporting System</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p>Hi,</p>
          <p><strong>${escapeHtml(params.inviterName)}</strong> has invited you to join the Harvesters Reporting System as <strong>${escapeHtml(params.role)}</strong>.</p>
          <a href="${escapeHtml(params.joinUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">
            Accept Invitation
          </a>
          <p style="font-size:13px;color:#6b7280">If the button doesn't work, copy and paste this link: ${escapeHtml(params.joinUrl)}</p>
        </div>
      </div>
    `,
    });
}

export async function sendPasswordResetEmail(params: {
    to: string;
    resetUrl: string;
}) {
    return sendEmail({
        to: params.to,
        subject: "Reset Your Password — Harvesters Reporting",
        html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <div style="background:#10b981;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Password Reset</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p>You requested a password reset for your Harvesters Reporting account.</p>
          <a href="${escapeHtml(params.resetUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">
            Reset Password
          </a>
          <p style="font-size:13px;color:#6b7280">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>
      </div>
    `,
    });
}

export async function sendReportStatusEmail(params: {
    to: string;
    reporterName: string;
    reportTitle: string;
    newStatus: string;
    reviewerName?: string;
    comment?: string;
    reportUrl: string;
}) {
    return sendEmail({
        to: params.to,
        subject: `Report ${params.newStatus}: ${params.reportTitle}`,
        html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <div style="background:#10b981;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Report Update</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p>Hi ${escapeHtml(params.reporterName)},</p>
          <p>Your report <strong>${escapeHtml(params.reportTitle)}</strong> has been marked as <strong>${escapeHtml(params.newStatus)}</strong>${params.reviewerName ? ` by ${escapeHtml(params.reviewerName)}` : ""}.</p>
          ${params.comment ? `<blockquote style="border-left:3px solid #10b981;margin:16px 0;padding:8px 16px;background:#f3f4f6;border-radius:0 8px 8px 0">${escapeHtml(params.comment)}</blockquote>` : ""}
          <a href="${escapeHtml(params.reportUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">
            View Report
          </a>
        </div>
      </div>
    `,
    });
}

export async function sendDeadlineReminderEmail(params: {
    to: string;
    userName: string;
    reportTitle: string;
    deadlineDate: string;
    reportUrl: string;
}) {
    return sendEmail({
        to: params.to,
        subject: `Deadline Approaching: ${params.reportTitle}`,
        html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <div style="background:#f59e0b;color:#fff;padding:16px 24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Deadline Reminder</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <p>Hi ${escapeHtml(params.userName)},</p>
          <p>The report <strong>${escapeHtml(params.reportTitle)}</strong> is due on <strong>${escapeHtml(params.deadlineDate)}</strong>.</p>
          <a href="${escapeHtml(params.reportUrl)}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin:16px 0">
            Submit Report
          </a>
        </div>
      </div>
    `,
    });
}

/* ── Utility ────────────────────────────────────────────────────────────────── */

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
````

## File: lib/hooks/useDraftCache.ts
````typescript
"use client";

/**
 * lib/hooks/useDraftCache.ts
 *
 * IndexedDB-backed draft caching for report and template forms.
 * Auto-saves form state every few seconds and restores on mount.
 *
 * Usage:
 *   const { cachedDraft, saveDraft, clearDraft } = useDraftCache<MyFormValues>("report-new");
 *   // On mount, cachedDraft has the restored data (or undefined)
 *   // Call saveDraft(values) to persist; clearDraft() after successful submit.
 */

import { useEffect, useRef, useState, useCallback } from "react";

const DB_NAME = "hrs-drafts";
const DB_VERSION = 1;
const STORE_NAME = "drafts";

/* ── IndexedDB helpers ──────────────────────────────────────────────────────── */

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function getItem<T>(key: string): Promise<T | undefined> {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => {
                const record = req.result as { data: T; updatedAt: number } | undefined;
                if (!record) {
                    resolve(undefined);
                    return;
                }
                // Expire drafts older than 7 days
                const sevenDays = 7 * 24 * 60 * 60 * 1000;
                if (Date.now() - record.updatedAt > sevenDays) {
                    resolve(undefined);
                    return;
                }
                resolve(record.data);
            };
            req.onerror = () => reject(req.error);
        });
    } catch {
        return undefined;
    }
}

async function setItem<T>(key: string, data: T): Promise<void> {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.put({ data, updatedAt: Date.now() }, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        // Silently fail — draft caching is best-effort
    }
}

async function removeItem(key: string): Promise<void> {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        // Silently fail
    }
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */

export function useDraftCache<T>(draftKey: string) {
    const [cachedDraft, setCachedDraft] = useState<T | undefined>(undefined);
    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load cached draft on mount
    useEffect(() => {
        getItem<T>(draftKey).then((data) => {
            if (data) setCachedDraft(data);
            setIsLoaded(true);
        });
    }, [draftKey]);

    // Debounced save (300ms)
    const saveDraft = useCallback(
        (data: T) => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                setItem(draftKey, data);
            }, 300);
        },
        [draftKey],
    );

    const clearDraft = useCallback(() => {
        setCachedDraft(undefined);
        removeItem(draftKey);
    }, [draftKey]);

    return { cachedDraft, isLoaded, saveDraft, clearDraft };
}
````

## File: lib/hooks/useRole.ts
````typescript
"use client";

import { useAuth } from "@/providers/AuthProvider";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";

/**
 * useRole
 * Returns the current user's role config and permission helpers.
 */
export function useRole() {
    const { user } = useAuth();
    const role = user?.role;
    const config = role ? ROLE_CONFIG[role] : null;

    return {
        role,
        config,
        /** Check if the current user's role is one of the provided roles */
        hasRole: (roles: UserRole | UserRole[]): boolean => {
            if (!role) return false;
            return Array.isArray(roles) ? roles.includes(role) : roles === role;
        },
        /** Capabilities shorthand */
        can: {
            createReports: config?.canCreateReports ?? false,
            fillReports: config?.canFillReports ?? false,
            submitReports: config?.canSubmitReports ?? false,
            requestEdits: config?.canRequestEdits ?? false,
            approveReports: config?.canApproveReports ?? false,
            markReviewed: config?.canMarkReviewed ?? false,
            lockReports: config?.canLockReports ?? false,
            manageTemplates: config?.canManageTemplates ?? false,
            dataEntry: config?.canDataEntry ?? false,
            manageUsers: config?.canManageUsers ?? false,
            manageOrg: config?.canManageOrg ?? false,
            setGoals: config?.canSetGoals ?? false,
            approveGoalUnlock: config?.canApproveGoalUnlock ?? false,
        },
    };
}
````

## File: lib/hooks/useServiceWorker.ts
````typescript
"use client";

import { useEffect, useRef } from "react";

/**
 * useServiceWorker — registers the service worker and handles updates.
 * Call once in the root layout / a top-level provider.
 */
export function useServiceWorker() {
    const registered = useRef(false);

    useEffect(() => {
        if (
            registered.current ||
            typeof window === "undefined" ||
            !("serviceWorker" in navigator)
        )
            return;

        registered.current = true;

        navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
                // Check for SW updates every 60 minutes
                const interval = setInterval(() => reg.update(), 60 * 60 * 1000);
                return () => clearInterval(interval);
            })
            .catch((err) => {
                console.error("SW registration failed:", err);
            });
    }, []);
}
````

## File: lib/utils/formatDate.ts
````typescript
/**
 * lib/utils/formatDate.ts
 * Central date-formatting utility.
 * All dates in the UI must be rendered through these helpers —
 * never inline `toLocaleDateString()` calls in components.
 *
 * Target format: DD MMM YYYY  e.g. "04 Mar 2026"
 */

/**
 * Format an ISO date string or Date object as "DD MMM YYYY".
 * Returns "—" if the value is falsy or invalid.
 */
export function fmtDate(value: string | Date | null | undefined): string {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }); // → "04 Mar 2026"
}

/**
 * Format as "DD MMM YYYY, HH:MM" — for datetime displays (audit log, events).
 */
export function fmtDateTime(value: string | Date | null | undefined): string {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "—";
    const date = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const time = d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return `${date}, ${time}`; // → "04 Mar 2026, 14:30"
}

/**
 * Time-ago string for notification/activity timestamps.
 * Falls back to fmtDateTime when > 7 days old.
 */
export function timeAgo(value: string | Date | null | undefined): string {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "—";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    const hrs = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return fmtDate(d);
}
````

## File: lib/utils/reportUtils.ts
````typescript
/**
 * lib/utils/reportUtils.ts
 * Utility functions for displaying Report records.
 *
 * Because `Report` stores period as structured fields (periodType / periodYear /
 * periodMonth / periodWeek) rather than a human-readable string, these helpers
 * convert those fields into display-ready labels throughout the UI.
 */

import { ReportPeriodType } from "@/types/global";

/** Short month names for period labelling */
const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Build a human-readable period label from a Report's period fields.
 * Examples: "Jan 2025", "Week 3, 2025", "2025"
 */
export function formatReportPeriod(report: {
    periodType: ReportPeriodType;
    periodYear: number;
    periodMonth?: number;
    periodWeek?: number;
}): string {
    switch (report.periodType) {
        case ReportPeriodType.MONTHLY:
            return report.periodMonth
                ? `${MONTH_SHORT[report.periodMonth - 1]} ${report.periodYear}`
                : `${report.periodYear}`;
        case ReportPeriodType.WEEKLY:
            return report.periodWeek
                ? `Week ${report.periodWeek}, ${report.periodYear}`
                : `${report.periodYear}`;
        case ReportPeriodType.YEARLY:
            return `${report.periodYear}`;
        default:
            return `${report.periodYear}`;
    }
}

/**
 * Build a display label for a report by combining template name + period.
 * Falls back to period alone when template name is not available.
 */
export function getReportLabel(
    report: {
        templateId: string;
        periodType: ReportPeriodType;
        periodYear: number;
        periodMonth?: number;
        periodWeek?: number;
    },
    templates: ReportTemplate[],
): string {
    const template = templates.find((t) => t.id === report.templateId);
    const period = formatReportPeriod(report);
    return template ? `${template.name} — ${period}` : period;
}
````

## File: modules/analytics/index.ts
````typescript
/**
 * modules/analytics/index.ts
 * Public barrel — export components and services only.
 */
export { AnalyticsPage } from "./components/AnalyticsPage";
````

## File: modules/auth/components/SettingsPage.tsx
````typescript
"use client";

/**
 * modules/auth/components/SettingsPage.tsx
 * App Preferences — appearance (theme) + notification toggles.
 * Distinct from ProfilePage which handles identity & password.
 */

import { useEffect, useState } from "react";
import { Switch, message, Select } from "antd";
import {
  BulbOutlined,
  BellOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useTheme } from "next-themes";
import { CONTENT } from "@/config/content";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import Button from "@/components/ui/Button";

/* ── Notification prefs stored in localStorage ──────────────────────────── */

const NOTIF_KEY = "hs-notif-prefs";

interface NotifPrefs {
  email: boolean;
  inApp: boolean;
  deadlineReminders: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  email: true,
  inApp: true,
  deadlineReminders: true,
};

function loadPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

/* ── Section component ───────────────────────────────────────────────────── */

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-ds-brand-accent text-base">{icon}</span>
        <h2 className="text-sm font-semibold text-ds-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ── Theme selector ──────────────────────────────────────────────────────── */

const THEME_OPTIONS = [
  { value: "system", label: (CONTENT.settings as Record<string, string>).themeSystem },
  { value: "light",  label: (CONTENT.settings as Record<string, string>).themeLight },
  { value: "dark",   label: (CONTENT.settings as Record<string, string>).themeDark },
] as const;

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="h-10 bg-ds-surface-sunken rounded-ds-lg animate-pulse" />
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ds-text-primary">
          {(CONTENT.settings as Record<string, string>).themeLabel}
        </p>
      </div>
      <Select
        value={theme ?? "system"}
        onChange={(v) => setTheme(v)}
        options={THEME_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        style={{ width: 140 }}
        size="middle"
      />
    </div>
  );
}

/* ── Notification toggle row ─────────────────────────────────────────────── */

interface NotifRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function NotifRow({ label, description, checked, onChange }: NotifRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-ds-border-subtle last:border-b-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-ds-text-primary">{label}</p>
        <p className="text-xs text-ds-text-subtle mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

/* ── Notification section ────────────────────────────────────────────────── */

const NOTIF_ROWS: Array<{
  key: keyof NotifPrefs;
  labelKey: string;
  descKey: string;
}> = [
  {
    key: "email",
    labelKey: "emailNotificationsLabel",
    descKey: "emailNotificationsDescription",
  },
  {
    key: "inApp",
    labelKey: "inAppNotificationsLabel",
    descKey: "inAppNotificationsDescription",
  },
  {
    key: "deadlineReminders",
    labelKey: "deadlineRemindersLabel",
    descKey: "deadlineRemindersDescription",
  },
];

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setLoaded(true);
  }, []);

  const handleChange = (key: keyof NotifPrefs, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
    }
  };

  const handleSave = () => {
    message.success((CONTENT.settings as Record<string, string>).saved);
  };

  if (!loaded) {
    return <div className="h-24 bg-ds-surface-sunken rounded-ds-lg animate-pulse" />;
  }

  return (
    <>
      {NOTIF_ROWS.map((row) => (
        <NotifRow
          key={row.key}
          label={(CONTENT.settings as Record<string, string>)[row.labelKey]}
          description={(CONTENT.settings as Record<string, string>)[row.descKey]}
          checked={prefs[row.key]}
          onChange={(val) => handleChange(row.key, val)}
        />
      ))}
      <div className="flex justify-end mt-4">
        <Button type="primary" icon={<CheckOutlined />} onClick={handleSave}>
          {(CONTENT.settings as Record<string, string>).saved}
        </Button>
      </div>
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function SettingsPage() {
  return (
    <PageLayout>
      <PageHeader title={(CONTENT.settings as Record<string, string>).pageTitle} />
      <div className="max-w-xl space-y-6">
        <SectionCard
          icon={<BulbOutlined />}
          title={(CONTENT.settings as Record<string, string>).appearanceSection}
        >
          <AppearanceSection />
        </SectionCard>

        <SectionCard
          icon={<BellOutlined />}
          title={(CONTENT.settings as Record<string, string>).notificationsSection}
        >
          <NotificationsSection />
        </SectionCard>
      </div>
    </PageLayout>
  );
}
````

## File: modules/auth/index.ts
````typescript
/**
 * modules/auth/index.ts
 * Public barrel — export components and services only.
 */
export { SettingsPage } from "./components/SettingsPage";
````

## File: modules/bug-reports/components/BugReportManagePage.tsx
````typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, Tag, message, Modal, Input as AntInput } from "antd";
import { BugOutlined } from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { BugReportStatus } from "@/types/global";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import Table from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const STATUS_COLOR_MAP: Record<BugReportStatus, string> = {
  [BugReportStatus.OPEN]: "red",
  [BugReportStatus.IN_PROGRESS]: "orange",
  [BugReportStatus.RESOLVED]: "green",
  [BugReportStatus.CLOSED]: "default",
};

const STATUS_OPTIONS = Object.values(BugReportStatus).map((s) => ({
  value: s,
  label: (CONTENT.bugReports.statuses as Record<string, string>)[s],
}));

export function BugReportManagePage() {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailReport, setDetailReport] = useState<BugReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBugReports = useCallback(async () => {
    try {
      const res = await fetch(API_ROUTES.bugReports.list);
      const json = await res.json();
      if (json.success) setBugReports(json.data);
    } catch {
      /* no-op */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBugReports();
  }, [fetchBugReports]);

  const handleStatusChange = async (id: string, status: BugReportStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(API_ROUTES.bugReports.detail(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.bugReports.updateSuccess as string);
      fetchBugReports();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!detailReport) return;
    setUpdatingId(detailReport.id);
    try {
      const res = await fetch(API_ROUTES.bugReports.detail(detailReport.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.bugReports.updateSuccess as string);
      setDetailReport(null);
      fetchBugReports();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: CONTENT.bugReports.categoryLabel as string,
      dataIndex: "category",
      key: "category",
      render: (cat: string) =>
        (CONTENT.bugReports.categories as Record<string, string>)[cat] ?? cat,
    },
    {
      title: CONTENT.bugReports.descriptionLabel as string,
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 300,
    },
    {
      title: CONTENT.bugReports.emailLabel as string,
      dataIndex: "contactEmail",
      key: "contactEmail",
    },
    {
      title: CONTENT.bugReports.statusLabel as string,
      dataIndex: "status",
      key: "status",
      render: (status: BugReportStatus, record: BugReport) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record.id, val)}
          options={STATUS_OPTIONS}
          size="small"
          loading={updatingId === record.id}
          style={{ width: 140 }}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record: BugReport) => (
        <Tag
          className="cursor-pointer"
          color="blue"
          onClick={() => {
            setDetailReport(record);
            setAdminNotes(record.adminNotes ?? "");
          }}
        >
          {CONTENT.common.view}
        </Tag>
      ),
    },
  ];

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <PageLayout>
      <PageHeader title={CONTENT.bugReports.managePageTitle as string} icon={<BugOutlined />} />

      {bugReports.length === 0 ? (
        <EmptyState
          title={(CONTENT.bugReports.emptyState as Record<string, string>).title}
          description={(CONTENT.bugReports.emptyState as Record<string, string>).description}
        />
      ) : (
        <Table dataSource={bugReports} columns={columns} rowKey="id" />
      )}

      <Modal
        open={!!detailReport}
        onCancel={() => setDetailReport(null)}
        title={CONTENT.bugReports.categoryLabel as string}
        onOk={handleSaveNotes}
        okText={CONTENT.common.save}
        confirmLoading={!!updatingId}
      >
        {detailReport && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                {CONTENT.bugReports.categoryLabel as string}
              </p>
              <Tag color={STATUS_COLOR_MAP[detailReport.status]}>
                {(CONTENT.bugReports.categories as Record<string, string>)[detailReport.category]}
              </Tag>
            </div>
            <div>
              <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                {CONTENT.bugReports.descriptionLabel as string}
              </p>
              <p className="text-sm text-ds-text-primary whitespace-pre-wrap">
                {detailReport.description}
              </p>
            </div>
            {detailReport.screenshotUrl && (
              <div>
                <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                  {CONTENT.bugReports.screenshotLabel as string}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detailReport.screenshotUrl}
                  alt="Bug screenshot"
                  className="rounded-ds-lg border border-ds-border-base max-w-full"
                />
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                {CONTENT.bugReports.emailLabel as string}
              </p>
              <p className="text-sm text-ds-text-primary">{detailReport.contactEmail}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-ds-text-subtle uppercase mb-1">
                {CONTENT.bugReports.adminNotesLabel as string}
              </p>
              <AntInput.TextArea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={CONTENT.bugReports.adminNotesPlaceholder as string}
                rows={3}
              />
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
````

## File: modules/bug-reports/components/BugReportPage.tsx
````typescript
"use client";

import { useState } from "react";
import { Form, Select, message, Upload } from "antd";
import { BugOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { BugReportCategory } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";

const CATEGORY_OPTIONS = Object.values(BugReportCategory).map((cat) => ({
  value: cat,
  label: (CONTENT.bugReports.categories as Record<string, string>)[cat],
}));

export function BugReportPage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const handleSubmit = async (values: {
    category: BugReportCategory;
    description: string;
    contactEmail: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await fetch(API_ROUTES.bugReports.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          screenshotUrl: screenshotUrl ?? undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.bugReports.submitSuccess as string);
      form.resetFields();
      setScreenshotUrl(null);
      // Reset email to user's email
      form.setFieldValue("contactEmail", user?.email ?? "");
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = (file: File) => {
    // Convert to base64 data URL for storage
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false; // prevent auto upload
  };

  return (
    <PageLayout>
      <PageHeader title={CONTENT.bugReports.pageTitle as string} icon={<BugOutlined />} />
      <div className="max-w-lg">
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ contactEmail: user?.email ?? "" }}
          >
            <Form.Item
              name="category"
              label={CONTENT.bugReports.categoryLabel as string}
              rules={[{ required: true, message: "Please select an issue type." }]}
            >
              <Select
                placeholder={CONTENT.bugReports.categoryPlaceholder as string}
                options={CATEGORY_OPTIONS}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={CONTENT.bugReports.descriptionLabel as string}
              rules={[
                { required: true, message: "Please describe the issue." },
                { min: 10, message: "Description must be at least 10 characters." },
              ]}
            >
              <Input.TextArea
                placeholder={CONTENT.bugReports.descriptionPlaceholder as string}
                rows={5}
                maxLength={2000}
                showCount
              />
            </Form.Item>

            <Form.Item label={CONTENT.bugReports.screenshotLabel as string}>
              <Upload
                beforeUpload={handleUpload}
                accept="image/*"
                maxCount={1}
                listType="picture"
                onRemove={() => setScreenshotUrl(null)}
              >
                <Button icon={<UploadOutlined />}>
                  {CONTENT.bugReports.screenshotHint as string}
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="contactEmail"
              label={CONTENT.bugReports.emailLabel as string}
              rules={[
                { required: true, message: "Please provide your email." },
                { type: "email", message: "Please enter a valid email." },
              ]}
            >
              <Input placeholder={CONTENT.bugReports.emailPlaceholder as string} />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              icon={<BugOutlined />}
            >
              {submitting
                ? (CONTENT.bugReports.submitting as string)
                : (CONTENT.bugReports.submitButton as string)}
            </Button>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
````

## File: modules/bug-reports/index.ts
````typescript
export { BugReportPage } from "./components/BugReportPage";
export { BugReportManagePage } from "./components/BugReportManagePage";
````

## File: modules/dashboard/index.ts
````typescript
/**
 * modules/dashboard/index.ts
 * Barrel — export only services and components, never re-export types.
 */

export { DashboardPage } from "./components/DashboardPage";
````

## File: modules/goals/index.ts
````typescript
/**
 * modules/goals/index.ts
 * Barrel export for the goals module.
 */

export { GoalsPage } from "./components/GoalsPage";
````

## File: modules/notifications/index.ts
````typescript
/**
 * modules/notifications/index.ts
 * Barrel export for the notifications module.
 */

export { InboxPage } from "./components/InboxPage";
````

## File: modules/org/index.ts
````typescript
/**
 * modules/org/index.ts
 * Barrel export for the org module.
 */

export { OrgPage } from "./components/OrgPage";
````

## File: modules/reports/components/ExportDialog.tsx
````typescript
"use client";

/**
 * modules/reports/components/ExportDialog.tsx
 *
 * Modal dialog for exporting reports with options:
 *  - Scope: all filtered | selected only
 *  - Grouping: none | campus | month | quarter
 *  - Content: metrics | goals | comments
 *  - Format: single sheet | one sheet per campus
 */

import { useState } from "react";
import { Modal, Checkbox, Radio, Select, Divider } from "antd";
import { CONTENT } from "@/config/content";
import {
    exportReportsWithOptions,
    type ExportGrouping,
    type ExportFormat,
} from "@/lib/utils/exportReports";

const ec = (CONTENT.reports as Record<string, unknown>).export as Record<string, string>;

/* ── Types ─────────────────────────────────────────────────────────────── */

interface ExportDialogProps {
    open: boolean;
    onClose: () => void;
    /** All currently-filtered reports (the "all" scope) */
    reports: Report[];
    /** Subset selected by the user in the table (may be length 0) */
    selectedReports?: Report[];
    templates: ReportTemplate[];
    campuses: Campus[];
    sections?: ReportSection[];
    metrics?: ReportMetric[];
}

/* ── Grouping options ───────────────────────────────────────────────────── */

const GROUPING_OPTIONS: { value: ExportGrouping; label: string }[] = [
    { value: "none", label: ec.groupingNone },
    { value: "campus", label: ec.groupingCampus },
    { value: "month", label: ec.groupingMonth },
    { value: "quarter", label: ec.groupingQuarter },
];

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
    { value: "single", label: ec.formatSingleSheet },
    { value: "per-campus", label: ec.formatMultiSheet },
];

/* ── ExportDialog ───────────────────────────────────────────────────────── */

export function ExportDialog({
    open,
    onClose,
    reports,
    selectedReports = [],
    templates,
    campuses,
    sections = [],
    metrics = [],
}: ExportDialogProps) {
    const [scope, setScope] = useState<"all" | "selected">(
        selectedReports.length > 0 ? "selected" : "all",
    );
    const [grouping, setGrouping] = useState<ExportGrouping>("none");
    const [includeMetrics, setIncludeMetrics] = useState(true);
    const [includeGoals, setIncludeGoals] = useState(true);
    const [includeComments, setIncludeComments] = useState(false);
    const [format, setFormat] = useState<ExportFormat>("single");
    const [loading, setLoading] = useState(false);

    const hasSelected = selectedReports.length > 0;
    const targetReports = scope === "selected" && hasSelected ? selectedReports : reports;

    function handleExport() {
        setLoading(true);
        try {
            exportReportsWithOptions({
                reports: targetReports,
                templates,
                campuses,
                grouping,
                includeMetrics,
                includeGoals,
                includeComments,
                format,
                sections,
                metrics,
            });
        } finally {
            setLoading(false);
            onClose();
        }
    }

    return (
        <Modal
            open={open}
            title={ec.dialogTitle}
            onCancel={onClose}
            onOk={handleExport}
            okText={ec.exportButtonLabel}
            cancelText={ec.cancelButtonLabel}
            confirmLoading={loading}
            width={480}
            destroyOnClose
        >
            <div className="space-y-5 py-2">
                {/* Scope */}
                <div>
                    <p className="text-sm font-medium text-ds-text-secondary mb-2">{ec.scopeLabel}</p>
                    <Radio.Group
                        value={scope}
                        onChange={(e) => setScope(e.target.value as typeof scope)}
                        className="flex flex-col gap-1"
                    >
                        <Radio value="all">
                            {ec.scopeAll}{" "}
                            <span className="text-xs text-ds-text-subtle">({reports.length})</span>
                        </Radio>
                        <Radio value="selected" disabled={!hasSelected}>
                            {ec.scopeSelected}{" "}
                            <span className="text-xs text-ds-text-subtle">({selectedReports.length})</span>
                        </Radio>
                    </Radio.Group>
                </div>

                <Divider className="!my-0" />

                {/* Grouping */}
                <div>
                    <p className="text-sm font-medium text-ds-text-secondary mb-2">{ec.groupingLabel}</p>
                    <Select
                        value={grouping}
                        options={GROUPING_OPTIONS}
                        onChange={(v) => setGrouping(v as ExportGrouping)}
                        style={{ width: "100%" }}
                        size="middle"
                    />
                </div>

                {/* Format */}
                <div>
                    <p className="text-sm font-medium text-ds-text-secondary mb-2">{ec.formatLabel}</p>
                    <Radio.Group
                        value={format}
                        onChange={(e) => setFormat(e.target.value as typeof format)}
                        className="flex flex-col gap-1"
                    >
                        {FORMAT_OPTIONS.map((opt) => (
                            <Radio key={opt.value} value={opt.value}>
                                {opt.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                </div>

                <Divider className="!my-0" />

                {/* Content */}
                <div>
                    <p className="text-sm font-medium text-ds-text-secondary mb-2">{ec.contentLabel}</p>
                    <div className="flex flex-col gap-2">
                        <Checkbox
                            checked={includeMetrics}
                            onChange={(e) => setIncludeMetrics(e.target.checked)}
                        >
                            {ec.contentMetrics}
                        </Checkbox>
                        <Checkbox
                            checked={includeGoals}
                            onChange={(e) => setIncludeGoals(e.target.checked)}
                        >
                            {ec.contentGoals}
                        </Checkbox>
                        <Checkbox
                            checked={includeComments}
                            onChange={(e) => setIncludeComments(e.target.checked)}
                        >
                            {ec.contentComments}
                        </Checkbox>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
````

## File: modules/templates/index.ts
````typescript
/**
 * modules/templates/index.ts
 * Barrel export for the templates module.
 */

export { TemplatesListPage } from "./components/TemplatesListPage";
export { TemplateNewPage } from "./components/TemplateNewPage";
export { TemplateDetailPage } from "./components/TemplateDetailPage";
````

## File: modules/users/index.ts
````typescript
/**
 * modules/users/index.ts
 * Barrel export for the users module.
 */

export { UsersListPage }  from "./components/UsersListPage";
export { UserDetailPage } from "./components/UserDetailPage";
export { ProfilePage }    from "./components/ProfilePage";
export { InvitesPage }    from "./components/InvitesPage";
````

## File: providers/ThemeProvider.tsx
````typescript
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
````

## File: types/global.d.ts
````typescript
/**
 * types/global.d.ts
 *
 * All domain enums, constants, and global interface declarations have been
 * consolidated into types/global.ts (a real TypeScript module that bundlers
 * can process). This file is intentionally empty.
 *
 * Import enums:      import { UserRole } from "@/types/global"
 * Global interfaces: AuthUser, Report, etc. are available without any import
 *                    in files that import @/types/global transitively.
 */
````

## File: .github/abstract/reporting-logic-considerations.md
````markdown
---

# CENTRAL REPORTING SYSTEM

# Reporting Logic & Goal Governance Specification

---

## 1. FIELD STRUCTURE ENHANCEMENT

### 1.1 Field-Level Commentary

Every reportable metric must support:

| Field       | Description              |
| ----------- | ------------------------ |
| Value Input | Numeric / Computed       |
| Comment     | Optional contextual note |

This applies to:

* Weekly Entries
* Monthly Entries
* Goals
* Achieved Values

Separate from:

* General Report Notes (existing)

---

### 1.2 New Data Structure

Each metric now has:

```
Metric Value
Metric Comment (optional)
Goal Value
Goal Comment (optional)
```

Use Case Examples:

| Scenario                | Comment                              |
| ----------------------- | ------------------------------------ |
| Sudden attendance spike | “Joint service with visiting campus” |
| Drop in salvation       | “Heavy rainfall weekend”             |
| High partnership        | “Special giving drive”               |

---

## 2. GOAL MANAGEMENT SYSTEM

Goals are **group-governed**.

---

### 2.1 Monthly Goal Ownership

Owned by:

> Group Admin

Scope:

* Entire Group (default)
* Specific Campuses (override)

---

### 2.2 Goal Creation Modes

Group Admin can set:

| Mode            | Description                    |
| --------------- | ------------------------------ |
| Annual Mode     | Set all 12 months at once      |
| Monthly Mode    | Set individual months          |
| Campus Override | Set different goals per campus |

---

### 2.3 Field-Specific Goals

Goals are set per:

* Strategic Indicator
* Key Metric

Example:

| Indicator  | Metric        | Goal |
| ---------- | ------------- | ---- |
| Attendance | Sunday Male   | 500  |
| Attendance | Sunday Female | 620  |

---

## 3. CUMULATIVE VS NON-CUMULATIVE METRICS

Derived from spreadsheet “MATRICS” column.

### 3.1 Cumulative Metrics

Examples:

* Church Planting
* Salvation
* Partnerships

Monthly value = Sum of weekly values

---

### 3.2 Averaged Metrics

Examples:

* Attendance

Monthly value = Average of weekly values

---

### 3.3 Snapshot Metrics

Examples:

* Number of Workers
* Cells

Monthly value = Last reported value

---

### 3.4 System Requirement

Each metric must be tagged:

```
calculationType:
- SUM
- AVERAGE
- SNAPSHOT
```

---

## 4. YEAR-ON-YEAR (YoY) LOGIC

YoY is NOT manual entry by default.

Primary Source:

> Same period last year

---

### 4.1 YoY Retrieval Hierarchy

System resolves YoY in this order:

| Priority | Source                    |
| -------- | ------------------------- |
| 1        | Previous Year Same Period |
| 2        | Group Admin Manual Entry  |
| 3        | Calculated Estimate       |
| 4        | Safe Zero                 |

---

### 4.2 Calculated Estimate Logic

Fallback estimate options:

* Previous month growth trend
* Rolling average
* Cumulative growth pattern

System must choose the most logical based on data availability.

---

## 5. GOAL EDIT GOVERNANCE

Once submitted:

Monthly Goal
Year-on-Year Goal

→ Become **Locked**

---

### 5.1 Unlock Request Flow

Group Admin must:

* Submit edit request
* Provide reason

Approval required from:

* Super Admin
* SPO
* CEO
* Church Ministry

---

### 5.2 Executive Privileges

Executive stakeholders can:

* Edit directly
* Approve edit requests
* Reject with note

---

## 6. GOAL HIERARCHY

Default:

```
Group Goal → Applies to all campuses
```

Override:

```
Campus Goal → Overrides group goal
```

---

## 7. ANALYTICS REQUIREMENTS

### 7.1 Date Configurability

Analytics must support:

* Weekly
* Monthly
* Quarterly
* Annual
* Custom range

---

### 7.2 Goal-Based Visualizations

Must include:

| Visualization     | Example     |
| ----------------- | ----------- |
| Goal vs Achieved  | Attendance  |
| YoY Growth        | Salvation   |
| Campus Comparison | Partnership |
| Cumulative Trend  | Cells       |

---

### 7.3 Metric-Type-Aware Charts

Charts must adapt based on:

| Type     | Chart         |
| -------- | ------------- |
| SUM      | Trend         |
| AVERAGE  | Rolling Line  |
| SNAPSHOT | Point-in-Time |

---

## 8. PERMISSION MODEL

| Action           | Group Admin | Exec Stakeholders |
| ---------------- | ----------- | ----------------- |
| Set Goals        | ✓           | ✓                 |
| Set All Months   | ✓           | ✓                 |
| Override Campus  | ✓           | ✓                 |
| Edit Locked Goal | ✗           | ✓                 |
| Request Edit     | ✓           | -                 |
| Approve Request  | -           | ✓                 |

---

## 9. DATA MODEL ADDITIONS (IMPORTANT FOR COPILOT)

### MetricDefinition

```
- id
- name
- calculationType
- reportingFrequency
```

---

### Goal

```
- id
- metricId
- groupId
- campusId (nullable)
- month
- year
- value
- yoyValue
- locked
```

---

### GoalEditRequest

```
- id
- goalId
- requestedBy
- reason
- status
```

---

### MetricEntry

```
- id
- metricId
- value
- comment
- week
- month
- campusId
```

---

## 10. SYSTEM BEHAVIOR SUMMARY

| Feature      | Behavior               |
| ------------ | ---------------------- |
| Comments     | Field-level supported  |
| Goals        | Group-driven           |
| YoY          | Auto-retrieved         |
| Missing Data | Logical fallback       |
| Locked Goals | Exec approval required |
| Analytics    | Goal-aware             |
| Metrics      | Typed                  |

---

This gives your Copilot:

* Data logic
* Governance rules
* Calculation logic
* Permissions

---
						
		REPORTING TEMPLATE									
		2026									
											
	MONTH										
	STRATEGIC INDICATOR	KEY MATRICS		GOAL	ACHIEVED	"% 
DIFFERENCE"	"YEAR ON 
YEAR"	"REPORTING 
FREQUENCY"	MATRICS	"OWNER OF REPORT IN 
CAMPUSES"	
	CHURCH PLANTING	"No of Churches to be 
planted"						"Monthly and 
Quarterly"	"Monthly Report:
Summation i.e. the total number after adding each of the month achieved figures"		
		No of Plant Cells and Small Group									
		No of Church Plant Cells 									
	ATTENDANCE	Sunday Attendance 	"Male 
"					Weekly, Monthly, Quarterly, Bi-annual, and Annual	"
Monthly Report: Average of the 4 Weeks or 5 Weeks depending on the month i.e. (W1+W2+W3+W4)/4"		
			Female								
			Children								
		First Timers									
		Worker Attendance									
		Growth Track Attendance									
		Growth Track Unique Attendance									
		Midweek Attendance									
		Workers Attendance: Midweek									
		Small Group Attendance									
		Montly Cell Leaders Attendance (Meeting)									
	NLP	No of NLP Cells						"Weekly and 
Monthly"	"Monthly Report:
Summation i.e. the total number after adding each of the week achieved figures"		
		NLP Leads									
		Mobilizers									
	SALVATION	Soul Saved in Service 						"Weekly and 
Monthly"	"Monthly Report:
Summation i.e. the total number after adding each of the week achieved figures"		
		Soul Saved in Cell									
		Soul Saved in Next Gen									
		No of People Baptized									
	SMALL GROUP	No of Small Group 						"Weekly and
Monthly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month"		
		No of Small Group Leaders									
		No of Assistant Cell Leaders									
		No of Cells that held									
	HAEF	Project Reach						"Monthly and 
Quarterly"			
		Project Impact									
	"DISCIPLESHIP
"	"Foundation Course 
Attendance "						"Quarterly and
Bi-Yearly"	"Monthly Report:
Summation i.e. the total number after adding each of the cohort achieved figures"		
		"Foundation Course 
Graduant"									
		ALC Attendance									
		BLC Attendance									
		PLC Attendance									
		CPC Attendance									
	PARTNERSHIP	No. of Partners						"Monthly and 
Quarterly"	"Monthly Report:
Summation i.e. the total number after adding each of the month achieved figures"		
	PROJECT	No. of Ongoing Project						"Monthly and 
Quarterly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month"		
		Project phase and closure									
	TRANSFORMATION	No of Testimonies						"Monthly and 
Quarterly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month or quartely"		
		No of Birth									
		No of Babies dedicated									
		No of Wedding									
	ASSIMILATION	No Assimilated into Small Groups 						"Monthly and 
Quarterly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month and quarter"		
		No Assimilated into Work Force									
		No of Workers									
		No of Leaders									
	NEXT GEN	Next Gen Attendance	"Kidzone
Stir House"					Weekly and Monthly 	Monthly Report: Average of the 4 Week i.e. (W1+W2+W3+W4)/4		
		First Timers	"Kidzone
Stir House"								
		Workers Attendance	"Kidzone
Stir House"								
		No of Baptized (Water)	"Kidzone
Stir House"					"Monthly and 
Quarterly"	"Monthly Report:
Cummulation i.e. the last reported data as at the end of the month and quarter"		
		No of Baptized (Holy Ghost)	"Kidzone
Stir House"								
		Next Gen Return Rate	"Kidzone
Stir House"								
		No of PD/PF Participant	"Kidzone
Stir House"								
		No of Teen Leaders	Stir House								
		No that Served 	"Kidzone
Stir House"								
		Parental Engaging Rate	"Kidzone
Stir House"
````

## File: app/(auth)/join/layout.tsx
````typescript
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONTENT } from "@/config/content";

/**
 * Invite join page layout.
 * Extends root metadata with invite-specific Open Graph / Twitter card tags
 * so that shared invite links render rich previews in social apps and messaging.
 */
export const metadata: Metadata = {
  title: {
    absolute: `${CONTENT.seo.joinTitle} — Harvesters Reporting System`,
  },
  description: CONTENT.seo.joinDescription,
  openGraph: {
    title: `${CONTENT.seo.joinTitle} — Harvesters Reporting System`,
    description: CONTENT.seo.joinDescription,
    type: "website",
    images: [
      {
        url: "/logo/white-bg-harvesters-Logo.svg",
        width: 512,
        height: 512,
        alt: "Harvesters International Christian Centre",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${CONTENT.seo.joinTitle} — Harvesters Reporting System`,
    description: CONTENT.seo.joinDescription,
    images: ["/logo/white-bg-harvesters-Logo.svg"],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
````

## File: app/(auth)/register/page.tsx
````typescript
"use client";

/**
 * app/(auth)/register/page.tsx
 * Public registration page (creates MEMBER account).
 * Invite token from URL params pre-fills and role-gates the form.
 */

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Form, Alert } from "antd";
import Link from "next/link";
import Image from "next/image";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  phone?: string;
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? undefined;

  const [form] = Form.useForm<RegisterFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    if (values.password !== values.confirm) {
      setError(CONTENT.auth.errors.passwordsDoNotMatch);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTES.auth.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          inviteToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? CONTENT.auth.errors.serverError);
        return;
      }
      setDone(true);
      /* Redirect to dashboard after brief pause */
      setTimeout(() => window.location.replace("/"), 1200);
    } catch {
      setError(CONTENT.auth.errors.serverError);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl shadow-ds-xl p-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-ds-xl bg-ds-state-success/10 mb-1">
          <span className="text-ds-state-success text-2xl">✓</span>
        </div>
        <h1 className="text-xl font-bold text-ds-text-primary">Account created!</h1>
        <p className="text-sm text-ds-text-secondary">Redirecting you now…</p>
      </div>
    );
  }

  return (
    <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl shadow-ds-xl p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <Image
          src="/logo/dark-bg-harvesters-Logo.jpg"
          alt="Harvesters"
          width={48}
          height={48}
          className="rounded-ds-xl mb-2"
          priority
        />
        <h1 className="text-2xl font-bold text-ds-text-primary">{CONTENT.auth.registerTitle}</h1>
        <p className="text-sm text-ds-text-secondary">{CONTENT.auth.registerSubtitle}</p>
        {inviteToken && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-ds-state-success/10 text-ds-state-success text-xs rounded-ds-md font-medium">
            Invite link detected
          </span>
        )}
      </div>

      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="firstName"
            label={CONTENT.auth.firstNameLabel}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder={CONTENT.auth.firstNamePlaceholder} size="large" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={CONTENT.auth.lastNameLabel}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder={CONTENT.auth.lastNamePlaceholder} size="large" />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label={CONTENT.auth.emailLabel}
          rules={[
            { required: true, message: CONTENT.auth.errors.emailRequired },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input placeholder={CONTENT.auth.emailPlaceholder} size="large" autoComplete="email" />
        </Form.Item>

        <Form.Item name="phone" label={CONTENT.auth.phoneLabel}>
          <Input placeholder={CONTENT.auth.phonePlaceholder} size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          label={CONTENT.auth.passwordLabel}
          rules={[
            { required: true, message: CONTENT.auth.errors.passwordRequired },
            { min: 8, message: CONTENT.auth.errors.passwordTooShort },
          ]}
        >
          <Input.Password
            placeholder={CONTENT.auth.passwordPlaceholder}
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label={CONTENT.auth.confirmPasswordLabel}
          rules={[{ required: true, message: "Please confirm your password." }]}
        >
          <Input.Password
            placeholder={CONTENT.auth.passwordPlaceholder}
            size="large"
            autoComplete="new-password"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={loading}
          className="mt-1"
        >
          {loading ? "Creating account…" : CONTENT.auth.registerButton}
        </Button>
      </Form>

      <p className="text-center text-sm text-ds-text-secondary">
        {CONTENT.auth.alreadyHaveAccount}{" "}
        <Link href={APP_ROUTES.login} className="text-ds-text-link hover:underline font-medium">
          {CONTENT.auth.loginLink}
        </Link>
      </p>
    </div>
  );
}
````

## File: app/(dashboard)/bug-reports/manage/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BugReportManagePage } from "@/modules/bug-reports";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

export const metadata: Metadata = {
  title: CONTENT.bugReports.managePageTitle as string,
  description: CONTENT.seo.bugReportsManageDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, [UserRole.SUPERADMIN]);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <BugReportManagePage />;
}
````

## File: app/(dashboard)/dashboard/page.tsx
````typescript
import type { Metadata } from "next";
import { DashboardPage } from "@/modules/dashboard";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.dashboard.pageTitle as string,
  description: CONTENT.seo.dashboardDescription,
};

export default function Page() {
  return <DashboardPage />;
}
````

## File: app/(dashboard)/org/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { OrgPage } from "@/modules/org";
import { APP_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.org.pageTitle as string,
  description: CONTENT.seo.orgDescription,
};

export default async function Page() {
  const auth = await verifyAuth();
  if (!auth.success || auth.user.role !== "SUPERADMIN") {
    redirect(APP_ROUTES.dashboard);
  }
  return <OrgPage />;
}
````

## File: app/(dashboard)/profile/page.tsx
````typescript
import type { Metadata } from "next";
import { ProfilePage } from "@/modules/users";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.profile.pageTitle as string,
  description: CONTENT.seo.profileDescription,
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  return <ProfilePage defaultTab={tab} />;
}
````

## File: app/(dashboard)/reports/[id]/edit/page.tsx
````typescript
import type { Metadata } from "next";
import { ReportEditPage } from "@/modules/reports";
import { CONTENT } from "@/config/content";
import { db } from "@/lib/data/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await db.report.findUnique({ where: { id }, select: { title: true } });
  return {
    title: report ? `Edit — ${report.title}` : (CONTENT.reports.editReport as string),
    description: CONTENT.seo.reportEditDescription,
  };
}

export default function Page({ params }: PageProps) {
  return <ReportEditPage params={params} />;
}
````

## File: app/(dashboard)/reports/[id]/page.tsx
````typescript
import type { Metadata } from "next";
import { ReportDetailPage } from "@/modules/reports";
import { CONTENT } from "@/config/content";
import { db } from "@/lib/data/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await db.report.findUnique({ where: { id }, select: { title: true } });
  return {
    title: report?.title ?? (CONTENT.reports.pageTitle as string),
    description: CONTENT.seo.reportDetailDescription,
  };
}

export default function Page({ params }: PageProps) {
  return <ReportDetailPage params={params} />;
}
````

## File: app/(dashboard)/reports/new/page.tsx
````typescript
import type { Metadata } from "next";
import { ReportNewPage } from "@/modules/reports";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.reports.newReport as string,
  description: CONTENT.seo.newReportDescription,
};

export default function Page() {
  return <ReportNewPage />;
}
````

## File: app/(dashboard)/users/[id]/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { UserDetailPage } from "@/modules/users";
import { APP_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { db } from "@/lib/data/db";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true },
  });
  return {
    title: user ? `${user.firstName} ${user.lastName}` : (CONTENT.users.pageTitle as string),
    description: CONTENT.seo.userDetailDescription,
  };
}

export default async function Page({ params }: PageProps) {
  const auth = await verifyAuth();
  if (!auth.success || auth.user.role !== "SUPERADMIN") {
    redirect(APP_ROUTES.dashboard);
  }
  return <UserDetailPage params={params} />;
}
````

## File: app/(dashboard)/users/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { UsersListPage } from "@/modules/users";
import { APP_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";

export const metadata: Metadata = {
  title: CONTENT.users.pageTitle as string,
  description: CONTENT.seo.usersDescription,
};

export default async function Page() {
  const auth = await verifyAuth();
  if (!auth.success || auth.user.role !== "SUPERADMIN") {
    redirect(APP_ROUTES.dashboard);
  }
  return <UsersListPage />;
}
````

## File: app/api/analytics/metrics/route.ts
````typescript
/**
 * app/api/analytics/metrics/route.ts
 * GET /api/analytics/metrics
 *
 * Returns time-series metric data for analytics charts.
 * Supports weekly, monthly, and quarterly granularity.
 * Respects calculationType (SUM / AVERAGE / SNAPSHOT) when aggregating.
 *
 * Query params:
 *   metricId?       — filter to a specific template metric (returns all if omitted)
 *   campusId?       — filter to a specific campus
 *   groupId?        — filter to all campuses in a group
 *   year            — required; base year (e.g., 2025)
 *   compareYear?    — optional; second year for YoY comparison
 *   granularity?    — "weekly" | "monthly" | "quarterly" (default: "monthly")
 *   startMonth?     — 1-12, default 1
 *   endMonth?       — 1-12, default 12
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, MetricCalculationType } from "@/types/global";

const QuerySchema = z.object({
    metricId: z.string().optional(),
    sectionId: z.string().optional(),
    campusId: z.string().optional(),
    groupId: z.string().optional(),
    year: z.coerce.number().int().min(2000).max(2100),
    compareYear: z.coerce.number().int().min(2000).max(2100).optional(),
    granularity: z.enum(["weekly", "monthly", "quarterly"]).default("monthly"),
    startMonth: z.coerce.number().int().min(1).max(12).default(1),
    endMonth: z.coerce.number().int().min(1).max(12).default(12),
});

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface MetricPoint {
    period: string;          // "YYYY-MM", "YYYY-WW", or "YYYY-QN"
    periodLabel: string;     // human-readable: "Jan 2025", "W01", "Q1"
    goal?: number;
    achieved?: number;
    yoy?: number;
    compareAchieved?: number; // compareYear achieved value for the same period
}

interface CampusMetricSeries {
    campusId: string;
    campusName: string;
    series: MetricPoint[];
    avgAchievementRate: number; // achieved/goal %, where goal exists
}

interface MetricAnalyticsPayload {
    metricId: string;
    metricName: string;
    sectionName: string;
    calculationType: MetricCalculationType;
    aggregate: MetricPoint[];         // cross-campus aggregate
    byCampus: CampusMetricSeries[];   // per-campus breakdown
    /** Available metrics in the default template for the selector */
    availableMetrics: { id: string; name: string; sectionName: string; calculationType: MetricCalculationType }[];
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function periodKey(periodType: string, year: number, month?: number, week?: number, granularity: "weekly" | "monthly" | "quarterly" = "monthly"): string | null {
    if (granularity === "weekly" && week != null) {
        const wStr = String(week).padStart(2, "0");
        return `${year}-W${wStr}`;
    }
    if (granularity === "monthly" && month != null) {
        return `${year}-${String(month).padStart(2, "0")}`;
    }
    if (granularity === "quarterly" && month != null) {
        const q = Math.ceil(month / 3);
        return `${year}-Q${q}`;
    }
    return null;
}

function periodLabel(key: string): string {
    // YYYY-MM → "Jan 2025"
    if (/^\d{4}-\d{2}$/.test(key)) {
        const [y, mo] = key.split("-");
        const d = new Date(Number(y), Number(mo) - 1);
        return d.toLocaleString("en-GB", { month: "short", year: "numeric" });
    }
    // YYYY-WNN → "W01 2025"
    if (/^\d{4}-W\d{2}$/.test(key)) {
        const [y, w] = key.split("-");
        return `${w} ${y}`;
    }
    // YYYY-QN → "Q1 2025"
    if (/^\d{4}-Q\d/.test(key)) {
        const [y, q] = key.split("-");
        return `${q} ${y}`;
    }
    return key;
}

function aggregateValues(values: number[], calcType: MetricCalculationType): number {
    if (values.length === 0) return 0;
    switch (calcType) {
        case MetricCalculationType.SUM: return values.reduce((a, b) => a + b, 0);
        case MetricCalculationType.AVERAGE: return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        case MetricCalculationType.SNAPSHOT: return values[values.length - 1]; // last value
        default: return values.reduce((a, b) => a + b, 0);
    }
}

/* ── Handler ───────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const parsed = QuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 400 });
    }
    const query = parsed.data;

    const cacheKey = `analytics:metrics:${auth.user.id}:${JSON.stringify(query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    /* ── Scope: enforce role visibility ──────────────────────────────────── */
    const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
    let allowedCampusIds: string[] | null = null;
    if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
        allowedCampusIds = [auth.user.campusId];
    }
    if (query.campusId) {
        // Further narrow — but only if within allowed scope
        if (allowedCampusIds && !allowedCampusIds.includes(query.campusId)) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
        allowedCampusIds = [query.campusId];
    }

    /* ── Load default template to enumerate available metrics ────────────── */
    const defaultTemplate = await db.reportTemplate.findFirst({
        where: { isDefault: true },
        include: { sections: { include: { metrics: true }, orderBy: { order: "asc" } } },
    });
    if (!defaultTemplate) {
        return NextResponse.json({ success: false, error: "No default template found" }, { status: 404 });
    }

    const availableMetrics: MetricAnalyticsPayload["availableMetrics"] = [];
    for (const sec of defaultTemplate.sections) {
        for (const met of sec.metrics) {
            if (met.capturesAchieved) {
                availableMetrics.push({
                    id: met.id,
                    name: met.name,
                    sectionName: sec.name,
                    calculationType: met.calculationType as MetricCalculationType,
                });
            }
        }
    }

    /* ── Resolve target metric ───────────────────────────────────────────── */
    let targetMetric = availableMetrics[0]; // default to first
    if (query.metricId) {
        const found = availableMetrics.find((m) => m.id === query.metricId);
        if (!found) {
            return NextResponse.json({ success: false, error: "Metric not found in default template" }, { status: 404 });
        }
        targetMetric = found;
    }

    /* ── Load reports in scope ───────────────────────────────────────────── */
    const years = [query.year, ...(query.compareYear != null ? [query.compareYear] : [])];

    /* Build Prisma where clause for reports */
    const reportWhere: Record<string, unknown> = {
        periodYear: { in: years },
    };
    if (allowedCampusIds) reportWhere.campusId = { in: allowedCampusIds };
    if (query.groupId) reportWhere.orgGroupId = query.groupId;
    if (query.startMonth || query.endMonth) {
        reportWhere.periodMonth = {
            gte: query.startMonth,
            lte: query.endMonth,
        };
    }

    const [scopedReports, allCampuses] = await Promise.all([
        db.report.findMany({
            where: reportWhere,
            include: {
                sections: {
                    include: { metrics: true },
                },
            },
        }),
        db.campus.findMany({}),
    ]);

    const campusMap = new Map(allCampuses.map((c) => [c.id, c]));

    /* ── Accumulator: [campusId][periodKey] → { goal[], achieved[], yoy[] } ─ */
    type BucketMap = Map<string, Map<string, { goal: number[]; achieved: number[]; yoy: number[] }>>;
    const buckets: BucketMap = new Map();

    for (const report of scopedReports) {
        for (const sec of report.sections) {
            const targetMetricEntry = sec.metrics.find((met) => met.templateMetricId === targetMetric.id);
            if (!targetMetricEntry) continue;

            const pk = periodKey(
                report.periodType,
                report.periodYear,
                report.periodMonth ?? undefined,
                report.periodWeek ?? undefined,
                query.granularity,
            );
            if (!pk) continue;

            // Separate primary and comparison year
            const isCompareYear = query.compareYear != null && report.periodYear === query.compareYear;
            const bucketKey = report.campusId;
            if (!buckets.has(bucketKey)) buckets.set(bucketKey, new Map());
            const campusBucket = buckets.get(bucketKey)!;
            if (!campusBucket.has(pk)) campusBucket.set(pk, { goal: [], achieved: [], yoy: [] });
            const slot = campusBucket.get(pk)!;

            if (!isCompareYear) {
                if (targetMetricEntry.monthlyGoal != null) slot.goal.push(targetMetricEntry.monthlyGoal);
                if (targetMetricEntry.monthlyAchieved != null) slot.achieved.push(targetMetricEntry.monthlyAchieved);
                if (targetMetricEntry.yoyGoal != null) slot.yoy.push(targetMetricEntry.yoyGoal);
            }
        }
    }

    /* ── Build per-campus series ─────────────────────────────────────────── */
    // Enumerate all periods in the range
    const allPeriods: string[] = [];
    if (query.granularity === "monthly") {
        for (let mo = query.startMonth; mo <= query.endMonth; mo++) {
            allPeriods.push(`${query.year}-${String(mo).padStart(2, "0")}`);
        }
    } else if (query.granularity === "quarterly") {
        const startQ = Math.ceil(query.startMonth / 3);
        const endQ = Math.ceil(query.endMonth / 3);
        for (let q = startQ; q <= endQ; q++) {
            allPeriods.push(`${query.year}-Q${q}`);
        }
    } else {
        // Weekly: 52 weeks
        for (let w = 1; w <= 52; w++) {
            allPeriods.push(`${query.year}-W${String(w).padStart(2, "0")}`);
        }
    }

    const byCampus: CampusMetricSeries[] = [];
    const aggregateBuckets = new Map<string, { goal: number[]; achieved: number[] }>();

    for (const period of allPeriods) {
        aggregateBuckets.set(period, { goal: [], achieved: [] });
    }

    for (const [campusId, campusBucket] of buckets) {
        const campus = campusMap.get(campusId);
        if (!campus) continue;

        const series: MetricPoint[] = allPeriods.map((pk) => {
            const slot = campusBucket.get(pk);
            const goal = slot?.goal.length ? aggregateValues(slot.goal, targetMetric.calculationType) : undefined;
            const achieved = slot?.achieved.length ? aggregateValues(slot.achieved, targetMetric.calculationType) : undefined;
            const yoy = slot?.yoy.length ? aggregateValues(slot.yoy, targetMetric.calculationType) : undefined;

            // Feed aggregate
            if (goal != null) aggregateBuckets.get(pk)!.goal.push(goal);
            if (achieved != null) aggregateBuckets.get(pk)!.achieved.push(achieved);

            return { period: pk, periodLabel: periodLabel(pk), goal, achieved, yoy };
        }).filter((pt) => pt.achieved != null || pt.goal != null);

        const achievementRates = series
            .filter((pt) => pt.goal != null && pt.goal > 0 && pt.achieved != null)
            .map((pt) => Math.round(((pt.achieved ?? 0) / (pt.goal ?? 1)) * 100));
        const avgRate = achievementRates.length
            ? Math.round(achievementRates.reduce((a, b) => a + b, 0) / achievementRates.length)
            : 0;

        byCampus.push({ campusId, campusName: campus.name, series, avgAchievementRate: avgRate });
    }

    /* ── Build aggregate series (cross-campus) ───────────────────────────── */
    const aggregate: MetricPoint[] = allPeriods.map((pk) => {
        const slot = aggregateBuckets.get(pk)!;
        const goal = slot.goal.length ? aggregateValues(slot.goal, MetricCalculationType.SUM) : undefined;
        const achieved = slot.achieved.length ? aggregateValues(slot.achieved, MetricCalculationType.SUM) : undefined;
        return { period: pk, periodLabel: periodLabel(pk), goal, achieved };
    }).filter((pt) => pt.achieved != null || pt.goal != null);

    const payload: MetricAnalyticsPayload = {
        metricId: targetMetric.id,
        metricName: targetMetric.name,
        sectionName: targetMetric.sectionName,
        calculationType: targetMetric.calculationType,
        aggregate,
        byCampus,
        availableMetrics,
    };

    const response = { success: true, data: payload };
    await cache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}
````

## File: app/api/auth/change-password/route.ts
````typescript
/**
 * app/api/auth/change-password/route.ts
 * POST /api/auth/change-password
 * Allows a logged-in user to change their own password.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth, hashPassword, verifyPassword } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const body = Schema.parse(await req.json());

  const user = await db.user.findUnique({ where: { id: auth.user.id } });
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  /* Verify current password */
  const valid = await verifyPassword(body.currentPassword, user.passwordHash ?? "");
  if (!valid) {
    return NextResponse.json(
      { success: false, error: "Current password is incorrect." },
      { status: 400 },
    );
  }

  const hashed = await hashPassword(body.newPassword);

  await db.user.update({
    where: { id: auth.user.id },
    data: { passwordHash: hashed, updatedAt: new Date() },
  });

  return NextResponse.json({ success: true, message: "Password changed successfully." });
}
````

## File: app/api/auth/forgot-password/route.ts
````typescript
/**
 * app/api/auth/forgot-password/route.ts
 * POST /api/auth/forgot-password
 * Generates a reset token and (in production) would send an email.
 * In dev, returns the token directly in the response.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, cache } from "@/lib/data/db";

const Schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = Schema.parse(await req.json());

  const user = await db.user.findFirst({
    where: { email: { equals: body.email, mode: "insensitive" } },
  });

  /* Always return 200 to prevent email enumeration */
  if (!user) {
    return NextResponse.json({ success: true, message: "If this email exists, a reset link has been sent." });
  }

  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); /* 1 hour */

  /* Store reset token in cache (key: pwd-reset:{token} → userId) */
  await cache.set(`pwd-reset:${token}`, JSON.stringify({ userId: user.id, expiresAt }), 3600);

  /* In production: send email. In dev: include token in response. */
  const response: Record<string, unknown> = {
    success: true,
    message: "If this email exists, a reset link has been sent.",
  };

  if (process.env.NODE_ENV !== "production") {
    response.devToken = token;
    response.devHint = `Use this token at /reset-password?token=${token}`;
  }

  return NextResponse.json(response);
}
````

## File: app/api/auth/logout/route.ts
````typescript
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";

export async function POST() {
    try {
        await clearAuthCookies();
        return NextResponse.json(successResponse({ message: "Logged out" }));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/auth/me/route.ts
````typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { successResponse, handleApiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) {
            return Response.json({ success: false, error: auth.error }, { status: auth.status });
        }
        return NextResponse.json(successResponse(auth.user));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/goals/for-report/route.ts
````typescript
/**
 * app/api/goals/for-report/route.ts
 * GET /api/goals/for-report?campusId=...&year=...&month=...
 *
 * Returns a map of { [templateMetricId]: { targetValue, isLocked, goalId } }
 * for the given campus + period combination.
 *
 * Resolution order (most-specific wins):
 *   1. Campus-level MONTHLY goal for exact month
 *   2. Campus-level ANNUAL goal for the year
 *   3. Group-level MONTHLY goal (inherited from campus's orgGroup)
 *   4. Group-level ANNUAL goal (inherited)
 *
 * If no goal exists for a metric, the metric is omitted from the map
 * (the form will show the field as empty / unset).
 *
 * This way every metric is scoped to its owning entity with no cross-group
 * conflicts: a campus goal always wins over its group goal, and goals are
 * never shared across sibling campuses from different groups.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole, GoalMode } from "@/types/global";

const READ_ROLES: UserRole[] = [
    UserRole.SUPERADMIN,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.CAMPUS_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.DATA_ENTRY,
];

const QuerySchema = z.object({
    campusId: z.string().min(1),
    year: z.coerce.number().int().min(2020).max(2100),
    month: z.coerce.number().int().min(1).max(12).optional(),
});

export interface GoalForMetric {
    goalId: string;
    targetValue: number;
    isLocked: boolean;
    source: "campus-monthly" | "campus-annual" | "group-monthly" | "group-annual";
}

export type GoalsForReportMap = Record<string, GoalForMetric>;

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req, READ_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const params = QuerySchema.safeParse(
        Object.fromEntries(new URL(req.url).searchParams),
    );
    if (!params.success) {
        return NextResponse.json(
            { success: false, error: "Invalid query parameters." },
            { status: 400 },
        );
    }

    const { campusId, year, month } = params.data;

    // Non-campus-level roles that are scoped to a campus can only query their own campus
    const isCampusScoped =
        auth.user.role === UserRole.CAMPUS_ADMIN ||
        auth.user.role === UserRole.CAMPUS_PASTOR ||
        auth.user.role === UserRole.DATA_ENTRY;

    if (isCampusScoped && auth.user.campusId && auth.user.campusId !== campusId) {
        return NextResponse.json(
            { success: false, error: "Cannot query goals for a different campus." },
            { status: 403 },
        );
    }

    // Resolve the campus to find its orgGroupId for group-level goal inheritance
    const campus = await db.campus.findUnique({ where: { id: campusId } });
    if (!campus) {
        return NextResponse.json(
            { success: false, error: "Campus not found." },
            { status: 404 },
        );
    }

    const orgGroupId = campus.parentId; // Campus.parentId is the OrgGroup id

    // Fetch all relevant goals in one pass (campus + group for the given year)
    const allGoals = await db.goal.findMany({
        where: {
            year,
            campusId: { in: [campusId, orgGroupId] },
        },
    });

    // Build resolution map: most-specific wins
    const result: GoalsForReportMap = {};

    // Helper: priority of each source (lower = higher priority)
    const PRIORITY: Record<GoalForMetric["source"], number> = {
        "campus-monthly": 1,
        "campus-annual": 2,
        "group-monthly": 3,
        "group-annual": 4,
    };

    for (const goal of allGoals) {
        const isCampusGoal = goal.campusId === campusId;
        const isGroupGoal = goal.campusId === orgGroupId;

        const isMonthly =
            goal.mode === GoalMode.MONTHLY && month != null && goal.month === month;
        const isAnnual = goal.mode === GoalMode.ANNUAL || goal.mode === GoalMode.CAMPUS_OVERRIDE;

        if (!isMonthly && !isAnnual) continue;

        let source: GoalForMetric["source"];
        if (isCampusGoal && isMonthly) source = "campus-monthly";
        else if (isCampusGoal && isAnnual) source = "campus-annual";
        else if (isGroupGoal && isMonthly) source = "group-monthly";
        else if (isGroupGoal && isAnnual) source = "group-annual";
        else continue;

        const existing = result[goal.templateMetricId];
        if (!existing || PRIORITY[source] < PRIORITY[existing.source]) {
            result[goal.templateMetricId] = {
                goalId: goal.id,
                targetValue: goal.targetValue,
                isLocked: goal.isLocked,
                source,
            };
        }
    }

    return NextResponse.json({ success: true, data: result });
}
````

## File: app/api/notifications/[id]/read/route.ts
````typescript
/**
 * app/api/notifications/[id]/read/route.ts
 * POST /api/notifications/:id/read — mark a single notification as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, handleApiError } from "@/lib/utils/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const { id } = await params;
    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification) return notFoundResponse("Notification not found.");
    if (notification.userId !== auth.user.id) {
      return errorResponse("You do not have access to this notification.", 403);
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    await cache.invalidatePattern(`notifications:${auth.user.id}*`);
    return NextResponse.json(successResponse(updated));
  } catch (err) {
    return handleApiError(err);
  }
}
````

## File: app/api/notifications/read-all/route.ts
````typescript
/**
 * app/api/notifications/read-all/route.ts
 * POST /api/notifications/read-all — mark all notifications as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const result = await db.notification.updateMany({
      where: { userId: auth.user.id, read: false },
      data: { read: true, readAt: new Date() },
    });

    await cache.invalidatePattern(`notifications:${auth.user.id}*`);
    return NextResponse.json(successResponse({ updated: result.count }));
  } catch (err) {
    return handleApiError(err);
  }
}
````

## File: app/api/org/campuses/[id]/route.ts
````typescript
/**
 * app/api/org/campuses/[id]/route.ts
 * GET /api/org/campuses/:id
 * PUT /api/org/campuses/:id  (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const UpdateCampusSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  country: z.string().max(60).optional(),
  location: z.string().max(120).optional(),
  adminId: z.string().uuid().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const campus = await db.campus.findUnique({ where: { id } });
  if (!campus) {
    return NextResponse.json({ success: false, error: "Campus not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: campus });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const body = UpdateCampusSchema.parse(await req.json());
  const campus = await db.campus.findUnique({ where: { id } });
  if (!campus) {
    return NextResponse.json({ success: false, error: "Campus not found." }, { status: 404 });
  }

  const updated = await db.campus.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.adminId !== undefined && { adminId: body.adminId }),
    },
  });

  await cache.invalidatePattern("org:campuses:*");
  return NextResponse.json({ success: true, data: updated });
}
````

## File: app/api/org/groups/[id]/route.ts
````typescript
/**
 * app/api/org/groups/[id]/route.ts
 * GET /api/org/groups/:id
 * PUT /api/org/groups/:id  (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const UpdateGroupSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    country: z.string().max(60).optional(),
    leaderId: z.string().uuid().nullable().optional(),
});

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const group = await db.orgGroup.findUnique({ where: { id } });
    if (!group) {
        return NextResponse.json({ success: false, error: "Group not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: group });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = UpdateGroupSchema.parse(await req.json());
    const group = await db.orgGroup.findUnique({ where: { id } });
    if (!group) {
        return NextResponse.json({ success: false, error: "Group not found." }, { status: 404 });
    }

    const updated = await db.orgGroup.update({
        where: { id },
        data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.country !== undefined && { country: body.country }),
            ...(body.leaderId !== undefined && { leaderId: body.leaderId }),
        },
    });

    await cache.invalidatePattern("org:groups:*");
    return NextResponse.json({ success: true, data: updated });
}
````

## File: app/api/reports/[id]/approve/route.ts
````typescript
/**
 * app/api/reports/[id]/approve/route.ts
 * POST /api/reports/:id/approve — SUBMITTED → APPROVED
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";

const ApproveSchema = z.object({
    notes: z.string().optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        const role = auth.user.role as UserRole;
        const roleConfig = ROLE_CONFIG[role];

        if (!roleConfig.canApproveReports) {
            return errorResponse("You do not have permission to approve reports.", 403);
        }

        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.APPROVED && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(`Cannot approve a report in status "${report.status}".`, 409);
        }

        const body = await req.json().catch(() => ({}));
        const { notes } = ApproveSchema.parse(body);
        const now = new Date().toISOString();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.APPROVED,
                    approvedById: auth.user.id,
                    updatedAt: new Date(),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.APPROVED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.APPROVED,
                    details: notes,
                },
            });

            return r;
        });

        await cache.invalidatePattern(`report:${id}*`);
        await cache.invalidatePattern(`reports:list:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/reports/[id]/lock/route.ts
````typescript
/**
 * app/api/reports/[id]/lock/route.ts
 * POST /api/reports/:id/lock — REVIEWED → LOCKED (SUPERADMIN only)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        const role = auth.user.role as UserRole;
        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.LOCKED && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(`Cannot lock a report in status "${report.status}".`, 409);
        }

        const now = new Date().toISOString();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.LOCKED,
                    lockedAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.LOCKED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.LOCKED,
                },
            });

            return r;
        });

        await cache.invalidatePattern(`report:${id}*`);
        await cache.invalidatePattern(`reports:list:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/reports/[id]/request-edit/route.ts
````typescript
/**
 * app/api/reports/[id]/request-edit/route.ts
 * POST /api/reports/:id/request-edit — SUBMITTED → REQUIRES_EDITS
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { UserRole, ReportStatus, ReportEventType, ReportEditStatus } from "@/types/global";

const RequestEditSchema = z.object({
    reason: z.string().min(1, "Reason is required.").max(1000),
    sections: z.array(z.string()).optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        const role = auth.user.role as UserRole;
        const roleConfig = ROLE_CONFIG[role];

        if (!roleConfig.canRequestEdits) {
            return errorResponse("You do not have permission to request edits.", 403);
        }

        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.REQUIRES_EDITS && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(
                `Cannot request edits for a report in status "${report.status}".`,
                409,
            );
        }

        const body = RequestEditSchema.parse(await req.json());
        const now = new Date().toISOString();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.REQUIRES_EDITS,
                    notes: body.reason,
                    updatedAt: new Date(),
                },
            });

            await tx.reportEdit.create({
                data: {
                    reportId: id,
                    submittedById: auth.user.id,
                    reason: body.reason,
                    status: ReportEditStatus.SUBMITTED,
                    sections: body.sections ?? [],
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.EDIT_REQUESTED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.REQUIRES_EDITS,
                    details: body.reason,
                },
            });

            return r;
        });

        await cache.invalidatePattern(`report:${id}*`);
        await cache.invalidatePattern(`reports:list:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/reports/[id]/review/route.ts
````typescript
/**
 * app/api/reports/[id]/review/route.ts
 * POST /api/reports/:id/review — APPROVED → REVIEWED
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";

const ReviewSchema = z.object({
    notes: z.string().optional(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        const role = auth.user.role as UserRole;
        const roleConfig = ROLE_CONFIG[role];

        if (!roleConfig.canMarkReviewed) {
            return errorResponse("You do not have permission to mark reports as reviewed.", 403);
        }

        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.REVIEWED && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(`Cannot mark reviewed: report status is "${report.status}".`, 409);
        }

        const body = await req.json().catch(() => ({}));
        const { notes } = ReviewSchema.parse(body);
        const now = new Date().toISOString();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.REVIEWED,
                    reviewedById: auth.user.id,
                    updatedAt: new Date(),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.REVIEWED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.REVIEWED,
                    details: notes,
                },
            });

            return r;
        });

        await cache.invalidatePattern(`report:${id}*`);
        await cache.invalidatePattern(`reports:list:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/reports/[id]/submit/route.ts
````typescript
/**
 * app/api/reports/[id]/submit/route.ts
 * POST /api/reports/:id/submit — DRAFT → SUBMITTED
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { REPORT_STATUS_TRANSITIONS } from "@/config/reports";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        const role = auth.user.role as UserRole;
        const roleConfig = ROLE_CONFIG[role];

        if (!roleConfig.canSubmitReports) {
            return errorResponse("You do not have permission to submit reports.", 403);
        }

        /* Validate status transition */
        const allowed = REPORT_STATUS_TRANSITIONS[report.status];
        const transition = allowed.find(
            (t) => t.to === ReportStatus.SUBMITTED && t.requiredRole.includes(role),
        );
        if (!transition) {
            return errorResponse(
                `Cannot submit a report in status "${report.status}".`,
                409,
            );
        }

        const now = new Date().toISOString();

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    status: ReportStatus.SUBMITTED,
                    submittedById: auth.user.id,
                    updatedAt: new Date(),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.SUBMITTED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                    previousStatus: report.status,
                    newStatus: ReportStatus.SUBMITTED,
                },
            });

            return r;
        });

        await cache.invalidatePattern(`report:${id}*`);
        await cache.invalidatePattern(`reports:list:${auth.user.id}:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/users/profile/route.ts
````typescript
/**
 * app/api/users/profile/route.ts
 * GET /api/users/profile  — get own profile
 * PUT /api/users/profile  — update own profile (name, phone)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";

/* ── Update schema ────────────────────────────────────────────────────────── */

const UpdateProfileSchema = z.object({
    firstName: z.string().min(1).max(60).optional(),
    lastName: z.string().min(1).max(60).optional(),
    phone: z.string().max(30).optional(),
});

/* ── GET /api/users/profile ───────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const user = await db.user.findUnique({
        where: { id: auth.user.id },
        omit: { passwordHash: true },
    });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
}

/* ── PUT /api/users/profile ───────────────────────────────────────────────── */

export async function PUT(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = UpdateProfileSchema.parse(await req.json());

    const user = await db.user.findUnique({ where: { id: auth.user.id } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const updated = await db.user.update({
        where: { id: auth.user.id },
        data: body,
        omit: { passwordHash: true },
    });

    await cache.invalidatePattern(`users:detail:${auth.user.id}`);

    return NextResponse.json({ success: true, data: updated });
}
````

## File: config/hierarchy.ts
````typescript
/**
 * config/hierarchy.ts
 * Org hierarchy configuration — 2 levels: Group → Campus.
 * Used to drive org management UI, breadcrumbs, and filtering.
 */

import { UserRole } from "@/types/global";

export const ORG_HIERARCHY_CONFIG: OrgLevelConfig[] = [
    {
        level: "GROUP",
        label: "Group",
        childLevel: "CAMPUS",
        leaderRole: UserRole.GROUP_PASTOR,
        adminRole: UserRole.GROUP_ADMIN,
    },
    {
        level: "CAMPUS",
        label: "Campus",
        parentLevel: "GROUP",
        leaderRole: UserRole.CAMPUS_PASTOR,
        adminRole: UserRole.CAMPUS_ADMIN,
    },
];

/** Map from org level to its config */
export const ORG_LEVEL_MAP: Record<"GROUP" | "CAMPUS", OrgLevelConfig> = {
    GROUP: ORG_HIERARCHY_CONFIG[0],
    CAMPUS: ORG_HIERARCHY_CONFIG[1],
};

/** Which roles are scoped to the CAMPUS level */
export const CAMPUS_SCOPED_ROLES: UserRole[] = [
    UserRole.CAMPUS_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.DATA_ENTRY,
];

/** Which roles are scoped to the GROUP level */
export const GROUP_SCOPED_ROLES: UserRole[] = [
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
];

/** Which roles have no org-scope restriction (see all) */
export const GLOBAL_SCOPE_ROLES: UserRole[] = [
    UserRole.SUPERADMIN,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.OFFICE_OF_CEO,
    UserRole.CHURCH_MINISTRY,
];

/** Get the org scope type for a role */
export function getOrgScope(role: UserRole): "campus" | "group" | "global" {
    if (CAMPUS_SCOPED_ROLES.includes(role)) return "campus";
    if (GROUP_SCOPED_ROLES.includes(role)) return "group";
    return "global";
}
````

## File: lib/data/redis.ts
````typescript
/**
 * lib/data/redis.ts
 * Upstash Redis client singleton with namespaced keys.
 * Provides cache, rate-limiting, and pub/sub utilities.
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ─────────────────────────────────────────────────────────────────────────────
// Redis client singleton
// ─────────────────────────────────────────────────────────────────────────────

const globalForRedis = globalThis as typeof globalThis & {
    __redis?: Redis;
};

if (!globalForRedis.__redis) {
    globalForRedis.__redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
}

export const redis = globalForRedis.__redis;

// ─────────────────────────────────────────────────────────────────────────────
// Key prefix for namespace isolation
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX = process.env.REDIS_PREFIX ?? "hrs:";

function key(k: string): string {
    return `${PREFIX}${k}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache utilities — drop-in for mockCache API surface
// ─────────────────────────────────────────────────────────────────────────────

export const cache = {
    /**
     * The Upstash REST SDK automatically deserialises JSON when reading, so the
     * returned value is already a parsed object even though we passed a JSON
     * string to `set()`.  We accept `unknown` here so callers can use the value
     * directly without calling `JSON.parse()` again.
     */
    async get(k: string): Promise<unknown> {
        const val = await redis.get<unknown>(key(k));
        return val ?? null;
    },

    async set(k: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await redis.set(key(k), value, { ex: ttlSeconds });
        } else {
            await redis.set(key(k), value);
        }
    },

    async del(k: string): Promise<void> {
        await redis.del(key(k));
    },

    async exists(k: string): Promise<boolean> {
        const result = await redis.exists(key(k));
        return result === 1;
    },

    /**
     * Invalidate all keys matching a glob pattern.
     * Uses SCAN to avoid blocking the server.
     */
    async invalidatePattern(pattern: string): Promise<number> {
        let cursor: string | number = 0;
        let deleted = 0;
        do {
            const result = await redis.scan(cursor, {
                match: key(pattern),
                count: 100,
            });
            const [nextCur, keys] = result as [number | string, string[]];
            cursor = nextCur;
            if (keys.length > 0) {
                await redis.del(...keys);
                deleted += keys.length;
            }
        } while (cursor !== 0);
        return deleted;
    },

    async flush(): Promise<void> {
        await cache.invalidatePattern("*");
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiters
// ─────────────────────────────────────────────────────────────────────────────

/**
 * General API rate limiter: 60 requests per 60 seconds per identifier.
 */
export const apiRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: `${PREFIX}rl:api`,
    analytics: true,
});

/**
 * Auth rate limiter: 10 attempts per 60 seconds per identifier.
 * Prevents brute-force login attempts.
 */
export const authRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: `${PREFIX}rl:auth`,
    analytics: true,
});

/**
 * Strict rate limiter for sensitive operations: 5 per 300 seconds.
 */
export const strictRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "300 s"),
    prefix: `${PREFIX}rl:strict`,
    analytics: true,
});

export default redis;
````

## File: lib/design-system/antd-theme.ts
````typescript
/**
 * Ant Design Theme — CSS Variable Bridge
 *
 * Provides hex values to Ant Design's ConfigProvider. next-themes toggles
 * `.dark` on <html>, which swaps all --ds-* CSS custom properties automatically.
 * For Ant Design tokens that can't read CSS vars, we branch on `isDark`.
 *
 * Usage:
 *   import { getAntdTheme } from "@/lib/design-system/antd-theme";
 *   <ConfigProvider theme={getAntdTheme(isDark)} />
 */

import type { ThemeConfig } from "antd";
import { palette } from "./tokens";

export function getAntdTheme(isDark: boolean): ThemeConfig {
    return {
        token: {
            /* ── Brand ─────────────────────────────────────────── */
            colorPrimary: palette.emerald[500],         // #10b981
            colorSuccess: isDark ? "#4ade80" : "#15803d",
            colorWarning: isDark ? "#fbbf24" : "#b45309",
            colorError: isDark ? "#f87171" : "#dc2626",
            colorInfo: isDark ? palette.emerald[400] : palette.emerald[700],

            /* ── Surfaces / Backgrounds ─────────────────────────── */
            colorBgContainer: isDark ? palette.black.soft : palette.neutral[0],
            colorBgElevated: isDark ? palette.black.elevated : palette.neutral[0],
            colorBgLayout: isDark ? palette.black.base : palette.neutral[50],
            colorBgSpotlight: isDark ? palette.black.elevated : palette.neutral[100],

            /* ── Text ──────────────────────────────────────────── */
            colorText: isDark ? "#F8FAFC" : palette.neutral[900],
            colorTextSecondary: isDark ? palette.neutral[400] : palette.neutral[500],
            colorTextTertiary: isDark ? "#475569" : palette.neutral[400],
            colorTextQuaternary: isDark ? "#334155" : palette.neutral[300],

            /* ── Borders ───────────────────────────────────────── */
            colorBorder: isDark ? "rgba(255,255,255,0.08)" : palette.neutral[200],
            colorBorderSecondary: isDark ? "rgba(255,255,255,0.04)" : palette.neutral[100],

            /* ── Shape ─────────────────────────────────────────── */
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 4,
            borderRadiusXS: 2,

            /* ── Typography ─────────────────────────────────────── */
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 14,
            fontSizeHeading1: 30,
            fontSizeHeading2: 24,
            fontSizeHeading3: 20,
            fontSizeHeading4: 16,
            fontSizeHeading5: 14,

            /* ── Motion ─────────────────────────────────────────── */
            motionDurationSlow: "0.3s",
            motionDurationMid: "0.2s",
            motionDurationFast: "0.1s",

            /* ── Shadows ────────────────────────────────────────── */
            boxShadow: isDark
                ? "0 4px 8px -2px rgb(0 0 0 / 0.50), 0 2px 4px -2px rgb(0 0 0 / 0.35)"
                : "0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
            boxShadowSecondary: isDark
                ? "0 12px 20px -4px rgb(0 0 0 / 0.60), 0 4px 8px -4px rgb(0 0 0 / 0.40)"
                : "0 12px 20px -4px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
        },
        components: {
            Button: {
                borderRadius: 12,
                borderRadiusLG: 12,
                borderRadiusSM: 8,
                controlHeight: 40,
                controlHeightLG: 48,
                controlHeightSM: 32,
                fontWeight: 600,
            },
            Card: {
                borderRadiusLG: 20,
                paddingLG: 24,
            },
            Modal: {
                borderRadiusLG: 24,
            },
            Input: {
                borderRadius: 12,
                borderRadiusLG: 12,
                controlHeight: 40,
                controlHeightLG: 48,
                controlHeightSM: 32,
            },
            Select: {
                borderRadius: 12,
            },
            Table: {
                borderRadius: 12,
                borderRadiusLG: 12,
            },
            Menu: {
                borderRadius: 8,
                itemBorderRadius: 8,
                subMenuItemBorderRadius: 8,
                itemMarginInline: 8,
                itemPaddingInline: 12,
            },
            Tabs: {
                borderRadius: 8,
            },
            Tag: {
                borderRadiusSM: 6,
            },
            Switch: {
                trackMinWidth: 44,
                trackHeight: 22,
                handleSize: 18,
                trackPadding: 2,
                innerMinMargin: 4,
                innerMaxMargin: 24,
            },
            DatePicker: {
                borderRadius: 12,
            },
            Notification: {
                borderRadiusLG: 16,
            },
            Message: {
                borderRadiusLG: 12,
            },
            Tooltip: {
                colorBgSpotlight: isDark ? palette.black.elevated : palette.neutral[900],
                colorTextLightSolid: isDark ? "#F8FAFC" : "#FFFFFF",
                borderRadius: 8,
            },
        },
    };
}

export default getAntdTheme;
````

## File: lib/hooks/useApiData.ts
````typescript
"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * useApiData — fetches data from an API endpoint and returns the result.
 * Replaces useMockDbSubscription for real DB usage.
 *
 * @param url    API endpoint URL (null/undefined to skip fetching)
 * @param deps   Extra dependencies that trigger a re-fetch
 * @returns      { data, loading, error, refetch }
 */
export function useApiData<T>(
  url: string | null | undefined,
  deps: unknown[] = [],
): { data: T | undefined; loading: boolean; error: string | undefined; refetch: () => void } {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          let body: { error?: string } = {};
          try { body = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        // Guard against empty / non-JSON responses (e.g., 204 No Content)
        const text = await res.text().catch(() => "");
        return text ? JSON.parse(text) : {};
      })
      .then((json) => {
        if (!cancelled) {
          setData(json.success !== undefined ? json.data : json);
          setError(undefined);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refreshKey, ...deps]);

  return { data, loading, error, refetch };
}
````

## File: lib/utils/api.ts
````typescript
/**
 * lib/utils/api.ts
 * Standard API response helpers — used in every route handler.
 */

import { NextResponse } from "next/server";

/** Returns a plain { success: true, data } object — wrap in NextResponse.json() at the call site. */
export function successResponse<T>(data: T): { success: true; data: T } {
    return { success: true, data };
}

export function errorResponse(error: string, status: number) {
    return NextResponse.json({ success: false, error, code: status } satisfies ApiResponse<never>, {
        status,
    });
}

export function unauthorizedResponse(message = "Unauthorised") {
    return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Insufficient permissions") {
    return errorResponse(message, 403);
}

export function notFoundResponse(message = "Not found") {
    return errorResponse(message, 404);
}

export function badRequestResponse(message = "Bad request") {
    return errorResponse(message, 400);
}

export function handleApiError(err: unknown) {
    console.error("[API Error]", err);
    const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
    return errorResponse(message, 500);
}
````

## File: lib/utils/exportReports.ts
````typescript
/**
 * lib/utils/exportReports.ts
 *
 * Client-side Excel (.xlsx) export utilities using SheetJS.
 *
 * Exported functions:
 *  - exportReportsList       — single-sheet list export
 *  - exportReportDetail      — two-sheet single-report export
 *  - exportReportsWithOptions — full-featured export driven by ExportDialogOptions
 */

import * as XLSX from "xlsx";
import { fmtDate } from "./formatDate";
import { getReportLabel, formatReportPeriod } from "./reportUtils";
import { CONTENT } from "@/config/content";

const ec = (CONTENT.reports as Record<string, unknown>).export as Record<string, string>;

/* ── helpers ────────────────────────────────────────────────────────────── */

function pct(achieved?: number, goal?: number): string {
    if (achieved == null || goal == null || goal === 0) return "";
    return `${Math.round((achieved / goal) * 100)}%`;
}

function safeStr(v: unknown): string {
    return v == null ? "" : String(v);
}

/* ── ExportDialogOptions ────────────────────────────────────────────────── */

export type ExportGrouping = "none" | "campus" | "month" | "quarter";
export type ExportFormat = "single" | "per-campus";

export interface ExportDialogOptions {
    /** Which reports to export — already filtered by caller */
    reports: Report[];
    templates: ReportTemplate[];
    campuses: Campus[];
    grouping: ExportGrouping;
    includeMetrics: boolean;
    includeGoals: boolean;
    includeComments: boolean;
    format: ExportFormat;
    /** Optional per-report sections/metrics for metric export */
    sections?: ReportSection[];
    metrics?: ReportMetric[];
}

/* ── exportReportsList ──────────────────────────────────────────────────── */

/**
 * Exports the supplied (already-filtered) reports to a single-sheet workbook.
 * Columns: Title · Campus · Period · Status · Template · Deadline · Created
 */
export function exportReportsList(
    reports: Report[],
    templates: ReportTemplate[],
    campuses: Campus[],
): void {
    const campusMap = Object.fromEntries(campuses.map((c) => [c.id, c.name]));

    const header = [
        ec.colTitle,
        ec.colCampus,
        ec.colPeriod,
        ec.colStatus,
        ec.colTemplate,
        ec.colDeadline,
        ec.colCreatedAt,
    ];

    const rows = reports.map((r) => {
        const template = templates.find((t) => t.id === r.templateId);
        return [
            getReportLabel(r, templates),
            campusMap[r.campusId] ?? r.campusId,
            formatReportPeriod(r),
            (CONTENT.reports.status as Record<string, string>)?.[r.status] ?? r.status,
            template?.name ?? "",
            fmtDate(r.deadline),
            fmtDate(r.createdAt),
        ];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

    /* column widths */
    ws["!cols"] = [
        { wch: 40 }, // title
        { wch: 24 }, // campus
        { wch: 18 }, // period
        { wch: 16 }, // status
        { wch: 28 }, // template
        { wch: 14 }, // deadline
        { wch: 14 }, // created
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, ec.sheetList);

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${ec.listFilename}-${timestamp}.xlsx`);
}

/* ── exportReportDetail ─────────────────────────────────────────────────── */

/**
 * Exports a single report as a two-sheet workbook:
 *  Sheet 1 "Overview"  — key metadata fields
 *  Sheet 2 "Metrics"   — section → metric → achieved / goal / % / comment
 */
export function exportReportDetail(
    report: Report,
    sections: ReportSection[],
    metrics: ReportMetric[],
    templates: ReportTemplate[],
    campuses: Campus[],
    users: UserProfile[],
): void {
    const campusName = campuses.find((c) => c.id === report.campusId)?.name ?? report.campusId;
    const template = templates.find((t) => t.id === report.templateId);
    const submitter = users.find((u) => u.id === report.submittedById);
    const submitterName = submitter ? `${submitter.firstName} ${submitter.lastName}` : "";

    const statusLabel =
        (CONTENT.reports.status as Record<string, string>)?.[report.status] ??
        report.status;

    /* ── Sheet 1: Overview ─────────────────────────────────────────────── */

    const overviewData: [string, string][] = [
        [ec.colTitle, getReportLabel(report, templates)],
        [ec.colCampus, campusName],
        [ec.colPeriod, formatReportPeriod(report)],
        [ec.colStatus, statusLabel],
        [ec.colTemplate, template?.name ?? ""],
        [ec.colDeadline, fmtDate(report.deadline)],
        [ec.colCreatedAt, fmtDate(report.createdAt)],
        [ec.colSubmittedBy, submitterName],
        ...(report.notes ? [[ec.colNotes, safeStr(report.notes)]] as [string, string][] : []),
    ];

    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    wsOverview["!cols"] = [{ wch: 18 }, { wch: 48 }];

    /* ── Sheet 2: Metrics ──────────────────────────────────────────────── */

    const metricsHeader = [
        ec.colSection,
        ec.colMetric,
        ec.colAchieved,
        ec.colGoal,
        ec.colPercentage,
        ec.colComment,
    ];

    const metricRows: (string | number)[][] = [];

    // If saved report sections exist, use them
    if (sections.length > 0) {
        for (const section of sections) {
            const sectionMetrics = metrics.filter((m) => m.reportSectionId === section.id);
            for (const m of sectionMetrics) {
                metricRows.push([
                    section.sectionName,
                    m.metricName,
                    m.monthlyAchieved ?? "",
                    m.monthlyGoal ?? "",
                    pct(m.monthlyAchieved, m.monthlyGoal),
                    safeStr(m.comment),
                ]);
            }
        }
    } else if (template) {
        // Fall back to template structure (no values — report was never filled)
        for (const section of [...template.sections].sort((a, b) => a.order - b.order)) {
            for (const m of [...section.metrics].sort((a, b) => a.order - b.order)) {
                metricRows.push([section.name, m.name, "", "", "", ""]);
            }
        }
    }

    const wsMetrics = XLSX.utils.aoa_to_sheet([metricsHeader, ...metricRows]);
    wsMetrics["!cols"] = [
        { wch: 26 }, // section
        { wch: 32 }, // metric
        { wch: 12 }, // achieved
        { wch: 12 }, // goal
        { wch: 12 }, // %
        { wch: 40 }, // comment
    ];

    /* ── Assemble workbook ─────────────────────────────────────────────── */

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsOverview, ec.sheetMeta);
    XLSX.utils.book_append_sheet(wb, wsMetrics, ec.sheetMetrics);

    const safeName = getReportLabel(report, templates)
        .replace(/[/\\?*[\]]/g, "-")
        .slice(0, 50);
    XLSX.writeFile(wb, `${safeName}.xlsx`);
}

/* ── exportReportsWithOptions ───────────────────────────────────────────── */

/**
 * Full-featured export driven by ExportDialogOptions.
 * Supports grouping (campus / month / quarter), multi-sheet per-campus format,
 * and optional metric / goal / comment columns.
 */
export function exportReportsWithOptions(opts: ExportDialogOptions): void {
    const {
        reports,
        templates,
        campuses,
        grouping,
        includeMetrics,
        includeGoals,
        includeComments,
        format,
        sections = [],
        metrics = [],
    } = opts;

    const campusMap = Object.fromEntries(campuses.map((c) => [c.id, c.name]));
    const timestamp = new Date().toISOString().slice(0, 10);
    const wb = XLSX.utils.book_new();

    /* ── Build base columns (always included) ─────────────────────────── */

    type ColDef = { header: string; wch: number; value: (r: Report) => string | number };

    const baseCols: ColDef[] = [
        { header: ec.colTitle, wch: 40, value: (r) => getReportLabel(r, templates) },
        { header: ec.colCampus, wch: 24, value: (r) => campusMap[r.campusId] ?? r.campusId },
        { header: ec.colPeriod, wch: 18, value: (r) => formatReportPeriod(r) },
        { header: ec.colStatus, wch: 16, value: (r) => (CONTENT.reports.status as Record<string, string>)?.[r.status] ?? r.status },
        { header: ec.colTemplate, wch: 28, value: (r) => templates.find((t) => t.id === r.templateId)?.name ?? "" },
        { header: ec.colDeadline, wch: 14, value: (r) => fmtDate(r.deadline) },
        { header: ec.colCreatedAt, wch: 14, value: (r) => fmtDate(r.createdAt) },
    ];

    /* ── Determine grouping key ───────────────────────────────────────── */

    function groupKey(r: Report): string {
        if (grouping === "campus") return campusMap[r.campusId] ?? r.campusId;
        if (grouping === "month") return r.periodMonth != null ? `${r.periodYear}-${String(r.periodMonth).padStart(2, "0")}` : String(r.periodYear);
        if (grouping === "quarter" && r.periodMonth != null) return `${r.periodYear} Q${Math.ceil(r.periodMonth / 3)}`;
        return "all";
    }

    /* ── Build grouped buckets ────────────────────────────────────────── */

    const buckets: Map<string, Report[]> = new Map();
    for (const r of reports) {
        const k = groupKey(r);
        if (!buckets.has(k)) buckets.set(k, []);
        buckets.get(k)!.push(r);
    }

    /* ── Build worksheet for a group of reports ─────────────────────── */

    function buildSheet(groupReports: Report[]): XLSX.WorkSheet {
        const header = baseCols.map((c) => c.header);
        const rows: (string | number)[][] = groupReports.map((r) => baseCols.map((c) => c.value(r)));

        // Optional: append per-report metric summary rows
        if (includeMetrics || includeGoals || includeComments) {
            const metricDataRows: (string | number)[][] = [];
            for (const r of groupReports) {
                const rSections = sections.filter((s) => s.reportId === r.id);
                for (const sec of rSections) {
                    const secMetrics = metrics.filter((m) => m.reportSectionId === sec.id);
                    for (const m of secMetrics) {
                        metricDataRows.push([
                            getReportLabel(r, templates),
                            campusMap[r.campusId] ?? r.campusId,
                            sec.sectionName,
                            m.metricName,
                            ...(includeMetrics ? [m.monthlyAchieved ?? ""] : []),
                            ...(includeGoals ? [m.monthlyGoal ?? ""] : []),
                            ...(includeMetrics && includeGoals ? [pct(m.monthlyAchieved, m.monthlyGoal)] : []),
                            ...(includeComments ? [safeStr(m.comment)] : []),
                        ]);
                    }
                }
            }
            if (metricDataRows.length > 0) {
                const metricHeader = [
                    ec.colTitle, ec.colCampus, ec.colSection, ec.colMetric,
                    ...(includeMetrics ? [ec.colAchieved] : []),
                    ...(includeGoals ? [ec.colGoal] : []),
                    ...(includeMetrics && includeGoals ? [ec.colPercentage] : []),
                    ...(includeComments ? [ec.colComment] : []),
                ];
                // Append metric data below a blank row separator
                const ws = XLSX.utils.aoa_to_sheet([
                    header, ...rows,
                    [],
                    metricHeader, ...metricDataRows,
                ]);
                ws["!cols"] = baseCols.map((c) => ({ wch: c.wch }));
                return ws;
            }
        }

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        ws["!cols"] = baseCols.map((c) => ({ wch: c.wch }));
        return ws;
    }

    /* ── Single-sheet vs per-campus format ───────────────────────────── */

    if (format === "per-campus") {
        // One sheet per bucket, sheet name = campus name (truncated to 31 chars)
        for (const [key, groupReports] of buckets) {
            const sheetName = key.slice(0, 31);
            XLSX.utils.book_append_sheet(wb, buildSheet(groupReports), sheetName);
        }
    } else {
        if (grouping === "none" || buckets.size === 1) {
            // Single flat sheet
            XLSX.utils.book_append_sheet(wb, buildSheet(reports), ec.sheetList);
        } else {
            // All groups on separate sheets within single workbook
            for (const [key, groupReports] of buckets) {
                const sheetName = key.slice(0, 31);
                XLSX.utils.book_append_sheet(wb, buildSheet(groupReports), sheetName);
            }
        }
    }

    XLSX.writeFile(wb, `${ec.listFilename}-${timestamp}.xlsx`);
}
````

## File: modules/notifications/components/InboxPage.tsx
````typescript
"use client";

/**
 * modules/notifications/components/InboxPage.tsx
 * Notification inbox — works for all roles that have inbox access.
 */

import { useRouter } from "next/navigation";
import { message } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import { fmtDateTime } from "@/lib/utils/formatDate";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

/* ── Notification row ─────────────────────────────────────────────────────── */

interface NotificationRowProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}

function NotificationRow({ notification, onMarkRead }: NotificationRowProps) {
  const router = useRouter();
  const typeLabel =
    CONTENT.notifications.types[notification.type as keyof typeof CONTENT.notifications.types] ??
    notification.type;

  const handleClick = () => {
    if (!notification.read && !notification.isRead) onMarkRead(notification.id);
    if (notification.relatedId || notification.reportId) {
      const targetId = notification.reportId ?? notification.relatedId;
      if (targetId) router.push(APP_ROUTES.reportDetail(targetId));
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className={[
          "w-full flex items-start gap-3 px-4 py-4 text-left transition-colors",
          "hover:bg-ds-surface-sunken border-b border-ds-border-subtle last:border-b-0",
          "bg-transparent cursor-pointer",
          !notification.read && !notification.isRead ? "bg-ds-brand-accent/5" : "",
        ].join(" ")}
      >
        {/* Unread dot */}
        <span
          className={[
            "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
            !notification.read && !notification.isRead ? "bg-ds-brand-accent" : "bg-transparent",
          ].join(" ")}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={[
              "text-sm leading-snug",
              !notification.read && !notification.isRead
                ? "font-semibold text-ds-text-primary"
                : "font-normal text-ds-text-secondary",
            ].join(" ")}
          >
            {notification.message}
          </p>
          <p className="text-xs text-ds-text-subtle mt-1">
            {typeLabel} · {fmtDateTime(notification.createdAt)}
          </p>
        </div>
      </button>
    </li>
  );
}

/* ── InboxPage ────────────────────────────────────────────────────────────── */

export function InboxPage() {
  const { user } = useAuth();

  const { data: notifications, refetch } = useApiData<AppNotification[]>(
    user ? API_ROUTES.notifications.list : null,
  );

  const sorted = notifications
    ? [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : undefined;

  const unreadCount = sorted?.filter((n) => !n.read && !n.isRead).length ?? 0;

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(API_ROUTES.notifications.markRead(id), { method: "POST" });
      refetch();
    } catch {
      message.error(CONTENT.common.errorDefault as string);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(API_ROUTES.notifications.markAllRead, { method: "POST" });
      message.success(
        (CONTENT.notifications.markAllRead as string) ?? "All notifications marked as read.",
      );
      refetch();
    } catch {
      message.error(CONTENT.common.errorDefault as string);
    }
  };

  return (
    <PageLayout
      title={CONTENT.notifications.pageTitle as string}
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
      actions={
        unreadCount > 0 ? (
          <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>
            {CONTENT.notifications.markAllRead as string}
          </Button>
        ) : undefined
      }
    >
      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden">
        {notifications === undefined ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : sorted && sorted.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<BellOutlined />}
              title={CONTENT.notifications.emptyState.title as string}
              description={CONTENT.notifications.emptyState.description as string}
            />
          </div>
        ) : (
          <ul>
            {sorted!.map((n) => (
              <NotificationRow key={n.id} notification={n} onMarkRead={handleMarkRead} />
            ))}
          </ul>
        )}
      </div>
    </PageLayout>
  );
}
````

## File: modules/org/components/OrgPage.tsx
````typescript
"use client";

/**
 * modules/org/components/OrgPage.tsx
 * Organisation management — campuses and groups.
 * SUPERADMIN only.
 */

import { useState } from "react";
import { Tabs, Modal, Form, message } from "antd";
import { PlusOutlined, EditOutlined, BankOutlined, ClusterOutlined } from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import Table from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { FilterToolbar } from "@/components/ui/FilterToolbar";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters";

/* ── Campus tab ─────────────────────────────────────────────────────────── */

function CampusesTab() {
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Campus | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data: campuses, refetch } = useApiData<Campus[]>(API_ROUTES.org.campuses);

  const filtered = (campuses ?? []).filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "name",
      title: CONTENT.org.campusNameLabel as string,
      render: (row: Campus) => <span className="font-medium text-ds-text-primary">{row.name}</span>,
    },
    {
      key: "location",
      title: CONTENT.org.locationLabel as string,
      render: (row: Campus & { location?: string }) => (
        <span className="text-sm text-ds-text-secondary">{row.location ?? "—"}</span>
      ),
    },
    {
      key: "country",
      title: CONTENT.org.countryLabel as string,
      render: (row: Campus & { country?: string }) => (
        <span className="text-sm text-ds-text-secondary">{row.country ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 80,
      render: (row: Campus) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditTarget(row);
            form.setFieldsValue({
              name: row.name,
              location: (row as Campus & { location?: string }).location ?? "",
              country: (row as Campus & { country?: string }).country ?? "",
            });
          }}
        >
          {CONTENT.common.edit as string}
        </Button>
      ),
    },
  ];

  const handleSave = async (values: { name: string; location: string; country: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await fetch(API_ROUTES.org.campus(editTarget.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setEditTarget(null);
        refetch();
      } else {
        const res = await fetch(API_ROUTES.org.campuses, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, organisationId: ORG_ID }),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setShowCreate(false);
        refetch();
      }
      form.resetFields();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    form.resetFields();
    setShowCreate(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search campuses…"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {CONTENT.org.newCampus as string}
        </Button>
      </div>

      {campuses === undefined ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BankOutlined />}
          title={CONTENT.org.emptyStateCampuses.title as string}
          description={CONTENT.org.emptyStateCampuses.description as string}
          action={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {CONTENT.org.newCampus as string}
            </Button>
          }
        />
      ) : (
        <Table dataSource={filtered} columns={columns} rowKey="id" />
      )}

      <Modal
        open={!!(editTarget || showCreate)}
        title={editTarget ? (CONTENT.org.editCampus as string) : (CONTENT.org.newCampus as string)}
        onCancel={() => {
          setEditTarget(null);
          setShowCreate(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={CONTENT.common.save as string}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <Form.Item
            name="name"
            label={CONTENT.org.campusNameLabel as string}
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="location" label={CONTENT.org.locationLabel as string}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="country" label={CONTENT.org.countryLabel as string}>
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ── Groups tab ─────────────────────────────────────────────────────────── */

function GroupsTab() {
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<OrgGroup | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const { data: groups, refetch: refetchGroups } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);

  const filtered = (groups ?? []).filter(
    (g) => !search || g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "name",
      title: CONTENT.org.groupNameLabel as string,
      render: (row: OrgGroup) => (
        <span className="font-medium text-ds-text-primary">{row.name}</span>
      ),
    },
    {
      key: "country",
      title: CONTENT.org.countryLabel as string,
      render: (row: OrgGroup & { country?: string }) => (
        <span className="text-sm text-ds-text-secondary">{row.country ?? "—"}</span>
      ),
    },
    {
      key: "actions",
      title: "",
      width: 80,
      render: (row: OrgGroup) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditTarget(row);
            form.setFieldsValue({
              name: row.name,
              country: (row as OrgGroup & { country?: string }).country ?? "",
            });
          }}
        >
          {CONTENT.common.edit as string}
        </Button>
      ),
    },
  ];

  const handleSave = async (values: { name: string; country: string }) => {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await fetch(API_ROUTES.org.group(editTarget.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setEditTarget(null);
        refetchGroups();
      } else {
        const res = await fetch(API_ROUTES.org.groups, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, organisationId: ORG_ID }),
        });
        if (!res.ok) {
          const j = await res.json();
          message.error(j.error);
          return;
        }
        message.success(CONTENT.common.successSave as string);
        setShowCreate(false);
        refetchGroups();
      }
      form.resetFields();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    form.resetFields();
    setShowCreate(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search groups…"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {CONTENT.org.newGroup as string}
        </Button>
      </div>

      {groups === undefined ? (
        <LoadingSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClusterOutlined />}
          title={CONTENT.org.emptyStateGroups.title as string}
          description={CONTENT.org.emptyStateGroups.description as string}
          action={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {CONTENT.org.newGroup as string}
            </Button>
          }
        />
      ) : (
        <Table dataSource={filtered} columns={columns} rowKey="id" />
      )}

      <Modal
        open={!!(editTarget || showCreate)}
        title={editTarget ? (CONTENT.org.editGroup as string) : (CONTENT.org.newGroup as string)}
        onCancel={() => {
          setEditTarget(null);
          setShowCreate(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={CONTENT.common.save as string}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <Form.Item
            name="name"
            label={CONTENT.org.groupNameLabel as string}
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="country" label={CONTENT.org.countryLabel as string}>
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

/* ── Tab config ───────────────────────────────────────────────────────────── */

const TAB_ITEMS = [
  {
    key: "campuses",
    label: CONTENT.org.campusesLabel as string,
    children: <CampusesTab />,
  },
  {
    key: "groups",
    label: "Groups",
    children: <GroupsTab />,
  },
];

/* ── OrgPage ──────────────────────────────────────────────────────────────── */

export function OrgPage() {
  return (
    <PageLayout title={CONTENT.org.pageTitle as string}>
      <Tabs items={TAB_ITEMS} defaultActiveKey="campuses" />
    </PageLayout>
  );
}
````

## File: modules/templates/components/TemplateNewPage.tsx
````typescript
"use client";

/**
 * modules/templates/components/TemplateNewPage.tsx
 * Create a new report template — sections → metrics structure.
 * Mirrors TemplateDetailPage architecture.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Switch, Select, Collapse, Badge, Modal } from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  DragOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { MetricFieldType, MetricCalculationType } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters";

const FIELD_TYPE_OPTIONS = [
  { value: MetricFieldType.NUMBER,     label: "Number" },
  { value: MetricFieldType.PERCENTAGE, label: "Percentage (%)" },
  { value: MetricFieldType.CURRENCY,   label: "Currency" },
  { value: MetricFieldType.TEXT,       label: "Text" },
];

const CALC_TYPE_OPTIONS = [
  { value: MetricCalculationType.SUM,      label: "Sum (cumulative)" },
  { value: MetricCalculationType.AVERAGE,  label: "Average (rolling mean)" },
  { value: MetricCalculationType.SNAPSHOT, label: "Snapshot (last value)" },
];

interface DraftMetric {
  id: string;
  name: string;
  description: string;
  fieldType: MetricFieldType;
  calculationType: MetricCalculationType;
  isRequired: boolean;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
  order: number;
}

interface DraftSection {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  order: number;
  metrics: DraftMetric[];
}

interface MetricRowProps {
  metric: DraftMetric;
  onChange: (patch: Partial<DraftMetric>) => void;
  onRemove: () => void;
}

function MetricRow({ metric, onChange, onRemove }: MetricRowProps) {
  type BoolKey = "isRequired" | "capturesGoal" | "capturesAchieved" | "capturesYoY";
  const TOGGLES: { key: BoolKey; label: string }[] = [
    { key: "isRequired",       label: CONTENT.templates.isRequiredLabel as string },
    { key: "capturesGoal",     label: CONTENT.templates.capturesGoalLabel as string },
    { key: "capturesAchieved", label: CONTENT.templates.capturesAchievedLabel as string },
    { key: "capturesYoY",      label: CONTENT.templates.capturesYoYLabel as string },
  ];

  return (
    <div className="p-4 bg-ds-surface-sunken rounded-ds-lg border border-ds-border-subtle space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.metricNameLabel as string} *
          </label>
          <Input
            size="middle"
            value={metric.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Total Attendance"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.fieldTypeLabel as string}
          </label>
          <Select
            size="middle"
            value={metric.fieldType}
            options={FIELD_TYPE_OPTIONS}
            onChange={(v) => onChange({ fieldType: v })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.calculationTypeLabel as string}
          </label>
          <Select
            size="middle"
            value={metric.calculationType}
            options={CALC_TYPE_OPTIONS}
            onChange={(v) => onChange({ calculationType: v })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap gap-4">
          {TOGGLES.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <Switch
                size="small"
                checked={metric[key] as boolean}
                onChange={(v) => onChange({ [key]: v })}
              />
              <span className="text-xs text-ds-text-secondary">{label}</span>
            </div>
          ))}
        </div>
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} />
      </div>
    </div>
  );
}

function makeEmptyMetric(order: number): DraftMetric {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    fieldType: MetricFieldType.NUMBER,
    calculationType: MetricCalculationType.SUM,
    isRequired: true,
    capturesGoal: true,
    capturesAchieved: true,
    capturesYoY: false,
    order,
  };
}

function makeEmptySection(order: number): DraftSection {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    isRequired: true,
    order,
    metrics: [makeEmptyMetric(1)],
  };
}

interface HeaderFormValues {
  name: string;
  description: string;
  isDefault: boolean;
}

export function TemplateNewPage() {
  const router = useRouter();
  const [form] = Form.useForm<HeaderFormValues>();
  const [sections, setSections] = useState<DraftSection[]>(() => [makeEmptySection(1)]);
  const [saving, setSaving] = useState(false);
  const [goalPromptVisible, setGoalPromptVisible] = useState(false);
  const [createdTemplateId, setCreatedTemplateId] = useState<string | null>(null);

  /* ── Section helpers ────────────────────────────────────────── */
  const addSection = () =>
    setSections((prev) => [...prev, makeEmptySection(prev.length + 1)]);

  const removeSection = (sId: string) =>
    setSections((prev) => prev.filter((s) => s.id !== sId));

  const updateSection = (sId: string, patch: Partial<DraftSection>) =>
    setSections((prev) => prev.map((s) => (s.id === sId ? { ...s, ...patch } : s)));

  /* ── Metric helpers ─────────────────────────────────────────── */
  const addMetric = (sId: string) =>
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sId) return s;
        return { ...s, metrics: [...s.metrics, makeEmptyMetric(s.metrics.length + 1)] };
      }),
    );

  const removeMetric = (sId: string, mId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sId ? { ...s, metrics: s.metrics.filter((m) => m.id !== mId) } : s,
      ),
    );

  const updateMetric = (sId: string, mId: string, patch: Partial<DraftMetric>) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sId
          ? { ...s, metrics: s.metrics.map((m) => (m.id === mId ? { ...m, ...patch } : m)) }
          : s,
      ),
    );

  /* ── Save ───────────────────────────────────────────────────── */
  const handleSubmit = async (values: HeaderFormValues) => {
    if (sections.find((s) => !s.name.trim())) {
      message.error("All sections must have a name.");
      return;
    }
    for (const s of sections) {
      if (s.metrics.length === 0) {
        message.error(`Section "${s.name}" must have at least one metric.`);
        return;
      }
      if (s.metrics.find((m) => !m.name.trim())) {
        message.error(`All metrics in "${s.name}" must have a name.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description || undefined,
        isDefault: values.isDefault,
        organisationId: ORG_ID,
        sections: sections.map((s, si) => ({
          id: s.id,
          name: s.name.trim(),
          description: s.description || undefined,
          isRequired: s.isRequired,
          order: si + 1,
          metrics: s.metrics.map((m, mi) => ({
            id: m.id,
            sectionId: s.id,
            name: m.name.trim(),
            description: m.description || undefined,
            fieldType: m.fieldType,
            calculationType: m.calculationType,
            isRequired: m.isRequired,
            capturesGoal: m.capturesGoal,
            capturesAchieved: m.capturesAchieved,
            capturesYoY: m.capturesYoY,
            order: mi + 1,
          })),
        })),
      };

      const res = await fetch(API_ROUTES.reportTemplates.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.templates.templateCreated as string);
      // If any metric captures goals, prompt to set goals now
      const hasGoalMetrics = sections.some((s) => s.metrics.some((m) => m.capturesGoal));
      if (hasGoalMetrics && json.data?.id) {
        setCreatedTemplateId(json.data.id);
        setGoalPromptVisible(true);
      } else {
        router.push(APP_ROUTES.templates);
      }
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  const totalMetrics = sections.reduce((n, s) => n + s.metrics.length, 0);

  return (
    <>
    <PageLayout
      title={CONTENT.templates.newTemplate as string}
      actions={
        <Button onClick={() => router.push(APP_ROUTES.templates)}>
          {CONTENT.common.cancel as string}
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        initialValues={{ isDefault: false }}
      >
        <div className="max-w-4xl space-y-6">
          {/* Metadata card */}
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 space-y-4">
            <Form.Item
              name="name"
              label={CONTENT.templates.nameLabel as string}
              rules={[{ required: true, message: "Template name is required." }]}
            >
              <Input size="large" placeholder={CONTENT.templates.namePlaceholder as string} />
            </Form.Item>
            <Form.Item name="description" label={CONTENT.templates.descriptionLabel as string}>
              <Input.TextArea rows={2} placeholder={CONTENT.templates.descriptionPlaceholder as string} />
            </Form.Item>
            <div className="flex items-center gap-2">
              <Form.Item name="isDefault" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <span className="text-sm text-ds-text-secondary">
                {CONTENT.templates.setDefault as string}
              </span>
            </div>
          </div>

          {/* Sections + metrics */}
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-ds-text-primary">
                  {CONTENT.templates.sectionsLabel as string}
                  <Badge
                    count={sections.length}
                    className="ml-2"
                    style={{ backgroundColor: "var(--ds-brand-accent)" }}
                  />
                </h3>
                <p className="text-xs text-ds-text-subtle mt-0.5">
                  {totalMetrics} metric{totalMetrics === 1 ? "" : "s"} across {sections.length} section{sections.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button icon={<PlusOutlined />} size="small" onClick={addSection}>
                {CONTENT.templates.addSection as string}
              </Button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-10 text-ds-text-subtle text-sm">
                {CONTENT.templates.emptySections as string}
              </div>
            ) : (
              <Collapse
                accordion={false}
                defaultActiveKey={sections.map((s) => s.id)}
                items={sections.map((section, si) => ({
                  key: section.id,
                  label: (
                    <div className="flex items-center gap-3 min-w-0">
                      <DragOutlined className="text-ds-text-subtle flex-shrink-0" />
                      <span className="font-medium text-ds-text-primary truncate">
                        {section.name || `${CONTENT.templates.sectionLabel as string} ${si + 1}`}
                      </span>
                      <span className="text-xs text-ds-text-subtle flex-shrink-0">
                        {section.metrics.length} metric{section.metrics.length === 1 ? "" : "s"}
                        {section.isRequired && <span className="ml-1 text-red-500">*</span>}
                      </span>
                    </div>
                  ),
                  children: (
                    <div className="space-y-4 pt-1">
                      {/* Section name + required toggle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
                            {CONTENT.templates.sectionNameLabel as string} *
                          </label>
                          <Input
                            size="middle"
                            value={section.name}
                            onChange={(e) => updateSection(section.id, { name: e.target.value })}
                            placeholder="e.g. Weekly Attendance"
                          />
                        </div>
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-ds-text-secondary block mb-1">
                              {CONTENT.templates.descriptionLabel as string}
                            </label>
                            <Input
                              size="middle"
                              value={section.description}
                              onChange={(e) =>
                                updateSection(section.id, { description: e.target.value })
                              }
                              placeholder="Optional"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
                            <Switch
                              size="small"
                              checked={section.isRequired}
                              onChange={(v) => updateSection(section.id, { isRequired: v })}
                            />
                            <span className="text-xs text-ds-text-secondary whitespace-nowrap">
                              {CONTENT.templates.isRequiredLabel as string}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics list */}
                      <div className="space-y-2">
                        {section.metrics.length === 0 && (
                          <p className="text-xs text-ds-text-subtle py-2">
                            {CONTENT.templates.emptyMetrics as string}
                          </p>
                        )}
                        {section.metrics.map((metric) => (
                          <MetricRow
                            key={metric.id}
                            metric={metric}
                            onChange={(patch) => updateMetric(section.id, metric.id, patch)}
                            onRemove={() => removeMetric(section.id, metric.id)}
                          />
                        ))}
                      </div>

                      {/* Section footer actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-ds-border-subtle">
                        <Button
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={() => addMetric(section.id)}
                        >
                          {CONTENT.templates.addMetric as string}
                        </Button>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeSection(section.id)}
                        >
                          {CONTENT.templates.removeSection as string}
                        </Button>
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <Button onClick={() => router.push(APP_ROUTES.templates)}>
              {CONTENT.common.cancel as string}
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              {CONTENT.templates.createTemplate as string}
            </Button>
          </div>
        </div>
      </Form>
    </PageLayout>

      {/* Goal-set prompt modal */}
      <Modal
        open={goalPromptVisible}
        title={
          <div className="flex items-center gap-2">
            <TrophyOutlined className="text-ds-brand-accent" />
            <span>{CONTENT.templates.goalPromptTitle as string}</span>
          </div>
        }
        footer={[
          <Button key="later" onClick={() => { setGoalPromptVisible(false); router.push(APP_ROUTES.templates); }}>
            {CONTENT.templates.goalPromptSkip as string}
          </Button>,
          <Button
            key="now"
            type="primary"
            icon={<TrophyOutlined />}
            onClick={() => {
              setGoalPromptVisible(false);
              router.push(APP_ROUTES.goals);
            }}
          >
            {CONTENT.templates.goalPromptConfirm as string}
          </Button>,
        ]}
        onCancel={() => { setGoalPromptVisible(false); router.push(APP_ROUTES.templates); }}
        closable={false}
      >
        <p className="text-sm text-ds-text-secondary py-2">
          {CONTENT.templates.goalPromptDescription as string}
        </p>
        {createdTemplateId && (
          <p className="text-xs text-ds-text-subtle">
            Template ID: <code className="font-ds-mono">{createdTemplateId}</code>
          </p>
        )}
      </Modal>
    </>
  );
}
````

## File: modules/users/components/ProfilePage.tsx
````typescript
"use client";

/**
 * modules/users/components/ProfilePage.tsx
 * Profile view + inline edit for the current authenticated user.
 * Tabs: Profile Â· Security Â· Appearance Â· Notifications
 */

import { useState, useEffect } from "react";
import { Form, message, Tabs, Divider, Alert, Switch, Select } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  BulbOutlined,
  BellOutlined,
  CheckOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { RoleBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ROLE_CONFIG } from "@/config/roles";
import { fmtDate } from "@/lib/utils/formatDate";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Shared primitives                                                           */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 py-3 border-b border-ds-border-subtle last:border-0">
      <span className="text-xs font-medium text-ds-text-subtle uppercase tracking-wide sm:w-40 sm:flex-shrink-0 sm:pt-0.5">
        {label}
      </span>
      <span className="text-sm text-ds-text-primary break-all">{value ?? "â€”"}</span>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-base font-semibold text-ds-text-primary">{title}</h2>
      <div className="h-px flex-1 bg-ds-border-base" />
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-ds-brand-accent text-base">{icon}</span>
        <h2 className="text-sm font-semibold text-ds-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Profile tab                                                                 */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function ProfileTab({ user }: { user: AuthUser }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetch(API_ROUTES.users.profile)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setProfile(j.data);
      })
      .catch(() => {
        /* no-op */
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    form.setFieldsValue({
      firstName: profile?.firstName ?? user.firstName,
      lastName: profile?.lastName ?? user.lastName,
      phone: profile?.phone ?? "",
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const handleSave = async (values: { firstName: string; lastName: string; phone?: string }) => {
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.users.profile, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      setProfile(json.data);
      message.success(CONTENT.profile.profileUpdated as string);
      setEditing(false);
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  const displayName = `${profile?.firstName ?? user.firstName} ${profile?.lastName ?? user.lastName}`;
  const campus = user.campusId;
  const initials =
    `${(profile?.firstName ?? user.firstName)[0] ?? ""}${(profile?.lastName ?? user.lastName)[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar + name hero */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base">
        <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-ds-brand-accent text-white font-bold text-2xl select-none">
          {initials}
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xl font-bold text-ds-text-primary">{displayName}</p>
          <p className="text-sm text-ds-text-secondary mt-0.5">{profile?.email ?? user.email}</p>
          <div className="mt-2">
            <RoleBadge role={user.role} />
          </div>
        </div>
        {!editing && (
          <div className="sm:ml-auto">
            <Button icon={<EditOutlined />} size="small" onClick={handleEdit}>
              {CONTENT.profile.editProfile as string}
            </Button>
          </div>
        )}
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <SectionHeading title={CONTENT.profile.personalInfoLabel as string} />
          <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Form.Item
                name="firstName"
                label={CONTENT.profile.firstNameLabel as string}
                rules={[{ required: true, message: "First name is required." }]}
              >
                <Input prefix={<UserOutlined className="text-ds-text-subtle" />} />
              </Form.Item>
              <Form.Item
                name="lastName"
                label={CONTENT.profile.lastNameLabel as string}
                rules={[{ required: true, message: "Last name is required." }]}
              >
                <Input />
              </Form.Item>
            </div>
            <Form.Item name="phone" label={CONTENT.profile.phoneLabel as string}>
              <Input placeholder="+234 800 000 0000" />
            </Form.Item>
            <div className="flex gap-3 justify-end">
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                {CONTENT.common.cancel as string}
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {saving
                  ? (CONTENT.profile.saving as string)
                  : (CONTENT.profile.saveChanges as string)}
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <SectionHeading title={CONTENT.profile.accountInfoLabel as string} />
          <InfoRow
            label={CONTENT.profile.firstNameLabel as string}
            value={profile?.firstName ?? user.firstName}
          />
          <InfoRow
            label={CONTENT.profile.lastNameLabel as string}
            value={profile?.lastName ?? user.lastName}
          />
          <InfoRow
            label={CONTENT.profile.emailLabel as string}
            value={profile?.email ?? user.email}
          />
          <InfoRow label={CONTENT.profile.phoneLabel as string} value={profile?.phone} />
          <InfoRow
            label={CONTENT.profile.roleLabel as string}
            value={ROLE_CONFIG[user.role]?.label ?? user.role}
          />
          {campus && <InfoRow label={CONTENT.profile.campusLabel as string} value={campus} />}
          <InfoRow
            label={CONTENT.profile.memberSince as string}
            value={fmtDate(profile?.createdAt)}
          />
        </div>
      )}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Security (change password) tab                                              */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function SecurityTab() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      setError(CONTENT.auth.errors.passwordsDoNotMatch as string);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(API_ROUTES.auth.changePassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      setSuccess(true);
      form.resetFields();
    } catch {
      setError((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      {success && (
        <Alert
          type="success"
          message={CONTENT.profile.passwordUpdated as string}
          showIcon
          closable
          onClose={() => setSuccess(false)}
        />
      )}
      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />
      )}

      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
        <SectionHeading title={CONTENT.profile.passwordSection as string} />
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            name="currentPassword"
            label={CONTENT.profile.currentPasswordLabel as string}
            rules={[{ required: true, message: "Current password is required." }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-ds-text-subtle" />}
              placeholder="Your current password"
            />
          </Form.Item>
          <Divider className="my-3" />
          <Form.Item
            name="newPassword"
            label={CONTENT.profile.newPasswordLabel as string}
            rules={[
              { required: true, message: "New password is required." },
              { min: 8, message: "Password must be at least 8 characters." },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-ds-text-subtle" />}
              placeholder="At least 8 characters"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={CONTENT.profile.confirmPasswordLabel as string}
            rules={[{ required: true, message: "Please confirm your new password." }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-ds-text-subtle" />}
              placeholder="Repeat your new password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} block>
            {saving
              ? (CONTENT.common.saving as string)
              : (CONTENT.profile.updatePassword as string)}
          </Button>
        </Form>
      </div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Appearance tab                                                              */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const THEME_OPTIONS = [
  { value: "system", label: (CONTENT.settings as Record<string, string>).themeSystem },
  { value: "light", label: (CONTENT.settings as Record<string, string>).themeLight },
  { value: "dark", label: (CONTENT.settings as Record<string, string>).themeDark },
] as const;

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <LoadingSkeleton rows={2} />;

  return (
    <div className="max-w-md">
      <SectionCard
        icon={<BulbOutlined />}
        title={(CONTENT.settings as Record<string, string>).appearanceSection}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ds-text-primary">
              {(CONTENT.settings as Record<string, string>).themeLabel}
            </p>
            <p className="text-xs text-ds-text-subtle mt-0.5">
              {(CONTENT.settings as Record<string, string>).themeDescription}
            </p>
          </div>
          <Select
            value={theme ?? "system"}
            onChange={(v) => setTheme(v)}
            options={THEME_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            style={{ width: 140 }}
            size="middle"
          />
        </div>
      </SectionCard>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* Notifications tab                                                           */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const NOTIF_KEY = "hs-notif-prefs";

interface NotifPrefs {
  email: boolean;
  inApp: boolean;
  deadlineReminders: boolean;
}

const DEFAULT_PREFS: NotifPrefs = { email: true, inApp: true, deadlineReminders: true };

function loadPrefs(): NotifPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

interface NotifRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function NotifRow({ label, description, checked, onChange }: NotifRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-ds-border-subtle last:border-b-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-ds-text-primary">{label}</p>
        <p className="text-xs text-ds-text-subtle mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

const NOTIF_ROWS: Array<{ key: keyof NotifPrefs; labelKey: string; descKey: string }> = [
  { key: "email", labelKey: "emailNotificationsLabel", descKey: "emailNotificationsDescription" },
  { key: "inApp", labelKey: "inAppNotificationsLabel", descKey: "inAppNotificationsDescription" },
  {
    key: "deadlineReminders",
    labelKey: "deadlineRemindersLabel",
    descKey: "deadlineRemindersDescription",
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setLoaded(true);

    // Check push notification support
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushEnabled(!!sub);
        });
      });
    }
  }, []);

  const handleChange = (key: keyof NotifPrefs, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    if (typeof window !== "undefined") localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  const handleTogglePush = async () => {
    if (!pushSupported) return;
    setPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        setPushEnabled(false);
        message.info((CONTENT.settings as Record<string, string>).pushDisabled);
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "denied") {
          message.warning((CONTENT.settings as Record<string, string>).pushPermissionDenied);
          return;
        }
        await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        setPushEnabled(true);
        message.success((CONTENT.settings as Record<string, string>).pushEnabled);
      }
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setPushLoading(false);
    }
  };

  if (!loaded) return <LoadingSkeleton rows={3} />;

  return (
    <div className="max-w-md space-y-6">
      <SectionCard
        icon={<BellOutlined />}
        title={(CONTENT.settings as Record<string, string>).notificationsSection}
      >
        {NOTIF_ROWS.map((row) => (
          <NotifRow
            key={row.key}
            label={(CONTENT.settings as Record<string, string>)[row.labelKey]}
            description={(CONTENT.settings as Record<string, string>)[row.descKey]}
            checked={prefs[row.key]}
            onChange={(val) => handleChange(row.key, val)}
          />
        ))}
        <div className="flex justify-end mt-4">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => message.success((CONTENT.settings as Record<string, string>).saved)}
          >
            {(CONTENT.settings as Record<string, string>).savePreferences}
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        icon={<MobileOutlined />}
        title={(CONTENT.settings as Record<string, string>).pushNotificationsSection}
      >
        <div className="flex items-start justify-between gap-4 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-ds-text-primary">
              {(CONTENT.settings as Record<string, string>).pushNotificationsLabel}
            </p>
            <p className="text-xs text-ds-text-subtle mt-0.5">
              {pushSupported
                ? (CONTENT.settings as Record<string, string>).pushNotificationsDescription
                : (CONTENT.settings as Record<string, string>).pushNotSupported}
            </p>
          </div>
          <Switch
            checked={pushEnabled}
            onChange={handleTogglePush}
            loading={pushLoading}
            disabled={!pushSupported}
          />
        </div>
      </SectionCard>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/* ProfilePage                                                                 */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function ProfilePage({ defaultTab }: { defaultTab?: string }) {
  const { user } = useAuth();

  if (!user) return <LoadingSkeleton rows={6} />;

  const TAB_ITEMS = [
    {
      key: "profile",
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          {CONTENT.profile.tabs.profile as string}
        </span>
      ),
      children: <ProfileTab user={user} />,
    },
    {
      key: "security",
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />
          {CONTENT.profile.tabs.security as string}
        </span>
      ),
      children: <SecurityTab />,
    },
    {
      key: "appearance",
      label: (
        <span className="flex items-center gap-2">
          <BulbOutlined />
          {CONTENT.profile.tabs.appearance as string}
        </span>
      ),
      children: <AppearanceTab />,
    },
    {
      key: "notifications",
      label: (
        <span className="flex items-center gap-2">
          <BellOutlined />
          {CONTENT.profile.tabs.notifications as string}
        </span>
      ),
      children: <NotificationsTab />,
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title={CONTENT.profile.pageTitle as string}
        subtitle={`${user.firstName} ${user.lastName}`}
      />
      <Tabs defaultActiveKey={defaultTab ?? "profile"} items={TAB_ITEMS} className="mt-2" />
    </PageLayout>
  );
}
````

## File: modules/users/components/UsersListPage.tsx
````typescript
"use client";

/**
 * modules/users/components/UsersListPage.tsx
 * User management — SUPERADMIN only.
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useApiData } from "@/lib/hooks/useApiData";
import { API_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { FilterToolbar } from "@/components/ui/FilterToolbar";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { PageLayout } from "@/components/ui/PageLayout";
import { RoleBadge, ActiveBadge } from "@/components/ui/StatusBadge";
import SearchInput from "@/components/ui/SearchInput";
import { UserRole } from "@/types/global";

const PAGE_SIZE = 20;

interface Filters {
  search: string;
  role: UserRole | "";
  active: "true" | "false" | "";
}

const DEFAULT_FILTERS: Filters = { search: "", role: "", active: "" };

const ROLE_OPTIONS = Object.values(UserRole).map((r) => ({
  value: r,
  label: CONTENT.users.roles[r as keyof typeof CONTENT.users.roles] ?? r,
}));

export function UsersListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [currentPage, setPage] = useState(1);

  const { data: users } = useApiData<UserProfile[]>(API_ROUTES.users.list);

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      if (filters.role && u.role !== filters.role) return false;
      if (filters.active !== "") {
        const active = filters.active === "true";
        if (u.isActive !== active) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        if (!fullName.includes(q) && !u.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, filters]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const updateFilter = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const columns: ColumnsType<UserProfile> = [
    {
      key: "name",
      title: CONTENT.users.nameLabel as string,
      dataIndex: "firstName",
      render: (_v, u) => (
        <div>
          <p className="text-sm font-medium text-ds-text-primary">
            {u.firstName} {u.lastName}
          </p>
          <p className="text-xs text-ds-text-subtle">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      title: CONTENT.users.roleLabel as string,
      dataIndex: "role",
      width: 160,
      render: (v) => <RoleBadge role={v as UserRole} />,
    },
    {
      key: "campus",
      title: CONTENT.users.campusLabel as string,
      dataIndex: "campusId",
      width: 130,
      render: (v) => <span className="text-sm text-ds-text-secondary">{String(v ?? "—")}</span>,
    },
    {
      key: "status",
      title: CONTENT.users.statusLabel as string,
      dataIndex: "isActive",
      width: 100,
      render: (v) => <ActiveBadge isActive={v as boolean} />,
    },
    {
      key: "actions",
      title: "",
      width: 60,
      render: (_v, u) => (
        <Tooltip title={CONTENT.common.view as string}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(APP_ROUTES.userDetail(u.id))}
          />
        </Tooltip>
      ),
    },
  ];

  const isFiltered = filters.role !== "" || filters.active !== "" || filters.search !== "";

  return (
    <PageLayout title={CONTENT.users.pageTitle as string}>
      <FilterToolbar
        label={CONTENT.common.filter as string}
        isFiltered={isFiltered}
        onReset={() => {
          setFilters(DEFAULT_FILTERS);
          setPage(1);
        }}
        extra={
          <SearchInput
            placeholder={CONTENT.users.searchPlaceholder as string}
            value={filters.search}
            onChange={(e) => updateFilter({ search: (e.target as HTMLInputElement).value })}
            onSearch={(v) => updateFilter({ search: v })}
          />
        }
      >
        <select
          value={filters.role}
          onChange={(e) => updateFilter({ role: e.target.value as UserRole | "" })}
          title={CONTENT.users.roleLabel as string}
          aria-label={CONTENT.users.roleLabel as string}
          className="h-9 px-3 rounded-ds-lg border border-ds-border-base bg-ds-surface-elevated text-sm text-ds-text-primary focus:outline-1 focus:outline-ds-brand-accent"
        >
          <option value="">{CONTENT.users.roleLabel as string}</option>
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filters.active}
          onChange={(e) => updateFilter({ active: e.target.value as "true" | "false" | "" })}
          title={CONTENT.users.statusLabel as string}
          aria-label={CONTENT.users.statusLabel as string}
          className="h-9 px-3 rounded-ds-lg border border-ds-border-base bg-ds-surface-elevated text-sm text-ds-text-primary focus:outline-1 focus:outline-ds-brand-accent"
        >
          <option value="">{CONTENT.users.statusLabel as string}</option>
          <option value="true">{CONTENT.users.activeStatus as string}</option>
          <option value="false">{CONTENT.users.inactiveStatus as string}</option>
        </select>
      </FilterToolbar>

      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden">
        <Table<UserProfile>
          dataSource={paginated}
          columns={columns}
          rowKey="id"
          loading={users === undefined}
          pagination={false}
          scroll={{ x: 600 }}
          emptyDescription={CONTENT.users.emptyState.description as string}
        />
        {filtered.length > PAGE_SIZE && (
          <div className="border-t border-ds-border-base px-4 py-3">
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
````

## File: prisma/schema.prisma
````prisma
// ─────────────────────────────────────────────────────────────────────────────
// Harvesters Reporting System — Prisma Schema
// Maps 1:1 to types/global.ts domain interfaces
// ─────────────────────────────────────────────────────────────────────────────

generator client {
  provider = "prisma-client-js"
  output   = "./generated"
}

datasource db {
  provider = "postgresql"
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum UserRole {
  SUPERADMIN
  SPO
  CEO
  OFFICE_OF_CEO
  CHURCH_MINISTRY
  GROUP_PASTOR
  GROUP_ADMIN
  CAMPUS_PASTOR
  CAMPUS_ADMIN
  DATA_ENTRY
  MEMBER
}

enum Gender {
  MALE
  FEMALE
  PREFER_NOT_TO_SAY
}

enum ReportStatus {
  DRAFT
  SUBMITTED
  REQUIRES_EDITS
  APPROVED
  REVIEWED
  LOCKED
}

enum ReportPeriodType {
  WEEKLY
  MONTHLY
  YEARLY
}

enum MetricFieldType {
  NUMBER
  PERCENTAGE
  TEXT
  CURRENCY
}

enum MetricCalculationType {
  SUM
  AVERAGE
  SNAPSHOT
}

enum ReportEventType {
  CREATED
  SUBMITTED
  EDIT_REQUESTED
  EDIT_SUBMITTED
  EDIT_APPROVED
  EDIT_REJECTED
  EDIT_APPLIED
  APPROVED
  REVIEWED
  LOCKED
  DEADLINE_PASSED
  UPDATE_REQUESTED
  UPDATE_APPROVED
  UPDATE_REJECTED
  DATA_ENTRY_CREATED
  TEMPLATE_VERSION_NOTE
  AUTO_APPROVED
}

enum ReportEditStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
}

enum ReportUpdateRequestStatus {
  PENDING
  APPROVED
  REJECTED
}

enum NotificationType {
  REPORT_SUBMITTED
  REPORT_EDIT_REQUESTED
  REPORT_APPROVED
  REPORT_REVIEWED
  REPORT_LOCKED
  REPORT_EDIT_SUBMITTED
  REPORT_EDIT_APPROVED
  REPORT_EDIT_REJECTED
  REPORT_UPDATE_REQUESTED
  REPORT_UPDATE_APPROVED
  REPORT_UPDATE_REJECTED
  REPORT_DEADLINE_REMINDER
  GOAL_UNLOCK_REQUESTED
  GOAL_UNLOCK_APPROVED
  GOAL_UNLOCK_REJECTED
}

enum GoalMode {
  ANNUAL
  MONTHLY
  CAMPUS_OVERRIDE
}

enum GoalEditRequestStatus {
  PENDING
  APPROVED
  REJECTED
}

enum InviteLinkType {
  CAMPUS
  GROUP
  DIRECT
}

// ─── Models ──────────────────────────────────────────────────────────────────

model User {
  id             String   @id @default(uuid())
  organisationId String?
  email          String   @unique
  passwordHash   String
  firstName      String
  lastName       String
  phone          String?
  gender         Gender?
  role           UserRole @default(MEMBER)
  campusId       String?
  orgGroupId     String?
  avatar         String?
  avatarUrl      String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  campus   Campus?   @relation("CampusUsers", fields: [campusId], references: [id])
  orgGroup OrgGroup? @relation("OrgGroupUsers", fields: [orgGroupId], references: [id])

  // Reverse relations
  createdTemplates        ReportTemplate[]        @relation("TemplateCreator")
  createdTemplateVersions ReportTemplateVersion[] @relation("TemplateVersionCreator")
  submittedReports        Report[]                @relation("ReportSubmitter")
  reviewedReports         Report[]                @relation("ReportReviewer")
  approvedReports         Report[]                @relation("ReportApprover")
  createdReports          Report[]                @relation("ReportCreator")
  dataEntryReports        Report[]                @relation("DataEntryCreator")
  reportEdits             ReportEdit[]            @relation("EditSubmitter")
  reviewedEdits           ReportEdit[]            @relation("EditReviewer")
  reportUpdateRequests    ReportUpdateRequest[]   @relation("UpdateRequester")
  reviewedUpdates         ReportUpdateRequest[]   @relation("UpdateReviewer")
  reportEvents            ReportEvent[]           @relation("EventActor")
  reportVersions          ReportVersion[]         @relation("VersionCreator")
  goals                   Goal[]                  @relation("GoalCreator")
  lockedGoals             Goal[]                  @relation("GoalLocker")
  goalEditRequests        GoalEditRequest[]       @relation("GoalEditRequester")
  reviewedGoalEdits       GoalEditRequest[]       @relation("GoalEditReviewer")
  notifications           Notification[]          @relation("NotificationRecipient")
  createdInviteLinks      InviteLink[]            @relation("InviteLinkCreator")
  ledOrgGroups            OrgGroup[]              @relation("OrgGroupLeader")
  adminedCampuses         Campus[]                @relation("CampusAdmin")
  lockedMetrics           ReportMetric[]          @relation("MetricLocker")
  bugReports              BugReport[]             @relation("BugReportCreator")

  @@index([email])
  @@index([role])
  @@index([campusId])
  @@index([orgGroupId])
  @@map("users")
}

model OrgGroup {
  id          String   @id @default(uuid())
  name        String
  description String?
  country     String
  leaderId    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  leader   User?    @relation("OrgGroupLeader", fields: [leaderId], references: [id])
  campuses Campus[] @relation("GroupCampuses")
  users    User[]   @relation("OrgGroupUsers")
  reports  Report[] @relation("ReportOrgGroup")
  goals    Goal[]   @relation("GoalOrgGroup")

  @@map("org_groups")
}

model Campus {
  id          String   @id @default(uuid())
  name        String
  description String?
  parentId    String
  adminId     String?
  country     String
  location    String
  address     String?
  phone       String?
  memberCount Int?     @default(0)
  inviteCode  String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  orgGroup      OrgGroup      @relation("GroupCampuses", fields: [parentId], references: [id])
  admin         User?         @relation("CampusAdmin", fields: [adminId], references: [id])
  users         User[]        @relation("CampusUsers")
  reports       Report[]      @relation("ReportCampus")
  goals         Goal[]        @relation("GoalCampus")
  metricEntries MetricEntry[] @relation("MetricEntryCampus")

  @@index([parentId])
  @@map("campuses")
}

// ─── Report Templates ────────────────────────────────────────────────────────

model ReportTemplate {
  id             String   @id @default(uuid())
  organisationId String
  name           String
  description    String?
  version        Int      @default(1)
  isActive       Boolean  @default(true)
  isDefault      Boolean  @default(false)
  createdById    String
  campusId       String?
  orgGroupId     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  createdBy User                    @relation("TemplateCreator", fields: [createdById], references: [id])
  sections  ReportTemplateSection[]
  versions  ReportTemplateVersion[]
  reports   Report[]                @relation("ReportTemplate")
  goals     Goal[]                  @relation("GoalTemplateMetric")

  @@map("report_templates")
}

model ReportTemplateSection {
  id          String  @id @default(uuid())
  templateId  String
  name        String
  description String?
  order       Int
  isRequired  Boolean @default(true)

  // Relations
  template ReportTemplate         @relation(fields: [templateId], references: [id], onDelete: Cascade)
  metrics  ReportTemplateMetric[]

  @@index([templateId])
  @@map("report_template_sections")
}

model ReportTemplateMetric {
  id               String                @id @default(uuid())
  sectionId        String
  name             String
  description      String?
  fieldType        MetricFieldType       @default(NUMBER)
  calculationType  MetricCalculationType @default(SUM)
  isRequired       Boolean               @default(true)
  minValue         Float?
  maxValue         Float?
  order            Int
  capturesGoal     Boolean               @default(false)
  capturesAchieved Boolean               @default(false)
  capturesYoY      Boolean               @default(false)

  // Relations
  section       ReportTemplateSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  reportMetrics ReportMetric[]
  metricEntries MetricEntry[]
  goals         Goal[]                @relation("GoalMetric")

  @@index([sectionId])
  @@map("report_template_metrics")
}

model ReportTemplateVersion {
  id            String   @id @default(uuid())
  templateId    String
  versionNumber Int
  snapshot      Json
  createdAt     DateTime @default(now())
  createdById   String

  // Relations
  template  ReportTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  createdBy User           @relation("TemplateVersionCreator", fields: [createdById], references: [id])

  @@index([templateId])
  @@map("report_template_versions")
}

// ─── Reports ─────────────────────────────────────────────────────────────────

model Report {
  id                String           @id @default(uuid())
  organisationId    String?
  title             String?
  templateId        String
  templateVersionId String?
  campusId          String
  orgGroupId        String
  period            String?
  periodType        ReportPeriodType
  periodYear        Int
  periodMonth       Int?
  periodWeek        Int?
  status            ReportStatus     @default(DRAFT)
  createdById       String?
  submittedById     String?
  reviewedById      String?
  approvedById      String?
  deadline          DateTime?
  lockedAt          DateTime?
  isDataEntry       Boolean          @default(false)
  dataEntryById     String?
  dataEntryDate     DateTime?
  notes             String?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  // Relations
  template    ReportTemplate @relation("ReportTemplate", fields: [templateId], references: [id])
  campus      Campus         @relation("ReportCampus", fields: [campusId], references: [id])
  orgGroup    OrgGroup       @relation("ReportOrgGroup", fields: [orgGroupId], references: [id])
  createdBy   User?          @relation("ReportCreator", fields: [createdById], references: [id])
  submittedBy User?          @relation("ReportSubmitter", fields: [submittedById], references: [id])
  reviewedBy  User?          @relation("ReportReviewer", fields: [reviewedById], references: [id])
  approvedBy  User?          @relation("ReportApprover", fields: [approvedById], references: [id])
  dataEntryBy User?          @relation("DataEntryCreator", fields: [dataEntryById], references: [id])

  sections       ReportSection[]
  edits          ReportEdit[]
  updateRequests ReportUpdateRequest[]
  events         ReportEvent[]
  versions       ReportVersion[]

  @@index([campusId])
  @@index([orgGroupId])
  @@index([templateId])
  @@index([status])
  @@index([periodYear, periodMonth])
  @@map("reports")
}

model ReportSection {
  id                String @id @default(uuid())
  reportId          String
  templateSectionId String
  sectionName       String

  // Relations
  report  Report         @relation(fields: [reportId], references: [id], onDelete: Cascade)
  metrics ReportMetric[]

  @@index([reportId])
  @@map("report_sections")
}

model ReportMetric {
  id                 String                @id @default(uuid())
  reportSectionId    String
  templateMetricId   String
  metricName         String
  calculationType    MetricCalculationType @default(SUM)
  monthlyGoal        Float?
  monthlyAchieved    Float?
  yoyGoal            Float?
  computedPercentage Float?
  isLocked           Boolean               @default(false)
  lockedAt           DateTime?
  lockedById         String?
  comment            String?

  // Relations
  section        ReportSection        @relation(fields: [reportSectionId], references: [id], onDelete: Cascade)
  templateMetric ReportTemplateMetric @relation(fields: [templateMetricId], references: [id])
  lockedBy       User?                @relation("MetricLocker", fields: [lockedById], references: [id])

  @@index([reportSectionId])
  @@index([templateMetricId])
  @@map("report_metrics")
}

// ─── Report Edits & Update Requests ──────────────────────────────────────────

model ReportEdit {
  id            String           @id @default(uuid())
  reportId      String
  submittedById String
  status        ReportEditStatus @default(DRAFT)
  reason        String
  sections      Json
  reviewedById  String?
  reviewNotes   String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  // Relations
  report      Report @relation(fields: [reportId], references: [id], onDelete: Cascade)
  submittedBy User   @relation("EditSubmitter", fields: [submittedById], references: [id])
  reviewedBy  User?  @relation("EditReviewer", fields: [reviewedById], references: [id])

  @@index([reportId])
  @@map("report_edits")
}

model ReportUpdateRequest {
  id            String                    @id @default(uuid())
  reportId      String
  requestedById String
  reason        String
  sections      Json
  status        ReportUpdateRequestStatus @default(PENDING)
  reviewedById  String?
  reviewNotes   String?
  createdAt     DateTime                  @default(now())
  updatedAt     DateTime                  @updatedAt

  // Relations
  report      Report @relation(fields: [reportId], references: [id], onDelete: Cascade)
  requestedBy User   @relation("UpdateRequester", fields: [requestedById], references: [id])
  reviewedBy  User?  @relation("UpdateReviewer", fields: [reviewedById], references: [id])

  @@index([reportId])
  @@map("report_update_requests")
}

// ─── Audit Trail ─────────────────────────────────────────────────────────────

model ReportEvent {
  id             String          @id @default(uuid())
  reportId       String
  eventType      ReportEventType
  actorId        String
  timestamp      DateTime        @default(now())
  details        String?
  previousStatus ReportStatus?
  newStatus      ReportStatus?
  snapshotId     String?

  // Relations
  report Report @relation(fields: [reportId], references: [id], onDelete: Cascade)
  actor  User   @relation("EventActor", fields: [actorId], references: [id])

  @@index([reportId])
  @@index([eventType])
  @@map("report_events")
}

model ReportVersion {
  id            String   @id @default(uuid())
  reportId      String
  versionNumber Int
  snapshot      Json
  createdAt     DateTime @default(now())
  createdById   String
  reason        String?

  // Relations
  report    Report @relation(fields: [reportId], references: [id], onDelete: Cascade)
  createdBy User   @relation("VersionCreator", fields: [createdById], references: [id])

  @@index([reportId])
  @@map("report_versions")
}

// ─── Goals ───────────────────────────────────────────────────────────────────

model Goal {
  id               String    @id @default(uuid())
  campusId         String
  orgGroupId       String?
  templateId       String?
  templateMetricId String
  metricName       String
  mode             GoalMode  @default(ANNUAL)
  year             Int
  month            Int?
  targetValue      Float
  isLocked         Boolean   @default(false)
  lockedAt         DateTime?
  lockedById       String?
  createdById      String
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  campus         Campus               @relation("GoalCampus", fields: [campusId], references: [id])
  orgGroup       OrgGroup?            @relation("GoalOrgGroup", fields: [orgGroupId], references: [id])
  template       ReportTemplate?      @relation("GoalTemplateMetric", fields: [templateId], references: [id])
  templateMetric ReportTemplateMetric @relation("GoalMetric", fields: [templateMetricId], references: [id])
  createdBy      User                 @relation("GoalCreator", fields: [createdById], references: [id])
  lockedBy       User?                @relation("GoalLocker", fields: [lockedById], references: [id])
  editRequests   GoalEditRequest[]

  @@index([campusId, templateMetricId, year])
  @@map("goals")
}

model GoalEditRequest {
  id            String                @id @default(uuid())
  goalId        String
  requestedById String
  reason        String
  proposedValue Float
  status        GoalEditRequestStatus @default(PENDING)
  reviewedById  String?
  reviewNotes   String?
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt

  // Relations
  goal        Goal  @relation(fields: [goalId], references: [id], onDelete: Cascade)
  requestedBy User  @relation("GoalEditRequester", fields: [requestedById], references: [id])
  reviewedBy  User? @relation("GoalEditReviewer", fields: [reviewedById], references: [id])

  @@index([goalId])
  @@map("goal_edit_requests")
}

// ─── Metric Entries (aggregated snapshots) ───────────────────────────────────

model MetricEntry {
  id                 String   @id @default(uuid())
  reportMetricId     String?
  templateMetricId   String
  campusId           String
  year               Int
  month              Int
  goalValue          Float?
  achievedValue      Float?
  comment            String?
  computedPercentage Float?
  createdAt          DateTime @default(now())

  // Relations
  templateMetric ReportTemplateMetric @relation(fields: [templateMetricId], references: [id])
  campus         Campus               @relation("MetricEntryCampus", fields: [campusId], references: [id])

  @@index([campusId, templateMetricId, year, month])
  @@map("metric_entries")
}

// ─── Notifications ───────────────────────────────────────────────────────────

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  relatedId String?
  reportId  String?
  read      Boolean          @default(false)
  readAt    DateTime?
  createdAt DateTime         @default(now())

  // Relations
  user User @relation("NotificationRecipient", fields: [userId], references: [id])

  @@index([userId, read])
  @@map("notifications")
}

// ─── Invite Links ────────────────────────────────────────────────────────────

model InviteLink {
  id          String         @id @default(uuid())
  token       String         @unique
  type        InviteLinkType
  targetId    String?
  targetRole  UserRole?
  campusId    String?
  groupId     String?
  note        String?
  createdById String
  usedAt      DateTime?
  expiresAt   DateTime?
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())

  // Relations
  createdBy User @relation("InviteLinkCreator", fields: [createdById], references: [id])

  @@index([token])
  @@map("invite_links")
}

// ─── Bug Reports ─────────────────────────────────────────────────────────────

enum BugReportStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum BugReportCategory {
  UI_DISPLAY
  NAVIGATION
  DATA_ISSUE
  PERFORMANCE
  AUTHENTICATION
  REPORT_SUBMISSION
  NOTIFICATION
  OTHER
}

model BugReport {
  id            String            @id @default(uuid())
  category      BugReportCategory
  description   String
  screenshotUrl String?
  contactEmail  String
  status        BugReportStatus   @default(OPEN)
  adminNotes    String?
  createdById   String
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  // Relations
  createdBy User @relation("BugReportCreator", fields: [createdById], references: [id])

  @@index([status])
  @@index([createdById])
  @@map("bug_reports")
}
````

## File: providers/AntdProvider.tsx
````typescript
"use client";

import { App, ConfigProvider, theme } from "antd";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { getAntdTheme } from "@/lib/design-system/antd-theme";

interface AntdProviderProps {
  children: ReactNode;
}

export function AntdProvider({ children }: AntdProviderProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const dsTheme = getAntdTheme(isDark);

  return (
    <ConfigProvider
      theme={{
        ...dsTheme,
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
````

## File: app/(auth)/join/page.tsx
````typescript
"use client";

/**
 * app/(auth)/join/page.tsx
 * Invite-link registration flow.
 * Reads ?token= from URL, validates the invite, then presents a registration form.
 * On submit → POST /api/auth/register with inviteToken, which assigns role/campus.
 */

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Form, Alert, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { CONTENT } from "@/config/content";
import { API_ROUTES, APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/* ── Invite metadata returned by GET /api/invite-links/[token] ───────────── */

interface InviteMeta {
  token: string;
  targetRole: string;
  campusId?: string;
  groupId?: string;
  expiresAt: string;
}

/* ── Registration form values ─────────────────────────────────────────────── */

interface JoinFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/* ── Success redirect with countdown ──────────────────────────────────────── */

function SuccessRedirect({ router }: { router: ReturnType<typeof useRouter> }) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (seconds <= 0) {
      router.push(APP_ROUTES.login);
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, router]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <CheckCircleOutlined className="text-4xl text-ds-brand-accent" />
      <h2 className="text-lg font-semibold text-ds-text-primary">
        {(CONTENT.auth.registrationSuccessTitle as string) ?? "Account Created!"}
      </h2>
      <p className="text-sm text-ds-text-secondary">
        {(CONTENT.auth.registrationSuccessMessage as string) ??
          "Your account is ready. Please log in."}
      </p>
      <p className="text-xs text-ds-text-subtle">
        {(CONTENT.auth.redirectingIn as string) ?? "Redirecting to login in"} {seconds}s…
      </p>
      <Button type="primary" onClick={() => router.push(APP_ROUTES.login)}>
        {CONTENT.auth.loginButton as string}
      </Button>
    </div>
  );
}

/* ── Inner component — uses useSearchParams (must be inside Suspense) ─────── */

function JoinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [invite, setInvite] = useState<InviteMeta | null>(null);
  const [status, setStatus] = useState<
    "loading" | "valid" | "invalid" | "expired" | "used" | "done"
  >("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [form] = Form.useForm<JoinFormValues>();

  /* Validate invite token on mount */
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setErrorMsg("No invite token found in this URL.");
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(API_ROUTES.inviteLinks.validate(token));
        const json = await res.json();
        if (!res.ok || !json.success) {
          const errText = (json.error ?? "") as string;
          if (errText.toLowerCase().includes("expired")) {
            setStatus("expired");
          } else if (errText.toLowerCase().includes("already been used")) {
            setStatus("used");
          } else {
            setStatus("invalid");
          }
          setErrorMsg(errText || "This invite link is invalid or has expired.");
        } else {
          setInvite(json.data);
          setStatus("valid");
        }
      } catch {
        setStatus("invalid");
        setErrorMsg((CONTENT.errors as Record<string, string>).generic ?? "Something went wrong.");
      }
    };

    validate();
  }, [token]);

  /* Submit registration */
  const handleSubmit = async (values: JoinFormValues) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([
        { name: "confirmPassword", errors: [CONTENT.auth.errors.passwordsDoNotMatch as string] },
      ]);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          inviteToken: token,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      setStatus("done");
    } catch {
      setErrorMsg((CONTENT.errors as Record<string, string>).generic ?? "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Spin size="large" />
        <p className="text-sm text-ds-text-secondary">Validating invite link…</p>
      </div>
    );
  }

  /* ── Invalid / expired / used ───────────────────────────────────────── */
  if (status === "invalid" || status === "expired" || status === "used") {
    const stateConfig = {
      expired: {
        icon: <ClockCircleOutlined className="text-4xl text-ds-state-warning" />,
        title: (CONTENT.auth.inviteExpiredTitle as string) ?? "Invite Link Expired",
        description:
          errorMsg ||
          "This invite link has expired. Please request a new one from your administrator.",
      },
      used: {
        icon: <ExclamationCircleOutlined className="text-4xl text-ds-text-subtle" />,
        title: (CONTENT.auth.inviteUsedTitle as string) ?? "Invite Already Used",
        description: errorMsg || "This invite link has already been used to create an account.",
      },
      invalid: {
        icon: <CloseCircleOutlined className="text-4xl text-ds-state-error" />,
        title: (CONTENT.auth.inviteInvalidTitle as string) ?? "Invalid Invite Link",
        description: errorMsg || "This invite link is invalid or has already been used.",
      },
    };
    const cfg = stateConfig[status];

    return (
      <div className="flex flex-col items-center gap-4 text-center">
        {cfg.icon}
        <h2 className="text-lg font-semibold text-ds-text-primary">{cfg.title}</h2>
        <p className="text-sm text-ds-text-secondary">{cfg.description}</p>
        <Button onClick={() => router.push(APP_ROUTES.login)}>
          {(CONTENT.auth.goToLogin as string) ?? "Go to Login"}
        </Button>
      </div>
    );
  }

  /* ── Success — auto-redirect with countdown ────────────────────────── */
  if (status === "done") {
    return <SuccessRedirect router={router} />;
  }

  /* ── Registration form ────────────────────────────────────────────────── */
  return (
    <>
      {/* Invite context banner */}
      {invite && (
        <div className="mb-5 px-4 py-3 bg-ds-brand-accent-subtle border border-ds-brand-accent rounded-ds-lg text-sm text-ds-text-primary">
          <span className="font-semibold">{CONTENT.auth.inviteRoleLabel as string}: </span>
          <span className="text-ds-brand-accent font-medium">{invite.targetRole}</span>
          {invite.campusId && (
            <span className="ml-3 text-ds-text-secondary">· Campus assigned</span>
          )}
        </div>
      )}

      {errorMsg && (
        <Alert
          type="error"
          message={errorMsg}
          showIcon
          closable
          className="mb-4"
          onClose={() => setErrorMsg("")}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="firstName"
            label={CONTENT.auth.firstNameLabel as string}
            rules={[{ required: true, message: "First name is required." }]}
          >
            <Input size="large" prefix={<UserOutlined className="text-ds-text-subtle" />} />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={CONTENT.auth.lastNameLabel as string}
            rules={[{ required: true, message: "Last name is required." }]}
          >
            <Input size="large" />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label={CONTENT.auth.emailLabel as string}
          rules={[
            { required: true, message: CONTENT.auth.errors.emailRequired as string },
            { type: "email", message: CONTENT.auth.errors.emailInvalid as string },
          ]}
        >
          <Input
            size="large"
            type="email"
            prefix={<MailOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.emailPlaceholder as string}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={CONTENT.auth.passwordLabel as string}
          rules={[
            { required: true, message: CONTENT.auth.errors.passwordRequired as string },
            { min: 8, message: CONTENT.auth.errors.passwordTooShort as string },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.passwordPlaceholder as string}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={CONTENT.auth.confirmPasswordLabel as string}
          rules={[{ required: true, message: "Please confirm your password." }]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.confirmPasswordLabel as string}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={submitting}
          className="mt-2"
        >
          {CONTENT.auth.registerButton as string}
        </Button>
      </Form>

      <p className="mt-4 text-center text-sm text-ds-text-secondary">
        {(CONTENT.auth.alreadyHaveAccount as string) ?? "Already have an account?"}{" "}
        <a href={APP_ROUTES.login} className="text-ds-brand-accent hover:underline font-medium">
          {CONTENT.auth.loginLink as string}
        </a>
      </p>
      <p className="mt-2 text-center text-xs text-ds-text-subtle">
        {CONTENT.auth.noInvite as string}{" "}
        <a href={APP_ROUTES.register} className="text-ds-brand-accent hover:underline">
          {CONTENT.auth.registerWithoutInvite as string}
        </a>
      </p>
    </>
  );
}

/* ── Layout wrapper ───────────────────────────────────────────────────────── */

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-ds-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Image
            src="/logo/dark-bg-harvesters-Logo.jpg"
            alt="Harvesters"
            width={56}
            height={56}
            className="rounded-ds-2xl mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-ds-text-primary tracking-tight">
            {CONTENT.auth.joinTitle as string}
          </h1>
          <p className="text-sm text-ds-text-secondary mt-1">
            {CONTENT.auth.joinSubtitle as string}
          </p>
        </div>

        {/* Card */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 shadow-ds-md">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            }
          >
            <JoinForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
````

## File: app/(dashboard)/analytics/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AnalyticsPage } from "@/modules/analytics";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const ANALYTICS_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CHURCH_MINISTRY,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.SPO,
];

export const metadata: Metadata = {
  title: CONTENT.analytics.pageTitle as string,
  description: CONTENT.seo.analyticsDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, ANALYTICS_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <AnalyticsPage />;
}
````

## File: app/(dashboard)/goals/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GoalsPage } from "@/modules/goals";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const GOALS_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.CHURCH_MINISTRY,
];

export const metadata: Metadata = {
  title: CONTENT.goals.pageTitle as string,
  description: CONTENT.seo.goalsDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, GOALS_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <GoalsPage />;
}
````

## File: app/(dashboard)/inbox/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InboxPage } from "@/modules/notifications";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const INBOX_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CHURCH_MINISTRY,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.SPO,
  UserRole.DATA_ENTRY,
];

export const metadata: Metadata = {
  title: CONTENT.notifications.pageTitle as string,
  description: CONTENT.seo.inboxDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, INBOX_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <InboxPage />;
}
````

## File: app/(dashboard)/invites/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InvitesPage } from "@/modules/users";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const INVITES_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
];

export const metadata: Metadata = {
  title: CONTENT.invites.pageTitle as string,
  description: CONTENT.seo.invitesDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, INVITES_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <InvitesPage />;
}
````

## File: app/(dashboard)/reports/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReportsListPage } from "@/modules/reports";
import { CONTENT } from "@/config/content";
import { verifyAuth } from "@/lib/utils/auth";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const REPORTS_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.CHURCH_MINISTRY,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.SPO,
  UserRole.DATA_ENTRY,
];

export const metadata: Metadata = {
  title: CONTENT.reports.pageTitle as string,
  description: CONTENT.seo.reportsDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, REPORTS_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <ReportsListPage />;
}
````

## File: app/(dashboard)/templates/[id]/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { TemplateDetailPage } from "@/modules/templates";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { CONTENT } from "@/config/content";
import { db } from "@/lib/data/db";

const TEMPLATES_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.CHURCH_MINISTRY,
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const template = await db.reportTemplate.findUnique({ where: { id }, select: { name: true } });
  return {
    title: template ? `${template.name} — Template` : (CONTENT.templates.pageTitle as string),
    description: CONTENT.seo.templateDetailDescription,
  };
}

export default async function Page({ params }: PageProps) {
  const auth = await verifyAuth(null, TEMPLATES_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <TemplateDetailPage params={params} />;
}
````

## File: app/(dashboard)/templates/new/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { TemplateNewPage } from "@/modules/templates";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { CONTENT } from "@/config/content";

const TEMPLATES_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.CHURCH_MINISTRY,
];

export const metadata: Metadata = {
  title: CONTENT.templates.newTemplate as string,
  description: CONTENT.seo.newTemplateDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, TEMPLATES_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <TemplateNewPage />;
}
````

## File: app/(dashboard)/templates/page.tsx
````typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/utils/auth";
import { TemplatesListPage } from "@/modules/templates";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";
import { CONTENT } from "@/config/content";

const TEMPLATES_ALLOWED_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.OFFICE_OF_CEO,
  UserRole.CHURCH_MINISTRY,
];

export const metadata: Metadata = {
  title: CONTENT.templates.pageTitle as string,
  description: CONTENT.seo.templatesDescription,
};

export default async function Page() {
  const auth = await verifyAuth(null, TEMPLATES_ALLOWED_ROLES);
  if (!auth.success) {
    redirect(APP_ROUTES.dashboard);
  }
  return <TemplatesListPage />;
}
````

## File: app/api/analytics/overview/route.ts
````typescript
/**
 * app/api/analytics/overview/route.ts
 * GET /api/analytics/overview
 *
 * Returns aggregated report-level metrics for the caller's scope.
 * Additionally returns quarterly compliance rates and goal achievement summary.
 *
 * Query params:
 *   campusId?  — filter to a single campus
 *   groupId?   — filter to a group
 *   year?      — filter by year (defaults to all)
 *   periodType? — filter by WEEKLY | MONTHLY | YEARLY
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus } from "@/types/global";

const QuerySchema = z.object({
    campusId: z.string().optional(),
    groupId: z.string().optional(),
    periodType: z.string().optional(),
    year: z.coerce.number().optional(),
});

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const query = QuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));

    const cacheKey = `analytics:overview:${auth.user.id}:${JSON.stringify(query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];

    /* ── Build Prisma where clause ─────────────────────────────────────── */
    const where: Record<string, unknown> = {};
    if (roleConfig?.reportVisibilityScope === "campus" && auth.user.campusId) {
        where.campusId = auth.user.campusId;
    }
    if (query.campusId) where.campusId = query.campusId;
    if (query.groupId) where.orgGroupId = query.groupId;
    if (query.periodType) where.periodType = query.periodType;
    if (query.year) where.periodYear = query.year;

    const reports = await db.report.findMany({ where });

    /* ── Status totals ─────────────────────────────────────────────────────── */
    const total = reports.length;
    const submitted = reports.filter((r) => r.status === ReportStatus.SUBMITTED).length;
    const approved = reports.filter((r) => r.status === ReportStatus.APPROVED).length;
    const reviewed = reports.filter((r) => r.status === ReportStatus.REVIEWED).length;
    const locked = reports.filter((r) => r.status === ReportStatus.LOCKED).length;
    const draft = reports.filter((r) => r.status === ReportStatus.DRAFT).length;
    const requiresEdits = reports.filter((r) => r.status === ReportStatus.REQUIRES_EDITS).length;

    const eligible = total - draft;
    const compliant = approved + reviewed + locked;
    const compliance = eligible > 0 ? Math.round((compliant / eligible) * 100) : 0;

    /* ── Submission trend — group by month (last 12) ───────────────────────── */
    const submissionsByMonth: Record<string, number> = {};
    for (const r of reports) {
        if (r.status !== ReportStatus.DRAFT && r.periodMonth != null) {
            const key = `${r.periodYear}-${String(r.periodMonth).padStart(2, "0")}`;
            submissionsByMonth[key] = (submissionsByMonth[key] ?? 0) + 1;
        }
    }
    const submissionTrend = Object.entries(submissionsByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, count]) => ({ month, count }));

    /* ── Quarterly compliance trend ─────────────────────────────────────────── */
    const quarterlyMap: Record<string, { submitted: number; approved: number }> = {};
    for (const r of reports) {
        if (r.periodMonth == null) continue;
        const q = Math.ceil(r.periodMonth / 3);
        const key = `${r.periodYear}-Q${q}`;
        if (!quarterlyMap[key]) quarterlyMap[key] = { submitted: 0, approved: 0 };
        if (r.status !== ReportStatus.DRAFT) quarterlyMap[key].submitted++;
        if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status as ReportStatus)) {
            quarterlyMap[key].approved++;
        }
    }
    const quarterlyTrend = Object.entries(quarterlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([quarter, stats]) => ({
            quarter,
            submitted: stats.submitted,
            approved: stats.approved,
            complianceRate: stats.submitted > 0 ? Math.round((stats.approved / stats.submitted) * 100) : 0,
        }));

    /* ── Status over months (for stacked bar) ──────────────────────────────── */
    const statusByMonth: Record<string, Record<string, number>> = {};
    for (const r of reports) {
        if (r.periodMonth == null) continue;
        const key = `${r.periodYear}-${String(r.periodMonth).padStart(2, "0")}`;
        if (!statusByMonth[key]) statusByMonth[key] = {};
        statusByMonth[key][r.status] = (statusByMonth[key][r.status] ?? 0) + 1;
    }
    const statusTrend = Object.entries(statusByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, statuses]) => ({ month, ...statuses }));

    /* ── Campus breakdown ──────────────────────────────────────────────────── */
    const campusMap: Record<string, { submitted: number; approved: number; total: number }> = {};
    for (const r of reports) {
        if (!campusMap[r.campusId]) campusMap[r.campusId] = { submitted: 0, approved: 0, total: 0 };
        campusMap[r.campusId].total++;
        if (r.status !== ReportStatus.DRAFT) campusMap[r.campusId].submitted++;
        if ([ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(r.status as ReportStatus)) {
            campusMap[r.campusId].approved++;
        }
    }
    const campusBreakdown = Object.entries(campusMap).map(([campusId, stats]) => ({
        campusId,
        total: stats.total,
        submitted: stats.submitted,
        approved: stats.approved,
        complianceRate: stats.submitted > 0 ? Math.round((stats.approved / stats.submitted) * 100) : 0,
    }));

    const data = {
        totals: { total, submitted, approved, reviewed, locked, draft, requiresEdits },
        compliance,
        submissionTrend,
        quarterlyTrend,
        statusTrend,
        campusBreakdown,
    };

    const response = { success: true, data };
    await cache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}
````

## File: app/api/auth/register/route.ts
````typescript
/**
 * app/api/auth/register/route.ts
 * POST /api/auth/register — public registration (creates MEMBER by default)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/data/db";
import {
    hashPassword,
    generateTokens,
    setAuthCookies,
} from "@/lib/utils/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api";
import { UserRole } from "@/types/global";

const RegisterSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    phone: z.string().optional(),
    inviteToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = RegisterSchema.parse(await req.json());

        /* Check for existing email */
        const existing = await db.user.findFirst({
            where: { email: { equals: body.email, mode: "insensitive" } },
        });
        if (existing) {
            return errorResponse("An account with this email already exists.", 409);
        }

        let role: UserRole = UserRole.MEMBER;
        let campusId: string | null = null;
        let orgGroupId: string | null = null;

        /* Process invite token if provided */
        if (body.inviteToken) {
            const invite = await db.inviteLink.findFirst({
                where: {
                    token: body.inviteToken,
                    usedAt: null,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!invite) {
                return errorResponse("This invite link is invalid or has expired.", 400);
            }
            role = invite.targetRole as UserRole ?? UserRole.MEMBER;
            campusId = invite.campusId ?? null;
            orgGroupId = invite.groupId ?? null;

            /* Mark invite as used */
            await db.inviteLink.update({
                where: { id: invite.id },
                data: { usedAt: new Date() },
            });
        }

        const now = new Date();
        const userId = crypto.randomUUID();
        const hashed = await hashPassword(body.password);

        const user = await db.user.create({
            data: {
                id: userId,
                organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email.toLowerCase(),
                phone: body.phone ?? null,
                role,
                campusId,
                orgGroupId,
                isActive: true,
                passwordHash: hashed,
                createdAt: now,
                updatedAt: now,
            },
        });

        if (!user) return errorResponse("Registration failed. Please try again.", 500);

        const tokens = generateTokens({
            id: user.id,
            role: user.role as UserRole,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            campusId: user.campusId ?? undefined,
            orgGroupId: user.orgGroupId ?? undefined,
        });

        const response = NextResponse.json(
            successResponse({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role as UserRole,
                    campusId: user.campusId ?? undefined,
                    orgGroupId: user.orgGroupId ?? undefined,
                } satisfies AuthUser,
            }),
            { status: 201 },
        );

        await setAuthCookies(tokens);
        return response;
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/auth/reset-password/route.ts
````typescript
/**
 * app/api/auth/reset-password/route.ts
 * POST /api/auth/reset-password
 * Validates reset token and sets new password.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, cache } from "@/lib/data/db";
import { hashPassword } from "@/lib/utils/auth";

const Schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
});

export async function POST(req: NextRequest) {
    const body = Schema.parse(await req.json());

    /* Retrieve cached token */
    const raw = await cache.get(`pwd-reset:${body.token}`);
    if (!raw) {
        return NextResponse.json(
            { success: false, error: "This reset link is invalid or has expired." },
            { status: 400 },
        );
    }

    const { userId, expiresAt } = (typeof raw === 'string' ? JSON.parse(raw) : raw) as { userId: string; expiresAt: string };

    if (new Date(expiresAt) < new Date()) {
        await cache.del(`pwd-reset:${body.token}`);
        return NextResponse.json(
            { success: false, error: "This reset link has expired." },
            { status: 400 },
        );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const hashed = await hashPassword(body.password);

    await db.user.update({
        where: { id: userId },
        data: { passwordHash: hashed, updatedAt: new Date() },
    });

    /* Invalidate the token so it cannot be reused */
    await cache.del(`pwd-reset:${body.token}`);

    return NextResponse.json({ success: true, message: "Password reset successfully. You can now log in." });
}
````

## File: app/api/goals/[id]/route.ts
````typescript
/**
 * app/api/goals/[id]/route.ts
 * GET    /api/goals/:id
 * PUT    /api/goals/:id  — update target value (must not be locked)
 * DELETE /api/goals/:id  — SUPERADMIN only
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const READ_ROLES: UserRole[] = [
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.CAMPUS_PASTOR,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.SUPERADMIN,
];

const WRITE_ROLES: UserRole[] = [
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.SUPERADMIN,
];

const UpdateGoalSchema = z.object({
    targetValue: z.number().min(0).optional(),
    isLocked: z.boolean().optional(),
});

interface RouteCtx { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteCtx) {
    const auth = await verifyAuth(req, READ_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { id } = await params;
    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

    return NextResponse.json({ success: true, data: goal });
}

export async function PUT(req: NextRequest, { params }: RouteCtx) {
    const auth = await verifyAuth(req, WRITE_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { id } = await params;
    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

    if (goal.isLocked && auth.user.role !== UserRole.SUPERADMIN) {
        return NextResponse.json(
            { success: false, error: "Goal is locked. Submit an unlock request." },
            { status: 403 },
        );
    }

    const body = UpdateGoalSchema.parse(await req.json());
    const updated = await db.goal.update({
        where: { id },
        data: body,
    });

    return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, { params }: RouteCtx) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { id } = await params;
    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

    await db.goal.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null });
}
````

## File: app/api/goals/[id]/unlock-request/route.ts
````typescript
/**
 * app/api/goals/[id]/unlock-request/route.ts
 * POST /api/goals/:id/unlock-request  — request permission to edit a locked goal
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole, GoalEditRequestStatus } from "@/types/global";

const UnlockRequestSchema = z.object({
    reason: z.string().min(10),
    proposedValue: z.number().min(0),
});

interface RouteCtx { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteCtx) {
    const auth = await verifyAuth(req, [
        UserRole.GROUP_ADMIN,
        UserRole.GROUP_PASTOR,
        UserRole.SPO,
        UserRole.CEO,
        UserRole.CHURCH_MINISTRY,
        UserRole.SUPERADMIN,
    ]);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { id } = await params;
    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

    if (!goal.isLocked) {
        return NextResponse.json(
            { success: false, error: "Goal is not locked — edit it directly." },
            { status: 400 },
        );
    }

    const body = UnlockRequestSchema.parse(await req.json());

    const editRequest = await db.goalEditRequest.create({
        data: {
            goalId: id,
            requestedById: auth.user.id,
            reason: body.reason,
            proposedValue: body.proposedValue,
            status: GoalEditRequestStatus.PENDING,
        },
    });

    return NextResponse.json({ success: true, data: editRequest }, { status: 201 });
}
````

## File: app/api/invite-links/route.ts
````typescript
/**
 * app/api/invite-links/route.ts
 * POST /api/invite-links  — create invite link (SUPERADMIN + leaders)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole, InviteLinkType, HIERARCHY_ORDER } from "@/types/global";

const ALLOWED_ROLES = [
  UserRole.SUPERADMIN,
  UserRole.CAMPUS_ADMIN,
  UserRole.CAMPUS_PASTOR,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
];

const CreateInviteLinkSchema = z.object({
  targetRole: z.nativeEnum(UserRole),
  campusId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  expiresInHours: z.coerce.number().min(1).max(720).default(72),
  note: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req, ALLOWED_ROLES);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const links = await db.inviteLink.findMany({
    where: { createdById: auth.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: links });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req, ALLOWED_ROLES);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
  }

  const body = CreateInviteLinkSchema.parse(await req.json());

  // Enforce role hierarchy: user can only invite roles below them (except SUPERADMIN who can invite any)
  const creatorOrder = HIERARCHY_ORDER[auth.user.role];
  const targetOrder = HIERARCHY_ORDER[body.targetRole];
  if (auth.user.role !== UserRole.SUPERADMIN && targetOrder <= creatorOrder) {
    return NextResponse.json(
      { success: false, error: "Cannot create invite for a role at or above your level" },
      { status: 403 },
    );
  }

  const expiresAt = new Date(Date.now() + body.expiresInHours * 3600 * 1000).toISOString();
  const token = crypto.randomUUID().replace(/-/g, "");

  const link = await db.inviteLink.create({
    data: {
      token,
      type: InviteLinkType.DIRECT,
      targetRole: body.targetRole,
      campusId: body.campusId,
      groupId: body.groupId,
      createdById: auth.user.id,
      expiresAt,
      note: body.note,
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, data: link }, { status: 201 });
}
````

## File: app/api/notifications/route.ts
````typescript
/**
 * app/api/notifications/route.ts
 * GET  /api/notifications      — list notifications for current user
 * POST /api/notifications/read-all — mark all as read
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { successResponse, unauthorizedResponse, handleApiError } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return unauthorizedResponse(auth.error);

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const cacheKey = `notifications:${auth.user.id}${unreadOnly ? ":unread" : ""}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(successResponse(cached));

    const where: { userId: string; read?: boolean } = { userId: auth.user.id };
    if (unreadOnly) where.read = false;

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    await cache.set(cacheKey, JSON.stringify(notifications), 30);
    return NextResponse.json(successResponse(notifications));
  } catch (err) {
    return handleApiError(err);
  }
}
````

## File: app/api/org/campuses/route.ts
````typescript
/**
 * app/api/org/campuses/route.ts
 * GET  /api/org/campuses  — list campuses (all authenticated users)
 * POST /api/org/campuses  — create campus (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const CreateCampusSchema = z.object({
    name: z.string().min(1).max(80),
    country: z.string().min(1).max(60).optional(),
    location: z.string().max(120).optional(),
    groupId: z.string().uuid().optional(),
    organisationId: z.string().min(1),
    adminId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cached = await cache.get("org:campuses:list");
    if (cached) return NextResponse.json(cached);

    const campuses = await db.campus.findMany({ orderBy: { name: "asc" } });
    const response = { success: true, data: campuses };
    await cache.set("org:campuses:list", JSON.stringify(response), 120);
    return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = CreateCampusSchema.parse(await req.json());

    const campus = await db.campus.create({
        data: {
            name: body.name,
            parentId: body.groupId ?? "",
            country: body.country ?? "",
            location: body.location ?? "",
            adminId: body.adminId,
            isActive: true,
        },
    });

    await cache.invalidatePattern("org:campuses:*");
    return NextResponse.json({ success: true, data: campus }, { status: 201 });
}
````

## File: app/api/org/groups/route.ts
````typescript
/**
 * app/api/org/groups/route.ts
 * GET  /api/org/groups  — list org groups
 * POST /api/org/groups  — create group (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

const CreateGroupSchema = z.object({
    name: z.string().min(1).max(80),
    country: z.string().max(60).optional(),
    organisationId: z.string().min(1),
    leaderId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cached = await cache.get("org:groups:list");
    if (cached) return NextResponse.json(cached);

    const groups = await db.orgGroup.findMany({ orderBy: { name: "asc" } });
    const response = { success: true, data: groups };
    await cache.set("org:groups:list", JSON.stringify(response), 120);
    return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = CreateGroupSchema.parse(await req.json());

    const group = await db.orgGroup.create({
        data: {
            name: body.name,
            country: body.country ?? "",
            leaderId: body.leaderId,
        },
    });

    await cache.invalidatePattern("org:groups:*");
    return NextResponse.json({ success: true, data: group }, { status: 201 });
}
````

## File: app/api/report-templates/[id]/route.ts
````typescript
/**
 * app/api/report-templates/[id]/route.ts
 * GET /api/report-templates/:id  — get single template with sections + metrics
 * PUT /api/report-templates/:id  — update template, replacing sections + metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole, MetricFieldType, MetricCalculationType } from "@/types/global";

/* ── Schemas ──────────────────────────────────────────────────────────────── */

const MetricSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    fieldType: z.nativeEnum(MetricFieldType).default(MetricFieldType.NUMBER),
    calculationType: z.nativeEnum(MetricCalculationType).default(MetricCalculationType.SUM),
    isRequired: z.boolean().default(true),
    capturesGoal: z.boolean().default(false),
    capturesAchieved: z.boolean().default(false),
    capturesYoY: z.boolean().default(false),
    order: z.number().int().min(1),
});

const SectionSchema = z.object({
    id: z.string().optional(),
    templateId: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().min(1),
    isRequired: z.boolean().default(true),
    metrics: z.array(MetricSchema).min(1),
});

const UpdateTemplateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    isDefault: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    sections: z.array(SectionSchema).optional(),
});

const TEMPLATE_MANAGE_ROLES: UserRole[] = [
    UserRole.SUPERADMIN,
    UserRole.CEO,
    UserRole.SPO,
    UserRole.CHURCH_MINISTRY,
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
];

/* ── GET /api/report-templates/:id ───────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = `templates:detail:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const template = await db.reportTemplate.findUnique({
        where: { id },
        include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
    });
    if (!template) {
        return NextResponse.json({ success: false, error: "Template not found." }, { status: 404 });
    }

    const response = { success: true, data: template };
    await cache.set(cacheKey, JSON.stringify(response), 120);
    return NextResponse.json(response);
}

/* ── PUT /api/report-templates/:id ───────────────────────────────────────── */

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req, TEMPLATE_MANAGE_ROLES);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = UpdateTemplateSchema.parse(await req.json());

    const existing = await db.reportTemplate.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ success: false, error: "Template not found." }, { status: 404 });
    }

    const updated = await db.$transaction(async (tx) => {
        if (body.isDefault) {
            await tx.reportTemplate.updateMany({
                where: { id: { not: id }, isDefault: true },
                data: { isDefault: false },
            });
        }

        await tx.reportTemplate.update({
            where: { id },
            data: {
                ...(body.name !== undefined && { name: body.name }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
                ...(body.isArchived !== undefined && { isActive: !body.isArchived }),
                version: { increment: 1 },
            },
        });

        /* Replace sections + metrics if provided */
        if (body.sections) {
            /* Delete old metrics then sections (cascade handles this via onDelete: Cascade) */
            await tx.reportTemplateSection.deleteMany({ where: { templateId: id } });

            for (const section of body.sections) {
                const sec = await tx.reportTemplateSection.create({
                    data: {
                        templateId: id,
                        name: section.name,
                        description: section.description,
                        order: section.order,
                        isRequired: section.isRequired,
                    },
                });
                for (const metric of section.metrics) {
                    await tx.reportTemplateMetric.create({
                        data: {
                            sectionId: sec.id,
                            name: metric.name,
                            description: metric.description,
                            fieldType: metric.fieldType,
                            calculationType: metric.calculationType,
                            isRequired: metric.isRequired,
                            capturesGoal: metric.capturesGoal,
                            capturesAchieved: metric.capturesAchieved,
                            capturesYoY: metric.capturesYoY,
                            order: metric.order,
                        },
                    });
                }
            }
        }

        /* Create a version snapshot */
        const full = await tx.reportTemplate.findUnique({
            where: { id },
            include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
        });
        await tx.reportTemplateVersion.create({
            data: {
                templateId: id,
                versionNumber: full!.version,
                snapshot: JSON.parse(JSON.stringify(full)),
                createdById: auth.user.id,
            },
        });

        return full;
    });

    await cache.invalidatePattern(`templates:detail:${id}`);
    await cache.invalidatePattern("templates:*");
    return NextResponse.json({ success: true, data: updated });
}
````

## File: app/api/report-templates/route.ts
````typescript
/**
 * app/api/report-templates/route.ts
 * GET  /api/report-templates  — list templates
 * POST /api/report-templates  — create template with sections + metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole, MetricFieldType, MetricCalculationType } from "@/types/global";

/* ── Schemas ──────────────────────────────────────────────────────────────── */

const MetricSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    fieldType: z.nativeEnum(MetricFieldType).default(MetricFieldType.NUMBER),
    calculationType: z.nativeEnum(MetricCalculationType).default(MetricCalculationType.SUM),
    isRequired: z.boolean().default(true),
    capturesGoal: z.boolean().default(false),
    capturesAchieved: z.boolean().default(false),
    capturesYoY: z.boolean().default(false),
    order: z.number().int().min(1),
});

const SectionSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().min(1),
    isRequired: z.boolean().default(true),
    metrics: z.array(MetricSchema).min(1),
});

const CreateTemplateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    organisationId: z.string().min(1),
    sections: z.array(SectionSchema).min(1),
    isDefault: z.boolean().optional().default(false),
});

const TEMPLATE_MANAGE_ROLES: UserRole[] = [
    UserRole.SUPERADMIN,
    UserRole.CEO,
    UserRole.SPO,
    UserRole.CHURCH_MINISTRY,
    UserRole.GROUP_PASTOR,
    UserRole.GROUP_ADMIN,
];

/* ── GET /api/report-templates ────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = "templates:list";
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const templates = await db.reportTemplate.findMany({
        orderBy: { createdAt: "desc" },
        include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
    });

    const response = { success: true, data: templates };
    await cache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}

/* ── POST /api/report-templates ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, TEMPLATE_MANAGE_ROLES);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = CreateTemplateSchema.parse(await req.json());

    const template = await db.$transaction(async (tx) => {
        if (body.isDefault) {
            await tx.reportTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        const tpl = await tx.reportTemplate.create({
            data: {
                name: body.name,
                description: body.description,
                organisationId: body.organisationId,
                createdById: auth.user.id,
                isActive: true,
                isDefault: body.isDefault ?? false,
            },
        });

        for (const section of body.sections) {
            const sec = await tx.reportTemplateSection.create({
                data: {
                    templateId: tpl.id,
                    name: section.name,
                    description: section.description,
                    order: section.order,
                    isRequired: section.isRequired,
                },
            });
            for (const metric of section.metrics) {
                await tx.reportTemplateMetric.create({
                    data: {
                        sectionId: sec.id,
                        name: metric.name,
                        description: metric.description,
                        fieldType: metric.fieldType,
                        calculationType: metric.calculationType,
                        isRequired: metric.isRequired,
                        capturesGoal: metric.capturesGoal,
                        capturesAchieved: metric.capturesAchieved,
                        capturesYoY: metric.capturesYoY,
                        order: metric.order,
                    },
                });
            }
        }

        return tx.reportTemplate.findUnique({
            where: { id: tpl.id },
            include: { sections: { include: { metrics: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
        });
    });

    await cache.invalidatePattern("templates:*");
    return NextResponse.json({ success: true, data: template }, { status: 201 });
}
````

## File: app/api/reports/[id]/history/route.ts
````typescript
/**
 * app/api/reports/[id]/history/route.ts
 * GET /api/reports/:id/history — get all events for a report
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
    errorResponse,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole } from "@/types/global";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        /* Scope check */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (roleConfig.reportVisibilityScope === "campus" && report.campusId !== auth.user.campusId) {
            return errorResponse("You do not have access to this report.", 403);
        }

        const cacheKey = `report:${id}:history`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(successResponse(cached));

        const events = await db.reportEvent.findMany({
            where: { reportId: id },
            orderBy: { timestamp: "desc" },
        });

        await cache.set(cacheKey, JSON.stringify(events), 60);
        return NextResponse.json(successResponse(events));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/reports/[id]/route.ts
````typescript
/**
 * app/api/reports/[id]/route.ts
 * GET /api/reports/:id  — get single report
 * PUT /api/reports/:id  — update report fields (DRAFT only)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";

/* ── Update schema ─────────────────────────────────────────────────────────── */

const UpdateReportSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    notes: z.string().optional(),
    sections: z.array(z.unknown()).optional(),
});

/* ── GET ───────────────────────────────────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;

        const cacheKey = `report:${id}`;
        const cached = await cache.get(cacheKey);
        if (cached) return NextResponse.json(successResponse(cached));

        const report = await db.report.findUnique({
            where: { id },
            include: { sections: { include: { metrics: true } } },
        });
        if (!report) return notFoundResponse("Report not found.");

        /* Scope check */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (roleConfig.reportVisibilityScope === "campus" && report.campusId !== auth.user.campusId) {
            return errorResponse("You do not have access to this report.", 403);
        }

        await cache.set(cacheKey, JSON.stringify(report), 60);
        return NextResponse.json(successResponse(report));
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── PUT ───────────────────────────────────────────────────────────────────── */

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const { id } = await params;

        const report = await db.report.findUnique({ where: { id } });
        if (!report) return notFoundResponse("Report not found.");

        /* Only DRAFT reports can be freely edited */
        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (!roleConfig.canFillReports) {
            return errorResponse("You do not have permission to edit reports.", 403);
        }
        if (report.status !== ReportStatus.DRAFT && report.status !== ReportStatus.REQUIRES_EDITS) {
            return errorResponse("Only draft or requires-edit reports can be updated.", 409);
        }

        const body = UpdateReportSchema.parse(await req.json());

        const updated = await db.$transaction(async (tx) => {
            const r = await tx.report.update({
                where: { id },
                data: {
                    ...(body.title !== undefined && { title: body.title }),
                    ...(body.notes !== undefined && { notes: body.notes }),
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: id,
                    eventType: ReportEventType.EDIT_APPLIED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                },
            });

            return r;
        });

        await cache.invalidatePattern(`report:${id}*`);
        await cache.invalidatePattern(`reports:list:${auth.user.id}:*`);

        return NextResponse.json(successResponse(updated));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/users/[id]/route.ts
````typescript
/**
 * app/api/users/[id]/route.ts
 * GET  /api/users/:id  — get user detail (SUPERADMIN)
 * PUT  /api/users/:id  — update user role / active status (SUPERADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

/* ── Update schema ────────────────────────────────────────────────────────── */

const UpdateUserSchema = z.object({
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
    campusId: z.string().uuid().nullable().optional(),
    groupId: z.string().uuid().nullable().optional(),
    phone: z.string().optional(),
});

/* ── GET /api/users/:id ───────────────────────────────────────────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = `users:detail:${id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const user = await db.user.findUnique({
        where: { id },
        omit: { passwordHash: true },
    });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const response = { success: true, data: user };
    await cache.set(cacheKey, JSON.stringify(response), 60);
    return NextResponse.json(response);
}

/* ── PUT /api/users/:id ───────────────────────────────────────────────────── */

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const body = UpdateUserSchema.parse(await req.json());

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    /* Protect the only SUPERADMIN — cannot deactivate or demote self */
    if (id === auth.user.id && (body.isActive === false || (body.role && body.role !== UserRole.SUPERADMIN))) {
        return NextResponse.json(
            { success: false, error: "Cannot demote or deactivate your own superadmin account." },
            { status: 403 },
        );
    }

    const updated = await db.user.update({
        where: { id },
        data: {
            ...(body.role !== undefined && { role: body.role }),
            ...(body.isActive !== undefined && { isActive: body.isActive }),
            ...(body.campusId !== undefined && { campusId: body.campusId }),
            ...(body.groupId !== undefined && { orgGroupId: body.groupId }),
            ...(body.phone !== undefined && { phone: body.phone }),
        },
        omit: { passwordHash: true },
    });

    await cache.invalidatePattern(`users:detail:${id}`);
    await cache.invalidatePattern("users:list:*");

    return NextResponse.json({ success: true, data: updated });
}
````

## File: app/api/users/route.ts
````typescript
/**
 * app/api/users/route.ts
 * GET  /api/users   — list all users (SUPERADMIN only)
 * POST /api/users   — create a user (SUPERADMIN only, direct creation without invite)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import { UserRole } from "@/types/global";

/* ── Query schema ─────────────────────────────────────────────────────────── */

const ListUsersSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(25),
    search: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    campusId: z.string().uuid().optional(),
    active: z.enum(["true", "false"]).optional(),
});

/* ── GET /api/users ───────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req, [UserRole.SUPERADMIN]);
    if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status ?? 401 });
    }

    const cacheKey = `users:list:${req.url}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        return NextResponse.json(cached);
    }

    const query = ListUsersSchema.parse(
        Object.fromEntries(new URL(req.url).searchParams),
    );

    /* Build Prisma where clause */
    const where: Record<string, unknown> = {};
    if (query.search) {
        where.OR = [
            { firstName: { contains: query.search, mode: "insensitive" } },
            { lastName: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
        ];
    }
    if (query.role) where.role = query.role;
    if (query.campusId) where.campusId = query.campusId;
    if (query.active !== undefined) where.isActive = query.active === "true";

    const [users, total] = await Promise.all([
        db.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
            omit: { passwordHash: true },
        }),
        db.user.count({ where }),
    ]);

    const response = { success: true, data: users, meta: { total, page: query.page, pageSize: query.pageSize } };
    await cache.set(cacheKey, JSON.stringify(response), 30);
    return NextResponse.json(response);
}
````

## File: app/manifest.ts
````typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Harvesters Reporting System",
        short_name: "HRS",
        description: "Central reporting system for Harvesters International Christian Centre",
        start_url: "/",
        display: "standalone",
        background_color: "#0A0A0B",
        theme_color: "#10b981",
        icons: [
            {
                src: "/logo/icon-192.svg",
                sizes: "192x192",
                type: "image/svg+xml",
            },
            {
                src: "/logo/icon-512.svg",
                sizes: "512x512",
                type: "image/svg+xml",
            },
            {
                src: "/logo/dark-bg-harvesters-Logo.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    };
}
````

## File: config/nav.ts
````typescript
/**
 * config/nav.ts
 * Single unified navigation item array with allowedRoles[] on every item.
 * Role determines which nav items are visible — no separate arrays per role.
 * Sidebar filters via getNavItems(role) which returns the filtered subset.
 */

import {
    AppstoreOutlined,
    BarChartOutlined,
    BellOutlined,
    BugOutlined,
    FileTextOutlined,
    LayoutOutlined,
    LinkOutlined,
    SettingOutlined as _SettingOutlined,
    TeamOutlined,
    ApartmentOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import { UserRole } from "@/types/global";
import { APP_ROUTES } from "./routes";
import { CONTENT } from "./content";

/* ── All dashboard nav items — filtered by role at render time ──────────── */

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
    {
        key: "dashboard",
        label: CONTENT.nav.dashboard,
        href: APP_ROUTES.dashboard,
        icon: AppstoreOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.DATA_ENTRY,
            UserRole.MEMBER,
        ],
    },
    {
        key: "reports",
        label: CONTENT.nav.reports,
        href: APP_ROUTES.reports,
        icon: FileTextOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.DATA_ENTRY,
        ],
    },
    {
        key: "analytics",
        label: CONTENT.nav.analytics,
        href: APP_ROUTES.analytics,
        icon: BarChartOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
        ],
    },
    {
        key: "inbox",
        label: CONTENT.nav.inbox,
        href: APP_ROUTES.inbox,
        icon: BellOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.DATA_ENTRY,
        ],
    },
    /* — Superadmin-only — */
    {
        key: "templates",
        label: CONTENT.nav.templates,
        href: APP_ROUTES.templates,
        icon: LayoutOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.SPO,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.CHURCH_MINISTRY,
        ],
    },
    {
        key: "users",
        label: CONTENT.nav.users,
        href: APP_ROUTES.users,
        icon: TeamOutlined,
        allowedRoles: [UserRole.SUPERADMIN],
    },
    {
        key: "org",
        label: CONTENT.nav.org,
        href: APP_ROUTES.org,
        icon: ApartmentOutlined,
        allowedRoles: [UserRole.SUPERADMIN],
    },
    {
        key: "goals",
        label: CONTENT.nav.goals,
        href: APP_ROUTES.goals,
        icon: TrophyOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.SPO,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.CHURCH_MINISTRY,
        ],
    },
    {
        key: "invites",
        label: CONTENT.nav.invites,
        href: APP_ROUTES.invites,
        icon: LinkOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
        ],
    },
    {
        key: "bug-reports",
        label: CONTENT.nav.bugReports,
        href: APP_ROUTES.bugReports,
        icon: BugOutlined,
        allowedRoles: [
            UserRole.SUPERADMIN,
            UserRole.CAMPUS_ADMIN,
            UserRole.CAMPUS_PASTOR,
            UserRole.GROUP_ADMIN,
            UserRole.GROUP_PASTOR,
            UserRole.CHURCH_MINISTRY,
            UserRole.CEO,
            UserRole.OFFICE_OF_CEO,
            UserRole.SPO,
            UserRole.DATA_ENTRY,
            UserRole.MEMBER,
        ],
    },
    {
        key: "bug-reports-manage",
        label: CONTENT.nav.bugReportsManage,
        href: APP_ROUTES.bugReportsManage,
        icon: BugOutlined,
        allowedRoles: [UserRole.SUPERADMIN],
    },
];

/* ── Backwards-compat exports (consumed by layouts during migration) ──────── */
/** @deprecated Use DASHBOARD_NAV_ITEMS instead */
export const LEADER_NAV_ITEMS = DASHBOARD_NAV_ITEMS;
/** @deprecated Use DASHBOARD_NAV_ITEMS instead */
export const SUPERADMIN_NAV_ITEMS = DASHBOARD_NAV_ITEMS;

/* ── Helper: filter nav items by role ───────────────────────────────────── */

export function getNavItems(role: UserRole): NavItem[] {
    return DASHBOARD_NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
}
````

## File: modules/reports/components/ReportSectionsForm.tsx
````typescript
"use client";

/**
 * modules/reports/components/ReportSectionsForm.tsx
 *
 * Shared template-sections form for ReportNewPage and ReportEditPage.
 *
 * Features:
 *  - Config-driven metric rows (no repeated JSX)
 *  - Goals pre-seeded from the goals API — read-only goal fields
 *  - Optional comment field per value (goal, achieved, yoy)
 *  - Live statistics panel: % of goal, vs YoY, section completion progress
 *  - Goal source badge (campus-monthly / campus-annual / group / not set)
 */

import { useMemo, useState } from "react";
import { Collapse, InputNumber, Tag, Tooltip, Progress } from "antd";
import {
  CheckCircleOutlined,
  LockOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { CONTENT } from "@/config/content";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricFieldType, MetricCalculationType, UserRole } from "@/types/global";
import { useRole } from "@/lib/hooks/useRole";
import type { GoalForMetric, GoalsForReportMap } from "@/app/api/goals/for-report/route";

const rk = CONTENT.reports as Record<string, unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** One metric's worth of editable + comment state */
export interface MetricValues {
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
  comment?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config-driven field descriptor for each capturable column
// ─────────────────────────────────────────────────────────────────────────────

interface FieldConfig {
  valueKey: keyof Pick<MetricValues, "monthlyGoal" | "monthlyAchieved" | "yoyGoal">;
  captureFlag: keyof Pick<
    ReportTemplateMetric,
    "capturesGoal" | "capturesAchieved" | "capturesYoY"
  >;
  labelKey: string;
  /** if true, value is pre-filled from the goals map and shown read-only */
  isGoalField: boolean;
}

const FIELD_CONFIGS: FieldConfig[] = [
  {
    valueKey: "monthlyAchieved",
    captureFlag: "capturesAchieved",
    labelKey: "fieldAchieved",
    isGoalField: false,
  },
  {
    valueKey: "monthlyGoal",
    captureFlag: "capturesGoal",
    labelKey: "fieldGoal",
    /** if true, value is pre-filled from the goals map and shown read-only */
    isGoalField: true,
  },
  {
    valueKey: "yoyGoal",
    captureFlag: "capturesYoY",
    labelKey: "fieldYoY",
    isGoalField: false,
  },
];

/**
 * Roles that can SEE the YoY field but NOT edit it.
 * (Campus-level: they need visibility for context but don't own the target)
 */
const YOY_READONLY_ROLES = new Set([UserRole.CAMPUS_PASTOR, UserRole.CAMPUS_ADMIN]);

/**
 * Roles that cannot see the YoY field at all.
 * (Operational / member roles with no strategic context)
 */
const YOY_HIDDEN_ROLES = new Set([UserRole.DATA_ENTRY, UserRole.MEMBER]);

// ─────────────────────────────────────────────────────────────────────────────
// Goal source badge config — object-driven
// ─────────────────────────────────────────────────────────────────────────────

const GOAL_SOURCE_LABELS: Record<GoalForMetric["source"], string> = {
  "campus-monthly": "Campus (monthly)",
  "campus-annual": "Campus (annual)",
  "group-monthly": "Group (monthly)",
  "group-annual": "Group (annual)",
};

const GOAL_SOURCE_COLORS: Record<GoalForMetric["source"], string> = {
  "campus-monthly": "green",
  "campus-annual": "blue",
  "group-monthly": "orange",
  "group-annual": "default",
};

// ─────────────────────────────────────────────────────────────────────────────
// Live-stats helpers
// ─────────────────────────────────────────────────────────────────────────────

function pct(achieved?: number, goal?: number): number | null {
  if (achieved == null || goal == null || goal === 0) return null;
  return Math.round((achieved / goal) * 100);
}

function pctStatus(p: number): "success" | "normal" | "exception" {
  if (p >= 100) return "success";
  if (p >= 70) return "normal";
  return "exception";
}

function yoyDelta(achieved?: number, yoy?: number): number | null {
  if (achieved == null || yoy == null || yoy === 0) return null;
  return Math.round(((achieved - yoy) / yoy) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// CommentToggle — collapsible comment textarea
// ─────────────────────────────────────────────────────────────────────────────

interface CommentToggleProps {
  value?: string;
  onChange: (v: string) => void;
  label: string;
  disabled?: boolean;
}

function CommentToggle({ value, onChange, label, disabled }: CommentToggleProps) {
  const [open, setOpen] = useState(true); // always open by default for easy entry

  return (
    <div className="mt-1">
      <button
        type="button"
        className={`text-[11px] flex items-center gap-1 transition-colors ${
          value
            ? "text-ds-brand-accent font-medium"
            : "text-ds-text-subtle hover:text-ds-text-secondary"
        }`}
        onClick={() => setOpen((p) => !p)}
        disabled={disabled}
      >
        <CommentOutlined className="text-[10px]" />
        {value ? `${label} ✓` : label}
      </button>
      {open && (
        <textarea
          className="mt-1.5 w-full text-xs rounded-ds-md border border-ds-border-base bg-ds-surface px-2.5 py-2 text-ds-text-primary placeholder:text-ds-text-subtle resize-none focus:outline-none focus:ring-1 focus:ring-ds-brand-accent transition-shadow"
          rows={2}
          placeholder={rk.commentPlaceholder as string}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MetricRow
// ─────────────────────────────────────────────────────────────────────────────

interface MetricRowProps {
  metric: ReportTemplateMetric;
  values: MetricValues;
  goalInfo?: GoalForMetric;
  onChange: (v: MetricValues) => void;
  disabled?: boolean;
}

function MetricRow({ metric, values, goalInfo, onChange, disabled }: MetricRowProps) {
  const isCurrency = metric.fieldType === MetricFieldType.CURRENCY;
  const isPercentage = metric.fieldType === MetricFieldType.PERCENTAGE;
  const prefix = isCurrency ? "₦" : undefined;

  // YoY visibility: hidden for DATA_ENTRY/MEMBER, read-only for CAMPUS_ADMIN/CAMPUS_PASTOR
  const { role } = useRole();
  const isYoyHidden = role ? YOY_HIDDEN_ROLES.has(role) : false;
  const isYoyReadOnly = role ? YOY_READONLY_ROLES.has(role) : false;

  const activeFields = FIELD_CONFIGS.filter(
    (f) => metric[f.captureFlag] && !(f.valueKey === "yoyGoal" && isYoyHidden),
  );

  // Live stats
  const livePct = pct(values.monthlyAchieved, values.monthlyGoal ?? goalInfo?.targetValue);
  const liveYoy = yoyDelta(values.monthlyAchieved, values.yoyGoal);

  const colClass =
    activeFields.length >= 3
      ? "grid-cols-3"
      : activeFields.length === 2
        ? "grid-cols-2"
        : "grid-cols-1";

  return (
    <div className="py-4 border-b border-ds-border-subtle last:border-none">
      <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-6">
        {/* Metric label column */}
        <div className="md:w-52 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-ds-text-primary">{metric.name}</span>
            {metric.isRequired && (
              <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wide">
                {rk.sectionRequired as string}
              </span>
            )}
            {isCurrency && (
              <Tag color="blue" className="text-[10px]">
                ₦
              </Tag>
            )}
            {isPercentage && (
              <Tag color="purple" className="text-[10px]">
                %
              </Tag>
            )}
          </div>
          {metric.description && (
            <p className="text-xs text-ds-text-subtle mt-0.5 leading-tight">{metric.description}</p>
          )}
          <span className="text-[10px] text-ds-text-subtle mt-1 inline-block">
            {metric.calculationType === MetricCalculationType.SUM
              ? "Σ cumulative"
              : metric.calculationType === MetricCalculationType.AVERAGE
                ? "∅ average"
                : "◎ snapshot"}
          </span>
          {/* Goal source badge */}
          {goalInfo && (
            <Tooltip
              title={`${rk.goalFromSource as string}: ${GOAL_SOURCE_LABELS[goalInfo.source]}`}
            >
              <Tag
                color={GOAL_SOURCE_COLORS[goalInfo.source]}
                className="mt-1 text-[10px] cursor-help"
                icon={goalInfo.isLocked ? <LockOutlined /> : <TrophyOutlined />}
              >
                {goalInfo.isLocked
                  ? (rk.goalLocked as string)
                  : GOAL_SOURCE_LABELS[goalInfo.source]}
              </Tag>
            </Tooltip>
          )}
          {!goalInfo && metric.capturesGoal && (
            <Tooltip title={rk.goalNotSet as string}>
              <Tag color="default" className="mt-1 text-[10px]">
                {rk.goalNotSet as string}
              </Tag>
            </Tooltip>
          )}
        </div>

        {/* Input / stats column */}
        {activeFields.length === 0 ? (
          <p className="text-xs text-ds-text-subtle italic self-center">
            {rk.sectionOptional as string}
          </p>
        ) : (
          <div className="flex-1 space-y-3">
            <div className={`grid ${colClass} gap-3`}>
              {activeFields.map(({ valueKey, labelKey, isGoalField }) => {
                const isGoalReadOnly = isGoalField && !!goalInfo;
                // YoY field: read-only for campus-level roles
                const isYoyFieldReadOnly = valueKey === "yoyGoal" && isYoyReadOnly;
                const isReadOnly = isGoalReadOnly || isYoyFieldReadOnly;

                const displayValue = isGoalReadOnly
                  ? goalInfo!.targetValue
                  : (values[valueKey] as number | undefined);

                return (
                  <div key={valueKey}>
                    <label className="text-xs text-ds-text-subtle block mb-1">
                      {rk[labelKey] as string}
                      {isGoalReadOnly && (
                        <Tooltip title={rk.goalPrefilledTooltip as string}>
                          <InfoCircleOutlined className="ml-1 text-ds-brand-accent cursor-help" />
                        </Tooltip>
                      )}
                      {isYoyFieldReadOnly && (
                        <Tooltip title="View only — YoY targets are set by group admins and above">
                          <LockOutlined className="ml-1 text-ds-text-subtle cursor-help" />
                        </Tooltip>
                      )}
                    </label>
                    <InputNumber
                      className="w-full"
                      prefix={prefix}
                      suffix={isPercentage ? "%" : undefined}
                      min={metric.minValue}
                      max={metric.maxValue}
                      value={displayValue}
                      disabled={disabled || isReadOnly}
                      placeholder="0"
                      onChange={(v) =>
                        !isReadOnly && onChange({ ...values, [valueKey]: v ?? undefined })
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* Single comment per metric */}
            <CommentToggle
              value={values.comment}
              onChange={(v) => onChange({ ...values, comment: v || undefined })}
              label={rk.metricComment as string}
              disabled={disabled}
            />

            {/* Live statistics row */}
            {(livePct !== null || liveYoy !== null) && (
              <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-ds-border-subtle">
                {livePct !== null && (
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <span className="text-[11px] text-ds-text-subtle whitespace-nowrap">
                      {rk.statVsGoal as string}
                    </span>
                    <div className="flex-1 min-w-[80px]">
                      <Progress
                        percent={Math.min(livePct, 100)}
                        size="small"
                        status={pctStatus(livePct)}
                        format={() => `${livePct}%`}
                        className="!mb-0"
                      />
                    </div>
                  </div>
                )}
                {liveYoy !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-ds-text-subtle">
                      {rk.statVsYoY as string}
                    </span>
                    <span
                      className={`text-xs font-semibold ${liveYoy >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {liveYoy >= 0 ? "+" : ""}
                      {liveYoy}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionPanel
// ─────────────────────────────────────────────────────────────────────────────

interface SectionPanelProps {
  section: ReportTemplateSection;
  metricValues: Record<string, MetricValues>;
  goalsMap: GoalsForReportMap;
  onMetricChange: (metricId: string, v: MetricValues) => void;
  disabled?: boolean;
}

function SectionPanel({
  section,
  metricValues,
  goalsMap,
  onMetricChange,
  disabled,
}: SectionPanelProps) {
  const requiredMetrics = section.metrics.filter((m) => m.isRequired && m.capturesAchieved);
  const filledRequired = requiredMetrics.filter(
    (m) => (metricValues[m.id]?.monthlyAchieved ?? 0) > 0,
  ).length;

  return (
    <div>
      {requiredMetrics.length > 0 && (
        <div className="pb-3 border-b border-ds-border-subtle mb-1">
          <Progress
            percent={Math.round((filledRequired / requiredMetrics.length) * 100)}
            size="small"
            format={() =>
              `${filledRequired}/${requiredMetrics.length} ${rk.requiredFilled as string}`
            }
            status={filledRequired === requiredMetrics.length ? "success" : "active"}
            className="!mb-0"
          />
        </div>
      )}
      {section.metrics.length === 0 ? (
        <p className="text-sm text-ds-text-subtle py-4 text-center">No metrics in this section.</p>
      ) : (
        [...section.metrics]
          .sort((a, b) => a.order - b.order)
          .map((metric) => (
            <MetricRow
              key={metric.id}
              metric={metric}
              values={metricValues[metric.id] ?? {}}
              goalInfo={goalsMap[metric.id]}
              onChange={(v) => onMetricChange(metric.id, v)}
              disabled={disabled}
            />
          ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LiveStatsPanel — overall form-level stats
// ─────────────────────────────────────────────────────────────────────────────

interface LiveStatsPanelProps {
  template: ReportTemplate;
  metricValues: Record<string, MetricValues>;
  goalsMap: GoalsForReportMap;
}

function LiveStatsPanel({ template, metricValues, goalsMap }: LiveStatsPanelProps) {
  const stats = useMemo(() => {
    let totalAchieved = 0;
    let totalGoal = 0;
    let totalYoy = 0;
    let metricsWithGoal = 0;

    for (const section of template.sections) {
      for (const metric of section.metrics) {
        if (!metric.capturesAchieved) continue;
        if (metric.calculationType !== MetricCalculationType.SUM) continue;
        const vals = metricValues[metric.id] ?? {};
        const achieved = vals.monthlyAchieved ?? 0;
        const goal = vals.monthlyGoal ?? goalsMap[metric.id]?.targetValue ?? 0;
        const yoy = vals.yoyGoal ?? 0;
        totalAchieved += achieved;
        totalGoal += goal;
        totalYoy += yoy;
        if (goal > 0) metricsWithGoal++;
      }
    }
    return { totalAchieved, totalGoal, totalYoy, metricsWithGoal };
  }, [template, metricValues, goalsMap]);

  const overallPct =
    stats.totalGoal > 0 ? Math.round((stats.totalAchieved / stats.totalGoal) * 100) : null;
  const yoyDeltaVal =
    stats.totalYoy > 0
      ? Math.round(((stats.totalAchieved - stats.totalYoy) / stats.totalYoy) * 100)
      : null;

  if (overallPct === null && yoyDeltaVal === null && stats.metricsWithGoal === 0) return null;

  return (
    <div className="p-4 bg-ds-surface-elevated rounded-ds-xl border border-ds-border-base">
      <div className="flex items-center gap-2 mb-3">
        <BulbOutlined className="text-ds-brand-accent" />
        <span className="text-xs font-semibold text-ds-text-primary uppercase tracking-wide">
          {rk.liveStats as string}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {overallPct !== null && (
          <div>
            <div className="text-[11px] text-ds-text-subtle mb-1">
              {rk.statOverallGoal as string}
            </div>
            <Progress
              percent={Math.min(overallPct, 100)}
              status={pctStatus(overallPct)}
              format={() => `${overallPct}%`}
            />
          </div>
        )}
        {yoyDeltaVal !== null && (
          <div>
            <div className="text-[11px] text-ds-text-subtle mb-1">{rk.statYoYGrowth as string}</div>
            <div
              className={`text-2xl font-bold font-ds-mono ${yoyDeltaVal >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {yoyDeltaVal >= 0 ? "+" : ""}
              {yoyDeltaVal}%
            </div>
          </div>
        )}
        {stats.metricsWithGoal > 0 && (
          <div>
            <div className="text-[11px] text-ds-text-subtle mb-1">
              {rk.statMetricsWithGoal as string}
            </div>
            <div className="text-2xl font-bold font-ds-mono text-ds-text-primary">
              {stats.metricsWithGoal}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReportSectionsForm — main export
// ─────────────────────────────────────────────────────────────────────────────

interface ReportSectionsFormProps {
  template: ReportTemplate;
  metricValues: Record<string, MetricValues>;
  goalsMap: GoalsForReportMap;
  onMetricChange: (metricId: string, v: MetricValues) => void;
  disabled?: boolean;
}

export function ReportSectionsForm({
  template,
  metricValues,
  goalsMap,
  onMetricChange,
  disabled,
}: ReportSectionsFormProps) {
  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);

  const collapseItems = sortedSections.map((section) => ({
    key: section.id,
    label: (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ds-text-primary">{section.name}</span>
        {section.isRequired ? (
          <Tag color="red" className="text-[10px]">
            {rk.sectionRequired as string}
          </Tag>
        ) : (
          <Tag color="default" className="text-[10px]">
            {rk.sectionOptional as string}
          </Tag>
        )}
        <span className="text-xs text-ds-text-subtle ml-auto">
          {section.metrics.length} metric{section.metrics.length !== 1 ? "s" : ""}
        </span>
      </div>
    ),
    children: (
      <SectionPanel
        section={section}
        metricValues={metricValues}
        goalsMap={goalsMap}
        onMetricChange={onMetricChange}
        disabled={disabled}
      />
    ),
  }));

  const totalMetrics = template.sections.reduce((n, s) => n + s.metrics.length, 0);
  const goalsCount = Object.keys(goalsMap).length;

  return (
    <div className="space-y-4">
      {/* Template + goals info banner */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-ds-surface rounded-ds-lg border border-ds-border-subtle text-xs text-ds-text-subtle">
        <CheckCircleOutlined className="text-ds-brand-accent" />
        <span>
          {rk.templateLabel as string}:{" "}
          <strong className="text-ds-text-primary">{template.name}</strong>
          {" · "}
          {template.sections.length} sections{" · "}
          {totalMetrics} metrics
        </span>
        {goalsCount > 0 && (
          <>
            <span className="text-ds-border-base">|</span>
            <span className="flex items-center gap-1">
              <TrophyOutlined className="text-ds-brand-accent" />
              {goalsCount} metric{goalsCount !== 1 ? "s" : ""} {rk.goalsPrefilledBadge as string}
            </span>
          </>
        )}
        {goalsCount === 0 && (
          <>
            <span className="text-ds-border-base">|</span>
            <span className="flex items-center gap-1 text-yellow-500">
              <InfoCircleOutlined />
              {rk.noGoalsSet as string}
            </span>
          </>
        )}
      </div>

      {/* Live stats panel */}
      <LiveStatsPanel template={template} metricValues={metricValues} goalsMap={goalsMap} />

      {/* Section collapse panels */}
      <div>
        <h2 className="text-xs font-semibold text-ds-text-secondary uppercase tracking-wide mb-3 px-1">
          {rk.metricsFormTitle as string}
        </h2>
        {collapseItems.length > 0 ? (
          <Collapse
            items={collapseItems}
            defaultActiveKey={collapseItems.map((i) => i.key)}
            className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl overflow-hidden"
          />
        ) : (
          <EmptyState title="No template sections" description="This template has no sections." />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: build sections payload for API
// ─────────────────────────────────────────────────────────────────────────────

export function buildSectionsPayload(
  template: ReportTemplate,
  metricValues: Record<string, MetricValues>,
  goalsMap: GoalsForReportMap = {},
) {
  return [...template.sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      templateSectionId: section.id,
      sectionName: section.name,
      metrics: [...section.metrics]
        .sort((a, b) => a.order - b.order)
        .map((metric) => {
          const vals = metricValues[metric.id] ?? {};
          const goal = goalsMap[metric.id];
          return {
            templateMetricId: metric.id,
            metricName: metric.name,
            calculationType: metric.calculationType,
            isLocked: false,
            monthlyGoal: goal?.targetValue ?? vals.monthlyGoal,
            monthlyAchieved: vals.monthlyAchieved,
            yoyGoal: vals.yoyGoal,
            comment: vals.comment,
          };
        }),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: parse existing report sections → metricValues map
// ─────────────────────────────────────────────────────────────────────────────

export function parseSectionsToMetricValues(sections: unknown[]): Record<string, MetricValues> {
  const map: Record<string, MetricValues> = {};
  const typedSections = sections as Array<{
    templateSectionId: string;
    metrics: Array<{
      templateMetricId: string;
      monthlyGoal?: number;
      monthlyAchieved?: number;
      yoyGoal?: number;
      comment?: string;
    }>;
  }>;
  for (const sec of typedSections) {
    for (const m of sec.metrics ?? []) {
      map[m.templateMetricId] = {
        monthlyGoal: m.monthlyGoal,
        monthlyAchieved: m.monthlyAchieved,
        yoyGoal: m.yoyGoal,
        comment: m.comment,
      };
    }
  }
  return map;
}

export type { GoalsForReportMap, GoalForMetric };
````

## File: modules/reports/index.ts
````typescript
/**
 * modules/reports/index.ts
 * Public barrel — export components and services only.
 * Domain types live exclusively in types/global.d.ts.
 */
export { ReportDetailPage } from "./components/ReportDetailPage";
export { ReportsListPage }  from "./components/ReportsListPage";
export { ReportNewPage }    from "./components/ReportNewPage";
export { ReportEditPage }   from "./components/ReportEditPage";
export { ReportSectionsForm, buildSectionsPayload, parseSectionsToMetricValues } from "./components/ReportSectionsForm";
export { ExportDialog }     from "./components/ExportDialog";
````

## File: modules/templates/components/TemplateDetailPage.tsx
````typescript
"use client";

/**
 * modules/templates/components/TemplateDetailPage.tsx
 * View and edit an existing report template — sections → metrics structure.
 * SUPERADMIN only.
 */

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Modal, Switch, Select, Tag, Collapse, Badge } from "antd";
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  DragOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { MetricFieldType, MetricCalculationType } from "@/types/global";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const FIELD_TYPE_OPTIONS = [
  { value: MetricFieldType.NUMBER, label: "Number" },
  { value: MetricFieldType.PERCENTAGE, label: "Percentage (%)" },
  { value: MetricFieldType.CURRENCY, label: "Currency" },
  { value: MetricFieldType.TEXT, label: "Text" },
];

const CALC_TYPE_OPTIONS = [
  { value: MetricCalculationType.SUM, label: "Sum (cumulative)" },
  { value: MetricCalculationType.AVERAGE, label: "Average (rolling mean)" },
  { value: MetricCalculationType.SNAPSHOT, label: "Snapshot (last value)" },
];

interface DraftMetric {
  id: string;
  name: string;
  description: string;
  fieldType: MetricFieldType;
  calculationType: MetricCalculationType;
  isRequired: boolean;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
  order: number;
}

interface DraftSection {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  order: number;
  metrics: DraftMetric[];
}

type TemplateWithMeta = ReportTemplate & { isDefault?: boolean; isArchived?: boolean };

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MetricRowProps {
  metric: DraftMetric;
  onChange: (patch: Partial<DraftMetric>) => void;
  onRemove: () => void;
}

function MetricRow({ metric, onChange, onRemove }: MetricRowProps) {
  type BoolKey = "isRequired" | "capturesGoal" | "capturesAchieved" | "capturesYoY";
  const TOGGLES: { key: BoolKey; label: string }[] = [
    { key: "isRequired", label: CONTENT.templates.isRequiredLabel as string },
    { key: "capturesGoal", label: CONTENT.templates.capturesGoalLabel as string },
    { key: "capturesAchieved", label: CONTENT.templates.capturesAchievedLabel as string },
    { key: "capturesYoY", label: CONTENT.templates.capturesYoYLabel as string },
  ];

  return (
    <div className="p-4 bg-ds-surface-sunken rounded-ds-lg border border-ds-border-subtle space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.metricNameLabel as string} *
          </label>
          <Input
            size="middle"
            value={metric.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Total Attendance"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.fieldTypeLabel as string}
          </label>
          <Select
            size="middle"
            value={metric.fieldType}
            options={FIELD_TYPE_OPTIONS}
            onChange={(v) => onChange({ fieldType: v })}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ds-text-secondary block mb-1">
            {CONTENT.templates.calculationTypeLabel as string}
          </label>
          <Select
            size="middle"
            value={metric.calculationType}
            options={CALC_TYPE_OPTIONS}
            onChange={(v) => onChange({ calculationType: v })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap gap-4">
          {TOGGLES.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <Switch
                size="small"
                checked={metric[key] as boolean}
                onChange={(v) => onChange({ [key]: v })}
              />
              <span className="text-xs text-ds-text-secondary">{label}</span>
            </div>
          ))}
        </div>
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onRemove} />
      </div>
    </div>
  );
}

export function TemplateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [form] = Form.useForm();
  const [sections, setSections] = useState<DraftSection[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [goalPromptVisible, setGoalPromptVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: template } = useApiData<TemplateWithMeta>(API_ROUTES.reportTemplates.detail(id));

  if (template && !initialized) {
    form.setFieldsValue({
      name: template.name,
      description: template.description ?? "",
      isDefault: template.isDefault ?? false,
      isArchived: template.isArchived ?? false,
    });
    const rawSections = (template.sections ?? []) as ReportTemplateSection[];
    setSections(
      rawSections
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description ?? "",
          isRequired: s.isRequired,
          order: s.order,
          metrics: (s.metrics ?? [])
            .sort((a, b) => a.order - b.order)
            .map((m) => ({
              id: m.id,
              name: m.name,
              description: m.description ?? "",
              fieldType: m.fieldType,
              calculationType: m.calculationType,
              isRequired: m.isRequired,
              capturesGoal: m.capturesGoal,
              capturesAchieved: m.capturesAchieved,
              capturesYoY: m.capturesYoY,
              order: m.order,
            })),
        })),
    );
    setInitialized(true);
  }

  const updateSection = (sId: string, patch: Partial<DraftSection>) =>
    setSections((prev) => (prev ?? []).map((s) => (s.id === sId ? { ...s, ...patch } : s)));
  const removeSection = (sId: string) =>
    setSections((prev) => (prev ?? []).filter((s) => s.id !== sId));
  const addSection = () =>
    setSections((prev) => [
      ...(prev ?? []),
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        isRequired: true,
        order: (prev ?? []).length + 1,
        metrics: [],
      },
    ]);

  const updateMetric = (sId: string, mId: string, patch: Partial<DraftMetric>) =>
    setSections((prev) =>
      (prev ?? []).map((s) =>
        s.id === sId
          ? { ...s, metrics: s.metrics.map((m) => (m.id === mId ? { ...m, ...patch } : m)) }
          : s,
      ),
    );
  const removeMetric = (sId: string, mId: string) =>
    setSections((prev) =>
      (prev ?? []).map((s) =>
        s.id === sId ? { ...s, metrics: s.metrics.filter((m) => m.id !== mId) } : s,
      ),
    );
  const addMetric = (sId: string) =>
    setSections((prev) =>
      (prev ?? []).map((s) => {
        if (s.id !== sId) return s;
        return {
          ...s,
          metrics: [
            ...s.metrics,
            {
              id: crypto.randomUUID(),
              name: "",
              description: "",
              fieldType: MetricFieldType.NUMBER,
              calculationType: MetricCalculationType.SUM,
              isRequired: true,
              capturesGoal: true,
              capturesAchieved: true,
              capturesYoY: false,
              order: s.metrics.length + 1,
            },
          ],
        };
      }),
    );

  const handleSave = async (values: {
    name: string;
    description: string;
    isDefault: boolean;
    isArchived: boolean;
  }) => {
    const draft = sections ?? [];
    if (draft.find((s) => !s.name.trim())) {
      message.error("All sections must have a name.");
      return;
    }
    for (const s of draft) {
      if (s.metrics.find((m) => !m.name.trim())) {
        message.error(`All metrics in "${s.name}" must have a name.`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        ...values,
        sections: draft.map((s, si) => ({
          id: s.id,
          templateId: id,
          name: s.name.trim(),
          description: s.description || undefined,
          isRequired: s.isRequired,
          order: si + 1,
          metrics: s.metrics.map((m, mi) => ({
            id: m.id,
            sectionId: s.id,
            name: m.name.trim(),
            description: m.description || undefined,
            fieldType: m.fieldType,
            calculationType: m.calculationType,
            isRequired: m.isRequired,
            capturesGoal: m.capturesGoal,
            capturesAchieved: m.capturesAchieved,
            capturesYoY: m.capturesYoY,
            order: mi + 1,
          })),
        })),
      };
      const res = await fetch(API_ROUTES.reportTemplates.detail(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.templates.templateSaved as string);
      // Prompt to update goals if any metric captures a goal
      const hasGoalMetrics = draft.some((s) => s.metrics.some((m) => m.capturesGoal));
      if (hasGoalMetrics) setGoalPromptVisible(true);
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  if (template === undefined || !initialized) {
    return (
      <PageLayout title={CONTENT.templates.editTemplate as string}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }
  if (!template) {
    return (
      <PageLayout title="Template Not Found">
        <Button onClick={() => router.push(APP_ROUTES.templates)}>
          {CONTENT.common.back as string}
        </Button>
      </PageLayout>
    );
  }

  const draft = sections ?? [];
  const totalMetrics = draft.reduce((n, s) => n + s.metrics.length, 0);

  return (
    <>
      <PageLayout
        title={CONTENT.templates.editTemplate as string}
        subtitle={template.name}
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(APP_ROUTES.templates)}>
            {CONTENT.common.back as string}
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
          <div className="max-w-4xl space-y-6">
            {/* Metadata card */}
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 space-y-4">
              <div className="flex gap-2 mb-2 flex-wrap">
                {template.isDefault && (
                  <Tag color="gold" icon={<StarOutlined />}>
                    {CONTENT.templates.defaultBadge as string}
                  </Tag>
                )}
                {template.isArchived && <Tag>Archived</Tag>}
              </div>
              <Form.Item
                name="name"
                label={CONTENT.templates.nameLabel as string}
                rules={[{ required: true, message: "Template name is required." }]}
              >
                <Input size="large" placeholder={CONTENT.templates.namePlaceholder as string} />
              </Form.Item>
              <Form.Item name="description" label={CONTENT.templates.descriptionLabel as string}>
                <Input.TextArea
                  rows={2}
                  placeholder={CONTENT.templates.descriptionPlaceholder as string}
                />
              </Form.Item>
              <div className="flex flex-wrap gap-6">
                {(["isDefault", "isArchived"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <Form.Item name={key} valuePropName="checked" noStyle>
                      <Switch size="small" />
                    </Form.Item>
                    <span className="text-sm text-ds-text-secondary">
                      {key === "isDefault"
                        ? (CONTENT.templates.setDefault as string)
                        : (CONTENT.templates.archiveTemplate as string)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections + metrics */}
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-ds-text-primary">
                    Sections
                    <Badge
                      count={draft.length}
                      className="ml-2"
                      style={{ backgroundColor: "var(--ds-brand-accent)" }}
                    />
                  </h3>
                  <p className="text-xs text-ds-text-subtle mt-0.5">
                    {totalMetrics} metric{totalMetrics === 1 ? "" : "s"} across {draft.length}{" "}
                    section{draft.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Button icon={<PlusOutlined />} size="small" onClick={addSection}>
                  {CONTENT.templates.addSection as string}
                </Button>
              </div>

              {draft.length === 0 ? (
                <div className="text-center py-10 text-ds-text-subtle text-sm">
                  No sections yet. Click <strong>Add Section</strong> to start building this
                  template.
                </div>
              ) : (
                <Collapse
                  accordion={false}
                  defaultActiveKey={draft.map((s) => s.id)}
                  items={draft.map((section, si) => ({
                    key: section.id,
                    label: (
                      <div className="flex items-center gap-3 min-w-0">
                        <DragOutlined className="text-ds-text-subtle flex-shrink-0" />
                        <span className="font-medium text-ds-text-primary truncate">
                          {section.name || `Section ${si + 1}`}
                        </span>
                        <span className="text-xs text-ds-text-subtle flex-shrink-0">
                          {section.metrics.length} metric{section.metrics.length === 1 ? "" : "s"}
                          {section.isRequired && <span className="ml-1 text-red-500">*</span>}
                        </span>
                      </div>
                    ),
                    children: (
                      <div className="space-y-4 pt-1">
                        {/* Section header fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                          <div>
                            <label className="text-xs font-medium text-ds-text-secondary block mb-1">
                              {CONTENT.templates.sectionNameLabel as string} *
                            </label>
                            <Input
                              size="middle"
                              value={section.name}
                              onChange={(e) => updateSection(section.id, { name: e.target.value })}
                              placeholder="e.g. Weekly Attendance"
                            />
                          </div>
                          <div className="flex items-end gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-medium text-ds-text-secondary block mb-1">
                                Description
                              </label>
                              <Input
                                size="middle"
                                value={section.description}
                                onChange={(e) =>
                                  updateSection(section.id, { description: e.target.value })
                                }
                                placeholder="Optional"
                              />
                            </div>
                            <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
                              <Switch
                                size="small"
                                checked={section.isRequired}
                                onChange={(v) => updateSection(section.id, { isRequired: v })}
                              />
                              <span className="text-xs text-ds-text-secondary whitespace-nowrap">
                                {CONTENT.templates.isRequiredLabel as string}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-2">
                          {section.metrics.length === 0 && (
                            <p className="text-xs text-ds-text-subtle py-2">
                              No metrics yet. Add a metric below.
                            </p>
                          )}
                          {section.metrics.map((metric) => (
                            <MetricRow
                              key={metric.id}
                              metric={metric}
                              onChange={(patch) => updateMetric(section.id, metric.id, patch)}
                              onRemove={() => removeMetric(section.id, metric.id)}
                            />
                          ))}
                        </div>

                        {/* Section footer actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-ds-border-subtle">
                          <Button
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => addMetric(section.id)}
                          >
                            {CONTENT.templates.addMetric as string}
                          </Button>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeSection(section.id)}
                          >
                            Remove Section
                          </Button>
                        </div>
                      </div>
                    ),
                  }))}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <Button onClick={() => router.push(APP_ROUTES.templates)}>
                {CONTENT.common.cancel as string}
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                {CONTENT.common.save as string}
              </Button>
            </div>
          </div>
        </Form>
      </PageLayout>

      {/* Goal-update prompt modal */}
      <Modal
        open={goalPromptVisible}
        title={
          <div className="flex items-center gap-2">
            <TrophyOutlined className="text-ds-brand-accent" />
            <span>{CONTENT.templates.goalPromptTitle as string}</span>
          </div>
        }
        footer={[
          <Button key="later" onClick={() => setGoalPromptVisible(false)}>
            {CONTENT.templates.goalPromptSkip as string}
          </Button>,
          <Button
            key="now"
            type="primary"
            icon={<TrophyOutlined />}
            onClick={() => {
              setGoalPromptVisible(false);
              router.push(APP_ROUTES.goals);
            }}
          >
            {CONTENT.templates.goalPromptConfirm as string}
          </Button>,
        ]}
        onCancel={() => setGoalPromptVisible(false)}
        closable={false}
      >
        <p className="text-sm text-ds-text-secondary py-2">
          {CONTENT.templates.goalPromptDescription as string}
        </p>
      </Modal>
    </>
  );
}
````

## File: app/(dashboard)/layout.tsx
````typescript
"use client";

/**
 * app/(dashboard)/layout.tsx
 * Unified shell for ALL authenticated roles.
 *
 * Desktop: collapsible sidebar (240px expanded / 64px icon-only collapsed).
 *          Collapse toggle lives in the header — no hamburger on desktop.
 * Mobile:  drawer-based sidebar, toggled by a hamburger shown only on mobile.
 * Inbox bell: always visible for all roles.
 */

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drawer, Dropdown, Avatar, Badge, Tooltip } from "antd";
import {
  MenuOutlined,
  LogoutOutlined,
  ProfileOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import type { MenuProps } from "antd";
import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { getNavItems } from "@/config/nav";
import Button from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { UserRole } from "@/types/global";

const SIDEBAR_FULL_WIDTH = 240;
const SIDEBAR_ICON_WIDTH = 64;
const MOBILE_DRAWER_WIDTH = 240;

/* ── Sidebar ──────────────────────────────────────────────────────────────── */

interface SidebarProps {
  navItems: NavItem[];
  currentPath: string;
  collapsed: boolean;
  onClose?: () => void;
}

function Sidebar({ navItems, currentPath, collapsed, onClose }: SidebarProps) {
  return (
    <nav
      className="flex flex-col h-full bg-ds-surface-elevated border-r border-ds-border-base transition-all duration-200"
      style={{ width: collapsed ? SIDEBAR_ICON_WIDTH : SIDEBAR_FULL_WIDTH }}
    >
      {/* Brand mark */}
      <div
        className={[
          "flex items-center border-b border-ds-border-base flex-shrink-0 overflow-hidden",
          collapsed ? "justify-center px-0 py-5 h-16" : "gap-3 px-5 py-5",
        ].join(" ")}
      >
        <Image
          src="/logo/dark-bg-harvesters-Logo.jpg"
          alt="Harvesters"
          width={36}
          height={36}
          className="rounded-ds-lg flex-shrink-0"
          priority
        />
        {!collapsed && (
          <span className="font-semibold text-ds-text-primary text-sm leading-tight whitespace-nowrap">
            Harvesters
            <br />
            <span className="text-ds-text-secondary font-normal">Reporting</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <ul className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon as React.ComponentType<{ className?: string }>;
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");

          const linkContent = (
            <Link
              href={item.href}
              onClick={onClose}
              className={[
                "flex items-center rounded-ds-lg text-sm font-medium transition-colors no-underline",
                collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-ds-brand-accent/10 text-ds-brand-accent"
                  : "text-ds-text-secondary hover:bg-ds-surface-sunken hover:text-ds-text-primary",
              ].join(" ")}
            >
              <Icon
                className={[
                  "flex-shrink-0 text-base",
                  isActive ? "text-ds-brand-accent" : "text-ds-text-subtle",
                ].join(" ")}
              />
              {!collapsed && item.label}
            </Link>
          );

          return (
            <li key={item.key}>
              {collapsed ? (
                <Tooltip title={item.label} placement="right">
                  {linkContent}
                </Tooltip>
              ) : (
                linkContent
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── User menu ────────────────────────────────────────────────────────────── */

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

function UserMenu({ user, onLogout }: UserMenuProps) {
  const router = useRouter();

  const items: MenuProps["items"] = [
    {
      key: "name",
      label: (
        <div className="py-0.5">
          <p className="text-sm font-semibold text-ds-text-primary">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-ds-text-secondary">{user.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: CONTENT.nav.profile,
      onClick: () => router.push(APP_ROUTES.profile),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: CONTENT.nav.logout,
      danger: true,
      onClick: onLogout,
    },
  ];

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <button className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 outline-none focus:outline-1 focus:outline-ds-brand-accent rounded-ds-lg">
        <Avatar
          size={36}
          className="bg-ds-brand-accent text-white font-semibold text-sm flex-shrink-0"
        >
          {initials}
        </Avatar>
        <span className="hidden md:block text-sm font-medium text-ds-text-primary max-w-[120px] truncate">
          {user.firstName}
        </span>
      </button>
    </Dropdown>
  );
}

/* ── Header ───────────────────────────────────────────────────────────────── */

interface HeaderProps {
  user: AuthUser;
  onMobileMenuOpen: () => void;
  onDesktopCollapseToggle: () => void;
  sidebarCollapsed: boolean;
  onLogout: () => void;
  unreadCount?: number;
}

function Header({
  user,
  onMobileMenuOpen,
  onDesktopCollapseToggle,
  sidebarCollapsed,
  onLogout,
  unreadCount = 0,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="h-16 bg-ds-surface-elevated border-b border-ds-border-base flex items-center justify-between px-4 md:px-4 gap-4 flex-shrink-0">
      {/* Mobile-only hamburger */}
      <div className="md:hidden">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMobileMenuOpen}
          aria-label="Open menu"
        />
      </div>

      {/* Desktop-only collapse toggle */}
      <div className="hidden md:flex">
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onDesktopCollapseToggle}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications bell — always visible for all roles */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-ds-lg hover:bg-ds-surface-sunken transition-colors text-ds-text-secondary hover:text-ds-text-primary bg-transparent border-none cursor-pointer"
          onClick={() => router.push(APP_ROUTES.inbox)}
          aria-label={CONTENT.nav.inbox as string}
        >
          <Badge count={unreadCount} size="small" offset={[2, -2]}>
            <BellOutlined className="text-base" />
          </Badge>
        </button>

        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}

/* ── Layout ───────────────────────────────────────────────────────────────── */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const role = user?.role as UserRole | undefined;

  // Unread notifications for all authenticated users
  const { data: notifications } = useApiData<AppNotification[]>(
    user ? `${API_ROUTES.notifications.list}?unread=true` : null,
  );

  const unreadCount = notifications?.length ?? 0;

  if (!user) {
    // Show a loading skeleton while auth check is in progress or redirect is pending
    return (
      <div className="flex items-center justify-center h-screen bg-ds-surface-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-ds-brand-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-ds-text-secondary">{CONTENT.common.loading}</p>
        </div>
      </div>
    );
  }

  const navItems = getNavItems(role as UserRole);

  return (
    <div className="flex h-screen overflow-hidden bg-ds-surface-base">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 overflow-hidden transition-all duration-200"
        style={{ width: sidebarCollapsed ? SIDEBAR_ICON_WIDTH : SIDEBAR_FULL_WIDTH }}
      >
        <Sidebar navItems={navItems} currentPath={pathname} collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        width={MOBILE_DRAWER_WIDTH}
        styles={{ body: { padding: 0 }, header: { display: "none" } }}
        className="md:hidden"
      >
        <Sidebar
          navItems={navItems}
          currentPath={pathname}
          collapsed={false}
          onClose={() => setDrawerOpen(false)}
        />
      </Drawer>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          user={user}
          onMobileMenuOpen={() => setDrawerOpen(true)}
          onDesktopCollapseToggle={() => setSidebarCollapsed((v) => !v)}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={logout}
          unreadCount={unreadCount}
        />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
          <ScrollToTop scrollContainerRef={mainRef} />
        </main>
      </div>
    </div>
  );
}
````

## File: app/api/auth/refresh/route.ts
````typescript
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";
import {
    verifyRefreshToken,
    generateTokens,
    setAuthCookies,
    getRefreshTokenFromCookies,
} from "@/lib/utils/auth";
import {
    successResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";

const RefreshSchema = z.object({}).optional();

export async function POST(req: NextRequest) {
    try {
        void req;
        void RefreshSchema;

        const refreshToken = await getRefreshTokenFromCookies();
        if (!refreshToken) return unauthorizedResponse("No refresh token");

        const payload = verifyRefreshToken(refreshToken);
        if (!payload) return unauthorizedResponse("Invalid or expired refresh token");

        const userProfile = await db.user.findUnique({ where: { id: payload.userId } });
        if (!userProfile || !userProfile.isActive) {
            return unauthorizedResponse("User not found or inactive");
        }

        const authUser: AuthUser = {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role as UserRole,
            campusId: userProfile.campusId ?? undefined,
            orgGroupId: userProfile.orgGroupId ?? undefined,
            avatar: userProfile.avatar ?? undefined,
        };

        const tokens = generateTokens(authUser);
        await setAuthCookies(tokens);

        return NextResponse.json(successResponse({ user: authUser }));
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/goals/route.ts
````typescript
/**
 * app/api/goals/route.ts
 * GET  /api/goals  — list goals (filtered by role/campus)
 * POST /api/goals  — create or upsert a goal (GROUP_ADMIN+)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db } from "@/lib/data/db";
import { UserRole, GoalMode } from "@/types/global";

const READ_ROLES: UserRole[] = [
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.CAMPUS_PASTOR,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.SUPERADMIN,
];

const WRITE_ROLES: UserRole[] = [
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.SPO,
    UserRole.CEO,
    UserRole.CHURCH_MINISTRY,
    UserRole.SUPERADMIN,
];

const CreateGoalSchema = z.object({
    campusId: z.string().min(1),
    templateMetricId: z.string().min(1),
    metricName: z.string().min(1),
    mode: z.enum(["ANNUAL", "MONTHLY"]),
    year: z.number().int().min(2020).max(2100),
    month: z.number().int().min(1).max(12).optional(),
    targetValue: z.number().min(0),
});

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req, READ_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : undefined;

    /* Build Prisma where clause */
    const where: Record<string, unknown> = {};
    if (campusId) where.campusId = campusId;
    if (year != null) where.year = year;
    // Non-superadmin: restrict to their own campus
    if (
        auth.user.role !== UserRole.SUPERADMIN &&
        auth.user.role !== UserRole.SPO &&
        auth.user.role !== UserRole.CEO &&
        auth.user.role !== UserRole.CHURCH_MINISTRY
    ) {
        if (auth.user.campusId) where.campusId = auth.user.campusId;
    }

    const goals = await db.goal.findMany({ where });

    return NextResponse.json({ success: true, data: goals });
}

export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req, WRITE_ROLES);
    if (!auth.success)
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

    const body = CreateGoalSchema.parse(await req.json());

    // Non-superadmin / non-SPO can only set goals for their own campus
    if (
        auth.user.role !== UserRole.SUPERADMIN &&
        auth.user.role !== UserRole.SPO &&
        auth.user.role !== UserRole.CEO &&
        auth.user.role !== UserRole.CHURCH_MINISTRY
    ) {
        if (auth.user.campusId && body.campusId !== auth.user.campusId) {
            return NextResponse.json(
                { success: false, error: "Cannot set goals for a different campus." },
                { status: 403 },
            );
        }
    }

    const now = new Date();

    // Upsert: find existing for same campus/metric/year/mode
    const existingWhere: Record<string, unknown> = {
        campusId: body.campusId,
        templateMetricId: body.templateMetricId,
        year: body.year,
        mode: body.mode,
    };
    if (body.month != null) existingWhere.month = body.month;

    const existing = await db.goal.findFirst({ where: existingWhere });

    if (existing) {
        if (existing.isLocked && auth.user.role !== UserRole.SUPERADMIN) {
            return NextResponse.json(
                { success: false, error: "This goal is locked. Submit an unlock request to edit it." },
                { status: 403 },
            );
        }
        const updated = await db.goal.update({
            where: { id: existing.id },
            data: { targetValue: body.targetValue, mode: body.mode as GoalMode },
        });
        return NextResponse.json({ success: true, data: updated });
    }

    const goal = await db.goal.create({
        data: {
            campusId: body.campusId,
            templateMetricId: body.templateMetricId,
            metricName: body.metricName,
            mode: body.mode as GoalMode,
            year: body.year,
            month: body.month,
            targetValue: body.targetValue,
            isLocked: false,
            createdById: auth.user.id,
        },
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
}
````

## File: app/layout.tsx
````typescript
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AntdProvider } from "@/providers/AntdProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ServiceWorkerRegistrar } from "@/components/ui/ServiceWorkerRegistrar";
import OfflineIndicator from "@/components/ui/OfflineIndicator";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Harvesters Reporting System",
  title: {
    default: "Harvesters Reporting System",
    template: "%s | Harvesters Reporting System",
  },
  description:
    "The central report management platform for Harvesters International Christian Centre — campus report submission, review, and analytics.",
  authors: [{ name: "Harvesters International Christian Centre" }],
  robots: { index: false, follow: false }, // internal system — no indexing
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://reporting.harvesters.org"),
  openGraph: {
    type: "website",
    siteName: "Harvesters Reporting System",
    title: "Harvesters Reporting System",
    description:
      "The central report management platform for Harvesters International Christian Centre.",
    images: [
      {
        url: "/logo/white-bg-harvesters-Logo.svg",
        width: 512,
        height: 512,
        alt: "Harvesters International Christian Centre",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Harvesters Reporting System",
    description:
      "The central report management platform for Harvesters International Christian Centre.",
    images: ["/logo/white-bg-harvesters-Logo.svg"],
  },
  icons: {
    icon: [
      { url: "/logo/dark-bg-harvesters-Logo.ico", type: "image/x-icon", sizes: "any" },
      { url: "/logo/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/logo/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/logo/white-bg-harvesters-Logo.svg", sizes: "180x180", type: "image/svg+xml" }],
  },
  appleWebApp: {
    title: "HRS",
    statusBarStyle: "default",
    capable: true,
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AntdProvider>
            <AuthProvider>
              {/* Skip to main content — accessibility */}
              <a
                href="#main-content"
                className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-md focus-visible:bg-ds-brand-accent focus-visible:text-white"
              >
                Skip to main content
              </a>
              <main id="main-content">{children}</main>
              <OfflineIndicator />
              <ServiceWorkerRegistrar />
            </AuthProvider>
          </AntdProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
````

## File: config/roles.ts
````typescript
/**
 * config/roles.ts
 * ROLE_CONFIG: authoritative capability map for every role.
 * Used to drive nav filtering, permission checks, and dashboard routing.
 */

import { UserRole } from "@/types/global";
import { APP_ROUTES } from "./routes";
import { CONTENT } from "./content";

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
    [UserRole.SUPERADMIN]: {
        role: UserRole.SUPERADMIN,
        label: CONTENT.users.roles.SUPERADMIN,
        hierarchyOrder: 0,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "system",
        canCreateReports: true,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: false,
        canApproveReports: false,
        canMarkReviewed: false,
        canLockReports: true,
        canManageTemplates: true,
        canDataEntry: false,
        canManageUsers: true,
        canManageOrg: true,
        canSetGoals: true,
        canApproveGoalUnlock: true,
        reportVisibilityScope: "all",
    },
    [UserRole.SPO]: {
        role: UserRole.SPO,
        label: CONTENT.users.roles.SPO,
        hierarchyOrder: 1,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "analytics",
        canCreateReports: false,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: true,
        canApproveReports: false,
        canMarkReviewed: true,
        canLockReports: false,
        canManageTemplates: true,
        canDataEntry: false,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: true,
        canApproveGoalUnlock: true,
        reportVisibilityScope: "all",
    },
    [UserRole.CEO]: {
        role: UserRole.CEO,
        label: CONTENT.users.roles.CEO,
        hierarchyOrder: 2,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "analytics",
        canCreateReports: false,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: true,
        canApproveReports: false,
        canMarkReviewed: true,
        canLockReports: false,
        canManageTemplates: true,
        canDataEntry: false,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: true,
        canApproveGoalUnlock: true,
        reportVisibilityScope: "all",
    },
    [UserRole.OFFICE_OF_CEO]: {
        role: UserRole.OFFICE_OF_CEO,
        label: CONTENT.users.roles.OFFICE_OF_CEO,
        hierarchyOrder: 3,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "analytics",
        canCreateReports: false,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: true,
        canApproveReports: false,
        canMarkReviewed: true,
        canLockReports: false,
        canManageTemplates: true,
        canDataEntry: false,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: true,
        canApproveGoalUnlock: true,
        reportVisibilityScope: "all",
    },
    [UserRole.CHURCH_MINISTRY]: {
        role: UserRole.CHURCH_MINISTRY,
        label: CONTENT.users.roles.CHURCH_MINISTRY,
        hierarchyOrder: 4,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "analytics",
        canCreateReports: false,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: true,
        canApproveReports: false,
        canMarkReviewed: true,
        canLockReports: false,
        canManageTemplates: true,
        canDataEntry: false,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: false,
        canApproveGoalUnlock: false,
        reportVisibilityScope: "all",
    },
    [UserRole.GROUP_PASTOR]: {
        role: UserRole.GROUP_PASTOR,
        label: CONTENT.users.roles.GROUP_PASTOR,
        hierarchyOrder: 5,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "report-reviewed",
        canCreateReports: false,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: true,
        canApproveReports: false,
        canMarkReviewed: true,
        canLockReports: false,
        canManageTemplates: true,
        canDataEntry: false,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: true,
        canApproveGoalUnlock: true,
        reportVisibilityScope: "all",
    },
    [UserRole.GROUP_ADMIN]: {
        role: UserRole.GROUP_ADMIN,
        label: CONTENT.users.roles.GROUP_ADMIN,
        hierarchyOrder: 6,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "report-review",
        canCreateReports: false,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: true,
        canApproveReports: false,
        canMarkReviewed: true,
        canLockReports: false,
        canManageTemplates: true,
        canDataEntry: true,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: true,
        canApproveGoalUnlock: false,
        reportVisibilityScope: "all",
    },
    [UserRole.CAMPUS_PASTOR]: {
        role: UserRole.CAMPUS_PASTOR,
        label: CONTENT.users.roles.CAMPUS_PASTOR,
        hierarchyOrder: 7,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "report-review",
        canCreateReports: true,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: false,
        canApproveReports: true,
        canMarkReviewed: false,
        canLockReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: false,
        canApproveGoalUnlock: false,
        reportVisibilityScope: "campus",
    },
    [UserRole.CAMPUS_ADMIN]: {
        role: UserRole.CAMPUS_ADMIN,
        label: CONTENT.users.roles.CAMPUS_ADMIN,
        hierarchyOrder: 8,
        dashboardRoute: APP_ROUTES.dashboard,
        dashboardMode: "report-fill",
        canCreateReports: true,
        canFillReports: true,
        canSubmitReports: true,
        canRequestEdits: false,
        canApproveReports: false,
        canMarkReviewed: false,
        canLockReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: false,
        canApproveGoalUnlock: false,
        reportVisibilityScope: "campus",
    },
    [UserRole.DATA_ENTRY]: {
        role: UserRole.DATA_ENTRY,
        label: CONTENT.users.roles.DATA_ENTRY,
        hierarchyOrder: 9,
        dashboardRoute: APP_ROUTES.reports,
        dashboardMode: "report-fill",
        canCreateReports: true,
        canFillReports: true,
        canSubmitReports: true,
        canRequestEdits: false,
        canApproveReports: false,
        canMarkReviewed: false,
        canLockReports: false,
        canManageTemplates: false,
        canDataEntry: true,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: false,
        canApproveGoalUnlock: false,
        reportVisibilityScope: "campus",
    },
    [UserRole.MEMBER]: {
        role: UserRole.MEMBER,
        label: CONTENT.users.roles.MEMBER,
        hierarchyOrder: 10,
        dashboardRoute: APP_ROUTES.member.dashboard,
        dashboardMode: "report-fill",
        canCreateReports: false,
        canFillReports: false,
        canSubmitReports: false,
        canRequestEdits: false,
        canApproveReports: false,
        canMarkReviewed: false,
        canLockReports: false,
        canManageTemplates: false,
        canDataEntry: false,
        canManageUsers: false,
        canManageOrg: false,
        canSetGoals: false,
        canApproveGoalUnlock: false,
        reportVisibilityScope: "own",
    },
};

/* ── Helper utilities ─────────────────────────────────────────────────────── */

/** Roles allowed to submit reports on behalf of campuses */
export const REPORT_SUBMITTER_ROLES: UserRole[] = [
    UserRole.CAMPUS_PASTOR,
    UserRole.CAMPUS_ADMIN,
    UserRole.DATA_ENTRY,
    UserRole.GROUP_ADMIN,
];

/** Roles that approve / review reports (above campus level) */
export const REPORT_REVIEWER_ROLES: UserRole[] = [
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.CHURCH_MINISTRY,
    UserRole.CEO,
    UserRole.OFFICE_OF_CEO,
    UserRole.SPO,
    UserRole.SUPERADMIN,
];

/** All roles that have access to /leader/* routes */
export const LEADER_ROLES: UserRole[] = [
    UserRole.CAMPUS_ADMIN,
    UserRole.CAMPUS_PASTOR,
    UserRole.DATA_ENTRY,
    UserRole.GROUP_ADMIN,
    UserRole.GROUP_PASTOR,
    UserRole.CHURCH_MINISTRY,
    UserRole.CEO,
    UserRole.OFFICE_OF_CEO,
    UserRole.SPO,
];

/** Check if a role can perform an action on a report at a given status */
export function canTransitionReport(
    role: UserRole,
    currentStatus: string,
    action: keyof RoleConfig,
): boolean {
    const config = ROLE_CONFIG[role];
    return !!config[action];
}

/** Get the display label for any role */
export function getRoleLabel(role: UserRole): string {
    return ROLE_CONFIG[role]?.label ?? role;
}

/** Get dashboard route for a role */
export function getDashboardRoute(role: UserRole): string {
    return ROLE_CONFIG[role]?.dashboardRoute ?? APP_ROUTES.dashboard;
}
````

## File: lib/utils/auth.ts
````typescript
/**
 * lib/utils/auth.ts
 * Server-side auth helpers: password hashing, JWT generation/verification,
 * cookie management, and the verifyAuth() guard used in all API routes.
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "@/lib/data/db";
import { UserRole } from "@/types/global";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const ACCESS_SECRET = process.env.JWT_SECRET ?? "dev-access-secret-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me";
const ACCESS_EXPIRY = process.env.JWT_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
const COOKIE_NAME = process.env.COOKIE_NAME ?? "hrs_token";
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? "hrs_refresh";

interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Password
// ─────────────────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
    return bcrypt.hash(password, rounds);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT
// ─────────────────────────────────────────────────────────────────────────────

export function generateAccessToken(user: AuthUser): string {
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role } satisfies JWTPayload,
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions,
    );
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRY,
    } as jwt.SignOptions);
}

export function generateTokens(user: AuthUser): AuthTokens {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user.id),
    };
}

export function verifyAccessToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, REFRESH_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cookies
// ─────────────────────────────────────────────────────────────────────────────

export async function setAuthCookies(tokens: AuthTokens, rememberMe?: boolean): Promise<void> {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    // Standard: 15min access, 7d refresh. Remember me: 30d access, 90d refresh.
    const accessMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 15;
    const refreshMaxAge = rememberMe ? 60 * 60 * 24 * 90 : 60 * 60 * 24 * 7;

    cookieStore.set(COOKIE_NAME, tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: accessMaxAge,
        path: "/",
    });

    cookieStore.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: refreshMaxAge,
        path: "/",
    });
}

export async function clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// verifyAuth — the standard API route guard
// ─────────────────────────────────────────────────────────────────────────────

type VerifyAuthResult =
    | { success: true; user: AuthUser }
    | { success: false; error: string; status: 401 | 403 };

/**
 * Call at the top of every API route or Server Component:
 *   const auth = await verifyAuth(req);           // API route (also checks Authorization header)
 *   const auth = await verifyAuth();               // Server Component (cookie-only)
 *
 * Optionally pass `allowedRoles` to enforce role-level access.
 */
export async function verifyAuth(
    req?: NextRequest | null,
    allowedRoles?: UserRole[],
): Promise<VerifyAuthResult> {
    // Try cookie first, then Authorization header (header only available in API routes)
    const cookieStore = await cookies();
    const token =
        cookieStore.get(COOKIE_NAME)?.value ??
        req?.headers?.get("Authorization")?.replace("Bearer ", "") ??
        null;

    if (!token) {
        return { success: false, error: "Unauthorised", status: 401 };
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
        return { success: false, error: "Invalid or expired token", status: 401 };
    }

    // Look up user in database
    const userProfile = await db.user.findUnique({ where: { id: payload.userId } });
    if (!userProfile || !userProfile.isActive) {
        return { success: false, error: "User not found or inactive", status: 401 };
    }

    const user: AuthUser = {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        role: userProfile.role as UserRole,
        campusId: userProfile.campusId ?? undefined,
        orgGroupId: userProfile.orgGroupId ?? undefined,
        avatar: userProfile.avatar ?? undefined,
    };

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return { success: false, error: "Insufficient permissions", status: 403 };
    }

    return { success: true, user };
}
````

## File: modules/analytics/components/AnalyticsPage.tsx
````typescript
"use client";

/**
 * modules/analytics/components/AnalyticsPage.tsx
 * Full analytics dashboard â€” tabbed, role-aware, config-driven.
 *
 * Tabs: Overview | Metrics Analysis | Trends | Compliance
 * Role-awareness:
 *   SUPERADMIN â€” system-wide scope, all 4 KPI cards, all sections
 *   CEO / SPO / CM â€” cross-campus scope, all sections
 *   GROUP_ADMIN / GROUP_PASTOR â€” group-scoped
 *   CAMPUS_ADMIN / CAMPUS_PASTOR / DATA_ENTRY â€” campus-scoped
 */

import { useState, useEffect, useCallback } from "react";
import { Select, Tabs, Segmented, Progress } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import { UserRole, MetricCalculationType } from "@/types/global";

/* â”€â”€ API response types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface OverviewTotals {
  total: number;
  submitted: number;
  approved: number;
  reviewed: number;
  locked: number;
  draft: number;
  requiresEdits: number;
}

interface CampusBreakdownRow {
  campusId: string;
  submitted: number;
  approved: number;
  total: number;
  complianceRate: number;
}

interface QuarterlyTrendRow {
  quarter: string;
  complianceRate: number;
  submitted: number;
}

interface StatusTrendRow {
  month: string;
  [status: string]: number | string;
}

interface AnalyticsOverview {
  totals: OverviewTotals;
  compliance: number;
  submissionTrend: { month: string; count: number }[];
  campusBreakdown: CampusBreakdownRow[];
  quarterlyTrend: QuarterlyTrendRow[];
  statusTrend: StatusTrendRow[];
}

interface QuarterlyTotals {
  total: number;
  submitted: number;
  approved: number;
  compliance: number;
}

interface QuarterlyMonthRow {
  month: number;
  label: string;
  total: number;
  submitted: number;
  approved: number;
  compliance: number;
}

interface QuarterlyCampusRow {
  campusId: string;
  submitted: number;
  approved: number;
  total: number;
  complianceRate: number;
}

interface QuarterlySummaryData {
  year: number;
  quarter: number;
  label: string;
  current: QuarterlyTotals;
  previous: QuarterlyTotals & { label: string };
  qoqDelta: { total: number; submitted: number; approved: number; compliance: number };
  campusBreakdown: QuarterlyCampusRow[];
  monthlyBreakdown: QuarterlyMonthRow[];
}

interface MetricPoint {
  period: string;
  periodLabel: string;
  goal?: number;
  achieved?: number;
  yoy?: number;
}

interface CampusMetricSeries {
  campusId: string;
  campusName: string;
  series: MetricPoint[];
  avgAchievementRate: number;
}

interface AvailableMetric {
  id: string;
  name: string;
  sectionName: string;
  calculationType: MetricCalculationType;
}

interface MetricAnalyticsData {
  metricId: string;
  metricName: string;
  sectionName: string;
  calculationType: MetricCalculationType;
  aggregate: MetricPoint[];
  byCampus: CampusMetricSeries[];
  availableMetrics: AvailableMetric[];
}

/* â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const ALL_ROLES = Object.values(UserRole);
const CURRENT_YEAR = new Date().getFullYear();

const CHART_ROLES = [
  UserRole.SUPERADMIN,
  UserRole.CEO,
  UserRole.SPO,
  UserRole.CHURCH_MINISTRY,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
];

const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3].map(
  (y) => ({
    value: y,
    label: String(y),
  }),
);

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--ds-surface-elevated)",
  border: "1px solid var(--ds-border-base)",
  borderRadius: 8,
  fontSize: 12,
};

const PIE_COLORS = [
  "var(--ds-chart-1)",
  "var(--ds-chart-2)",
  "var(--ds-chart-3)",
  "var(--ds-chart-4)",
  "var(--ds-chart-5)",
  "var(--ds-chart-6)",
];

/* â”€â”€ KPI card config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface KpiConfig {
  id: string;
  label: string;
  value: (d: AnalyticsOverview, extra: { users: number; campuses: number }) => number | string;
  allowedRoles: UserRole[];
}

const KPI_CARDS: KpiConfig[] = [
  {
    id: "total",
    label: CONTENT.dashboard.kpi.totalReports as string,
    value: (d) => d.totals.total,
    allowedRoles: ALL_ROLES,
  },
  {
    id: "submitted",
    label: CONTENT.dashboard.kpi.pendingReview as string,
    value: (d) => d.totals.submitted,
    allowedRoles: ALL_ROLES,
  },
  {
    id: "approved",
    label: CONTENT.dashboard.kpi.approvedReports as string,
    value: (d) => d.totals.approved,
    allowedRoles: ALL_ROLES,
  },
  {
    id: "compliance",
    label: CONTENT.dashboard.kpi.complianceRate as string,
    value: (d) => d.compliance + "%",
    allowedRoles: ALL_ROLES,
  },
  {
    id: "users",
    label: CONTENT.dashboard.kpi.totalUsers as string,
    value: (_d, e) => e.users,
    allowedRoles: [UserRole.SUPERADMIN],
  },
  {
    id: "campuses",
    label: CONTENT.dashboard.kpi.totalCampuses as string,
    value: (_d, e) => e.campuses,
    allowedRoles: [UserRole.SUPERADMIN],
  },
  {
    id: "draft",
    label: CONTENT.analytics.drafts as string,
    value: (d) => d.totals.draft,
    allowedRoles: [UserRole.SUPERADMIN],
  },
  {
    id: "requires",
    label: CONTENT.analytics.requiresEdits as string,
    value: (d) => d.totals.requiresEdits,
    allowedRoles: [UserRole.SUPERADMIN],
  },
];

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">{title}</h2>
      <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 " + className
      }
    >
      <SectionHeader title={title} />
      {children}
    </div>
  );
}

/* â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function AnalyticsPage() {
  const { user } = useAuth();
  const { role } = useRole();

  /* Shared controls */
  const [year, setYear] = useState(CURRENT_YEAR);
  const [campusFilter, setCampusFilter] = useState<string | undefined>(
    // Non-superadmin defaults default to own campus
    undefined,
  );

  /* Overview state */
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  /* Metrics tab state */
  const [selectedMetricId, setSelectedMetricId] = useState<string | undefined>();
  const [granularity, setGranularity] = useState<"weekly" | "monthly" | "quarterly">("monthly");
  const [compareYear, setCompareYear] = useState<number>(CURRENT_YEAR - 1);
  const [metricsData, setMetricsData] = useState<MetricAnalyticsData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState<AvailableMetric[]>([]);

  /* Quarterly tab state */
  const [selectedQuarter, setSelectedQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [quarterlyData, setQuarterlyData] = useState<QuarterlySummaryData | null>(null);
  const [quarterlyLoading, setQuarterlyLoading] = useState(false);

  const isSuperadmin = role === UserRole.SUPERADMIN;
  const canSeeCrossCampus = CHART_ROLES.includes(role as UserRole);

  /* Campus + user counts */
  const { data: allCampuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const { data: allUsers } = useApiData<UserProfile[]>(isSuperadmin ? API_ROUTES.users.list : null);

  /* Effective campus filter â€” non-cross-campus roles forced to own campus */
  const effectiveCampusId = canSeeCrossCampus ? campusFilter : user?.campusId;

  /* â”€â”€ Fetch overview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.overview + "?" + params.toString());
      const json = await res.json();
      if (json.success) setOverview(json.data as AnalyticsOverview);
    } catch {
      /* silent â€” skeleton holds */
    } finally {
      setOverviewLoading(false);
    }
  }, [year, effectiveCampusId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  /* â”€â”€ Fetch available metrics (for selector) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const fetchAvailableMetrics = useCallback(async () => {
    try {
      const params = new URLSearchParams({ year: String(year) });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.metrics + "?" + params.toString());
      const json = await res.json();
      if (json.success && json.data?.availableMetrics) {
        setAvailableMetrics(json.data.availableMetrics as AvailableMetric[]);
      }
    } catch {
      /* silent */
    }
  }, [year, effectiveCampusId]);

  useEffect(() => {
    fetchAvailableMetrics();
  }, [fetchAvailableMetrics]);

  /* â”€â”€ Fetch metric analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const fetchMetrics = useCallback(async () => {
    if (!selectedMetricId) return;
    setMetricsLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(year),
        compareYear: String(compareYear),
        granularity,
      });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      params.set("metricId", selectedMetricId);
      const res = await fetch(API_ROUTES.analytics.metrics + "?" + params.toString());
      const json = await res.json();
      if (json.success) setMetricsData(json.data as MetricAnalyticsData);
    } catch {
      /* silent */
    } finally {
      setMetricsLoading(false);
    }
  }, [selectedMetricId, year, compareYear, granularity, effectiveCampusId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  /* ── Fetch quarterly summary ────────────────────────────────────────────── */

  const fetchQuarterly = useCallback(async () => {
    setQuarterlyLoading(true);
    try {
      const params = new URLSearchParams({ year: String(year), quarter: String(selectedQuarter) });
      if (effectiveCampusId) params.set("campusId", effectiveCampusId);
      const res = await fetch(API_ROUTES.analytics.quarterly + "?" + params.toString());
      const json = await res.json();
      if (json.success) setQuarterlyData(json.data as QuarterlySummaryData);
    } catch {
      /* silent */
    } finally {
      setQuarterlyLoading(false);
    }
  }, [year, selectedQuarter, effectiveCampusId]);

  useEffect(() => {
    fetchQuarterly();
  }, [fetchQuarterly]);

  const visibleKpis = KPI_CARDS.filter((k) =>
    role ? k.allowedRoles.includes(role as UserRole) : true,
  );

  const extra = { users: allUsers?.length ?? 0, campuses: allCampuses?.length ?? 0 };

  const campusBreakdownNamed = (overview?.campusBreakdown ?? []).map((row) => ({
    ...row,
    name: allCampuses?.find((c) => c.id === row.campusId)?.name ?? row.campusId,
  }));

  const campusOptions = canSeeCrossCampus
    ? [
        { value: "", label: "All Campuses" },
        ...(allCampuses ?? []).map((c) => ({ value: c.id, label: c.name })),
      ]
    : [];

  /* Group available metrics by section for the Select optgroup */
  const metricSelectOptions = (() => {
    const sections: Record<string, AvailableMetric[]> = {};
    for (const m of availableMetrics) {
      if (!sections[m.sectionName]) sections[m.sectionName] = [];
      sections[m.sectionName].push(m);
    }
    return Object.entries(sections).map(([section, metrics]) => ({
      label: section,
      options: metrics.map((m) => ({
        value: m.id,
        label:
          m.name +
          (m.calculationType === MetricCalculationType.AVERAGE
            ? " (avg)"
            : m.calculationType === MetricCalculationType.SNAPSHOT
              ? " (snapshot)"
              : ""),
      })),
    }));
  })();

  /* Campus series for campus comparison bar chart */
  const campusComparisonData = (() => {
    if (!metricsData || metricsData.byCampus.length === 0) return [];
    const allPeriods = Array.from(
      new Set(metricsData.byCampus.flatMap((c) => c.series.map((p) => p.period))),
    ).sort();
    return allPeriods.map((period) => {
      const row: Record<string, string | number> = { period };
      for (const campus of metricsData.byCampus) {
        const pt = campus.series.find((p) => p.period === period);
        row[campus.campusName] = pt?.achieved ?? 0;
      }
      return row;
    });
  })();

  /* CHART_COLORS for per-campus lines */
  const CAMPUS_COLORS = [
    "var(--ds-chart-1)",
    "var(--ds-chart-2)",
    "var(--ds-chart-3)",
    "var(--ds-chart-4)",
    "var(--ds-chart-5)",
    "var(--ds-chart-6)",
  ];

  /* â”€â”€ Shared tab header controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const sharedControls = (
    <div className="flex flex-wrap items-center gap-3">
      {canSeeCrossCampus && (
        <Select
          placeholder={CONTENT.analytics.campusSelectorLabel as string}
          value={campusFilter ?? ""}
          options={campusOptions}
          onChange={(v) => setCampusFilter(v || undefined)}
          style={{ minWidth: 160 }}
          size="middle"
        />
      )}
      <Select
        value={year}
        options={YEAR_OPTIONS}
        onChange={setYear}
        size="middle"
        style={{ width: 100 }}
      />
    </div>
  );

  /* â”€â”€ Overview tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const overviewTab =
    overviewLoading || !overview ? (
      <LoadingSkeleton rows={8} />
    ) : (
      <div className="space-y-6">
        {/* KPI bento row */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
          {visibleKpis.map((card) => (
            <Card key={card.id} className="!p-5">
              <p className="text-xs font-medium text-ds-text-subtle mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-ds-text-primary tracking-tight">
                {card.value(overview, extra)}
              </p>
            </Card>
          ))}
        </div>

        {/* Submission trend */}
        {overview.submissionTrend.length > 0 && (
          <ChartCard title={CONTENT.analytics.trendsTitle as string}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={overview.submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name={CONTENT.analytics.chartLabels.submitted as string}
                  stroke="var(--ds-brand-accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--ds-brand-accent)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Campus breakdown â€” cross-campus roles */}
        {canSeeCrossCampus && campusBreakdownNamed.length > 0 && (
          <ChartCard title={CONTENT.analytics.campusBreakdownTitle as string}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={campusBreakdownNamed} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--ds-text-subtle)" }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar
                  dataKey="submitted"
                  name={CONTENT.analytics.chartLabels.submitted as string}
                  fill="var(--ds-chart-1)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="approved"
                  name={CONTENT.analytics.chartLabels.approved as string}
                  fill="var(--ds-chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    );

  /* â”€â”€ Metrics Analysis tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const metricsTab = (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-ds-surface-elevated rounded-ds-xl border border-ds-border-base p-4">
        <Select
          placeholder={CONTENT.analytics.metricSelectorLabel as string}
          value={selectedMetricId}
          options={metricSelectOptions}
          onChange={(v) => setSelectedMetricId(v)}
          style={{ minWidth: 280 }}
          showSearch
          optionFilterProp="label"
        />
        <Select
          value={compareYear}
          options={YEAR_OPTIONS.filter((y) => y.value !== year)}
          onChange={setCompareYear}
          style={{ width: 120 }}
          placeholder="Compare year"
        />
        <Segmented
          value={granularity}
          onChange={(v) => setGranularity(v as typeof granularity)}
          options={[
            { label: CONTENT.analytics.granularity.monthly as string, value: "monthly" },
            { label: CONTENT.analytics.granularity.quarterly as string, value: "quarterly" },
            { label: CONTENT.analytics.granularity.weekly as string, value: "weekly" },
          ]}
        />
      </div>

      {!selectedMetricId ? (
        <EmptyState title={CONTENT.analytics.noMetricSelected as string} description="" />
      ) : metricsLoading ? (
        <LoadingSkeleton rows={6} />
      ) : !metricsData ? (
        <EmptyState title={CONTENT.analytics.noData as string} description="" />
      ) : (
        <>
          {/* Goal vs Achieved */}
          <ChartCard title={CONTENT.analytics.goalVsAchievedTitle as string}>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={metricsData.aggregate}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis
                  dataKey="periodLabel"
                  tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar
                  dataKey="achieved"
                  name={CONTENT.analytics.chartLabels.achieved as string}
                  fill="var(--ds-chart-1)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                {metricsData.calculationType !== MetricCalculationType.SNAPSHOT && (
                  <Line
                    type="monotone"
                    dataKey="goal"
                    name={CONTENT.analytics.chartLabels.goal as string}
                    stroke="var(--ds-chart-3)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
                {metricsData.aggregate.some((p) => p.yoy != null) && (
                  <Line
                    type="monotone"
                    dataKey="yoy"
                    name={CONTENT.analytics.chartLabels.yoy as string}
                    stroke="var(--ds-chart-4)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Campus comparison â€” cross-campus roles only */}
          {canSeeCrossCampus &&
            campusComparisonData.length > 0 &&
            metricsData.byCampus.length > 1 && (
              <ChartCard title={CONTENT.analytics.campusMetricCompTitle as string}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={campusComparisonData} margin={{ bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    {metricsData.byCampus.map((c, i) => (
                      <Bar
                        key={c.campusId}
                        dataKey={c.campusName}
                        fill={CAMPUS_COLORS[i % CAMPUS_COLORS.length]}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={32}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

          {/* Cumulative / Area chart */}
          {metricsData.calculationType === MetricCalculationType.SUM && (
            <ChartCard title={CONTENT.analytics.cumulativeTrendTitle as string}>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={metricsData.aggregate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                  <XAxis
                    dataKey="periodLabel"
                    tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="achieved"
                    name={CONTENT.analytics.chartLabels.achieved as string}
                    fill="color-mix(in srgb, var(--ds-brand-accent) 20%, transparent)"
                    stroke="var(--ds-brand-accent)"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );

  /* â”€â”€ Trends tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const trendsTab =
    overviewLoading || !overview ? (
      <LoadingSkeleton rows={8} />
    ) : (
      <div className="space-y-6">
        {/* Status stacked bar over time */}
        {overview.statusTrend.length > 0 && (
          <ChartCard title={CONTENT.analytics.statusBreakdownTitle as string}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overview.statusTrend as Record<string, unknown>[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="SUBMITTED" name="Submitted" stackId="a" fill="var(--ds-chart-1)" />
                <Bar dataKey="APPROVED" name="Approved" stackId="a" fill="var(--ds-chart-2)" />
                <Bar dataKey="REVIEWED" name="Reviewed" stackId="a" fill="var(--ds-chart-3)" />
                <Bar dataKey="LOCKED" name="Locked" stackId="a" fill="var(--ds-chart-4)" />
                <Bar
                  dataKey="REQUIRES_EDITS"
                  name="Requires Edits"
                  stackId="a"
                  fill="var(--ds-chart-5)"
                />
                <Bar
                  dataKey="DRAFT"
                  name="Draft"
                  stackId="a"
                  fill="var(--ds-chart-6)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Quarterly compliance trend */}
        {overview.quarterlyTrend.length > 0 && (
          <ChartCard title="Quarterly Compliance Rate">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.quarterlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }}
                  unit="%"
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: unknown) => [v + "%", "Compliance"]}
                />
                <Bar
                  dataKey="complianceRate"
                  name="Compliance %"
                  fill="var(--ds-brand-accent)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    );

  /* â”€â”€ Compliance tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const complianceTab =
    overviewLoading || !overview ? (
      <LoadingSkeleton rows={6} />
    ) : (
      <div className="space-y-6">
        <ChartCard title={CONTENT.analytics.complianceTitle as string}>
          {campusBreakdownNamed.length === 0 ? (
            <p className="text-sm text-ds-text-subtle">{CONTENT.analytics.noData as string}</p>
          ) : (
            <div className="space-y-4">
              {[...campusBreakdownNamed]
                .sort((a, b) => b.complianceRate - a.complianceRate)
                .map((row) => (
                  <div key={row.campusId}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-ds-text-primary truncate">{row.name}</span>
                      <span className="text-xs font-semibold text-ds-text-secondary ml-4 flex-shrink-0">
                        {row.complianceRate}%
                      </span>
                    </div>
                    <Progress
                      percent={Math.min(row.complianceRate, 100)}
                      showInfo={false}
                      strokeColor="var(--ds-brand-accent)"
                      trailColor="var(--ds-surface-sunken)"
                      size="small"
                    />
                  </div>
                ))}
            </div>
          )}
        </ChartCard>

        {/* Summary pie */}
        {(() => {
          const pieData = [
            { name: "Submitted", value: overview.totals.submitted },
            { name: "Approved", value: overview.totals.approved },
            { name: "Reviewed", value: overview.totals.reviewed },
            { name: "Locked", value: overview.totals.locked },
            { name: "Draft", value: overview.totals.draft },
            { name: "Requires Edit", value: overview.totals.requiresEdits },
          ].filter((d) => d.value > 0);
          return pieData.length > 0 ? (
            <ChartCard title={CONTENT.analytics.statusBreakdownTitle as string}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={
                      ((props: Record<string, unknown>) =>
                        String(props.name ?? "") +
                        " " +
                        Math.round(((props.percent as number) ?? 0) * 100) +
                        "%") as unknown as import("recharts").PieLabel
                    }
                    labelLine={{ stroke: "var(--ds-border-base)" }}
                  >
                    {pieData.map((_entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : null;
        })()}
      </div>
    );

  /* â”€â”€ Tab items (config-driven) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  /* ── Quarterly tab ──────────────────────────────────────────────────────── */

  const quarterlyBrNamed = (quarterlyData?.campusBreakdown ?? []).map((row) => ({
    ...row,
    name: allCampuses?.find((c) => c.id === row.campusId)?.name ?? row.campusId,
  }));

  const QUARTER_OPTIONS = [1, 2, 3, 4].map((q) => ({ value: q, label: `Q${q}` }));

  function DeltaBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
    const color = value > 0 ? "text-ds-state-success" : value < 0 ? "text-ds-state-error" : "text-ds-text-subtle";
    const prefix = value > 0 ? "+" : "";
    return <span className={`text-xs font-semibold ${color}`}>{prefix}{value}{suffix}</span>;
  }

  const quarterlyTab =
    quarterlyLoading || !quarterlyData ? (
      <LoadingSkeleton rows={6} />
    ) : (
      <div className="space-y-6">
        {/* Quarter selector */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedQuarter}
            options={QUARTER_OPTIONS}
            onChange={setSelectedQuarter}
            style={{ width: 80 }}
            size="middle"
          />
        </div>

        {/* Quarterly KPIs with QoQ delta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: CONTENT.analytics.quarterlySubmittedLabel as string, cur: quarterlyData.current.submitted, delta: quarterlyData.qoqDelta.submitted },
            { label: CONTENT.analytics.quarterlyApprovedLabel as string, cur: quarterlyData.current.approved, delta: quarterlyData.qoqDelta.approved },
            { label: CONTENT.analytics.quarterlyComplianceLabel as string, cur: quarterlyData.current.compliance, delta: quarterlyData.qoqDelta.compliance, suffix: "%" },
            { label: CONTENT.dashboard.kpi.totalReports as string, cur: quarterlyData.current.total, delta: quarterlyData.qoqDelta.total },
          ].map((item) => (
            <Card key={item.label} className="!p-5">
              <p className="text-xs font-medium text-ds-text-subtle mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-ds-text-primary tracking-tight">
                {item.cur}{item.suffix ?? ""}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <DeltaBadge value={item.delta} suffix={item.suffix === "%" ? "pp" : ""} />
                <span className="text-xs text-ds-text-subtle">{CONTENT.analytics.quarterlyQoqLabel as string}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Monthly breakdown within quarter */}
        {quarterlyData.monthlyBreakdown.length > 0 && (
          <ChartCard title={CONTENT.analytics.quarterlyTitle as string}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={quarterlyData.monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ds-border-subtle)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--ds-text-subtle)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="submitted" name={CONTENT.analytics.chartLabels.submitted as string} fill="var(--ds-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name={CONTENT.analytics.chartLabels.approved as string} fill="var(--ds-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Top campuses this quarter */}
        {canSeeCrossCampus && quarterlyBrNamed.length > 0 && (
          <ChartCard title={CONTENT.analytics.quarterlyTopCampuses as string}>
            <div className="space-y-4">
              {quarterlyBrNamed.slice(0, 10).map((row) => (
                <div key={row.campusId}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-ds-text-primary truncate">{row.name}</span>
                    <span className="text-xs font-semibold text-ds-text-secondary ml-4 flex-shrink-0">
                      {row.complianceRate}%
                    </span>
                  </div>
                  <Progress
                    percent={Math.min(row.complianceRate, 100)}
                    showInfo={false}
                    strokeColor="var(--ds-brand-accent)"
                    trailColor="var(--ds-surface-sunken)"
                    size="small"
                  />
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    );

  const TAB_ITEMS = [
    { key: "overview", label: CONTENT.analytics.tab.overview as string, children: overviewTab },
    { key: "metrics", label: CONTENT.analytics.tab.metrics as string, children: metricsTab },
    { key: "trends", label: CONTENT.analytics.tab.trends as string, children: trendsTab },
    {
      key: "compliance",
      label: CONTENT.analytics.tab.compliance as string,
      children: complianceTab,
    },
    {
      key: "quarterly",
      label: CONTENT.analytics.tab.quarterly as string,
      children: quarterlyTab,
    },
  ];

  /* â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  return (
    <PageLayout>
      <PageHeader title={CONTENT.analytics.pageTitle as string} actions={sharedControls} />
      <Tabs items={TAB_ITEMS} destroyInactiveTabPane={false} />
    </PageLayout>
  );
}
````

## File: modules/reports/components/ReportDetailPage.tsx
````typescript
"use client";

/**
 * modules/reports/components/ReportDetailPage.tsx
 *
 * Unified role-aware report detail page.
 * Works for ALL roles — action buttons filtered by allowedRoles[].
 *
 * Report structure:
 *   Report → ReportSection[] (by reportId) → ReportMetric[] (by reportSectionId)
 * The Report record itself holds status + meta; field data is in the sections/metrics.
 */

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Descriptions, Tooltip, Tag } from "antd";
import { useRole } from "@/lib/hooks/useRole";
import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { getReportLabel, formatReportPeriod } from "@/lib/utils/reportUtils";
import { fmtDate, fmtDateTime } from "@/lib/utils/formatDate";
import { exportReportDetail } from "@/lib/utils/exportReports";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { ReportStatusBadge } from "@/components/ui/StatusBadge";
import { UserRole, ReportStatus, ReportEventType } from "@/types/global";

/* ── Action config ────────────────────────────────────────────────────────── */

interface ActionConfig {
  key: string;
  label: string;
  type: "primary" | "default" | "danger";
  icon: React.ReactNode;
  targetStatus: ReportStatus;
  eventType: ReportEventType;
  /** Only shown when report is in one of these statuses */
  visibleWhen: ReportStatus[];
  allowedRoles: UserRole[];
}

const REPORT_ACTIONS: ActionConfig[] = [
  {
    key: "approve",
    label: CONTENT.reports.actions?.approve ?? "Approve",
    type: "primary",
    icon: <CheckOutlined />,
    targetStatus: ReportStatus.APPROVED,
    eventType: ReportEventType.APPROVED,
    visibleWhen: [ReportStatus.SUBMITTED, ReportStatus.REVIEWED],
    allowedRoles: [
      UserRole.CAMPUS_PASTOR,
      UserRole.GROUP_PASTOR,
      UserRole.GROUP_ADMIN,
      UserRole.CHURCH_MINISTRY,
      UserRole.CEO,
      UserRole.SPO,
      UserRole.SUPERADMIN,
    ],
  },
  {
    key: "review",
    label: CONTENT.reports.actions?.review ?? "Mark Reviewed",
    type: "default",
    icon: <CheckCircleOutlined />,
    targetStatus: ReportStatus.REVIEWED,
    eventType: ReportEventType.REVIEWED,
    visibleWhen: [ReportStatus.SUBMITTED],
    allowedRoles: [
      UserRole.CAMPUS_PASTOR,
      UserRole.GROUP_PASTOR,
      UserRole.GROUP_ADMIN,
      UserRole.CHURCH_MINISTRY,
      UserRole.CEO,
      UserRole.SPO,
      UserRole.SUPERADMIN,
    ],
  },
  {
    key: "request-edits",
    label: CONTENT.reports.actions?.requestEdit ?? "Request Edits",
    type: "danger",
    icon: <CloseOutlined />,
    targetStatus: ReportStatus.REQUIRES_EDITS,
    eventType: ReportEventType.EDIT_REQUESTED,
    visibleWhen: [ReportStatus.SUBMITTED, ReportStatus.REVIEWED],
    allowedRoles: [
      UserRole.CAMPUS_PASTOR,
      UserRole.GROUP_PASTOR,
      UserRole.GROUP_ADMIN,
      UserRole.CHURCH_MINISTRY,
      UserRole.CEO,
      UserRole.SPO,
      UserRole.SUPERADMIN,
    ],
  },
  {
    key: "lock",
    label: CONTENT.reports.actions?.lock ?? "Lock",
    type: "danger",
    icon: <LockOutlined />,
    targetStatus: ReportStatus.LOCKED,
    eventType: ReportEventType.LOCKED,
    visibleWhen: [ReportStatus.APPROVED],
    allowedRoles: [UserRole.SUPERADMIN],
  },
];

/* ── Audit trail event config ───────────────────────────────────────────── */

const rk = CONTENT.reports as Record<string, unknown>;
const eventLabels = (rk.eventLabels ?? {}) as Record<string, string>;

interface AuditEventConfig {
  icon: React.ReactNode;
  color: string; // Ant Tag color
  dotColor: string; // timeline dot CSS class
}

const AUDIT_EVENT_CONFIG: Record<string, AuditEventConfig> = {
  [ReportEventType.CREATED]: {
    icon: <PlusCircleOutlined />,
    color: "blue",
    dotColor: "bg-blue-500",
  },
  [ReportEventType.SUBMITTED]: { icon: <SendOutlined />, color: "cyan", dotColor: "bg-cyan-500" },
  [ReportEventType.EDIT_REQUESTED]: {
    icon: <ExclamationCircleOutlined />,
    color: "orange",
    dotColor: "bg-orange-400",
  },
  [ReportEventType.EDIT_SUBMITTED]: {
    icon: <SyncOutlined />,
    color: "purple",
    dotColor: "bg-purple-400",
  },
  [ReportEventType.EDIT_APPROVED]: {
    icon: <CheckCircleOutlined />,
    color: "green",
    dotColor: "bg-green-500",
  },
  [ReportEventType.EDIT_REJECTED]: {
    icon: <CloseOutlined />,
    color: "red",
    dotColor: "bg-red-400",
  },
  [ReportEventType.EDIT_APPLIED]: {
    icon: <CheckOutlined />,
    color: "green",
    dotColor: "bg-green-500",
  },
  [ReportEventType.APPROVED]: {
    icon: <CheckCircleOutlined />,
    color: "green",
    dotColor: "bg-green-500",
  },
  [ReportEventType.REVIEWED]: {
    icon: <CheckCircleOutlined />,
    color: "geekblue",
    dotColor: "bg-blue-400",
  },
  [ReportEventType.LOCKED]: { icon: <LockOutlined />, color: "red", dotColor: "bg-red-500" },
  [ReportEventType.DEADLINE_PASSED]: {
    icon: <ClockCircleOutlined />,
    color: "volcano",
    dotColor: "bg-orange-500",
  },
  [ReportEventType.UPDATE_REQUESTED]: {
    icon: <ExclamationCircleOutlined />,
    color: "orange",
    dotColor: "bg-orange-400",
  },
  [ReportEventType.UPDATE_APPROVED]: {
    icon: <CheckOutlined />,
    color: "green",
    dotColor: "bg-green-500",
  },
  [ReportEventType.UPDATE_REJECTED]: {
    icon: <CloseOutlined />,
    color: "red",
    dotColor: "bg-red-400",
  },
  [ReportEventType.DATA_ENTRY_CREATED]: {
    icon: <FileTextOutlined />,
    color: "blue",
    dotColor: "bg-blue-500",
  },
  [ReportEventType.TEMPLATE_VERSION_NOTE]: {
    icon: <FileTextOutlined />,
    color: "default",
    dotColor: "bg-gray-400",
  },
  [ReportEventType.AUTO_APPROVED]: {
    icon: <ThunderboltOutlined />,
    color: "gold",
    dotColor: "bg-yellow-400",
  },
};

function getEventConfig(eventType: string): AuditEventConfig {
  return (
    AUDIT_EVENT_CONFIG[eventType] ?? {
      icon: <FileTextOutlined />,
      color: "default",
      dotColor: "bg-ds-text-subtle",
    }
  );
}

/* ── ReportDetailPage ─────────────────────────────────────────────────────── */

interface ReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id: reportId } = use(params);
  const { role, can } = useRole();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const isSuperadmin = role === UserRole.SUPERADMIN;

  /* ── Data fetching ─────────────────────────────────────────────────── */

  const { data: report, refetch: refetchReport } = useApiData<Report>(
    API_ROUTES.reports.detail(reportId),
  );

  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

  const { data: events } = useApiData<ReportEvent[]>(API_ROUTES.reports.history(reportId));

  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);

  const { data: users } = useApiData<UserProfile[]>(API_ROUTES.users.list);

  /* ── Derived data ───────────────────────────────────────────────────────── */

  const campus = useMemo(
    () => (campuses ?? []).find((c) => c.id === report?.campusId),
    [campuses, report],
  );

  const submitter = useMemo(
    () => (users ?? []).find((u) => !!report?.submittedById && u.id === report.submittedById),
    [users, report],
  );

  const sortedEvents = useMemo(
    () =>
      [...(events ?? [])].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
    [events],
  );

  const template = useMemo(
    () => (templates ?? []).find((t) => t.id === report?.templateId) ?? null,
    [templates, report?.templateId],
  );

  // Report detail API returns sections with nested metrics
  type SectionWithMetrics = ReportSection & { metrics: ReportMetric[] };
  const sectionsWithMetrics = useMemo(() => {
    const secs: SectionWithMetrics[] =
      (report as Report & { sections?: SectionWithMetrics[] })?.sections ?? [];
    return secs.map((s: SectionWithMetrics) => ({
      section: s as ReportSection,
      metrics: s.metrics ?? [],
    }));
  }, [report]);

  /* ── Action handler ─────────────────────────────────────────────────────── */

  async function handleAction(action: ActionConfig) {
    if (!report) return;
    const endpointMap: Record<string, string> = {
      approve: API_ROUTES.reports.approve(report.id),
      review: API_ROUTES.reports.review(report.id),
      "request-edits": API_ROUTES.reports.requestEdit(report.id),
      lock: API_ROUTES.reports.lock(report.id),
    };
    const url = endpointMap[action.key];
    if (!url) return;
    await fetch(url, { method: "POST", credentials: "include" });
    refetchReport();
  }

  /* ── Loading / not found ────────────────────────────────────────────────── */

  const isLoading = report === undefined || templates === undefined || events === undefined;

  if (isLoading) return <LoadingSkeleton rows={6} />;

  if (!report) {
    return (
      <PageLayout>
        <EmptyState title={CONTENT.common.errorNotFound} description="" />
      </PageLayout>
    );
  }

  /* ── Visible actions ────────────────────────────────────────────────────── */

  const visibleActions = REPORT_ACTIONS.filter(
    (a) => role && a.allowedRoles.includes(role) && a.visibleWhen.includes(report.status),
  );

  /* ── Edit button ────────────────────────────────────────────────────────── */

  const canEdit =
    can.fillReports &&
    (report.status === ReportStatus.DRAFT || report.status === ReportStatus.REQUIRES_EDITS);

  const backHref = APP_ROUTES.reports;
  const reportLabel = getReportLabel(report, templates ?? []);

  return (
    <PageLayout>
      <PageHeader
        title={reportLabel}
        subtitle={formatReportPeriod(report)}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(backHref)}>
              {CONTENT.common.back ?? "Back"}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                const secs = sectionsWithMetrics.map((s) => s.section);
                const mets = sectionsWithMetrics.flatMap((s) => s.metrics);
                exportReportDetail(
                  report,
                  secs,
                  mets,
                  templates ?? [],
                  campuses ?? [],
                  users ?? [],
                );
              }}
            >
              {(rk.export as Record<string, string>).button}
            </Button>
            {canEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(APP_ROUTES.reportEdit(report.id))}
              >
                {CONTENT.common.edit}
              </Button>
            )}
            {visibleActions.map((action) => (
              <Button
                key={action.key}
                type={action.type === "danger" ? "default" : action.type}
                danger={action.type === "danger"}
                icon={action.icon}
                onClick={() => handleAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        }
      />

      {/* Status badge */}
      <div className="mb-6">
        <ReportStatusBadge status={report.status} />
      </div>

      {/* Metadata */}
      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5 mb-6">
        <h2 className="text-sm font-semibold text-ds-text-primary mb-3">
          {CONTENT.reports.metadata?.title ?? "Details"}
        </h2>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label={CONTENT.reports.columnLabels?.campus ?? "Campus"}>
            {campus?.name ?? report.campusId}
          </Descriptions.Item>
          <Descriptions.Item label={CONTENT.reports.columnLabels?.period ?? "Period"}>
            {formatReportPeriod(report)}
          </Descriptions.Item>
          <Descriptions.Item label={CONTENT.reports.columnLabels?.deadline ?? "Deadline"}>
            {fmtDate(report.deadline)}
          </Descriptions.Item>
          <Descriptions.Item label={CONTENT.reports.columnLabels?.status ?? "Status"}>
            <ReportStatusBadge status={report.status} />
          </Descriptions.Item>
          {submitter && (
            <Descriptions.Item label={CONTENT.reports.columnLabels?.submittedBy ?? "Submitted by"}>
              {submitter.firstName} {submitter.lastName}
            </Descriptions.Item>
          )}
          {report.lockedAt && (
            <Descriptions.Item label={CONTENT.reports.columnLabels?.lockedAt ?? "Locked at"}>
              {fmtDate(report.lockedAt)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {/* Report sections + metrics */}
      <div className="space-y-4 mb-6">
        {/* Case A: saved section data exists (report was submitted through the form) */}
        {sectionsWithMetrics.length > 0 &&
          sectionsWithMetrics.map(({ section, metrics: sectionMetrics }) => (
            <div
              key={section.id}
              className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5"
            >
              <h3 className="text-sm font-semibold text-ds-text-primary mb-3">
                {section.sectionName}
              </h3>
              {sectionMetrics.length === 0 ? (
                <p className="text-xs text-ds-text-subtle">{CONTENT.common.noResultsDescription}</p>
              ) : (
                <div className="divide-y divide-ds-border-subtle">
                  {sectionMetrics.map((m) => (
                    <div key={m.id} className="py-2 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm text-ds-text-secondary">{m.metricName}</p>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-ds-text-primary tabular-nums">
                            {m.monthlyAchieved ?? "—"}
                            {m.monthlyGoal !== undefined && (
                              <span className="text-ds-text-subtle font-normal">
                                {" "}
                                / {m.monthlyGoal}
                              </span>
                            )}
                          </p>
                          {m.computedPercentage !== undefined && (
                            <p className="text-xs text-ds-text-subtle tabular-nums">
                              {Math.round(m.computedPercentage)}%
                            </p>
                          )}
                        </div>
                      </div>
                      {m.comment && (
                        <p className="text-xs text-ds-text-secondary italic pl-2 border-l-2 border-ds-border-subtle">
                          {m.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        {/* Case B: no saved section data — render the template structure as a read-only skeleton */}
        {sectionsWithMetrics.length === 0 &&
          template &&
          template.sections.length > 0 &&
          [...template.sections]
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div
                key={section.id}
                className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5"
              >
                <h3 className="text-sm font-semibold text-ds-text-primary mb-3">{section.name}</h3>
                {section.metrics.length === 0 ? (
                  <p className="text-xs text-ds-text-subtle">
                    {CONTENT.common.noResultsDescription}
                  </p>
                ) : (
                  <div className="divide-y divide-ds-border-subtle">
                    {[...section.metrics]
                      .sort((a, b) => a.order - b.order)
                      .map((m) => (
                        <div key={m.id} className="py-2">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-ds-text-secondary">{m.name}</p>
                            <p className="text-sm text-ds-text-subtle tabular-nums">—</p>
                          </div>
                          {m.description && (
                            <p className="text-xs text-ds-text-subtle mt-0.5">{m.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}

        {/* Case C: no template — nothing to show */}
        {sectionsWithMetrics.length === 0 && !template && (
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
            <p className="text-sm text-ds-text-subtle">{CONTENT.common.noResultsDescription}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {report.notes && (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5 mb-6">
          <h3 className="text-sm font-semibold text-ds-text-primary mb-2">
            {CONTENT.reports.notesLabel ?? "Notes"}
          </h3>
          <p className="text-sm text-ds-text-secondary whitespace-pre-wrap">{report.notes}</p>
        </div>
      )}

      {/* Audit Trail */}
      <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
        <h3 className="text-sm font-semibold text-ds-text-primary mb-5">
          {rk.auditTrailTitle as string}
        </h3>
        {sortedEvents.length === 0 ? (
          <p className="text-sm text-ds-text-subtle">{CONTENT.dashboard.noActivity}</p>
        ) : (
          <ol className="relative border-l-2 border-ds-border-base ml-3 space-y-0">
            {sortedEvents.map((ev, idx) => {
              const actor = (users ?? []).find((u) => u.id === ev.actorId);
              const cfg = getEventConfig(ev.eventType);
              const label = eventLabels[ev.eventType] ?? ev.eventType;
              const isFirst = idx === 0;
              const isLast = idx === sortedEvents.length - 1;

              return (
                <li key={ev.id} className={`ml-6 relative ${isLast ? "" : "pb-5"}`}>
                  {/* Timeline dot */}
                  <span
                    className={`absolute -left-[calc(1.5rem+5px)] top-1 flex items-center justify-center w-4 h-4 rounded-full ring-2 ring-ds-surface-elevated ${cfg.dotColor}`}
                  />
                  {/* Content */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag color={cfg.color} className="text-xs m-0">
                        {cfg.icon}
                        <span className="ml-1">{label}</span>
                      </Tag>
                      {ev.previousStatus && ev.newStatus && (
                        <span className="text-[10px] text-ds-text-subtle">
                          {ev.previousStatus} → {ev.newStatus}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ds-text-subtle">
                      <time>{fmtDateTime(ev.timestamp)}</time>
                      {actor && (
                        <span>
                          · {actor.firstName} {actor.lastName}
                        </span>
                      )}
                    </div>
                    {ev.details && (
                      <p className="text-xs text-ds-text-secondary mt-0.5 italic border-l-2 border-ds-border-subtle pl-2">
                        {ev.details}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </PageLayout>
  );
}
````

## File: modules/reports/components/ReportNewPage.tsx
````typescript
"use client";

/**
 * modules/reports/components/ReportNewPage.tsx
 *
 * Create a new draft report. After selecting a template the full section/metric
 * form appears so the reporter can enter all data before saving the draft.
 * Goals for the campus + period are loaded from /api/goals/for-report and
 * pre-populated into the form as read-only goal values.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Form, message, Select, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { SaveOutlined } from "@ant-design/icons";

dayjs.extend(weekOfYear);
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  ReportSectionsForm,
  buildSectionsPayload,
  type MetricValues,
  type GoalsForReportMap,
} from "./ReportSectionsForm";
import { ReportPeriodType } from "@/types/global";

/* ---- Period type options ---- */

const PERIOD_TYPE_OPTIONS = [
  { value: ReportPeriodType.WEEKLY, label: "Weekly" },
  { value: ReportPeriodType.MONTHLY, label: "Monthly" },
  { value: ReportPeriodType.YEARLY, label: "Yearly" },
];

/* ---- Form values ---- */

/** Only fields that live in the Ant Design Form store. Period date fields are
 *  derived from the controlled pickerValue state at submit time. */
interface NewReportFormValues {
  title: string;
  templateId: string;
  campusId: string;
  periodType: ReportPeriodType;
  notes?: string;
}

/* ---- Component ---- */

export function ReportNewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { can } = useRole();
  const [form] = Form.useForm<NewReportFormValues>();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  /* Template sections state */
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [metricValues, setMetricValues] = useState<Record<string, MetricValues>>({});
  const [goalsMap, setGoalsMap] = useState<GoalsForReportMap>({});
  const [goalsLoading, setGoalsLoading] = useState(false);

  // pickerValue is the single source of truth for the selected period
  const [pickerValue, setPickerValue] = useState<Dayjs | null>(null);

  // Watched form values for goal resolution
  const periodType = Form.useWatch("periodType", form) as ReportPeriodType | undefined;
  const campusId = Form.useWatch("campusId", form) as string | undefined;

  useEffect(() => {
    const load = async () => {
      const [tsRes, csRes] = await Promise.all([
        fetch(API_ROUTES.reportTemplates.list, { credentials: "include" }),
        fetch(API_ROUTES.org.campuses, { credentials: "include" }),
      ]);
      const [tsJson, csJson] = await Promise.all([tsRes.json(), csRes.json()]);
      const ts: ReportTemplate[] = tsJson.success ? tsJson.data : [];
      const cs: Campus[] = csJson.success ? csJson.data : [];
      setTemplates(ts);
      setCampuses(cs);

      if (user?.campusId) {
        form.setFieldValue("campusId", user.campusId);
      }

      // Default to the current month in the date picker
      setPickerValue(dayjs());

      const defaultTemplate = ts.find(
        (t) => (t as ReportTemplate & { isDefault?: boolean }).isDefault,
      );
      if (defaultTemplate) {
        form.setFieldValue("templateId", defaultTemplate.id);
        setSelectedTemplate(defaultTemplate);
      }
      setDataLoading(false);
    };
    load();
  }, [user, form]);

  /* Load goals whenever campus + period changes */
  useEffect(() => {
    const resolvedCampusId = campusId ?? user?.campusId;
    if (!resolvedCampusId || !pickerValue) return;

    const year = pickerValue.year();
    const month = periodType === ReportPeriodType.MONTHLY ? pickerValue.month() + 1 : undefined;

    setGoalsLoading(true);
    const params = new URLSearchParams({ campusId: resolvedCampusId, year: String(year) });
    if (month) params.set("month", String(month));

    fetch(`${API_ROUTES.goals.list.replace("/api/goals", "/api/goals/for-report")}?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setGoalsMap(json.data as GoalsForReportMap);
      })
      .catch(() => {
        /* non-fatal */
      })
      .finally(() => setGoalsLoading(false));
  }, [campusId, user?.campusId, pickerValue, periodType]);

  /* When template changes, reset metric values (but keep goals) */
  const handleTemplateChange = useCallback(
    (templateId: string) => {
      const tmpl = templates.find((t) => t.id === templateId) ?? null;
      setSelectedTemplate(tmpl);
      setMetricValues({});
    },
    [templates],
  );

  const handleMetricChange = useCallback((metricId: string, v: MetricValues) => {
    setMetricValues((prev) => ({ ...prev, [metricId]: v }));
  }, []);

  /** Called when the user picks a date — derives periodYear/Month/Week + label. */
  const handlePickerChange = useCallback((value: Dayjs | null) => {
    setPickerValue(value);
  }, []);

  /** When period type changes, reset the picker so the user re-selects. */
  const handlePeriodTypeChange = useCallback(() => {
    setPickerValue(null);
  }, []);

  const handleSubmit = async (values: NewReportFormValues) => {
    if (!pickerValue) {
      message.error("Please select a report period.");
      return;
    }
    setLoading(true);
    try {
      // Derive period fields from the controlled DatePicker value
      const periodYear = pickerValue.year();
      let periodMonth: number | undefined;
      let periodWeek: number | undefined;
      let period: string;

      if (values.periodType === ReportPeriodType.WEEKLY) {
        periodWeek = pickerValue.week();
        period = `Week ${String(periodWeek).padStart(2, "0")}, ${periodYear}`;
      } else if (values.periodType === ReportPeriodType.YEARLY) {
        period = String(periodYear);
      } else {
        periodMonth = pickerValue.month() + 1;
        period = pickerValue.format("MMMM YYYY");
      }

      const sections = selectedTemplate
        ? buildSectionsPayload(selectedTemplate, metricValues, goalsMap)
        : [];

      const res = await fetch(API_ROUTES.reports.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, periodYear, periodMonth, periodWeek, period, sections }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.common.errorDefault as string));
        return;
      }
      message.success(CONTENT.common.successSave as string);
      router.push(APP_ROUTES.reportDetail(json.data.id));
    } catch {
      message.error(CONTENT.common.errorDefault as string);
    } finally {
      setLoading(false);
    }
  };

  if (!can.createReports) {
    router.replace(APP_ROUTES.reports);
    return null;
  }

  if (dataLoading) {
    return (
      <PageLayout title={CONTENT.reports.newReport as string}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={CONTENT.reports.newReport as string}
      actions={<Button onClick={() => router.back()}>{CONTENT.common.cancel as string}</Button>}
    >
      <div className="max-w-4xl space-y-6">
        {/* Meta fields */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ periodType: ReportPeriodType.MONTHLY }}
          >
            <Form.Item
              name="title"
              label={CONTENT.reports.columnLabels.title as string}
              rules={[{ required: true, message: "Report title is required." }]}
            >
              <Input placeholder="e.g. Lekki Campus — March 2025" size="large" />
            </Form.Item>

            <Form.Item
              name="templateId"
              label={CONTENT.templates.nameLabel as string}
              rules={[{ required: true, message: "Please select a template." }]}
            >
              <Select
                size="large"
                placeholder="Select a template"
                options={templates.map((t) => ({ value: t.id, label: t.name }))}
                onChange={handleTemplateChange}
              />
            </Form.Item>

            <Form.Item
              name="campusId"
              label={CONTENT.reports.campusLabel as string}
              rules={[{ required: true, message: "Please select a campus." }]}
            >
              <Select
                size="large"
                placeholder="Select campus"
                disabled={!!user?.campusId}
                options={campuses.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                name="periodType"
                label={CONTENT.reports.metadata.periodTypeLabel as string}
                rules={[{ required: true }]}
              >
                <Select
                  size="large"
                  options={PERIOD_TYPE_OPTIONS}
                  onChange={handlePeriodTypeChange}
                />
              </Form.Item>

              <Form.Item
                label={
                  periodType === ReportPeriodType.WEEKLY
                    ? (CONTENT.reports.metadata.weekLabel as string)
                    : periodType === ReportPeriodType.YEARLY
                      ? (CONTENT.reports.metadata.yearLabel as string)
                      : (CONTENT.reports.metadata.monthLabel as string)
                }
                required
              >
                <DatePicker
                  className="w-full"
                  size="large"
                  picker={
                    periodType === ReportPeriodType.WEEKLY
                      ? "week"
                      : periodType === ReportPeriodType.YEARLY
                        ? "year"
                        : "month"
                  }
                  format={
                    periodType === ReportPeriodType.WEEKLY
                      ? "[Week] ww, YYYY"
                      : periodType === ReportPeriodType.YEARLY
                        ? "YYYY"
                        : "MMMM YYYY"
                  }
                  value={pickerValue}
                  onChange={handlePickerChange}
                />
              </Form.Item>
            </div>

            <Form.Item name="notes" label={CONTENT.reports.notesLabel as string}>
              <Input.TextArea rows={3} placeholder={CONTENT.reports.notesPlaceholder as string} />
            </Form.Item>

            {/* Template sections form */}
            {selectedTemplate && (
              <div className="mt-6">
                {goalsLoading && (
                  <p className="text-xs text-ds-text-subtle mb-3">
                    {CONTENT.reports.goalsLoading as string}
                  </p>
                )}
                <ReportSectionsForm
                  template={selectedTemplate}
                  metricValues={metricValues}
                  goalsMap={goalsMap}
                  onMetricChange={handleMetricChange}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => router.back()}>{CONTENT.common.cancel as string}</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                {CONTENT.reports.saveDraft as string}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
````

## File: modules/users/components/InvitesPage.tsx
````typescript
"use client";

/**
 * modules/users/components/InvitesPage.tsx
 * Invite link management — generate, list, copy, and revoke invite links.
 * Visible to roles that can invite others (see allowedRoles in nav.ts).
 */

import { useState, useMemo } from "react";
import { Form, Select, message, Tooltip, Tag, Space, Popconfirm, Empty } from "antd";
import { PlusOutlined, CopyOutlined, StopOutlined, LinkOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { UserRole, HIERARCHY_ORDER } from "@/types/global";
import { fmtDateTime } from "@/lib/utils/formatDate";
import Button from "@/components/ui/Button";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ROLE_CONFIG } from "@/config/roles";
import { CAMPUS_SCOPED_ROLES, GROUP_SCOPED_ROLES } from "@/config/hierarchy";
import Table from "@/components/ui/Table";

/* ── Invitable roles: hierarchy-based ───────────────────────────────────────── */

/**
 * Returns the roles that a given user role can invite.
 * SUPERADMIN can invite any role (except SUPERADMIN itself).
 * All other roles can only invite roles BELOW them in the hierarchy
 * (higher HIERARCHY_ORDER number = lower in hierarchy).
 */
function getInvitableRoles(currentRole: UserRole): UserRole[] {
  const currentOrder = HIERARCHY_ORDER[currentRole];
  const allRoles = Object.keys(HIERARCHY_ORDER) as UserRole[];

  if (currentRole === UserRole.SUPERADMIN) {
    return allRoles.filter((r) => r !== UserRole.SUPERADMIN);
  }

  return allRoles.filter((r) => HIERARCHY_ORDER[r] > currentOrder);
}

/* ── Expiry options (matches content.ts) ───────────────────────────────────── */

const EXPIRY_OPTIONS = Object.entries(CONTENT.invites.expiryOptions as Record<string, string>).map(
  ([value, label]) => ({ value: Number(value), label }),
);

/* ── Status helpers ──────────────────────────────────────────────────────────── */

type InviteStatus = "active" | "used" | "expired" | "revoked";

function getInviteStatus(link: InviteLink): InviteStatus {
  if (!link.isActive) return "revoked";
  if (link.usedAt) return "used";
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) return "expired";
  return "active";
}

const STATUS_TAG_MAP: Record<InviteStatus, { color: string; label: string }> = {
  active: { color: "green", label: CONTENT.invites.statusActive as string },
  used: { color: "blue", label: CONTENT.invites.statusUsed as string },
  expired: { color: "orange", label: CONTENT.invites.statusExpired as string },
  revoked: { color: "red", label: CONTENT.invites.statusRevoked as string },
};

/* ── InviteLink interface ─────────────────────────────────────────────────────  */

interface InviteLink {
  id: string;
  token: string;
  targetRole: UserRole;
  campusId?: string;
  orgGroupId?: string;
  note?: string;
  expiresAt?: string;
  usedAt?: string;
  isActive: boolean;
  createdAt: string;
  createdById: string;
}

/* ── Create-invite form ────────────────────────────────────────────────────── */

interface CreateFormProps {
  currentRole: UserRole;
  onCreated: () => void;
}

function CreateInviteForm({ currentRole, onCreated }: CreateFormProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const selectedRole = Form.useWatch("targetRole", form) as UserRole | undefined;

  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const { data: orgGroups } = useApiData<OrgGroup[]>(API_ROUTES.org.groups);

  const invitableRoles = getInvitableRoles(currentRole);
  if (invitableRoles.length === 0) return null;

  const roleOptions = invitableRoles.map((r) => ({
    value: r,
    label: ROLE_CONFIG[r]?.label ?? r,
  }));

  const showCampusField = selectedRole ? CAMPUS_SCOPED_ROLES.includes(selectedRole) : false;
  const showGroupField = selectedRole ? GROUP_SCOPED_ROLES.includes(selectedRole) : false;

  const campusOptions = (campuses ?? []).map((c) => ({ value: c.id, label: c.name }));
  const groupOptions = (orgGroups ?? []).map((g) => ({ value: g.id, label: g.name }));

  const handleSubmit = async (values: {
    targetRole: UserRole;
    expiresInHours: number;
    note?: string;
    campusId?: string;
    groupId?: string;
  }) => {
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.inviteLinks.list, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success("Invite link generated!");
      form.resetFields();
      onCreated();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5 mb-6">
      <h2 className="text-base font-semibold text-ds-text-primary mb-4">
        {CONTENT.invites.newInvite as string}
      </h2>
      <Form
        form={form}
        layout="inline"
        onFinish={handleSubmit}
        requiredMark={false}
        className="flex flex-wrap gap-3 items-end"
      >
        <Form.Item
          name="targetRole"
          label={CONTENT.invites.targetRoleLabel as string}
          rules={[{ required: true }]}
          className="min-w-[180px]"
        >
          <Select options={roleOptions} placeholder="Select role" onChange={() => {
            form.setFieldsValue({ campusId: undefined, groupId: undefined });
          }} />
        </Form.Item>
        {showCampusField && (
          <Form.Item
            name="campusId"
            label={CONTENT.invites.campusLabel as string ?? "Campus"}
            rules={[{ required: true, message: "Campus is required for this role" }]}
            className="min-w-[180px]"
          >
            <Select options={campusOptions} placeholder="Select campus" allowClear />
          </Form.Item>
        )}
        {showGroupField && (
          <Form.Item
            name="groupId"
            label={CONTENT.invites.groupLabel as string ?? "Group"}
            rules={[{ required: true, message: "Group is required for this role" }]}
            className="min-w-[180px]"
          >
            <Select options={groupOptions} placeholder="Select group" allowClear />
          </Form.Item>
        )}
        <Form.Item
          name="expiresInHours"
          label={CONTENT.invites.expiresInLabel as string}
          initialValue={72}
          className="min-w-[160px]"
        >
          <Select options={EXPIRY_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="note"
          label={CONTENT.invites.noteLabel as string}
          className="min-w-[220px]"
        >
          <input
            className="border border-ds-border-base rounded-ds-md px-3 py-1.5 text-sm bg-ds-surface-base text-ds-text-primary focus:outline-none focus:ring-2 focus:ring-ds-brand-accent w-full"
            placeholder={CONTENT.invites.notePlaceholder as string}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={saving}>
            {CONTENT.invites.generateButton as string}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

/* ── InvitesPage ──────────────────────────────────────────────────────────── */

export function InvitesPage() {
  const { user } = useAuth();

  const { data: links, refetch } = useApiData<InviteLink[]>(API_ROUTES.inviteLinks.list);

  if (!user) return <LoadingSkeleton rows={5} />;

  const handleCopy = async (token: string) => {
    const url = `${window.location.origin}/join?token=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      message.success(CONTENT.invites.copiedLink as string);
    } catch {
      message.error("Could not copy to clipboard.");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(API_ROUTES.inviteLinks.revoke(id), { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success("Invite link revoked.");
      refetch();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    }
  };

  const TABLE_COLUMNS = [
    {
      title: CONTENT.invites.targetRoleLabel as string,
      dataIndex: "targetRole" as keyof InviteLink,
      key: "targetRole",
      render: (role: UserRole) => ROLE_CONFIG[role]?.label ?? role,
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, row: InviteLink) => {
        const status = getInviteStatus(row);
        const { color, label } = STATUS_TAG_MAP[status];
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: CONTENT.invites.expiresAtLabel as string,
      dataIndex: "expiresAt" as keyof InviteLink,
      key: "expiresAt",
      render: (v?: string) => fmtDateTime(v),
    },
    {
      title: CONTENT.invites.usedAtLabel as string,
      dataIndex: "usedAt" as keyof InviteLink,
      key: "usedAt",
      render: (v?: string) => fmtDateTime(v),
    },
    {
      title: CONTENT.invites.noteLabel as string,
      dataIndex: "note" as keyof InviteLink,
      key: "note",
      render: (v?: string) => v ?? "—",
    },
    {
      title: CONTENT.invites.createdAtLabel as string,
      dataIndex: "createdAt" as keyof InviteLink,
      key: "createdAt",
      render: (v: string) => fmtDateTime(v),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, row: InviteLink) => {
        const status = getInviteStatus(row);
        return (
          <Space>
            <Tooltip title={CONTENT.invites.copyLink as string}>
              <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopy(row.token)} />
            </Tooltip>
            {status === "active" && (
              <Popconfirm
                title={CONTENT.invites.deleteConfirm as string}
                onConfirm={() => handleRevoke(row.id)}
                okText={CONTENT.common.confirm as string}
                cancelText={CONTENT.common.cancel as string}
              >
                <Tooltip title={CONTENT.invites.revokeLink as string}>
                  <Button size="small" danger icon={<StopOutlined />} />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const isEmpty = !links || links.length === 0;

  return (
    <PageLayout>
      <PageHeader title={CONTENT.invites.pageTitle as string} icon={<LinkOutlined />} />

      <CreateInviteForm currentRole={user.role} onCreated={() => refetch()} />

      {!links ? (
        <LoadingSkeleton rows={4} />
      ) : isEmpty ? (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-12 flex flex-col items-center gap-3">
          <Empty
            description={
              <span className="text-ds-text-secondary">
                {(CONTENT.invites.emptyState as { title: string; description: string }).description}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden">
          <Table<InviteLink>
            columns={TABLE_COLUMNS}
            dataSource={links}
            rowKey="id"
            scroll={{ x: true }}
          />
        </div>
      )}
    </PageLayout>
  );
}
````

## File: modules/users/components/UserDetailPage.tsx
````typescript
"use client";

/**
 * modules/users/components/UserDetailPage.tsx
 * View and manage a user — change role, activate/deactivate.
 * SUPERADMIN only.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, Switch, message, Descriptions, Tag } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  SaveOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { formatReportPeriod } from "@/lib/utils/reportUtils";
import { fmtDate } from "@/lib/utils/formatDate";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserRole } from "@/types/global";

const ROLE_OPTIONS = Object.values(UserRole)
  .filter((r) => r !== UserRole.SUPERADMIN)
  .map((r) => ({
    value: r,
    label: CONTENT.users.roles[r as keyof typeof CONTENT.users.roles] ?? r,
  }));

interface PageProps {
  params: Promise<{ id: string }>;
}

export function UserDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editRole, setEditRole] = useState<UserRole | null>(null);
  const [editActive, setEditActive] = useState<boolean | null>(null);

  if (!resolvedId) {
    params.then((p) => setResolvedId(p.id));
  }

  const { data: user, refetch: refetchUser } = useApiData<UserProfile>(
    resolvedId ? API_ROUTES.users.detail(resolvedId) : null,
  );

  const { data: campus } = useApiData<Campus>(
    user?.campusId ? API_ROUTES.org.campus(user.campusId) : null,
    [user?.campusId],
  );

  const displayRole = editRole ?? user?.role ?? UserRole.MEMBER;
  const displayActive = editActive ?? user?.isActive ?? true;

  const handleSave = async () => {
    if (!resolvedId || !user) return;
    const hasChanges = editRole !== null || editActive !== null;
    if (!hasChanges) {
      message.info("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (editRole !== null) body.role = editRole;
      if (editActive !== null) body.isActive = editActive;

      const res = await fetch(API_ROUTES.users.detail(resolvedId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.errors as Record<string, string>).generic);
        return;
      }
      message.success(CONTENT.common.successSave as string);
      setEditRole(null);
      setEditActive(null);
      refetchUser();
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic);
    } finally {
      setSaving(false);
    }
  };

  if (!resolvedId || user === undefined) {
    return (
      <PageLayout title={CONTENT.users.pageTitle as string}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout title={CONTENT.users.pageTitle as string}>
        <EmptyState
          icon={<UserOutlined />}
          title="User Not Found"
          description="This user does not exist or has been removed."
          action={
            <Button onClick={() => router.push(APP_ROUTES.users)}>
              {CONTENT.common.back as string}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const isSuperadmin = user.role === UserRole.SUPERADMIN;
  const hasUnsavedChanges = editRole !== null || editActive !== null;

  return (
    <PageLayout
      title={`${user.firstName} ${user.lastName}`}
      subtitle={user.email}
      actions={
        <div className="flex items-center gap-2">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(APP_ROUTES.users)}>
            {CONTENT.common.back as string}
          </Button>
          {hasUnsavedChanges && (
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              {CONTENT.common.save as string}
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-ds-brand-accent/10 flex items-center justify-center">
                <UserOutlined className="text-2xl text-ds-brand-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ds-text-primary">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-ds-text-secondary">{user.email}</p>
              </div>
              <div className="ml-auto">
                {displayActive ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    {CONTENT.users.activeStatus as string}
                  </Tag>
                ) : (
                  <Tag color="error" icon={<StopOutlined />}>
                    {CONTENT.users.inactiveStatus as string}
                  </Tag>
                )}
              </div>
            </div>

            <Descriptions
              column={2}
              size="small"
              labelStyle={{ color: "var(--ds-text-secondary)", fontSize: 12 }}
            >
              <Descriptions.Item label={CONTENT.users.campusLabel as string}>
                {campus?.name ?? user.campusId ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label={CONTENT.profile.phoneLabel as string}>
                {user.phone ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label={CONTENT.profile.memberSince as string}>
                {fmtDate(user.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label={CONTENT.profile.lastUpdated as string}>
                {fmtDate(user.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <RecentUserReports userId={user.id} />
        </div>

        {/* Right panel — management actions */}
        <div className="space-y-6">
          {!isSuperadmin && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
              <h3 className="text-sm font-semibold text-ds-text-primary mb-3">
                {CONTENT.users.roleLabel as string}
              </h3>
              <Select
                value={displayRole}
                options={ROLE_OPTIONS}
                onChange={(val) => setEditRole(val as UserRole)}
                size="large"
                className="w-full"
              />
              {editRole && (
                <p className="text-xs text-ds-text-subtle mt-2">Unsaved · will change on save.</p>
              )}
            </div>
          )}

          {!isSuperadmin && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
              <h3 className="text-sm font-semibold text-ds-text-primary mb-3">
                {CONTENT.users.statusLabel as string}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ds-text-secondary">
                  {displayActive
                    ? (CONTENT.users.activeStatus as string)
                    : (CONTENT.users.inactiveStatus as string)}
                </span>
                <Switch
                  checked={displayActive}
                  onChange={(v) => setEditActive(v)}
                  checkedChildren={<CheckCircleOutlined />}
                  unCheckedChildren={<StopOutlined />}
                />
              </div>
              <p className="text-xs text-ds-text-subtle mt-2">
                {displayActive
                  ? "User can log in and submit reports."
                  : "User cannot log in or take any action."}
              </p>
            </div>
          )}

          {isSuperadmin && (
            <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-subtle p-5">
              <p className="text-xs text-ds-text-subtle">
                Superadmin accounts cannot be modified from the user management panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

/* ── Recent reports sub-component ────────────────────────────────────────── */

function RecentUserReports({ userId }: { userId: string }) {
  const router = useRouter();

  const { data: reportsPage } = useApiData<{ reports: Report[]; total: number }>(
    API_ROUTES.reports.list,
  );
  const reports = reportsPage?.reports;

  const recent = reports
    ? [...reports]
        .filter(
          (r) =>
            r.submittedById === userId || r.createdById === userId || r.dataEntryById === userId,
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
    : [];

  return (
    <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6">
      <h3 className="text-sm font-semibold text-ds-text-primary mb-4">
        {CONTENT.users.recentReports as string}
      </h3>
      {recent.length === 0 ? (
        <p className="text-sm text-ds-text-subtle">{CONTENT.users.noReports as string}</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between py-2 border-b border-ds-border-subtle last:border-b-0"
            >
              <span className="text-sm text-ds-text-primary truncate max-w-xs">
                {formatReportPeriod(r)}
              </span>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <Tag>{r.status}</Tag>
                <Button size="small" onClick={() => router.push(APP_ROUTES.reportDetail(r.id))}>
                  {CONTENT.common.view as string}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
````

## File: providers/AuthProvider.tsx
````typescript
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { ROLE_DASHBOARD_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    checkAuth();

    // Re-validate auth when coming back online
    const handleOnline = () => checkAuth();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistUser = (u: AuthUser | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem("hrs:auth-user", JSON.stringify(u));
      } else {
        localStorage.removeItem("hrs:auth-user");
      }
    } catch {
      /* localStorage unavailable */
    }
  };

  const checkAuth = async () => {
    try {
      // 1. Try the access token first
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      if (meRes.ok) {
        const data: ApiResponse<AuthUser> = await meRes.json();
        if (data.success) {
          persistUser(data.data);
          return;
        }
      }

      // 2. Access token expired or invalid — attempt silent refresh
      if (meRes.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (refreshRes.ok) {
          const refreshData: ApiResponse<{ user: AuthUser }> = await refreshRes.json();
          if (refreshData.success) {
            persistUser(refreshData.data.user);
            return;
          }
        }
      }

      persistUser(null);
    } catch {
      // Network failure — fall back to cached user for offline resilience
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        try {
          const cached = localStorage.getItem("hrs:auth-user");
          if (cached) {
            setUser(JSON.parse(cached) as AuthUser);
            return;
          }
        } catch {
          /* localStorage unavailable */
        }
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe?: boolean,
    redirectTo?: string,
  ) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe: rememberMe ?? false }),
      credentials: "include",
    });

    const data: ApiResponse<{ user: AuthUser }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(!data.success ? data.error : "Login failed");
    }

    persistUser(data.data.user);
    message.success("Welcome back!");
    // Redirect to the `from` param if provided, otherwise fall back to role dashboard
    const destination = redirectTo ?? ROLE_DASHBOARD_ROUTES[data.data.user.role];
    router.push(destination);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // swallow — still clear state
    } finally {
      persistUser(null);
      message.success("Logged out successfully.");
      router.push("/login");
    }
  };

  const refreshToken = async () => {
    await checkAuth();
  };

  const value: AuthContextValue = { user, isLoading, login, logout, refreshToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Convenience: return current user's role or undefined */
export function useCurrentRole(): UserRole | undefined {
  const { user } = useAuth();
  return user?.role;
}

/** Returns true if user has at least one of the given roles */
export function useHasRole(roles: UserRole | UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(user.role);
}
````

## File: app/api/auth/login/route.ts
````typescript
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/data/db";
import {
    verifyPassword,
    generateTokens,
    setAuthCookies,
} from "@/lib/utils/auth";
import {
    successResponse,
    unauthorizedResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    rememberMe: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
    try {
        const body = LoginSchema.safeParse(await req.json());
        if (!body.success) return badRequestResponse("Invalid input");

        const { email, password, rememberMe } = body.data;

        const userProfile = await db.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
        if (!userProfile) return unauthorizedResponse("Invalid email or password");

        if (!userProfile.isActive) return unauthorizedResponse("Account is deactivated");

        if (!userProfile.passwordHash) return unauthorizedResponse("Invalid email or password");

        const valid = await verifyPassword(password, userProfile.passwordHash);
        if (!valid) return unauthorizedResponse("Invalid email or password");

        const authUser: AuthUser = {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role as AuthUser["role"],
            campusId: userProfile.campusId ?? undefined,
            orgGroupId: userProfile.orgGroupId ?? undefined,
            avatar: userProfile.avatar ?? undefined,
        };

        const tokens = generateTokens(authUser);
        await setAuthCookies(tokens, rememberMe);

        return NextResponse.json(successResponse({ user: authUser }), { status: 200 });
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: app/api/reports/route.ts
````typescript
/**
 * app/api/reports/route.ts
 * GET  /api/reports  — list reports (role-scoped)
 * POST /api/reports  — create a new draft report
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { verifyAuth } from "@/lib/utils/auth";
import { db, cache } from "@/lib/data/db";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    handleApiError,
} from "@/lib/utils/api";
import { ROLE_CONFIG } from "@/config/roles";
import { UserRole, ReportStatus, ReportPeriodType, ReportEventType, MetricCalculationType } from "@/types/global";

/* ── Query schema ──────────────────────────────────────────────────────────── */

const ListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.nativeEnum(ReportStatus).optional(),
    campusId: z.string().optional(),
    periodType: z.nativeEnum(ReportPeriodType).optional(),
    search: z.string().optional(),
    templateId: z.string().optional(),
});

/* ── Create schema ─────────────────────────────────────────────────────────── */

const CreateReportSchema = z.object({
    title: z.string().min(1).max(200),
    templateId: z.string().uuid(),
    campusId: z.string().uuid(),
    period: z.string().min(1),
    periodType: z.nativeEnum(ReportPeriodType),
    notes: z.string().optional(),
    sections: z.array(z.object({
        templateSectionId: z.string(),
        sectionName: z.string(),
        metrics: z.array(z.object({
            templateMetricId: z.string(),
            metricName: z.string(),
            calculationType: z.string().optional(),
            isLocked: z.boolean().optional(),
            monthlyGoal: z.number().optional(),
            monthlyAchieved: z.number().optional(),
            yoyGoal: z.number().optional(),
        })),
    })).optional(),
});

/* ── GET ───────────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const params = Object.fromEntries(new URL(req.url).searchParams);
        const query = ListQuerySchema.parse(params);

        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        const { page, pageSize, status, campusId, periodType, search, templateId } = query;

        const cacheKey = `reports:list:${auth.user.id}:${JSON.stringify(query)}`;
        const cached = await cache.get(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        /* Build Prisma where clause */
        const where: Record<string, unknown> = {};
        if (roleConfig.reportVisibilityScope === "campus" && auth.user.campusId) {
            where.campusId = auth.user.campusId;
        }
        if (status) where.status = status;
        if (campusId) where.campusId = campusId;
        if (periodType) where.periodType = periodType;
        if (templateId) where.templateId = templateId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { period: { contains: search, mode: "insensitive" } },
            ];
        }

        const [reports, total] = await Promise.all([
            db.report.findMany({
                where,
                orderBy: { updatedAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            db.report.count({ where }),
        ]);

        const payload = { success: true, data: { reports, total, page, pageSize } };
        await cache.set(cacheKey, JSON.stringify(payload), 30);
        return NextResponse.json(payload);
    } catch (err) {
        return handleApiError(err);
    }
}

/* ── POST ──────────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAuth(req);
        if (!auth.success) return unauthorizedResponse(auth.error);

        const roleConfig = ROLE_CONFIG[auth.user.role as UserRole];
        if (!roleConfig.canCreateReports) {
            return errorResponse("You do not have permission to create reports.", 403);
        }

        const body = CreateReportSchema.parse(await req.json());

        /* Verify template exists */
        const template = await db.reportTemplate.findUnique({ where: { id: body.templateId } });
        if (!template) {
            return errorResponse("Report template not found.", 404);
        }

        const report = await db.$transaction(async (tx) => {
            const newReport = await tx.report.create({
                data: {
                    organisationId: process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters",
                    title: body.title,
                    templateId: body.templateId,
                    campusId: body.campusId,
                    orgGroupId: template.orgGroupId ?? "",
                    period: body.period,
                    periodType: body.periodType,
                    periodYear: new Date().getFullYear(),
                    status: ReportStatus.DRAFT,
                    createdById: auth.user.id,
                    notes: body.notes ?? null,
                    sections: body.sections ? {
                        create: body.sections.map((sec) => ({
                            templateSectionId: sec.templateSectionId,
                            sectionName: sec.sectionName,
                            metrics: {
                                create: sec.metrics.map((met) => ({
                                    templateMetricId: met.templateMetricId,
                                    metricName: met.metricName,
                                    calculationType: met.calculationType as MetricCalculationType ?? MetricCalculationType.SUM,
                                    monthlyGoal: met.monthlyGoal,
                                    monthlyAchieved: met.monthlyAchieved,
                                    yoyGoal: met.yoyGoal,
                                    isLocked: met.isLocked ?? false,
                                })),
                            },
                        })),
                    } : undefined,
                },
            });

            await tx.reportEvent.create({
                data: {
                    reportId: newReport.id,
                    eventType: ReportEventType.CREATED,
                    actorId: auth.user.id,
                    timestamp: new Date(),
                },
            });

            return newReport;
        });

        await cache.invalidatePattern(`reports:list:${auth.user.id}:*`);

        return NextResponse.json(successResponse(report), { status: 201 });
    } catch (err) {
        return handleApiError(err);
    }
}
````

## File: config/reports.ts
````typescript
/**
 * config/reports.ts
 *
 * Report status transitions, deadline config, and the three default templates:
 *   1. DEFAULT_REPORT_TEMPLATE       — Full standard monthly report (all 12 strategic indicators)
 *   2. WEEKLY_REPORT_TEMPLATE        — Strictly-weekly metrics only (5 sections)
 *   3. MONTHLY_ONLY_REPORT_TEMPLATE  — Strictly-monthly metrics only (7 sections)
 *
 * Nomenclature is aligned exactly to the client's 2026 Reporting Template spreadsheet.
 * CalculationType per section follows:
 *   Monthly Report: Average of 4/5 weeks  → AVERAGE
 *   Monthly Report: Summation             → SUM
 *   Monthly Report: Cumulation (last val) → SNAPSHOT
 */

import { MetricCalculationType, MetricFieldType, ReportStatus, UserRole } from "@/types/global";

/* ── Status Transition Map ─────────────────────────────────────────────────── */

export const REPORT_STATUS_TRANSITIONS: Record<
    ReportStatus,
    { to: ReportStatus; requiredRole: UserRole[] }[]
> = {
    [ReportStatus.DRAFT]: [
        {
            to: ReportStatus.SUBMITTED,
            requiredRole: [UserRole.CAMPUS_ADMIN, UserRole.CAMPUS_PASTOR, UserRole.DATA_ENTRY, UserRole.GROUP_ADMIN],
        },
    ],
    [ReportStatus.SUBMITTED]: [
        {
            to: ReportStatus.REQUIRES_EDITS,
            requiredRole: [UserRole.CAMPUS_PASTOR, UserRole.GROUP_ADMIN, UserRole.GROUP_PASTOR, UserRole.CHURCH_MINISTRY, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.SPO, UserRole.SUPERADMIN],
        },
        {
            to: ReportStatus.APPROVED,
            requiredRole: [UserRole.CAMPUS_PASTOR, UserRole.GROUP_ADMIN, UserRole.CHURCH_MINISTRY, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.SPO, UserRole.SUPERADMIN],
        },
    ],
    [ReportStatus.REQUIRES_EDITS]: [
        {
            to: ReportStatus.SUBMITTED,
            requiredRole: [UserRole.CAMPUS_ADMIN, UserRole.CAMPUS_PASTOR, UserRole.DATA_ENTRY, UserRole.GROUP_ADMIN],
        },
    ],
    [ReportStatus.APPROVED]: [
        {
            to: ReportStatus.REVIEWED,
            requiredRole: [UserRole.GROUP_PASTOR, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.SPO, UserRole.SUPERADMIN],
        },
    ],
    [ReportStatus.REVIEWED]: [
        {
            to: ReportStatus.LOCKED,
            requiredRole: [UserRole.SUPERADMIN],
        },
    ],
    [ReportStatus.LOCKED]: [],
};

/* ── Deadline Config ──────────────────────────────────────────────────────── */

export const DEADLINE_CONFIG = {
    /** Hours after period close before the report is considered late */
    reportDeadlineHours: Number(process.env.REPORT_DEADLINE_HOURS ?? 48),
    /** Hours before the deadline to send a reminder notification */
    reminderLeadHours: Number(process.env.REPORT_REMINDER_HOURS ?? 24),
} as const;

/* ─────────────────────────────────────────────────────────────────────────────
 * SHARED BUILDER HELPERS
 * ───────────────────────────────────────────────────────────────────────────── */

type MetricDef = Omit<ReportTemplateMetric, "sectionId">;
type SectionDef = {
    id: string;
    name: string;
    description?: string;
    order: number;
    isRequired: boolean;
    metrics: MetricDef[];
};
interface TemplateDef {
    name: string;
    description?: string;
    version: number;
    isActive: boolean;
    isDefault: boolean;
    campusId?: string;
    orgGroupId?: string;
    sections: SectionDef[];
}

function m(
    id: string,
    name: string,
    fieldType: MetricFieldType,
    calc: MetricCalculationType,
    required: boolean,
    order: number,
    capturesGoal: boolean,
    capturesAchieved: boolean,
    capturesYoY: boolean,
    description?: string,
): MetricDef {
    return { id, name, fieldType, calculationType: calc, isRequired: required, order, capturesGoal: true, capturesAchieved, capturesYoY: true, description };
}

function s(
    id: string,
    name: string,
    order: number,
    required: boolean,
    metrics: MetricDef[],
    description?: string,
): SectionDef {
    return {
        id,
        name,
        description,
        order,
        isRequired: required,
        metrics: metrics.map((met) => ({ ...met, sectionId: id })),
    };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SECTION DEFINITIONS — aligned to the 2026 Harvesters Reporting Template
 * Each constant is reusable across the three template variants.
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * CHURCH PLANTING — Monthly & Quarterly  |  calculationType: SUM
 */
const SECTION_CHURCH_PLANTING = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}cp`, "Church Planting", order, false, [
        m(`${idPrefix}cp-churches`, "No. of Churches to be Planted", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, true, "Monthly Report: Summation of monthly achieved figures"),
        m(`${idPrefix}cp-plant-cells`, "No. of Plant Cells and Small Groups", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, true, true, false),
        m(`${idPrefix}cp-cell-plants`, "No. of Church Plant Cells", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
    ], "Church planting activities — Monthly & Quarterly reporting.");

/**
 * ATTENDANCE — Weekly, Monthly, Quarterly, Bi-annual, Annual
 * Monthly Report: Average of 4 or 5 weeks  → AVERAGE
 * Unique / cumulative fields → SNAPSHOT
 */
const SECTION_ATTENDANCE = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}att`, "Attendance", order, true, [
        m(`${idPrefix}att-sun-male`, "Sunday Attendance — Male", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 1, true, true, true, "Monthly Report: Average of 4/5 weekly Sunday service attendance (Male)"),
        m(`${idPrefix}att-sun-female`, "Sunday Attendance — Female", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 2, true, true, true, "Monthly Report: Average of 4/5 weekly Sunday service attendance (Female)"),
        m(`${idPrefix}att-sun-children`, "Sunday Attendance — Children", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 3, true, true, true, "Monthly Report: Average of 4/5 weekly Sunday service attendance (Children)"),
        m(`${idPrefix}att-first-timers`, "First Timers", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 4, true, true, true, "Monthly Report: Summation of weekly first timers"),
        m(`${idPrefix}att-worker`, "Worker Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 5, true, true, false, "Monthly Report: Average of weekly worker attendance"),
        m(`${idPrefix}att-growth-track`, "Growth Track Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 6, true, true, false),
        m(`${idPrefix}att-growth-track-uniq`, "Growth Track Unique Attendance", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 7, false, true, false, "Cumulative unique count — last reported value"),
        m(`${idPrefix}att-midweek`, "Midweek Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 8, false, true, false),
        m(`${idPrefix}att-worker-midweek`, "Workers Attendance: Midweek", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 9, false, true, false),
        m(`${idPrefix}att-sg`, "Small Group Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 10, false, true, false),
        m(`${idPrefix}att-cell-leaders`, "Monthly Cell Leaders Attendance (Meeting)", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 11, false, true, false, "Monthly cell leaders meeting attendance — snapshot"),
    ], "Service and group attendance — Weekly, Monthly, Quarterly, Bi-annual, and Annual reporting.");

/**
 * NLP — Weekly & Monthly  |  calculationType: SUM (leads/mobilizers), SNAPSHOT (cells)
 */
const SECTION_NLP = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}nlp`, "NLP", order, false, [
        m(`${idPrefix}nlp-cells`, "No. of NLP Cells", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 1, true, true, false),
        m(`${idPrefix}nlp-leads`, "NLP Leads", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 2, true, true, false, "Monthly Report: Summation of weekly NLP leads"),
        m(`${idPrefix}nlp-mobilizers`, "Mobilizers", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, true, true, false),
    ], "Next Level Prayers — Weekly & Monthly reporting.");

/**
 * SALVATION — Weekly & Monthly  |  calculationType: SUM
 */
const SECTION_SALVATION = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}sal`, "Salvation", order, true, [
        m(`${idPrefix}sal-service`, "Soul Saved in Service", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 1, true, true, true, "Monthly Report: Summation of weekly souls saved in service"),
        m(`${idPrefix}sal-cell`, "Soul Saved in Cell", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 2, true, true, false, "Monthly Report: Summation of weekly souls saved in cell"),
        m(`${idPrefix}sal-nextgen`, "Soul Saved in Next Gen", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
        m(`${idPrefix}sal-baptized`, "No. of People Baptized", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, true, true, false),
    ], "Salvation and baptism records — Weekly & Monthly reporting.");

/**
 * SMALL GROUP — Weekly & Monthly  |  calculationType: SNAPSHOT (groups, leaders), SUM (cells held)
 */
const SECTION_SMALL_GROUP = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}sg`, "Small Group", order, false, [
        m(`${idPrefix}sg-groups`, "No. of Small Groups", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, true, 1, true, true, true, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}sg-leaders`, "No. of Small Group Leaders", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 2, true, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}sg-asst-leaders`, "No. of Assistant Cell Leaders", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 3, false, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}sg-cells-held`, "No. of Cells that Held", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, false, true, false),
    ], "Small group and cell activity — Weekly & Monthly reporting.");

/**
 * HAEF — Monthly & Quarterly  |  calculationType: SUM
 */
const SECTION_HAEF = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}haef`, "HAEF", order, false, [
        m(`${idPrefix}haef-reach`, "Project Reach", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false),
        m(`${idPrefix}haef-impact`, "Project Impact", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
    ], "Harvesters Arrest Extreme Failure — Monthly & Quarterly reporting.");

/**
 * DISCIPLESHIP — Quarterly & Bi-Yearly  |  calculationType: SUM
 */
const SECTION_DISCIPLESHIP = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}disc`, "Discipleship", order, false, [
        m(`${idPrefix}disc-fc-att`, "Foundation Course Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false, "Monthly Report: Summation of cohort achieved figures"),
        m(`${idPrefix}disc-fc-grad`, "Foundation Course Graduants", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
        m(`${idPrefix}disc-alc`, "ALC Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
        m(`${idPrefix}disc-blc`, "BLC Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, false, true, false),
        m(`${idPrefix}disc-plc`, "PLC Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 5, false, true, false),
        m(`${idPrefix}disc-cpc`, "CPC Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 6, false, true, false),
    ], "Discipleship school attendance and graduants — Quarterly & Bi-annual reporting.");

/**
 * PARTNERSHIP — Monthly & Quarterly  |  calculationType: SUM
 */
const SECTION_PARTNERSHIP = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}part`, "Partnership", order, false, [
        m(`${idPrefix}part-partners`, "No. of Partners", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, true, "Monthly Report: Summation of monthly achieved figures"),
    ], "Partnership and giving — Monthly & Quarterly reporting.");

/**
 * PROJECT — Monthly & Quarterly  |  calculationType: SNAPSHOT
 */
const SECTION_PROJECT = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}proj`, "Project", order, false, [
        m(`${idPrefix}proj-ongoing`, "No. of Ongoing Projects", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 1, false, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}proj-phase-closure`, "Project Phase and Closure", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 2, false, true, false, "Monthly Report: Cumulation — last reported value"),
    ], "Project management tracking — Monthly & Quarterly reporting.");

/**
 * TRANSFORMATION — Monthly & Quarterly  |  calculationType: SUM
 */
const SECTION_TRANSFORMATION = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}trans`, "Transformation", order, false, [
        m(`${idPrefix}trans-testimonies`, "No. of Testimonies", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false, "Monthly Report: Cumulation — last or quarterly figure"),
        m(`${idPrefix}trans-births`, "No. of Births", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
        m(`${idPrefix}trans-dedications`, "No. of Babies Dedicated", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
        m(`${idPrefix}trans-weddings`, "No. of Weddings", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, false, true, false),
    ], "Community transformation and life milestones — Monthly & Quarterly reporting.");

/**
 * ASSIMILATION — Monthly & Quarterly  |  calculationType: SNAPSHOT (workers, leaders), SUM (assimilated)
 */
const SECTION_ASSIMILATION = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}assim`, "Assimilation", order, false, [
        m(`${idPrefix}assim-sg`, "No. Assimilated into Small Groups", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}assim-workforce`, "No. Assimilated into Work Force", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
        m(`${idPrefix}assim-workers`, "No. of Workers", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, true, 3, true, true, true, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}assim-leaders`, "No. of Leaders", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 4, false, true, false),
    ], "Assimilation into small groups and workforce — Monthly & Quarterly reporting.");

/**
 * NEXT GEN — Weekly & Monthly
 * Attendance → AVERAGE  |  Baptisms/Participants → SUM  |  Rates/Counts → SNAPSHOT
 * Sub-ministries: Kidzone (children) and Stir House (youth)
 */
const SECTION_NEXT_GEN = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}ng`, "Next Gen", order, false, [
        m(`${idPrefix}ng-att-kidzone`, "Next Gen Attendance — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 1, true, true, false, "Monthly Report: Average of 4 weeks"),
        m(`${idPrefix}ng-att-stir`, "Next Gen Attendance — Stir House", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 2, true, true, false, "Monthly Report: Average of 4 weeks"),
        m(`${idPrefix}ng-ft-kidzone`, "First Timers — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
        m(`${idPrefix}ng-ft-stir`, "First Timers — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, false, true, false),
        m(`${idPrefix}ng-wrkr-kidzone`, "Workers Attendance — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 5, false, true, false),
        m(`${idPrefix}ng-wrkr-stir`, "Workers Attendance — Stir House", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 6, false, true, false),
        m(`${idPrefix}ng-bap-water-kz`, "No. of Baptized (Water) — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 7, false, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}ng-bap-water-sh`, "No. of Baptized (Water) — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 8, false, true, false),
        m(`${idPrefix}ng-bap-hg-kz`, "No. of Baptized (Holy Ghost) — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 9, false, true, false),
        m(`${idPrefix}ng-bap-hg-sh`, "No. of Baptized (Holy Ghost) — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 10, false, true, false),
        m(`${idPrefix}ng-return-kidzone`, "Next Gen Return Rate — Kidzone", MetricFieldType.PERCENTAGE, MetricCalculationType.SNAPSHOT, false, 11, false, true, false),
        m(`${idPrefix}ng-return-stir`, "Next Gen Return Rate — Stir House", MetricFieldType.PERCENTAGE, MetricCalculationType.SNAPSHOT, false, 12, false, true, false),
        m(`${idPrefix}ng-pdpf-kidzone`, "No. of PD/PF Participants — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 13, false, true, false),
        m(`${idPrefix}ng-pdpf-stir`, "No. of PD/PF Participants — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 14, false, true, false),
        m(`${idPrefix}ng-teen-leaders`, "No. of Teen Leaders — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 15, false, true, false),
        m(`${idPrefix}ng-served-kidzone`, "No. that Served — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 16, false, true, false),
        m(`${idPrefix}ng-served-stir`, "No. that Served — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 17, false, true, false),
        m(`${idPrefix}ng-parental-kidzone`, "Parental Engagement Rate — Kidzone", MetricFieldType.PERCENTAGE, MetricCalculationType.SNAPSHOT, false, 18, false, true, false),
        m(`${idPrefix}ng-parental-stir`, "Parental Engagement Rate — Stir House", MetricFieldType.PERCENTAGE, MetricCalculationType.SNAPSHOT, false, 19, false, true, false),
    ], "Next generation ministry (Kidzone & Stir House) — Weekly & Monthly reporting.");

/* ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE 1: DEFAULT FULL STANDARD MONTHLY REPORT
 * All 12 strategic indicators. The primary comprehensive report template.
 * ───────────────────────────────────────────────────────────────────────────── */

export const DEFAULT_REPORT_TEMPLATE: TemplateDef = {
    name: "Standard Campus Monthly Report",
    description: "The primary Harvesters monthly report template covering all 12 strategic indicators. Monthly Report aggregation rules: Attendance → Average of 4/5 weeks; Salvation/NLP/Partnership/HAEF/Discipleship/Transformation/Assimilation → Summation; Small Group/Project/Workers → Cumulation (last reported value).",
    version: 1,
    isActive: true,
    isDefault: true,
    sections: [
        SECTION_CHURCH_PLANTING("std-", 1),
        SECTION_ATTENDANCE("std-", 2),
        SECTION_NLP("std-", 3),
        SECTION_SALVATION("std-", 4),
        SECTION_SMALL_GROUP("std-", 5),
        SECTION_HAEF("std-", 6),
        SECTION_DISCIPLESHIP("std-", 7),
        SECTION_PARTNERSHIP("std-", 8),
        SECTION_PROJECT("std-", 9),
        SECTION_TRANSFORMATION("std-", 10),
        SECTION_ASSIMILATION("std-", 11),
        SECTION_NEXT_GEN("std-", 12),
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE 2: WEEKLY REPORT TEMPLATE
 * Strictly weekly-tracked metrics only (5 sections).
 * Covers sections that have Weekly reporting frequency.
 * ───────────────────────────────────────────────────────────────────────────── */

export const WEEKLY_REPORT_TEMPLATE: TemplateDef = {
    name: "Weekly Campus Report",
    description: "Weekly report template covering only the sections tracked on a weekly basis: Attendance, NLP, Salvation, Small Group, and Next Gen. Used for week-by-week submissions.",
    version: 1,
    isActive: true,
    isDefault: false,
    sections: [
        SECTION_ATTENDANCE("wkly-", 1),
        SECTION_NLP("wkly-", 2),
        SECTION_SALVATION("wkly-", 3),
        SECTION_SMALL_GROUP("wkly-", 4),
        SECTION_NEXT_GEN("wkly-", 5),
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE 3: MONTHLY-ONLY REPORT TEMPLATE
 * Strictly monthly-tracked metrics only (7 sections).
 * Covers sections that have Monthly/Quarterly reporting frequency but NO weekly cadence.
 * ───────────────────────────────────────────────────────────────────────────── */

export const MONTHLY_ONLY_REPORT_TEMPLATE: TemplateDef = {
    name: "Monthly-Only Campus Report",
    description: "Monthly report template covering the sections that are tracked exclusively on a monthly or quarterly basis (no weekly cadence): Church Planting, HAEF, Discipleship, Partnership, Project, Transformation, and Assimilation.",
    version: 1,
    isActive: true,
    isDefault: false,
    sections: [
        SECTION_CHURCH_PLANTING("mo-", 1),
        SECTION_HAEF("mo-", 2),
        SECTION_DISCIPLESHIP("mo-", 3),
        SECTION_PARTNERSHIP("mo-", 4),
        SECTION_PROJECT("mo-", 5),
        SECTION_TRANSFORMATION("mo-", 6),
        SECTION_ASSIMILATION("mo-", 7),
    ],
};
````

## File: config/routes.ts
````typescript
/**
 * config/routes.ts
 * Typed route constants — single source of truth for all app + API paths.
 * Import these everywhere; never write string paths inline.
 *
 * Architecture: flat dashboard URLs — role determines what you SEE, not which
 * URL you visit. No /leader/ or /superadmin/ prefixes. All authenticated users
 * share the same route namespace under (dashboard).
 */

import { UserRole } from "@/types/global";

/* ── Application Routes ─────────────────────────────────────────────────────── */

export const APP_ROUTES = {
    /* — Public / Auth — */
    home: "/",
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    join: "/join",
    about: "/about",
    privacy: "/privacy",
    terms: "/terms",
    offline: "/offline",
    profile: "/profile",
    profileEdit: "/profile/edit",
    profileChangePassword: "/profile/change-password",

    /* — Dashboard (all authenticated roles — flat, no role prefix) — */
    dashboard: "/dashboard",
    reports: "/reports",
    reportDetail: (id: string) => `/reports/${id}`,
    reportNew: "/reports/new",
    reportEdit: (id: string) => `/reports/${id}/edit`,
    analytics: "/analytics",
    inbox: "/inbox",
    settings: "/settings",

    /* — Superadmin-only features (same flat namespace, access controlled in page/layout) — */
    templates: "/templates",
    templateNew: "/templates/new",
    templateDetail: (id: string) => `/templates/${id}`,
    users: "/users",
    userDetail: (id: string) => `/users/${id}`,
    org: "/org",
    invites: "/invites",
    goals: "/goals",

    /* — Bug Reports — */
    bugReports: "/bug-reports",
    bugReportsManage: "/bug-reports/manage",

    /* — Member (scaffolded, no routes built yet) — */
    member: {
        dashboard: "/member/dashboard",
    },
} as const;

/* ── Dashboard Routes by Role (used by AuthProvider redirect) ──────────────── */

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
    [UserRole.SUPERADMIN]: APP_ROUTES.dashboard,
    [UserRole.SPO]: APP_ROUTES.dashboard,
    [UserRole.CEO]: APP_ROUTES.dashboard,
    [UserRole.OFFICE_OF_CEO]: APP_ROUTES.dashboard,
    [UserRole.CHURCH_MINISTRY]: APP_ROUTES.dashboard,
    [UserRole.GROUP_PASTOR]: APP_ROUTES.dashboard,
    [UserRole.GROUP_ADMIN]: APP_ROUTES.dashboard,
    [UserRole.CAMPUS_PASTOR]: APP_ROUTES.dashboard,
    [UserRole.CAMPUS_ADMIN]: APP_ROUTES.dashboard,
    [UserRole.DATA_ENTRY]: APP_ROUTES.reports,
    [UserRole.MEMBER]: APP_ROUTES.dashboard,
};

/* ── API Routes ─────────────────────────────────────────────────────────────── */

export const API_ROUTES = {
    auth: {
        login: "/api/auth/login",
        logout: "/api/auth/logout",
        me: "/api/auth/me",
        register: "/api/auth/register",
        refreshToken: "/api/auth/refresh",
        forgotPassword: "/api/auth/forgot-password",
        resetPassword: "/api/auth/reset-password",
        changePassword: "/api/auth/change-password",
    },
    reports: {
        list: "/api/reports",
        detail: (id: string) => `/api/reports/${id}`,
        submit: (id: string) => `/api/reports/${id}/submit`,
        approve: (id: string) => `/api/reports/${id}/approve`,
        review: (id: string) => `/api/reports/${id}/review`,
        lock: (id: string) => `/api/reports/${id}/lock`,
        requestEdit: (id: string) => `/api/reports/${id}/request-edit`,
        history: (id: string) => `/api/reports/${id}/history`,
    },
    reportTemplates: {
        list: "/api/report-templates",
        detail: (id: string) => `/api/report-templates/${id}`,
        versions: (id: string) => `/api/report-templates/${id}/versions`,
    },
    reportUpdateRequests: {
        list: "/api/report-update-requests",
        detail: (id: string) => `/api/report-update-requests/${id}`,
        approve: (id: string) => `/api/report-update-requests/${id}/approve`,
        reject: (id: string) => `/api/report-update-requests/${id}/reject`,
    },
    users: {
        list: "/api/users",
        detail: (id: string) => `/api/users/${id}`,
        profile: "/api/users/profile",
    },
    org: {
        groups: "/api/org/groups",
        group: (id: string) => `/api/org/groups/${id}`,
        campuses: "/api/org/campuses",
        campus: (id: string) => `/api/org/campuses/${id}`,
    },
    analytics: {
        overview: "/api/analytics/overview",
        metrics: "/api/analytics/metrics",
        reports: "/api/analytics/reports",
        compliance: "/api/analytics/compliance",
        goals: "/api/analytics/goals",
        quarterly: "/api/analytics/quarterly",
    },
    goals: {
        list: "/api/goals",
        forReport: "/api/goals/for-report",
        detail: (id: string) => `/api/goals/${id}`,
        unlockRequest: (id: string) => `/api/goals/${id}/unlock-request`,
        approveUnlock: (id: string) => `/api/goals/${id}/unlock-request/approve`,
        rejectUnlock: (id: string) => `/api/goals/${id}/unlock-request/reject`,
    },
    notifications: {
        list: "/api/notifications",
        markRead: (id: string) => `/api/notifications/${id}/read`,
        markAllRead: "/api/notifications/read-all",
    },
    inviteLinks: {
        list: "/api/invite-links",
        create: "/api/invite-links",
        validate: (token: string) => `/api/invite-links/validate/${token}`,
        revoke: (id: string) => `/api/invite-links/${id}`,
    },
    bugReports: {
        list: "/api/bug-reports",
        detail: (id: string) => `/api/bug-reports/${id}`,
    },
} as const;
````

## File: modules/reports/components/ReportEditPage.tsx
````typescript
"use client";

/**
 * modules/reports/components/ReportEditPage.tsx
 *
 * Edit a report that is in DRAFT or REQUIRES_EDITS status.
 * Goals for the campus + period are loaded from /api/goals/for-report and
 * pre-seeded into the form as read-only goal values with live stat tracking.
 */

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { SaveOutlined, ArrowLeftOutlined, LockOutlined } from "@ant-design/icons";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ReportSectionsForm,
  buildSectionsPayload,
  parseSectionsToMetricValues,
  type MetricValues,
  type GoalsForReportMap,
} from "./ReportSectionsForm";
import { ReportStatus } from "@/types/global";

const rk = CONTENT.reports as Record<string, unknown>;

/* ---- Component ---- */

interface PageProps {
  params: Promise<{ id: string }>;
}

export function ReportEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useRole();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [metricValues, setMetricValues] = useState<Record<string, MetricValues>>({});
  const [goalsMap, setGoalsMap] = useState<GoalsForReportMap>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: report } = useApiData<Report>(API_ROUTES.reports.detail(id));

  // Load template once report's templateId is known
  const { data: template } = useApiData<ReportTemplate>(
    report?.templateId ? API_ROUTES.reportTemplates.detail(report.templateId) : null,
    [report?.templateId],
  );

  /* Initialise form values + load goals once report + template are available */
  useEffect(() => {
    if (!report || !template || initialized) return;
    setTitle(report.title ?? "");
    setNotes(report.notes ?? "");
    setMetricValues(parseSectionsToMetricValues((report.sections ?? []) as unknown[]));
    setInitialized(true);

    // Load goals for this campus + period
    const campusId = report.campusId;
    const year = report.periodYear;
    const month = report.periodMonth;
    if (!campusId || !year) return;

    const params = new URLSearchParams({ campusId, year: String(year) });
    if (month) params.set("month", String(month));

    fetch(`${API_ROUTES.goals.forReport}?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setGoalsMap(json.data as GoalsForReportMap);
      })
      .catch(() => {
        /* non-fatal */
      });
  }, [report, template, initialized]);

  const handleMetricChange = (metricId: string, v: MetricValues) =>
    setMetricValues((prev) => ({ ...prev, [metricId]: v }));

  const handleSave = async () => {
    if (!report || !template) return;
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.reports.detail(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes,
          sections: buildSectionsPayload(template, metricValues, goalsMap),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? (CONTENT.common.errorDefault as string));
        return;
      }
      message.success(CONTENT.common.successSave as string);
      router.push(APP_ROUTES.reportDetail(id));
    } catch {
      message.error(CONTENT.common.errorDefault as string);
    } finally {
      setSaving(false);
    }
  };

  /* Guards */
  if (!can.fillReports) {
    router.replace(APP_ROUTES.reports);
    return null;
  }

  if (report === undefined || template === undefined) {
    return (
      <PageLayout title={(CONTENT.common.loading as string) ?? "Loading..."}>
        <LoadingSkeleton rows={6} />
      </PageLayout>
    );
  }

  if (!report) {
    return (
      <PageLayout title={CONTENT.errors.notFoundTitle as string}>
        <EmptyState
          title={CONTENT.errors.notFoundTitle as string}
          description="This report does not exist."
          action={
            <Button onClick={() => router.push(APP_ROUTES.reports)}>
              {CONTENT.common.back as string}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const isEditable =
    report.status === ReportStatus.DRAFT || report.status === ReportStatus.REQUIRES_EDITS;
  if (!isEditable) {
    return (
      <PageLayout title={report.title ?? "Report"}>
        <EmptyState
          icon={<LockOutlined />}
          title="Report cannot be edited"
          description={`Reports with status "${report.status}" cannot be edited.`}
          action={
            <Button onClick={() => router.push(APP_ROUTES.reportDetail(id))}>
              {CONTENT.common.back as string}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${rk.editReport as string}: ${report.title ?? ""}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(APP_ROUTES.reportDetail(id))}
          >
            {CONTENT.common.back as string}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            {CONTENT.common.save as string}
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Header: title + notes */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-ds-text-secondary block mb-1">
              {CONTENT.reports.columnLabels.title as string}
            </label>
            <input
              className="w-full bg-ds-surface border border-ds-border-base rounded-ds-md px-3 py-2 text-sm text-ds-text-primary focus:outline-none focus:ring-2 focus:ring-ds-brand-accent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Report title"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ds-text-secondary block mb-1">
              {rk.notesLabel as string}
            </label>
            <textarea
              className="w-full bg-ds-surface border border-ds-border-base rounded-ds-md px-3 py-2 text-sm text-ds-text-primary focus:outline-none focus:ring-2 focus:ring-ds-brand-accent resize-none"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={rk.notesPlaceholder as string}
            />
          </div>
        </div>

        {/* Template sections form (shared component) */}
        {template && (
          <ReportSectionsForm
            template={template}
            metricValues={metricValues}
            goalsMap={goalsMap}
            onMetricChange={handleMetricChange}
          />
        )}

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Button onClick={() => router.push(APP_ROUTES.reportDetail(id))}>
            {CONTENT.common.cancel as string}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            {CONTENT.common.save as string}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
````

## File: modules/templates/components/TemplatesListPage.tsx
````typescript
"use client";

/**
 * modules/templates/components/TemplatesListPage.tsx
 * Template list management — SUPERADMIN only.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "antd";
import { PlusOutlined, EditOutlined, StarOutlined } from "@ant-design/icons";
import { useApiData } from "@/lib/hooks/useApiData";
import { API_ROUTES } from "@/config/routes";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";
import Button from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import Table from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { fmtDate } from "@/lib/utils/formatDate";
import { FilterToolbar } from "@/components/ui/FilterToolbar";

type TemplateRow = ReportTemplate & {
  isDefault?: boolean;
  isArchived?: boolean;
  fieldCount?: number;
};

interface ColumnConfig {
  key: string;
  title: string;
  render: (row: TemplateRow) => React.ReactNode;
  width?: number;
}

const TEMPLATE_COLUMNS: ColumnConfig[] = [
  {
    key: "name",
    title: CONTENT.templates.nameLabel as string,
    render: (row) => (
      <div>
        <p className="text-sm font-medium text-ds-text-primary">{row.name}</p>
        {row.description && (
          <p className="text-xs text-ds-text-subtle truncate max-w-xs">{row.description}</p>
        )}
      </div>
    ),
  },
  {
    key: "status",
    title: "Status",
    width: 140,
    render: (row) => (
      <div className="flex gap-1.5 flex-wrap">
        {row.isDefault && (
          <Tag color="gold" icon={<StarOutlined />}>
            {CONTENT.templates.defaultBadge as string}
          </Tag>
        )}
        {row.isArchived && <Tag color="default">Archived</Tag>}
        {!row.isArchived && !row.isDefault && <Tag color="green">Active</Tag>}
      </div>
    ),
  },
  {
    key: "fields",
    title: "Fields",
    width: 80,
    render: (row) => {
      const count =
        row.fieldCount ??
        (row.sections ?? []).reduce(
          (sum: number, sec: ReportTemplateSection) => sum + (sec.metrics?.length ?? 0),
          0,
        );
      return <span className="text-sm text-ds-text-secondary">{count}</span>;
    },
  },
  {
    key: "created",
    title: "Created",
    width: 130,
    render: (row) => <span className="text-xs text-ds-text-subtle">{fmtDate(row.createdAt)}</span>,
  },
];

export function TemplatesListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

  const filtered = templates
    ? templates
        .filter((t) => {
          const tRow = t as TemplateRow;
          if (!showArchived && tRow.isArchived) return false;
          if (search) {
            const q = search.toLowerCase();
            return (
              t.name.toLowerCase().includes(q) ||
              (t.description?.toLowerCase().includes(q) ?? false)
            );
          }
          return true;
        })
        .sort((a, b) => {
          const aDefault = (a as TemplateRow).isDefault ? -1 : 0;
          const bDefault = (b as TemplateRow).isDefault ? -1 : 0;
          return (
            aDefault - bDefault || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        })
    : [];

  const columns = [
    ...TEMPLATE_COLUMNS,
    {
      key: "actions",
      title: "",
      width: 80,
      render: (row: TemplateRow) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => router.push(APP_ROUTES.templateDetail(row.id))}
        >
          {CONTENT.common.edit as string}
        </Button>
      ),
    },
  ];

  if (templates === undefined) {
    return (
      <PageLayout title={CONTENT.templates.pageTitle as string}>
        <LoadingSkeleton rows={5} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={CONTENT.templates.pageTitle as string}
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push(APP_ROUTES.templateNew)}
        >
          {CONTENT.templates.newTemplate as string}
        </Button>
      }
    >
      <div className="space-y-4">
        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search templates…"
          filters={[
            {
              key: "showArchived",
              label: "Show archived",
              type: "checkbox",
              value: showArchived,
              onChange: (v) => setShowArchived(v as boolean),
            },
          ]}
        />

        {filtered.length === 0 ? (
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-8">
            <EmptyState
              icon={<EditOutlined />}
              title={CONTENT.templates.emptyState.title as string}
              description={CONTENT.templates.emptyState.description as string}
              action={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push(APP_ROUTES.templateNew)}
                >
                  {CONTENT.templates.newTemplate as string}
                </Button>
              }
            />
          </div>
        ) : (
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => router.push(APP_ROUTES.templateDetail((record as TemplateRow).id)),
              style: { cursor: "pointer" },
            })}
          />
        )}
      </div>
    </PageLayout>
  );
}
````

## File: types/global.ts
````typescript
/**
 * types/global.ts
 *
 * Single runtime module for all domain enums, constants, AND global interface
 * declarations. Bundlers (Turbopack/webpack) can import enum values from this
 * file. The declare global {} block augments the global TypeScript scope for
 * all files that transitively import this module.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export enum UserRole {
    SUPERADMIN = "SUPERADMIN",
    SPO = "SPO",
    CEO = "CEO",
    OFFICE_OF_CEO = "OFFICE_OF_CEO",
    CHURCH_MINISTRY = "CHURCH_MINISTRY",
    GROUP_PASTOR = "GROUP_PASTOR",
    GROUP_ADMIN = "GROUP_ADMIN",
    CAMPUS_PASTOR = "CAMPUS_PASTOR",
    CAMPUS_ADMIN = "CAMPUS_ADMIN",
    DATA_ENTRY = "DATA_ENTRY",
    MEMBER = "MEMBER",
}

export enum ReportStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    REQUIRES_EDITS = "REQUIRES_EDITS",
    APPROVED = "APPROVED",
    REVIEWED = "REVIEWED",
    LOCKED = "LOCKED",
}

export enum ReportEventType {
    CREATED = "CREATED",
    SUBMITTED = "SUBMITTED",
    EDIT_REQUESTED = "EDIT_REQUESTED",
    EDIT_SUBMITTED = "EDIT_SUBMITTED",
    EDIT_APPROVED = "EDIT_APPROVED",
    EDIT_REJECTED = "EDIT_REJECTED",
    EDIT_APPLIED = "EDIT_APPLIED",
    APPROVED = "APPROVED",
    REVIEWED = "REVIEWED",
    LOCKED = "LOCKED",
    DEADLINE_PASSED = "DEADLINE_PASSED",
    UPDATE_REQUESTED = "UPDATE_REQUESTED",
    UPDATE_APPROVED = "UPDATE_APPROVED",
    UPDATE_REJECTED = "UPDATE_REJECTED",
    DATA_ENTRY_CREATED = "DATA_ENTRY_CREATED",
    TEMPLATE_VERSION_NOTE = "TEMPLATE_VERSION_NOTE",
    AUTO_APPROVED = "AUTO_APPROVED",
}

export enum ReportPeriodType {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

export enum MetricFieldType {
    NUMBER = "NUMBER",
    PERCENTAGE = "PERCENTAGE",
    TEXT = "TEXT",
    CURRENCY = "CURRENCY",
}

export enum ReportEditStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum ReportUpdateRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum NotificationType {
    REPORT_SUBMITTED = "REPORT_SUBMITTED",
    REPORT_EDIT_REQUESTED = "REPORT_EDIT_REQUESTED",
    REPORT_APPROVED = "REPORT_APPROVED",
    REPORT_REVIEWED = "REPORT_REVIEWED",
    REPORT_LOCKED = "REPORT_LOCKED",
    REPORT_EDIT_SUBMITTED = "REPORT_EDIT_SUBMITTED",
    REPORT_EDIT_APPROVED = "REPORT_EDIT_APPROVED",
    REPORT_EDIT_REJECTED = "REPORT_EDIT_REJECTED",
    REPORT_UPDATE_REQUESTED = "REPORT_UPDATE_REQUESTED",
    REPORT_UPDATE_APPROVED = "REPORT_UPDATE_APPROVED",
    REPORT_UPDATE_REJECTED = "REPORT_UPDATE_REJECTED",
    REPORT_DEADLINE_REMINDER = "REPORT_DEADLINE_REMINDER",
    GOAL_UNLOCK_REQUESTED = "GOAL_UNLOCK_REQUESTED",
    GOAL_UNLOCK_APPROVED = "GOAL_UNLOCK_APPROVED",
    GOAL_UNLOCK_REJECTED = "GOAL_UNLOCK_REJECTED",
}

export enum MetricCalculationType {
    SUM = "SUM",
    AVERAGE = "AVERAGE",
    SNAPSHOT = "SNAPSHOT",
}

export enum GoalMode {
    ANNUAL = "ANNUAL",
    MONTHLY = "MONTHLY",
    CAMPUS_OVERRIDE = "CAMPUS_OVERRIDE",
}

export enum GoalEditRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum InviteLinkType {
    CAMPUS = "CAMPUS",
    GROUP = "GROUP",
    DIRECT = "DIRECT",
}

export enum BugReportStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
}

export enum BugReportCategory {
    UI_DISPLAY = "UI_DISPLAY",
    NAVIGATION = "NAVIGATION",
    DATA_ISSUE = "DATA_ISSUE",
    PERFORMANCE = "PERFORMANCE",
    AUTHENTICATION = "AUTHENTICATION",
    REPORT_SUBMISSION = "REPORT_SUBMISSION",
    NOTIFICATION = "NOTIFICATION",
    OTHER = "OTHER",
}

// ─────────────────────────────────────────────────────────────────────────────
// RUNTIME CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const HIERARCHY_ORDER: Record<UserRole, number> = {
    [UserRole.SUPERADMIN]: 0,
    [UserRole.SPO]: 1,
    [UserRole.CEO]: 2,
    [UserRole.OFFICE_OF_CEO]: 3,
    [UserRole.CHURCH_MINISTRY]: 4,
    [UserRole.GROUP_PASTOR]: 5,
    [UserRole.GROUP_ADMIN]: 6,
    [UserRole.CAMPUS_PASTOR]: 7,
    [UserRole.CAMPUS_ADMIN]: 8,
    [UserRole.DATA_ENTRY]: 9,
    [UserRole.MEMBER]: 10,
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL INTERFACE DECLARATIONS
// declare global {} augments the global TypeScript namespace. Because this file
// is a module (has exports), declare global is a module augmentation and is
// activated for all files that import this module directly or transitively.
// ─────────────────────────────────────────────────────────────────────────────

declare global {
    interface AuthUser {
        id: string;
        email: string;
        role: UserRole;
        campusId?: string;
        orgGroupId?: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    }

    interface AuthContextValue {
        user: AuthUser | null;
        isLoading: boolean;
        login: (email: string, password: string, rememberMe?: boolean, redirectTo?: string) => Promise<void>;
        logout: () => Promise<void>;
        refreshToken: () => Promise<void>;
    }

    interface UserProfile {
        id: string;
        organisationId?: string;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        gender?: Gender;
        role: UserRole;
        campusId?: string;
        groupId?: string;
        orgGroupId?: string;
        avatar?: string;
        avatarUrl?: string;
        passwordHash?: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    interface CreateUserInput {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        campusId?: string;
        orgGroupId?: string;
        phone?: string;
        gender?: Gender;
    }

    interface UpdateUserInput {
        firstName?: string;
        lastName?: string;
        phone?: string;
        gender?: Gender;
        avatar?: string;
        campusId?: string;
        orgGroupId?: string;
    }

    interface ChangePasswordInput {
        currentPassword: string;
        newPassword: string;
    }

    interface OrgUnitBase {
        id: string;
        name: string;
        description?: string;
        orgLevel: "GROUP" | "CAMPUS";
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        leaderId?: string;
        adminId?: string;
        country?: string;
        location?: string;
        address?: string;
        phone?: string;
        memberCount?: number;
        inviteCode?: string;
    }

    interface OrgGroup extends OrgUnitBase {
        orgLevel: "GROUP";
        country: string;
        leaderId: string;
    }

    interface Campus extends OrgUnitBase {
        orgLevel: "CAMPUS";
        parentId: string;
        adminId?: string;
        country: string;
        location: string;
    }

    interface OrgGroupWithDetails extends OrgGroup {
        campuses: Campus[];
        leader?: UserProfile;
    }

    interface CampusWithDetails extends Campus {
        orgGroup?: OrgGroup;
        admin?: UserProfile;
    }

    interface CreateOrgGroupInput {
        name: string;
        description?: string;
        country: string;
        leaderId?: string;
    }

    interface CreateCampusInput {
        name: string;
        description?: string;
        parentId: string;
        country: string;
        location: string;
        adminId?: string;
        phone?: string;
        address?: string;
    }

    interface ReportTemplate {
        id: string;
        organisationId: string;
        name: string;
        description?: string;
        version: number;
        sections: ReportTemplateSection[];
        isActive: boolean;
        isDefault: boolean;
        createdById: string;
        campusId?: string;
        orgGroupId?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportTemplateSection {
        id: string;
        templateId: string;
        name: string;
        description?: string;
        order: number;
        isRequired: boolean;
        metrics: ReportTemplateMetric[];
    }

    interface ReportTemplateMetric {
        id: string;
        sectionId: string;
        name: string;
        description?: string;
        fieldType: MetricFieldType;
        calculationType: MetricCalculationType;
        isRequired: boolean;
        minValue?: number;
        maxValue?: number;
        order: number;
        capturesGoal: boolean;
        capturesAchieved: boolean;
        capturesYoY: boolean;
    }

    interface ReportTemplateVersion {
        id: string;
        templateId: string;
        versionNumber: number;
        snapshot: ReportTemplate;
        createdAt: string;
        createdById: string;
    }

    interface CreateReportTemplateInput {
        name: string;
        description?: string;
        sections: CreateTemplateSectionInput[];
        campusId?: string;
        orgGroupId?: string;
    }

    interface CreateTemplateSectionInput {
        name: string;
        description?: string;
        order: number;
        isRequired: boolean;
        metrics: CreateTemplateMetricInput[];
    }

    interface CreateTemplateMetricInput {
        name: string;
        description?: string;
        fieldType: MetricFieldType;
        calculationType: MetricCalculationType;
        isRequired: boolean;
        minValue?: number;
        maxValue?: number;
        order: number;
        capturesGoal: boolean;
        capturesAchieved: boolean;
        capturesYoY: boolean;
    }

    interface Report {
        id: string;
        organisationId?: string;
        title?: string;
        templateId: string;
        templateVersionId: string;
        campusId: string;
        orgGroupId: string;
        period?: string;
        periodType: ReportPeriodType;
        periodYear: number;
        periodMonth?: number;
        periodWeek?: number;
        status: ReportStatus;
        createdById?: string;
        submittedById?: string;
        reviewedById?: string;
        approvedById?: string;
        deadline?: string | null;
        lockedAt?: string;
        isDataEntry: boolean;
        dataEntryById?: string;
        dataEntryDate?: string;
        notes?: string;
        sections?: unknown[];
        createdAt: string;
        updatedAt: string;
    }

    interface ReportSection {
        id: string;
        reportId: string;
        templateSectionId: string;
        sectionName: string;
        metrics: ReportMetric[];
    }

    interface ReportMetric {
        id: string;
        reportSectionId: string;
        templateMetricId: string;
        metricName: string;
        calculationType: MetricCalculationType;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        computedPercentage?: number;
        isLocked: boolean;
        lockedAt?: string;
        lockedById?: string;
        comment?: string;
    }

    interface ReportWithDetails extends Report {
        template?: ReportTemplate;
        sections: ReportSectionWithMetrics[];
        campus?: Campus;
        orgGroup?: OrgGroup;
        submittedBy?: UserProfile;
        reviewedBy?: UserProfile;
        approvedBy?: UserProfile;
    }

    interface ReportSectionWithMetrics extends ReportSection {
        metrics: ReportMetric[];
    }

    interface ReportFilters {
        campusId?: string;
        orgGroupId?: string;
        periodType?: ReportPeriodType;
        periodYear?: number;
        periodMonth?: number;
        status?: ReportStatus;
        templateId?: string;
        isDataEntry?: boolean;
        search?: string;
        page?: number;
        pageSize?: number;
    }

    interface ReportFormValues {
        sections: ReportSectionFormValues[];
        notes?: string;
    }

    interface ReportSectionFormValues {
        templateSectionId: string;
        metrics: ReportMetricFormValues[];
    }

    interface ReportMetricFormValues {
        templateMetricId: string;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        comment?: string;
    }

    interface ReportEdit {
        id: string;
        reportId: string;
        submittedById: string;
        status: ReportEditStatus;
        reason: string;
        sections: ReportEditSection[];
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportEditSection {
        id: string;
        editId: string;
        templateSectionId: string;
        metrics: ReportEditMetric[];
    }

    interface ReportEditMetric {
        id: string;
        editSectionId: string;
        templateMetricId: string;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        comment?: string;
    }

    interface ReportUpdateRequest {
        id: string;
        reportId: string;
        requestedById: string;
        reason: string;
        sections: ReportUpdateSection[];
        status: ReportUpdateRequestStatus;
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface ReportUpdateSection {
        templateSectionId: string;
        metrics: ReportEditMetric[];
    }

    interface ReportEvent {
        id: string;
        reportId: string;
        eventType: ReportEventType;
        actorId: string;
        timestamp: string;
        details?: string;
        previousStatus?: ReportStatus;
        newStatus?: ReportStatus;
        snapshotId?: string;
    }

    interface ReportVersion {
        id: string;
        reportId: string;
        versionNumber: number;
        snapshot: ReportWithDetails;
        createdAt: string;
        createdById: string;
        reason?: string;
    }

    interface Goal {
        id: string;
        campusId: string;
        templateMetricId: string;
        metricName: string;
        mode: GoalMode;
        year: number;
        month?: number;
        targetValue: number;
        isLocked: boolean;
        lockedAt?: string;
        lockedById?: string;
        createdById: string;
        createdAt: string;
        updatedAt: string;
    }

    interface GoalEditRequest {
        id: string;
        goalId: string;
        requestedById: string;
        reason: string;
        proposedValue: number;
        status: GoalEditRequestStatus;
        reviewedById?: string;
        reviewNotes?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface MetricEntry {
        id: string;
        reportMetricId: string;
        templateMetricId: string;
        campusId: string;
        year: number;
        month: number;
        goalValue?: number;
        achievedValue?: number;
        comment?: string;
        computedPercentage?: number;
        createdAt: string;
    }

    interface ReportAnalytics {
        campusId?: string;
        orgGroupId?: string;
        period: string;
        totalReports: number;
        submittedOnTime: number;
        submittedLate: number;
        pendingReview: number;
        approved: number;
        complianceRate: number;
    }

    interface KpiCardConfig {
        id: string;
        title: string;
        value: string | number;
        trend?: string;
        trendDirection?: "up" | "down" | "neutral";
        icon?: string;
        colorClass?: string;
        allowedRoles: UserRole[];
    }

    interface AppNotification {
        id: string;
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
        reportId?: string;
        read: boolean;
        isRead?: boolean;
        readAt?: string;
        createdAt: string;
    }

    interface RoleConfig {
        role: UserRole;
        label: string;
        hierarchyOrder: number;
        dashboardRoute: string;
        dashboardMode: "report-fill" | "report-review" | "report-reviewed" | "analytics" | "system";
        canCreateReports: boolean;
        canFillReports: boolean;
        canSubmitReports: boolean;
        canRequestEdits: boolean;
        canApproveReports: boolean;
        canMarkReviewed: boolean;
        canLockReports: boolean;
        canManageTemplates: boolean;
        canDataEntry: boolean;
        canManageUsers: boolean;
        canManageOrg: boolean;
        canSetGoals: boolean;
        canApproveGoalUnlock: boolean;
        reportVisibilityScope: "own" | "campus" | "all";
    }

    interface OrgLevelConfig {
        level: "GROUP" | "CAMPUS";
        label: string;
        parentLevel?: "GROUP";
        childLevel?: "CAMPUS";
        leaderRole: UserRole;
        adminRole?: UserRole;
    }

    interface NavItem {
        key: string;
        label: string;
        href: string;
        icon?: React.ComponentType;
        allowedRoles: UserRole[];
        badge?: number;
    }

    interface InviteLink {
        id: string;
        token: string;
        type: InviteLinkType;
        targetId?: string;
        role?: UserRole;
        targetRole?: UserRole;
        campusId?: string;
        groupId?: string;
        note?: string;
        createdById: string;
        usedAt?: string;
        expiresAt?: string;
        isActive: boolean;
        createdAt: string;
    }

    interface BugReport {
        id: string;
        category: BugReportCategory;
        description: string;
        screenshotUrl?: string;
        contactEmail: string;
        status: BugReportStatus;
        adminNotes?: string;
        createdById: string;
        createdBy?: UserProfile;
        createdAt: string;
        updatedAt: string;
    }

    type ApiResponse<T> =
        | { success: true; data: T }
        | { success: false; error: string; code: number };

    interface PaginatedResponse<T> {
        data: T[];
        total: number;
        page: number;
        pageSize: number;
    }

    interface AppContent {
        nav: Record<string, string>;
        auth: Record<string, unknown>;
        reports: Record<string, unknown>;
        templates: Record<string, unknown>;
        goals: Record<string, unknown>;
        dashboard: Record<string, unknown>;
        users: Record<string, unknown>;
        org: Record<string, unknown>;
        analytics: Record<string, unknown>;
        notifications: Record<string, unknown>;
        profile: Record<string, unknown>;
        invites: Record<string, unknown>;
        settings: Record<string, unknown>;
        bugReports: Record<string, unknown>;
        errors: Record<string, unknown>;
        common: Record<string, unknown>;
        offline: Record<string, unknown>;
        seo: Record<string, string>;
    }
}
````

## File: app/(auth)/login/page.tsx
````typescript
"use client";

import { useState, Suspense } from "react";
import { Form, Alert, Checkbox } from "antd";
import { UserOutlined, LockOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { CONTENT } from "@/config/content";
import { APP_ROUTES } from "@/config/routes";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/** All seeded demo accounts — password is always Nlp2026! */
const DEMO_ACCOUNTS = [
  { role: "Superadmin", email: "superadmin@harvesters.org" },
  { role: "SPO", email: "spo@harvesters.org" },
  { role: "CEO", email: "ceo@harvesters.org" },
  { role: "Church Ministry", email: "churchministry@harvesters.org" },
  { role: "Group Pastor", email: "grouppastor@harvesters.org" },
  { role: "Group Admin", email: "groupadmin@harvesters.org" },
  { role: "Campus Pastor", email: "campuspastor@harvesters.org" },
  { role: "Campus Admin", email: "campusadmin@harvesters.org" },
  { role: "Data Entry", email: "dataentry@harvesters.org" },
] as const;

const DEMO_PASSWORD = "Nlp2026!";

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? undefined;
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password, values.rememberMe, redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : CONTENT.auth.errors.serverError);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string) => {
    form.setFieldsValue({ email, password: DEMO_PASSWORD });
  };

  return (
    <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl shadow-ds-xl p-8 space-y-6">
      {/* Logo / Brand */}
      <div className="text-center space-y-1">
        <Image
          src="/logo/dark-bg-harvesters-Logo.jpg"
          alt="Harvesters"
          width={48}
          height={48}
          className="rounded-ds-xl mb-2"
          priority
        />
        <h1 className="text-2xl font-bold text-ds-text-primary">{CONTENT.auth.loginTitle}</h1>
        <p className="text-sm text-ds-text-secondary">{CONTENT.auth.loginSubtitle}</p>
      </div>

      {error && (
        <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="space-y-1"
      >
        <Form.Item
          name="email"
          label={CONTENT.auth.emailLabel}
          rules={[
            { required: true, message: CONTENT.auth.errors.emailRequired },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.emailPlaceholder}
            size="large"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={CONTENT.auth.passwordLabel}
          rules={[{ required: true, message: CONTENT.auth.errors.passwordRequired }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-ds-text-subtle" />}
            placeholder={CONTENT.auth.passwordPlaceholder}
            size="large"
            autoComplete="current-password"
          />
        </Form.Item>

        <div className="flex items-center justify-between mb-2">
          <Form.Item name="rememberMe" valuePropName="checked" noStyle>
            <Checkbox className="text-sm text-ds-text-secondary">
              {CONTENT.auth.rememberMe}
            </Checkbox>
          </Form.Item>
          <Link
            href={APP_ROUTES.forgotPassword}
            className="text-sm text-ds-text-link hover:underline"
          >
            {CONTENT.auth.forgotPassword}
          </Link>
        </div>

        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          {loading ? CONTENT.auth.loggingIn : CONTENT.auth.loginButton}
        </Button>
      </Form>

      <p className="text-center text-sm text-ds-text-secondary">
        {CONTENT.auth.noAccount}{" "}
        <Link href={APP_ROUTES.register} className="text-ds-text-link hover:underline font-medium">
          {CONTENT.auth.registerLink}
        </Link>
      </p>
      <p className="text-center text-xs text-ds-text-subtle mt-1">
        {CONTENT.auth.haveInvite as string}{" "}
        <Link href={APP_ROUTES.join} className="text-ds-text-link hover:underline">
          {CONTENT.auth.joinWithInvite as string}
        </Link>
      </p>

      {/* Demo credentials panel — always visible 
      <div className="mt-4 border border-ds-border-subtle rounded-ds-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCredentials((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 bg-ds-surface-sunken hover:bg-ds-surface-base transition-colors text-left cursor-pointer border-none outline-none"
        >
          <span className="text-xs font-semibold text-ds-text-secondary tracking-wide uppercase">
            Demo Accounts (all roles)
          </span>
          {showCredentials ? (
            <DownOutlined className="text-xs text-ds-text-subtle" />
          ) : (
            <RightOutlined className="text-xs text-ds-text-subtle" />
          )}
        </button>
        {showCredentials && (
          <div className="px-4 py-3 space-y-1.5 bg-ds-surface-base">
            <p className="text-[11px] text-ds-text-subtle mb-2">
              Password for all accounts:{" "}
              <code className="font-mono bg-ds-surface-sunken px-1.5 py-0.5 rounded text-ds-text-primary">
                {DEMO_PASSWORD}
              </code>
            </p>
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => fillCredentials(a.email)}
                className="flex items-center justify-between w-full text-left group bg-transparent border-none cursor-pointer p-0 outline-none"
              >
                <span className="text-xs text-ds-text-subtle group-hover:text-ds-text-primary transition-colors font-mono">
                  {a.email}
                </span>
                <span className="text-[11px] text-ds-brand-accent font-medium ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {a.role}
                </span>
              </button>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
````

## File: modules/dashboard/components/DashboardPage.tsx
````typescript
"use client";

/**
 * modules/dashboard/components/DashboardPage.tsx
 *
 * Unified role-aware dashboard — handles ALL roles via dashboardMode.
 *
 * Modes driven by ROLE_CONFIG[role].dashboardMode:
 *   "system"          → SUPERADMIN: org-wide KPIs, recent reports + recent users widgets
 *   "analytics"       → CEO / SPO / CHURCH_MINISTRY: compliance-focused KPIs
 *   "report-review"   → CAMPUS_ADMIN / CAMPUS_PASTOR: pending + approval KPIs
 *   "report-reviewed" → secondary review roles
 *   "report-fill"     → GROUP_ADMIN / GROUP_PASTOR / DATA_ENTRY: submission-focused KPIs
 *
 * Architecture notes:
 *   • ALL_KPI_CARDS: allowedModes[] filters visible cards per mode.
 *   • "system" mode additionally loads users / templates / campuses.
 *   • No role-specific JSX branches — only config-driven filtering.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  TeamOutlined,
  LayoutOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { getReportLabel, formatReportPeriod } from "@/lib/utils/reportUtils";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { ReportStatusBadge, RoleBadge } from "@/components/ui/StatusBadge";
import { UserRole, ReportStatus, ReportPeriodType } from "@/types/global";

/* ── Local types ──────────────────────────────────────────────────────────── */

interface KpiCardConfig {
  id: string;
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  href?: string;
  /** Modes for which this card is visible */
  allowedModes: string[];
}

/* ── KpiCard ─────────────────────────────────────────────────────────────── */

function KpiCard({ config }: { config: KpiCardConfig }) {
  const router = useRouter();

  return (
    <button
      onClick={() => config.href && router.push(config.href)}
      className={[
        "flex flex-col gap-3 p-5 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base text-left w-full",
        "transition-shadow hover:shadow-ds-md focus:outline-1 focus:outline-ds-brand-accent",
        config.href ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ds-text-secondary leading-snug">{config.label}</p>
        <span
          className={[
            "flex items-center justify-center w-9 h-9 rounded-ds-lg flex-shrink-0 text-base",
            config.color,
          ].join(" ")}
        >
          {config.icon}
        </span>
      </div>
      <p className="text-3xl font-bold text-ds-text-primary tabular-nums">{config.value}</p>
    </button>
  );
}

/* ── RecentReportsList ────────────────────────────────────────────────────── */

function RecentReportsList({
  reports,
  templates,
  isSuperadmin,
}: {
  reports: Report[];
  templates: ReportTemplate[];
  isSuperadmin: boolean;
}) {
  const router = useRouter();

  if (!reports.length) {
    return (
      <EmptyState
        title={CONTENT.reports.emptyState.title}
        description={CONTENT.reports.emptyState.description}
      />
    );
  }

  return (
    <ul className="divide-y divide-ds-border-subtle">
      {reports.map((r) => (
        <li key={r.id}>
          <button
            onClick={() => router.push(APP_ROUTES.reportDetail(r.id))}
            className="flex items-center justify-between gap-4 w-full py-3 px-1 hover:bg-ds-surface-sunken rounded-ds-lg transition-colors text-left bg-transparent border-none cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ds-text-primary truncate">
                {getReportLabel(r, templates)}
              </p>
              <p className="text-xs text-ds-text-subtle mt-0.5">{formatReportPeriod(r)}</p>
            </div>
            <div className="flex-shrink-0">
              <ReportStatusBadge status={r.status} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── RecentUsersList (system mode only) ──────────────────────────────────── */

function RecentUsersList({ users }: { users: UserProfile[] }) {
  const router = useRouter();

  if (!users.length) {
    return (
      <EmptyState
        title={CONTENT.users.emptyState.title}
        description={CONTENT.users.emptyState.description}
      />
    );
  }

  return (
    <ul className="divide-y divide-ds-border-subtle">
      {users.map((u) => (
        <li key={u.id}>
          <button
            onClick={() => router.push(APP_ROUTES.userDetail(u.id))}
            className="flex items-center justify-between gap-4 w-full py-3 px-1 hover:bg-ds-surface-sunken rounded-ds-lg transition-colors text-left bg-transparent border-none cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ds-text-primary truncate">
                {u.firstName} {u.lastName}
              </p>
              <p className="text-xs text-ds-text-subtle mt-0.5 truncate">{u.email}</p>
            </div>
            <div className="flex-shrink-0">
              <RoleBadge role={u.role} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── DashboardPage ────────────────────────────────────────────────────────── */

export function DashboardPage() {
  const { user } = useAuth();
  const { role, config: roleConfig } = useRole();
  const router = useRouter();

  const dashboardMode = roleConfig?.dashboardMode ?? "report-fill";
  const isSuperadmin = role === UserRole.SUPERADMIN;
  const visibilityScope = roleConfig?.reportVisibilityScope ?? "own";

  /* ── Data subscriptions ─────────────────────────────────────────────────── */

  // Load reports scoped to campus where applicable.
  // Complex scoping (own) is done in useMemo — WhereClause<T> only supports Partial<T>.
  const reportsUrl = user
    ? visibilityScope === "campus" && user.campusId
      ? `${API_ROUTES.reports.list}?campusId=${user.campusId}`
      : API_ROUTES.reports.list
    : null;
  const { data: reportsPage } = useApiData<{ reports: Report[]; total: number }>(reportsUrl);
  const allReports = reportsPage?.reports;

  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

  // System-mode-only subscriptions — empty for non-superadmin
  const { data: allUsers } = useApiData<UserProfile[]>(isSuperadmin ? API_ROUTES.users.list : null);

  const { data: campuses } = useApiData<Campus[]>(isSuperadmin ? API_ROUTES.org.campuses : null);

  /* ── Scope filtering ────────────────────────────────────────────────────── */

  const reports = useMemo(() => {
    if (!allReports) return undefined;
    if (visibilityScope === "own" && user) {
      return allReports.filter((r) => r.orgGroupId === user.orgGroupId);
    }
    return allReports;
  }, [allReports, visibilityScope, user]);

  /* ── Derived counts ─────────────────────────────────────────────────────── */

  const counts = useMemo(() => {
    const r = reports ?? [];
    const u = allUsers ?? [];
    const t = templates ?? [];
    const c = campuses ?? [];

    const completed = r.filter((x) =>
      [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(x.status),
    ).length;

    // Current quarter compliance
    const now = new Date();
    const currentQ = Math.ceil((now.getMonth() + 1) / 3);
    const currentYear = now.getFullYear();
    const qMonths = [(currentQ - 1) * 3 + 1, (currentQ - 1) * 3 + 2, (currentQ - 1) * 3 + 3];
    const qReports = r.filter((x) => x.periodYear === currentYear && qMonths.includes(x.periodMonth ?? 0));
    const qSubmitted = qReports.filter((x) => x.status !== ReportStatus.DRAFT).length;
    const qApproved = qReports.filter((x) =>
      [ReportStatus.APPROVED, ReportStatus.REVIEWED, ReportStatus.LOCKED].includes(x.status),
    ).length;
    const quarterlyCompliance = qSubmitted > 0 ? Math.round((qApproved / qSubmitted) * 100) : 0;

    return {
      totalReports: r.length,
      pending: r.filter((x) => x.status === ReportStatus.SUBMITTED).length,
      approved: r.filter((x) => x.status === ReportStatus.APPROVED).length,
      draft: r.filter((x) => x.status === ReportStatus.DRAFT).length,
      requiresEdits: r.filter((x) => x.status === ReportStatus.REQUIRES_EDITS).length,
      compliance: r.length > 0 ? Math.round((completed / r.length) * 100) : 0,
      quarterlyCompliance,
      quarterlyLabel: `Q${currentQ}`,
      activeUsers: u.filter((x) => x.isActive).length,
      activeTemplates: t.filter((x) => x.isActive !== false).length,
      totalCampuses: c.length,
    };
  }, [reports, allUsers, templates, campuses]);

  /* ── Weekly report check for current period ─────────────────────────────── */

  const weeklyReportCheck = useMemo(() => {
    if (!reports || !user) return { hasWeeklyReport: true, currentPeriodLabel: "" };
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
    const currentWeek = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
    const currentYear = now.getFullYear();

    const hasWeeklyReport = reports.some(
      (r) =>
        r.periodType === ReportPeriodType.WEEKLY &&
        r.periodYear === currentYear &&
        r.periodWeek === currentWeek &&
        r.createdById === user.id,
    );

    return {
      hasWeeklyReport,
      currentPeriodLabel: `Week ${currentWeek}, ${currentYear}`,
    };
  }, [reports, user]);

  /* ── KPI card config ────────────────────────────────────────────────────── */

  const reportsHref = APP_ROUTES.reports;

  const ALL_KPI_CARDS: KpiCardConfig[] = [
    {
      id: "total-reports",
      label: CONTENT.dashboard.kpi.totalReports,
      value: counts.totalReports,
      icon: <FileTextOutlined />,
      color: "bg-ds-brand-accent/10 text-ds-brand-accent",
      href: reportsHref,
      allowedModes: ["system", "report-fill", "report-review", "report-reviewed", "analytics"],
    },
    {
      id: "pending-review",
      label: CONTENT.dashboard.kpi.pendingReview,
      value: counts.pending,
      icon: <ClockCircleOutlined />,
      color: "bg-ds-state-warning/10 text-ds-state-warning",
      href: reportsHref,
      allowedModes: ["system", "report-review", "report-reviewed", "analytics"],
    },
    {
      id: "approved-reports",
      label: CONTENT.dashboard.kpi.approvedReports,
      value: counts.approved,
      icon: <CheckCircleOutlined />,
      color: "bg-ds-state-success/10 text-ds-state-success",
      href: reportsHref,
      allowedModes: ["system", "report-fill", "report-review", "report-reviewed", "analytics"],
    },
    {
      id: "compliance-rate",
      label: CONTENT.dashboard.kpi.complianceRate,
      value: `${counts.compliance}%`,
      icon: <BarChartOutlined />,
      color: "bg-ds-brand-secondary/10 text-ds-brand-secondary",
      allowedModes: ["system", "report-review", "report-reviewed", "analytics"],
    },
    {
      id: "total-users",
      label: CONTENT.dashboard.kpi.totalUsers,
      value: counts.activeUsers,
      icon: <TeamOutlined />,
      color: "bg-ds-brand-accent/10 text-ds-brand-accent",
      href: APP_ROUTES.users,
      allowedModes: ["system"],
    },
    {
      id: "total-campuses",
      label: CONTENT.dashboard.kpi.totalCampuses,
      value: counts.totalCampuses,
      icon: <ApartmentOutlined />,
      color: "bg-ds-surface-sunken text-ds-text-secondary",
      href: APP_ROUTES.org,
      allowedModes: ["system"],
    },
    {
      id: "active-templates",
      label: CONTENT.dashboard.kpi.activeTemplates,
      value: counts.activeTemplates,
      icon: <LayoutOutlined />,
      color: "bg-ds-state-info/10 text-ds-state-info",
      href: APP_ROUTES.templates,
      allowedModes: ["system"],
    },
    {
      id: "requires-edits",
      label: CONTENT.reports.status.REQUIRES_EDITS,
      value: counts.requiresEdits,
      icon: <ExclamationCircleOutlined />,
      color: "bg-ds-state-error/10 text-ds-state-error",
      href: reportsHref,
      allowedModes: ["system", "report-fill"],
    },
    {
      id: "draft-reports",
      label: CONTENT.reports.status.DRAFT,
      value: counts.draft,
      icon: <SendOutlined />,
      color: "bg-ds-surface-sunken text-ds-text-subtle",
      href: reportsHref,
      allowedModes: ["report-fill"],
    },
    {
      id: "quarterly-compliance",
      label: `${CONTENT.dashboard.kpi.quarterlyCompliance} (${counts.quarterlyLabel})`,
      value: `${counts.quarterlyCompliance}%`,
      icon: <BarChartOutlined />,
      color: "bg-ds-brand-secondary/10 text-ds-brand-secondary",
      href: APP_ROUTES.analytics,
      allowedModes: ["system", "analytics", "report-review", "report-reviewed"],
    },
  ];

  const visibleKpiCards = ALL_KPI_CARDS.filter((c) => c.allowedModes.includes(dashboardMode));

  /* ── Recent items ───────────────────────────────────────────────────────── */

  const recentReports = useMemo(
    () =>
      [...(reports ?? [])]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [reports],
  );

  const recentUsers = useMemo(
    () =>
      [...(allUsers ?? [])]
        .sort(
          (a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime(),
        )
        .slice(0, 5),
    [allUsers],
  );

  /* ── Guards ─────────────────────────────────────────────────────────────── */

  const isLoading =
    reports === undefined || templates === undefined || (isSuperadmin && allUsers === undefined);

  const canCreate = roleConfig?.canCreateReports ?? false;

  if (!user || !role) return <LoadingSkeleton rows={3} />;

  /* ── Member lobby — MEMBER role sees a waiting page ─────────────────────── */
  if (role === UserRole.MEMBER) {
    const lobby = CONTENT.dashboard.memberLobby as {
      title: string;
      subtitle: string;
      waitingLabel: string;
      currentRole: string;
      contactAdmin: string;
    };

    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-20 px-4 max-w-lg mx-auto text-center gap-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-ds-brand-accent/10">
            <ClockCircleOutlined className="text-3xl text-ds-brand-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-ds-text-primary">{lobby.title}</h1>
            <p className="text-sm text-ds-text-secondary leading-relaxed">{lobby.subtitle}</p>
          </div>
          <div className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl p-5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ds-text-secondary">{lobby.currentRole}</span>
              <span className="text-xs font-medium text-ds-text-subtle bg-ds-surface-sunken px-3 py-1 rounded-full">
                {lobby.waitingLabel}
              </span>
            </div>
            <p className="text-left text-sm font-medium text-ds-text-primary mt-2">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-left text-xs text-ds-text-subtle">{user.email}</p>
          </div>
          <p className="text-xs text-ds-text-subtle">{lobby.contactAdmin}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={CONTENT.dashboard.pageTitle}
        subtitle={`${CONTENT.dashboard.welcomeBack}, ${user.firstName}`}
        actions={
          canCreate ? (
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => router.push(APP_ROUTES.reportNew)}
            >
              {CONTENT.reports.newReport}
            </Button>
          ) : undefined
        }
      />

      {/* ── Role-aware action CTAs ───────────────────────────────────────── */}
      {!isLoading &&
        (() => {
          const ctaContent = CONTENT.dashboard.cta as {
            pendingApproval: (n: number) => string;
            pendingReview: (n: number) => string;
            draftReports: (n: number) => string;
            requiresEdits: (n: number) => string;
            weeklyReportDue: (period: string) => string;
            viewReports: string;
          };

          interface CtaItem {
            id: string;
            message: string;
            type: "warning" | "info" | "error";
            show: boolean;
          }

          const ctaItems: CtaItem[] = [
            {
              id: "weekly-report-due",
              message: ctaContent.weeklyReportDue(weeklyReportCheck.currentPeriodLabel),
              type: "warning",
              show: (roleConfig?.canFillReports ?? false) && !weeklyReportCheck.hasWeeklyReport,
            },
            {
              id: "pending-approval",
              message: ctaContent.pendingApproval(counts.pending),
              type: "warning",
              show: (roleConfig?.canApproveReports ?? false) && counts.pending > 0,
            },
            {
              id: "pending-review",
              message: ctaContent.pendingReview(counts.approved),
              type: "info",
              show: (roleConfig?.canMarkReviewed ?? false) && counts.approved > 0,
            },
            {
              id: "drafts",
              message: ctaContent.draftReports(counts.draft),
              type: "info",
              show: (roleConfig?.canFillReports ?? false) && counts.draft > 0,
            },
            {
              id: "requires-edits",
              message: ctaContent.requiresEdits(counts.requiresEdits),
              type: "error",
              show: (roleConfig?.canFillReports ?? false) && counts.requiresEdits > 0,
            },
          ];

          const visible = ctaItems.filter((c) => c.show);
          if (visible.length === 0) return null;

          const typeStyles: Record<"warning" | "info" | "error", string> = {
            warning:
              "border-amber-400/60 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300",
            info: "border-ds-brand-accent/40 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
            error: "border-red-400/60 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300",
          };
          const dotStyles: Record<"warning" | "info" | "error", string> = {
            warning: "bg-amber-400",
            info: "bg-ds-brand-accent",
            error: "bg-red-500",
          };

          return (
            <div className="flex flex-col gap-2 mb-6">
              {visible.map((cta) => (
                <div
                  key={cta.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 rounded-ds-xl border text-sm font-medium ${typeStyles[cta.type]}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotStyles[cta.type]}`} />
                    {cta.message}
                  </span>
                  <button
                    onClick={() => router.push(reportsHref)}
                    className="underline underline-offset-2 text-xs opacity-80 hover:opacity-100 whitespace-nowrap flex-shrink-0"
                  >
                    {ctaContent.viewReports}
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

      {/* KPI grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: visibleKpiCards.length || 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {visibleKpiCards.map((card) => (
            <KpiCard key={card.id} config={card} />
          ))}
        </div>
      )}

      {/* Widgets row */}
      <div className={`grid gap-6 ${isSuperadmin ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Recent reports — all roles */}
        <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ds-text-primary">
              {CONTENT.dashboard.recentActivity}
            </h2>
            <Button
              type="link"
              size="small"
              onClick={() => router.push(reportsHref)}
              className="text-ds-text-link"
            >
              {CONTENT.reports.viewReport}
            </Button>
          </div>
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <RecentReportsList
              reports={recentReports}
              templates={templates ?? []}
              isSuperadmin={isSuperadmin}
            />
          )}
        </div>

        {/* Recent users — system mode only */}
        {isSuperadmin && (
          <div className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-ds-text-primary">
                {CONTENT.users.pageTitle}
              </h2>
              <Button
                type="link"
                size="small"
                onClick={() => router.push(APP_ROUTES.users)}
                className="text-ds-text-link"
              >
                {CONTENT.common.viewAll}
              </Button>
            </div>
            {isLoading ? <LoadingSkeleton rows={5} /> : <RecentUsersList users={recentUsers} />}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
````

## File: modules/goals/components/GoalsPage.tsx
````typescript
"use client";

/**
 * modules/goals/components/GoalsPage.tsx
 *
 * Goals management — GROUP_ADMIN and above.
 *
 * Layout:
 *   - Year selector + mode selector (Annual / Monthly) at top
 *   - "All Campuses" tab + one tab per campus
 *   - Inside each tab: a bulk-edit table with one row per metric that capturesGoal
 *     organised by template section. All fields visible simultaneously — no
 *     per-metric submit loop.
 *   - "All Campuses" tab = matrix view: rows = metrics, columns = campuses
 *   - Locked goals show a lock badge; editing them opens an unlock-request modal.
 */

import { useState, useCallback } from "react";
import {
  InputNumber,
  Select,
  Tag,
  Tooltip,
  message,
  Modal,
  Tabs,
  Form,
  Collapse,
  Checkbox,
} from "antd";
import {
  TrophyOutlined,
  LockOutlined,
  UnlockOutlined,
  SaveOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { GoalMode, GoalEditRequestStatus, UserRole } from "@/types/global";

const g = CONTENT.goals as Record<string, unknown>;

/* ── Constants ─────────────────────────────────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map((y) => ({
  value: y,
  label: String(y),
}));
const MODE_OPTIONS = [
  { value: GoalMode.ANNUAL, label: g.modeAnnual as string },
  { value: GoalMode.MONTHLY, label: g.modeMonthly as string },
];
const MONTH_LABELS = g.months as string[];

const CAN_WRITE_ROLES: UserRole[] = [
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
  UserRole.SUPERADMIN,
];
const WIDE_VIEW_ROLES: UserRole[] = [
  UserRole.SPO,
  UserRole.CEO,
  UserRole.CHURCH_MINISTRY,
  UserRole.SUPERADMIN,
  UserRole.GROUP_ADMIN,
  UserRole.GROUP_PASTOR,
];

function canWrite(role: UserRole): boolean {
  return CAN_WRITE_ROLES.includes(role);
}
function canSeeAllCampuses(role: UserRole): boolean {
  return WIDE_VIEW_ROLES.includes(role);
}

/* ── Types ──────────────────────────────────────────────────────────────────── */

/** keyed by metricId */
type BulkGoalValues = Record<string, number | undefined>;
/** keyed by campusId then metricId (for all-campuses view) */
type MatrixValues = Record<string, BulkGoalValues>;

/* ── Helpers ─────────────────────────────────────────────────────────────────  */

function goalKey(campusId: string, metricId: string, year: number, mode: GoalMode, month?: number) {
  return `${campusId}:${metricId}:${year}:${mode}${month != null ? `:${month}` : ""}`;
}

function goalsToMap(goals: Goal[]): Record<string, Goal> {
  const map: Record<string, Goal> = {};
  for (const goal of goals) {
    map[goalKey(goal.campusId, goal.templateMetricId, goal.year, goal.mode, goal.month)] = goal;
  }
  return map;
}

/* ── Unlock-request modal ───────────────────────────────────────────────────── */

interface UnlockModalProps {
  goal: Goal;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function UnlockModal({ goal, open, onClose, onSuccess }: UnlockModalProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: { reason: string; proposedValue: number }) => {
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.goals.unlockRequest(goal.id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? "Error");
        return;
      }
      message.success("Unlock request submitted.");
      form.resetFields();
      onSuccess();
    } catch {
      message.error("Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={g.requestUnlock as string}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="mt-4"
      >
        <div className="text-xs text-ds-text-subtle mb-3">
          <strong>{goal.metricName}</strong>
          {" — current target: "}
          {goal.targetValue.toLocaleString()}
        </div>
        <Form.Item
          name="proposedValue"
          label={g.targetValueLabel as string}
          rules={[{ required: true, message: "Required" }]}
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item
          name="reason"
          label={g.unlockReasonLabel as string}
          rules={[{ required: true, min: 10, message: "At least 10 characters." }]}
        >
          <Input.TextArea rows={3} placeholder={g.unlockReasonPlaceholder as string} />
        </Form.Item>
        <div className="flex gap-3 justify-end">
          <Button onClick={onClose}>{CONTENT.common.cancel as string}</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {g.requestUnlock as string}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

/* ── BulkGoalTable — one campus, all metrics in sections ─────────────────── */

interface BulkGoalTableProps {
  campusId: string;
  year: number;
  mode: GoalMode;
  templates: ReportTemplate[];
  goals: Goal[];
  canEdit: boolean;
  isSuperadmin: boolean;
}

function BulkGoalTable({
  campusId,
  year,
  mode,
  templates,
  goals,
  canEdit,
  isSuperadmin,
}: BulkGoalTableProps) {
  const goalMap = goalsToMap(goals.filter((g) => g.campusId === campusId));

  /** local edits: metricId -> { ann: number } | { months: Record<number, number> } */
  const [annValues, setAnnValues] = useState<BulkGoalValues>(() => {
    const init: BulkGoalValues = {};
    for (const goal of goals.filter(
      (go) => go.campusId === campusId && go.mode === GoalMode.ANNUAL && go.year === year,
    )) {
      init[goal.templateMetricId] = goal.targetValue;
    }
    return init;
  });
  const [monthValues, setMonthValues] = useState<Record<string, Record<number, number>>>(() => {
    const init: Record<string, Record<number, number>> = {};
    for (const goal of goals.filter(
      (go) =>
        go.campusId === campusId &&
        go.mode === GoalMode.MONTHLY &&
        go.year === year &&
        go.month != null,
    )) {
      if (!init[goal.templateMetricId]) init[goal.templateMetricId] = {};
      init[goal.templateMetricId][goal.month!] = goal.targetValue;
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [unlockGoal, setUnlockGoal] = useState<Goal | undefined>(undefined);

  /* Collect all goal-capturing metrics across all templates */
  const sections: Array<{ section: ReportTemplateSection; metrics: ReportTemplateMetric[] }> =
    templates.flatMap((tmpl) =>
      tmpl.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          section,
          metrics: section.metrics
            .filter((m) => m.capturesGoal)
            .slice()
            .sort((a, b) => a.order - b.order),
        }))
        .filter(({ metrics }) => metrics.length > 0),
    );

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payloads: object[] = [];

      if (mode === GoalMode.ANNUAL) {
        for (const [metricId, val] of Object.entries(annValues)) {
          if (val == null) continue;
          const sectionAndMetric = sections
            .flatMap(({ metrics }) => metrics)
            .find((m) => m.id === metricId);
          if (!sectionAndMetric) continue;
          payloads.push({
            campusId,
            templateMetricId: metricId,
            metricName: sectionAndMetric.name,
            mode: GoalMode.ANNUAL,
            year,
            targetValue: val,
          });
        }
      } else {
        for (const [metricId, months] of Object.entries(monthValues)) {
          const sectionAndMetric = sections
            .flatMap(({ metrics }) => metrics)
            .find((m) => m.id === metricId);
          if (!sectionAndMetric) continue;
          for (const [month, val] of Object.entries(months)) {
            if (val == null) continue;
            payloads.push({
              campusId,
              templateMetricId: metricId,
              metricName: sectionAndMetric.name,
              mode: GoalMode.MONTHLY,
              year,
              month: Number(month),
              targetValue: val,
            });
          }
        }
      }

      await Promise.all(
        payloads.map((payload) =>
          fetch(API_ROUTES.goals.list, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        ),
      );

      message.success(g.savedGoals as string);
    } catch {
      message.error((CONTENT.errors as Record<string, string>).generic ?? "Error saving goals.");
    } finally {
      setSaving(false);
    }
  };

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={<TrophyOutlined />}
        title={(g.emptyState as Record<string, string>)?.title}
        description="No goal-capturing metrics found in active templates."
      />
    );
  }

  /* Build Collapse panels — one per section */
  const collapseItems = sections.map(({ section, metrics }) => ({
    key: section.id,
    label: (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ds-text-primary">{section.name}</span>
        <span className="text-xs text-ds-text-subtle">
          {metrics.length} goal metric{metrics.length !== 1 ? "s" : ""}
        </span>
      </div>
    ),
    children: (
      <div className="space-y-0">
        {/* Column headers */}
        <div className="overflow-x-auto">
          <div
            className={`grid gap-3 pb-2 border-b border-ds-border-subtle text-xs font-semibold text-ds-text-secondary ${mode === GoalMode.MONTHLY ? "grid-cols-[200px_1fr] min-w-[800px]" : "grid-cols-[200px_160px_120px]"}`}
          >
            <span>{g.metricColumn as string}</span>
            {mode === GoalMode.ANNUAL ? (
              <>
                <span>{g.annualTargetShort as string}</span>
                <span className="text-right">Status</span>
              </>
            ) : (
              <div className="grid grid-cols-12 gap-1">
                {MONTH_LABELS.map((lbl) => (
                  <span key={lbl} className="text-center truncate">
                    {lbl}
                  </span>
                ))}
              </div>
            )}
          </div>

          {metrics.map((metric) => {
            const existingGoal =
              mode === GoalMode.ANNUAL
                ? goalMap[goalKey(campusId, metric.id, year, GoalMode.ANNUAL)]
                : undefined;
            const isLocked = (existingGoal?.isLocked ?? false) && !isSuperadmin;

            return (
              <div
                key={metric.id}
                className={`grid gap-3 py-3 border-b border-ds-border-subtle last:border-none items-center ${mode === GoalMode.MONTHLY ? "grid-cols-[200px_1fr] min-w-[800px]" : "grid-cols-[200px_160px_120px]"}`}
              >
                {/* Metric name */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm text-ds-text-primary truncate">{metric.name}</span>
                  {isLocked && (
                    <Tooltip title={g.lockedNote as string}>
                      <LockOutlined className="text-orange-400 text-xs shrink-0" />
                    </Tooltip>
                  )}
                </div>

                {mode === GoalMode.ANNUAL ? (
                  <>
                    {/* Annual target input */}
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={annValues[metric.id]}
                      disabled={!canEdit || isLocked}
                      placeholder={g.noGoalSet as string}
                      onChange={(v) =>
                        setAnnValues((prev) => ({ ...prev, [metric.id]: v ?? undefined }))
                      }
                    />
                    {/* Lock / edit action */}
                    <div className="flex justify-end">
                      {isLocked ? (
                        <Button
                          size="small"
                          icon={<UnlockOutlined />}
                          onClick={() => setUnlockGoal(existingGoal)}
                        >
                          {g.requestUnlock as string}
                        </Button>
                      ) : existingGoal ? (
                        <Tag color="green">
                          <UnlockOutlined className="mr-1" />
                          Set
                        </Tag>
                      ) : (
                        <Tag color="default">{g.noGoalSet as string}</Tag>
                      )}
                    </div>
                  </>
                ) : (
                  /* Monthly mode — 12 mini inputs */
                  <div className="grid grid-cols-12 gap-1">
                    {MONTH_LABELS.map((_, idx) => {
                      const month = idx + 1;
                      const monthGoal =
                        goalMap[goalKey(campusId, metric.id, year, GoalMode.MONTHLY, month)];
                      const monthLocked = (monthGoal?.isLocked ?? false) && !isSuperadmin;
                      return (
                        <InputNumber
                          key={month}
                          size="small"
                          className="w-full"
                          min={0}
                          value={monthValues[metric.id]?.[month] ?? monthGoal?.targetValue}
                          disabled={!canEdit || monthLocked}
                          placeholder="0"
                          controls={false}
                          onChange={(v) =>
                            setMonthValues((prev) => ({
                              ...prev,
                              [metric.id]: { ...(prev[metric.id] ?? {}), [month]: v ?? 0 },
                            }))
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      <Collapse
        items={collapseItems}
        defaultActiveKey={collapseItems.map((i) => i.key)}
        className="bg-ds-surface-elevated border border-ds-border-base rounded-ds-2xl overflow-hidden"
      />

      {canEdit && (
        <div className="flex justify-end">
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveAll}>
            {g.saveAll as string}
          </Button>
        </div>
      )}

      {unlockGoal && (
        <UnlockModal
          goal={unlockGoal}
          open={!!unlockGoal}
          onClose={() => setUnlockGoal(undefined)}
          onSuccess={() => setUnlockGoal(undefined)}
        />
      )}
    </div>
  );
}

/* ── AllCampusesMatrix — rows = metrics, cols = campuses ─────────────────── */

interface AllCampusesMatrixProps {
  campuses: Campus[];
  year: number;
  mode: GoalMode;
  templates: ReportTemplate[];
  goals: Goal[];
  canEdit: boolean;
  isSuperadmin: boolean;
}

function AllCampusesMatrix({
  campuses,
  year,
  mode,
  templates,
  goals,
  canEdit,
  isSuperadmin,
}: AllCampusesMatrixProps) {
  const goalMap = goalsToMap(goals);
  /** campusId -> metricId -> value */
  const [matrixValues, setMatrixValues] = useState<MatrixValues>(() => {
    const init: MatrixValues = {};
    for (const goal of goals.filter((go) => go.mode === mode && go.year === year)) {
      if (!init[goal.campusId]) init[goal.campusId] = {};
      init[goal.campusId][goal.templateMetricId] = goal.targetValue;
    }
    return init;
  });
  const [saving, setSaving] = useState(false);

  const sections: Array<{ section: ReportTemplateSection; metrics: ReportTemplateMetric[] }> =
    templates.flatMap((tmpl) =>
      tmpl.sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          section,
          metrics: section.metrics
            .filter((m) => m.capturesGoal)
            .slice()
            .sort((a, b) => a.order - b.order),
        }))
        .filter(({ metrics }) => metrics.length > 0),
    );

  const setCellValue = (campusId: string, metricId: string, v: number | null) =>
    setMatrixValues((prev) => ({
      ...prev,
      [campusId]: { ...(prev[campusId] ?? {}), [metricId]: v ?? undefined },
    }));

  const handleSaveAll = async () => {
    if (mode !== GoalMode.ANNUAL) {
      message.info("Use per-campus tabs for monthly goal entry.");
      return;
    }
    setSaving(true);
    try {
      const payloads: object[] = [];
      for (const [campusId, metricMap] of Object.entries(matrixValues)) {
        for (const [metricId, val] of Object.entries(metricMap)) {
          if (val == null) continue;
          const metric = sections.flatMap(({ metrics }) => metrics).find((m) => m.id === metricId);
          if (!metric) continue;
          payloads.push({
            campusId,
            templateMetricId: metricId,
            metricName: metric.name,
            mode: GoalMode.ANNUAL,
            year,
            targetValue: val,
          });
        }
      }
      await Promise.all(
        payloads.map((payload) =>
          fetch(API_ROUTES.goals.list, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        ),
      );
      message.success(g.savedGoals as string);
    } catch {
      message.error("Error saving goals.");
    } finally {
      setSaving(false);
    }
  };

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={<TrophyOutlined />}
        title="No goal metrics found"
        description="No metrics with goal-capturing enabled exist in active templates."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-ds-text-subtle">{g.bulkNote as string}</p>

      {sections.map(({ section, metrics }) => (
        <div
          key={section.id}
          className="bg-ds-surface-elevated rounded-ds-2xl border border-ds-border-base overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-ds-border-base bg-ds-surface">
            <span className="font-semibold text-sm text-ds-text-primary">{section.name}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-ds-border-subtle text-xs text-ds-text-secondary">
                  <th className="text-left px-4 py-2 w-40 font-semibold">Metric</th>
                  {campuses.map((campus) => (
                    <th
                      key={campus.id}
                      className="text-center px-2 py-2 font-semibold min-w-[110px]"
                    >
                      {campus.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => {
                  return (
                    <tr
                      key={metric.id}
                      className="border-b border-ds-border-subtle last:border-none hover:bg-ds-surface/40"
                    >
                      <td className="px-4 py-2 text-ds-text-primary font-medium">{metric.name}</td>
                      {campuses.map((campus) => {
                        const existing =
                          goalMap[goalKey(campus.id, metric.id, year, GoalMode.ANNUAL)];
                        const isLocked = (existing?.isLocked ?? false) && !isSuperadmin;
                        const currentVal =
                          matrixValues[campus.id]?.[metric.id] ?? existing?.targetValue;
                        return (
                          <td key={campus.id} className="px-2 py-2 text-center">
                            {isLocked ? (
                              <Tooltip title={g.lockedNote as string}>
                                <Tag icon={<LockOutlined />} color="orange">
                                  {existing?.targetValue?.toLocaleString() ?? "—"}
                                </Tag>
                              </Tooltip>
                            ) : (
                              <InputNumber
                                size="small"
                                className="w-24 text-center"
                                min={0}
                                value={currentVal}
                                disabled={!canEdit}
                                placeholder="—"
                                controls={false}
                                onChange={(v) => setCellValue(campus.id, metric.id, v)}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {canEdit && mode === GoalMode.ANNUAL && (
        <div className="flex justify-end">
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSaveAll}>
            {g.saveAll as string}
          </Button>
        </div>
      )}
      {mode === GoalMode.MONTHLY && (
        <p className="text-xs text-ds-text-subtle text-right">
          Monthly goals are set per-campus. Use the individual campus tabs.
        </p>
      )}
    </div>
  );
}

/* ── GoalsPage ──────────────────────────────────────────────────────────────── */

export function GoalsPage() {
  const { user } = useAuth();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [mode, setMode] = useState<GoalMode>(GoalMode.ANNUAL);

  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);
  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);
  const { data: goals } = useApiData<Goal[]>(`${API_ROUTES.goals.list}?year=${year}`, [year]);

  if (!user || !campuses || !templates || !goals) return <LoadingSkeleton rows={8} />;

  const write = canWrite(user.role);
  const seeAllCampuses = canSeeAllCampuses(user.role);
  const isSuperadmin = user.role === UserRole.SUPERADMIN;

  const visibleCampuses = seeAllCampuses
    ? campuses
    : campuses.filter((c) => c.id === user.campusId);

  /* Build tab items */
  const campusTabs = visibleCampuses.map((campus) => ({
    key: campus.id,
    label: campus.name,
    children: (
      <BulkGoalTable
        campusId={campus.id}
        year={year}
        mode={mode}
        templates={templates}
        goals={goals}
        canEdit={write}
        isSuperadmin={isSuperadmin}
      />
    ),
  }));

  /* "All Campuses" overview tab — only for wide-view roles + annual mode */
  const allCampusesTab = seeAllCampuses
    ? [
        {
          key: "_all",
          label: (
            <span className="flex items-center gap-1.5">
              <GlobalOutlined />
              {g.allCampuses as string}
            </span>
          ),
          children: (
            <AllCampusesMatrix
              campuses={visibleCampuses}
              year={year}
              mode={mode}
              templates={templates}
              goals={goals}
              canEdit={write}
              isSuperadmin={isSuperadmin}
            />
          ),
        },
      ]
    : [];

  const tabItems = [...allCampusesTab, ...campusTabs];

  return (
    <PageLayout>
      <PageHeader
        title={g.pageTitle as string}
        subtitle={`${year} · ${ROLE_CONFIG[user.role]?.label ?? user.role}`}
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={mode}
              onChange={(v) => setMode(v as GoalMode)}
              options={MODE_OPTIONS}
              size="middle"
              style={{ width: 170 }}
            />
            <Select
              value={year}
              onChange={setYear}
              options={YEAR_OPTIONS}
              size="middle"
              style={{ width: 100 }}
            />
          </div>
        }
      />

      {tabItems.length === 0 ? (
        <EmptyState
          icon={<TrophyOutlined />}
          title="No campuses assigned"
          description="You must be assigned to a campus to manage goals."
        />
      ) : (
        <Tabs items={tabItems} className="mt-2" />
      )}
    </PageLayout>
  );
}
````

## File: modules/reports/components/ReportsListPage.tsx
````typescript
"use client";

/**
 * modules/reports/components/ReportsListPage.tsx
 *
 * Unified role-aware reports list.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Select } from "antd";
import { PlusOutlined, LockOutlined, EyeOutlined, EditOutlined, DownloadOutlined } from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/lib/hooks/useRole";
import { useApiData } from "@/lib/hooks/useApiData";
import { CONTENT } from "@/config/content";
import { APP_ROUTES, API_ROUTES } from "@/config/routes";
import { ROLE_CONFIG } from "@/config/roles";
import { getReportLabel, formatReportPeriod } from "@/lib/utils/reportUtils";
import { fmtDate } from "@/lib/utils/formatDate";
import Button from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageLayout, PageHeader } from "@/components/ui/PageLayout";
import { ReportStatusBadge } from "@/components/ui/StatusBadge";
import { FilterToolbar } from "@/components/ui/FilterToolbar";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { ExportDialog } from "./ExportDialog";
import { UserRole, ReportStatus } from "@/types/global";
import type { ColumnsType } from "antd/es/table";

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ColumnConfig {
  key: string;
  /** allowedRoles: roles that can see this column */
  allowedRoles: UserRole[];
  antColumn: NonNullable<ColumnsType<Report>[number]>;
}

interface Filters {
  search: string;
  status: ReportStatus | "";
  campusId: string;
  periodYear: string;
}

const PAGE_SIZE = 20;

/* ── Status options ───────────────────────────────────────────────────────── */

const STATUS_OPTIONS = Object.values(ReportStatus).map((s) => ({
  value: s,
  label: CONTENT.reports.status[s] ?? s,
}));

const ALL_ROLES = Object.values(UserRole);
const MULTI_CAMPUS_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.CEO,
  UserRole.SPO,
  UserRole.CHURCH_MINISTRY,
  UserRole.CAMPUS_PASTOR,
  UserRole.CAMPUS_ADMIN,
];

/* ── ReportsListPage ──────────────────────────────────────────────────────── */

export function ReportsListPage() {
  const { user } = useAuth();
  const { role, can } = useRole();
  const router = useRouter();

  const isSuperadmin = role === UserRole.SUPERADMIN;
  const visibilityScope = role ? (ROLE_CONFIG[role].reportVisibilityScope ?? "own") : "own";
  const showCampusColumn = role ? MULTI_CAMPUS_ROLES.includes(role) : false;

  /* ── Filter state ───────────────────────────────────────────────────────── */

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    campusId: "",
    periodYear: "",
  });
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);

  function updateFilter(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  function resetFilters() {
    setFilters({ search: "", status: "", campusId: "", periodYear: "" });
    setPage(1);
  }

  const isFiltered = Object.values(filters).some(Boolean);

  /* ── Data subscriptions ─────────────────────────────────────────────────── */

  const reportsUrl = user
    ? visibilityScope === "campus" && user.campusId
      ? `${API_ROUTES.reports.list}?campusId=${user.campusId}`
      : API_ROUTES.reports.list
    : null;
  const { data: reportsPage } = useApiData<{ reports: Report[]; total: number }>(reportsUrl);
  const allReports = reportsPage?.reports;

  const { data: templates } = useApiData<ReportTemplate[]>(API_ROUTES.reportTemplates.list);

  const { data: campuses } = useApiData<Campus[]>(API_ROUTES.org.campuses);

  /* ── Scope + client-side filtering ─────────────────────────────────────── */

  const filteredReports = useMemo(() => {
    if (!allReports) return undefined;

    let result = allReports;

    // "own" scope — reports belonging to the user's org group
    if (visibilityScope === "own" && user) {
      result = result.filter((r) => r.orgGroupId === user.orgGroupId);
    }

    // Status filter
    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }

    // Campus filter
    if (filters.campusId) {
      result = result.filter((r) => r.campusId === filters.campusId);
    }

    // Period year filter
    if (filters.periodYear) {
      const year = parseInt(filters.periodYear, 10);
      result = result.filter((r) => r.periodYear === year);
    }

    // Search — across template name + period label
    const q = filters.search.trim().toLowerCase();
    if (q && templates) {
      result = result.filter((r) => {
        const label = getReportLabel(r, templates).toLowerCase();
        return label.includes(q);
      });
    }

    return result;
  }, [allReports, filters, visibilityScope, user, templates]);

  /* ── Pagination ─────────────────────────────────────────────────────────── */

  const total = filteredReports?.length ?? 0;
  const pagedReports = useMemo(() => {
    if (!filteredReports) return [];
    const start = (page - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, page]);

  /* ── Column config ──────────────────────────────────────────────────────── */

  const COLUMN_CONFIGS: ColumnConfig[] = [
    {
      key: "report",
      allowedRoles: ALL_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.report ?? "Report",
        key: "report",
        render: (_: unknown, r: Report) => (
          <div>
            <p className="text-sm font-medium text-ds-text-primary leading-snug">
              {getReportLabel(r, templates ?? [])}
            </p>
            <p className="text-xs text-ds-text-subtle mt-0.5">{formatReportPeriod(r)}</p>
          </div>
        ),
      },
    },
    {
      key: "campus",
      allowedRoles: MULTI_CAMPUS_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.campus ?? "Campus",
        key: "campus",
        render: (_: unknown, r: Report) => {
          const campus = (campuses ?? []).find((c) => c.id === r.campusId);
          return (
            <span className="text-sm text-ds-text-secondary">{campus?.name ?? r.campusId}</span>
          );
        },
      },
    },
    {
      key: "status",
      allowedRoles: ALL_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.status ?? "Status",
        key: "status",
        render: (_: unknown, r: Report) => <ReportStatusBadge status={r.status} />,
      },
    },
    {
      key: "deadline",
      allowedRoles: ALL_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.deadline ?? "Deadline",
        dataIndex: "deadline",
        key: "deadline",
        render: (v: string) => <span className="text-sm text-ds-text-secondary">{fmtDate(v)}</span>,
      },
    },
    {
      key: "actions",
      allowedRoles: ALL_ROLES,
      antColumn: {
        title: CONTENT.reports.columnLabels?.actions ?? "Actions",
        key: "actions",
        align: "right" as const,
        render: (_: unknown, r: Report) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(APP_ROUTES.reportDetail(r.id))}
            >
              {CONTENT.common.view}
            </Button>
            {can.fillReports &&
              (r.status === ReportStatus.DRAFT || r.status === ReportStatus.REQUIRES_EDITS) && (
                <Button
                  size="small"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => router.push(APP_ROUTES.reportEdit(r.id))}
                >
                  {CONTENT.common.edit}
                </Button>
              )}
            {can.lockReports && r.status === ReportStatus.APPROVED && (
              <Button
                size="small"
                danger
                icon={<LockOutlined />}
                onClick={() => router.push(APP_ROUTES.reportDetail(r.id))}
              >
                {CONTENT.reports.actions?.lock ?? "Lock"}
              </Button>
            )}
          </div>
        ),
      },
    },
  ];

  const visibleColumns = COLUMN_CONFIGS.filter(
    (col) => !role || col.allowedRoles.includes(role),
  ).map((col) => col.antColumn);

  /* ── Loading guard ──────────────────────────────────────────────────────── */

  if (!user || !role) return <LoadingSkeleton rows={3} />;

  /* ── Filter toolbar items ───────────────────────────────────────────────── */

  const filterItems = [
    {
      key: "status",
      label: CONTENT.reports.filterLabels?.status ?? "Status",
      node: (
        <Select
          value={filters.status || undefined}
          onChange={(v) => updateFilter({ status: v ?? "" })}
          placeholder={CONTENT.common.all}
          allowClear
          style={{ minWidth: 160 }}
          options={STATUS_OPTIONS}
          size="small"
        />
      ),
    },
    ...(showCampusColumn
      ? [
          {
            key: "campus",
            label: CONTENT.reports.filterLabels?.campus ?? "Campus",
            node: (
              <Select
                value={filters.campusId || undefined}
                onChange={(v) => updateFilter({ campusId: v ?? "" })}
                placeholder={CONTENT.common.all}
                allowClear
                style={{ minWidth: 160 }}
                options={(campuses ?? []).map((c) => ({ value: c.id, label: c.name }))}
                size="small"
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <PageLayout>
      <PageHeader
        title={CONTENT.reports.pageTitle as string}
        actions={
          <div className="flex gap-2">
            {can.fillReports && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push(APP_ROUTES.reportNew)}
              >
                {CONTENT.reports.newReport}
              </Button>
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={() => setExportOpen(true)}
              disabled={!filteredReports || filteredReports.length === 0}
            >
              {((CONTENT.reports as unknown as Record<string, Record<string, string>>).export?.button) ?? "Export"}
            </Button>
          </div>
        }
      />

      <FilterToolbar
        filters={filterItems}
        onReset={isFiltered ? resetFilters : undefined}
        extra={
          <SearchInput
            value={filters.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            placeholder={CONTENT.reports.searchPlaceholder}
            style={{ width: 220 }}
            size="small"
          />
        }
      />

      {filteredReports === undefined ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <>
          <Table<Report>
            dataSource={pagedReports}
            columns={visibleColumns}
            rowKey="id"
            loading={false}
            pagination={false}
            scroll={{ x: 700 }}
            emptyTitle={CONTENT.reports.emptyState.title}
            emptyDescription={CONTENT.reports.emptyState.description}
            onRow={(record) => ({
              onClick: () => router.push(APP_ROUTES.reportDetail(record.id)),
              style: { cursor: "pointer" },
            })}
          />
          {total > PAGE_SIZE && (
            <Pagination
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      )}

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        reports={filteredReports ?? []}
        templates={templates ?? []}
        campuses={campuses ?? []}
      />
    </PageLayout>
  );
}
````

## File: config/content.ts
````typescript
/**
 * config/content.ts
 * Every user-visible string lives here.
 * Components import CONTENT and reference by key — zero string literals in JSX.
 */

// AppContent is declared in types/global.d.ts inside `declare global` — no import needed.

export const CONTENT = {
    /* ── Navigation ──────────────────────────────────────────────────────── */
    nav: {
        dashboard: "Dashboard",
        reports: "Reports",
        templates: "Templates",
        analytics: "Analytics",
        users: "Users",
        org: "Organisation",
        inbox: "Inbox",
        invites: "Invite Links",
        settings: "Settings",
        goals: "Goals",
        bugReports: "Report a Bug",
        bugReportsManage: "Bug Reports",
        profile: "Profile",
        logout: "Logout",
        backToDashboard: "Back to Dashboard",
    },

    /* ── Auth ─────────────────────────────────────────────────────────────── */
    auth: {
        loginTitle: "Sign In",
        loginSubtitle: "Welcome back to the Harvesters Reporting System",
        emailLabel: "Email Address",
        emailPlaceholder: "you@harvesters.org",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        loginButton: "Sign In",
        loggingIn: "Signing in…",
        forgotPassword: "Forgot password?",
        noAccount: "Don't have an account?",
        registerLink: "Create an account",
        registerTitle: "Create Account",
        registerSubtitle: "Set up your Harvesters Reporting System account",
        firstNameLabel: "First Name",
        lastNameLabel: "Last Name",
        firstNamePlaceholder: "Your first name",
        lastNamePlaceholder: "Your last name",
        phoneLabel: "Phone Number",
        phonePlaceholder: "+234 800 000 0000",
        registerButton: "Create Account",
        alreadyHaveAccount: "Already have an account?",
        loginLink: "Sign in",
        forgotTitle: "Reset Password",
        forgotSubtitle: "Enter your email and we'll send reset instructions",
        sendResetLink: "Send Reset Link",
        resetTitle: "Set New Password",
        resetSubtitle: "Choose a strong new password",
        newPasswordLabel: "New Password",
        confirmPasswordLabel: "Confirm Password",
        resetButton: "Reset Password",
        joinTitle: "Join via Invite",
        joinSubtitle: "Complete your registration using an invite link",
        errors: {
            invalidCredentials: "Invalid email or password.",
            serverError: "Something went wrong. Please try again.",
            emailRequired: "Email is required.",
            emailInvalid: "Please enter a valid email address.",
            passwordRequired: "Password is required.",
            passwordsDoNotMatch: "Passwords do not match.",
            passwordTooShort: "Password must be at least 8 characters.",
            invalidToken: "This invite link is invalid or has expired.",
        },
        accountInfoLabel: "Account Information",
        passwordChangedSuccess: "Password changed successfully.",
        currentPasswordLabel: "Current Password",
        changePasswordAction: "Change Password",
        profileTabLabel: "Profile",
        passwordTabLabel: "Password",
        inviteInvalidTitle: "Invalid Invite Link",
        inviteExpiredTitle: "Invite Link Expired",
        inviteUsedTitle: "Invite Already Used",
        goToLogin: "Go to Login",
        registrationSuccessTitle: "Registration Successful",
        registrationSuccessMessage: "Your account has been created. You can now sign in.",
        redirectingIn: "Redirecting to login in",
        inviteRoleLabel: "You have been invited as",
        rememberMe: "Remember me",
        haveInvite: "Have an invite link?",
        joinWithInvite: "Join with invite",
        noInvite: "No invite link?",
        registerWithoutInvite: "Create a free account",
    },

    /* ── Reports ────────────────────────────────────────────────────────── */
    reports: {
        pageTitle: "Reports",
        newReport: "New Report",
        submitReport: "Submit Report",
        saveDraft: "Save Draft",
        requestEdit: "Request Edit",
        approveReport: "Approve",
        markReviewed: "Mark Reviewed",
        lockReport: "Lock Report",
        viewReport: "View Report",
        editReport: "Edit Report",
        viewHistory: "View History",
        requestUpdate: "Request Update",
        filterByStatus: "Filter by status",
        filterByCampus: "Filter by campus",
        filterByPeriod: "Filter by period",
        filterByTemplate: "Filter by template",
        searchPlaceholder: "Search reports…",
        periodLabel: "Period",
        statusLabel: "Status",
        campusLabel: "Campus",
        groupLabel: "Group",
        deadlineLabel: "Deadline",
        submittedByLabel: "Submitted By",
        submittedAtLabel: "Submitted At",
        reviewedByLabel: "Reviewed By",
        approvedByLabel: "Approved By",
        lockedAtLabel: "Locked At",
        notesLabel: "Notes",
        notesPlaceholder: "Add any notes or context…",
        dataEntryBadge: "Data Entry",
        fieldGoal: "Goal",
        fieldAchieved: "Achieved",
        fieldYoY: "YoY Goal",
        fieldGoalComment: "Add goal comment",
        fieldAchievedComment: "Add context",
        fieldYoYComment: "Add YoY comment",
        metricComment: "Add comment",
        commentPlaceholder: "Optional context or note…",
        goalPrefilledTooltip: "Pre-filled from set goals — not editable while filling a report",
        goalFromSource: "Goal source",
        goalNotSet: "No goal set",
        goalLocked: "Goal locked",
        goalsLoading: "Loading goals…",
        goalsPrefilledBadge: "goals pre-filled",
        noGoalsSet: "No goals set for this period — enter values manually",
        statVsGoal: "vs Goal",
        statVsYoY: "vs Last Year",
        requiredFilled: "required filled",
        liveStats: "Live Statistics",
        statOverallGoal: "Overall Goal Progress",
        statYoYGrowth: "Year-on-Year Growth",
        statMetricsWithGoal: "Metrics with Goals",
        metricsFormTitle: "Report Data",
        sectionRequired: "Required",
        sectionOptional: "Optional",
        emptyState: {
            title: "No Reports Found",
            description: "No reports match your current filters.",
            newReportCta: "Submit your first report",
        },
        deleteConfirm: "Are you sure you want to delete this report?",
        submitConfirm: "Submit this report for review?",
        approveConfirm: "Approve this report?",
        lockConfirm: "Lock this report? This cannot be undone.",
        editRequestTitle: "Request Edit",
        editRequestReasonLabel: "Reason for Edit",
        editRequestReasonPlaceholder: "Describe what needs to be corrected…",
        editRequestSubmit: "Submit Edit Request",
        updateRequestTitle: "Request Update",
        updateReasonLabel: "Reason for Update",
        updateReasonPlaceholder: "Explain why this update is needed…",
        updateRequestSubmit: "Submit Update Request",
        historyTitle: "Report History",
        auditTrailTitle: "Audit Trail",
        eventLabels: {
            CREATED: "Report Created",
            SUBMITTED: "Report Submitted",
            EDIT_REQUESTED: "Edits Requested",
            EDIT_SUBMITTED: "Edit Submitted",
            EDIT_APPROVED: "Edit Approved",
            EDIT_REJECTED: "Edit Rejected",
            EDIT_APPLIED: "Edit Applied",
            APPROVED: "Report Approved",
            REVIEWED: "Report Reviewed",
            LOCKED: "Report Locked",
            DEADLINE_PASSED: "Deadline Passed",
            UPDATE_REQUESTED: "Update Requested",
            UPDATE_APPROVED: "Update Approved",
            UPDATE_REJECTED: "Update Rejected",
            DATA_ENTRY_CREATED: "Data Entry Submitted",
            TEMPLATE_VERSION_NOTE: "Template Version Updated",
            AUTO_APPROVED: "Auto-Approved",
        },
        sections: {
            attendanceTitle: "Weekly Attendance",
            salvationsTitle: "Salvations & First Timers",
            discipleshipTitle: "Discipleship",
            tithesTitle: "Tithes & Offerings",
            workersTitle: "Workers",
            outreachTitle: "Outreach",
            youthTitle: "Youth",
            childrenTitle: "Children",
            mediaTitle: "Media & Digital",
            prayerTitle: "Prayer",
            infrastructureTitle: "Infrastructure & Facilities",
        },
        status: {
            DRAFT: "Draft",
            SUBMITTED: "Submitted",
            REQUIRES_EDITS: "Requires Edits",
            APPROVED: "Approved",
            REVIEWED: "Reviewed",
            LOCKED: "Locked",
        },
        actions: {
            submit: "Submit",
            approve: "Approve",
            review: "Mark Reviewed",
            lock: "Lock",
            requestEdit: "Request Edit",
        },
        columnLabels: {
            report: "Report",
            title: "Title",
            campus: "Campus",
            period: "Period",
            status: "Status",
            submittedBy: "Submitted By",
            submittedAt: "Submitted At",
            deadline: "Deadline",
            createdAt: "Created",
            lockedAt: "Locked At",
            actions: "",
        },
        filterLabels: {
            status: "Status",
            campus: "Campus",
            period: "Period",
            template: "Template",
            all: "All",
        },
        metadata: {
            title: "Details",
            templateLabel: "Template",
            periodTypeLabel: "Period Type",
            yearLabel: "Year",
            weekLabel: "Week",
            monthLabel: "Month",
            createdByLabel: "Created By",
            deadlineLabel: "Deadline",
            lockedAtLabel: "Locked At",
        },
        export: {
            button: "Export (.xlsx)",
            dialogTitle: "Export Reports",
            scopeLabel: "Export Scope",
            scopeAll: "All filtered reports",
            scopeSelected: "Selected reports only",
            groupingLabel: "Group by",
            groupingNone: "None",
            groupingCampus: "Campus",
            groupingMonth: "Month",
            groupingQuarter: "Quarter",
            contentLabel: "Include",
            contentMetrics: "Metric values",
            contentGoals: "Goal values",
            contentComments: "Comments",
            contentStatus: "Status history",
            formatLabel: "Format",
            formatSingleSheet: "Single sheet",
            formatMultiSheet: "One sheet per campus",
            exportButtonLabel: "Export",
            cancelButtonLabel: "Cancel",
            listFilename: "harvesters-reports",
            sheetList: "Reports",
            sheetMeta: "Overview",
            sheetMetrics: "Metrics",
            colTitle: "Title",
            colCampus: "Campus",
            colPeriod: "Period",
            colStatus: "Status",
            colTemplate: "Template",
            colDeadline: "Deadline",
            colCreatedAt: "Created",
            colSubmittedBy: "Submitted By",
            colNotes: "Notes",
            colSection: "Section",
            colMetric: "Metric",
            colAchieved: "Achieved",
            colGoal: "Goal",
            colPercentage: "% of Goal",
            colComment: "Comment",
        },
    },

    /* ── Templates ────────────────────────────────────────────────────────── */
    templates: {
        pageTitle: "Report Templates",
        newTemplate: "New Template",
        editTemplate: "Edit Template",
        previewTemplate: "Preview",
        publishTemplate: "Publish",
        archiveTemplate: "Archive",
        setDefault: "Set as Default",
        versionsLabel: "Version History",
        goalPromptTitle: "Set Goals for This Template?",
        goalPromptDescription: "This template captures goals for some metrics. Setting goals now lets fillers see progress against targets in the report form.",
        goalPromptConfirm: "Set Goals Now",
        goalPromptSkip: "Set Goals Later",
        templateSaved: "Template saved.",
        templateCreated: "Template created.",
        nameLabel: "Template Name",
        namePlaceholder: "e.g. Standard Campus Weekly Report",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Brief description of this template's purpose",
        addSection: "Add Section",
        addMetric: "Add Metric",
        removeSection: "Remove Section",
        sectionLabel: "Section",
        sectionsLabel: "Sections",
        sectionNameLabel: "Section Name",
        metricNameLabel: "Metric Name",
        fieldTypeLabel: "Field Type",
        calculationTypeLabel: "Calculation Method",
        isRequiredLabel: "Required",
        capturesGoalLabel: "Captures Goal",
        capturesAchievedLabel: "Captures Achieved",
        capturesYoYLabel: "Captures YoY Goal",
        defaultBadge: "Default",
        createTemplate: "Create Template",
        emptySections: "No sections yet. Click Add Section to start building this template.",
        emptyMetrics: "No metrics yet. Add a metric below.",
        emptyState: {
            title: "No Templates",
            description: "Create a report template to start collecting data.",
        },
    },

    /* ── Goals ─────────────────────────────────────────────────────────────── */
    goals: {
        pageTitle: "Goals",
        setGoal: "Set Goal",
        editGoal: "Edit Goal",
        requestUnlock: "Request Edit",
        approveUnlock: "Approve",
        rejectUnlock: "Reject",
        targetValueLabel: "Target Value",
        yearLabel: "Year",
        monthLabel: "Month",
        modeLabel: "Goal Mode",
        lockedBadge: "Locked",
        pendingUnlockBadge: "Unlock Pending",
        unlockReasonLabel: "Reason for Unlock",
        unlockReasonPlaceholder: "Explain why this goal needs to be changed\u2026",
        cancelEdit: "Cancel",
        modeAnnual: "Annual \u2014 same target each month",
        modeMonthly: "Monthly \u2014 set per month individually",
        campusLabel: "Campus",
        allCampuses: "All Campuses",
        annualTargetLabel: "Annual Target (applies to all 12 months)",
        saveGoals: "Save Goals",
        savedGoals: "Goals saved successfully.",
        templateLabel: "Template",
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        lockedNote: "Locked \u2014 submit an unlock request to change this goal",
        noTemplate: "No active template found. Create a template first.",
        saveAll: "Save All Goals",
        metricColumn: "Metric",
        annualTargetShort: "Target",
        bulkNote: "Set annual targets for all campuses in a single view.",
        noGoalSet: "—",
        emptyState: {
            title: "No Goals Set",
            description: "Goals help track expected performance against actuals.",
        },
    },

    /* ── Dashboard ────────────────────────────────────────────────────────── */
    dashboard: {
        pageTitle: "Dashboard",
        kpi: {
            totalReports: "Total Reports",
            pendingReview: "Pending Review",
            approvedReports: "Approved",
            complianceRate: "Compliance Rate",
            submittedOnTime: "On-Time Submissions",
            overdueReports: "Overdue",
            activeTemplates: "Active Templates",
            totalCampuses: "Total Campuses",
            totalUsers: "Total Users",
            drafts: "Drafts",
            requiresEdits: "Requires Edits",
            quarterlyCompliance: "Quarter Compliance",
        },
        welcomeBack: "Welcome back",
        recentActivity: "Recent Activity",
        noActivity: "No recent activity.",
        upcomingDeadlines: "Upcoming Deadlines",
        noDeadlines: "No upcoming deadlines.",
        cta: {
            pendingApproval: (n: number) => `${n} report${n === 1 ? "" : "s"} pending your approval`,
            pendingReview: (n: number) => `${n} approved report${n === 1 ? "" : "s"} awaiting your review sign-off`,
            draftReports: (n: number) => `You have ${n} draft report${n === 1 ? "" : "s"} in progress`,
            requiresEdits: (n: number) => `${n} of your report${n === 1 ? "" : "s"} require${n === 1 ? "s" : ""} edits`,
            weeklyReportDue: (period: string) => `You have a weekly report due for ${period}`,
            viewReports: "View Reports",
        },
        memberLobby: {
            title: "Welcome to Harvesters Reporting",
            subtitle: "Your account has been created successfully. An administrator will assign you a role to get started.",
            waitingLabel: "Awaiting role assignment",
            currentRole: "Current role",
            contactAdmin: "If you believe this is an error, please contact your campus administrator.",
        },
    },

    /* ── Users ───────────────────────────────────────────────────────────── */
    users: {
        pageTitle: "Users",
        inviteUser: "Invite User",
        editUser: "Edit User",
        deactivateUser: "Deactivate",
        activateUser: "Activate",
        resetPassword: "Reset Password",
        nameLabel: "Name",
        emailLabel: "Email",
        roleLabel: "Role",
        campusLabel: "Campus",
        groupLabel: "Group",
        statusLabel: "Status",
        activeStatus: "Active",
        inactiveStatus: "Inactive",
        searchPlaceholder: "Search users…",
        emptyState: {
            title: "No Users Found",
            description: "No users match your current filters.",
        },
        confirmDeactivate: "Deactivate this user? They will no longer be able to log in.",
        confirmActivate: "Reactivate this user?",
        roles: {
            SUPERADMIN: "Superadmin",
            SPO: "SPO",
            CEO: "CEO",
            OFFICE_OF_CEO: "Office of CEO",
            CHURCH_MINISTRY: "Church Ministry",
            GROUP_PASTOR: "Group Pastor",
            GROUP_ADMIN: "Group Admin",
            CAMPUS_PASTOR: "Campus Pastor",
            CAMPUS_ADMIN: "Campus Admin",
            DATA_ENTRY: "Data Entry",
            MEMBER: "Member",
        },
        recentReports: "Recent Reports",
        noReports: "No reports submitted yet.",
    },

    /* ── Organisation ────────────────────────────────────────────────────── */
    org: {
        pageTitle: "Organisation",
        newGroup: "New Group",
        newCampus: "New Campus",
        editGroup: "Edit Group",
        editCampus: "Edit Campus",
        groupNameLabel: "Group Name",
        campusNameLabel: "Campus Name",
        countryLabel: "Country",
        locationLabel: "Location",
        leaderLabel: "Group Leader",
        adminLabel: "Campus Admin",
        campusesLabel: "Campuses",
        membersLabel: "Members",
        emptyStateGroups: {
            title: "No Groups",
            description: "Add an org group to begin building the hierarchy.",
        },
        emptyStateCampuses: {
            title: "No Campuses",
            description: "Add campuses to organise your reporting structure.",
        },
    },

    /* ── Analytics ────────────────────────────────────────────────────────── */
    analytics: {
        pageTitle: "Analytics",
        // Tabs
        tab: {
            overview: "Overview",
            metrics: "Metrics Analysis",
            trends: "Trends",
            compliance: "Compliance",
            quarterly: "Quarterly Summary",
        },
        // Section headings
        complianceTitle: "Report Compliance by Campus",
        trendsTitle: "Submission Trends",
        campusBreakdownTitle: "Campus Breakdown",
        statusBreakdownTitle: "Status Breakdown",
        metricTrendsTitle: "Key Metrics Over Time",
        goalVsAchievedTitle: "Goal vs. Achieved",
        yoyComparisonTitle: "Year-on-Year Comparison",
        campusMetricCompTitle: "Campus Metric Comparison",
        cumulativeTrendTitle: "Cumulative Trend",
        // Controls
        periodSelectorLabel: "Period",
        periodGranularityLabel: "Granularity",
        campusSelectorLabel: "Campus",
        groupSelectorLabel: "Group",
        metricSelectorLabel: "Metric",
        sectionSelectorLabel: "Section",
        exportButton: "Export",
        yearLabel: "Year",
        monthRangeLabel: "Month Range",
        // Granularity options
        granularity: {
            weekly: "Weekly",
            monthly: "Monthly",
            quarterly: "Quarterly",
            annual: "Annual",
        },
        // Chart labels
        chartLabels: {
            goal: "Goal",
            achieved: "Achieved",
            yoy: "Year on Year",
            submitted: "Submitted",
            approved: "Approved",
            count: "Count",
            value: "Value",
            percentage: "% Achieved",
        },
        // KPI labels
        kpi: {
            avgAchievementRate: "Avg. Achievement Rate",
            metricsTracked: "Metrics Tracked",
            campusesReporting: "Campuses Reporting",
            goalsSet: "Goals Set",
        },
        // State
        noData: "No data available for the selected period.",
        noMetricSelected: "Select a metric above to view the analysis.",
        loadingMetrics: "Loading metrics…",
        drafts: "Drafts",
        requiresEdits: "Requires Edits",
        quarterlyTitle: "Quarterly Summary",
        quarterlyComplianceLabel: "Q Compliance",
        quarterlySubmittedLabel: "Q Submitted",
        quarterlyApprovedLabel: "Q Approved",
        quarterlyQoqLabel: "vs. Previous Quarter",
        quarterlyNoData: "No data available for this quarter.",
        quarterlyTopCampuses: "Top Campuses This Quarter",
        quarterlySelector: "Quarter",
    },

    /* ── Notifications ─────────────────────────────────────────────────── */
    notifications: {
        pageTitle: "Inbox",
        markAllRead: "Mark all as read",
        emptyState: {
            title: "All Caught Up",
            description: "You have no new notifications.",
        },
        types: {
            REPORT_SUBMITTED: "Report Submitted",
            REPORT_EDIT_REQUESTED: "Edit Requested",
            REPORT_APPROVED: "Report Approved",
            REPORT_REVIEWED: "Report Reviewed",
            REPORT_LOCKED: "Report Locked",
            REPORT_EDIT_SUBMITTED: "Edit Submitted",
            REPORT_EDIT_APPROVED: "Edit Approved",
            REPORT_EDIT_REJECTED: "Edit Rejected",
            REPORT_UPDATE_REQUESTED: "Update Requested",
            REPORT_UPDATE_APPROVED: "Update Approved",
            REPORT_UPDATE_REJECTED: "Update Rejected",
            REPORT_DEADLINE_REMINDER: "Deadline Reminder",
            GOAL_UNLOCK_REQUESTED: "Goal Unlock Requested",
            GOAL_UNLOCK_APPROVED: "Goal Unlock Approved",
            GOAL_UNLOCK_REJECTED: "Goal Unlock Rejected",
        },
    },

    /* ── Common / Shared ────────────────────────────────────────────────── */
    common: {
        save: "Save",
        saving: "Saving…",
        cancel: "Cancel",
        confirm: "Confirm",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        close: "Close",
        back: "Back",
        next: "Next",
        previous: "Previous",
        search: "Search",
        filter: "Filter",
        reset: "Reset",
        export: "Export",
        loading: "Loading…",
        submitting: "Submitting…",
        required: "Required",
        optional: "Optional",
        yes: "Yes",
        no: "No",
        all: "All",
        none: "None",
        unknown: "Unknown",
        activate: "Activate",
        deactivate: "Deactivate",
        noResultsTitle: "Nothing here yet",
        noResultsDescription: "Try adjusting your filters.",
        viewAll: "View all",
        successSave: "Saved successfully.",
        successDelete: "Deleted successfully.",
        errorDefault: "Something went wrong. Please try again.",
        errorNotFound: "The requested resource was not found.",
        errorUnauthorized: "You are not authorised to perform this action.",
        pagination: {
            showing: "Showing",
            to: "to",
            of: "of",
            results: "results",
        },
        darkMode: "dark mode",
        lightMode: "light mode",
        switchTo: "Switch to",
    },

    /* ── Profile ───────────────────────────────────────────────────────────── */
    profile: {
        pageTitle: "My Profile",
        editProfile: "Edit Profile",
        changePassword: "Change Password",
        accountInfoLabel: "Account Information",
        personalInfoLabel: "Personal Information",
        firstNameLabel: "First Name",
        lastNameLabel: "Last Name",
        emailLabel: "Email Address",
        phoneLabel: "Phone Number",
        roleLabel: "Role",
        campusLabel: "Campus",
        groupLabel: "Group",
        saveChanges: "Save Changes",
        saving: "Saving…",
        passwordSection: "Change Password",
        currentPasswordLabel: "Current Password",
        newPasswordLabel: "New Password",
        confirmPasswordLabel: "Confirm New Password",
        updatePassword: "Update Password",
        passwordUpdated: "Password updated successfully.",
        profileUpdated: "Profile updated successfully.",
        memberSince: "Member Since",
        lastUpdated: "Last Updated",
        tabs: {
            profile: "Profile",
            security: "Security",
            appearance: "Appearance",
            notifications: "Notifications",
        },
    },

    /* ── Invite Links ─────────────────────────────────────────────────────── */
    invites: {
        pageTitle: "Invite Links",
        newInvite: "Generate Invite Link",
        copyLink: "Copy Link",
        copiedLink: "Copied!",
        revokeLink: "Revoke",
        targetRoleLabel: "Invite As",
        campusLabel: "Campus (optional)",
        groupLabel: "Group (optional)",
        expiresInLabel: "Expires In",
        noteLabel: "Internal Note",
        notePlaceholder: "e.g. For new Lagos campus admin",
        statusActive: "Active",
        statusUsed: "Used",
        statusExpired: "Expired",
        statusRevoked: "Revoked",
        expiresAtLabel: "Expires",
        usedAtLabel: "Used At",
        createdAtLabel: "Created",
        linkLabel: "Invite URL",
        generateButton: "Generate",
        emptyState: {
            title: "No Invite Links",
            description: "Generate a link to invite a new user to the system.",
        },
        expiryOptions: {
            "24": "24 hours",
            "48": "48 hours",
            "72": "72 hours (default)",
            "168": "7 days",
            "720": "30 days",
        },
        deleteConfirm: "Revoke this invite link? The URL will no longer work.",
    },
    /* ── Bug Reports ────────────────────────────────────────────────────── */
    bugReports: {
        pageTitle: "Report a Bug",
        managePageTitle: "Bug Reports",
        categoryLabel: "Issue Type",
        categoryPlaceholder: "Select an issue type",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Describe the issue you encountered in detail...",
        screenshotLabel: "Screenshot (optional)",
        screenshotHint: "Upload a screenshot to help us understand the issue.",
        emailLabel: "Contact Email",
        emailPlaceholder: "your.email@example.com",
        submitButton: "Submit Bug Report",
        submitting: "Submitting...",
        submitSuccess: "Bug report submitted. Thank you!",
        statusLabel: "Status",
        adminNotesLabel: "Admin Notes",
        adminNotesPlaceholder: "Internal notes about this bug report...",
        categories: {
            UI_DISPLAY: "UI / Display Issue",
            NAVIGATION: "Navigation Problem",
            DATA_ISSUE: "Data Inaccuracy",
            PERFORMANCE: "Slow Performance",
            AUTHENTICATION: "Login / Authentication",
            REPORT_SUBMISSION: "Report Submission",
            NOTIFICATION: "Notification Issue",
            OTHER: "Other",
        },
        statuses: {
            OPEN: "Open",
            IN_PROGRESS: "In Progress",
            RESOLVED: "Resolved",
            CLOSED: "Closed",
        },
        emptyState: {
            title: "No Bug Reports",
            description: "No bug reports have been submitted yet.",
        },
        updateSuccess: "Bug report updated.",
    },
    /* ── Settings ───────────────────────────────────────────────────────── */
    settings: {
        pageTitle: "App Settings",
        appearanceSection: "Appearance",
        themeLabel: "Theme",
        themeDescription: "Choose how the app looks to you.",
        themeSystem: "System default",
        themeLight: "Light",
        themeDark: "Dark",
        notificationsSection: "Notification Preferences",
        emailNotificationsLabel: "Email Notifications",
        emailNotificationsDescription: "Receive report deadline and status updates via email.",
        inAppNotificationsLabel: "In-App Notifications",
        inAppNotificationsDescription: "Show notification badge and pop-ups in the app.",
        deadlineRemindersLabel: "Deadline Reminders",
        deadlineRemindersDescription: "Get reminders 24 h and 48 h before report deadlines.",
        pushNotificationsSection: "Push Notifications",
        pushNotificationsLabel: "Push Notifications",
        pushNotificationsDescription: "Receive real-time push notifications on this device.",
        pushEnabled: "Push notifications enabled.",
        pushDisabled: "Push notifications disabled.",
        pushNotSupported: "Push notifications are not supported in this browser.",
        pushPermissionDenied: "Permission denied. Enable notifications in your browser settings.",
        enablePush: "Enable Push",
        disablePush: "Disable Push",
        saved: "Preferences saved.",
        savePreferences: "Save Preferences",
    },
    /* ── Offline Page ────────────────────────────────────────────────────────── */
    offline: {
        title: "You're Offline",
        description: "It looks like you've lost your internet connection. Check your connection and try again.",
        retryButton: "Try Again",
        hint: "Previously viewed pages may still be accessible from cache.",
    },

    /* ── Error Pages ─────────────────────────────────────────────────────── */
    errors: {
        generic: "Something went wrong. Please try again.",
        notFoundTitle: "Page Not Found",
        notFoundDescription: "The page you are looking for does not exist.",
        notFoundCta: "Go to Dashboard",
        errorTitle: "Something Went Wrong",
        errorDescription: "An unexpected error occurred. Our team has been notified.",
        errorCta: "Try Again",
        offlineTitle: "You're Offline",
        offlineDescription: "Check your internet connection and try again.",
        onlineTitle: "You're Back Online",
        onlineDescription: "Connection restored.",
    },

    /* ── SEO / Meta ──────────────────────────────────────────────────────────── */
    seo: {
        appDescription: "The central report management platform for Harvesters International Christian Centre — campus report submission, review, and analytics.",
        // Auth pages
        loginDescription: "Sign in to the Harvesters Reporting System to access your campus reports and analytics.",
        registerDescription: "Create your Harvesters Reporting System account to start managing campus reports.",
        forgotPasswordDescription: "Reset your Harvesters Reporting System password.",
        resetPasswordDescription: "Set a new password for your Harvesters Reporting System account.",
        joinTitle: "You're Invited",
        joinDescription: "You have been invited to join the Harvesters Reporting System — the central platform for campus report submission and analytics at Harvesters International Christian Centre.",
        // Dashboard pages
        dashboardDescription: "View your reporting dashboard — KPIs, recent activity, and upcoming deadlines.",
        reportsDescription: "Manage, submit, and review campus reports across Harvesters campuses.",
        newReportDescription: "Create and submit a new campus report.",
        reportDetailDescription: "View the full details and history of this campus report.",
        reportEditDescription: "Edit and update this campus report.",
        templatesDescription: "Manage report templates used across campuses for standardised data collection.",
        newTemplateDescription: "Create a new report template to standardise campus reporting.",
        templateDetailDescription: "View and manage this report template.",
        usersDescription: "Manage system users — roles, campus assignments, and access levels.",
        userDetailDescription: "View and manage this user's profile and role assignment.",
        orgDescription: "Manage the organisation hierarchy — groups, campuses, and zones.",
        analyticsDescription: "Analyse report data, trends, and compliance metrics across all campuses.",
        inboxDescription: "Stay up to date with report approvals, edit requests, and system notifications.",
        goalsDescription: "Set and track performance goals to measure campus progress against targets.",
        invitesDescription: "Generate and manage invite links to onboard new users to the system.",
        bugReportsDescription: "Report a bug or issue you encountered in the Harvesters Reporting System.",
        bugReportsManageDescription: "Review and manage all bug reports submitted by system users.",
        profileDescription: "Manage your profile, security settings, and notification preferences.",
    },
} satisfies AppContent;

export type ContentKey = typeof CONTENT;
````

## File: package.json
````json
{
  "name": "harvesters-reporting-system",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "dev:webpack": "next dev --turbopack=false",
    "build": "next build",
    "postbuild": "npm run db:seed:base",
    "start": "next start",
    "lint": "eslint",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:base": "tsx prisma/seed.ts --base",
    "db:seed:reset": "tsx prisma/seed.ts --base --reset",
    "db:seed:full:reset": "tsx prisma/seed.ts --reset",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "postinstall": "prisma generate & tsx prisma/seed.ts --reset & tsx prisma/seed.ts"
  },
  "dependencies": {
    "@ant-design/cssinjs": "^2.0.2",
    "@ant-design/icons": "^6.1.0",
    "@prisma/client": "^7.4.2",
    "@upstash/ratelimit": "^2.0.8",
    "@upstash/redis": "^1.36.3",
    "antd": "^6.1.4",
    "autoprefixer": "^10.4.23",
    "bcryptjs": "^3.0.3",
    "cookie": "^1.1.1",
    "date-fns": "^4.1.0",
    "dayjs": "^1.11.19",
    "idb-keyval": "^6.2.2",
    "jose": "^6.1.3",
    "jsonwebtoken": "^9.0.3",
    "next": "^16.1.6",
    "next-themes": "^0.4.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "recharts": "^3.7.0",
    "resend": "^6.9.3",
    "xlsx": "^0.18.5",
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie": "^0.6.0",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^17.3.1",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "eslint-config-prettier": "^10.1.8",
    "prettier": "^3.7.4",
    "prisma": "^7.4.2",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}
````
