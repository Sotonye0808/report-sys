/**
 * components/ui/Table.tsx
 * Generic typed table wrapper with empty-state and loading built in.
 */

import { Table as AntTable, type TableProps as AntTableProps } from "antd";
import { EmptyState } from "./EmptyState";
import { CONTENT } from "@/config/content";

interface TableProps<T extends object> extends AntTableProps<T> {
  emptyTitle?: string;
  emptyDescription?: string;
}

export function Table<T extends object>({
  emptyTitle,
  emptyDescription,
  locale,
  scroll,
  ...props
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <AntTable<T>
        locale={{
          emptyText: (
            <EmptyState
              title={emptyTitle ?? CONTENT.common.noResultsTitle}
              description={emptyDescription ?? CONTENT.common.noResultsDescription}
            />
          ),
          ...locale,
        }}
        scroll={{ x: "max-content", ...scroll }}
        pagination={
          props.pagination === false
            ? false
            : {
                showSizeChanger: true,
                showTotal: (total, [start, end]) =>
                  `${CONTENT.common.pagination.showing} ${start} ${CONTENT.common.pagination.to} ${end} ${CONTENT.common.pagination.of} ${total} ${CONTENT.common.pagination.results}`,
                ...((props.pagination as object) ?? {}),
              }
        }
        {...props}
      />
    </div>
  );
}

export default Table;
