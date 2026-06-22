"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import GroupIcon from "@mui/icons-material/GroupsOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import SchoolIcon from "@mui/icons-material/School";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismOutlined";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import LanguageIcon from "@mui/icons-material/LanguageOutlined";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/common/Section";
import { FeatureCard } from "@/components/common/FeatureCard";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import {
  TutorChatDemo,
  MasteryChartDemo,
  MoodCheckInDemo,
} from "@/components/marketing/FeatureDemos";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* =====================================================================
          "How it works" — three big showcases. Replaces 9 generic cards.
      ===================================================================== */}
      <Section py={2}>
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="overline" color="primary.main">
            How Aptiverse works
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700 }}>
            One platform. Three things ChatGPT can&apos;t.
          </Typography>
        </Stack>

        <FeatureShowcase
          eyebrow="Curriculum-aware AI tutor"
          title="Knows your syllabus. Cites your textbook."
          body="Aptiverse's AI is anchored to the NSC, IEB and Cambridge curricula — so it references the exact textbook page and uses examiner-style language, not generic internet help."
          bullets={[
            "Stays in scope for your grade — won't introduce off-syllabus content",
            "Cites past-paper questions and markschemes",
            "Switches to Deep AI automatically for essays and long walk-throughs",
          ]}
          demo={<TutorChatDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="Predictive mastery"
          title="See your matric mark, months ahead."
          body="A continuous forecast of your final mark per subject, with a confidence interval. Spot the topics costing you the most marks before the exam — not in the autopsy."
          bullets={[
            "Updates every time you finish a practice set or SBA",
            "Identifies the three topics costing you the most marks",
            "Shareable with parents on Family tiers (anonymised available)",
          ]}
          demo={<MasteryChartDemo />}
        />

        <FeatureShowcase
          eyebrow="Wellbeing woven through"
          title="The platform watches for stress — not just marks."
          body="60-second daily check-ins surface stress trends weeks early. When you need a real human, HPCSA-registered counsellors are one tap away."
          bullets={[
            "Trend detection across days, not single-day reactions",
            "Diary is end-to-end encrypted — even Aptiverse staff can't read it",
            "First counselling session free on Family Pro+",
          ]}
          demo={<MoodCheckInDemo />}
        />
      </Section>

      {/* =====================================================================
          Role tiles — slimmed to 4. Click through to /for-{role} for detail.
      ===================================================================== */}
      <Section bg="paper" eyebrow="Built for you" title="Every role, a tailored view" subtitle="No clutter. No toxic comparison.">
        <Grid container spacing={3}>
          {ROLES.map((r) => (
            <Grid key={r.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <FeatureCard {...r} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* =====================================================================
          SA context — trimmed to 4 cards, tighter copy.
      ===================================================================== */}
      <Section eyebrow="Designed in SA, for SA" title="The South African context — handled" align="center">
        <Grid container spacing={3}>
          {SA_CONTEXT.map((s) => (
            <Grid key={s.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <FeatureCard {...s} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* =====================================================================
          Closing CTA.
      ===================================================================== */}
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
                <Typography variant="h3" component="h2" sx={{ letterSpacing: "-0.02em" }}>
                  Start free. Grow at your pace.
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
                  The free tier is genuinely useful — goals, diary, basic practice,
                  wellbeing tools. Upgrade only when you&apos;re ready.
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

const ROLES = [
  { icon: <SchoolIcon />, title: "Students", description: "Plan, practise, reflect, win.", href: "/for-students", accent: "primary" as const },
  { icon: <FavoriteIcon />, title: "Parents", description: "A calm dashboard, never invasive.", href: "/for-parents", accent: "secondary" as const },
  { icon: <GroupIcon />, title: "Tutors", description: "Sell sessions, manage clients, get paid.", href: "/for-tutors", accent: "warning" as const },
  { icon: <MenuBookIcon />, title: "Schools", description: "Whole-school readiness & gap analysis.", href: "/for-schools", accent: "info" as const },
];

const SA_CONTEXT = [
  {
    icon: <SignalCellularAltIcon />,
    title: "Data-light & offline",
    description: "Diary works offline. Practice tests cache. Sync next time you're online.",
    accent: "primary" as const,
  },
  {
    icon: <LanguageIcon />,
    title: "isiZulu · Afrikaans · isiXhosa",
    description: "Key explanations and AI replies in your home language.",
    accent: "primary" as const,
  },
  {
    icon: <VolunteerActivismIcon />,
    title: "NSFAS & bursary nav",
    description: "Deadlines, document checklists, eligibility — in plain language.",
    accent: "primary" as const,
  },
  {
    icon: <AssessmentIcon />,
    title: "IEB · NSC · Cambridge",
    description: "Real past papers, real markschemes, linked to your upcoming SBAs.",
    accent: "primary" as const,
  },
];
