/**
 * lib/data/seed.ts
 * Deterministic fixture data for development.
 * Seeded once on first mockDb access.
 * Password for all seed users: "Harvesters2024!"
 */

import bcryptjs from "bcryptjs";
import { UserRole, ReportStatus, ReportPeriodType, MetricFieldType, MetricCalculationType } from "@/types/global";
import { mockDb as _mockDbImport } from "./mockDb";
type MockDbType = typeof _mockDbImport;

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters-org-dev";

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic IDs
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_IDS = {
    // Users — one per active role
    users: {
        superadmin: "user-superadmin-001",
        spo: "user-spo-001",
        ceo: "user-ceo-001",
        churchMinistry: "user-cm-001",
        groupPastor: "user-gp-001",
        groupAdmin: "user-ga-001",
        campusPastor: "user-cp-001",
        campusAdmin: "user-ca-001",
        dataEntry: "user-de-001",
    },
    // Org
    groups: {
        nigeria: "group-nigeria-001",
        uk: "group-uk-001",
    },
    campuses: {
        lekki: "campus-lekki-001",
        ikeja: "campus-ikeja-001",
        abuja: "campus-abuja-001",
        london: "campus-london-001",
    },
    // Templates
    template: "template-default-001",
    templateVersion: "tpl-version-001",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Seed function — idempotent (checks if already seeded)
// ─────────────────────────────────────────────────────────────────────────────

export async function seedDb(db: MockDbType): Promise<void> {
    // Skip if already seeded
    const existing = await db.users.findUnique({ where: { id: SEED_IDS.users.superadmin } });
    if (existing) return;

    const hashedPassword = await bcryptjs.hash("Harvesters2024!", 10);
    const now = new Date().toISOString();

    // ── Users ────────────────────────────────────────────────────────────────

    const users: UserProfile[] = [
        {
            id: SEED_IDS.users.superadmin,
            email: "superadmin@harvesters.org",
            firstName: "Super",
            lastName: "Admin",
            role: UserRole.SUPERADMIN,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.users.spo,
            email: "spo@harvesters.org",
            firstName: "Senior",
            lastName: "Pastor",
            role: UserRole.SPO,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.users.ceo,
            email: "ceo@harvesters.org",
            firstName: "Chief",
            lastName: "Executive",
            role: UserRole.CEO,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.users.churchMinistry,
            email: "ministry@harvesters.org",
            firstName: "Church",
            lastName: "Ministry",
            role: UserRole.CHURCH_MINISTRY,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.users.groupPastor,
            email: "grouppastor@harvesters.org",
            firstName: "Group",
            lastName: "Pastor",
            role: UserRole.GROUP_PASTOR,
            orgGroupId: SEED_IDS.groups.nigeria,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.users.groupAdmin,
            email: "groupadmin@harvesters.org",
            firstName: "Group",
            lastName: "Administrator",
            role: UserRole.GROUP_ADMIN,
            orgGroupId: SEED_IDS.groups.nigeria,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.users.campusPastor,
            email: "campuspastor@harvesters.org",
            firstName: "Campus",
            lastName: "Pastor",
            role: UserRole.CAMPUS_PASTOR,
            campusId: SEED_IDS.campuses.lekki,
            orgGroupId: SEED_IDS.groups.nigeria,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.users.campusAdmin,
            email: "campusadmin@harvesters.org",
            firstName: "Campus",
            lastName: "Administrator",
            role: UserRole.CAMPUS_ADMIN,
            campusId: SEED_IDS.campuses.lekki,
            orgGroupId: SEED_IDS.groups.nigeria,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.users.dataEntry,
            email: "dataentry@harvesters.org",
            firstName: "Data",
            lastName: "Entry",
            role: UserRole.DATA_ENTRY,
            campusId: SEED_IDS.campuses.ikeja,
            orgGroupId: SEED_IDS.groups.nigeria,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
    ];

    // Store hashed passwords separately (users table doesn't carry password)
    // The auth service reads from this passwordStore keyed by userId
    for (const user of users) {
        await db.users.create({ data: user }, true);
    }

    // ── Password store (auth users) — piggyback into inviteLinks table not needed
    // Instead, seed a simple user-passwords map into a global
    const g = global as typeof global & { __passwordStore?: Map<string, string> };
    if (!g.__passwordStore) g.__passwordStore = new Map();
    for (const user of users) {
        g.__passwordStore.set(user.id, hashedPassword);
    }

    // ── Org Groups ──────────────────────────────────────────────────────────

    const orgGroups: OrgGroup[] = [
        {
            id: SEED_IDS.groups.nigeria,
            name: "Nigeria Group",
            description: "All Nigerian campuses",
            orgLevel: "GROUP",
            country: "Nigeria",
            isActive: true,
            leaderId: SEED_IDS.users.groupPastor,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.groups.uk,
            name: "UK Group",
            description: "All UK campuses",
            orgLevel: "GROUP",
            country: "United Kingdom",
            isActive: true,
            leaderId: SEED_IDS.users.spo,
            createdAt: now,
            updatedAt: now,
        },
    ];

    for (const g of orgGroups) await db.orgGroups.create({ data: g }, true);

    // ── Campuses ─────────────────────────────────────────────────────────────

    const campuses: Campus[] = [
        {
            id: SEED_IDS.campuses.lekki,
            name: "Lekki Campus",
            orgLevel: "CAMPUS",
            parentId: SEED_IDS.groups.nigeria,
            country: "Nigeria",
            location: "Lekki, Lagos",
            adminId: SEED_IDS.users.campusAdmin,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.campuses.ikeja,
            name: "Ikeja Campus",
            orgLevel: "CAMPUS",
            parentId: SEED_IDS.groups.nigeria,
            country: "Nigeria",
            location: "Ikeja, Lagos",
            adminId: SEED_IDS.users.dataEntry,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.campuses.abuja,
            name: "Abuja Campus",
            orgLevel: "CAMPUS",
            parentId: SEED_IDS.groups.nigeria,
            country: "Nigeria",
            location: "Abuja FCT",
            adminId: SEED_IDS.users.campusPastor,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
        {
            id: SEED_IDS.campuses.london,
            name: "London Campus",
            orgLevel: "CAMPUS",
            parentId: SEED_IDS.groups.uk,
            country: "United Kingdom",
            location: "London",
            adminId: SEED_IDS.users.spo,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        },
    ];

    for (const c of campuses) await db.campuses.create({ data: c }, true);

    // ── Default Report Template ───────────────────────────────────────────────

    const template: ReportTemplate = {
        id: SEED_IDS.template,
        organisationId: ORG_ID,
        name: "Standard Campus Weekly Report",
        description: "Default Harvesters weekly report covering all key metrics",
        version: 1,
        isActive: true,
        isDefault: true,
        createdById: SEED_IDS.users.superadmin,
        createdAt: now,
        updatedAt: now,
        sections: [
            buildSection("section-attendance", SEED_IDS.template, "Weekly Attendance", 1, true, [
                buildMetric("m-att-total", "section-attendance", "Total Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 1, true, true, true),
                buildMetric("m-att-first", "section-attendance", "First Timers", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 2, true, true, false),
            ]),
            buildSection("section-salvations", SEED_IDS.template, "Salvations", 2, true, [
                buildMetric("m-sal", "section-salvations", "Salvations", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 1, true, true, true),
            ]),
            buildSection("section-discipleship", SEED_IDS.template, "Discipleship", 3, true, [
                buildMetric("m-disc-enroll", "section-discipleship", "Foundation School — Enrolled", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, true, 1, true, true, false),
                buildMetric("m-disc-grad", "section-discipleship", "Foundation School — Graduated", MetricFieldType.NUMBER, MetricCalculationType.SUM, true, 2, false, true, false),
            ]),
            buildSection("section-tithes", SEED_IDS.template, "Tithes & Offerings", 4, false, [
                buildMetric("m-tithes", "section-tithes", "Tithes", MetricFieldType.CURRENCY, MetricCalculationType.SUM, false, 1, true, true, false),
                buildMetric("m-offerings", "section-tithes", "Offerings", MetricFieldType.CURRENCY, MetricCalculationType.SUM, false, 2, false, true, false),
            ]),
            buildSection("section-workers", SEED_IDS.template, "Workers", 5, true, [
                buildMetric("m-wrkr-total", "section-workers", "Total Workers", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, true, 1, true, true, true),
                buildMetric("m-wrkr-new", "section-workers", "New Workers This Week", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
            ]),
            buildSection("section-outreach", SEED_IDS.template, "Outreach", 6, false, [
                buildMetric("m-out-events", "section-outreach", "Outreach Events Held", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false),
                buildMetric("m-out-sal", "section-outreach", "Salvations via Outreach", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
            ]),
            buildSection("section-youth", SEED_IDS.template, "Youth", 7, true, [
                buildMetric("m-youth-att", "section-youth", "Youth Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 1, true, true, false),
                buildMetric("m-youth-sal", "section-youth", "Youth Salvations", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
            ]),
            buildSection("section-children", SEED_IDS.template, "Children", 8, true, [
                buildMetric("m-child-att", "section-children", "Children Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, true, 1, true, true, false),
            ]),
            buildSection("section-media", SEED_IDS.template, "Media & Digital", 9, false, [
                buildMetric("m-media-stream", "section-media", "Live Stream Views", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false),
                buildMetric("m-media-social", "section-media", "Social Media Reach", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 2, false, true, false),
            ]),
            buildSection("section-prayer", SEED_IDS.template, "Prayer", 10, false, [
                buildMetric("m-prayer-mtg", "section-prayer", "Prayer Meetings Held", MetricFieldType.NUMBER, MetricCalculationType.SUM, false, 1, true, true, false),
                buildMetric("m-prayer-att", "section-prayer", "Prayer Meeting Attendance", MetricFieldType.NUMBER, MetricCalculationType.AVERAGE, false, 2, false, true, false),
            ]),
            buildSection("section-infra", SEED_IDS.template, "Infrastructure & Facilities", 11, false, [
                buildMetric("m-infra-proj", "section-infra", "Active Projects", MetricFieldType.NUMBER, MetricCalculationType.SNAPSHOT, false, 1, false, true, false),
            ]),
        ],
    };

    await db.reportTemplates.create({ data: template }, true);

    // ── Sample Reports ───────────────────────────────────────────────────────

    const reportBase = {
        templateId: SEED_IDS.template,
        templateVersionId: SEED_IDS.templateVersion,
        orgGroupId: SEED_IDS.groups.nigeria,
        periodType: ReportPeriodType.WEEKLY,
        periodYear: 2025,
        periodMonth: 1,
        periodWeek: 1,
        deadline: new Date(2025, 0, 12).toISOString(),
        isDataEntry: false,
        createdAt: now,
        updatedAt: now,
    };

    const sampleReports = [
        {
            ...reportBase,
            id: "report-lekki-draft",
            campusId: SEED_IDS.campuses.lekki,
            status: ReportStatus.DRAFT,
            submittedById: SEED_IDS.users.campusAdmin,
        },
        {
            ...reportBase,
            id: "report-lekki-submitted",
            campusId: SEED_IDS.campuses.lekki,
            periodWeek: 2,
            status: ReportStatus.SUBMITTED,
            submittedById: SEED_IDS.users.campusAdmin,
        },
        {
            ...reportBase,
            id: "report-ikeja-approved",
            campusId: SEED_IDS.campuses.ikeja,
            status: ReportStatus.APPROVED,
            submittedById: SEED_IDS.users.dataEntry,
            approvedById: SEED_IDS.users.groupAdmin,
            isDataEntry: true,
            dataEntryById: SEED_IDS.users.dataEntry,
            dataEntryDate: now,
        },
        {
            ...reportBase,
            id: "report-abuja-requires-edits",
            campusId: SEED_IDS.campuses.abuja,
            status: ReportStatus.REQUIRES_EDITS,
        },
        {
            ...reportBase,
            id: "report-london-locked",
            campusId: SEED_IDS.campuses.london,
            orgGroupId: SEED_IDS.groups.uk,
            status: ReportStatus.LOCKED,
            submittedById: SEED_IDS.users.campusPastor,
            approvedById: SEED_IDS.users.groupAdmin,
            reviewedById: SEED_IDS.users.groupPastor,
            lockedAt: now,
        },
    ] as unknown as Report[];

    for (const r of sampleReports) await db.reports.create({ data: r }, true);

    // ── Sample Notifications ──────────────────────────────────────────────────
    const { NotificationType } = await import("@/types/global");

    const notifications: AppNotification[] = [
        {
            id: "notif-001",
            userId: SEED_IDS.users.groupAdmin,
            type: NotificationType.REPORT_SUBMITTED,
            title: "New Report Submitted",
            message: "Lekki Campus has submitted their weekly report.",
            relatedId: "report-lekki-submitted",
            read: false,
            createdAt: now,
        },
        {
            id: "notif-002",
            userId: SEED_IDS.users.campusAdmin,
            type: NotificationType.REPORT_EDIT_REQUESTED,
            title: "Edit Requested",
            message: "An edit has been requested on your report.",
            relatedId: "report-abuja-requires-edits",
            read: false,
            createdAt: now,
        },
    ];

    for (const n of notifications) await db.notifications.create({ data: n }, true);

    console.log("[mockDb] Seed complete ✓");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildSection(
    id: string,
    templateId: string,
    name: string,
    order: number,
    isRequired: boolean,
    metrics: ReportTemplateMetric[],
): ReportTemplateSection {
    return { id, templateId, name, order, isRequired, metrics };
}

function buildMetric(
    id: string,
    sectionId: string,
    name: string,
    fieldType: MetricFieldType,
    calculationType: MetricCalculationType,
    isRequired: boolean,
    order: number,
    capturesGoal: boolean,
    capturesAchieved: boolean,
    capturesYoY: boolean,
): ReportTemplateMetric {
    return { id, sectionId, name, fieldType, calculationType, isRequired, order, capturesGoal, capturesAchieved, capturesYoY };
}
