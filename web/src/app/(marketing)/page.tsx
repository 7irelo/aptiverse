"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Users,
  Presentation,
  WifiOff,
  Languages,
  FileCheck2,
} from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/common/Section";
import { FeatureCard } from "@/components/common/FeatureCard";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { TutorChatDemo } from "@/components/marketing/FeatureDemos";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* How it works: three showcases, one per pillar. */}
      <Section py={2}>
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="overline" color="primary.main">
            How Aptiverse works
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700 }}>
            Your whole academic life, in one calm place.
          </Typography>
        </Stack>

        <FeatureShowcase
          eyebrow="Curriculum-aware study assistant"
          title="Anchored to your work, not the whole internet."
          body="The study assistant follows your curriculum and your own material, so it explains in the right terms and points you to the right source, not a random web page."
          bullets={[
            "Stays in scope for your course",
            "Explains a concept, then sets you a question to try",
            "Guides you through the work instead of handing over answers",
          ]}
          demo={<TutorChatDemo />}
        />

        <Stack alignItems="center" sx={{ pt: 3 }}>
          <Button
            component={Link}
            href="/features"
            variant="outlined"
            size="large"
            endIcon={<ArrowRight size={18} />}
          >
            See everything Aptiverse does
          </Button>
        </Stack>
      </Section>

      {/* Three audiences: students, families, tutors. */}
      <Section
        bg="paper"
        eyebrow="Built for you"
        title="Made for students, families, and tutors"
        subtitle="A focused workspace for the student, a calm read for the family, and a profile that gets tutors found."
      >
        <Grid container spacing={3}>
          {ROLES.map((r) => (
            <Grid key={r.title} size={{ xs: 12, md: 4 }}>
              <FeatureCard {...r} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* South African context. */}
      <Section
        eyebrow="Designed in SA, for SA"
        title="The South African context, handled"
        align="center"
      >
        <Grid container spacing={3}>
          {SA_CONTEXT.map((s) => (
            <Grid key={s.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...s} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Closing CTA. */}
      <Box
        sx={{
          py: { xs: 6, md: 12 },
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 } }}>
          <Box
            sx={{
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
              p: { xs: 4, md: 6 },
              bgcolor: "background.default",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={1.5} sx={{ maxWidth: 580 }}>
                <Typography variant="h3" component="h2" sx={{ letterSpacing: "-0.02em" }}>
                  Start free. Grow at your pace.
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
                  The free tier is genuinely useful: goals, diary, basic practice, and
                  wellbeing tools. Upgrade only when you are ready.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button
                  component={Link}
                  href="/register"
                  size="large"
                  variant="contained"
                  endIcon={<ArrowRight size={18} />}
                >
                  Create free account
                </Button>
                <Button component={Link} href="/pricing" size="large" variant="outlined">
                  See pricing
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}

const ROLES = [
  {
    icon: <GraduationCap size={18} />,
    title: "Students",
    description: "Plan, practise, and watch your results climb, with wellbeing built in.",
    href: "/for-students",
    accent: "primary" as const,
  },
  {
    icon: <Users size={18} />,
    title: "Families",
    description: "A calm, honest read on how each child is doing, academically and emotionally. Never invasive.",
    href: "/for-families",
    accent: "secondary" as const,
  },
  {
    icon: <Presentation size={18} />,
    title: "Tutors",
    description: "List a profile, showcase your qualifications, and get found by students and parents.",
    href: "/for-tutors",
    accent: "info" as const,
  },
];

const SA_CONTEXT = [
  {
    icon: <WifiOff size={18} />,
    title: "Data-light and offline",
    description: "The diary works offline and practice caches, syncing next time you are online.",
    accent: "primary" as const,
  },
  {
    icon: <Languages size={18} />,
    title: "All 11 official languages",
    description: "The AI explains and replies in any of South Africa's 11 official languages.",
    accent: "primary" as const,
  },
  {
    icon: <FileCheck2 size={18} />,
    title: "Curriculum-aligned",
    description: "Built around South African universities and curricula, with real past papers and course material.",
    accent: "primary" as const,
  },
];
