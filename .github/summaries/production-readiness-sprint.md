# Production-Readiness Sprint — March 2026

## Group A — Bug Fixes (Critical)

- [x] A1: Dashboard template count — use `isActive` instead of `isDefault`
- [x] A2: Invite link `DELETE` handler (405 fix)
- [x] A3: OFFICE_OF_CEO templates access
- [x] A4: Offline auth — don't clear user on network failure

## Group B — Role & Access Audit

- [x] B1: Nav-to-page role consistency pass (all pages)

## Group C — Offline / PWA

- [x] C1: SW serves cached pages before `/offline` fallback
- [x] C2: SW error isolation (try/catch + global handlers)
- [x] C3: "Remember me" persistence in sign-in form

## Group D — Performance

- [x] D1: loading.tsx skeletons, Link prefetch, SW stale-while-revalidate

## Group E — UI/UX Fixes

- [x] E1: Goals monthly grid horizontal scroll
- [x] E2: Table row click navigation
- [x] E3: Registration redirect / stuck loading
- [x] E4: Expired invite link dedicated states
- [x] E5: Tooltip text color (light mode)
- [x] E6: System theme dark mode consistency

## Group F — Invite Link Enhancements

- [x] F1: Campus + group assignment fields in create form

## Group G — Quarterly Summaries (New Feature)

- [x] G1: Types & config (QuarterlySummary, routes, content)
- [x] G2: API route `GET /api/analytics/quarterly`
- [x] G3: Analytics "Quarterly" tab panel
- [x] G4: Dashboard KPI card for current quarter

## Group H — Export Dialog Enhancement

- [x] H1: ExportDialog component with options
- [x] H2: Extended export functions (multi-sheet, metrics)
- [x] H3: ExportDialog wired into ReportsListPage

---

## Logo Update

- [x] Replaced "H" lettermarks in join/register pages with Harvesters brand logo
- [x] Verified layout.tsx metadata, manifest.ts, sw.js push icons, dashboard sidebar, login page — all correct
