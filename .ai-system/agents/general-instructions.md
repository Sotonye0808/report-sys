# AI Development Protocol — General Instructions

> **IMPORTANT:** This file is the canonical AI instruction set for the Harvesters Reporting System. All AI agents, Copilot, and automation tools must reference `.ai-system/` as the single source of truth. Any .github AI/dev artifacts are pointers only.

> **Overview:** This is the master instruction file for all AI agents working on this project. Every agent session should begin by reading this file. It defines how agents think, what they reference, and how they behave during development.

---

## Documents to Reference

Always consult the following files before taking action, in this order (all in `.ai-system/`):

1. `planning/task-queue.md` — what needs to be done next
2. `planning/project-plan.md` — overall project goals and progress
3. `agents/system-architecture.md` — how the system is structured
4. `agents/design-system.md` — UI/UX rules and component patterns
5. `agents/project-context.md` — project background and constraints
6. `agents/repair-system.md` — known errors and how to avoid/fix them
7. `memory/project-decisions.md` — past architectural decisions and their reasoning

---

## Core Principles (Harvesters Reporting System)

- **Modular domain architecture** — each business domain in `modules/<domain>/` with strict boundaries
- **Config-driven UI** — all user-visible strings and repeated UI are config-driven, never hardcoded
- **Strict TypeScript** — no `any`, all domain types in `types/global.d.ts`, Zod at every API boundary
- **Role-aware rendering** — one route per feature, role-based rendering at component/config level
- **Design tokens only** — all UI uses `--ds-*` tokens from `app/globals.css`, never raw Tailwind colors
- **No relic features** — see `.ai-system/agents/project-context.md` for out-of-scope features

---

## Execution Protocol

### Before implementing any feature:

1. Read `planning/task-queue.md` and identify the first incomplete task
2. Confirm the task aligns with `agents/system-architecture.md` and `.github/copilot-instructions.md` (for legacy context)
3. Check `agents/repair-system.md` for relevant known issues
4. If architecture changes are needed, update `agents/system-architecture.md` first

### After completing any task:

1. Mark the task done [x] in `planning/task-queue.md`
2. Update `checkpoints/session-log.md`
3. Add a summary to `summaries/dev-history.md`
4. If architecture changed, update `agents/system-architecture.md`
5. If errors were encountered and fixed, log them in `agents/repair-system.md`
6. If a significant decision was made, record it in `memory/project-decisions.md`

---

## Agent Roles

| Agent     | Tool     | Responsibility                                         |
| --------- | -------- | ------------------------------------------------------ |
| Planner   | Continue | Analyze tasks, determine next steps, update task queue |
| Architect | Continue | Design or update system architecture                   |
| Coder     | Cline    | Implement code changes across multiple files           |
| Reviewer  | Continue | Review code quality and architecture consistency       |
| Tester    | Cline    | Run tests, identify failures, trigger self-heal loop   |
| Historian | Continue | Update summaries, dev-history, and memory files        |

---

## Tone and Output Format

- Explain reasoning briefly before acting
- When proposing architecture changes, describe the change before implementing
- When encountering ambiguity, ask one clarifying question rather than guessing
- Keep file edits focused — do not touch modules unrelated to the current task
