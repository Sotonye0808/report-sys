/**
 * Returns Prisma pagination arguments for report list queries.
 * When `all` is true, pagination is disabled by returning an empty object.
 */
export function resolveReportListPagination(query: { page: number; pageSize: number; all: boolean }) {
  if (query.all) {
    return {};
  }
  return {
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  };
}
