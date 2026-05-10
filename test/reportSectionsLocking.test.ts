import assert from "node:assert";
import { describe, it } from "node:test";
import {
    buildSectionsPayload,
    parseSectionsToMetricValues,
    type MetricValues,
} from "../modules/reports/components/ReportSectionsForm";

describe("report sections metric locking", () => {
    it("parses locked state from persisted report sections", () => {
        const values = parseSectionsToMetricValues([
            {
                templateSectionId: "sec-1",
                metrics: [
                    {
                        templateMetricId: "metric-1",
                        monthlyAchieved: 12,
                        isLocked: true,
                    },
                ],
            },
        ]);

        assert.equal(values["metric-1"]?.monthlyAchieved, 12);
        assert.equal(values["metric-1"]?.isLocked, true);
    });

    it("preserves locked state when building update payload", () => {
        const template = {
            sections: [
                {
                    id: "sec-1",
                    name: "Section",
                    order: 1,
                    metrics: [
                        {
                            id: "metric-1",
                            name: "Metric",
                            order: 1,
                            calculationType: "SUM",
                        },
                    ],
                },
            ],
        } as unknown as ReportTemplate;

        const metricValues: Record<string, MetricValues> = {
            "metric-1": {
                monthlyAchieved: 44,
                isLocked: true,
            },
        };

        const sections = buildSectionsPayload(template, metricValues);
        assert.equal(sections[0]?.metrics[0]?.templateMetricId, "metric-1");
        assert.equal(sections[0]?.metrics[0]?.monthlyAchieved, 44);
        assert.equal(sections[0]?.metrics[0]?.isLocked, true);
    });
});

