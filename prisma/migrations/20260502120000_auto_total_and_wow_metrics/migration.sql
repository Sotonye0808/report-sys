-- Auto-total metric type + Week-on-Week comparison.
-- Strictly additive. No DROP, no RENAME. Apply with `prisma migrate deploy`.

ALTER TABLE "report_template_metrics"
    ADD COLUMN IF NOT EXISTS "isAutoTotal" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "report_template_metrics"
    ADD COLUMN IF NOT EXISTS "autoTotalSourceMetricIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "report_template_metrics"
    ADD COLUMN IF NOT EXISTS "autoTotalScope" TEXT DEFAULT 'SECTION';

ALTER TABLE "report_template_metrics"
    ADD COLUMN IF NOT EXISTS "capturesWoW" BOOLEAN NOT NULL DEFAULT false;
