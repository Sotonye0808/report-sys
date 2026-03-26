# Org Hierarchy Feature Plan

## Purpose

Implement a modular organization structure editor (groups + campuses) with a clear overview and a flexible, future-ready architecture for multiple levels.

## Summary

- Add `OrgHierarchyPage` with group/campus tree view.
- Add modal CRUD for group/campus definitions.
- Add API routes for org hierarchy (GET, POST, PATCH, DELETE).
- Add draft persistence on modal to prevent data loss.
- Ensure reports/goals refer to current org selection.

## Architecture Impact

- `modules/org/`
- `app/api/org/*`
- `lib/data/orgHierarchy.ts`
- `lib/hooks/useOrgHierarchy.ts`
- `modules/reports/*`, `modules/goals/*`
- `components/ui/*` for shared tree list and modal.

## Data Flow

1. page requests `GET /api/org/hierarchy`
2. backend returns normalized tree from Prisma tables
3. UI renders expand/collapse group + campuses
4. edit modal uses same API and local `useFormPersistence`
5. save path uses transaction updates and returns tree
6. dependent module selection (reports/goals) refreshes org info

## UI/UX

- Hierarchy cards in a list, with dynamic expansion for campuses.
- `Define / Edit Org` button opens modal (prevent full page route navigation).
- Editing uses forms with inline validation and save/cancel.
- Clear draft button on modal for local work in progress.

## Risk / Edge cases

- Concurrent admin edits (version lock / conflict handling)
- Large org trees (virtualized lists)
- Circular parent references
- Delete with existing reports/goals using this campus/group

## Task list

- Create/extend Prisma schema for groups/campuses
- Add API routes and validation
- Add data access layer in `lib/data`
- Add `modules/org` UI + hooks
- Integrate with reports/goals context
- Add tests (unit+/integration)

## Next steps

- Add doc in system architecture + task queue
- Validate with `npx tsc --noEmit` and `npm run build`
- Implement API endpoint `/api/org/hierarchy` with role-scoped payload and caching (done)
- Add `lib/data/orgHierarchy.ts` for centralized hierarchy and scope control (done)
- Add OrgPage hierarchy tab UI that consumes `/api/org/hierarchy` with loading/error states (done)
