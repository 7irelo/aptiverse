"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { alpha } from "@mui/material/styles";
import {
  Plus,
  ClipboardList,
  AlertTriangle,
  CalendarClock,
  Hourglass,
  Rows3,
  LayoutList,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { GroupedList } from "@/components/common/GroupedList";
import { StatusChip } from "@/components/common/StatusChip";
import { QueryStates } from "@/components/common/QueryStates";
import {
  useAssessments,
  useAcademicUnits,
  useTermPredictions,
  type AcademicUnit,
  type TermPrediction,
} from "@/lib/api/queries";
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_STATUS_LABELS,
  type Assessment,
  type AssessmentStatus,
} from "@/lib/mockData";
import { formatDate, prettifyUnitId } from "@/lib/format";
import { useStudyVocabulary } from "@/lib/hooks/useStudyVocabulary";
import { RelativeTime } from "@/components/common/RelativeTime";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { statusKind, isOpen, QuickSubmitButton } from "./AssessmentLifecycle";
import dayjs from "dayjs";
import Link from "next/link";

// Days-out is the spine of this page: an assessment is urgent or it is not,
// and the student should not have to read a date column and do the subtraction
// themselves. One helper so every surface agrees on the boundary.
const daysUntil = (iso: string) => dayjs(iso).startOf("day").diff(dayjs().startOf("day"), "day");

export default function AssessmentsPage() {
  const assessmentsQuery = useAssessments();
  const academic = useAcademicUnits();
  const predictionsQuery = useTermPredictions();

  // "SBA" (school-based assessment) is CAPS high-school language. Tertiary
  // students just have "assessments", so the calls to action follow the
  // education level the same way the course/subject wording does.
  const vocab = useStudyVocabulary();
  const isTertiary = vocab.isTertiary;
  const addLabel = isTertiary ? "Add assessment" : "Add SBA";
  const description = isTertiary
    ? "Every test, essay, project and exam. What is due, what is waiting on a mark, and where you stand."
    : "Every SBA, test, project and exam. What is due, what is waiting on a mark, and where you stand.";

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Assessments"
        description={description}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assessments" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Plus size={18} />}
            component={Link}
            href="/dashboard/assessments/new"
          >
            {addLabel}
          </Button>
        }
      />

      <QueryStates
        query={assessmentsQuery}
        empty={{
          icon: <ClipboardList />,
          title: "No assessments yet",
          description: isTertiary
            ? "Log an assessment, test, or project and this page tracks the run-up: what is due, what you have handed in, and what it does to your semester mark."
            : "Log an SBA, test, or project and this page tracks the run-up: what is due, what you have handed in, and what it does to your term mark.",
          action: (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Plus size={18} />}
              component={Link}
              href="/dashboard/assessments/new"
            >
              {addLabel}
            </Button>
          ),
        }}
      >
        {(assessments) => (
          <AssessmentsView
            assessments={assessments}
            units={academic.units}
            unitNoun={academic.unitNoun}
            unitNounPlural={academic.unitNounPlural}
            predictions={predictionsQuery.data ?? []}
          />
        )}
      </QueryStates>
    </AtmosphericBackdrop>
  );
}

function AssessmentsView({
  assessments,
  units,
  unitNoun,
  unitNounPlural,
  predictions,
}: {
  assessments: Assessment[];
  units: AcademicUnit[];
  unitNoun: string;
  unitNounPlural: string;
  predictions: TermPrediction[];
}) {
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "grouped">("table");

  const Noun = unitNoun.charAt(0).toUpperCase() + unitNoun.slice(1);

  // `units` is keyed by the same id an assessment stores in subjectId: a CAPS
  // subject slug for high-school, a course practiceKey for tertiary. Resolving
  // through the unit list rather than a subjects-only lookup is what keeps this
  // working for university students. prettifyUnitId is the last line of defence
  // so a student never reads a raw key like "uct:calculus-i" off the page.
  const unitName = (id: string) => units.find((u) => u.id === id)?.name ?? prettifyUnitId(id);

  // Every count below is a filter over real rows. Nothing here is modelled,
  // estimated, or padded: if a bucket is empty the tile reads 0 and the
  // attention rail simply does not render.
  const counts = useMemo(() => {
    const open = assessments.filter(isOpen);
    return {
      overdue: open.filter((a) => daysUntil(a.dueDate) < 0).length,
      dueSoon: open.filter((a) => {
        const d = daysUntil(a.dueDate);
        return d >= 0 && d <= 7;
      }).length,
      awaitingMark: assessments.filter((a) => a.status === "submitted" && a.actualMark == null).length,
      graded: assessments.filter((a) => a.actualMark != null).length,
    };
  }, [assessments]);

  // The attention rail answers "what next". Overdue first, then soonest.
  // Anything handed in or marked is deliberately excluded: it needs nothing.
  const attention = useMemo(
    () =>
      assessments
        .filter((a) => isOpen(a) && daysUntil(a.dueDate) <= 7)
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate)),
    [assessments],
  );

  const filtered = assessments.filter(
    (a) =>
      (unitFilter === "all" || a.subjectId === unitFilter) &&
      (statusFilter === "all" || a.status === statusFilter),
  );

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Overview label="Overdue" value={counts.overdue} icon={<AlertTriangle size={18} />} tone="warning" />
        <Overview label="Due in 7 days" value={counts.dueSoon} icon={<CalendarClock size={18} />} tone="default" />
        <Overview label="Awaiting mark" value={counts.awaitingMark} icon={<Hourglass size={18} />} tone="default" />
        <Overview label="Marked" value={counts.graded} icon={<ClipboardList size={18} />} tone="default" />
      </Grid>

      {attention.length > 0 && (
        <AttentionRail items={attention} unitName={unitName} />
      )}

      <Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              select
              size="small"
              label={Noun}
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All {unitNounPlural}</MenuItem>
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All statuses</MenuItem>
              {(
                Object.entries(ASSESSMENT_STATUS_LABELS) as [AssessmentStatus, string][]
              ).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  {v}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={view}
            onChange={(_, v) => v && setView(v)}
            aria-label="View"
          >
            <ToggleButton value="table" aria-label="Table view">
              <Rows3 size={15} style={{ marginRight: 6 }} />
              Table
            </ToggleButton>
            <ToggleButton value="grouped" aria-label={`Grouped by ${unitNoun}`}>
              <LayoutList size={15} style={{ marginRight: 6 }} />
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
              groupSummary={(_, items) => (
                <UnitSummary items={items} predictions={predictions} />
              )}
              renderItem={(a) => <AssessmentGroupRow a={a} />}
            />
          )
        ) : (
          <DataList
            rows={filtered}
            rowKey={(r) => r.id}
            searchPlaceholder="Search assessments"
            columns={[
              {
                key: "title",
                header: "Title",
                sortable: true,
                render: (r) => (
                  <Stack>
                    <Typography sx={{ fontWeight: 500 }}>{r.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {unitName(r.subjectId)} · {ASSESSMENT_TYPE_LABELS[r.type] ?? r.type}
                    </Typography>
                  </Stack>
                ),
              },
              {
                key: "weight",
                header: "Weight",
                sortable: true,
                align: "right",
                sortValue: (r) => r.weight,
                render: (r) => (
                  <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {r.weight}%
                  </Typography>
                ),
              },
              {
                key: "dueDate",
                header: "Due",
                sortable: true,
                sortValue: (r) => +new Date(r.dueDate),
                render: (r) => <DueCell a={r} />,
              },
              {
                key: "actualMark",
                header: "Mark",
                align: "right",
                sortable: true,
                sortValue: (r) => r.actualMark ?? -1,
                render: (r) => <MarkCell a={r} />,
              },
              {
                key: "status",
                header: "Status",
                render: (r) => (
                  <StatusChip
                    kind={statusKind(r.status)}
                    label={ASSESSMENT_STATUS_LABELS[r.status] ?? r.status}
                  />
                ),
              },
            ]}
            rowActions={(r) => (
              <Button
                component={Link}
                href={`/dashboard/assessments/${r.id}`}
                size="small"
                variant="outlined"
                color="inherit"
              >
                Open
              </Button>
            )}
          />
        )}
      </Box>
    </Stack>
  );
}

// --- Overview tiles ---------------------------------------------------

function Overview({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "default" | "warning";
}) {
  // The warning tone only fires when the count is non-zero. A zero-value tile
  // painted with attention colour is decoration, and "0 overdue" is good news.
  const alarmed = tone === "warning" && value > 0;
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                color: alarmed ? "warning.main" : "text.secondary",
              }}
            >
              {icon}
            </Box>
            <Typography
              variant="overline"
              noWrap
              sx={{ color: "text.secondary", letterSpacing: "0.08em", lineHeight: 1.4 }}
            >
              {label}
            </Typography>
          </Stack>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: alarmed ? "warning.main" : "text.primary",
            }}
          >
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

// --- Attention rail ---------------------------------------------------

function AttentionRail({
  items,
  unitName,
}: {
  items: Assessment[];
  unitName: (id: string) => string;
}) {
  const vocab = useStudyVocabulary();
  return (
    <Box>
      <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em" }}>
        Needs you now
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        {items.map((a) => {
          const d = daysUntil(a.dueDate);
          const overdue = d < 0;
          return (
            <Box
              key={a.id}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1.5,
                border: 1,
                borderColor: (t) =>
                  overdue ? alpha(t.palette.warning.main, 0.4) : t.palette.divider,
                bgcolor: (t) => (overdue ? alpha(t.palette.warning.main, 0.06) : "transparent"),
              }}
            >
              <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
                <Box
                  component={Link}
                  href={`/dashboard/assessments/${a.id}`}
                  sx={{
                    // The anchor has to be a block for the noWrap ellipsis on
                    // its children to resolve against the flex item's width.
                    display: "block",
                    minWidth: 0,
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover .title": { textDecoration: "underline" },
                  }}
                >
                  <Typography noWrap className="title" sx={{ fontWeight: 600 }}>
                    {a.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    {unitName(a.subjectId)} · {a.weight}% of {vocab.periodSingular}{" "}
                    mark
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  flexShrink: 0,
                  fontWeight: 600,
                  color: overdue ? "warning.main" : "text.primary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {overdue
                  ? `${Math.abs(d)}d late`
                  : d === 0
                    ? "Today"
                    : `${d}d`}
              </Typography>

              {/* Visible at every width. Most of these students are on a phone,
                  so hiding the row's only action on xs would hide it from the
                  majority. On narrow screens it takes its own line under the
                  title rather than squeezing the title into an ellipsis. */}
              <Box sx={{ flexBasis: { xs: "100%", sm: "auto" }, flexShrink: 0 }}>
                <QuickSubmitButton assessment={a} />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

// --- Grouped view helpers ---------------------------------------------

// Per-unit roll-up. The term mark shown here is the server's, read verbatim
// from GET /api/mastery/predictions, which weights each graded assessment by
// its Weight. This used to be a client-side unweighted mean of actualMark,
// which quietly disagreed with the same student's mark on every other page
// the moment two assessments had different weights.
function UnitSummary({
  items,
  predictions,
}: {
  items: Assessment[];
  predictions: TermPrediction[];
}) {
  const vocab = useStudyVocabulary();
  const graded = items.filter((a) => a.actualMark != null);
  const subjectId = items[0]?.subjectId;
  const prediction = predictions.find((p) => p.subjectId === subjectId);
  const weight = items.reduce((s, a) => s + a.weight, 0);

  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      {prediction && prediction.currentTerm > 0 && (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: prediction.currentTerm >= 50 ? "success.main" : "warning.main",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {prediction.currentTerm}% {vocab.periodSingular}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {graded.length}/{items.length} marked
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {weight}% weight
      </Typography>
    </Stack>
  );
}

function DueCell({ a }: { a: Assessment }) {
  const d = daysUntil(a.dueDate);
  const open = isOpen(a);
  return (
    <Stack>
      <Typography variant="body2">{formatDate(a.dueDate)}</Typography>
      <Typography
        variant="caption"
        color={open && d < 0 ? "warning.main" : open && d <= 7 ? "text.primary" : "text.secondary"}
      >
        <RelativeTime iso={a.dueDate} />
      </Typography>
    </Stack>
  );
}

// A mark, or the honest reason there isn't one yet. An em dash in a Mark
// column tells the student nothing; "Awaiting" tells them the ball is in the
// marker's court, and "Not submitted" tells them it is in theirs.
function MarkCell({ a }: { a: Assessment }) {
  if (a.actualMark != null) {
    return (
      <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
        {a.actualMark}%
      </Typography>
    );
  }
  return (
    <Typography variant="caption" color="text.secondary">
      {a.status === "submitted" ? "Awaiting" : "Not submitted"}
    </Typography>
  );
}

function AssessmentGroupRow({ a }: { a: Assessment }) {
  const d = daysUntil(a.dueDate);
  const open = isOpen(a);
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
        p: 1.5,
        borderRadius: 1.5,
        border: 1,
        borderColor: "divider",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 150ms ease, background-color 150ms ease",
        "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
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

      {a.actualMark != null && (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
        >
          {a.actualMark}%
        </Typography>
      )}

      <Stack
        sx={{ flexShrink: 0, display: { xs: "none", sm: "flex" }, minWidth: 88 }}
        alignItems="flex-end"
      >
        <Typography variant="caption" color="text.secondary">
          {formatDate(a.dueDate)}
        </Typography>
        {open && (
          <Typography variant="caption" color={d < 0 ? "warning.main" : "text.secondary"}>
            {d < 0 ? `${Math.abs(d)}d late` : d === 0 ? "due today" : `in ${d}d`}
          </Typography>
        )}
      </Stack>

      <StatusChip kind={statusKind(a.status)} label={ASSESSMENT_STATUS_LABELS[a.status] ?? a.status} />
      <Box sx={{ color: "text.disabled", display: "flex", flexShrink: 0 }}>
        <ChevronRight size={16} />
      </Box>
    </Box>
  );
}
