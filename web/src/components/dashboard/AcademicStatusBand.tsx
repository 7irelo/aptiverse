"use client";

import Link from "next/link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CalendarTodayIcon from "@mui/icons-material/CalendarTodayOutlined";
import { useAcademicUnits, useAcademicSignals } from "@/lib/api/queries";
import { dueLabel } from "./UnitSignals";

// The focal moment of the subjects / courses page: a dark graphite panel that
// surfaces the single most imminent assessment across every unit (the honest
// answer to "what next"), flanked by three real stats. Renders nothing until
// the student has at least one unit, so the page keeps its own empty state.
export function AcademicStatusBand() {
  const { units, unitNounPlural, nameFor } = useAcademicUnits();
  const { nextAssessmentOverall, avgCurrentMark, topicsPracticed } = useAcademicSignals();

  if (units.length === 0) return null;

  const next = nextAssessmentOverall;
  const due = next ? dueLabel(next.dueDate) : null;
  const nextUnitName = next ? nameFor(next.subjectId) : undefined;

  return (
    <Grid container spacing={2.5} sx={{ mb: { xs: 3, md: 4 } }}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box
          sx={{
            height: "100%",
            bgcolor: "brandSurface.main",
            color: "brandSurface.contrastText",
            borderRadius: 2,
            p: { xs: 2.5, md: 3 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, opacity: 0.7 }}>
            <CalendarTodayIcon sx={{ fontSize: 16 }} />
            <Typography variant="overline" sx={{ letterSpacing: "0.14em", lineHeight: 1 }}>
              Next up
            </Typography>
          </Stack>

          {next && due ? (
            <>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, lineHeight: 1.1, mb: 1, textWrap: "balance" }}
              >
                {next.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mb: 3 }}>
                {[nextUnitName, due.text].filter(Boolean).join(" · ")}
              </Typography>
              <Button
                component={Link}
                href={`/dashboard/assessments/${next.id}`}
                variant="contained"
                color="secondary"
                sx={{ alignSelf: "flex-start", mt: "auto" }}
              >
                Open assessment
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 1 }}>
                You&apos;re all clear
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mb: 3 }}>
                Nothing due right now. A good moment to get ahead with some practice.
              </Typography>
              <Button
                component={Link}
                href="/dashboard/practice"
                variant="contained"
                color="secondary"
                sx={{ alignSelf: "flex-start", mt: "auto" }}
              >
                Start practice
              </Button>
            </>
          )}
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Box
          sx={{
            height: "100%",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <StatCell label={unitNounPlural} value={String(units.length)} />
          <Divider orientation="vertical" flexItem />
          <StatCell label="Average" value={avgCurrentMark != null ? `${avgCurrentMark}%` : "–"} />
          <Divider orientation="vertical" flexItem />
          <StatCell label="Topics practised" value={String(topicsPracticed)} />
        </Box>
      </Grid>
    </Grid>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        px: { xs: 1.5, sm: 2 },
        py: 2.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 0.5,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "capitalize", lineHeight: 1.2 }}
        noWrap
      >
        {label}
      </Typography>
    </Box>
  );
}
