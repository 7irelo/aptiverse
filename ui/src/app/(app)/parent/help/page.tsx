"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import LightbulbIcon from "@mui/icons-material/LightbulbOutlined";

const TIPS = [
  {
    child: "Thandi",
    issue: "Stuck on Chemical Equilibrium (42% mastery)",
    suggestions: [
      "Watch the 8-min Le Chatelier explainer with her on YouTube before dinner.",
      "Ask 'what happens if we add more product?' and let her teach you the answer.",
      "Print the past paper question we've flagged — let her solve it for you, no pressure.",
    ],
  },
  {
    child: "Thandi",
    issue: "Mood dropped Tuesday",
    suggestions: [
      "Don't ask 'what's wrong'. Ask 'what's the best part of today?'",
      "Suggest a 30-min walk after supper — no phone.",
      "Avoid mentioning the upcoming SBA tonight.",
    ],
  },
  {
    child: "Lerato",
    issue: "Falling behind in maths",
    suggestions: [
      "She doesn't need you to teach her — she needs you to ask 'where can we ask for help?'",
      "Aptiverse has a free practice sprint we've already prepared. Send her this link.",
    ],
  },
];

export default function HowCanIHelp() {
  return (
    <>
      <PageHeader
        title="How can I help?"
        description="Plain-language, actionable suggestions — never lectures, never alarms."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "How can I help?" }]}
      />

      <Stack spacing={3}>
        {TIPS.map((t, i) => (
          <Card key={i}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "secondary.main", color: "white" }}>
                  <LightbulbIcon />
                </Box>
                <Box>
                  <Chip label={t.child} size="small" color="primary" sx={{ mb: 0.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t.issue}
                  </Typography>
                </Box>
              </Stack>
              <Stack spacing={1}>
                {t.suggestions.map((s, j) => (
                  <Stack key={j} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", mt: 1 }} />
                    <Typography variant="body2">{s}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
