"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";


export default function Page() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              Demo
            </Typography>
            <Typography variant="h1" component="h1">
              See Aptiverse in action.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              A two-minute tour, plus interactive walkthroughs of the student, teacher, parent and school admin views.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
              <Button component={Link} href="/register" size="large" variant="contained">
                Try it free
              </Button>
              <Button component={Link} href="/contact?reason=school" size="large" variant="outlined">
                Book live demo
              </Button>
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section eyebrow="Interactive" title="Walk through every view">
        <Grid container spacing={3}>
          {[
            { title: "Student view", href: "/dashboard", body: "Practice tests, goals, the AI tutor, and your wellbeing space." },
            { title: "Parent view", href: "/parent", body: "Realtime activity, celebration alerts, and how-can-I-help suggestions." },
            { title: "Teacher view", href: "/teacher", body: "Class-wide gap analysis, differentiated assignments, one-click verification." },
            { title: "School admin", href: "/school-admin", body: "Whole-school analytics and university readiness reports." },
            { title: "Tutor view", href: "/tutor", body: "Course marketplace, bookings, earnings and reviews." },
          ].map((c) => (
            <Grid key={c.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {c.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>
                    {c.body}
                  </Typography>
                  <Button component={Link} href={c.href} variant="outlined">
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}
