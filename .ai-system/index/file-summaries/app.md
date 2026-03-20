# app/

## Purpose

Contains the Next.js App Router application code: layouts, pages, API routes, and route groups. This is the entrypoint for both the client and server in the application.

## Key Areas

- `(auth)/` - Authentication pages (login, register, forgot/reset password, join) used when the user is not authenticated.
- `(dashboard)/` - Authenticated user area containing dashboard, reports, analytics, users, org, templates, etc.
- `api/` - Server route handlers (REST-style APIs) used by the frontend for data operations.
- `offline/` - Offline fallback page that shows when the service worker detects no connectivity.

## Notes

- Uses Next.js App Router conventions (React Server Components by default).
- `app/layout.tsx` wraps the application with providers (Theme, Ant Design, Auth).
- Routing is primarily driven through `config/routes.ts` and `config/roles.ts` (role-based navigation and access).
