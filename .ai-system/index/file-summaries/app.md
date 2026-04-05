# app/

## Purpose

Hosts all Next.js App Router entrypoints: pages/layouts for auth and dashboard experiences, plus server API route handlers under `app/api/*`.

## Key Areas

- `(auth)/` - Public auth flows (`login`, `register`, `forgot-password`, `reset-password`, `join`).
- `(dashboard)/` - Authenticated application routes (`reports`, `analytics`, `goals`, `users`, `org`, `templates`, `inbox`, `settings`, `bug-reports`).
- `api/` - Route handlers for auth, reports/workflow, report aggregation, goals, org hierarchy, notifications, invite links, assets lifecycle, and bug reports.
- `offline/` - Offline fallback route for service worker-aware navigation failures.

## Notes

- `app/layout.tsx` composes global providers (`ThemeProvider`, `AntdProvider`, `AuthProvider`).
- Route access is enforced by role checks in route handlers and dashboard route/page guards.
- Aggregation entrypoints are `app/(dashboard)/reports/aggregate/page.tsx` and `app/api/reports/aggregate/route.ts`.
