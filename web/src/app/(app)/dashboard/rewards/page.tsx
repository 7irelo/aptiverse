"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcardOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useRewards } from "@/lib/api/queries";
import type { Reward } from "@/lib/mockData";

export default function RewardsPage() {
  const points = 1840; // TODO: replace with useStudentPoints(currentUserId) once auth surfaces the id
  const query = useRewards();

  return (
    <>
      <PageHeader
        title="Rewards"
        description="Points you've earned, spent on things worth having — tutor hours, masterclasses, and badges that go on your university applications."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Rewards" }]}
      />

      <Card
        sx={{
          mb: 3,
          bgcolor: (t) => alpha(t.palette.achievement.main, 0.1),
          borderColor: (t) => alpha(t.palette.achievement.main, 0.3),
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ md: "center" }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Your rewards balance
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {points.toLocaleString()} pts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Earned from completed goals, verified by your school. Earn more by hitting goals, building streaks, and helping peers.
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Stack alignItems="center">
                <LocalFireDepartmentIcon sx={{ fontSize: 28, color: "achievement.dark" }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  12
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  day streak
                </Typography>
              </Stack>
              <Stack alignItems="center">
                <WorkspacePremiumIcon sx={{ fontSize: 28, color: "achievement.dark" }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  4
                </Typography>
                <Typography variant="caption" color="text.secondary">
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

      <QueryStates
        query={query}
        empty={{
          icon: <CardGiftcardIcon />,
          title: "No rewards available yet",
          description: "Rewards unlock as you earn points and your school adds local perks. Keep at it.",
        }}
      >
        {(rewards) => (
          <Grid container spacing={3}>
            {rewards.map((r) => (
              <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <RewardCard reward={r} points={points} />
              </Grid>
            ))}
          </Grid>
        )}
      </QueryStates>
    </>
  );
}

function RewardCard({ reward: r, points }: { reward: Reward; points: number }) {
  const affordable = points >= r.cost;
  return (
    <Card sx={{ height: "100%", opacity: r.available ? 1 : 0.5 }}>
      <Box sx={{ height: 80, bgcolor: r.imageColor, p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Chip label={r.category} size="small" sx={{ bgcolor: "rgba(0,0,0,0.35)", color: "white" }} />
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
  );
}
