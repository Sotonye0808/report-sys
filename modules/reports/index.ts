/**
 * modules/reports/index.ts
 * Public barrel — export components and services only.
 * Domain types live exclusively in types/global.d.ts.
 */
export { ReportDetailPage } from "./components/ReportDetailPage";
export { ReportsListPage }  from "./components/ReportsListPage";
export { ReportNewPage }    from "./components/ReportNewPage";
export { ReportEditPage }   from "./components/ReportEditPage";
export { ReportSectionsForm, buildSectionsPayload, parseSectionsToMetricValues } from "./components/ReportSectionsForm";
