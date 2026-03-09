-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'SPO', 'CEO', 'CHURCH_MINISTRY', 'GROUP_PASTOR', 'GROUP_ADMIN', 'CAMPUS_PASTOR', 'CAMPUS_ADMIN', 'DATA_ENTRY', 'MEMBER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REQUIRES_EDITS', 'APPROVED', 'REVIEWED', 'LOCKED');

-- CreateEnum
CREATE TYPE "ReportPeriodType" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "MetricFieldType" AS ENUM ('NUMBER', 'PERCENTAGE', 'TEXT', 'CURRENCY');

-- CreateEnum
CREATE TYPE "MetricCalculationType" AS ENUM ('SUM', 'AVERAGE', 'SNAPSHOT');

-- CreateEnum
CREATE TYPE "ReportEventType" AS ENUM ('CREATED', 'SUBMITTED', 'EDIT_REQUESTED', 'EDIT_SUBMITTED', 'EDIT_APPROVED', 'EDIT_REJECTED', 'EDIT_APPLIED', 'APPROVED', 'REVIEWED', 'LOCKED', 'DEADLINE_PASSED', 'UPDATE_REQUESTED', 'UPDATE_APPROVED', 'UPDATE_REJECTED', 'DATA_ENTRY_CREATED', 'TEMPLATE_VERSION_NOTE', 'AUTO_APPROVED');

-- CreateEnum
CREATE TYPE "ReportEditStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportUpdateRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REPORT_SUBMITTED', 'REPORT_EDIT_REQUESTED', 'REPORT_APPROVED', 'REPORT_REVIEWED', 'REPORT_LOCKED', 'REPORT_EDIT_SUBMITTED', 'REPORT_EDIT_APPROVED', 'REPORT_EDIT_REJECTED', 'REPORT_UPDATE_REQUESTED', 'REPORT_UPDATE_APPROVED', 'REPORT_UPDATE_REJECTED', 'REPORT_DEADLINE_REMINDER', 'GOAL_UNLOCK_REQUESTED', 'GOAL_UNLOCK_APPROVED', 'GOAL_UNLOCK_REJECTED');

-- CreateEnum
CREATE TYPE "GoalMode" AS ENUM ('ANNUAL', 'MONTHLY', 'CAMPUS_OVERRIDE');

-- CreateEnum
CREATE TYPE "GoalEditRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InviteLinkType" AS ENUM ('CAMPUS', 'GROUP', 'DIRECT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "gender" "Gender",
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "campusId" TEXT,
    "orgGroupId" TEXT,
    "avatar" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT NOT NULL,
    "leaderId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT NOT NULL,
    "adminId" TEXT,
    "country" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "memberCount" INTEGER DEFAULT 0,
    "inviteCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_templates" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "campusId" TEXT,
    "orgGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_template_sections" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "report_template_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_template_metrics" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fieldType" "MetricFieldType" NOT NULL DEFAULT 'NUMBER',
    "calculationType" "MetricCalculationType" NOT NULL DEFAULT 'SUM',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "order" INTEGER NOT NULL,
    "capturesGoal" BOOLEAN NOT NULL DEFAULT false,
    "capturesAchieved" BOOLEAN NOT NULL DEFAULT false,
    "capturesYoY" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "report_template_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_template_versions" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "report_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "title" TEXT,
    "templateId" TEXT NOT NULL,
    "templateVersionId" TEXT,
    "campusId" TEXT NOT NULL,
    "orgGroupId" TEXT NOT NULL,
    "period" TEXT,
    "periodType" "ReportPeriodType" NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER,
    "periodWeek" INTEGER,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "submittedById" TEXT,
    "reviewedById" TEXT,
    "approvedById" TEXT,
    "deadline" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "isDataEntry" BOOLEAN NOT NULL DEFAULT false,
    "dataEntryById" TEXT,
    "dataEntryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_sections" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "templateSectionId" TEXT NOT NULL,
    "sectionName" TEXT NOT NULL,

    CONSTRAINT "report_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_metrics" (
    "id" TEXT NOT NULL,
    "reportSectionId" TEXT NOT NULL,
    "templateMetricId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "calculationType" "MetricCalculationType" NOT NULL DEFAULT 'SUM',
    "monthlyGoal" DOUBLE PRECISION,
    "monthlyAchieved" DOUBLE PRECISION,
    "yoyGoal" DOUBLE PRECISION,
    "computedPercentage" DOUBLE PRECISION,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "comment" TEXT,

    CONSTRAINT "report_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_edits" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "status" "ReportEditStatus" NOT NULL DEFAULT 'DRAFT',
    "reason" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_edits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_update_requests" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "status" "ReportUpdateRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_update_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_events" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "eventType" "ReportEventType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT,
    "previousStatus" "ReportStatus",
    "newStatus" "ReportStatus",
    "snapshotId" TEXT,

    CONSTRAINT "report_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_versions" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "report_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "orgGroupId" TEXT,
    "templateId" TEXT,
    "templateMetricId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "mode" "GoalMode" NOT NULL DEFAULT 'ANNUAL',
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_edit_requests" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "proposedValue" DOUBLE PRECISION NOT NULL,
    "status" "GoalEditRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_edit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_entries" (
    "id" TEXT NOT NULL,
    "reportMetricId" TEXT,
    "templateMetricId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "goalValue" DOUBLE PRECISION,
    "achievedValue" DOUBLE PRECISION,
    "comment" TEXT,
    "computedPercentage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "relatedId" TEXT,
    "reportId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "InviteLinkType" NOT NULL,
    "targetId" TEXT,
    "targetRole" "UserRole",
    "campusId" TEXT,
    "groupId" TEXT,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_campusId_idx" ON "users"("campusId");

-- CreateIndex
CREATE INDEX "users_orgGroupId_idx" ON "users"("orgGroupId");

-- CreateIndex
CREATE INDEX "campuses_parentId_idx" ON "campuses"("parentId");

-- CreateIndex
CREATE INDEX "report_template_sections_templateId_idx" ON "report_template_sections"("templateId");

-- CreateIndex
CREATE INDEX "report_template_metrics_sectionId_idx" ON "report_template_metrics"("sectionId");

-- CreateIndex
CREATE INDEX "report_template_versions_templateId_idx" ON "report_template_versions"("templateId");

-- CreateIndex
CREATE INDEX "reports_campusId_idx" ON "reports"("campusId");

-- CreateIndex
CREATE INDEX "reports_orgGroupId_idx" ON "reports"("orgGroupId");

-- CreateIndex
CREATE INDEX "reports_templateId_idx" ON "reports"("templateId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_periodYear_periodMonth_idx" ON "reports"("periodYear", "periodMonth");

-- CreateIndex
CREATE INDEX "report_sections_reportId_idx" ON "report_sections"("reportId");

-- CreateIndex
CREATE INDEX "report_metrics_reportSectionId_idx" ON "report_metrics"("reportSectionId");

-- CreateIndex
CREATE INDEX "report_metrics_templateMetricId_idx" ON "report_metrics"("templateMetricId");

-- CreateIndex
CREATE INDEX "report_edits_reportId_idx" ON "report_edits"("reportId");

-- CreateIndex
CREATE INDEX "report_update_requests_reportId_idx" ON "report_update_requests"("reportId");

-- CreateIndex
CREATE INDEX "report_events_reportId_idx" ON "report_events"("reportId");

-- CreateIndex
CREATE INDEX "report_events_eventType_idx" ON "report_events"("eventType");

-- CreateIndex
CREATE INDEX "report_versions_reportId_idx" ON "report_versions"("reportId");

-- CreateIndex
CREATE INDEX "goals_campusId_templateMetricId_year_idx" ON "goals"("campusId", "templateMetricId", "year");

-- CreateIndex
CREATE INDEX "goal_edit_requests_goalId_idx" ON "goal_edit_requests"("goalId");

-- CreateIndex
CREATE INDEX "metric_entries_campusId_templateMetricId_year_month_idx" ON "metric_entries"("campusId", "templateMetricId", "year", "month");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "invite_links_token_key" ON "invite_links"("token");

-- CreateIndex
CREATE INDEX "invite_links_token_idx" ON "invite_links"("token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgGroupId_fkey" FOREIGN KEY ("orgGroupId") REFERENCES "org_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_groups" ADD CONSTRAINT "org_groups_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "org_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_template_sections" ADD CONSTRAINT "report_template_sections_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_template_metrics" ADD CONSTRAINT "report_template_metrics_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "report_template_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_template_versions" ADD CONSTRAINT "report_template_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_template_versions" ADD CONSTRAINT "report_template_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_orgGroupId_fkey" FOREIGN KEY ("orgGroupId") REFERENCES "org_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_dataEntryById_fkey" FOREIGN KEY ("dataEntryById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_sections" ADD CONSTRAINT "report_sections_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_metrics" ADD CONSTRAINT "report_metrics_reportSectionId_fkey" FOREIGN KEY ("reportSectionId") REFERENCES "report_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_metrics" ADD CONSTRAINT "report_metrics_templateMetricId_fkey" FOREIGN KEY ("templateMetricId") REFERENCES "report_template_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_metrics" ADD CONSTRAINT "report_metrics_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_edits" ADD CONSTRAINT "report_edits_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_edits" ADD CONSTRAINT "report_edits_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_edits" ADD CONSTRAINT "report_edits_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_update_requests" ADD CONSTRAINT "report_update_requests_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_update_requests" ADD CONSTRAINT "report_update_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_update_requests" ADD CONSTRAINT "report_update_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_events" ADD CONSTRAINT "report_events_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_events" ADD CONSTRAINT "report_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_versions" ADD CONSTRAINT "report_versions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_versions" ADD CONSTRAINT "report_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_orgGroupId_fkey" FOREIGN KEY ("orgGroupId") REFERENCES "org_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_templateMetricId_fkey" FOREIGN KEY ("templateMetricId") REFERENCES "report_template_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_edit_requests" ADD CONSTRAINT "goal_edit_requests_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_edit_requests" ADD CONSTRAINT "goal_edit_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_edit_requests" ADD CONSTRAINT "goal_edit_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_entries" ADD CONSTRAINT "metric_entries_templateMetricId_fkey" FOREIGN KEY ("templateMetricId") REFERENCES "report_template_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_entries" ADD CONSTRAINT "metric_entries_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
