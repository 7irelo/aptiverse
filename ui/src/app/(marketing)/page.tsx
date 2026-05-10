"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import GroupIcon from "@mui/icons-material/GroupsOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import PsychologyIcon from "@mui/icons-material/PsychologyOutlined";
import SchoolIcon from "@mui/icons-material/School";
import TimelineIcon from "@mui/icons-material/Timeline";
import WorkIcon from "@mui/icons-material/WorkOutline";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismOutlined";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import LanguageIcon from "@mui/icons-material/LanguageOutlined";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/common/Section";
import { FeatureCard } from "@/components/common/FeatureCard";

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section
        eyebrow="Everything connected"
        title="A complete success partner — not another study app"
        subtitle="From the SBA you wrote yesterday to the bursary deadline next month, Aptiverse joins the dots so you always know what to do next."
        align="center"
      >
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section bg="paper" eyebrow="Built for you" title="One platform, five views" subtitle="Every role gets exactly what they need — no clutter, no toxic comparison.">
        <Grid container spacing={3}>
          {ROLES.map((r) => (
            <Grid key={r.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...r} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section eyebrow="Designed in SA, for SA" title="The South African context — handled" subtitle="Aptiverse is built for the realities of matric in this country.">
        <Grid container spacing={3}>
          {SA_CONTEXT.map((s) => (
            <Grid key={s.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...s} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Box
        sx={{
          py: { xs: 8, md: 12 },
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
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ letterSpacing: "-0.02em" }}
                >
                  Start free. Grow at your pace.
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
                  The free tier is genuinely useful — goals, diary, basic practice
                  and the wellbeing toolkit. Upgrade only when you're ready.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button
                  component={Link}
                  href="/register"
                  size="large"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                >
                  Create free account
                </Button>
                <Button
                  component={Link}
                  href="/pricing"
                  size="large"
                  variant="outlined"
                >
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

const FEATURES = [
  {
    icon: <SchoolIcon />,
    title: "SBA-aligned planning",
    description: "Add your upcoming SBAs once. AI plans the lead-up, sets healthy goals from your history, and keeps you on track.",
    href: "/features#planning",
    accent: "primary" as const,
  },
  {
    icon: <AutoAwesomeIcon />,
    title: "AI practice tests",
    description: "Drilled to your weakest topics, with rubric-based marking and pattern analysis after every attempt.",
    href: "/features#practice",
    accent: "secondary" as const,
  },
  {
    icon: <InsightsIcon />,
    title: "Predictive mastery",
    description: "We track strengths over each term so you can prep for next term in advance — never blindsided.",
    href: "/features#mastery",
    accent: "info" as const,
  },
  {
    icon: <FavoriteIcon />,
    title: "Wellbeing first",
    description: "Mood check-ins, breathing breaks, in-app psychologist. We catch stress early and give you space to breathe.",
    href: "/features#wellbeing",
    accent: "secondary" as const,
  },
  {
    icon: <EmojiEventsIcon />,
    title: "Verified rewards",
    description: "Free courses, tutor hours, masterclasses, badges. Schools verify with one click — no paperwork for teachers.",
    href: "/features#rewards",
    accent: "warning" as const,
  },
  {
    icon: <PsychologyIcon />,
    title: "Always-on AI tutor",
    description: "A patient explainer, drill-generator and exam coach in your pocket. No question is too small.",
    href: "/features#chatbot",
    accent: "primary" as const,
  },
  {
    icon: <GroupIcon />,
    title: "Tutors & courses",
    description: "Verified tutors and specialised courses to bridge the gaps. Pay-per-session or subscribe — it's your choice.",
    href: "/features#marketplace",
    accent: "info" as const,
  },
  {
    icon: <WorkIcon />,
    title: "University & career",
    description: "Dream-course planner, APS calculator, real-life career stories — and the bursary navigator that helps you fund it.",
    href: "/careers",
    accent: "primary" as const,
  },
  {
    icon: <TimelineIcon />,
    title: "Learning journey map",
    description: "Visualise progress as a map of mastered landmarks — gamified for growth, never ranking.",
    href: "/features#journey",
    accent: "secondary" as const,
  },
];

const ROLES = [
  { icon: <SchoolIcon />, title: "For Students", description: "Plan, practise, reflect, win.", href: "/for-students", accent: "primary" as const },
  { icon: <FavoriteIcon />, title: "For Parents", description: "How can I help dashboards.", href: "/for-parents", accent: "secondary" as const },
  { icon: <MenuBookIcon />, title: "For Teachers", description: "Class-wide gap analysis.", href: "/for-teachers", accent: "info" as const },
  { icon: <InsightsIcon />, title: "For Schools", description: "Whole-school readiness.", href: "/for-schools", accent: "primary" as const },
  { icon: <GroupIcon />, title: "For Tutors", description: "Sell courses, run sessions.", href: "/for-tutors", accent: "warning" as const },
  { icon: <VolunteerActivismIcon />, title: "Bursary partners", description: "Find verified, motivated talent.", href: "/bursaries", accent: "success" as const },
];

const SA_CONTEXT = [
  {
    icon: <SignalCellularAltIcon />,
    title: "Data-light & offline",
    description: "Practice tests download. Diary works offline. Goals you set today sync next time you're online.",
    accent: "primary" as const,
  },
  {
    icon: <LanguageIcon />,
    title: "Multi-language support",
    description: "Key explanations and chatbot replies in isiZulu, Afrikaans, isiXhosa — and more rolling out.",
    accent: "primary" as const,
  },
  {
    icon: <MenuBookIcon />,
    title: "Catch-up modules",
    description: "Optional foundations like 'Algebra for Physics' or 'Grammar for Essays' to bridge real gaps.",
    accent: "primary" as const,
  },
  {
    icon: <VolunteerActivismIcon />,
    title: "NSFAS & bursary navigator",
    description: "Updated guides, deadline reminders, document checklists. Demystified, in plain language.",
    accent: "primary" as const,
  },
  {
    icon: <AssessmentIcon />,
    title: "IEB & NSC past papers",
    description: "AI links past paper questions to your specific upcoming SBA — instant, relevant practice.",
    accent: "primary" as const,
  },
  {
    icon: <FavoriteIcon />,
    title: "Mental health, normalised",
    description: "Stress is part of matric — we frame struggle as growth and connect you to a psychologist when needed.",
    accent: "primary" as const,
  },
];
