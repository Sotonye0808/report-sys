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
import { DEFAULT_REPORT_TEMPLATE, WEEKLY_REPORT_TEMPLATE, MONTHLY_ONLY_REPORT_TEMPLATE } from "../config/reports";

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
    templates: {
        default: "template-default-001",
        weekly: "template-weekly-001",
        monthly: "template-monthly-001",
    },
    templateVersions: {
        default: "tpl-version-001",
        weekly: "tpl-version-weekly-001",
        monthly: "tpl-version-monthly-001",
    },
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
    console.log("[seed] Creating report templates from config/reports.ts...");

    const templateDefs = [
        { config: DEFAULT_REPORT_TEMPLATE, id: SEED_IDS.templates.default, versionId: SEED_IDS.templateVersions.default },
        { config: WEEKLY_REPORT_TEMPLATE, id: SEED_IDS.templates.weekly, versionId: SEED_IDS.templateVersions.weekly },
        { config: MONTHLY_ONLY_REPORT_TEMPLATE, id: SEED_IDS.templates.monthly, versionId: SEED_IDS.templateVersions.monthly },
    ];

    for (const { config, id, versionId } of templateDefs) {
        console.log(`[seed]   → ${config.name}`);

        const template = await prisma.reportTemplate.create({
            data: {
                id,
                organisationId: ORG_ID,
                name: config.name,
                description: config.description,
                version: config.version,
                isActive: config.isActive,
                isDefault: config.isDefault,
                createdById: SEED_IDS.users.superadmin,
            },
        });

        for (const sec of config.sections) {
            await prisma.reportTemplateSection.create({
                data: {
                    id: sec.id,
                    templateId: template.id,
                    name: sec.name,
                    description: sec.description,
                    order: sec.order,
                    isRequired: sec.isRequired,
                    metrics: {
                        create: sec.metrics.map((met) => ({
                            id: met.id,
                            name: met.name,
                            fieldType: met.fieldType,
                            calculationType: met.calculationType,
                            isRequired: met.isRequired,
                            order: met.order,
                            capturesGoal: met.capturesGoal,
                            capturesAchieved: met.capturesAchieved,
                            capturesYoY: met.capturesYoY,
                            description: met.description,
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
                id: versionId,
                templateId: template.id,
                versionNumber: 1,
                snapshot: JSON.parse(JSON.stringify(fullTemplate)),
                createdById: SEED_IDS.users.superadmin,
            },
        });
    }
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
                templateId: SEED_IDS.templates.default,
                templateVersionId: SEED_IDS.templateVersions.default,
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

    // Sections + metrics for Lekki submitted — aligned with DEFAULT_REPORT_TEMPLATE IDs
    const lekkiSec1 = await prisma.reportSection.create({
        data: { reportId: "report-lekki-submitted", templateSectionId: "std-att", sectionName: "Attendance" },
    });
    await prisma.reportMetric.createMany({
        data: [
            { reportSectionId: lekkiSec1.id, templateMetricId: "std-att-sun-male", metricName: "Sunday Attendance — Male", calculationType: "AVERAGE", monthlyGoal: 1200, monthlyAchieved: 1150, yoyGoal: 1000, computedPercentage: 95.8 },
            { reportSectionId: lekkiSec1.id, templateMetricId: "std-att-sun-female", metricName: "Sunday Attendance — Female", calculationType: "AVERAGE", monthlyGoal: 1300, monthlyAchieved: 1190, yoyGoal: 1100, computedPercentage: 91.5 },
            { reportSectionId: lekkiSec1.id, templateMetricId: "std-att-first-timers", metricName: "First Timers", calculationType: "SUM", monthlyGoal: 150, monthlyAchieved: 163, computedPercentage: 108.7 },
        ],
    });

    const lekkiSec2 = await prisma.reportSection.create({
        data: { reportId: "report-lekki-submitted", templateSectionId: "std-sal", sectionName: "Salvation" },
    });
    await prisma.reportMetric.create({
        data: { reportSectionId: lekkiSec2.id, templateMetricId: "std-sal-service", metricName: "Soul Saved in Service", calculationType: "SUM", monthlyGoal: 200, monthlyAchieved: 195, computedPercentage: 97.5, comment: "Strong altar call responses across all services." },
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
        { campusId: SEED_IDS.campuses.lekki, metrics: { "std-att-sun-male": 1200, "std-att-first-timers": 150, "std-sal-service": 200, "std-assim-workers": 350, "std-ng-att-stir": 600 } },
        { campusId: SEED_IDS.campuses.ikeja, metrics: { "std-att-sun-male": 900, "std-att-first-timers": 100, "std-sal-service": 140, "std-assim-workers": 240 } },
        { campusId: SEED_IDS.campuses.abuja, metrics: { "std-att-sun-male": 1000, "std-att-first-timers": 120, "std-sal-service": 160, "std-assim-workers": 280 } },
        { campusId: SEED_IDS.campuses.london, metrics: { "std-att-sun-male": 450, "std-att-first-timers": 50, "std-sal-service": 70, "std-assim-workers": 130 } },
    ];

    for (const def of campusGoalDefs) {
        const groupId = def.campusId === SEED_IDS.campuses.london ? SEED_IDS.groups.uk : SEED_IDS.groups.nigeria;
        for (const [metricId, target] of Object.entries(def.metrics)) {
            await prisma.goal.create({
                data: {
                    campusId: def.campusId,
                    orgGroupId: groupId,
                    templateId: SEED_IDS.templates.default,
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
