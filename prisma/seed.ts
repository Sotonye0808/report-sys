/**
 * prisma/seed.ts
 * Prisma database seeder — creates deterministic fixture data.
 *
 * Full seed:   npx prisma db seed   (or: npm run db:seed)
 * Base seed:   npm run db:seed:base
 *   → seeds only org groups, campuses, the superadmin system user
 *     (required as a FK owner for the report template), and the
 *     default report template.  No demo users, reports, goals, or
 *     notifications are created.
 *
 * Password for all seed users: "Nlp2026!"
 */

import { PrismaClient } from "./generated";
import bcryptjs from "bcryptjs";

// Prisma 7 "client" engine requires accelerateUrl (prisma:// URL).
// Seeds run via the Accelerate connection; DIRECT_URL is only needed for
// raw migration operations handled by prisma.config.ts / the CLI.
const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
} as ConstructorParameters<typeof PrismaClient>[0]);

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "harvesters-org-dev";

// --base flag: seed only org structure + template (no demo users / reports)
const BASE_ONLY = process.argv.includes("--base");

const SEED_IDS = {
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
    groups: { nigeria: "group-nigeria-001", uk: "group-uk-001" },
    campuses: {
        lekki: "campus-lekki-001",
        ikeja: "campus-ikeja-001",
        abuja: "campus-abuja-001",
        london: "campus-london-001",
    },
    template: "template-default-001",
    templateVersion: "tpl-version-001",
} as const;

// ---------------------------------------------------------------------------
// Modular seed functions
// ---------------------------------------------------------------------------

async function seedOrgStructure() {
    console.log("[seed] Creating org groups...");
    await prisma.orgGroup.createMany({
        data: [
            { id: SEED_IDS.groups.nigeria, name: "Nigeria Group", description: "All Nigerian campuses", country: "Nigeria", isActive: true },
            { id: SEED_IDS.groups.uk, name: "UK Group", description: "All UK campuses", country: "United Kingdom", isActive: true },
        ],
    });

    console.log("[seed] Creating campuses...");
    await prisma.campus.createMany({
        data: [
            { id: SEED_IDS.campuses.lekki, name: "Lekki Campus", parentId: SEED_IDS.groups.nigeria, country: "Nigeria", location: "Lekki, Lagos", isActive: true },
            { id: SEED_IDS.campuses.ikeja, name: "Ikeja Campus", parentId: SEED_IDS.groups.nigeria, country: "Nigeria", location: "Ikeja, Lagos", isActive: true },
            { id: SEED_IDS.campuses.abuja, name: "Abuja Campus", parentId: SEED_IDS.groups.nigeria, country: "Nigeria", location: "Abuja FCT", isActive: true },
            { id: SEED_IDS.campuses.london, name: "London Campus", parentId: SEED_IDS.groups.uk, country: "United Kingdom", location: "London", isActive: true },
        ],
    });
}

async function seedSystemUser(hashedPassword: string) {
    // The superadmin is required as the FK owner (createdById) on the report
    // template and template version records.  Even in a base-only seed we
    // need this single user record.
    console.log("[seed] Creating system superadmin user...");
    await prisma.user.create({
        data: {
            id: SEED_IDS.users.superadmin,
            email: "superadmin@harvesters.org",
            firstName: "Super",
            lastName: "Admin",
            role: "SUPERADMIN",
            passwordHash: hashedPassword,
            organisationId: ORG_ID,
            isActive: true,
        },
    });
}

async function seedDemoUsers(hashedPassword: string) {
    console.log("[seed] Creating demo users...");
    const demoDefs = [
        { id: SEED_IDS.users.spo, email: "spo@harvesters.org", firstName: "Senior", lastName: "Pastor", role: "SPO" as const },
        { id: SEED_IDS.users.ceo, email: "ceo@harvesters.org", firstName: "Chief", lastName: "Executive", role: "CEO" as const },
        { id: SEED_IDS.users.churchMinistry, email: "churchministry@harvesters.org", firstName: "Church", lastName: "Ministry", role: "CHURCH_MINISTRY" as const },
        { id: SEED_IDS.users.groupPastor, email: "grouppastor@harvesters.org", firstName: "Group", lastName: "Pastor", role: "GROUP_PASTOR" as const, orgGroupId: SEED_IDS.groups.nigeria },
        { id: SEED_IDS.users.groupAdmin, email: "groupadmin@harvesters.org", firstName: "Group", lastName: "Administrator", role: "GROUP_ADMIN" as const, orgGroupId: SEED_IDS.groups.nigeria },
        { id: SEED_IDS.users.campusPastor, email: "campuspastor@harvesters.org", firstName: "Campus", lastName: "Pastor", role: "CAMPUS_PASTOR" as const, campusId: SEED_IDS.campuses.lekki, orgGroupId: SEED_IDS.groups.nigeria },
        { id: SEED_IDS.users.campusAdmin, email: "campusadmin@harvesters.org", firstName: "Campus", lastName: "Administrator", role: "CAMPUS_ADMIN" as const, campusId: SEED_IDS.campuses.lekki, orgGroupId: SEED_IDS.groups.nigeria },
        { id: SEED_IDS.users.dataEntry, email: "dataentry@harvesters.org", firstName: "Data", lastName: "Entry", role: "DATA_ENTRY" as const, campusId: SEED_IDS.campuses.ikeja, orgGroupId: SEED_IDS.groups.nigeria },
    ];

    await prisma.user.createMany({
        data: demoDefs.map((u) => ({
            ...u,
            passwordHash: hashedPassword,
            organisationId: ORG_ID,
            isActive: true,
        })),
    });

    // Update org group leaders and campus admins
    await prisma.orgGroup.update({ where: { id: SEED_IDS.groups.nigeria }, data: { leaderId: SEED_IDS.users.groupPastor } });
    await prisma.orgGroup.update({ where: { id: SEED_IDS.groups.uk }, data: { leaderId: SEED_IDS.users.spo } });
    await prisma.campus.update({ where: { id: SEED_IDS.campuses.lekki }, data: { adminId: SEED_IDS.users.campusAdmin } });
    await prisma.campus.update({ where: { id: SEED_IDS.campuses.ikeja }, data: { adminId: SEED_IDS.users.dataEntry } });
}

async function seedTemplate() {
    console.log("[seed] Creating report template...");
    const template = await prisma.reportTemplate.create({
        data: {
            id: SEED_IDS.template,
            organisationId: ORG_ID,
            name: "Standard Campus Weekly Report",
            description: "Default Harvesters weekly report covering all key metrics",
            version: 1,
            isActive: true,
            isDefault: true,
            createdById: SEED_IDS.users.superadmin,
        },
    });

    // Template sections and metrics
    const sectionDefs = [
        {
            id: "section-attendance", name: "Weekly Attendance", order: 1, isRequired: true, metrics: [
                { id: "m-att-total", name: "Total Attendance", fieldType: "NUMBER" as const, calcType: "AVERAGE" as const, order: 1, goal: true, achieved: true, yoy: true },
                { id: "m-att-first", name: "First Timers", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 2, goal: true, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-salvations", name: "Salvations", order: 2, isRequired: true, metrics: [
                { id: "m-sal", name: "Salvations", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 1, goal: true, achieved: true, yoy: true },
            ]
        },
        {
            id: "section-discipleship", name: "Discipleship", order: 3, isRequired: true, metrics: [
                { id: "m-disc-enroll", name: "Foundation School — Enrolled", fieldType: "NUMBER" as const, calcType: "SNAPSHOT" as const, order: 1, goal: true, achieved: true, yoy: false },
                { id: "m-disc-grad", name: "Foundation School — Graduated", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 2, goal: false, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-tithes", name: "Tithes & Offerings", order: 4, isRequired: false, metrics: [
                { id: "m-tithes", name: "Tithes", fieldType: "CURRENCY" as const, calcType: "SUM" as const, order: 1, goal: true, achieved: true, yoy: false },
                { id: "m-offerings", name: "Offerings", fieldType: "CURRENCY" as const, calcType: "SUM" as const, order: 2, goal: false, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-workers", name: "Workers", order: 5, isRequired: true, metrics: [
                { id: "m-wrkr-total", name: "Total Workers", fieldType: "NUMBER" as const, calcType: "SNAPSHOT" as const, order: 1, goal: true, achieved: true, yoy: true },
                { id: "m-wrkr-new", name: "New Workers This Week", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 2, goal: false, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-outreach", name: "Outreach", order: 6, isRequired: false, metrics: [
                { id: "m-out-events", name: "Outreach Events Held", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 1, goal: true, achieved: true, yoy: false },
                { id: "m-out-sal", name: "Salvations via Outreach", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 2, goal: false, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-youth", name: "Youth", order: 7, isRequired: true, metrics: [
                { id: "m-youth-att", name: "Youth Attendance", fieldType: "NUMBER" as const, calcType: "AVERAGE" as const, order: 1, goal: true, achieved: true, yoy: false },
                { id: "m-youth-sal", name: "Youth Salvations", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 2, goal: false, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-children", name: "Children", order: 8, isRequired: true, metrics: [
                { id: "m-child-att", name: "Children Attendance", fieldType: "NUMBER" as const, calcType: "AVERAGE" as const, order: 1, goal: true, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-media", name: "Media & Digital", order: 9, isRequired: false, metrics: [
                { id: "m-media-stream", name: "Live Stream Views", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 1, goal: true, achieved: true, yoy: false },
                { id: "m-media-social", name: "Social Media Reach", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 2, goal: false, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-prayer", name: "Prayer", order: 10, isRequired: false, metrics: [
                { id: "m-prayer-mtg", name: "Prayer Meetings Held", fieldType: "NUMBER" as const, calcType: "SUM" as const, order: 1, goal: true, achieved: true, yoy: false },
                { id: "m-prayer-att", name: "Prayer Meeting Attendance", fieldType: "NUMBER" as const, calcType: "AVERAGE" as const, order: 2, goal: false, achieved: true, yoy: false },
            ]
        },
        {
            id: "section-infra", name: "Infrastructure & Facilities", order: 11, isRequired: false, metrics: [
                { id: "m-infra-proj", name: "Active Projects", fieldType: "NUMBER" as const, calcType: "SNAPSHOT" as const, order: 1, goal: false, achieved: true, yoy: false },
            ]
        },
    ];

    for (const sec of sectionDefs) {
        await prisma.reportTemplateSection.create({
            data: {
                id: sec.id,
                templateId: template.id,
                name: sec.name,
                order: sec.order,
                isRequired: sec.isRequired,
                metrics: {
                    create: sec.metrics.map((m) => ({
                        id: m.id,
                        name: m.name,
                        fieldType: m.fieldType,
                        calculationType: m.calcType,
                        isRequired: sec.isRequired,
                        order: m.order,
                        capturesGoal: m.goal,
                        capturesAchieved: m.achieved,
                        capturesYoY: m.yoy,
                    })),
                },
            },
        });
    }

    // Template version snapshot
    const fullTemplate = await prisma.reportTemplate.findUnique({
        where: { id: template.id },
        include: { sections: { include: { metrics: true }, orderBy: { order: "asc" } } },
    });
    await prisma.reportTemplateVersion.create({
        data: {
            id: SEED_IDS.templateVersion,
            templateId: template.id,
            versionNumber: 1,
            snapshot: JSON.parse(JSON.stringify(fullTemplate)),
            createdById: SEED_IDS.users.superadmin,
        },
    });
}

async function seedReports() {
    const now = new Date();
    console.log("[seed] Creating sample reports...");

    const reportConfigs = [
        { id: "report-lekki-draft", title: "Lekki Campus — Week 1, January 2025", campusId: SEED_IDS.campuses.lekki, groupId: SEED_IDS.groups.nigeria, status: "DRAFT" as const, createdById: SEED_IDS.users.campusAdmin },
        { id: "report-lekki-submitted", title: "Lekki Campus — Week 2, January 2025", campusId: SEED_IDS.campuses.lekki, groupId: SEED_IDS.groups.nigeria, status: "SUBMITTED" as const, createdById: SEED_IDS.users.campusAdmin, submittedById: SEED_IDS.users.campusAdmin },
        { id: "report-ikeja-approved", title: "Ikeja Campus — Week 1, January 2025", campusId: SEED_IDS.campuses.ikeja, groupId: SEED_IDS.groups.nigeria, status: "APPROVED" as const, createdById: SEED_IDS.users.dataEntry, submittedById: SEED_IDS.users.dataEntry, approvedById: SEED_IDS.users.campusPastor, isDataEntry: true, dataEntryById: SEED_IDS.users.dataEntry },
        { id: "report-abuja-edits", title: "Abuja Campus — Week 1, January 2025", campusId: SEED_IDS.campuses.abuja, groupId: SEED_IDS.groups.nigeria, status: "REQUIRES_EDITS" as const, createdById: SEED_IDS.users.campusAdmin },
        { id: "report-london-locked", title: "London Campus — Week 1, January 2025", campusId: SEED_IDS.campuses.london, groupId: SEED_IDS.groups.uk, status: "LOCKED" as const, createdById: SEED_IDS.users.campusPastor, submittedById: SEED_IDS.users.campusPastor, approvedById: SEED_IDS.users.groupAdmin, reviewedById: SEED_IDS.users.groupPastor, lockedAt: now },
    ];

    for (const rc of reportConfigs) {
        await prisma.report.create({
            data: {
                id: rc.id,
                title: rc.title,
                templateId: SEED_IDS.template,
                templateVersionId: SEED_IDS.templateVersion,
                campusId: rc.campusId,
                orgGroupId: rc.groupId,
                periodType: "WEEKLY",
                periodYear: 2025,
                periodMonth: 1,
                periodWeek: 1,
                status: rc.status,
                createdById: rc.createdById,
                submittedById: rc.submittedById,
                approvedById: rc.approvedById,
                reviewedById: rc.reviewedById,
                isDataEntry: rc.isDataEntry ?? false,
                dataEntryById: rc.dataEntryById,
                deadline: new Date(2025, 0, 12),
                lockedAt: rc.lockedAt,
            },
        });
    }

    // Sections + metrics for Lekki submitted
    const lekkiSec1 = await prisma.reportSection.create({
        data: { reportId: "report-lekki-submitted", templateSectionId: "section-attendance", sectionName: "Weekly Attendance" },
    });
    await prisma.reportMetric.createMany({
        data: [
            { reportSectionId: lekkiSec1.id, templateMetricId: "m-att-total", metricName: "Total Attendance", calculationType: "AVERAGE", monthlyGoal: 2500, monthlyAchieved: 2340, yoyGoal: 2100, computedPercentage: 93.6 },
            { reportSectionId: lekkiSec1.id, templateMetricId: "m-att-first", metricName: "First Timers", calculationType: "SUM", monthlyGoal: 150, monthlyAchieved: 163, computedPercentage: 108.7 },
        ],
    });

    const lekkiSec2 = await prisma.reportSection.create({
        data: { reportId: "report-lekki-submitted", templateSectionId: "section-salvations", sectionName: "Salvations" },
    });
    await prisma.reportMetric.create({
        data: { reportSectionId: lekkiSec2.id, templateMetricId: "m-sal", metricName: "Salvations", calculationType: "SUM", monthlyGoal: 200, monthlyAchieved: 195, computedPercentage: 97.5, comment: "Strong altar call responses across all services." },
    });

    console.log("[seed] Creating report events...");
    const tMinus = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60 * 1000);

    await prisma.reportEvent.createMany({
        data: [
            { reportId: "report-lekki-draft", eventType: "CREATED", actorId: SEED_IDS.users.campusAdmin, timestamp: tMinus(120), newStatus: "DRAFT" },
            { reportId: "report-lekki-submitted", eventType: "CREATED", actorId: SEED_IDS.users.campusAdmin, timestamp: tMinus(180), newStatus: "DRAFT" },
            { reportId: "report-lekki-submitted", eventType: "SUBMITTED", actorId: SEED_IDS.users.campusAdmin, timestamp: tMinus(60), previousStatus: "DRAFT", newStatus: "SUBMITTED" },
            { reportId: "report-ikeja-approved", eventType: "DATA_ENTRY_CREATED", actorId: SEED_IDS.users.dataEntry, timestamp: tMinus(300), newStatus: "DRAFT" },
            { reportId: "report-ikeja-approved", eventType: "SUBMITTED", actorId: SEED_IDS.users.dataEntry, timestamp: tMinus(240), previousStatus: "DRAFT", newStatus: "SUBMITTED" },
            { reportId: "report-ikeja-approved", eventType: "APPROVED", actorId: SEED_IDS.users.campusPastor, timestamp: tMinus(180), previousStatus: "SUBMITTED", newStatus: "APPROVED", details: "Figures look good. Approved." },
            { reportId: "report-abuja-edits", eventType: "CREATED", actorId: SEED_IDS.users.campusAdmin, timestamp: tMinus(360), newStatus: "DRAFT" },
            { reportId: "report-abuja-edits", eventType: "SUBMITTED", actorId: SEED_IDS.users.campusAdmin, timestamp: tMinus(300), previousStatus: "DRAFT", newStatus: "SUBMITTED" },
            { reportId: "report-abuja-edits", eventType: "EDIT_REQUESTED", actorId: SEED_IDS.users.campusPastor, timestamp: tMinus(120), previousStatus: "SUBMITTED", newStatus: "REQUIRES_EDITS", details: "Attendance figures seem inconsistent." },
            { reportId: "report-london-locked", eventType: "CREATED", actorId: SEED_IDS.users.campusPastor, timestamp: tMinus(600), newStatus: "DRAFT" },
            { reportId: "report-london-locked", eventType: "SUBMITTED", actorId: SEED_IDS.users.campusPastor, timestamp: tMinus(480), previousStatus: "DRAFT", newStatus: "SUBMITTED" },
            { reportId: "report-london-locked", eventType: "APPROVED", actorId: SEED_IDS.users.groupAdmin, timestamp: tMinus(360), previousStatus: "SUBMITTED", newStatus: "APPROVED" },
            { reportId: "report-london-locked", eventType: "REVIEWED", actorId: SEED_IDS.users.groupPastor, timestamp: tMinus(240), previousStatus: "APPROVED", newStatus: "REVIEWED" },
            { reportId: "report-london-locked", eventType: "LOCKED", actorId: SEED_IDS.users.superadmin, timestamp: tMinus(60), previousStatus: "REVIEWED", newStatus: "LOCKED" },
        ],
    });

    console.log("[seed] Creating goals...");
    const campusGoalDefs = [
        { campusId: SEED_IDS.campuses.lekki, metrics: { "m-att-total": 2500, "m-att-first": 150, "m-sal": 200, "m-wrkr-total": 350, "m-youth-att": 600 } },
        { campusId: SEED_IDS.campuses.ikeja, metrics: { "m-att-total": 1800, "m-att-first": 100, "m-sal": 140, "m-wrkr-total": 240 } },
        { campusId: SEED_IDS.campuses.abuja, metrics: { "m-att-total": 2000, "m-att-first": 120, "m-sal": 160, "m-wrkr-total": 280 } },
        { campusId: SEED_IDS.campuses.london, metrics: { "m-att-total": 900, "m-att-first": 50, "m-sal": 70, "m-wrkr-total": 130 } },
    ];

    for (const def of campusGoalDefs) {
        const groupId = def.campusId === SEED_IDS.campuses.london ? SEED_IDS.groups.uk : SEED_IDS.groups.nigeria;
        for (const [metricId, target] of Object.entries(def.metrics)) {
            await prisma.goal.create({
                data: {
                    campusId: def.campusId,
                    orgGroupId: groupId,
                    templateId: SEED_IDS.template,
                    templateMetricId: metricId,
                    metricName: metricId,
                    mode: "ANNUAL",
                    year: 2026,
                    targetValue: target,
                    createdById: SEED_IDS.users.groupAdmin,
                },
            });
        }
    }

    console.log("[seed] Creating notifications...");
    await prisma.notification.createMany({
        data: [
            { userId: SEED_IDS.users.groupAdmin, type: "REPORT_SUBMITTED", title: "New Report Submitted", message: "Lekki Campus has submitted their weekly report.", relatedId: "report-lekki-submitted" },
            { userId: SEED_IDS.users.campusAdmin, type: "REPORT_EDIT_REQUESTED", title: "Edit Requested", message: "An edit has been requested on your report.", relatedId: "report-abuja-edits" },
        ],
    });
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

async function main() {
    if (BASE_ONLY) {
        // Base-only seed: org structure + template (no demo users / reports)
        const existingGroup = await prisma.orgGroup.findUnique({ where: { id: SEED_IDS.groups.nigeria } });
        if (existingGroup) {
            console.log("[seed] Base data already seeded, skipping.");
            return;
        }

        const hashedPassword = await bcryptjs.hash("Nlp2026!", 12);
        await seedOrgStructure();
        // The superadmin user is required as the FK owner (createdById) on the
        // report template and template version — it must exist before seedTemplate().
        await seedSystemUser(hashedPassword);
        await seedTemplate();
        console.log("[seed] ✓ Base seed complete (groups, campuses, template).");
    } else {
        // Full seed: everything
        const existing = await prisma.user.findUnique({ where: { id: SEED_IDS.users.superadmin } });
        if (existing) {
            console.log("[seed] Already seeded, skipping.");
            return;
        }

        const hashedPassword = await bcryptjs.hash("Nlp2026!", 12);
        await seedOrgStructure();
        await seedSystemUser(hashedPassword);
        await seedDemoUsers(hashedPassword);
        await seedTemplate();
        await seedReports();
        console.log("[seed] ✓ Seed complete");
    }
}

main()
    .catch((e) => {
        console.error("[seed] Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
