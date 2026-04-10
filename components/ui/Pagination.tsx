"use client";

import { Pagination as AntPagination, type PaginationProps } from "antd";
import { CONTENT } from "@/config/content";

interface DsPaginationProps extends PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export function Pagination({ total, page, pageSize, onPageChange, ...props }: DsPaginationProps) {
  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ds-text-secondary whitespace-nowrap">
          {CONTENT.common.pagination.showing} {Math.min((page - 1) * pageSize + 1, total)}–
          {Math.min(page * pageSize, total)} {CONTENT.common.pagination.of} {total}{" "}
          {CONTENT.common.pagination.results}
        </p>
        <div className="w-full overflow-x-auto sm:w-auto">
          <AntPagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            showSizeChanger
            pageSizeOptions={["10", "20", "50"]}
            responsive={false}
            {...props}
          />
        </div>
      </div>
    </div>
  );
}

export default Pagination;
