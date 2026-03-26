# Aggregated Report + Charted Export Feature Plan

## Purpose

Implement a safe, hierarchical roll-up report generator for weekly/monthly/quarterly/yearly horizons, plus integrated analytics export with chart data (spreadsheet charts + data tables).

## Summary

- Add a centralized reporting aggregation flow in `modules/reports`.
- Role-based scope:
  - `CAMPUS_ADMIN` / `CAMPUS_PASTOR`: only own campus.
  - `GROUP_ADMIN` / `GROUP_PASTOR`: own group + campuses in that group.
  - `CEO` / `SPO` / `SUPERADMIN` / `OFFICE_OF_CEO`: cross-group and system-wide.
- Supports template compatibility checks by version and minimal schema drift.
- Supports metric include/exclude in aggregation window.
- Chart export includes all visible trend/stack/pie series as extra sheets in XLSX.

## Architecture Impact

- `modules/reports` (new `ReportAggregationPage`, interactive wizard)
- `modules/org` and `lib/data/orgHierarchy` (scope resolution)
- `app/api/reports/aggregate` routes + zod validation
- `lib/data/reportAggregation` service and calculations
- `modules/analytics/components/AnalyticsPage` (export extension)
- config/routes, config/content, and global types.

## Data Flow

1. User selects a timeframe and scope in aggregation wizard.
2. wizard POST `/api/reports/aggregate/preview` -> calculates source reports and aggregated metric rollout.
3. user confirms -> PATCH/POST `/api/reports/aggregate` writes new aggregated report and event.
4. UI shows generated report + chart preview and provides export button.
5. Export writes XLSX with raw report table + chart-data sheets.

## UI/UX

- Stepper: scope -> period -> template check -> metric selection -> review -> generate
- Inline warnings and validation messages for incompatible reports.
- Processing and retry states with `LoadingSkeleton` and immediate user feedback.
- Audit in UI: source count, template versions, missing/extra metric columns.
- Export button with note: "Includes analytics chart data (trend/pie) in spreadsheet".

## Risks / Edge cases

- diverging templates across selected reports.
- partial campus data and missing metrics.
- timeline period boundaries and timezone.
- user permissions to only allowed scope.
- duplicate aggregate generation for same period and scope.

## Next steps

- Validate design with project stakeholders.
- Develop API + service layer first.
- Connect UI + test coverage.
- Add storybook docs and scenario tests.
