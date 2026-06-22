"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { PageHeader } from "@/components/common/PageHeader";

const CELEBRATIONS = [
  { who: "Thandi", what: "5-day study streak!", when: "Today", emoji: "🔥" },
  { who: "Thandi", what: "Got 78% on her English essay", when: "Yesterday", emoji: "📝" },
  { who: "Lerato", what: "Completed wellbeing goal — 5/5 days", when: "2 days ago", emoji: "💚" },
  { who: "Thandi", what: "Earned Resilient Learner badge", when: "Last week", emoji: "🏅" },
  { who: "Lerato", what: "Helped a peer in study group", when: "Last week", emoji: "🤝" },
];

export default function CelebrationsPage() {
  return (
    <>
      <PageHeader
        title="Celebrations"
        description="The small wins matter. We round them up so you can notice."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Celebrations" }]}
      />

      <Grid container spacing={3}>
        {CELEBRATIONS.map((c, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "secondary.main", display: "grid", placeItems: "center", mb: 2, fontSize: "1.75rem" }}>
                  {c.emoji}
                </Box>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                  {c.who}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {c.what}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {c.when}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
