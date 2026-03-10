/**
 * config/reports.ts
 *
 * Report status transitions, deadline config, and the three default templates:
 *   1. DEFAULT_REPORT_TEMPLATE       — Full standard monthly report (all 12 strategic indicators)
 *   2. WEEKLY_REPORT_TEMPLATE        — Strictly-weekly metrics only (5 sections)
 *   3. MONTHLY_ONLY_REPORT_TEMPLATE  — Strictly-monthly metrics only (7 sections)
 *
 * Nomenclature is aligned exactly to the client's 2026 Reporting Template spreadsheet.
 * CalculationType per section follows:
 *   Monthly Report: Average of 4/5 weeks  → AVERAGE
 *   Monthly Report: Summation             → SUM
 *   Monthly Report: Cumulation (last val) → SNAPSHOT
 */

import { MetricCalculationType, MetricFieldType, ReportStatus, UserRole } from "@/types/global";

/* ── Status Transition Map ─────────────────────────────────────────────────── */

export const REPORT_STATUS_TRANSITIONS: Record<
    ReportStatus,
    { to: ReportStatus; requiredRole: UserRole[] }[]
> = {
    [ReportStatus.DRAFT]: [
        {
            to: ReportStatus.SUBMITTED,
            requiredRole: [UserRole.CAMPUS_ADMIN, UserRole.CAMPUS_PASTOR, UserRole.DATA_ENTRY, UserRole.GROUP_ADMIN],
        },
    ],
    [ReportStatus.SUBMITTED]: [
        {
            to: ReportStatus.REQUIRES_EDITS,
            requiredRole: [UserRole.CAMPUS_PASTOR, UserRole.GROUP_ADMIN, UserRole.GROUP_PASTOR, UserRole.CHURCH_MINISTRY, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.SPO, UserRole.SUPERADMIN],
        },
        {
            to: ReportStatus.APPROVED,
            requiredRole: [UserRole.CAMPUS_PASTOR, UserRole.GROUP_ADMIN, UserRole.CHURCH_MINISTRY, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.SPO, UserRole.SUPERADMIN],
        },
    ],
    [ReportStatus.REQUIRES_EDITS]: [
        {
            to: ReportStatus.SUBMITTED,
            requiredRole: [UserRole.CAMPUS_ADMIN, UserRole.CAMPUS_PASTOR, UserRole.DATA_ENTRY, UserRole.GROUP_ADMIN],
        },
    ],
    [ReportStatus.APPROVED]: [
        {
            to: ReportStatus.REVIEWED,
            requiredRole: [UserRole.GROUP_PASTOR, UserRole.CEO, UserRole.OFFICE_OF_CEO, UserRole.SPO, UserRole.SUPERADMIN],
        },
    ],
    [ReportStatus.REVIEWED]: [
        {
            to: ReportStatus.LOCKED,
            requiredRole: [UserRole.SUPERADMIN],
        },
    ],
    [ReportStatus.LOCKED]: [],
};

/* ── Deadline Config ──────────────────────────────────────────────────────── */

export const DEADLINE_CONFIG = {
    /** Hours after period close before the report is considered late */
    reportDeadlineHours: Number(process.env.REPORT_DEADLINE_HOURS ?? 48),
    /** Hours before the deadline to send a reminder notification */
    reminderLeadHours: Number(process.env.REPORT_REMINDER_HOURS ?? 24),
} as const;

/* ─────────────────────────────────────────────────────────────────────────────
 * SHARED BUILDER HELPERS
 * ───────────────────────────────────────────────────────────────────────────── */

type MetricDef = Omit<ReportTemplateMetric, "sectionId">;
type SectionDef = {
    id: string;
    name: string;
    description?: string;
    order: number;
    isRequired: boolean;
    metrics: MetricDef[];
};
interface TemplateDef {
    name: string;
    description?: string;
    version: number;
    isActive: boolean;
    isDefault: boolean;
    campusId?: string;
    orgGroupId?: string;
    sections: SectionDef[];
}

function m(
    id: string,
    name: string,
    fieldType: MetricFieldType,
    calc: MetricCalculationType,
    required: boolean,
    order: number,
    capturesGoal: boolean,
    capturesAchieved: boolean,
    capturesYoY: boolean,
    description?: string,
): MetricDef {
    return { id, name, fieldType, calculationType: calc, isRequired: required, order, capturesGoal: true, capturesAchieved, capturesYoY: true, description };
}

function s(
    id: string,
    name: string,
    order: number,
    required: boolean,
    metrics: MetricDef[],
    description?: string,
): SectionDef {
    return {
        id,
        name,
        description,
        order,
        isRequired: required,
        metrics: metrics.map((met) => ({ ...met, sectionId: id })),
    };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SECTION DEFINITIONS — aligned to the 2026 Harvesters Reporting Template
 * Each constant is reusable across the three template variants.
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * CHURCH PLANTING — Monthly & Quarterly  |  calculationType: SUM
 */
const SECTION_CHURCH_PLANTING = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}cp`, "Church Planting", order, false, [
        m(`${idPrefix}cp-churches`, "No. of Churches to be Planted", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, true, "Monthly Report: Summation of monthly achieved figures"),
        m(`${idPrefix}cp-plant-cells`, "No. of Plant Cells and Small Groups", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, true, true, false),
        m(`${idPrefix}cp-cell-plants`, "No. of Church Plant Cells", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
    ], "Church planting activities — Monthly & Quarterly reporting.");

/**
 * ATTENDANCE — Weekly, Monthly, Quarterly, Bi-annual, Annual
 * Monthly Report: Average of 4 or 5 weeks  → AVERAGE
 * Unique / cumulative fields → SNAPSHOT
 */
const SECTION_ATTENDANCE = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}att`, "Attendance", order, true, [
        m(`${idPrefix}att-sun-male`, "Sunday Attendance — Male", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 1, true, true, true, "Monthly Report: Average of 4/5 weekly Sunday service attendance (Male)"),
        m(`${idPrefix}att-sun-female`, "Sunday Attendance — Female", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 2, true, true, true, "Monthly Report: Average of 4/5 weekly Sunday service attendance (Female)"),
        m(`${idPrefix}att-sun-children`, "Sunday Attendance — Children", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 3, true, true, true, "Monthly Report: Average of 4/5 weekly Sunday service attendance (Children)"),
        m(`${idPrefix}att-first-timers`, "First Timers", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 4, true, true, true, "Monthly Report: Summation of weekly first timers"),
        m(`${idPrefix}att-worker`, "Worker Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 5, true, true, false, "Monthly Report: Average of weekly worker attendance"),
        m(`${idPrefix}att-growth-track`, "Growth Track Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 6, true, true, false),
        m(`${idPrefix}att-growth-track-uniq`, "Growth Track Unique Attendance", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 7, false, true, false, "Cumulative unique count — last reported value"),
        m(`${idPrefix}att-midweek`, "Midweek Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 8, false, true, false),
        m(`${idPrefix}att-worker-midweek`, "Workers Attendance: Midweek", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 9, false, true, false),
        m(`${idPrefix}att-sg`, "Small Group Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 10, false, true, false),
        m(`${idPrefix}att-cell-leaders`, "Monthly Cell Leaders Attendance (Meeting)", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 11, false, true, false, "Monthly cell leaders meeting attendance — snapshot"),
    ], "Service and group attendance — Weekly, Monthly, Quarterly, Bi-annual, and Annual reporting.");

/**
 * NLP — Weekly & Monthly  |  calculationType: SUM (leads/mobilizers), SNAPSHOT (cells)
 */
const SECTION_NLP = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}nlp`, "NLP", order, false, [
        m(`${idPrefix}nlp-cells`, "No. of NLP Cells", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 1, true, true, false),
        m(`${idPrefix}nlp-leads`, "NLP Leads", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 2, true, true, false, "Monthly Report: Summation of weekly NLP leads"),
        m(`${idPrefix}nlp-mobilizers`, "Mobilizers", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, true, true, false),
    ], "Next Level Prayers — Weekly & Monthly reporting.");

/**
 * SALVATION — Weekly & Monthly  |  calculationType: SUM
 */
const SECTION_SALVATION = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}sal`, "Salvation", order, true, [
        m(`${idPrefix}sal-service`, "Soul Saved in Service", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 1, true, true, true, "Monthly Report: Summation of weekly souls saved in service"),
        m(`${idPrefix}sal-cell`, "Soul Saved in Cell", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 2, true, true, false, "Monthly Report: Summation of weekly souls saved in cell"),
        m(`${idPrefix}sal-nextgen`, "Soul Saved in Next Gen", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
        m(`${idPrefix}sal-baptized`, "No. of People Baptized", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, true, true, false),
    ], "Salvation and baptism records — Weekly & Monthly reporting.");

/**
 * SMALL GROUP — Weekly & Monthly  |  calculationType: SNAPSHOT (groups, leaders), SUM (cells held)
 */
const SECTION_SMALL_GROUP = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}sg`, "Small Group", order, false, [
        m(`${idPrefix}sg-groups`, "No. of Small Groups", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, true, 1, true, true, true, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}sg-leaders`, "No. of Small Group Leaders", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 2, true, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}sg-asst-leaders`, "No. of Assistant Cell Leaders", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 3, false, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}sg-cells-held`, "No. of Cells that Held", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, false, true, false),
    ], "Small group and cell activity — Weekly & Monthly reporting.");

/**
 * HAEF — Monthly & Quarterly  |  calculationType: SUM
 */
const SECTION_HAEF = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}haef`, "HAEF", order, false, [
        m(`${idPrefix}haef-reach`, "Project Reach", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false),
        m(`${idPrefix}haef-impact`, "Project Impact", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
    ], "Harvesters Arrest Extreme Failure — Monthly & Quarterly reporting.");

/**
 * DISCIPLESHIP — Quarterly & Bi-Yearly  |  calculationType: SUM
 */
const SECTION_DISCIPLESHIP = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}disc`, "Discipleship", order, false, [
        m(`${idPrefix}disc-fc-att`, "Foundation Course Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false, "Monthly Report: Summation of cohort achieved figures"),
        m(`${idPrefix}disc-fc-grad`, "Foundation Course Graduants", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
        m(`${idPrefix}disc-alc`, "ALC Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
        m(`${idPrefix}disc-blc`, "BLC Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, false, true, false),
        m(`${idPrefix}disc-plc`, "PLC Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 5, false, true, false),
        m(`${idPrefix}disc-cpc`, "CPC Attendance", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 6, false, true, false),
    ], "Discipleship school attendance and graduants — Quarterly & Bi-annual reporting.");

/**
 * PARTNERSHIP — Monthly & Quarterly  |  calculationType: SUM
 */
const SECTION_PARTNERSHIP = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}part`, "Partnership", order, false, [
        m(`${idPrefix}part-partners`, "No. of Partners", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, true, "Monthly Report: Summation of monthly achieved figures"),
    ], "Partnership and giving — Monthly & Quarterly reporting.");

/**
 * PROJECT — Monthly & Quarterly  |  calculationType: SNAPSHOT
 */
const SECTION_PROJECT = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}proj`, "Project", order, false, [
        m(`${idPrefix}proj-ongoing`, "No. of Ongoing Projects", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 1, false, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}proj-phase-closure`, "Project Phase and Closure", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 2, false, true, false, "Monthly Report: Cumulation — last reported value"),
    ], "Project management tracking — Monthly & Quarterly reporting.");

/**
 * TRANSFORMATION — Monthly & Quarterly  |  calculationType: SUM
 */
const SECTION_TRANSFORMATION = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}trans`, "Transformation", order, false, [
        m(`${idPrefix}trans-testimonies`, "No. of Testimonies", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false, "Monthly Report: Cumulation — last or quarterly figure"),
        m(`${idPrefix}trans-births`, "No. of Births", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
        m(`${idPrefix}trans-dedications`, "No. of Babies Dedicated", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
        m(`${idPrefix}trans-weddings`, "No. of Weddings", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, false, true, false),
    ], "Community transformation and life milestones — Monthly & Quarterly reporting.");

/**
 * ASSIMILATION — Monthly & Quarterly  |  calculationType: SNAPSHOT (workers, leaders), SUM (assimilated)
 */
const SECTION_ASSIMILATION = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}assim`, "Assimilation", order, false, [
        m(`${idPrefix}assim-sg`, "No. Assimilated into Small Groups", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}assim-workforce`, "No. Assimilated into Work Force", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
        m(`${idPrefix}assim-workers`, "No. of Workers", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, true, 3, true, true, true, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}assim-leaders`, "No. of Leaders", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 4, false, true, false),
    ], "Assimilation into small groups and workforce — Monthly & Quarterly reporting.");

/**
 * NEXT GEN — Weekly & Monthly
 * Attendance → AVERAGE  |  Baptisms/Participants → SUM  |  Rates/Counts → SNAPSHOT
 * Sub-ministries: Kidzone (children) and Stir House (youth)
 */
const SECTION_NEXT_GEN = (idPrefix: string, order: number): SectionDef =>
    s(`${idPrefix}ng`, "Next Gen", order, false, [
        m(`${idPrefix}ng-att-kidzone`, "Next Gen Attendance — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 1, true, true, false, "Monthly Report: Average of 4 weeks"),
        m(`${idPrefix}ng-att-stir`, "Next Gen Attendance — Stir House", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 2, true, true, false, "Monthly Report: Average of 4 weeks"),
        m(`${idPrefix}ng-ft-kidzone`, "First Timers — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 3, false, true, false),
        m(`${idPrefix}ng-ft-stir`, "First Timers — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 4, false, true, false),
        m(`${idPrefix}ng-wrkr-kidzone`, "Workers Attendance — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 5, false, true, false),
        m(`${idPrefix}ng-wrkr-stir`, "Workers Attendance — Stir House", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 6, false, true, false),
        m(`${idPrefix}ng-bap-water-kz`, "No. of Baptized (Water) — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 7, false, true, false, "Monthly Report: Cumulation — last reported value"),
        m(`${idPrefix}ng-bap-water-sh`, "No. of Baptized (Water) — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 8, false, true, false),
        m(`${idPrefix}ng-bap-hg-kz`, "No. of Baptized (Holy Ghost) — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 9, false, true, false),
        m(`${idPrefix}ng-bap-hg-sh`, "No. of Baptized (Holy Ghost) — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 10, false, true, false),
        m(`${idPrefix}ng-return-kidzone`, "Next Gen Return Rate — Kidzone", MetricFieldType.PERCENTAGE, MetricCalculationType.SNAPSHOT, false, 11, false, true, false),
        m(`${idPrefix}ng-return-stir`, "Next Gen Return Rate — Stir House", MetricFieldType.PERCENTAGE, MetricCalculationType.SNAPSHOT, false, 12, false, true, false),
        m(`${idPrefix}ng-pdpf-kidzone`, "No. of PD/PF Participants — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 13, false, true, false),
        m(`${idPrefix}ng-pdpf-stir`, "No. of PD/PF Participants — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 14, false, true, false),
        m(`${idPrefix}ng-teen-leaders`, "No. of Teen Leaders — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 15, false, true, false),
        m(`${idPrefix}ng-served-kidzone`, "No. that Served — Kidzone", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 16, false, true, false),
        m(`${idPrefix}ng-served-stir`, "No. that Served — Stir House", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 17, false, true, false),
        m(`${idPrefix}ng-parental-kidzone`, "Parental Engagement Rate — Kidzone", MetricFieldType.PERCENTAGE, MetricCalculationType.SNAPSHOT, false, 18, false, true, false),
        m(`${idPrefix}ng-parental-stir`, "Parental Engagement Rate — Stir House", MetricFieldType.PERCENTAGE, MetricCalculationType.SNAPSHOT, false, 19, false, true, false),
    ], "Next generation ministry (Kidzone & Stir House) — Weekly & Monthly reporting.");

/* ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE 1: DEFAULT FULL STANDARD MONTHLY REPORT
 * All 12 strategic indicators. The primary comprehensive report template.
 * ───────────────────────────────────────────────────────────────────────────── */

export const DEFAULT_REPORT_TEMPLATE: TemplateDef = {
    name: "Standard Campus Monthly Report",
    description: "The primary Harvesters monthly report template covering all 12 strategic indicators. Monthly Report aggregation rules: Attendance → Average of 4/5 weeks; Salvation/NLP/Partnership/HAEF/Discipleship/Transformation/Assimilation → Summation; Small Group/Project/Workers → Cumulation (last reported value).",
    version: 1,
    isActive: true,
    isDefault: true,
    sections: [
        SECTION_CHURCH_PLANTING("std-", 1),
        SECTION_ATTENDANCE("std-", 2),
        SECTION_NLP("std-", 3),
        SECTION_SALVATION("std-", 4),
        SECTION_SMALL_GROUP("std-", 5),
        SECTION_HAEF("std-", 6),
        SECTION_DISCIPLESHIP("std-", 7),
        SECTION_PARTNERSHIP("std-", 8),
        SECTION_PROJECT("std-", 9),
        SECTION_TRANSFORMATION("std-", 10),
        SECTION_ASSIMILATION("std-", 11),
        SECTION_NEXT_GEN("std-", 12),
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE 2: WEEKLY REPORT TEMPLATE
 * Strictly weekly-tracked metrics only (5 sections).
 * Covers sections that have Weekly reporting frequency.
 * ───────────────────────────────────────────────────────────────────────────── */

export const WEEKLY_REPORT_TEMPLATE: TemplateDef = {
    name: "Weekly Campus Report",
    description: "Weekly report template covering only the sections tracked on a weekly basis: Attendance, NLP, Salvation, Small Group, and Next Gen. Used for week-by-week submissions.",
    version: 1,
    isActive: true,
    isDefault: false,
    sections: [
        SECTION_ATTENDANCE("wkly-", 1),
        SECTION_NLP("wkly-", 2),
        SECTION_SALVATION("wkly-", 3),
        SECTION_SMALL_GROUP("wkly-", 4),
        SECTION_NEXT_GEN("wkly-", 5),
    ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * TEMPLATE 3: MONTHLY-ONLY REPORT TEMPLATE
 * Strictly monthly-tracked metrics only (7 sections).
 * Covers sections that have Monthly/Quarterly reporting frequency but NO weekly cadence.
 * ───────────────────────────────────────────────────────────────────────────── */

export const MONTHLY_ONLY_REPORT_TEMPLATE: TemplateDef = {
    name: "Monthly-Only Campus Report",
    description: "Monthly report template covering the sections that are tracked exclusively on a monthly or quarterly basis (no weekly cadence): Church Planting, HAEF, Discipleship, Partnership, Project, Transformation, and Assimilation.",
    version: 1,
    isActive: true,
    isDefault: false,
    sections: [
        SECTION_CHURCH_PLANTING("mo-", 1),
        SECTION_HAEF("mo-", 2),
        SECTION_DISCIPLESHIP("mo-", 3),
        SECTION_PARTNERSHIP("mo-", 4),
        SECTION_PROJECT("mo-", 5),
        SECTION_TRANSFORMATION("mo-", 6),
        SECTION_ASSIMILATION("mo-", 7),
    ],
};