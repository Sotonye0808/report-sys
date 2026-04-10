import assert from "node:assert";
import { describe, it } from "node:test";
import { canTransition } from "../modules/reports/services/reportWorkflowUtils";
import { UserRole, ReportStatus } from "../types/global.js";

describe("reportWorkflow canTransition", () => {
    it("allows DRAFT to SUBMITTED for valid roles", () => {
        assert.strictEqual(canTransition(ReportStatus.DRAFT, ReportStatus.SUBMITTED, UserRole.CAMPUS_ADMIN), true);
        assert.strictEqual(canTransition(ReportStatus.DRAFT, ReportStatus.SUBMITTED, UserRole.DATA_ENTRY), true);
        assert.strictEqual(canTransition(ReportStatus.DRAFT, ReportStatus.SUBMITTED, UserRole.SUPERADMIN), true);
    });

    it("allows REQUIRES_EDITS to SUBMITTED for superadmin", () => {
        assert.strictEqual(canTransition(ReportStatus.REQUIRES_EDITS, ReportStatus.SUBMITTED, UserRole.SUPERADMIN), true);
    });

    it("disallows invalid transitions", () => {
        assert.strictEqual(canTransition(ReportStatus.APPROVED, ReportStatus.DRAFT, UserRole.SUPERADMIN), false);
    });
});
