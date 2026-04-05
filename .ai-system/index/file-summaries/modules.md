# modules/

## Purpose

Domain-oriented feature boundaries for UI, route-facing service orchestration, and business workflows.

## Key Modules

- `modules/auth` - Auth-facing pages/components and settings screens.
- `modules/reports` - Report create/edit/detail/analytics/aggregation pages, workflow services, and template-history helpers.
- `modules/analytics` - Dashboard metrics, chart rendering, and chart utility helpers.
- `modules/goals` - Goal matrix UX, editing flows, and unlock/edit request experiences.
- `modules/users` - User profile management, invite workflows, and user admin surfaces.
- `modules/org` - Organization hierarchy/group/campus management and write services.
- `modules/notifications` - Inbox and notification-state UX.
- `modules/templates` - Template management pages and supporting UI.

## Notes

- Keep module logic domain-focused; shared primitives belong in `components/ui` and `lib/*`.
- `modules/reports/services/reportWorkflow.ts` is the primary workflow boundary for report status transitions and audit/event behavior.
- Aggregation UI exists in `modules/reports/components/ReportAggregationPage.tsx` and remains an active enhancement area (stepper/metric-selection polish).
