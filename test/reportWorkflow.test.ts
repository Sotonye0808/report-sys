import assert from "node:assert";
import { describe, it } from "node:test";
import { appendWorkflowNote, canTransition } from "../modules/reports/services/reportWorkflowUtils";
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

describe("reportWorkflow appendWorkflowNote", () => {
    it("appends edit note context without removing existing notes", () => {
        const next = appendWorkflowNote("Original note", "Please update metric total", "Edit Requested");
        assert.strictEqual(next, "Original note\n\n(Edit Requested) Please update metric total");
    });

    it("returns existing notes unchanged for empty update note", () => {
        const next = appendWorkflowNote("Original note", "   ", "Edit Requested");
        assert.strictEqual(next, "Original note");
    });
});
