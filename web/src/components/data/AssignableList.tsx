"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataList, type DataListColumn } from "./DataList";

export type AssignableListProps<T> = {
  available: T[];
  assigned: T[];
  columns: DataListColumn<T>[];
  rowKey: (row: T) => string;

  availableTitle?: string;
  assignedTitle?: string;
  availableEmpty?: string;
  assignedEmpty?: string;

  onAssign: (ids: string[]) => Promise<void> | void;
  onUnassign: (ids: string[]) => Promise<void> | void;

  loading?: boolean;
  pageSize?: number;
  searchable?: boolean;
  description?: React.ReactNode;
};

export function AssignableList<T>({
  available,
  assigned,
  columns,
  rowKey,
  availableTitle = "Available",
  assignedTitle = "Assigned",
  availableEmpty = "Nothing available",
  assignedEmpty = "Nothing assigned yet",
  onAssign,
  onUnassign,
  loading,
  pageSize = 8,
  searchable = true,
  description,
}: AssignableListProps<T>) {
  const [availSel, setAvailSel] = useState<string[]>([]);
  const [assignSel, setAssignSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const assignDisabled = busy || availSel.length === 0;
  const unassignDisabled = busy || assignSel.length === 0;

  const handleAssign = async () => {
    if (assignDisabled) return;
    setBusy(true);
    try {
      await onAssign(availSel);
      setAvailSel([]);
    } finally {
      setBusy(false);
    }
  };
  const handleUnassign = async () => {
    if (unassignDisabled) return;
    setBusy(true);
    try {
      await onUnassign(assignSel);
      setAssignSel([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
        <Box sx={{ flex: 1 }}>
          <DataList
            title={`${availableTitle} (${available.length})`}
            rows={available}
            columns={columns}
            rowKey={rowKey}
            selectable
            selected={availSel}
            onSelectedChange={setAvailSel}
            loading={loading}
            emptyTitle={availableEmpty}
            pageSize={pageSize}
            searchable={searchable}
          />
        </Box>

        <Stack
          direction={{ xs: "row", lg: "column" }}
          spacing={1}
          alignSelf="center"
          sx={{ py: { lg: 2 } }}
        >
          <Tooltip title="Assign selected">
            <span>
              <IconButton
                color="primary"
                onClick={handleAssign}
                disabled={assignDisabled}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" },
                }}
              >
                <ArrowForwardIcon sx={{ display: { xs: "none", lg: "block" } }} />
                <ArrowBackIcon sx={{ display: { xs: "block", lg: "none" }, transform: "rotate(-90deg)" }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Unassign selected">
            <span>
              <IconButton
                onClick={handleUnassign}
                disabled={unassignDisabled}
                sx={{
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <ArrowBackIcon sx={{ display: { xs: "none", lg: "block" } }} />
                <ArrowForwardIcon sx={{ display: { xs: "block", lg: "none" }, transform: "rotate(-90deg)" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Box sx={{ flex: 1 }}>
          <DataList
            title={`${assignedTitle} (${assigned.length})`}
            rows={assigned}
            columns={columns}
            rowKey={rowKey}
            selectable
            selected={assignSel}
            onSelectedChange={setAssignSel}
            loading={loading}
            emptyTitle={assignedEmpty}
            pageSize={pageSize}
            searchable={searchable}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
