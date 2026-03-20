# lib/

## Purpose

Shared libraries and utilities used across the application. This is the common code layer that keeps feature modules small and focused.

## Key Areas

- `lib/data/` — Data access adapters:
  - `prisma.ts` (PostgreSQL via Prisma)
  - `redis.ts` (Upstash Redis client)
  - `db.ts` (runtime selector between mock DB and real DB)
- `lib/hooks/` — React hooks for auth (`useRole`), data fetching (`useApiData`), offline sync, and service worker integration.
- `lib/utils/` — Pure utility functions: API wrapper, auth helpers, export/report generation, date formatting, offline caching, notifications.
- `lib/email/` — Email sending helper (`resend` provider) used for transactional emails.
- `lib/design-system/` — Token helpers and theme mapping for Ant Design.

## Notes

- The `lib/data` layer is the only place that should directly import `@prisma/client`.
- Hooks in `lib/hooks` are lightweight and avoid heavy dependencies to stay reusable across modules.
