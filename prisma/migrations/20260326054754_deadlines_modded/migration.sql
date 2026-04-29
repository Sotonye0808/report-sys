-- automatically created to reconcile missing migration
-- this SQL is idempotent and matches already-applied schema changes
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reportdeadlinepolicy') THEN
        CREATE TYPE "ReportDeadlinePolicy" AS ENUM ('PERIOD_START','PERIOD_MIDDLE','PERIOD_END','AFTER_PERIOD_HOURS');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='report_templates' AND column_name='deadlinePolicy') THEN
        ALTER TABLE "report_templates"
            ADD COLUMN "deadlinePolicy" "ReportDeadlinePolicy" DEFAULT 'PERIOD_END';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='report_templates' AND column_name='deadlineOffsetHours') THEN
        ALTER TABLE "report_templates"
            ADD COLUMN "deadlineOffsetHours" INTEGER DEFAULT 48;
    END IF;
END $$;
