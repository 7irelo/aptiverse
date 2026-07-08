"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { PageHeader } from "@/components/common/PageHeader";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";

const COHORTS = [
  { name: "Grade 12 (162 learners)", university: 64, vocational: 22, undecided: 16 },
  { name: "Grade 11 (188 learners)", university: 58, vocational: 25, undecided: 30 },
  { name: "Grade 10 (212 learners)", university: 46, vocational: 28, undecided: 42 },
];

export default function ReadinessPage() {
  return (
    <>
      <PageHeader
        title="University readiness"
        description="Per-cohort readiness for university and vocational pathways. Exportable for funders and parents."
        breadcrumbs={[{ label: "School", href: "/school-admin" }, { label: "Readiness" }]}
        actions={<Button variant="contained" startIcon={<DownloadIcon />}>Export PDF</Button>}
      />

      <Stack spacing={3}>
        {COHORTS.map((c) => (
          <Card key={c.name}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {c.name}
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: "University ready", value: c.university, color: "primary.main" },
                  { label: "Vocational track", value: c.vocational, color: "info.main" },
                  { label: "Undecided", value: c.undecided, color: "warning.main" },
                ].map((m) => (
                  <Grid key={m.label} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{m.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {m.value}%
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={m.value} sx={{ height: 8, borderRadius: 999, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: m.color } }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top destination universities (predicted)
            </Typography>
            <Stack spacing={1.5}>
              {[
                { uni: "University of Cape Town", count: 24 },
                { uni: "Wits University", count: 18 },
                { uni: "Stellenbosch University", count: 16 },
                { uni: "University of Pretoria", count: 22 },
              ].map((u) => (
                <Stack key={u.uni} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {u.uni}
                  </Typography>
                  <Chip label={`${u.count} learners`} color="primary" />
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}
