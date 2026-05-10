"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import ScheduleIcon from "@mui/icons-material/ScheduleOutlined";
import Link from "next/link";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { STREAK_DAYS, TODAY_FOCUS_MINUTES } from "@/lib/mockData";

export function WelcomeBanner({ name = "Thandi" }: { name?: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <GradientBackdrop variant="hero" sx={{ borderRadius: 3, mb: 4, border: 1, borderColor: "divider" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ p: { xs: 3, md: 4 } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" color="primary.main">
            {greeting}, {name}
          </Typography>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            You're 70% ready for your <Box component="span" sx={{ color: "primary.main" }}>English essay</Box>.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            One 25-minute focus session today closes the gap. We've got an outline waiting for you in the workspace.
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<LocalFireDepartmentIcon sx={{ color: "achievement.main !important" }} />}
              label={`${STREAK_DAYS}-day streak`}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 600,
                color: "achievement.dark",
                borderColor: (t) => `${t.palette.achievement.main}66`,
                bgcolor: (t) => `${t.palette.achievement.main}1A`,
              }}
            />
            <Chip
              icon={<ScheduleIcon />}
              label={`${TODAY_FOCUS_MINUTES} min today`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <Button component={Link} href="/dashboard/workspace" variant="contained" size="large">
            Open workspace
          </Button>
          <Button component={Link} href="/dashboard/practice" variant="outlined" size="large">
            Quick practice
          </Button>
        </Stack>
      </Stack>
    </GradientBackdrop>
  );
}
