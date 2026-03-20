import assert from "node:assert";
import { describe, it } from "node:test";
import { API_ROUTES } from "../config/routes.js";

describe("report update request flow routes", () => {
    it("uses correct API paths", () => {
        const id = "abcd1234-abcd-1234-abcd-1234567890ab";
        const base = API_ROUTES.reportUpdateRequests;

        assert.strictEqual(base.list, "/api/report-update-requests");
        assert.strictEqual(base.detail(id), `/api/report-update-requests/${id}`);
        assert.strictEqual(base.approve(id), `/api/report-update-requests/${id}/approve`);
        assert.strictEqual(base.reject(id), `/api/report-update-requests/${id}/reject`);
    });
});
