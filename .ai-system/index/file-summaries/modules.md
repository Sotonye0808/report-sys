# modules/

## Purpose

Feature-centric modules that encapsulate UI components, hooks, and domain logic for each business capability (reports, analytics, users, org, goals, notifications, etc.).

## Key Modules

- `modules/auth` — Authentication utilities and auth-aware components used in the `app/(auth)` routes.
- `modules/reports` — Core report forms, report detail views, and workflow components for creating/submitting/reviewing reports.
- `modules/templates` — Template management UI and pages for creating/editing report templates.
- `modules/analytics` — Dashboards and charts for compliance, submission trends, and KPI tracking.
- `modules/users` / `modules/org` — Superadmin user and organization management interfaces.

## Notes

- Each module exposes a small public surface via `modules/<module>/index.ts` for easy imports.
- Modules depend on shared utilities in `lib/` and configuration in `config/`.
- UI components for modules are often built on shared primitives in `components/ui/`.
