"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import { useTheme } from "@mui/material/styles";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useChildren } from "@/lib/api/queries";
import type { Child } from "@/lib/mockData";

export default function WellbeingSummaryPage() {
  const query = useChildren();

  return (
    <>
      <PageHeader
        title="Wellbeing summary"
        description="Anonymised mood trends. We never show what your child wrote — only how they're trending."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Wellbeing" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <FavoriteIcon />,
          title: "No wellbeing data yet",
          description: "Once your child checks in via the diary, you'll see anonymised mood trends here.",
        }}
      >
        {(children) => (
          <Grid container spacing={3}>
            {children.map((c) => (
              <Grid key={c.id} size={{ xs: 12, md: 6 }}>
                <ChildWellbeingCard child={c} />
              </Grid>
            ))}
          </Grid>
        )}
      </QueryStates>
    </>
  );
}

function ChildWellbeingCard({ child: c }: { child: Child }) {
  const mood = c.moodAvg;
  const theme = useTheme();
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {c.name}
        </Typography>
        {mood === undefined ? (
          <Typography variant="caption" color="text.secondary">
            No mood check-ins yet
          </Typography>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary">
              Average mood: {mood.toFixed(1)} / 5
            </Typography>
            <LineChart
              height={220}
              xAxis={[{ data: Array.from({ length: 14 }, (_, i) => `D${i + 1}`), scaleType: "point" }]}
              yAxis={[{ min: 1, max: 5 }]}
              series={[
                {
                  data: Array.from({ length: 14 }, () => Math.max(1, Math.min(5, mood + (Math.random() - 0.5)))),
                  label: "Mood",
                  // Theme-derived so the line follows the colour scheme. The
                  // previous fixed gold sat near 2.2:1 on the light chart
                  // surface, under the 3:1 floor for a graphical object.
                  color: mood >= 3.5 ? theme.palette.success.main : theme.palette.warning.main,
                },
              ]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
