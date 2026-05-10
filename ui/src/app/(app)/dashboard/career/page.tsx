"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { CAREERS, APS_SCORE } from "@/lib/mockData";
import Link from "next/link";

export default function CareerPage() {
  return (
    <>
      <PageHeader
        title="Career navigator"
        description="From dream course to bursary to first internship — we help you plan it backwards from where you want to be."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Career" }]}
        actions={<Button variant="contained">Set dream course</Button>}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="primary.main">
                Your dream course
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                BSc Engineering — University of Cape Town
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                APS cutoff: 41 · You're at {APS_SCORE} (likely with current trajectory: 39)
              </Typography>
              <LinearProgress variant="determinate" value={(APS_SCORE / 41) * 100} sx={{ height: 12, borderRadius: 999, mb: 1 }} color="primary" />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Current APS: {APS_SCORE}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Target: 41
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button component={Link} href="/dashboard/universities" variant="outlined">
                  Explore universities
                </Button>
                <Button component={Link} href="/dashboard/bursaries" variant="outlined">
                  Find bursaries
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Career matches based on your profile
              </Typography>
              <Stack spacing={2}>
                {CAREERS.map((c) => (
                  <Box key={c.id} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {c.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.field} · {c.averageSalary}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end">
                        <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700 }}>
                          {c.matchScore}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          match
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {c.requirements.map((r) => (
                        <Chip key={r} label={r} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Financial literacy
                </Typography>
                <Stack spacing={1}>
                  {[
                    "Understanding student loans (NSFAS vs banks)",
                    "Budgeting at university",
                    "Cost of living in SA cities",
                    "Why your credit score matters at 18",
                  ].map((m) => (
                    <Stack key={m} direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2">{m}</Typography>
                      <Button size="small">Read</Button>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Day in the life
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { name: "Software Engineer", company: "Anthropic" },
                    { name: "Chemical Engineer", company: "Sasol" },
                    { name: "Junior Doctor", company: "GSH" },
                  ].map((d) => (
                    <Box key={d.name} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {d.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.company} · 4 min read
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
