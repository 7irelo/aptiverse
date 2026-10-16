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
                label="For parents"
                size="small"
                sx={{ alignSelf: "flex-start", bgcolor: "background.paper", border: 1, borderColor: "divider", fontWeight: 600 }}
              />
              <Typography variant="h1" component="h1">
                Support without surveillance.
              </Typography>
              {/* "See how each of your children is really doing, in class and
                  out, and get real suggestions for how to help" promised three
                  things that do not exist: no parent-visible academic read
                  beyond upcoming assessments, no wellbeing view (the page
                  404s), and no suggestions engine (/parent/help is a hardcoded
                  tips array with invented children). What a parent actually
                  gets is their children in one place and what is due for each,
                  under one bill. That is worth something; it is not worth
                  lying about. */}
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 520 }}>
                Your children in one place, with what is due for each of them, so you can ask a useful question instead of a vague one. One bill, one dashboard, and no way to read over their shoulder.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap>
                <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
                  Start free
                </Button>
                <Button component={Link} href="/pricing?for=families" variant="outlined" size="large">
                  See Parent plans
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Parent plans start at R159 a month for one child. Adding a child costs less than the
                one before it.
              </Typography>
            </Stack>
            <Box sx={{ flex: 1, width: "100%", maxWidth: 460, mx: "auto" }}>
              <ChildSnapshot />
            </Box>
          </Stack>
        </Box>
      </GradientBackdrop>

      {/* How it works */}
      <Section eyebrow="How it works" title="Set up once, then just check in" subtitle="Your children do the learning. You get their deadlines, and the privacy line stays where they can trust it.">
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
            {/* "Who is on track, who is under pressure" is two judgements we
                do not make and could not deliver to a parent if we did. */}
            <Typography variant="body1" color="text.secondary">
              Add each child and see them side by side, with what is due for each. No logging into three accounts, no nagging for updates, and no pretending we can tell you how they feel.
            </Typography>
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              {["Every child you have linked, in one list", "One bill, one to four children", "Tap through for what each of them has coming"].map((t) => (
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
      {/* "What you see" listed four things, and a parent can see none of them.
          Subject attention, stress trend, streaks and celebrations, goal
          progress: every one needs a ParentLink-scoped read that does not
          exist. This card is the one place on the site where a parent counts
          what they are buying, so it now lists exactly what the API returns to
          them and nothing else. */}
      <Section eyebrow="Private by design" title="Insight, not surveillance" subtitle="What a parent can see is deliberately narrow, and it is the same list on every plan.">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SeeCard
              positive
              title="What you see"
              items={[
                "Each child you have linked, and their stage",
                "The assessments coming up for each of them",
                "Your own billing, in one place",
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
                "Their conversations with the assistant",
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
            Add each child and manage everything from one place. Start free, then pick the Parent plan that matches how many children you have.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap justifyContent="center">
            <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
              Start free
            </Button>
            <Button component={Link} href="/pricing?for=families" variant="outlined" size="large">
              See Parent plans
            </Button>
          </Stack>
        </Stack>
      </Section>
    </>
  );
}

// The comment above this used to say "a small, honest snapshot of what a
// parent sees". It was neither. Of the three rows, two were invented: a parent
// cannot see a subject mark ("Mathematics 78%, climbing") or a wellbeing state
// ("Feeling good"), because no endpoint returns either to a parent. Only "Next
// up" was real. The status chip was invented too; nothing computes "On track"
// for a parent. Now it shows the per-child page as it actually renders:
// stage, and the assessments ahead.
function ChildSnapshot() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Coming up
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Lerato, Grade 11
            </Typography>
          </Box>
          <Chip label="Linked" size="small" color="success" sx={{ fontWeight: 600 }} />
        </Stack>

        <Stack spacing={1.5}>
          <SnapshotRow icon={<CalendarClock size={16} />} accent="primary.main" label="History essay" value="Friday" />
          <SnapshotRow icon={<CalendarClock size={16} />} accent="primary.main" label="Maths controlled test" value="Next Tuesday" />
          <SnapshotRow icon={<CalendarClock size={16} />} accent="text.secondary" label="Life Sciences prac" value="18 August" />
        </Stack>

        <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            You see what is due. You never see her marks, her diary, or her chats.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// The multi-child view. Three problems, all fixed here. Thabo was in Grade 8,
// and onboarding only offers Grade 10 to 12 plus tertiary, so he could not
// exist. "Maths climbing" and "Stats forecast up to 68%" are marks and a
// forecast, neither of which reaches a parent. And "Needs a nudge / Two
// practice sets missed" implied we watch and judge a child's practice for
// you; nothing does.
function FamilyBoard() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">
          Your family
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          What is due, per child
        </Typography>
        <Stack spacing={1.25}>
          <ChildRow name="Lerato" grade="Grade 11" status="Linked" tone="success" note="History essay due Friday" />
          <ChildRow name="Thabo" grade="Grade 10" status="Linked" tone="success" note="Maths controlled test, Tuesday" />
          <ChildRow name="Amahle" grade="1st year, UCT" status="Linked" tone="success" note="Stats assignment due 20 August" />
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
  // Was "an honest weekly read per child, plus a nudge when it matters".
  // There is no weekly read and no nudge: no digest job, no parent-directed
  // notification of any kind.
  { icon: <LayoutDashboard size={18} />, title: "You see what is due", body: "Open the dashboard whenever you want and see each child's upcoming assessments." },
];

// Five of these six were sold to paying parents and do not exist. The reason
// is structural and worth stating once: ParentLink is read in exactly one
// file, ParentLinksController.cs. No other endpoint consults it, so no other
// endpoint can hand a parent any child's data. Everything below that promised
// a per-child read was promising something the API has no path to deliver.
//
// - "How-can-I-help view": /parent/help is a hardcoded TIPS array with
//   invented children and invented mastery numbers. Nothing reads Mastery.
// - "Celebration alerts": every celebration emitter targets the actor, never a
//   parent (GoalEvaluator.cs:115 -> studentId). /parent/celebrations is a
//   hardcoded array of children who do not exist.
// - "Activity, with consent": there is no consent flag and no activity feed.
//   The fields on the Child type are never read by any component.
// - "Wellbeing summary": /parent/wellbeing calls an endpoint that does not
//   exist and would draw Math.random() if it did.
// - "Goal progress": StudentOverviewDto has no goals field.
//
// Three of those pages are not even in PARENT_NAV, which is presumably how a
// permanently-404ing fetch and a random-number chart survived this long.
//
// What is left is real: the dashboard, the assessment feed, and the privacy
// boundary, which is the one thing here that is enforced rather than
// described. Three honest cards beat six invented ones.
const FEATURES = [
  {
    icon: <Lightbulb size={18} />,
    title: "Your children in one place",
    description: "Link each child to your account and see them together, without logging into anyone else's account.",
    accent: "primary" as const,
  },
  {
    icon: <CalendarClock size={18} />,
    title: "What is coming up",
    description: "The assessments due for each child, so the conversation starts from something real.",
    accent: "info" as const,
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Private by design",
    description: "There is no screen and no endpoint that shows you the diary. It is not a setting you can turn on.",
    accent: "success" as const,
  },
];

const FAQ = [
  {
    q: "How many children can I add?",
    a: "One to four. You pick the Parent plan that matches your number of children, and each child gets their own private account under your single subscription and one bill.",
  },
  {
    q: "How does the pricing work as I add children?",
    a: "Each child on a Parent plan gets everything in Student Pro, and you get the parent dashboard on top. One child is R159 a month, two is R269, three is R379, and four is R489, so each additional child costs less than the one before. Annual billing gives you two months free.",
  },
  {
    q: "Can I read my child's diary or messages?",
    // Was: "the diary is end-to-end encrypted on your child's device". It is
    // not, and answering a parent's direct privacy question with a technical
    // guarantee we do not implement is the worst place in the product to be
    // loose with the truth. The access boundary is real and enforced in the
    // API; the encryption was invented. Say the part that is true, and say
    // honestly what we can see.
    // Second correction: "You see mood trends, streaks and celebrations" was
    // also false, in the direction of more parent visibility rather than less.
    // StudentOverviewDto (ParentLinksController.cs:409) returns a name, an
    // education level and the next five assessments. There is no mood, no
    // streak and no celebration on it, and no other endpoint consults
    // ParentLink at all.
    a: "No. There is no screen anywhere in the parent view that shows diary entries, and no endpoint that returns them. What the parent view actually holds is your child's name and the work coming up for them. Not their diary, not their mood, not their marks. That boundary is deliberate and cannot be turned off. To be straight with you about the limits: entries are stored on our servers, not encrypted on your child's device, so we could read them and staff access is governed by our privacy policy. We do not. Nothing analyses your child's diary, and the mood graph is built from the check-ins they tap rather than from anything they write. What is guaranteed is that you cannot see any of it.",
  },
  {
    q: "My children are different ages. Does that work?",
    // Was "from primary school through university", with a Grade 8 as the
    // worked example. Onboarding offers Grade 10, 11, 12 and tertiary. There
    // is no primary school option and no Grade 8. A parent of a younger child
    // would have signed up and found nothing for them.
    a: "Within a range. Aptiverse covers Grade 10 to 12 and university or college, so a Grade 10 and a first-year fit under the same family account and each get tools for their own stage. We do not currently support anything below Grade 10.",
  },
  {
    q: "What does the free tier give us?",
    // Was "a Parent plan adds the full assistant, predictions, and past papers
    // for every child". Past papers are free (features.ts baseline), and term
    // predictions are not gated anywhere, so a free child already has both. We
    // were charging for two things we hand out.
    a: "More than you would expect. Each child can start free with goals, the diary, mood check-ins, practice, past papers, term predictions, and the career navigator. A Parent plan raises their AI limits, unlocks unlimited subjects, and gives you the parent dashboard across all of them.",
  },
  {
    q: "Will my child know what I can see?",
    // Was "Yes. Aptiverse is clear with your child about exactly what is
    // shared." There is no such disclosure anywhere in the student app. We
    // were describing an intention as a shipped feature, in the answer to a
    // question about trust. The honest version is that the boundary is
    // enforced but the telling is still on us, and on you.
    a: "The boundary is enforced whether they know it or not: there is no path for you to read a diary entry, a chat, or a mood note. We do not yet show your child a plain summary of what a linked parent can see, which we should, so for now that conversation is yours to have. The short version to give them: you can see what is due, and nothing else.",
  },
];
