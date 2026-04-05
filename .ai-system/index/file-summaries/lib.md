# lib/

## Purpose

Shared platform layer for data access, server utilities, hooks, email/asset infrastructure, and cross-cutting helpers used by feature modules and route handlers.

## Key Areas

- `lib/data/` - Prisma + Redis access (`db.ts`, `prisma.ts`, `redis.ts`) and aggregation helpers (`reportAggregation.ts`, `orgHierarchy.ts`).
- `lib/assets/` - Managed Cloudinary lifecycle adapters/services and lifecycle state machine.
- `lib/server/` - Request context utilities (correlation IDs and request metadata).
- `lib/hooks/` - Shared React hooks (`useApiData`, offline sync, draft cache helpers, role/auth helpers).
- `lib/utils/` - API response helpers, client mutation lifecycle, auth utilities, server logging, offline queue/cache, export/report helpers, notifications.
- `lib/email/` - Resend integration and template registry/layout.
- `lib/design-system/` - Ant Design token and theme mapping.

## Notes

- `lib/data/*` owns database boundary concerns; avoid direct Prisma client usage from UI modules.
- New write paths should use shared API envelope helpers and request-context logging utilities.
- Asset lifecycle operations should route through `lib/assets/lifecycleService.ts` to preserve transactional state and cleanup semantics.
