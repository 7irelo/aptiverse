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
  BookOpenCheck,
  Users,
  Gauge,
  Timer,
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
              {/* "Get a nudge to rest before you burn out" promised detection
                  and an intervention, neither of which exists. */}
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 520 }}>
                Practise what you are weakest at, watch where your marks are heading, and keep an honest eye on how you are holding up. From Grade 10 to your final year at university.
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
            <Box sx={{ flex: 1, width: "100%", maxWidth: 540, mx: "auto" }}>
              <MasteryChartDemo />
            </Box>
          </Stack>
        </Box>
      </GradientBackdrop>

      {/* How a week works */}
      <Section eyebrow="How it works" title="A rhythm you can actually keep" subtitle="Aptiverse turns a term or semester into a loop you repeat each week, not a mountain you face the night before the exam.">
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
        {/* "Cites your textbook and past papers" is not a thing the tutor can
            do: no retrieval, no index, no citations in api/Modules/AI. "Stays
            in scope" is contradicted by the prompt itself, which says never to
            tell a student a subject is not your focus (AiController.cs:219). */}
        <FeatureShowcase
          eyebrow="Study assistant"
          title="Stuck at 11pm? Just ask."
          body="It already knows your level, your subjects or courses, your marks and what is due next, so you can ask the question instead of explaining your life first. Anything academic, any subject."
          bullets={[
            "Explains a concept, then sets you a question to try",
            "Shows the working step by step, in your subjects",
            "Structure on essays, not an essay to hand in",
            "Quick answers for small questions, deep help for big ones",
          ]}
          demo={<TutorChatDemo />}
        />

        {/* This whole showcase described a feature that does not exist.
            Difficulty does not scale question by question: you choose
            foundation, core or challenge before the set is generated
            (practice/page.tsx:183) and that choice is passed straight through
            (PracticeController.cs:178). Nothing re-reads your performance
            mid-set, nothing reteaches, and weak topics do not resurface; the
            only topic list fed to the generator is the subject's existing
            vocabulary, used so Claude reuses labels instead of inventing
            synonyms (:214-219).

            The real feature is still a good one: Claude writes you a fresh set
            on any topic you name, in five formats, and it gets marked. That is
            what this now sells. */}
        <FeatureShowcase
          reverse
          eyebrow="Practice"
          title="A fresh set on anything, whenever you want it."
          body="Name a topic and Aptiverse writes you a new set at the difficulty you choose. Nothing comes from a bank, so you cannot memorise your way around it."
          bullets={[
            "Multiple choice, short answer, reading, flashcards, or essay",
            "Foundation, core, or challenge, your call",
            "Marked automatically, and every question feeds your topic mastery",
          ]}
          demo={<AdaptivePracticeDemo />}
        />

        {/* "Real past papers with step-by-step solutions tied to the marking
            memo" was flatly contradicted by the page it describes:
            past-papers/page.tsx:24 says we deliberately do not host papers,
            because the DBE maintains the authoritative archive and re-hosting
            risks copyright and staleness. That is a good decision, honestly
            reasoned, in a comment nobody selling it ever read. There are no
            worked solutions, no memo mapping and no year filter, because there
            is no library. */}
        <FeatureShowcase
          eyebrow="Past papers"
          title="The real archive, not a copy of it."
          body="Past papers come straight from the Department of Basic Education's official NSC archive. We do not re-host them, so you are never working off a stale copy of the wrong year."
          bullets={[
            "Links into the official DBE archive",
            "A study note per subject on how that paper is marked",
            "Mark yourself against the official memo",
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
          // "Your diary is encrypted on your device" was not true, and this is
          // the page where a student decides whether to be honest in it.
          //
          // The body still claimed the app "surfaces help before you have to
          // ask", and the bullets sold a break tool, a counsellor, and early
          // detection. None of the three exist: no trend detection, no
          // breathing tool, and GetCounsellors returns an empty array. This is
          // the page a struggling student reads before deciding to trust us, so
          // it gets the plainest version of the truth. You do the noticing; we
          // keep the record and stay out of your family's hands.
          body="A 60-second daily check-in, kept week after week, so you can see a run of hard days for what it is. It is yours: no parent endpoint returns a mood or an entry, so nobody at home has a screen for it."
          bullets={[
            "Your mood, charted across days, not judged",
            "A diary no one in your family can open",
            "SADAG's free counselling line, on the page, always"
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
              // "NSC and IEB past papers with memos" oversold twice: the
              // archive we link is the DBE's, which is NSC only, and we host
              // no memos. "Goals broken into weekly steps" has no
              // implementation on either side of the wire.
              items={[
                "Subjects, assessments, and term marks",
                "The official DBE NSC past paper archive",
                "Goals checked against your real practice and mastery",
                "Wellbeing built in",
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <StageCard
              icon={<GraduationCap size={20} />}
              label="At university"
              // Uploads do not exist: WorkspaceController has GET and PUT on a
              // text draft and nothing else. The autosaved draft is real, so
              // that is what it says.
              items={[
                "Courses, lecturers, and coursework deadlines",
                "An autosaved draft per assessment, in the workspace",
                "A projection per course, built from marks you log",
                "Career targets tracked against your course marks",
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
            Goals, the diary, mood check-ins, practice, past papers, and the career navigator are free, no card needed. Upgrade only when you are ready.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap justifyContent="center">
            <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
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

// "Plan: your week is laid out around real deadlines, with rest built in" was
// describing the study planner, which does not exist. What does exist is the
// calendar and assessment tracking you fill in yourself, so Plan is now that.
// "Practise: adaptive sets that get harder as you improve" is the same
// non-existent adaptivity as everywhere else on this page.
const STEPS = [
  { icon: <CalendarDays size={18} />, title: "Track", body: "Log your subjects or courses and what is due, so the whole term stops living in your head." },
  { icon: <BookOpen size={18} />, title: "Learn", body: "Work through topics with the assistant beside you, pitched at your level." },
  { icon: <Target size={18} />, title: "Practise", body: "Generate a set on the topic you are weakest at, and let it mark you." },
  { icon: <Sparkles size={18} />, title: "Reflect", body: "A quick check-in and diary entry, so you notice progress and stress alike." },
];

const SA_CONTEXT = [
  {
    icon: <BookOpenCheck size={18} />,
    // Was "Data-light and offline". No service worker, no local store, no
    // sync: the whole feature was imaginary.
    title: "CAPS and university, together",
    description:
      "Grade 10 to 12 on CAPS, or your own modules if you are at university. The assistant pitches to whichever you are doing.",
    accent: "primary" as const,
  },
  // "All 11 official languages: explanations and assistant replies in any of
  // South Africa's 11 official languages." Wrong twice over. There is no
  // multilingual support at all: no i18n library in package.json, no locale
  // routing, no language field on the user or on any AI call, and the tutor
  // prompt asks for "plain South African English" (AiController.cs:209). The
  // only language-shaped strings in the repo are subject names like Afrikaans
  // FAL. And the count was stale anyway: South Africa has had 12 official
  // languages since South African Sign Language was recognised in 2023.
  //
  // Replaced with the DBE link-out, which is real and specific to here.
  {
    icon: <FileText size={18} />,
    title: "The official DBE archive",
    description: "Past papers come from the Department of Basic Education's own NSC archive, not a re-hosted copy.",
    accent: "primary" as const,
  },
  {
    icon: <Gauge size={18} />,
    title: "Curriculum-true",
    description: "Built around CAPS and the NSC, and your own courses if you are at university, not a foreign syllabus.",
    accent: "primary" as const,
  },
];

// Nine cards, five of them wrong. "Adaptive practice" (you pick the
// difficulty), "Past papers with worked solutions" (a DBE link-out),
// "Exam practice" (was being built, not shipped; it has since shipped and is
// back as its own card, described off the code), "Study planner" (does not exist
// in any form), and "breathing breaks, and a private, encrypted diary" (no
// breathing tool, no encryption). "Earn milestones" is unbuildable in the UI:
// the API has full milestone CRUD but the page's write buttons have no
// handlers, so no student can make one.
//
// Replaced with nine that are real. Study groups, the workspace and the tutor
// directory were all shipped and unmentioned.
const FEATURES = [
  {
    icon: <Bot size={18} />,
    title: "Study assistant",
    description: "Knows your level, subjects and marks, and guides you through the work instead of handing over answers.",
    accent: "primary" as const,
  },
  {
    icon: <Target size={18} />,
    title: "Practice on demand",
    description: "A fresh set on any topic, at the difficulty you pick, marked automatically.",
    accent: "primary" as const,
  },
  {
    icon: <FileText size={18} />,
    title: "Past papers",
    description: "Straight into the official DBE archive, with a study note per subject.",
    accent: "primary" as const,
  },
  {
    icon: <Timer size={18} />,
    title: "Exam simulator",
    description:
      "A full paper in sections, 30 to 150 marks, timed at about a minute a mark. One attempt, marked with part marks. On Student Max.",
    accent: "primary" as const,
  },
  {
    icon: <TrendingUp size={18} />,
    title: "Mastery and predictions",
    description: "Per-topic mastery from your real attempts, and a projected mark for your next term or semester.",
    accent: "info" as const,
  },
  {
    icon: <ClipboardCheck size={18} />,
    title: "Assessment tracking",
    description: "Log what is due and what you scored. Your projection is built from it.",
    accent: "info" as const,
  },
  {
    icon: <HeartPulse size={18} />,
    title: "Wellbeing tools",
    description: "Daily mood check-ins, a mood chart across the year, and a diary your family cannot open.",
    accent: "secondary" as const,
  },
  {
    icon: <Compass size={18} />,
    title: "Career navigator",
    description: "Enter what your course needs and track every requirement against the marks you have. Free.",
    accent: "secondary" as const,
  },
  {
    icon: <Users size={18} />,
    title: "Study groups and workspace",
    description: "Study alongside other people, schedule sessions, and keep your drafts per assessment.",
    accent: "success" as const,
  },
  {
    icon: <Trophy size={18} />,
    title: "Goals, streaks, and rewards",
    description: "Goals checked against your real evidence. Points for beating your own best, spent on higher limits.",
    accent: "warning" as const,
  },
];

const FAQ = [
  {
    q: "Is it really useful on the free plan?",
    a: "Yes. Goals, the diary, mood check-ins, practice, past papers, and the whole career navigator are free, with a monthly allowance of AI study questions. You only pay when you want the full assistant, more practice, and predictions.",
  },
  {
    q: "I am at university, not school. Does it fit?",
    // Was "past papers" for school and "career matching" for university. Past
    // papers are a DBE link-out, so a university student gets nothing there,
    // and it would be a poor reason to pick us. Career matching is the career
    // navigator, which is real but works off requirements you enter yourself,
    // not a matching engine.
    a: "Yes. Set your stage to tertiary and Aptiverse shows the courses you added and their coursework instead of school subjects, with a projection per course. The career navigator works the same either way: you enter what your degree or your next year needs, and it tracks each requirement against your real marks.",
  },
  {
    q: "Does the assistant just give me the answers?",
    a: "No, and that is deliberate. It explains the concept, then sets you a question to try. You learn how to get there, which is what actually moves your marks.",
  },
  {
    q: "Can my parents read my diary?",
    // Was: "end-to-end encrypted on your device. Not your parents, not us."
    // The first half is invented and the second half is false because of it.
    // A student deciding how honest to be in a diary is owed the real answer,
    // including the part that is not flattering to us. The access boundary is
    // real and enforced; the cryptography was never built.
    a: "Your parents, no. There is no screen in the parent view that shows entries and no endpoint that returns them, so it is not a setting they can turn on. Being straight with you about the rest: entries are stored on our servers as ordinary text, not encrypted on your device, so Aptiverse staff access is governed by our privacy policy rather than by mathematics. If that matters to you, it should shape what you write.",
  },
  {
    q: "Will it work on a cheap phone with little data?",
    // Was "the diary works offline and practice caches, syncing when you are
    // back online". There is no service worker, no manifest, no local store
    // and no sync anywhere in the app. The mobile-first half is true.
    a: "It is built mobile-first and is light on data, so it holds up on a modest phone. It does need a connection, though: there is no offline mode, and nothing you write is stored on the phone to sync later.",
  },
];
