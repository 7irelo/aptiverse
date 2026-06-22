"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "next/link";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { CAREERS } from "@/lib/mockData";


export default function Page() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              Careers
            </Typography>
            <Typography variant="h1" component="h1">
              What does this lead to, really?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              We translate degrees into day-to-day reality. What does a BCom actually look like? What does a chemical engineer do at 9am on a Tuesday? See for yourself.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
              <Button component={Link} href="/register" variant="contained" size="large">
                Match my career
              </Button>
              <Button component={Link} href="/universities" variant="outlined" size="large">
                Browse universities
              </Button>
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section eyebrow="Top matches" title="Suggested careers based on your profile" subtitle="(Sign in to see scores tailored to you. Below are samples.)">
        <Grid container spacing={3}>
          {CAREERS.map((c) => (
            <Grid key={c.id} size={{ xs: 12, sm: 6, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {c.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {c.field} · {c.averageSalary}
                      </Typography>
                    </Box>
                    <Chip label={c.growth + " growth"} size="small" color={c.growth === "high" ? "success" : c.growth === "medium" ? "warning" : "default"} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Match score
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={c.matchScore} sx={{ flex: 1, height: 8 }} color="primary" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.matchScore}%
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Requirements
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    {c.requirements.map((r) => (
                      <Chip key={r} label={r} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}
