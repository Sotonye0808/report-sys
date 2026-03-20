# prisma/

## Purpose

Defines the database schema, migrations, and seed data for the application.

## Key Files

- `prisma/schema.prisma` — Database schema for users, reports, templates, goals, notifications, and related entities.
- `prisma/migrations/` — Generated migration history.
- `prisma/seed.ts` — Seed script that populates the database (or mock DB in dev) with fixture data for users, orgs, templates, reports, and more.
- `prisma/config.ts` — Prisma configuration for runtime environment.

## Notes

- The system supports both mock DB (for local development) and real PostgreSQL via Prisma.
- Seed script is guarded to prevent duplicate seeding on hot reloads.
