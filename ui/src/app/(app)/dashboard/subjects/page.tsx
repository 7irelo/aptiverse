"use client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Link from "next/link";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import { PageHeader } from "@/components/common/PageHeader";
import { SUBJECTS } from "@/lib/mockData";

export default function SubjectsPage() {
  return (
    <>
      <PageHeader
        title="Subjects"
        description="Your matric subjects, with predicted next-term marks and topic-by-topic mastery."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subjects" }]}
        actions={<Button variant="contained">Add subject</Button>}
      />

      <Grid container spacing={3}>
        {SUBJECTS.map((s) => {
          const TrendIcon =
            s.trend === "up" ? TrendingUpIcon : s.trend === "down" ? TrendingDownIcon : TrendingFlatIcon;
          const trendColor = s.trend === "up" ? "success.main" : s.trend === "down" ? "error.main" : "text.secondary";

          return (
            <Grid key={s.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                        {s.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.code} · {s.teacher}
                      </Typography>
                    </Box>
                    <Chip label={s.level} size="small" variant="outlined" sx={{ textTransform: "capitalize" }} />
                  </Stack>

                  <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Current
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {s.currentAverage}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Predicted next term
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                          {s.predictedNextTerm}%
                        </Typography>
                        <TrendIcon sx={{ color: trendColor }} />
                      </Stack>
                    </Box>
                  </Stack>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="overline" color="text.secondary">
                      Topic mastery
                    </Typography>
                    <Stack spacing={1.25} sx={{ mt: 0.75 }}>
                      {s.topics.slice(0, 4).map((t) => (
                        <Box key={t.name}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">{t.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {t.mastery}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={t.mastery}
                            color={t.mastery >= 70 ? "success" : t.mastery >= 50 ? "primary" : "warning"}
                            sx={{ height: 6, borderRadius: 999 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                    <Button component={Link} href={`/dashboard/subjects/${s.id}`} variant="contained" size="small" fullWidth>
                      Open subject
                    </Button>
                    <Button component={Link} href={`/dashboard/practice?subject=${s.id}`} variant="outlined" size="small">
                      Practice
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
