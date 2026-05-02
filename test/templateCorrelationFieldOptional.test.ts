import assert from "node:assert";
import { describe, it } from "node:test";

/**
 * Backward-compat smoke test: legacy template payloads (no `correlationGroup`,
 * no `recurrenceFrequency`, no `autoFillTitleTemplate`) must continue to
 * accept-validate against the relaxed PUT schema in
 * app/api/report-templates/[id]/route.ts.
 *
 * Done by re-implementing the relevant fields with the same Zod surface so
 * the test does not pull the route module (which transitively requires
 * the Prisma client + DATABASE_URL).
 */

import { z } from "zod";
import { MetricFieldType, MetricCalculationType, ReportPeriodType } from "../types/global.js";

const MetricSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    fieldType: z.nativeEnum(MetricFieldType).default(MetricFieldType.NUMBER),
    calculationType: z.nativeEnum(MetricCalculationType).default(MetricCalculationType.SUM),
    isRequired: z.boolean().default(true),
    capturesGoal: z.boolean().default(false),
    capturesAchieved: z.boolean().default(false),
    capturesYoY: z.boolean().default(false),
    correlationGroup: z.string().nullable().optional(),
    order: z.number().int().min(1),
});

const SectionSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    order: z.number().int().min(1),
    isRequired: z.boolean().default(true),
    correlationGroup: z.string().nullable().optional(),
    metrics: z.array(MetricSchema).min(1),
});

const UpdateTemplateSchema = z.object({
    name: z.string().min(1).optional(),
    recurrenceFrequency: z.nativeEnum(ReportPeriodType).nullable().optional(),
    recurrenceDays: z.array(z.number().int().min(0).max(6)).optional(),
    autoFillTitleTemplate: z.string().max(500).nullable().optional(),
    sections: z.array(SectionSchema).optional(),
});

describe("template PUT schema accepts legacy payloads", () => {
    it("parses a section/metric with no correlationGroup or recurrence fields", () => {
        const body = {
            name: "Legacy Template",
            sections: [
                {
                    name: "Attendance",
                    order: 1,
                    isRequired: true,
                    metrics: [
                        {
                            name: "Souls",
                            order: 1,
                            isRequired: true,
                            fieldType: "NUMBER" as const,
                            calculationType: "SUM" as const,
                            capturesGoal: true,
                            capturesAchieved: true,
                            capturesYoY: false,
                        },
                    ],
                },
            ],
        };
        const out = UpdateTemplateSchema.safeParse(body);
        assert.strictEqual(out.success, true, out.success ? "" : JSON.stringify(out.error.issues));
    });

    it("accepts explicit null correlationGroup (admin clears the value)", () => {
        const body = {
            sections: [
                {
                    name: "X",
                    order: 1,
                    isRequired: true,
                    correlationGroup: null,
                    metrics: [
                        {
                            name: "M",
                            order: 1,
                            isRequired: true,
                            fieldType: "NUMBER" as const,
                            calculationType: "SUM" as const,
                            capturesGoal: false,
                            capturesAchieved: true,
                            capturesYoY: false,
                            correlationGroup: null,
                        },
                    ],
                },
            ],
        };
        const out = UpdateTemplateSchema.safeParse(body);
        assert.strictEqual(out.success, true);
    });

    it("rejects out-of-range recurrenceDays (>6 weekday)", () => {
        const out = UpdateTemplateSchema.safeParse({ recurrenceDays: [0, 9] });
        assert.strictEqual(out.success, false);
    });

    it("accepts an explicit null recurrenceFrequency reset", () => {
        const out = UpdateTemplateSchema.safeParse({ recurrenceFrequency: null });
        assert.strictEqual(out.success, true);
    });
});
