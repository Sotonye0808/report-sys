/**
 * config/reports.ts
 * Report status transitions, deadline config, and the default template
 * (11 sections as per the PRD).
 */

import { MetricCalculationType, MetricFieldType, ReportStatus, UserRole } from "@/types/global";

/* ── Status Transition Map ─────────────────────────────────────────────────── */
// Maps current status → allowed next statuses, keyed by who can trigger it

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
            requiredRole: [UserRole.GROUP_ADMIN, UserRole.GROUP_PASTOR, UserRole.CHURCH_MINISTRY, UserRole.CEO, UserRole.SPO, UserRole.SUPERADMIN],
        },
        {
            to: ReportStatus.APPROVED,
            requiredRole: [UserRole.GROUP_ADMIN, UserRole.CHURCH_MINISTRY, UserRole.CEO, UserRole.SPO, UserRole.SUPERADMIN],
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
            requiredRole: [UserRole.GROUP_PASTOR, UserRole.CEO, UserRole.SPO, UserRole.SUPERADMIN],
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

/* ── Default Report Template (11 Sections) ────────────────────────────────── */
// This drives seed.ts and the default template created on fresh install.

export const DEFAULT_REPORT_TEMPLATE: Omit<
    ReportTemplate,
    "id" | "organisationId" | "createdById" | "createdAt" | "updatedAt"
> = {
    name: "Standard Campus Weekly Report",
    description: "The default Harvesters weekly report template covering all key campus metrics.",
    version: 1,
    isActive: true,
    isDefault: true,
    sections: [
        {
            id: "section-attendance",
            templateId: "default",
            name: "Weekly Attendance",
            description: "Total and breakdown of weekly service attendance.",
            order: 1,
            isRequired: true,
            metrics: [
                {
                    id: "m-attendance-total",
                    sectionId: "section-attendance",
                    name: "Total Attendance",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.AVERAGE,
                    isRequired: true,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: true,
                },
                {
                    id: "m-attendance-first-timers",
                    sectionId: "section-attendance",
                    name: "First Timers",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: true,
                    order: 2,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-salvations",
            templateId: "default",
            name: "Salvations",
            description: "New decisions for Christ.",
            order: 2,
            isRequired: true,
            metrics: [
                {
                    id: "m-salvations",
                    sectionId: "section-salvations",
                    name: "Salvations",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: true,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: true,
                },
            ],
        },
        {
            id: "section-discipleship",
            templateId: "default",
            name: "Discipleship",
            description: "Foundation school enrolments and completions.",
            order: 3,
            isRequired: true,
            metrics: [
                {
                    id: "m-foundation-enrolled",
                    sectionId: "section-discipleship",
                    name: "Foundation School — Enrolled",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SNAPSHOT,
                    isRequired: true,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
                {
                    id: "m-foundation-graduated",
                    sectionId: "section-discipleship",
                    name: "Foundation School — Graduated",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: true,
                    order: 2,
                    capturesGoal: false,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-tithes",
            templateId: "default",
            name: "Tithes & Offerings",
            description: "Weekly financial contributions.",
            order: 4,
            isRequired: false,
            metrics: [
                {
                    id: "m-tithes",
                    sectionId: "section-tithes",
                    name: "Tithes",
                    fieldType: MetricFieldType.CURRENCY,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
                {
                    id: "m-offerings",
                    sectionId: "section-tithes",
                    name: "Offerings",
                    fieldType: MetricFieldType.CURRENCY,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 2,
                    capturesGoal: false,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-workers",
            templateId: "default",
            name: "Workers",
            description: "Active serving workers count.",
            order: 5,
            isRequired: true,
            metrics: [
                {
                    id: "m-workers-total",
                    sectionId: "section-workers",
                    name: "Total Workers",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SNAPSHOT,
                    isRequired: true,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: true,
                },
                {
                    id: "m-workers-new",
                    sectionId: "section-workers",
                    name: "New Workers This Week",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 2,
                    capturesGoal: false,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-outreach",
            templateId: "default",
            name: "Outreach",
            description: "Evangelism and outreach activities.",
            order: 6,
            isRequired: false,
            metrics: [
                {
                    id: "m-outreach-events",
                    sectionId: "section-outreach",
                    name: "Outreach Events Held",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
                {
                    id: "m-outreach-salvations",
                    sectionId: "section-outreach",
                    name: "Salvations via Outreach",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 2,
                    capturesGoal: false,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-youth",
            templateId: "default",
            name: "Youth",
            description: "Youth ministry attendance and salvations.",
            order: 7,
            isRequired: true,
            metrics: [
                {
                    id: "m-youth-attendance",
                    sectionId: "section-youth",
                    name: "Youth Attendance",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.AVERAGE,
                    isRequired: true,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
                {
                    id: "m-youth-salvations",
                    sectionId: "section-youth",
                    name: "Youth Salvations",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 2,
                    capturesGoal: false,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-children",
            templateId: "default",
            name: "Children",
            description: "Children's ministry attendance.",
            order: 8,
            isRequired: true,
            metrics: [
                {
                    id: "m-children-attendance",
                    sectionId: "section-children",
                    name: "Children Attendance",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.AVERAGE,
                    isRequired: true,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-media",
            templateId: "default",
            name: "Media & Digital",
            description: "Online stream viewership and social media engagement.",
            order: 9,
            isRequired: false,
            metrics: [
                {
                    id: "m-media-stream",
                    sectionId: "section-media",
                    name: "Live Stream Views",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
                {
                    id: "m-media-social",
                    sectionId: "section-media",
                    name: "Social Media Reach",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 2,
                    capturesGoal: false,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-prayer",
            templateId: "default",
            name: "Prayer",
            description: "Prayer meetings held and participants.",
            order: 10,
            isRequired: false,
            metrics: [
                {
                    id: "m-prayer-meetings",
                    sectionId: "section-prayer",
                    name: "Prayer Meetings Held",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SUM,
                    isRequired: false,
                    order: 1,
                    capturesGoal: true,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
                {
                    id: "m-prayer-participants",
                    sectionId: "section-prayer",
                    name: "Prayer Meeting Attendance",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.AVERAGE,
                    isRequired: false,
                    order: 2,
                    capturesGoal: false,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
        {
            id: "section-infrastructure",
            templateId: "default",
            name: "Infrastructure & Facilities",
            description: "Key facility metrics and project updates.",
            order: 11,
            isRequired: false,
            metrics: [
                {
                    id: "m-infra-projects",
                    sectionId: "section-infrastructure",
                    name: "Active Infrastructure Projects",
                    fieldType: MetricFieldType.NUMBER,
                    calculationType: MetricCalculationType.SNAPSHOT,
                    isRequired: false,
                    order: 1,
                    capturesGoal: false,
                    capturesAchieved: true,
                    capturesYoY: false,
                },
            ],
        },
    ],
};
