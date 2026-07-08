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
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcardOutlined";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useRewards } from "@/lib/api/queries";
import type { Reward } from "@/lib/mockData";

export default function RewardsPage() {
  const query = useRewards();

  return (
    <>
      <PageHeader
        title="Rewards"
        description="Points you earn by completing goals can be spent on things worth having: tutor hours, masterclasses, and perks your school adds."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Rewards" }]}
      />

      {/* Honest "how it works" panel in the gold achievement zone. No
          fabricated balance, streak or badge counts: points come from real
          completed goals, and a live balance surfaces here only once the
          backend exposes it. */}
      <Card
        sx={{
          mb: 3,
          bgcolor: (t) => alpha(t.palette.achievement.main, 0.1),
          borderColor: (t) => alpha(t.palette.achievement.main, 0.3),
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ maxWidth: 520 }}>
              <Typography variant="overline" color="text.secondary">
                How rewards work
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Complete goals, earn points, redeem them
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Every goal you finish and your school verifies is worth points. Spend them on the
                perks below. Your live balance shows here once your school activates rewards.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/dashboard/goals"
              variant="contained"
              color="secondary"
              startIcon={<FlagOutlinedIcon />}
              sx={{ flexShrink: 0 }}
            >
              View goals
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Available rewards
      </Typography>

      <QueryStates
        query={query}
        empty={{
          icon: <CardGiftcardIcon />,
          title: "No rewards available yet",
          description:
            "Rewards unlock as your school adds local perks. Keep hitting your goals in the meantime.",
        }}
      >
        {(rewards) => (
          <Grid container spacing={3}>
            {rewards.map((r) => (
              <Grid key={r.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <RewardCard reward={r} />
              </Grid>
            ))}
          </Grid>
        )}
      </QueryStates>
    </>
  );
}

function RewardCard({ reward: r }: { reward: Reward }) {
  return (
    <Card sx={{ height: "100%", opacity: r.available ? 1 : 0.55 }}>
      <Box
        sx={{
          height: 80,
          bgcolor: r.imageColor,
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "primary.main", fontVariantNumeric: "tabular-nums" }}
          >
            {r.cost === 0 ? "Free" : `${r.cost.toLocaleString()} pts`}
          </Typography>
          <Button variant={r.available ? "contained" : "outlined"} disabled={!r.available}>
            {r.available ? "Redeem" : "Locked"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
