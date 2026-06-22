"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { Section } from "@/components/common/Section";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { FeatureCard } from "@/components/common/FeatureCard";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import {
  TutorChatDemo,
  SbaCoachDemo,
  MasteryChartDemo,
  PastPaperDemo,
  AdaptivePracticeDemo,
  ExamSimulatorDemo,
  MoodCheckInDemo,
  DiaryEncryptedDemo,
  TakeABreakDemo,
  CounsellingDemo,
} from "@/components/marketing/FeatureDemos";

// Marketing-page icons
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import PsychologyIcon from "@mui/icons-material/PsychologyOutlined";
import GroupIcon from "@mui/icons-material/GroupsOutlined";
import EventNoteIcon from "@mui/icons-material/EventNoteOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismOutlined";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroomOutlined";
import CastForEducationIcon from "@mui/icons-material/CastForEducationOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import ChatBubbleIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ReceiptIcon from "@mui/icons-material/ReceiptLongOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import InsightsIcon from "@mui/icons-material/Insights";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";

export default function FeaturesPage() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 860 }}>
            <Typography variant="overline" color="primary.main">
              The full toolkit
            </Typography>
            <Typography variant="h1" component="h1">
              An AI tutor that actually knows the South African syllabus.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Aptiverse is built around the FET-phase NSC, IEB and Cambridge curricula. Every
              feature is tied to real markschemes, real SBA rubrics and real ZA labour-market
              data — so the advice you get is specific to where you are, not generic internet help.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
              <Button component={Link} href="/register" variant="contained" size="large">
                Start free
              </Button>
              <Button component={Link} href="/demo" variant="outlined" size="large">
                Book a demo
              </Button>
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      {/* ====================================================================
          The moat — six things you can't get from a generic AI chatbot.
          Each block alternates text-left / demo-right with a real mini-demo.
      ==================================================================== */}
      <Section py={2}>
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="overline" color="primary.main">
            Built for the SA curriculum
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700 }}>
            Six things ChatGPT can&apos;t do
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mx: "auto" }}>
            Aptiverse is anchored to the actual NSC / IEB / Cambridge syllabus, SBA rubrics,
            and your own data — so it knows what your exam paper will look like, what an
            examiner rewards, and where you&apos;re losing marks. Real screenshots below.
          </Typography>
        </Stack>

        <FeatureShowcase
          eyebrow="Curriculum-aware AI tutor"
          title="Knows your syllabus. Cites your textbook. Talks like your examiner."
          body="Generic AI gives you generic answers. Aptiverse's AI references the exact NSC / IEB / Cambridge topic, points to the specific textbook page, and frames explanations in examiner-style language — so what you learn is what you'll be tested on."
          bullets={[
            "Anchored to the FET-phase curriculum graph (NSC, IEB & Cambridge)",
            "Cites textbook pages and past-paper questions, not random web sources",
            "Stays in scope for your grade — won't introduce off-syllabus content",
            "Switches to Deep AI automatically for essays, marking and long walk-throughs",
          ]}
          demo={<TutorChatDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="SBA Coach"
          title="Live feedback on your SBA draft — against the actual rubric."
          body="Paste your draft. The Coach annotates it inline against the SBA rubric your teacher will mark you on, flagging weak claims, missing evidence, and structural issues. It learns from past markschemes so its feedback matches what the examiner is looking for."
          bullets={[
            "Inline annotations tied to specific rubric criteria, not vague writing tips",
            "Surfaces what's missing — named entities, dates, cited evidence",
            "Tracks your improvement across drafts so you can see what's working",
            "Available for History, Life Sciences, English, Business Studies SBAs and more",
          ]}
          demo={<SbaCoachDemo />}
        />

        <FeatureShowcase
          eyebrow="Mastery predictions"
          title="A forecast of your matric mark — months before you sit it."
          body="Most students discover they're behind in November. Aptiverse uses your mastery progression across topics to forecast your final mark per subject, with a confidence interval. Spot the gap topics costing you the most marks, and fix them while there's still time."
          bullets={[
            "Per-subject forecast with confidence band — see where you're heading, not just where you are",
            "Identifies the three topics costing you the most marks",
            "Updates every time you finish a practice set or SBA",
            "Shared with parents on Family tiers (anonymised view available)",
          ]}
          demo={<MasteryChartDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="Past-paper walk-throughs"
          title="Examiner-style solutions, not just answers."
          body="A photo of a past-paper question becomes a marks-by-marks walk-through written in examiner style — referencing the actual markscheme. You learn the reasoning that earns marks, not just the final number."
          bullets={[
            "Per-step mark allocations tied to the official memo",
            "Highlights where students typically lose marks on this exact question",
            "Cross-links to related questions in your weak topics",
            "Works for NSC, IEB and Cambridge papers across all FET subjects",
          ]}
          demo={<PastPaperDemo />}
        />

        <FeatureShowcase
          eyebrow="Adaptive practice"
          title="Practice that scales to your level — automatically."
          body="No more grinding problems too easy to teach you anything, or doom-spiralling on ones too hard. Aptiverse auto-scales difficulty based on your last 10 answers, keeping you in the sweet spot where you're stretching but still succeeding."
          bullets={[
            "Difficulty scales 0.0 – 1.0 per topic, tracked over time",
            "Drops back when you're struggling, ramps up when you're cruising",
            "Surfaces the same concept in different forms to build transfer",
            "Tracks per-topic mastery for the prediction model",
          ]}
          demo={<AdaptivePracticeDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="Exam simulator"
          title="The real thing — before the real thing."
          body="Sit a full timed past paper under exam conditions. Auto-marked at submission with a detailed debrief: where you lost marks, which topics tripped you, and what to drill next. The closest you'll get to a real matric exam before the actual one."
          bullets={[
            "Full timed papers — NSC, IEB and Cambridge supported",
            "Auto-marked against the official memo with examiner-style commentary",
            "Builds a paper-by-paper readiness score across the trial-exam season",
            "Audio-narrated for blind / dyslexic learners on the Max tier",
          ]}
          demo={<ExamSimulatorDemo />}
        />
      </Section>

      {/* ====================================================================
          Wellbeing — woven through. Same showcase treatment as the moat.
      ==================================================================== */}
      <Section bg="paper" py={2}>
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="overline" color="primary.main">
            Wellbeing
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700 }}>
            Mental health woven through
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mx: "auto" }}>
            The platform itself watches for stress, gives you tools, and connects you to real
            humans when you need them — not just dashboards and numbers.
          </Typography>
        </Stack>

        <FeatureShowcase
          eyebrow="Daily mood check-in"
          title="60 seconds today. Catches the spiral weeks early."
          body="A two-tap check-in every day. Aptiverse watches the trend, not the snapshot — and when stress climbs for three days in a row, it surfaces help before you have to ask for it."
          bullets={[
            "Five-emoji scale so it actually takes 60 seconds, not 5 minutes",
            "Trend detection across days — single bad days don't trigger alerts",
            "On hard days, the platform offers a Take A Break or a counsellor link, never a guilt-trip",
            "Anonymised mood summary visible to parents on Family tiers (never the diary itself)",
          ]}
          demo={<MoodCheckInDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="Reflective diary"
          title="A private space — even from us."
          body="Your diary is end-to-end encrypted on your device before it ever touches our servers. Aptiverse staff cannot read it. Parents cannot read it. Only you. The platform sees aggregate mood scores, never the words."
          bullets={[
            "End-to-end encrypted by default — the key never leaves your phone",
            "Daily prompts for gratitude, gripes, and wins to make starting easy",
            "Aggregate mood trends fuel the wellbeing forecast — never raw text",
            "Lose your phone? An optional encrypted backup is opt-in only",
          ]}
          demo={<DiaryEncryptedDemo />}
        />

        <FeatureShowcase
          eyebrow="'Take a break' moments"
          title="The platform tells you when to stop."
          body="Aptiverse notices when you've been at one subject too long. After 90 minutes of unbroken focus, it suggests a real break — 1-minute breath, 3-minute mindfulness, lofi music, a funny clip. Without leaving the app."
          bullets={[
            "Detects unbroken focus across the app, not just one page",
            "Breathing animation guided in 4-in / 6-out (calms the nervous system)",
            "Stops nagging once you've taken a break — won't gamify rest into a chore",
            "Counts towards your wellbeing score without ever being mandatory",
          ]}
          demo={<TakeABreakDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="In-app counselling"
          title="A real human, one tap away."
          body="HPCSA-registered counsellors with specialties matched to your situation — exam anxiety, family conflict, grief, identity. Book a session, talk through it, get help that ChatGPT cannot give."
          bullets={[
            "Every counsellor is HPCSA-registered with their license number visible",
            "Matched by specialty, not the alphabet — find the right person fast",
            "First session free on Family Pro+, Crisis line on every paid tier",
            "Sessions video, voice, or text — your call",
          ]}
          demo={<CounsellingDemo />}
        />

        <Box sx={{ pt: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", textAlign: "center", mb: 2 }}>
            Also included
          </Typography>
          <Grid container spacing={3}>
            {WELLBEING_EXTRAS.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <FeatureCard {...f} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Section>

      {/* ====================================================================
          For parents.
      ==================================================================== */}
      <Section eyebrow="For parents & families" title="A calm view, never an invasive one" subtitle="Parents see actionable insights about their child's growth — never raw diary content, never just numbers.">
        <Grid container spacing={3}>
          {FOR_PARENTS.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ====================================================================
          For tutors.
      ==================================================================== */}
      <Section bg="paper" eyebrow="For tutors" title="The unfair advantage for SA tutors" subtitle="Curriculum-aware AI that does the lesson prep, marking, and parent reports — so you focus on teaching.">
        <Grid container spacing={3}>
          {FOR_TUTORS.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ====================================================================
          For schools.
      ==================================================================== */}
      <Section eyebrow="For schools" title="Whole-school deployment, real outcomes" subtitle="Cohort-wide gap analysis, AI-differentiated worksheets, and a readiness forecast for every learner.">
        <Grid container spacing={3}>
          {FOR_SCHOOLS.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ====================================================================
          Future-ready.
      ==================================================================== */}
      <Section bg="paper" eyebrow="Future-ready" title="University & career navigation" subtitle="Demystifying what comes after matric — for the student and their family.">
        <Grid container spacing={3}>
          {FUTURE.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ====================================================================
          Community.
      ==================================================================== */}
      <Section eyebrow="Community" title="Learn together" subtitle="Peer learning is the most underrated tool in high school.">
        <Grid container spacing={3}>
          {COMMUNITY.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section bg="paper" py={6}>
        <Stack spacing={2} alignItems="center" sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
            Ready to see the whole thing?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
            The free tier gets you SBA tracking, basic AI practice, the diary, calendar and
            wellbeing tools — no card needed.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
            <Button component={Link} href="/register" variant="contained" size="large">
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

// ============================================================
// Card data
// ============================================================

const WELLBEING_EXTRAS = [
  { icon: <span>📚</span>, title: "Stories of struggle", description: "South African role models who failed before they soared. Real, not curated.", accent: "warning" as const },
  { icon: <EventNoteIcon />, title: "Healthy goal-setting", description: "Goals calibrated to your history — never punishing, always reachable, always yours.", accent: "primary" as const },
  { icon: <FavoriteIcon />, title: "Wellbeing forecast", description: "A weekly outlook based on mood, sleep proxies, and study load. Knows when to ease off.", accent: "secondary" as const },
];

const FOR_PARENTS = [
  { icon: <FamilyRestroomIcon />, title: "Parent dashboard", description: "A single view across all your kids — what they're studying, how they're feeling, what's coming up.", accent: "primary" as const },
  { icon: <InsightsIcon />, title: "Matric mark forecast", description: "Per-child prediction of their final mark with a confidence interval. See where they're heading, not just where they are.", accent: "secondary" as const },
  { icon: <VolunteerActivismIcon />, title: "Bursary pipeline tracker", description: "Eligibility, deadlines and required documents per child. Never miss an opportunity because you didn't know it existed.", accent: "success" as const },
  { icon: <FavoriteIcon />, title: "Wellbeing summary", description: "Mood and stress trends per child, fully anonymised — no diary content ever shared with parents.", accent: "info" as const },
  { icon: <ChatBubbleIcon />, title: "Family WhatsApp recap", description: "Weekly digest delivered to your WhatsApp — celebrations, concerns, what to ask at dinner.", accent: "warning" as const },
  { icon: <PsychologyIcon />, title: "AI parenting coach", description: "On the Family Max tier — a coach that knows your kids' context and helps you respond, not react.", accent: "primary" as const },
];

const FOR_TUTORS = [
  { icon: <RecordVoiceOverIcon />, title: "Marketplace listing", description: "Students search for tutors by subject, rating and curriculum. Get found, not just hired by your aunt's friend.", accent: "primary" as const },
  { icon: <AutoAwesomeIcon />, title: "AI lesson plan generator", description: "Pulls each client's curriculum, recent SBA marks and weak topics → a personalised 60-minute lesson plan. Saves 2 hours per client per week.", accent: "secondary" as const },
  { icon: <AssignmentIcon />, title: "Auto parent reports", description: "AI-written weekly recap per client, delivered via WhatsApp or email. Tutors normally skip these; parents love getting them.", accent: "info" as const },
  { icon: <InsightsIcon />, title: "AI SBA marker", description: "Photograph a client's draft, get marked output against the actual rubric. Cut marking time by 70%.", accent: "warning" as const },
  { icon: <ReceiptIcon />, title: "SARS-ready tax export", description: "Year-end income report formatted for sole-prop tax filing. Built for SA, by people who've filed an ITR12.", accent: "success" as const },
  { icon: <GroupsIcon />, title: "Group tutoring mode", description: "Run one session with multiple clients — adaptive worksheets per learner generated on the fly.", accent: "primary" as const },
];

const FOR_SCHOOLS = [
  { icon: <BusinessIcon />, title: "School admin dashboard", description: "Whole-school analytics: readiness forecasts, intervention recommendations, teacher and class performance heatmaps.", accent: "primary" as const },
  { icon: <CastForEducationIcon />, title: "Teacher gap-analysis", description: "Per-class topic heatmap — see exactly where your cohort is losing marks before the exam, not in the autopsy.", accent: "secondary" as const },
  { icon: <AutoAwesomeIcon />, title: "AI differentiator", description: "Auto-generated differentiated worksheets per ability band. Stop hand-crafting three versions of every handout.", accent: "info" as const },
  { icon: <VolunteerActivismIcon />, title: "Bursary partner pipeline", description: "Connect bursary funders to your top learners with verified progress data — a real pathway, not a paper application.", accent: "success" as const },
  { icon: <SchoolIcon />, title: "SSO + SIS integration", description: "Single sign-on, sync from your school's existing student information system. No double data entry.", accent: "warning" as const },
  { icon: <GroupIcon />, title: "Dedicated success manager", description: "A real human you can phone — onboarding, training, monthly check-ins, on-site visits for larger schools.", accent: "primary" as const },
];

const FUTURE = [
  { icon: <SchoolIcon />, title: "University navigator", description: "What does a BCom actually lead to? We explain — including which ZA universities offer what, and what their cut-offs look like.", accent: "primary" as const },
  { icon: <VolunteerActivismIcon />, title: "Bursary navigator", description: "NSFAS and private bursaries with deadlines and document checklists. Match scores based on your actual profile.", accent: "success" as const },
  { icon: <CalendarMonthIcon />, title: "APS calculator", description: "Live APS tracking against your dream course's cut-off. Know exactly what marks you need from here.", accent: "info" as const },
  { icon: <EmojiEventsIcon />, title: "Career match", description: "Performance + interests + Holland-code profile → realistic career suggestions, grounded in SA labour-market data.", accent: "warning" as const },
  { icon: <span>💸</span>, title: "Financial literacy basics", description: "Loans, budgeting, cost of living — built for first-time managers of money.", accent: "info" as const },
  { icon: <span>🎯</span>, title: "Dream-course planner", description: "Where you are now → where you want to be. Long-term strategies, monitored term by term.", accent: "primary" as const },
];

const COMMUNITY = [
  { icon: <GroupIcon />, title: "Study groups", description: "Small virtual rooms with shared notes and scheduled sessions.", accent: "primary" as const },
  { icon: <span>🗣️</span>, title: "Explain it to me", description: "Record a concept explanation — solidify your own understanding while helping others.", accent: "secondary" as const },
  { icon: <span>📅</span>, title: "Calendar integration", description: "Push schedules and reminders to Google Calendar or Outlook.", accent: "info" as const },
  { icon: <GroupIcon />, title: "Verified tutors", description: "Background-checked tutors with public ratings and clear credentials.", accent: "warning" as const },
  { icon: <span>🏷️</span>, title: "Profile badges", description: "'Resilient Learner', 'Curious Mind', 'Helpful Peer' — soft skills made visible.", accent: "success" as const },
  { icon: <span>👨‍👩‍👧</span>, title: "Family plans", description: "Parents see actionable insights about their child's growth — never just numbers.", accent: "secondary" as const },
];
