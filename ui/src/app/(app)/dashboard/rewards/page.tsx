"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { REWARDS } from "@/lib/mockData";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";

export default function RewardsPage() {
  const points = 1840;

  return (
    <>
      <PageHeader
        title="Rewards"
        description="Real perks for real effort — tutor hours, masterclasses, and badges that universities can see."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Rewards" }]}
      />

      <Card sx={{ mb: 3, background: (t) => `linear-gradient(135deg, ${t.palette.achievement.dark}, ${t.palette.achievement.main})`, color: "achievement.contrastText" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ md: "center" }}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.85 }}>
                Your rewards balance
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {points.toLocaleString()} pts
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.92 }}>
                Earned from completed goals, verified by your school. Earn more by hitting goals, building streaks, and helping peers.
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Stack alignItems="center">
                <LocalFireDepartmentIcon sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  12
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  day streak
                </Typography>
              </Stack>
              <Stack alignItems="center">
                <EmojiEventsIcon sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  4
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  badges
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Redeem rewards
      </Typography>
      <Grid container spacing={3}>
        {REWARDS.map((r) => {
          const affordable = points >= r.cost;
          return (
            <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={{ height: "100%", opacity: r.available ? 1 : 0.5 }}>
                <Box sx={{ height: 80, bgcolor: r.imageColor, p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Chip label={r.category} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />
                  {r.cost === 0 && <Chip label="Free" size="small" color="secondary" />}
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {r.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    {r.description}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {r.cost === 0 ? "Free" : `${r.cost} pts`}
                    </Typography>
                    <Button variant={affordable ? "contained" : "outlined"} disabled={!r.available || !affordable}>
                      {!r.available ? "Locked" : affordable ? "Redeem" : `Need ${r.cost - points} more`}
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
