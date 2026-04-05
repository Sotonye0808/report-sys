# prisma/

## Purpose

Source of truth for relational data shape, migrations, generated Prisma client, and development seed data.

## Key Files

- `prisma/schema.prisma` - Full schema (users, org hierarchy, reports/workflow events, templates, goals, notifications, and managed asset lifecycle models).
- `prisma/migrations/` - Migration history applied to development/production databases.
- `prisma/generated/` - Generated Prisma client consumed by `lib/data/*`.
- `prisma/seed.ts` - Seed orchestration for users, org hierarchy, templates, reports, events, goals, and notifications.
- `prisma/config.ts` - Prisma runtime config.

## Notes

- Runtime data access uses Prisma via `lib/data/prisma.ts` and `lib/data/db.ts`.
- Managed screenshot lifecycle introduces `MediaAsset`, `AssetUploadSession`, and `AssetLifecycleEvent`; schema/migration drift here affects bug-report upload flows.
