"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import {
  useTutorConnections,
  useTutorReviews,
  useTutorProfile,
} from "@/lib/api/queries";

// The tutor track under the subscription model: Aptiverse does not facilitate
// tutoring or take a fee. A tutor showcases a profile, connects with students
// and parents (arranging directly, off-platform), and builds a review record.
export default function TutorDashboard() {
  const connectionsQuery = useTutorConnections();
  const reviewsQuery = useTutorReviews();
  const profileQuery = useTutorProfile();

  const connections = connectionsQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const activeCount = connections.filter((c) => c.status === "active").length;
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const hasProfile = Boolean(profileQuery.data);
  const steps = [
    {
      done: hasProfile,
      label: "Set up your public profile",
      hint: "Qualifications, subjects and teaching style so students can find you.",
      href: "/tutor/settings",
      cta: "Edit profile",
    },
    {
      done: connections.length > 0,
      label: "Connect with your first student",
      hint: "Students and parents reach out here; you arrange the tutoring directly.",
      href: "/tutor/connections",
      cta: "View connections",
    },
    {
      done: reviews.length > 0,
      label: "Earn your first review",
      hint: "Reviews build the reputation that brings the next student.",
      href: "/tutor/reviews",
      cta: "View reviews",
    },
  ];

  return (
    <>
      <PageHeader
        title="Tutor dashboard"
        description="Your profile, connections and reviews at a glance."
        breadcrumbs={[{ label: "Home" }]}
        actions={
          <Button component={Link} href="/tutor/settings" variant="contained">
            Edit profile
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Connected students"
            value={connections.length}
            hint={connections.length ? `${activeCount} active` : "none yet"}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Reviews"
            value={reviews.length}
            hint={reviews.length ? "from your students" : "none yet"}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Average rating"
            value={avgRating != null ? avgRating.toFixed(1) : "—"}
            hint={avgRating != null ? "out of 5" : "no reviews yet"}
            color="success"
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Getting set up
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Aptiverse puts you in front of students. The tutoring, scheduling and payment
            stay between you and them.
          </Typography>
          <Stack spacing={1.5}>
            {steps.map((step) => (
              <Box
                key={step.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: (t) =>
                    step.done ? alpha(t.palette.success.main, 0.06) : "transparent",
                }}
              >
                {step.done ? (
                  <CheckCircleIcon sx={{ color: "success.main" }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ color: "text.disabled" }} />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500 }}>{step.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.hint}
                  </Typography>
                </Box>
                {!step.done && (
                  <Button
                    component={Link}
                    href={step.href}
                    size="small"
                    variant="outlined"
                    sx={{ flexShrink: 0 }}
                  >
                    {step.cta}
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
