"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Link from "next/link";
import {
  Lightbulb,
  PartyPopper,
  Activity,
  HeartPulse,
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  CalendarClock,
  UserPlus,
  BookOpen,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { FeatureCard } from "@/components/common/FeatureCard";

export default function ForFamiliesPage() {
  return (
    <>
      <GradientBackdrop variant="hero">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 12 } }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 6, lg: 10 }} alignItems="center">
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              <Chip
                label="For families"
                size="small"
                sx={{ alignSelf: "flex-start", bgcolor: "background.paper", border: 1, borderColor: "divider", fontWeight: 600 }}
              />
              <Typography variant="h1" component="h1">
                Support without surveillance.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 520 }}>
                See how each of your children is really doing, in class and out, and get real suggestions for how to help, not hover. One subscription for the whole family.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap>
                <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
                  Start free
                </Button>
                <Button component={Link} href="/pricing" variant="outlined" size="large">
                  See the Family plan
                </Button>
              </Stack>
            </Stack>
            <Box sx={{ flex: 1, width: "100%", maxWidth: 460, mx: "auto" }}>
              <ChildSnapshot />
            </Box>
          </Stack>
        </Box>
      </GradientBackdrop>

      {/* How it works */}
      <Section eyebrow="How it works" title="Set up once, then just check in" subtitle="Your children do the learning. You get an honest read, and a way to help when it counts.">
        <Grid container spacing={3}>
          {STEPS.map((s, i) => (
            <Grid key={s.title} size={{ xs: 12, md: 4 }}>
              <StepCard n={i + 1} {...s} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Family at a glance */}
      <Section bg="paper" py={2}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 5, lg: 8 }} alignItems="center">
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="overline" color="primary.main">
              One dashboard
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
              The whole family, on one screen.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Add each child and see them side by side: who is on track, who is under pressure, and what is due this week. No logging into three accounts, no nagging for updates.
            </Typography>
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              {["A calm status for each child at a glance", "One bill, up to four children", "Tap through for detail, or leave it as a summary"].map((t) => (
                <Stack key={t} direction="row" spacing={1.25} alignItems="flex-start">
                  <Box sx={{ color: "primary.main", mt: 0.25, display: "flex" }}>
                    <Check size={18} />
                  </Box>
                  <Typography variant="body2">{t}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Box sx={{ flex: 1, width: "100%", maxWidth: 480, mx: "auto" }}>
            <FamilyBoard />
          </Box>
        </Stack>
      </Section>

      {/* Privacy boundary */}
      <Section eyebrow="Private by design" title="Insight, not surveillance" subtitle="You get a clear read on how your children are doing. Their private thoughts stay theirs.">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SeeCard
              positive
              title="What you see"
              items={[
                "Which subjects need attention",
                "Whether stress is trending up",
                "Streaks, goals, and celebrations",
                "Progress toward the goals they set",
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SeeCard
              positive={false}
              title="What you never see"
              items={[
                "The words in the private diary",
                "Individual mood notes",
                "Anything a child marks private",
                "A way to read over their shoulder",
              ]}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Deep dive */}
      <Section bg="paper" eyebrow="What you get" title="A calm view of your family's week">
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
            One subscription for the whole family.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
            Add each child and manage everything from one place. Start free and upgrade to a Family plan when you are ready.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap justifyContent="center">
            <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
              Start free
            </Button>
            <Button component={Link} href="/pricing" variant="outlined" size="large">
              See the Family plan
            </Button>
          </Stack>
        </Stack>
      </Section>
    </>
  );
}

// A small, honest snapshot of what a parent sees for one child.
function ChildSnapshot() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              This week
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Lerato, Grade 11
            </Typography>
          </Box>
          <Chip label="On track" size="small" color="success" sx={{ fontWeight: 600 }} />
        </Stack>

        <Stack spacing={1.5}>
          <SnapshotRow icon={<TrendingUp size={16} />} accent="primary.main" label="Mathematics" value="78%, climbing" />
          <SnapshotRow icon={<HeartPulse size={16} />} accent="secondary.main" label="Wellbeing" value="Feeling good" />
          <SnapshotRow icon={<CalendarClock size={16} />} accent="text.secondary" label="Next up" value="History essay, Friday" />
        </Stack>

        <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            You see this summary. You never see her diary.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// The multi-child view: each child as a calm status row.
function FamilyBoard() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">
          Your family
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          This week at a glance
        </Typography>
        <Stack spacing={1.25}>
          <ChildRow name="Lerato" grade="Grade 11" status="On track" tone="success" note="Maths climbing, essay due Fri" />
          <ChildRow name="Thabo" grade="Grade 8" status="Needs a nudge" tone="warning" note="Two practice sets missed" />
          <ChildRow name="Amahle" grade="1st year, UCT" status="On track" tone="success" note="Stats forecast up to 68%" />
        </Stack>
      </CardContent>
    </Card>
  );
}

function ChildRow({
  name,
  grade,
  status,
  tone,
  note,
}: {
  name: string;
  grade: string;
  status: string;
  tone: "success" | "warning";
  note: string;
}) {
  return (
    <Box sx={{ p: 1.75, borderRadius: 2, border: 1, borderColor: "divider" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {grade}
          </Typography>
        </Stack>
        <Chip label={status} size="small" color={tone} sx={{ height: 22, fontWeight: 600 }} />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {note}
      </Typography>
    </Box>
  );
}

function SnapshotRow({
  icon,
  accent,
  label,
  value,
}: {
  icon: React.ReactNode;
  accent: string;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: "grid",
          placeItems: "center",
          bgcolor: "action.hover",
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function SeeCard({ positive, title, items }: { positive: boolean; title: string; items: string[] }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={1.5}>
          {items.map((t) => (
            <Stack key={t} direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{ mt: 0.25, flexShrink: 0, display: "flex", color: positive ? "primary.main" : "text.disabled" }}>
                {positive ? <Check size={18} /> : <X size={18} />}
              </Box>
              <Typography variant="body2" color={positive ? "text.primary" : "text.secondary"}>
                {t}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
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

const STEPS = [
  { icon: <UserPlus size={18} />, title: "Add each child", body: "Invite each child to their own account under your subscription. Takes a minute." },
  { icon: <BookOpen size={18} />, title: "They learn and reflect", body: "They study, practise, and check in on their own device, privately." },
  { icon: <LayoutDashboard size={18} />, title: "You see the summary", body: "You get an honest weekly read per child, plus a nudge when it matters." },
];

const FEATURES = [
  {
    icon: <Lightbulb size={18} />,
    title: "A how-can-I-help view",
    description: "Practical suggestions, like which topic a child is stuck on and a few things to try at home.",
    accent: "primary" as const,
  },
  {
    icon: <PartyPopper size={18} />,
    title: "Celebration alerts",
    description: "Streaks, completed goals, and good news, not just problems.",
    accent: "secondary" as const,
  },
  {
    icon: <Activity size={18} />,
    title: "Activity, with consent",
    description: "See whether a child is actively studying, in a session, or done for the day.",
    accent: "info" as const,
  },
  {
    icon: <HeartPulse size={18} />,
    title: "Wellbeing summary",
    description: "A weekly mood trend per child with a gentle flag if stress is rising. The content stays private.",
    accent: "secondary" as const,
  },
  {
    icon: <TrendingUp size={18} />,
    title: "Goal progress",
    description: "See how each child is tracking against the goals they set, so you can plan together, calmly.",
    accent: "info" as const,
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Private by design",
    description: "You see trends and celebrations. You never see the diary. That boundary is built in.",
    accent: "success" as const,
  },
];

const FAQ = [
  {
    q: "How many children can I add?",
    a: "The Family plan covers up to two children and Family Plus covers up to four, each with their own private account under one subscription and one bill.",
  },
  {
    q: "Can I read my child's diary or messages?",
    a: "No. The diary is end-to-end encrypted on your child's device. You see trends, streaks, and celebrations, never the words. That boundary is deliberate and cannot be turned off.",
  },
  {
    q: "My children are different ages. Does that work?",
    a: "Yes. Each child gets tools for their own stage, from primary school through university, so a Grade 8 and a first-year at university both fit under the same family account.",
  },
  {
    q: "What does the free tier give us?",
    a: "Each child can start free with goals, the diary, mood check-ins, and basic practice. A Family plan adds the full assistant, predictions, past papers, and your parent dashboard across all your children.",
  },
  {
    q: "Will my child know what I can see?",
    a: "Yes. Aptiverse is clear with your child about exactly what is shared with a parent and what stays private. Trust runs both ways.",
  },
];
