# config/

## Purpose

Centralized business configuration for routes, navigation, roles/permissions, hierarchy behavior, report lifecycle defaults, and user-facing copy.

## Key Files

- `config/routes.ts` - Canonical app and API route constants (including report aggregation and assets lifecycle API paths).
- `config/nav.ts` - Dashboard navigation model filtered by role.
- `config/roles.ts` - Capability matrix and role-scoped behavior controls.
- `config/reports.ts` - Report workflow and deadline/reminder configuration.
- `config/content.ts` - Feature copy, labels, notifications text, and UI strings.
- `config/hierarchy.ts` - Organization structure constants and helpers.

## Notes

- Keep these files framework-agnostic (no React/component imports).
- Prefer config-driven UI/API labels and messages to avoid hardcoded copy in features.
- Route additions should update both `config/routes.ts` and any affected nav/breadcrumb consumers.
