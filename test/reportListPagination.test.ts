import assert from "node:assert";
import { describe, it } from "node:test";
import { resolveReportListPagination } from "../lib/utils/reportListPagination";

describe("reports list pagination", () => {
  it("disables skip/take when all=true", () => {
    assert.deepStrictEqual(resolveReportListPagination({ page: 3, pageSize: 20, all: true }), {});
  });

  it("uses skip/take when all=false", () => {
    assert.deepStrictEqual(resolveReportListPagination({ page: 3, pageSize: 20, all: false }), {
      skip: 40,
      take: 20,
    });
  });
});
