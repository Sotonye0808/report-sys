-- CreateEnum
CREATE TYPE "BugReportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "BugReportCategory" AS ENUM ('UI_DISPLAY', 'NAVIGATION', 'DATA_ISSUE', 'PERFORMANCE', 'AUTHENTICATION', 'REPORT_SUBMISSION', 'NOTIFICATION', 'OTHER');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'OFFICE_OF_CEO';

-- CreateTable
CREATE TABLE "bug_reports" (
    "id" TEXT NOT NULL,
    "category" "BugReportCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "contactEmail" TEXT NOT NULL,
    "status" "BugReportStatus" NOT NULL DEFAULT 'OPEN',
    "adminNotes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bug_reports_status_idx" ON "bug_reports"("status");

-- CreateIndex
CREATE INDEX "bug_reports_createdById_idx" ON "bug_reports"("createdById");

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
