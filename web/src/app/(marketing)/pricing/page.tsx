"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import Link from "next/link";
import { Section } from "@/components/common/Section";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { usePlans, type PlanDto } from "@/lib/api/queries";

// Pricing is grouped by audience. Within each group, tiers follow a
// shared structure: same shape of features across the group, upper
// tiers (Pro / Max) buy more quota & deeper AI capabilities. The Tutor
// track uniquely has a marketplace commission that tapers down as you
// climb (15% → 10% → 0%), giving tutors a no-subscription on-ramp.
//
// Numbers are sized for the South African market against our actual
// variable cost basis. Margin clears 50% at half utilisation on every
// paid tier — see internal cost-model docs for the breakdown.

type Audience = "students" | "families" | "tutors" | "schools";

type Plan = {
  code: string;
  name: string;
  tagline: string;
  audience: string;
  monthly: number | null;     // null = custom or commission-only
  annual?: number;
  monthlyHint?: string;
  highlight?: boolean;
  comingSoon?: boolean;
  cta: { label: string; href: string };
  commissionPercent?: number; // tutor track only — 0.15, 0.10, 0
  seats?: number;             // family track only
  aiQuickPerMonth: number | "Unlimited";
  aiDeepPerMonth: number | "Unlimited";
  whatsappPerMonth: number | "Unlimited";
  features: string[];
  notIncluded?: string[];
};

// ============================================================
// STUDENT TRACK
// ============================================================
// =====================================================================
// Marketing copy per plan — taglines, audiences, CTAs, feature bullets,
// "Most popular" + coming-soon flags. The canonical price / quotas /
// commission / max-members all come from /api/entitlements/plans at
// render time, so changing a number in the seeder propagates without a
// frontend rebuild. Bullet copy stays local because it's curated
// salescraft, not derivable from the entitlement model.
// =====================================================================
type PlanMarketingCopy = {
  tagline: string;
  audience: string;
  monthlyHint?: string;
  highlight?: boolean;
  comingSoon?: boolean;
  cta: { label: string; href: string };
  features: string[];
  notIncluded?: string[];
};

const PLAN_COPY: Record<string, PlanMarketingCopy> = {
  free: {
    tagline: "Genuinely useful — start here",
    audience: "Any FET student",
    cta: { label: "Create free account", href: "/register" },
    features: [
      "SBA tracking (up to 6 subjects)",
      "Basic goal tracking",
      "Daily diary & mood check-in",
      "Past papers — DBE archive links",
      "Bursaries directory · Universities directory",
      "Calendar · Notifications · Help",
    ],
    notIncluded: [
      "AI tutor / past-paper walk-throughs",
      "Mastery predictions",
      "WhatsApp assistant",
    ],
  },
  student: {
    tagline: "Unlimited subjects, basic AI practice",
    audience: "Casual study aid",
    comingSoon: true,
    cta: { label: "Start with Student", href: "/register?plan=student" },
    features: [
      "Unlimited subjects + goals",
      "AI practice questions (basic)",
      "Mastery snapshot",
      "Course enrolment + workspace",
      "Read access to psychologist directory",
      "Everything in Free",
    ],
  },
  "student.pro": {
    tagline: "The AI moat — what ChatGPT can't do",
    audience: "Serious students",
    highlight: true,
    comingSoon: true,
    cta: { label: "Go Pro", href: "/register?plan=student.pro" },
    features: [
      "Curriculum-aware AI tutor (NSC / IEB / Cambridge)",
      "Past papers — examiner-style walk-throughs",
      "SBA Coach — feedback on your draft against the rubric",
      "Adaptive practice — difficulty scales to your mastery",
      "Mastery predictions with confidence interval",
      "Career & university navigator",
      "Bursary application checklist",
      "Tutor marketplace + booking",
      "Study groups · Verified rewards",
      "Priority email support · 1-day response",
    ],
  },
  "student.max": {
    tagline: "For exam finalists",
    audience: "Going for distinctions",
    comingSoon: true,
    cta: { label: "Go Max", href: "/register?plan=student.max" },
    features: [
      "Exam simulator — timed full papers, AI-marked",
      "Weekly AI debrief — long, deep session reviewing your week",
      "Cross-subject study plan — auto-built from your calendar",
      "Audio explanations for every topic",
      "WhatsApp tutor that remembers your subjects & weak spots",
      "Everything in Student Pro",
    ],
  },
  family: {
    tagline: "Up to 2 learners on one bill",
    audience: "Smaller households",
    comingSoon: true,
    cta: { label: "Start Family", href: "/register?plan=family" },
    features: [
      "Up to 2 learners, full Student Pro features each",
      "Parent dashboard — calm, never invasive",
      "Realtime activity feed",
      "Mastery forecast per child (predicted matric mark)",
      "Wellbeing summary — trends without revealing diary content",
      "Celebration alerts when they hit a goal",
    ],
  },
  "family.pro": {
    tagline: "The household stack",
    audience: "Typical SA family",
    highlight: true,
    comingSoon: true,
    cta: { label: "Go Family Pro", href: "/register?plan=family.pro" },
    features: [
      "Up to 4 learners",
      "Bursary pipeline tracker per child — eligibility + deadlines",
      "University readiness forecast per child",
      "Family WhatsApp recap — weekly digest to parents",
      "Shared family calendar (exams · SBAs · deadlines)",
      "1 counselling session per quarter (registered counsellor)",
      "Everything in Family",
    ],
  },
  "family.max": {
    tagline: "Concierge tier",
    audience: "Big families & power parents",
    comingSoon: true,
    cta: { label: "Go Family Max", href: "/register?plan=family.max" },
    features: [
      "Up to 6 learners",
      "AI parenting coach — knows your kids' context, helps you respond, not react",
      "Custom intervention plans per child",
      "Tutor concierge — we book the right tutor for you",
      "Family wellbeing dashboard with aggregated trends",
      "Everything in Family Pro",
    ],
  },
  "tutor.free": {
    tagline: "No subscription — we take 15% commission",
    audience: "Tutors testing the platform",
    cta: { label: "Apply as tutor", href: "/register?plan=tutor.free" },
    features: [
      "Marketplace listing — students can find you",
      "Scheduling + secure payment processing (cards & EFT)",
      "Basic client tracker (notes, history, messaging)",
      "Unlimited clients",
      "15% commission on platform bookings",
    ],
    notIncluded: [
      "AI lesson plans / worksheets / parent reports",
      "SBA marker · SARS export · white-label branding",
    ],
  },
  "tutor.pro": {
    tagline: "The AI moat for tutors",
    audience: "Established tutors",
    highlight: true,
    comingSoon: true,
    cta: { label: "Go Pro", href: "/register?plan=tutor.pro" },
    features: [
      "AI lesson plan generator — personalised per client per week",
      "Mastery prediction per client (shareable with parents)",
      "Auto parent reports — weekly WhatsApp / email recap",
      "AI worksheet generator — NSC / IEB-style at the client's level",
      "Featured marketplace listing",
      "Curriculum-aware AI for your own learning too",
      "10% commission on platform bookings (down from 15%)",
      "Everything in Tutor Free",
    ],
  },
  "tutor.max": {
    tagline: "Zero commission. White-glove tools.",
    audience: "Full-time tutors",
    comingSoon: true,
    cta: { label: "Go Max", href: "/register?plan=tutor.max" },
    features: [
      "0% commission — keep every rand you earn",
      "AI SBA marker — photograph a draft, get marked output",
      "White-label parent reports with your own branding",
      "SARS-ready income report (year-end tax export)",
      "Group tutoring mode — adaptive worksheets per learner in one session",
      "Top-of-marketplace placement",
      "Everything in Tutor Pro",
    ],
  },
  school: {
    tagline: "Whole-school deployment",
    audience: "Schools & districts",
    monthlyHint: "from R59 / learner / month",
    cta: { label: "Talk to sales", href: "/for-schools/contact" },
    features: [
      "Every Family Max feature for every learner",
      "Teacher gap-analysis — which topics your cohort is losing marks on",
      "AI differentiator — auto-generated worksheets per ability band",
      "Class & teacher analytics, live lesson view",
      "School admin dashboard — readiness, analytics, students, teachers",
      "Bursary partner pipeline — connect funders to top learners",
      "SSO + SIS integration",
      "Dedicated success manager",
      "Custom pricing — depends on roll size",
    ],
  },
};

// Track ordering — drives which plans show up in each audience tab.
// Order matters: it's the visual left-to-right order in the cards row.
const STUDENT_CODES = ["free", "student", "student.pro", "student.max"];
const FAMILY_CODES = ["family", "family.pro", "family.max"];
const TUTOR_CODES = ["tutor.free", "tutor.pro", "tutor.max"];

// Convert an API plan + local copy into the shape <PlanCard /> expects.
// Returns null when the API doesn't know about this code yet (e.g.
// catalog is still loading or seeder hasn't been re-run).
function buildPlan(api: PlanDto | undefined, copy: PlanMarketingCopy | undefined): Plan | null {
  if (!api || !copy) return null;

  // Free / Tutor Free → R0. School → null (custom). Everything else → real price.
  const monthly: number | null =
    api.monthlyPriceZar !== null
      ? Number(api.monthlyPriceZar)
      : api.kind === "free"
        ? 0
        : null;

  // Seats badge is only meaningful on family plans — school has 5000 which
  // would be a meaningless "Up to 5000 learners" card.
  const seats = api.code.startsWith("family") ? api.maxMembers : undefined;

  return {
    code: api.code,
    name: api.name,
    tagline: copy.tagline,
    audience: copy.audience,
    monthly,
    annual: api.annualPriceZar !== null ? Number(api.annualPriceZar) : undefined,
    monthlyHint: copy.monthlyHint,
    highlight: copy.highlight,
    comingSoon: copy.comingSoon,
    cta: copy.cta,
    commissionPercent: api.commissionPercent !== null ? Number(api.commissionPercent) : undefined,
    seats,
    aiQuickPerMonth: quotaFor(api, "ai.quick"),
    aiDeepPerMonth: quotaFor(api, "ai.deep"),
    whatsappPerMonth: quotaFor(api, "whatsapp"),
    features: copy.features,
    notIncluded: copy.notIncluded,
  };
}

function quotaFor(plan: PlanDto, key: string): number | "Unlimited" {
  const q = plan.quotas?.find((x) => x.quotaKey === key);
  if (!q) return 0;
  return q.perMonth < 0 ? "Unlimited" : q.perMonth;
}

// ============================================================
// FAQ
// ============================================================
const FAQ = [
  {
    q: "Are AI message limits hard?",
    a: "Yes — when you hit your monthly limit the AI politely declines further requests until your billing cycle resets. We've sized the quotas so the typical user won't hit them in normal use. If you do, you'll get a nudge to upgrade or wait. We won't silently bill you for overages.",
  },
  {
    q: "What's the difference between Quick and Deep AI?",
    a: "Quick AI handles short answers, recall, formulas and definitions — fast and lightweight. Deep AI is for long walk-throughs, marking essays, building cross-subject study plans and the weekly debrief — slower but does serious work. Both flow through the same chat; we pick the right one behind the scenes and tag each reply so you can see what you used.",
  },
  {
    q: "How does the tutor commission work?",
    a: "When a student books a session with you through the Aptiverse marketplace, we take a percentage of the booking. Tutor Free is 15%, Tutor Pro is 10%, Tutor Max is 0%. Commission only applies to platform-acquired bookings — if you bring an existing client and route their payments through us, the commission still applies (we're handling the payment processing and tax docs). The Max tier waives commission entirely as the carrot for committing to a subscription.",
  },
  {
    q: "What's actually different between Pro and Max for students?",
    a: "Same shape of features; Max adds the exam-finals tools: the exam simulator, weekly AI debrief, audio explanations, contextual WhatsApp tutor, cross-subject study plan. Pro is enough for most of high school; Max is for when you're going for distinctions.",
  },
  {
    q: "Can my school sponsor my plan?",
    a: "Yes. Schools on our School plan can sponsor individual learners (often via bursary partners). If your school is on Aptiverse, ask your SchoolAdmin — they can enrol you at no cost to you.",
  },
  {
    q: "What's your refund policy?",
    a: "14-day no-questions refund on any monthly subscription. Annual plans are pro-rated. Cancel any time — we won't make you fight a chatbot. (We use a real human or a clearly-labelled AI.)",
  },
  {
    q: "How do payments work?",
    a: "Cards (Visa, Mastercard, AmEx) and instant EFT — all SA banks supported. Billed monthly or annually in ZAR, no FX fees. Cancel any time from your settings; you keep access until the end of the billed period.",
  },
  {
    q: "Is my data safe?",
    a: "POPIA-compliant. Data is hosted in South Africa (Cape Town region). Your diary is end-to-end encrypted by default — even Aptiverse staff can't read it. We never sell data; bursary funders only see what you explicitly opt to share.",
  },
];

// ============================================================
// PAGE
// ============================================================
export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [audience, setAudience] = useState<Audience>("students");
  const plansQuery = usePlans();

  // Build the four track arrays from (live catalog × local marketing copy).
  // Memoised so we don't rebuild on every billing/audience toggle.
  const { studentPlans, familyPlans, tutorPlans, schoolPlan } = useMemo(() => {
    const byCode = new Map<string, PlanDto>(
      (plansQuery.data ?? []).map((p) => [p.code, p]),
    );
    const build = (codes: string[]): Plan[] =>
      codes
        .map((c) => buildPlan(byCode.get(c), PLAN_COPY[c]))
        .filter((p): p is Plan => p !== null);

    return {
      studentPlans: build(STUDENT_CODES),
      familyPlans: build(FAMILY_CODES),
      tutorPlans: build(TUTOR_CODES),
      schoolPlan: buildPlan(byCode.get("school"), PLAN_COPY["school"]),
    };
  }, [plansQuery.data]);

  const isLoading = plansQuery.isLoading;

  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2.5} sx={{ textAlign: "center", maxWidth: 820, mx: "auto" }}>
            <Typography variant="overline" color="primary.main">
              Pricing
            </Typography>
            <Typography variant="h1" component="h1">
              Real tools. Honest pricing.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Our AI is powered by Anthropic. Every message has a real cost behind it, so plans
              include monthly quotas — never silent overages. Within each track the features are
              the same; upper tiers buy more quota and deeper AI capabilities.
            </Typography>

            <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
              <ToggleButtonGroup
                value={billing}
                exclusive
                onChange={(_, v) => v && setBilling(v)}
                size="small"
              >
                <ToggleButton value="monthly" sx={{ px: 3 }}>
                  Monthly
                </ToggleButton>
                <ToggleButton value="annual" sx={{ px: 3 }}>
                  Annual <Chip label="−17%" size="small" color="primary" sx={{ ml: 1, height: 18 }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section py={4}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Tabs
            value={audience}
            onChange={(_, v) => setAudience(v)}
            sx={{
              "& .MuiTab-root": { fontWeight: 600, textTransform: "none", fontSize: "0.95rem" },
            }}
          >
            <Tab value="students" label="For students" />
            <Tab value="families" label="For families" />
            <Tab value="tutors" label="For tutors" />
            <Tab value="schools" label="For schools" />
          </Tabs>
        </Box>

        {isLoading ? (
          <PlanGridSkeleton cols={audience === "students" ? 3 : 4} />
        ) : (
          <>
            {audience === "students" && <PlanGrid plans={studentPlans} billing={billing} cols={3} />}
            {audience === "families" && <PlanGrid plans={familyPlans} billing={billing} cols={4} />}
            {audience === "tutors" && <PlanGrid plans={tutorPlans} billing={billing} cols={4} />}
            {audience === "schools" && schoolPlan && (
              <Grid container justifyContent="center">
                <Grid size={{ xs: 12, md: 8, lg: 6 }}>
                  <PlanCard plan={schoolPlan} billing={billing} />
                </Grid>
              </Grid>
            )}
          </>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 4 }}
          flexWrap="wrap"
          useFlexGap
        >
          <Chip icon={<AutoAwesomeIcon />} label="Powered by Anthropic" variant="outlined" size="small" />
          <Chip icon={<SmsOutlinedIcon />} label="WhatsApp included" variant="outlined" size="small" />
          <Chip label="Secure cards + EFT" variant="outlined" size="small" />
          <Chip label="POPIA compliant · ZA data residency" variant="outlined" size="small" />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2 }}>
          All prices in ZAR, incl. VAT. Cancel any time. Bursary partners can sponsor seats — talk to your school's admin.
        </Typography>
      </Section>

      <Section bg="paper" py={6}>
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          <Stack spacing={1.5} sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="overline" color="primary.main">
              Compare
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
              {audience === "students" && "What you unlock at each Student tier"}
              {audience === "families" && "What you unlock at each Family tier"}
              {audience === "tutors" && "What you unlock at each Tutor tier"}
              {audience === "schools" && "What's in School"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Same feature scope across a track — upper tiers buy more quota and deeper AI capabilities.
            </Typography>
          </Stack>
          {audience === "students" && <ComparisonTable rows={STUDENT_COMPARE} cols={["Free", "Student", "Pro", "Max"]} highlightCol="Pro" />}
          {audience === "families" && <ComparisonTable rows={FAMILY_COMPARE} cols={["Family", "Pro", "Max"]} highlightCol="Pro" />}
          {audience === "tutors" && <ComparisonTable rows={TUTOR_COMPARE} cols={["Free", "Pro", "Max"]} highlightCol="Pro" />}
          {audience === "schools" && (
            <Card variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                School plans are custom-quoted on roll size. Every learner gets the full Family Max stack;
                every teacher gets the analytics + differentiator + live-view suite; SchoolAdmins get readiness
                forecasts + bursary partner pipeline.
              </Typography>
              <Button component={Link} href="/for-schools/contact" variant="contained" size="large" sx={{ mt: 3 }}>
                Talk to sales
              </Button>
            </Card>
          )}
        </Box>
      </Section>

      <Section py={6}>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Stack spacing={1.5} sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="overline" color="primary.main">
              FAQ
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
              The questions everyone asks
            </Typography>
          </Stack>
          <Stack spacing={1}>
            {FAQ.map((f) => (
              <Accordion key={f.q} disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 1, "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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

      <Section
        bg="paper"
        eyebrow="Bursary partnerships"
        title="A pipeline that finds the talent"
        subtitle="If you fund students, we surface verified progress and university readiness — making allocations more accurate and impactful."
      >
        <Stack direction="row" justifyContent="center">
          <Button component={Link} href="/for-schools/contact" variant="contained" size="large">
            Partner with us
          </Button>
        </Stack>
      </Section>
    </>
  );
}

// ============================================================
// Plan grid & card
// ============================================================
// Shown while the catalog fetch is in flight — matches the row geometry
// of PlanGrid so the page doesn't reflow once data lands.
function PlanGridSkeleton({ cols }: { cols: 3 | 4 }) {
  const size = cols === 4 ? { xs: 12, sm: 6, md: 3 } : { xs: 12, sm: 6, md: 4 };
  return (
    <Grid container spacing={3} alignItems="stretch" justifyContent="center">
      {Array.from({ length: cols }).map((_, i) => (
        <Grid key={i} size={size}>
          <Skeleton variant="rounded" height={520} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  );
}

function PlanGrid({ plans, billing, cols }: { plans: Plan[]; billing: "monthly" | "annual"; cols: 3 | 4 }) {
  // 3-card layout: each card is xs:12 sm:6 md:4
  // 4-card layout: each card is xs:12 sm:6 md:3
  const size = cols === 4 ? { xs: 12, sm: 6, md: 3 } : { xs: 12, sm: 6, md: 4 };
  return (
    <Grid container spacing={3} alignItems="stretch" justifyContent="center">
      {plans.map((p) => (
        <Grid key={p.code} size={size}>
          <PlanCard plan={p} billing={billing} />
        </Grid>
      ))}
    </Grid>
  );
}

function PlanCard({ plan, billing }: { plan: Plan; billing: "monthly" | "annual" }) {
  const isFree = plan.monthly === 0;
  const isCustom = plan.monthly === null;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...(plan.highlight && {
          borderColor: "primary.main",
          borderWidth: 1.5,
          borderStyle: "solid",
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 0 0 1px rgba(63,157,149,0.5)"
              : "0 12px 40px -12px rgba(15,105,99,0.30)",
        }),
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {plan.highlight && (
          <Chip
            label="Most popular"
            color="primary"
            size="small"
            sx={{ alignSelf: "flex-start", mb: 1.5, fontWeight: 600 }}
          />
        )}
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {plan.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, minHeight: 36 }}>
          {plan.tagline}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {isCustom ? (
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Custom
              </Typography>
            </Stack>
          ) : isFree ? (
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                R0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {plan.commissionPercent ? "subscription" : "forever"}
              </Typography>
            </Stack>
          ) : billing === "annual" && plan.annual ? (
            <>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  R{Math.round(plan.annual / 12)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / month
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                R{plan.annual} billed annually
              </Typography>
            </>
          ) : (
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                R{plan.monthly}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / month
              </Typography>
            </Stack>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {plan.monthlyHint ?? plan.audience}
          </Typography>
        </Box>

        {plan.commissionPercent !== undefined && (
          <Box sx={{ p: 1.25, mb: 2, bgcolor: "primary.main", color: "primary.contrastText", borderRadius: 1 }}>
            <Typography variant="caption" sx={{ display: "block", fontWeight: 700, letterSpacing: 0.5 }}>
              MARKETPLACE COMMISSION
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {plan.commissionPercent === 0
                ? "0% — keep every rand you earn"
                : `${Math.round(plan.commissionPercent * 100)}% on platform bookings`}
            </Typography>
          </Box>
        )}

        {plan.seats !== undefined && (
          <Box sx={{ p: 1.25, mb: 2, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 600 }}>
              SEATS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Up to {plan.seats} learners
            </Typography>
          </Box>
        )}

        <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
            MONTHLY ALLOWANCE
          </Typography>
          <Quota label="Quick AI replies" value={plan.aiQuickPerMonth} />
          <Quota label="Deep AI sessions" value={plan.aiDeepPerMonth} />
          <Quota label="WhatsApp messages" value={plan.whatsappPerMonth} />
        </Box>

        <Stack spacing={1} sx={{ mb: 3, flex: 1 }}>
          {plan.features.map((f) => (
            <Stack key={f} direction="row" spacing={1} alignItems="flex-start">
              <CheckIcon sx={{ color: "primary.main", fontSize: 18, mt: 0.25, flexShrink: 0 }} />
              <Typography variant="body2">{f}</Typography>
            </Stack>
          ))}
          {plan.notIncluded?.map((f) => (
            <Stack key={f} direction="row" spacing={1} alignItems="flex-start" sx={{ opacity: 0.45 }}>
              <CloseIcon sx={{ fontSize: 18, mt: 0.25, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
                {f}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {plan.comingSoon ? (
          <Stack spacing={1}>
            <Button variant={plan.highlight ? "contained" : "outlined"} fullWidth disabled>
              Coming soon
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
              Available once paid billing is live
            </Typography>
          </Stack>
        ) : (
          <Button component={Link} href={plan.cta.href} variant={plan.highlight ? "contained" : "outlined"} fullWidth size="large">
            {plan.cta.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Quota({ label, value }: { label: string; value: number | "Unlimited" }) {
  const muted = value === 0;
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ opacity: muted ? 0.5 : 1, py: 0.25 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value === "Unlimited" ? "∞" : value === 0 ? "—" : value.toLocaleString()}
      </Typography>
    </Stack>
  );
}

// ============================================================
// Comparison tables
// ============================================================
type Row = { label: string; tip?: string; values: Record<string, React.ReactNode> };

const STUDENT_COMPARE: Row[] = [
  { label: "Subjects", values: { Free: "Up to 6", Student: "Unlimited", Pro: "Unlimited", Max: "Unlimited" } },
  { label: "Daily diary & wellbeing", values: { Free: <Yes />, Student: <Yes />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Quick AI / month", tip: "Short answers, recall, formulas — fast and lightweight.", values: { Free: "15", Student: "60", Pro: "300", Max: "1,200" } },
  { label: "Deep AI / month", tip: "Long walk-throughs, essay marking, study plans — slower but does serious work.", values: { Free: "—", Student: "5", Pro: "30", Max: "100" } },
  { label: "WhatsApp messages / month", values: { Free: "—", Student: "10", Pro: "50", Max: "200" } },
  { label: "Curriculum-aware AI tutor", tip: "Knows the exact NSC/IEB syllabus + textbook references.", values: { Free: <No />, Student: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "SBA Coach", tip: "Feedback on your draft against the actual SBA rubric.", values: { Free: <No />, Student: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Adaptive practice", values: { Free: <No />, Student: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Past papers — worked solutions", values: { Free: <No />, Student: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Mastery predictions & forecasts", values: { Free: <No />, Student: "Snapshot", Pro: <Yes />, Max: <Yes /> } },
  { label: "Career & university navigator", values: { Free: <No />, Student: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Tutor marketplace + booking", values: { Free: <No />, Student: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Exam simulator", tip: "Timed full papers, AI-marked.", values: { Free: <No />, Student: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Weekly AI debrief", values: { Free: <No />, Student: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Audio explanations", values: { Free: <No />, Student: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Cross-subject study plan", values: { Free: <No />, Student: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Contextual WhatsApp tutor", values: { Free: <No />, Student: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Support", values: { Free: "Community", Student: "Email", Pro: "Priority email", Max: "Priority email" } },
];

const FAMILY_COMPARE: Row[] = [
  { label: "Learners", values: { Family: "2", Pro: "4", Max: "6" } },
  { label: "Quick AI / month (shared)", values: { Family: "200", Pro: "800", Max: "2,400" } },
  { label: "Deep AI / month", values: { Family: "15", Pro: "80", Max: "200" } },
  { label: "WhatsApp / month", values: { Family: "40", Pro: "200", Max: "500" } },
  { label: "Every learner gets Student Pro features", values: { Family: <Yes />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Parent dashboard + realtime feed", values: { Family: <Yes />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Mastery forecast per child", tip: "Predicted matric mark with confidence interval.", values: { Family: <Yes />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Wellbeing summary (anonymised)", values: { Family: <Yes />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Bursary pipeline tracker per child", values: { Family: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "University readiness forecast", values: { Family: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Shared family calendar", values: { Family: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Family WhatsApp weekly recap", values: { Family: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Counselling session included", values: { Family: <No />, Pro: "1 / quarter", Max: "1 / quarter" } },
  { label: "AI parenting coach", tip: "Deep AI that knows your kids' context, helps you respond rather than react.", values: { Family: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Custom intervention plans per child", values: { Family: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Tutor concierge service", values: { Family: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Family wellbeing dashboard", values: { Family: <No />, Pro: <No />, Max: <Yes /> } },
];

const TUTOR_COMPARE: Row[] = [
  { label: "Subscription", values: { Free: "R0", Pro: "R149/mo", Max: "R349/mo" } },
  { label: "Commission on platform bookings", values: { Free: "15%", Pro: "10%", Max: "0%" } },
  { label: "Clients", values: { Free: "Unlimited", Pro: "Unlimited", Max: "Unlimited" } },
  { label: "Marketplace listing", values: { Free: <Yes />, Pro: "Featured", Max: "Top placement" } },
  { label: "Scheduling + secure payments", values: { Free: <Yes />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Client tracker + messaging", values: { Free: <Yes />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Quick AI / month", values: { Free: "15", Pro: "300", Max: "1,500" } },
  { label: "Deep AI / month", values: { Free: "—", Pro: "20", Max: "80" } },
  { label: "WhatsApp / month", values: { Free: "10", Pro: "100", Max: "500" } },
  { label: "AI lesson plan generator", tip: "Pulls each client's curriculum + SBA marks → 60-min plan.", values: { Free: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "AI worksheet generator", values: { Free: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Mastery prediction per client", values: { Free: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Auto parent reports", tip: "AI-written weekly recap delivered via WhatsApp / email.", values: { Free: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "Curriculum-aware AI (your own)", values: { Free: <No />, Pro: <Yes />, Max: <Yes /> } },
  { label: "AI SBA marker", tip: "Photo a draft, get marked output against the rubric.", values: { Free: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "White-label parent reports", values: { Free: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "SARS-ready income export", values: { Free: <No />, Pro: <No />, Max: <Yes /> } },
  { label: "Group tutoring mode", values: { Free: <No />, Pro: <No />, Max: <Yes /> } },
];

function ComparisonTable({
  rows,
  cols,
  highlightCol,
}: {
  rows: Row[];
  cols: string[];
  highlightCol?: string;
}) {
  return (
    <Card variant="outlined">
      <Box sx={{ overflowX: "auto" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <Box component="thead" sx={{ bgcolor: "action.hover" }}>
            <Box component="tr">
              <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, width: "32%" }}>
                Feature
              </Box>
              {cols.map((c) => (
                <Box
                  key={c}
                  component="th"
                  sx={{
                    p: 2,
                    textAlign: "center",
                    fontWeight: 600,
                    color: c === highlightCol ? "primary.main" : undefined,
                  }}
                >
                  {c}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {rows.map((r, i) => (
              <Box
                component="tr"
                key={r.label}
                sx={{
                  "&:not(:last-of-type)": { borderBottom: 1, borderColor: "divider" },
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Box component="td" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {r.label}
                    </Typography>
                    {r.tip && (
                      <Tooltip title={r.tip} arrow placement="right">
                        <IconButton size="small" sx={{ p: 0.25 }}>
                          <InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
                {cols.map((c) => (
                  <Box
                    key={c}
                    component="td"
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: c === highlightCol && i % 2 === 0 ? "action.hover" : undefined,
                    }}
                  >
                    {r.values[c] ?? "—"}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

function Yes() {
  return <CheckIcon sx={{ color: "primary.main", fontSize: 20 }} />;
}
function No() {
  return <CloseIcon sx={{ color: "text.disabled", fontSize: 20 }} />;
}
