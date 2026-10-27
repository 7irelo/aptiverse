import type { ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<Row> = {
  id: string;
  header: string;
  cell: (row: Row) => ReactNode;
  /** Right-align numbers and money. */
  align?: "start" | "end";
  /** Hide this column in the stacked card view on small screens. */
  hideOnMobile?: boolean;
};

type DataTableProps<Row> = {
  /** Describes the table for screen readers, for example "Your payouts". */
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  /**
   * Column id used as the title of each card on small screens. Defaults to
   * the first column.
   */
  primaryColumn?: string;
  /** Row actions, shown in the last column and at the foot of each card. */
  actions?: (row: Row) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

/**
 * A table on md screens and up that collapses to stacked cards below md,
 * so rows stay readable at 360px without sideways scrolling. Works in Server
 * and Client Components: there is no state, just two layouts.
 */
export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowId,
  primaryColumn,
  actions,
  emptyTitle = "Nothing to show yet",
  emptyDescription,
  className,
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  const primary =
    columns.find((column) => column.id === primaryColumn) ?? columns[0];
  const secondary = columns.filter(
    (column) => column !== primary && !column.hideOnMobile,
  );

  return (
    <div className={className}>
      <ul aria-label={caption} className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li
            key={getRowId(row)}
            className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground"
          >
            <div className="text-base font-semibold">{primary.cell(row)}</div>
            {secondary.length > 0 ? (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {secondary.map((column) => (
                  <div key={column.id} className="contents">
                    <dt className="text-muted-foreground">{column.header}</dt>
                    <dd
                      className={cn(
                        "min-w-0 break-words",
                        column.align === "end" && "text-right tabular-nums",
                      )}
                    >
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {actions ? (
              <div className="flex flex-wrap gap-2 border-t pt-3">
                {actions(row)}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  scope="col"
                  className={cn("px-4", column.align === "end" && "text-right")}
                >
                  {column.header}
                </TableHead>
              ))}
              {actions ? (
                <TableHead scope="col" className="px-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      "px-4",
                      column.align === "end" && "text-right tabular-nums",
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
                {actions ? (
                  <TableCell className="px-4 text-right">
                    <div className="flex justify-end gap-2">{actions(row)}</div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
