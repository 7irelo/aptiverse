"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import { EmptyState } from "@/components/common/EmptyState";

export type DataListColumn<T> = {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  width?: number | string;
  hideOn?: "xs" | "sm" | "md";
};

export type DataListProps<T> = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  rows: T[];
  columns: DataListColumn<T>[];
  rowKey: (row: T) => string;

  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;

  searchable?: boolean;
  searchKeys?: (keyof T | string)[];
  searchPlaceholder?: string;

  filters?: React.ReactNode;
  toolbarActions?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;

  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;

  onRowClick?: (row: T) => void;
  onRefresh?: () => void;

  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];

  dense?: boolean;
  bordered?: boolean;
};

export function DataList<T>({
  title,
  description,
  rows,
  columns,
  rowKey,
  loading,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon,
  emptyAction,
  searchable = true,
  searchKeys,
  searchPlaceholder = "Search…",
  filters,
  toolbarActions,
  rowActions,
  selectable,
  selected = [],
  onSelectedChange,
  onRowClick,
  onRefresh,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  dense,
  bordered = true,
}: DataListProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(pageSize);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let data = rows;
    if (search.trim() && searchable) {
      const needle = search.trim().toLowerCase();
      data = data.filter((row) => {
        const values: unknown[] = [];
        if (searchKeys && searchKeys.length) {
          for (const k of searchKeys) values.push((row as Record<string, unknown>)[k as string]);
        } else {
          for (const c of columns) {
            const v = c.render ? undefined : (row as Record<string, unknown>)[c.key];
            if (v != null) values.push(v);
            // Also push raw key if it's a property
            const raw = (row as Record<string, unknown>)[c.key];
            if (raw != null) values.push(raw);
          }
        }
        return values.some((v) => String(v ?? "").toLowerCase().includes(needle));
      });
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        data = [...data].sort((a, b) => {
          const av = col.sortValue
            ? col.sortValue(a)
            : (a as Record<string, unknown>)[col.key] as string | number;
          const bv = col.sortValue
            ? col.sortValue(b)
            : (b as Record<string, unknown>)[col.key] as string | number;
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return data;
  }, [rows, search, searchKeys, searchable, columns, sortKey, sortDir]);

  const paginated = useMemo(() => {
    if (!pagination) return filtered;
    const start = page * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage, pagination]);

  const allSelected =
    selectable && filtered.length > 0 && filtered.every((r) => selected.includes(rowKey(r)));
  const someSelected =
    selectable && filtered.some((r) => selected.includes(rowKey(r))) && !allSelected;

  const toggleAll = () => {
    if (!onSelectedChange) return;
    if (allSelected) onSelectedChange(selected.filter((id) => !filtered.some((r) => rowKey(r) === id)));
    else onSelectedChange([...new Set([...selected, ...filtered.map((r) => rowKey(r))])]);
  };

  const toggleOne = (id: string) => {
    if (!onSelectedChange) return;
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const visibleColumns = columns;

  const showToolbar = title || description || searchable || filters || toolbarActions || onRefresh;

  return (
    <Card sx={{ overflow: "hidden", border: bordered ? 1 : 0, borderColor: "divider" }}>
      {showToolbar && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            {(title || description) && (
              <Box sx={{ minWidth: 0 }}>
                {title && (
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {title}
                  </Typography>
                )}
                {description && (
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                )}
              </Box>
            )}

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {searchable && (
                <TextField
                  size="small"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder={searchPlaceholder}
                  sx={{ minWidth: { xs: "100%", sm: 240 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch("")}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              )}
              {filters && (
                <Tooltip title={filtersOpen ? "Hide filters" : "Show filters"}>
                  <IconButton onClick={() => setFiltersOpen((o) => !o)} color={filtersOpen ? "primary" : "default"}>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton onClick={onRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
              {toolbarActions}
            </Stack>
          </Stack>
          {filtersOpen && filters && <Box sx={{ pt: 2 }}>{filters}</Box>}
        </Box>
      )}

      {loading ? (
        <Box sx={{ p: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={48} sx={{ my: 0.5 }} />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} action={emptyAction} />
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size={dense ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox checked={!!allSelected} indeterminate={someSelected} onChange={toggleAll} />
                  </TableCell>
                )}
                {visibleColumns.map((c) => (
                  <TableCell
                    key={c.key}
                    align={c.align}
                    sx={{
                      width: c.width,
                      fontWeight: 600,
                      display: c.hideOn ? { [c.hideOn]: "none", md: "table-cell" } : undefined,
                      whiteSpace: "nowrap",
                      bgcolor: "action.hover",
                    }}
                  >
                    {c.sortable ? (
                      <TableSortLabel
                        active={sortKey === c.key}
                        direction={sortKey === c.key ? sortDir : "asc"}
                        onClick={() => {
                          if (sortKey === c.key) {
                            setSortDir(sortDir === "asc" ? "desc" : "asc");
                          } else {
                            setSortKey(c.key);
                            setSortDir("asc");
                          }
                        }}
                      >
                        {c.header}
                      </TableSortLabel>
                    ) : (
                      c.header
                    )}
                  </TableCell>
                ))}
                {rowActions && <TableCell align="right" sx={{ bgcolor: "action.hover" }} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row) => {
                const id = rowKey(row);
                const isSelected = selected.includes(id);
                return (
                  <TableRow
                    key={id}
                    hover
                    selected={isSelected}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{ cursor: onRowClick ? "pointer" : "default" }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={() => toggleOne(id)} />
                      </TableCell>
                    )}
                    {visibleColumns.map((c) => (
                      <TableCell
                        key={c.key}
                        align={c.align}
                        sx={{
                          display: c.hideOn ? { [c.hideOn]: "none", md: "table-cell" } : undefined,
                        }}
                      >
                        {c.render
                          ? c.render(row)
                          : (row as Record<string, React.ReactNode>)[c.key] ?? "—"}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      {pagination && filtered.length > 0 && (
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={perPage}
          onRowsPerPageChange={(e) => {
            setPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={pageSizeOptions}
        />
      )}
    </Card>
  );
}
