"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { LineChart } from "@mui/x-charts/LineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import PsychologyIcon from "@mui/icons-material/PsychologyOutlined";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovementOutlined";
import HeadphonesIcon from "@mui/icons-material/HeadphonesOutlined";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjectsOutlined";

const QUICK_TOOLS = [
  {
    icon: <SelfImprovementIcon />,
    title: "5-minute breathing",
    description: "Box breathing exercise. Slow your heart, calm the mind.",
    cta: "Start",
  },
  {
    icon: <HeadphonesIcon />,
    title: "Focus playlist",
    description: "Distraction-free instrumentals while you study.",
    cta: "Play",
  },
  {
    icon: <EmojiObjectsIcon />,
    title: "Stories of struggle",
    description: "South Africans who failed before they soared.",
    cta: "Read",
  },
  {
    icon: <PsychologyIcon />,
    title: "Talk to a psychologist",
    description: "Verified counsellors. Book a 30-minute session.",
    cta: "Book",
  },
];

export default function WellbeingPage() {
  return (
    <>
      <PageHeader
        title="Wellbeing"
        description="A calmer matric. Daily check-ins, breathing tools, and pros to talk to."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Wellbeing" }]}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Mood (7-day avg)" value="3.8 / 5" hint="Steady" icon={<FavoriteIcon />} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Stress signals" value="Low" hint="No alerts this week" color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Sleep" value="7h 12m" delta={-3} deltaLabel="vs last week" color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Check-in streak" value="12 days" hint="Beautiful." color="secondary" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Mood over the past 14 days
              </Typography>
              <LineChart
                height={260}
                xAxis={[{ data: Array.from({ length: 14 }, (_, i) => `D${i + 1}`), scaleType: "point" }]}
                yAxis={[{ min: 1, max: 5 }]}
                series={[
                  {
                    data: [3, 4, 3, 2, 3, 4, 4, 5, 4, 3, 4, 5, 4, 4],
                    label: "Mood (1-5)",
                    curve: "monotoneX",
                    color: "#F25C2E",
                  },
                ]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ background: (t) => `linear-gradient(135deg, ${t.palette.wellbeing.dark}, ${t.palette.wellbeing.main})`, color: "wellbeing.contrastText", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" sx={{ opacity: 0.85 }}>
                Take a break
              </Typography>
              <Typography variant="h5" sx={{ mb: 2 }}>
                You've been at it for 90 minutes. Pause for a moment?
              </Typography>
              <Stack spacing={1}>
                <Button sx={{ bgcolor: "background.paper", color: "wellbeing.dark", "&:hover": { bgcolor: "background.paper" } }} size="large" fullWidth>
                  Start 5-min breathing
                </Button>
                <Button sx={{ color: "wellbeing.contrastText", borderColor: "rgba(255,255,255,0.4)" }} variant="outlined" fullWidth>
                  Surprise me
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {QUICK_TOOLS.map((q) => (
          <Grid key={q.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: (t) => `${t.palette.wellbeing.main}1A`, color: "wellbeing.main", mb: 2 }}>
                  {q.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {q.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  {q.description}
                </Typography>
                <Button variant="outlined">{q.cta}</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
