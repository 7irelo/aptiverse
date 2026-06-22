"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GpsFixedIcon from "@mui/icons-material/GpsFixedOutlined";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { usePracticeTests, useSubjects } from "@/lib/api/queries";
import type { PracticeTest, Subject } from "@/lib/mockData";
import Link from "next/link";

export default function PracticePage() {
  const testsQuery = usePracticeTests();
  const subjectsQuery = useSubjects();

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Practice tests"
        description="AI-generated drills and past papers, aligned to your upcoming SBAs."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Practice" }]}
        actions={<Button variant="contained" startIcon={<AutoAwesomeIcon />}>Generate from weakest</Button>}
      />

      <Card sx={{ mb: 3, bgcolor: "primary.main", color: "primary.contrastText" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <GpsFixedIcon sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.85 }}>
                  Focus on your weakest
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Generate a 20-min sprint targeting your bottom-3 topics
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.92 }}>
                  We'll pick from the topics you score lowest on.
                </Typography>
              </Box>
            </Stack>
            <Button color="secondary" variant="contained" size="large">
              Start sprint
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <QueryStates
        query={testsQuery}
        empty={{
          icon: <QuizIcon />,
          title: "No practice tests yet",
          description: "Generate one from your weakest topics, or wait — your teacher may set one for an upcoming SBA.",
          action: (
            <Button variant="contained" startIcon={<AutoAwesomeIcon />}>
              Generate a test
            </Button>
          ),
        }}
      >
        {(tests) => <PracticeList tests={tests} subjects={subjectsQuery.data ?? []} />}
      </QueryStates>
    </AtmosphericBackdrop>
  );
}

function PracticeList({ tests, subjects }: { tests: PracticeTest[]; subjects: Subject[] }) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const filtered = tests.filter(
    (p) =>
      (subjectFilter === "all" || p.subjectId === subjectFilter) &&
      (difficultyFilter === "all" || p.difficulty === difficultyFilter),
  );

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField select size="small" label="Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="all">All subjects</MenuItem>
          {subjects.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Difficulty" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="all">All levels</MenuItem>
          <MenuItem value="foundation">Foundation</MenuItem>
          <MenuItem value="core">Core</MenuItem>
          <MenuItem value="challenge">Challenge</MenuItem>
        </TextField>
      </Stack>

      {filtered.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No practice tests match those filters.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <PracticeCard test={p} subject={subjects.find((s) => s.id === p.subjectId)} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

function PracticeCard({ test: p, subject }: { test: PracticeTest; subject?: Subject }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Chip
            label={p.difficulty}
            size="small"
            color={p.difficulty === "challenge" ? "warning" : p.difficulty === "core" ? "primary" : "default"}
            sx={{ textTransform: "capitalize" }}
          />
          {p.aiGenerated && <Chip icon={<AutoAwesomeIcon />} label="AI" size="small" variant="outlined" />}
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {p.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
          {subject?.name}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Questions
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {p.questionCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Time
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {p.durationMinutes}m
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Attempts
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {p.attempts}
            </Typography>
          </Box>
        </Stack>
        {p.bestScore != null && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Best score
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {p.bestScore}%
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={p.bestScore} color="primary" />
          </Box>
        )}
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {p.topics.map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" />
          ))}
        </Stack>
        <Box sx={{ mt: "auto" }}>
          <Button component={Link} href={`/dashboard/practice/${p.id}`} variant="contained" fullWidth>
            Start
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
