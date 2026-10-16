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
  BookOpenCheck,
  ShieldCheck,
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

        {/* Claims checked against the tutor's actual system prompt.
            "Stays in scope for your course" was the opposite of the truth: the
            prompt says "Answer the question you are actually asked. Never tell
            a student that a subject or level is not your focus." And it points
            you to no sources, so "points you to the right source" described
            nothing. What it really does is know your level and subjects, which
            is worth saying plainly. */}
        <FeatureShowcase
          eyebrow="A tutor that knows what you are studying"
          title="It knows your subjects, so you stop re-explaining yourself."
          body="It reads your grade or your modules from your profile, so a Grade 11 term test and a second-year module get answered differently. Ask it anything academic and it helps, whatever the subject."
          bullets={[
            "Pitched at your level, not a generic one",
            "Shows the working step by step, and sets you original questions to try",
            "Gives structure on essays instead of writing them for you",
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

      {/* Three audiences: students, parents, tutors. */}
      <Section
        bg="paper"
        eyebrow="Built for you"
        title="Made for students, parents, and tutors"
        subtitle="A focused workspace for the student, a calm read for the parent, and a profile that gets tutors found."
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
                  The free tier is genuinely useful: goals, diary, practice, past papers,
                  term predictions, and the whole career navigator. Upgrade only when you
                  are ready.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button
                  component={Link}
                  href="/register"
                  size="large"
                  variant="contained"
                  color="secondary"
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
    // Not "watch your results climb". We cannot promise an outcome, and a
    // student who works and does not climb was told a lie about themselves.
    // "Plan your term" was reading as the study planner, which does not
    // exist. Tracking your own assessments is the real thing.
    title: "Students",
    description: "Track your term, practise what you are weakest at, and keep an honest read on how you are doing.",
    href: "/for-students",
    accent: "primary" as const,
  },
  {
    icon: <Users size={18} />,
    // "An honest read on how each child is doing, academically and
    // emotionally" is two reads a parent cannot get. No endpoint returns a
    // child's marks or mood to a parent; ParentLink is consulted in exactly
    // one file. What they get is the children they linked and what is due.
    title: "Parents",
    description: "See your children's deadlines in one place, and nothing they would not want you reading.",
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

// Every line here has to survive someone opening the app and checking.
//
// What used to be here did not. "The diary works offline and practice caches"
// described a feature that does not exist in any form: there is no service
// worker, no manifest, no local store, nothing. "All 11 official languages"
// was both unbuilt and wrong, since South Africa has had 12 since South African
// Sign Language was recognised in 2023. And "real past papers" implied a
// library we host, when /dashboard/past-papers is a link to the DBE's own
// public archive.
//
// A parent deciding where their money goes deserves better than three
// sentences we would have to walk back.
const SA_CONTEXT = [
  {
    icon: <BookOpenCheck size={18} />,
    title: "CAPS and university, together",
    description:
      "Grade 10 to 12 on the CAPS curriculum, and your own modules if you are at university. The assistant pitches to whichever you are actually doing.",
    accent: "primary" as const,
  },
  {
    icon: <FileCheck2 size={18} />,
    title: "Straight to the DBE archive",
    description:
      "Past papers come from the Department of Basic Education's official NSC archive. We point you at the real thing rather than a copy of it.",
    accent: "primary" as const,
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Your diary stays yours",
    description:
      "What you write is private. Parents see how you are tracking, never what you wrote.",
    accent: "primary" as const,
  },
];
