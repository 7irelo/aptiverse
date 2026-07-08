"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import TableRowsIcon from "@mui/icons-material/TableRowsOutlined";
import ViewAgendaIcon from "@mui/icons-material/ViewAgendaOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { GroupedList } from "@/components/common/GroupedList";
import { StatusChip } from "@/components/common/StatusChip";
import { QueryStates } from "@/components/common/QueryStates";
import { useAssessments, useAcademicUnits, type AcademicUnit } from "@/lib/api/queries";
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_STATUS_LABELS,
  type Assessment,
} from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { RelativeTime } from "@/components/common/RelativeTime";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import dayjs from "dayjs";
import Link from "next/link";

export default function AssessmentsPage() {
  const assessmentsQuery = useAssessments();
  const academic = useAcademicUnits();

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Assessments"
        description="Every SBA, test, project and exam. Schedule, weighting, and predicted vs actual marks."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assessments" }]}
        actions={
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} component={Link} href="/dashboard/assessments/new">
            Add SBA
          </Button>
        }
      />

      <QueryStates
        query={assessmentsQuery}
        empty={{
          icon: <AssignmentIcon />,
          title: "No assessments yet",
          description: "Add an SBA, test, or project so we can plan the lead-up and predict your mark.",
          action: (
            <Button variant="contained" startIcon={<AddIcon />} component={Link} href="/dashboard/assessments/new">
              Add an SBA
            </Button>
          ),
        }}
      >
        {(assessments) => (
          <AssessmentsList
            assessments={assessments}
            units={academic.units}
            unitNoun={academic.unitNoun}
            unitNounPlural={academic.unitNounPlural}
          />
        )}
      </QueryStates>
    </AtmosphericBackdrop>
  );
}

function AssessmentsList({
  assessments,
  units,
  unitNoun,
  unitNounPlural,
}: {
  assessments: Assessment[];
  units: AcademicUnit[];
  unitNoun: string;
  unitNounPlural: string;
}) {
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "grouped">("table");

  const Noun = unitNoun.charAt(0).toUpperCase() + unitNoun.slice(1);

  const filtered = assessments.filter(
    (a) =>
      (unitFilter === "all" || a.subjectId === unitFilter) &&
      (statusFilter === "all" || a.status === statusFilter),
  );

  const unitName = (id: string) => units.find((u) => u.id === id)?.name ?? "Other";

  const filterControls = (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <TextField select size="small" label={Noun} value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="all">All {unitNounPlural}</MenuItem>
        {units.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {u.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="all">All statuses</MenuItem>
        {(Object.entries(ASSESSMENT_STATUS_LABELS) as [keyof typeof ASSESSMENT_STATUS_LABELS, string][]).map(([k, v]) => (
          <MenuItem key={k} value={k}>
            {v}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", justifyContent: "space-between" }}>
        {filterControls}
        <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)} aria-label="View">
          <ToggleButton value="table" aria-label="Table view">
            <TableRowsIcon fontSize="small" sx={{ mr: 0.5 }} />
            Table
          </ToggleButton>
          <ToggleButton value="grouped" aria-label={`Grouped by ${unitNoun}`}>
            <ViewAgendaIcon fontSize="small" sx={{ mr: 0.5 }} />
            By {unitNoun}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === "grouped" ? (
        filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No assessments match these filters.
            </Typography>
          </Box>
        ) : (
          <GroupedList
            items={[...filtered].sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))}
            groupBy={(a) => unitName(a.subjectId)}
            renderItem={(a) => <AssessmentGroupRow a={a} />}
          />
        )
      ) : (
        <DataList
          rows={filtered}
          rowKey={(r) => r.id}
          searchPlaceholder="Search assessments…"
          columns={[
            {
              key: "title",
              header: "Title",
              sortable: true,
              render: (r) => (
                <Stack>
                  <Typography sx={{ fontWeight: 500 }}>{r.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {unitName(r.subjectId)}
                  </Typography>
                </Stack>
              ),
            },
            { key: "type", header: "Type", sortable: true, render: (r) => ASSESSMENT_TYPE_LABELS[r.type] ?? r.type },
            {
              key: "weight",
              header: "Weight",
              sortable: true,
              align: "right",
              sortValue: (r) => r.weight,
              render: (r) => `${r.weight}%`,
            },
            {
              key: "dueDate",
              header: "Due",
              sortable: true,
              sortValue: (r) => +new Date(r.dueDate),
              render: (r) => (
                <Stack>
                  <Typography variant="body2">{formatDate(r.dueDate)}</Typography>
                  <Typography variant="caption" color={dayjs(r.dueDate).diff(dayjs(), "day") < 7 ? "warning.main" : "text.secondary"}>
                    <RelativeTime iso={r.dueDate} />
                  </Typography>
                </Stack>
              ),
            },
            {
              key: "predictedMark",
              header: "Prediction",
              render: (r) =>
                r.predictedMark != null ? (
                  <Stack sx={{ minWidth: 120 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.predictedMark}%
                    </Typography>
                    <LinearProgress variant="determinate" value={r.predictedMark} sx={{ height: 6, borderRadius: 999, mt: 0.5 }} color="primary" />
                  </Stack>
                ) : (
                  "–"
                ),
            },
            {
              key: "actualMark",
              header: "Mark",
              render: (r) => (r.actualMark != null ? `${r.actualMark}%` : "–"),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <StatusChip
                  kind={r.status === "graded" ? "success" : r.status === "in_progress" ? "info" : r.status === "submitted" ? "primary" : "neutral"}
                  label={ASSESSMENT_STATUS_LABELS[r.status] ?? r.status}
                />
              ),
            },
          ]}
          rowActions={(r) => (
            <Button component={Link} href={`/dashboard/assessments/${r.id}`} size="small" variant="outlined">
              Open
            </Button>
          )}
        />
      )}
    </Stack>
  );
}

function AssessmentGroupRow({ a }: { a: Assessment }) {
  const kind =
    a.status === "graded"
      ? "success"
      : a.status === "in_progress"
      ? "info"
      : a.status === "submitted"
      ? "primary"
      : "neutral";
  return (
    <Box
      component={Link}
      href={`/dashboard/assessments/${a.id}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        width: "100%",
        minWidth: 0,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 500 }}>
          {a.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {ASSESSMENT_TYPE_LABELS[a.type] ?? a.type} · {a.weight}%
        </Typography>
      </Box>
      {a.actualMark != null ? (
        <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
          {a.actualMark}%
        </Typography>
      ) : a.predictedMark != null ? (
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          ~{a.predictedMark}%
        </Typography>
      ) : null}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ flexShrink: 0, display: { xs: "none", sm: "block" } }}
      >
        {formatDate(a.dueDate)}
      </Typography>
      <StatusChip kind={kind} label={ASSESSMENT_STATUS_LABELS[a.status] ?? a.status} />
    </Box>
  );
}
