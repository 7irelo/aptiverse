"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Link from "next/link";
import {
  CalendarDays,
  BookOpen,
  Target,
  Sparkles,
  Bot,
  TrendingUp,
  HeartPulse,
  Trophy,
  FileText,
  ClipboardCheck,
  Compass,
  GraduationCap,
  WifiOff,
  Languages,
  Gauge,
  ChevronDown,
} from "lucide-react";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { FeatureCard } from "@/components/common/FeatureCard";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import {
  MasteryChartDemo,
  TutorChatDemo,
  AdaptivePracticeDemo,
  PastPaperDemo,
  MoodCheckInDemo,
} from "@/components/marketing/FeatureDemos";

export default function ForStudentsPage() {
  return (
    <>
      <GradientBackdrop variant="hero">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 12 } }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 6, lg: 10 }} alignItems="center">
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              <Chip
                label="For students"
                size="small"
                sx={{ alignSelf: "flex-start", bgcolor: "background.paper", border: 1, borderColor: "divider", fontWeight: 600 }}
              />
              <Typography variant="h1" component="h1">
                Study with a plan, not panic.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 520 }}>
                Know what to practise next, watch where your marks are heading, and get a nudge to rest before you burn out. From Grade R to your final year at university.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap>
                <Button component={Link} href="/register" variant="contained" size="large">
                  Start free
                </Button>
                <Button component={Link} href="/pricing" variant="outlined" size="large">
                  See pricing
                </Button>
              </Stack>
            </Stack>
            <Box sx={{ flex: 1, width: "100%", maxWidth: 540, mx: "auto" }}>
              <MasteryChartDemo />
            </Box>
          </Stack>
        </Box>
      </GradientBackdrop>

      {/* How a week works */}
      <Section eyebrow="How it works" title="A rhythm you can actually keep" subtitle="Aptiverse turns a term into a loop you repeat each week, not a mountain you face the night before the exam.">
        <Grid container spacing={3}>
          {STEPS.map((s, i) => (
            <Grid key={s.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <StepCard n={i + 1} {...s} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Learn */}
      <Section bg="paper" py={2}>
        <FeatureShowcase
          eyebrow="Study assistant"
          title="Stuck at 11pm? Just ask."
          body="The assistant follows your curriculum, from NSC and IEB subjects to university modules, and walks you through the problem instead of handing over the answer."
          bullets={[
            "Explains a concept, then sets you a question to try",
            "Cites your textbook and past papers, not random web pages",
            "Stays in scope for your grade or module",
            "Quick answers for small questions, deep help for big ones",
          ]}
          demo={<TutorChatDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="Adaptive practice"
          title="Practice that levels up with you."
          body="Get a question right and the next one gets harder. Get it wrong and Aptiverse slows down and reteaches. You are always working at the edge of what you can do."
          bullets={[
            "Difficulty scales question by question",
            "Weak topics come back until they stick",
            "Every set feeds your forecast",
          ]}
          demo={<AdaptivePracticeDemo />}
        />

        <FeatureShowcase
          eyebrow="Past papers, worked"
          title="Every mark, accounted for."
          body="Real past papers with step-by-step solutions tied to the marking memo, so you learn exactly how the marks are awarded, not just the final answer."
          bullets={[
            "Worked solutions mapped to the memo",
            "Filter by topic, year, or paper",
            "See where you drop marks and why",
          ]}
          demo={<PastPaperDemo />}
        />
      </Section>

      {/* Wellbeing */}
      <Section py={2}>
        <FeatureShowcase
          reverse
          eyebrow="Wellbeing"
          title="Marks matter. So do you."
          body="A 60-second daily check-in tracks the trend, not the snapshot, and surfaces help before you have to ask. Your diary is encrypted on your device, so it stays yours."
          bullets={[
            "Catches a stressful stretch early",
            "A break any time, or a counsellor on paid plans",
            "A private diary only you can read",
          ]}
          demo={<MoodCheckInDemo />}
        />
      </Section>

      {/* Stage aware */}
      <Section bg="paper" eyebrow="School or university" title="It grows up with you" subtitle="The same account adapts as you move from school to university. Nothing to relearn.">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <StageCard
              icon={<BookOpen size={20} />}
              label="At school"
              items={[
                "Subjects, SBAs, and term marks",
                "NSC and IEB past papers with memos",
                "Goals you set, broken into weekly steps",
                "Wellbeing built in",
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <StageCard
              icon={<GraduationCap size={20} />}
              label="At university"
              items={[
                "Modules, credits, and coursework deadlines",
                "Course material and your own uploads",
                "Forecasts per module, not just per subject",
                "Career matching for after you graduate",
              ]}
            />
          </Grid>
        </Grid>
      </Section>

      {/* SA context */}
      <Section eyebrow="Built for here" title="It works the way South Africa works" align="center">
        <Grid container spacing={3}>
          {SA_CONTEXT.map((s) => (
            <Grid key={s.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...s} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Everything */}
      <Section bg="paper" eyebrow="Everything in one place" title="One account, the whole toolkit">
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* FAQ */}
      <Section py={6}>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Stack spacing={1.5} sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="overline" color="primary.main">
              Questions
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
              Good to know
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {FAQ.map((f) => (
              <Accordion
                key={f.q}
                disableGutters
                elevation={0}
                sx={{ border: 1, borderColor: "divider", borderRadius: 2, "&:before": { display: "none" } }}
              >
                <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                  <Typography sx={{ fontWeight: 600 }}>{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {f.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      </Section>

      {/* CTA */}
      <Section py={6}>
        <Stack spacing={2} alignItems="center" sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
            Start free, grow at your pace.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
            Goals, the diary, basic practice, and the wellbeing tools are free, no card needed. Upgrade only when you are ready.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap justifyContent="center">
            <Button component={Link} href="/register" variant="contained" size="large">
              Create free account
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

function StepCard({ n, icon, title, body }: { n: number; icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "brandSurface.main",
              color: "brandSurface.contrastText",
            }}
          >
            {icon}
          </Box>
          <Typography variant="overline" color="text.secondary">
            Step {n}
          </Typography>
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </CardContent>
    </Card>
  );
}

function StageCard({ icon, label, items }: { icon: React.ReactNode; label: string; items: string[] }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
        </Stack>
        <Stack spacing={1.25}>
          {items.map((t) => (
            <Stack key={t} direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{ mt: 0.75, width: 6, height: 6, borderRadius: "50%", bgcolor: "brandSurface.main", flexShrink: 0 }} />
              <Typography variant="body2">{t}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

const STEPS = [
  { icon: <CalendarDays size={18} />, title: "Plan", body: "Your week is laid out around real deadlines, with rest built in, not bolted on." },
  { icon: <BookOpen size={18} />, title: "Learn", body: "Work through topics with the assistant beside you, in scope for your grade or module." },
  { icon: <Target size={18} />, title: "Practise", body: "Adaptive sets and past papers that get harder as you improve." },
  { icon: <Sparkles size={18} />, title: "Reflect", body: "A quick check-in and diary entry, so you notice progress and stress alike." },
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
    description: "Explanations and assistant replies in any of South Africa's 11 official languages.",
    accent: "primary" as const,
  },
  {
    icon: <Gauge size={18} />,
    title: "Curriculum-true",
    description: "Built around CAPS, NSC, and IEB, and your university's modules, not a foreign syllabus.",
    accent: "primary" as const,
  },
];

const FEATURES = [
  {
    icon: <Bot size={18} />,
    title: "Study assistant",
    description: "Curriculum-aware AI that guides you through the work instead of handing over answers.",
    accent: "primary" as const,
  },
  {
    icon: <Target size={18} />,
    title: "Adaptive practice",
    description: "Question difficulty that scales to your level, so you are always stretching.",
    accent: "primary" as const,
  },
  {
    icon: <FileText size={18} />,
    title: "Past papers and resources",
    description: "Real papers with worked solutions for school, course material for university.",
    accent: "primary" as const,
  },
  {
    icon: <TrendingUp size={18} />,
    title: "Mastery predictions",
    description: "See which topics will trip you up next, before they do.",
    accent: "info" as const,
  },
  {
    icon: <ClipboardCheck size={18} />,
    title: "Exam practice",
    description: "Sit a timed paper, then get a clear read on where you lost marks.",
    accent: "info" as const,
  },
  {
    icon: <HeartPulse size={18} />,
    title: "Wellbeing tools",
    description: "Daily check-ins, breathing breaks, and a private, encrypted diary.",
    accent: "secondary" as const,
  },
  {
    icon: <Compass size={18} />,
    title: "Career match",
    description: "Match your marks and interests to realistic career paths, grounded in SA data.",
    accent: "secondary" as const,
  },
  {
    icon: <CalendarDays size={18} />,
    title: "Study planner",
    description: "A weekly plan that blends your deadlines, practice, and rest.",
    accent: "success" as const,
  },
  {
    icon: <Trophy size={18} />,
    title: "Goals and streaks",
    description: "Set goals, build streaks, and earn milestones for real progress.",
    accent: "warning" as const,
  },
];

const FAQ = [
  {
    q: "Is it really useful on the free plan?",
    a: "Yes. Goals, the study planner, the encrypted diary, mood check-ins, and basic practice are all free, with a monthly allowance of AI study questions. You only pay when you want the full assistant, predictions, and past papers.",
  },
  {
    q: "I am at university, not school. Does it fit?",
    a: "Yes. Switch your stage and Aptiverse shows modules, credits, and coursework instead of subjects and SBAs, with forecasts per module and career matching for after you graduate.",
  },
  {
    q: "Does the assistant just give me the answers?",
    a: "No, and that is deliberate. It explains the concept, then sets you a question to try. You learn how to get there, which is what actually moves your marks.",
  },
  {
    q: "Can my parents read my diary?",
    a: "Never. The diary is end-to-end encrypted on your device. Not your parents, not us. Parents on a Family plan see trends and celebrations, never the words.",
  },
  {
    q: "Will it work on a cheap phone with little data?",
    a: "Yes. Aptiverse is built mobile-first and data-light. The diary works offline and practice caches, syncing when you are back online.",
  },
];
