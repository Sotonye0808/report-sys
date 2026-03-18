/*
  Warnings:

  - A unique constraint covering the columns `[campusId,templateMetricId,year,mode,month]` on the table `goals` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "goals_campusId_templateMetricId_year_mode_month_key" ON "goals"("campusId", "templateMetricId", "year", "mode", "month");
