"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";

// Aptiverse intentionally does not host past papers — the Department of
// Basic Education maintains the authoritative archive, and re-hosting risks
// copyright + staleness. This page funnels students to the official source
// with subject-aware context and study tips.

const DBE_ROOT =
  "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx";

const SUBJECTS: { name: string; subtitle: string; tip: string }[] = [
  {
    name: "Mathematics",
    subtitle: "P1 (Algebra, Calculus, Functions) · P2 (Trig, Geometry, Stats)",
    tip: "Work P1 timed at 3hr, no calculator first 30 min. Mark with the official memo.",
  },
  {
    name: "Mathematical Literacy",
    subtitle: "P1 (Skills) · P2 (Applications)",
    tip: "Focus on units and rounding — the memo strips marks for those silently.",
  },
  {
    name: "Physical Sciences",
    subtitle: "P1 (Physics) · P2 (Chemistry)",
    tip: "Read the equation sheet first. Spend the first 5 minutes mapping each question to a formula.",
  },
  {
    name: "Life Sciences",
    subtitle: "P1 (Genetics, Diversity) · P2 (Life Processes)",
    tip: "Diagrams must be labelled, not described. The memo expects exact terminology.",
  },
  {
    name: "English HL",
    subtitle: "P1 (Comprehension) · P2 (Literature) · P3 (Writing)",
    tip: "Mark your own P3 with the rubric, not just a percentage — that's where the marks hide.",
  },
  {
    name: "Afrikaans FAL",
    subtitle: "P1 (Taal) · P2 (Letterkunde) · P3 (Skryf)",
    tip: "Work P3 essays out loud first — flow matters as much as grammar in the rubric.",
  },
  {
    name: "Geography",
    subtitle: "P1 (Theory + mapwork prep) · P2 (Mapwork practical)",
    tip: "Always use a ruler for bearings and gradient. The memo measures, not eyeballs.",
  },
  {
    name: "Life Orientation",
    subtitle: "CAT (Common Assessment Task)",
    tip: "LO is examined as a CAT — past CAT papers are released by your province, not the national archive.",
  },
  {
    name: "Accounting",
    subtitle: "Single paper · all sections",
    tip: "Layout costs you marks. Use the prescribed format even when working out roughly.",
  },
];

export default function PastPapersPage() {
  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Past papers"
        description="Real NSC past papers, hosted by the Department of Basic Education. We point you to the official archive — your study plan + AI practice live here at Aptiverse."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Past papers" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            endIcon={<OpenInNewIcon />}
            component="a"
            href={DBE_ROOT}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open DBE archive
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: "brandSurface.main",
                    color: "brandSurface.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <DescriptionIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    National Senior Certificate (NSC) past papers
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    The official archive runs back to 2008 and includes every NSC subject in every official language, plus memos. Filter by year, subject and paper directly on the DBE site.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<OpenInNewIcon />}
                    component="a"
                    href={DBE_ROOT}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Browse the archive
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: "text.secondary" }}>
            Subject-by-subject pointers
          </Typography>

          <Stack spacing={1.5}>
            {SUBJECTS.map((s) => (
              <Card key={s.name} variant="outlined">
                <CardContent sx={{ p: 2.5 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }}>{s.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.subtitle}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 1 }}>
                        <TipsAndUpdatesOutlinedIcon
                          sx={{ color: "warning.main", fontSize: 18, mt: "2px" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {s.tip}
                        </Typography>
                      </Stack>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<OpenInNewIcon />}
                      component="a"
                      href={DBE_ROOT}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Find papers
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <SchoolIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  How to drill papers properly
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                A paper a week beats five papers in a panic the night before. Treat each one as a real exam.
              </Typography>
              <Stack spacing={1.5}>
                <Tip n={1} text="Print or split-screen — don't read on phone." />
                <Tip n={2} text="Set a timer for the full duration. No pauses." />
                <Tip n={3} text="Mark with the official memo, then count rubric marks for essays." />
                <Tip n={4} text="Log every mistake category in your diary — patterns reveal weak topics." />
                <Tip n={5} text="Re-attempt the questions you got wrong a week later. Spaced." />
              </Stack>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Want feedback while you study?
              </Typography>
              <Stack spacing={1}>
                <Button variant="contained" fullWidth href="/dashboard/practice">
                  Generate practice questions
                </Button>
                <Button variant="outlined" fullWidth href="/dashboard/tutors">
                  Book a tutor walkthrough
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip label="Source: education.gov.za" size="small" variant="outlined" />
          <Typography variant="caption" color="text.secondary">
            Aptiverse links directly to the Department of Basic Education's official archive — we don't re-host papers.
          </Typography>
        </Stack>
      </Box>
    </AtmosphericBackdrop>
  );
}

function Tip({ n, text }: { n: number; text: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: "action.hover",
          color: "text.primary",
          fontWeight: 700,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {n}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Stack>
  );
}
