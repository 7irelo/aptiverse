"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlineOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useCareers } from "@/lib/api/queries";
import type { Career } from "@/lib/mockData";
import Link from "next/link";

export default function CareerPage() {
  const query = useCareers();

  return (
    <>
      <PageHeader
        title="Career navigator"
        description="From dream course to first internship — we help you plan it backwards from where you want to be."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Career" }]}
        actions={<Button variant="contained" color="secondary">Set dream course</Button>}
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
                  <RocketLaunchOutlinedIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" color="primary.main">
                    Your dream course
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Not set yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Pick a target course and we'll track your progress and recommend the subjects most worth pushing.
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" size="small">
                      Set dream course
                    </Button>
                    <Button component={Link} href="/dashboard/goals" variant="outlined" size="small">
                      Set a goal
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Career matches based on your profile
              </Typography>
              <QueryStates
                query={query}
                empty={{
                  icon: <WorkOutlineIcon />,
                  title: "No career matches yet",
                  description:
                    "Add your subjects and a few interests, and we'll surface careers that fit your strengths.",
                  size: "compact",
                  action: (
                    <Button variant="contained" component={Link} href="/dashboard/subjects">
                      Add subjects
                    </Button>
                  ),
                }}
              >
                {(careers) => <CareerList careers={careers} />}
              </QueryStates>
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
                <Typography variant="body2" color="text.secondary">
                  Short reads to help you make smart money decisions before you leave home. Coming soon.
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Day in the life
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Real stories from SA professionals across fields. Coming soon.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

function CareerList({ careers }: { careers: Career[] }) {
  return (
    <Stack spacing={2}>
      {careers.map((c) => (
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
  );
}
