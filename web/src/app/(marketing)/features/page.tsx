"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import {
  Target,
  FileText,
  ClipboardCheck,
  CalendarDays,
  Lock,
  Wind,
  HeartHandshake,
  Flag,
  ListChecks,
  CalendarCheck,
  LayoutDashboard,
  TrendingUp,
  HeartPulse,
  PartyPopper,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";
import { Section } from "@/components/common/Section";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { FeatureCard } from "@/components/common/FeatureCard";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { TutorChatDemo, MasteryChartDemo, MoodCheckInDemo, DiaryEncryptedDemo } from "@/components/marketing/FeatureDemos";

export default function FeaturesPage() {
  return (
    <>
      <GradientBackdrop variant="hero">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 820 }}>
            <Typography variant="overline" color="primary.main">
              The full toolkit
            </Typography>
            <Typography variant="h1" component="h1">
              Everything you need to do well, and stay well.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              One place for your learning and your wellbeing, from your first term to your last exam.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }} flexWrap="wrap" useFlexGap>
              <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
                Start free
              </Button>
              <Button component={Link} href="/pricing" variant="outlined" size="large">
                See pricing
              </Button>
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      {/* Learn */}
      <Section py={2}>
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: 2, maxWidth: 720, mx: "auto" }}>
          <Typography variant="overline" color="primary.main">
            Learn
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700 }}>
            Study smarter, with less guesswork.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The tools do the heavy lifting: what to practise, where you are losing marks, and how to fix it.
          </Typography>
        </Stack>

        <FeatureShowcase
          eyebrow="Study assistant"
          title="Answers anchored to your work."
          body="The assistant follows your curriculum, from school subjects to university modules, and points you at the exact material instead of the whole internet."
          bullets={[
            "Stays in scope for your grade or module",
            "Cites your material, not random web sources",
            "Explains a concept, then sets you a practice question",
            "Guides you through the work instead of handing over answers",
          ]}
          demo={<TutorChatDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="Mastery predictions"
          title="See where your marks are heading."
          body="A continuous forecast of your result per subject or module, with the topics costing you the most, so you can act while there is still time."
          bullets={[
            "A forecast with a confidence band, not just today's mark",
            "Flags the topics that need work",
            "Updates every time you finish a task",
            "Shareable with a parent on Family plans",
          ]}
          demo={<MasteryChartDemo />}
        />

        <Box sx={{ pt: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", textAlign: "center", mb: 2 }}>
            Also in Learn
          </Typography>
          <Grid container spacing={3}>
            {LEARN_EXTRAS.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <FeatureCard {...f} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Section>

      {/* Wellbeing */}
      <Section bg="paper" py={2}>
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: 2, maxWidth: 720, mx: "auto" }}>
          <Typography variant="overline" color="primary.main">
            Wellbeing
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700 }}>
            Marks matter. So does how you feel.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The platform watches for stress, gives you tools, and connects you to a real person when you need one.
          </Typography>
        </Stack>

        <FeatureShowcase
          eyebrow="Daily check-in"
          title="Sixty seconds a day, and it catches the spiral early."
          body="A quick daily check-in tracks the trend, not the snapshot, and surfaces help before you have to ask for it."
          bullets={[
            "Trend detection across days, not single bad days",
            "Gentle nudges toward a break or a counsellor",
            "A weekly mood view, never a guilt trip",
            "Your content stays private, even from us",
          ]}
          demo={<MoodCheckInDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="Private diary"
          title="A place to think that no one else can read."
          body="The diary is encrypted on your device, so the key never leaves your phone. Reflect honestly, because it is genuinely yours, not ours and not your parents'."
          bullets={[
            "End-to-end encrypted, even we cannot read it",
            "Gentle nightly prompts to reflect",
            "Works offline, syncs when you are back online",
          ]}
          demo={<DiaryEncryptedDemo />}
        />

        <Box sx={{ pt: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", textAlign: "center", mb: 2 }}>
            Also in Wellbeing
          </Typography>
          <Grid container spacing={3}>
            {WELLBEING_EXTRAS.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <FeatureCard {...f} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Section>

      {/* Goals */}
      <Section eyebrow="Goals" title="Set your own goals, as granular as you like" subtitle="Big ambitions or small daily habits. Break them into steps and let Aptiverse keep you on track.">
        <Grid container spacing={3}>
          {GOALS.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* For families */}
      <Section bg="paper" eyebrow="For families" title="A calm view, never an invasive one" subtitle="Families see how each child is doing, academically and emotionally. They never see the private diary.">
        <Grid container spacing={3}>
          {FOR_PARENTS.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section py={6}>
        <Stack spacing={2} alignItems="center" sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
            See the whole thing.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620 }}>
            The free tier gets you goals, the diary, basic practice, and wellbeing tools, no card needed.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap>
            <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
              Start free
            </Button>
            <Button component={Link} href="/pricing" variant="outlined" size="large">
              See pricing
            </Button>
          </Stack>
        </Stack>
      </Section>
    </>
  );
}

const LEARN_EXTRAS = [
  {
    icon: <Target size={18} />,
    title: "Adaptive practice",
    description: "Difficulty scales to your level, so you are always stretching without drowning.",
    accent: "primary" as const,
  },
  {
    icon: <FileText size={18} />,
    title: "Past papers and resources",
    description: "Real papers with worked solutions for school, course material for university.",
    accent: "primary" as const,
  },
  {
    icon: <ClipboardCheck size={18} />,
    title: "Exam practice",
    description: "Sit a timed paper, then get a clear read on where you lost marks.",
    accent: "primary" as const,
  },
  {
    icon: <CalendarDays size={18} />,
    title: "Study planner",
    description: "A weekly plan that blends deadlines, practice, and rest.",
    accent: "primary" as const,
  },
];

const WELLBEING_EXTRAS = [
  {
    icon: <Lock size={18} />,
    title: "Private diary",
    description: "End-to-end encrypted on your device. Not us, not your parents. Only you.",
    accent: "secondary" as const,
  },
  {
    icon: <Wind size={18} />,
    title: "Take a break",
    description: "A minute of breathing or a short reset when you have been at it too long.",
    accent: "secondary" as const,
  },
  {
    icon: <HeartHandshake size={18} />,
    title: "Talk to a counsellor",
    description: "A registered counsellor, one tap away when you need a real person. Included on paid plans.",
    accent: "secondary" as const,
  },
  {
    icon: <PartyPopper size={18} />,
    title: "Celebrate wins",
    description: "Reach a goal or a streak and Aptiverse marks the moment, gently.",
    accent: "secondary" as const,
  },
];

const GOALS = [
  {
    icon: <Flag size={18} />,
    title: "Set any goal",
    description: "Academic, a habit, or something personal. For the term, or just for today.",
    accent: "primary" as const,
  },
  {
    icon: <ListChecks size={18} />,
    title: "Break it into steps",
    description: "Split a big goal into small, granular milestones you can actually finish.",
    accent: "primary" as const,
  },
  {
    icon: <CalendarCheck size={18} />,
    title: "Weekly targets",
    description: "Turn milestones into a weekly plan that fits around your real deadlines.",
    accent: "info" as const,
  },
  {
    icon: <TrendingUp size={18} />,
    title: "Track progress",
    description: "Watch streaks and completion build, and adjust the plan as you go.",
    accent: "success" as const,
  },
];

const FOR_PARENTS = [
  {
    icon: <LayoutDashboard size={18} />,
    title: "Parent dashboard",
    description: "One view across your children: what they are studying, how they are feeling, what is coming up.",
    accent: "primary" as const,
  },
  {
    icon: <TrendingUp size={18} />,
    title: "Result forecast",
    description: "A per-child forecast of their final mark, so you see where they are heading.",
    accent: "primary" as const,
  },
  {
    icon: <HeartPulse size={18} />,
    title: "Wellbeing summary",
    description: "Mood and stress trends per child, with the diary content always kept private.",
    accent: "secondary" as const,
  },
  {
    icon: <PartyPopper size={18} />,
    title: "Celebration alerts",
    description: "Streaks, goals, and good news, not just problems.",
    accent: "secondary" as const,
  },
  {
    icon: <CalendarClock size={18} />,
    title: "Shared calendar",
    description: "Exams, deadlines, and check-ins for the family, in one place.",
    accent: "info" as const,
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Private by design",
    description: "You see trends and celebrations. You never see the diary. That boundary is built in.",
    accent: "success" as const,
  },
];
