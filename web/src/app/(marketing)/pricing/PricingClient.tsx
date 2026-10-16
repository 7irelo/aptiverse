"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Link from "next/link";
import { Check, X, ChevronDown, ShieldCheck, Sparkles } from "lucide-react";
import { Section } from "@/components/common/Section";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { type PlanDto } from "@/lib/api/queries";

// Interactive pricing UI. The plan catalog is fetched at build/ISR time by the
// server component in page.tsx and passed in as `plans`. This component owns
// only the billing toggle, audience tabs, and rendering.
//
// SINGLE SOURCE OF TRUTH: every number here (prices, seat caps, AI session
// quotas) comes from that catalog, seeded from EntitlementsCatalogSeeder.cs.
// Only marketing prose lives in this file, and any number inside a bullet is a
// {token} filled from the live plan (see fillTokens), so the copy can never
// silently drift from what the catalog actually grants.

type Billing = "monthly" | "annual";
type Audience = "students" | "parents" | "tutors";

type PlanCopy = {
  audience: Audience;
  audienceLabel: string;
  tagline: string;
  highlight?: boolean;
  cta: { label: string; href: string };
  features: string[];
  notIncluded?: string[];
};

const PLAN_COPY: Record<string, PlanCopy> = {
  free: {
    audience: "students",
    audienceLabel: "For one student",
    tagline: "Start here. Genuinely useful.",
    cta: { label: "Create free account", href: "/register" },
    features: [
      "Track up to {subjectCap} subjects or modules",
      "Goals checked against your real practice and mastery",
      // "A study planner and reminders" sold a planner that does not exist in
      // any form: no entity, no endpoint, no route.
      "The career navigator, in full",
      // "Daily diary and mood check-in, encrypted" is the claim this whole
      // pass exists to kill. DiaryEntry.Content is a plain column.
      "Daily diary and mood check-in, private from your family",
      "Practice questions, marked automatically",
      "Around {aiQuick} AI study questions a month",
    ],
    // "Mastery predictions" and "Past papers with worked solutions" were both
    // listed as things Free does NOT get. Both are wrong, and wrong in the
    // direction that costs us trust and money: past_papers.read is in the free
    // baseline, and term predictions are not gated anywhere, so a free user
    // already has both. We were talking a free user out of a feature they had.
    // There are no worked solutions on any plan; past papers are a DBE
    // link-out.
    notIncluded: [
      "Full AI study assistant",
      "Unlimited subjects or modules",
      "Study groups and the workspace",
    ],
  },
  "student.pro": {
    audience: "students",
    audienceLabel: "For one student",
    tagline: "The full study toolkit.",
    highlight: true,
    cta: { label: "Choose Pro", href: "/register?plan=student.pro" },
    // Three of these were not Pro features at all. "Adaptive practice that
    // scales to you" is not adaptive on any plan; you pick the difficulty.
    // "Past papers with worked solutions" do not exist and the papers we do
    // link are free. "Mastery predictions per subject" are free too, and were
    // being double-sold here and denied on the Free card above.
    features: [
      "Everything in Free",
      "Unlimited subjects or modules",
      "The AI study assistant, on your subjects and marks",
      "Study groups, the workspace, and tutor connect",
      "Rewards you can spend on higher AI limits",
      "Around {aiQuick} quick and {aiDeep} deep AI sessions a month",
      "Priority email support",
    ],
  },
  // This card was stripped to "Pro with a bigger AI allowance" because all
  // three differentiators were fiction. The right fix was to ship one rather
  // than describe it early, and the exam simulator has now shipped, so it goes
  // back on the card. Every line below traces to code:
  //
  // - Format, sizes: PAPER_SIZES in practice/page.tsx:169 offers 30/50/100/150.
  // - Structure: the generator prompt (PracticeController.cs:509-512) sets
  //   Section A multiple choice at 1 mark, Section B at 2-4, Section C at 6-12.
  // - Timing: DurationMinutes at :371-376, roughly a minute a mark.
  // - Part marks: MarkWrittenAnswersAsync (PracticeService.cs:106-198) marks
  //   against MarkingMemo per question and clamps to 0..q.Marks.
  // - Marks + percent: SubmitAttemptAsync :606-622 scores an exam from marks.
  //
  // study_plan.ai is still a seeder row with no implementation on either side,
  // so it stays off the card until it is real. audio.explanations was in the
  // same state and has now been removed from the catalogue entirely, rather
  // than left as an entitlement that grants nothing.
  "student.max": {
    audience: "students",
    audienceLabel: "For one student",
    tagline: "Sit the paper before you sit the paper.",
    cta: { label: "Choose Max", href: "/register?plan=student.max" },
    features: [
      "Everything in Pro",
      "The exam simulator: a full paper, timed, one attempt only",
      "Choose 30, 50, 100 or 150 marks, in sections like a real paper",
      "Written answers marked against a memo, with part marks and what you missed",
      "Scored out of marks, not just a percent",
      "The highest AI limits we offer, around {aiQuick} quick and {aiDeep} deep a month",
    ],
  },
  parent: {
    audience: "parents",
    audienceLabel: "For parents",
    tagline: "For one learner.",
    cta: { label: "Choose 1 child", href: "/register?plan=parent" },
    features: [
      "One child on Student Pro",
      "Parent dashboard: your children and what is due for each",
      "No way to read their diary, on any plan",
      "Around {aiQuick} quick and {aiDeep} deep AI sessions a month",
    ],
  },
  "parent.2": {
    audience: "parents",
    audienceLabel: "For parents",
    tagline: "Two learners, combo price.",
    highlight: true,
    cta: { label: "Choose 2 children", href: "/register?plan=parent.2" },
    features: [
      "Two children, each on Student Pro",
      "Parent dashboard: your children and what is due for each",
      "No way to read their diary, on any plan",
      "Shared AI pool, around {aiQuick} quick and {aiDeep} deep a month",
    ],
  },
  "parent.3": {
    audience: "parents",
    audienceLabel: "For parents",
    tagline: "Three learners, combo price.",
    cta: { label: "Choose 3 children", href: "/register?plan=parent.3" },
    features: [
      "Three children, each on Student Pro",
      "Parent dashboard: your children and what is due for each",
      "No way to read their diary, on any plan",
      "Shared AI pool, around {aiQuick} quick and {aiDeep} deep a month",
    ],
  },
  "parent.4": {
    audience: "parents",
    audienceLabel: "For parents",
    tagline: "Four learners, combo price.",
    cta: { label: "Choose 4 children", href: "/register?plan=parent.4" },
    features: [
      "Four children, each on Student Pro",
      "Parent dashboard: your children and what is due for each",
      "No way to read their diary, on any plan",
      "Shared AI pool, around {aiQuick} quick and {aiDeep} deep a month",
    ],
  },
  "tutor.free": {
    audience: "tutors",
    audienceLabel: "For tutors",
    tagline: "Get listed, at no cost.",
    cta: { label: "List your profile free", href: "/register?role=tutor" },
    features: [
      "A public tutor profile in the directory",
      "Show your subjects, qualifications, and rates",
      "Be found by students and parents",
      "AI lesson prep, around {aiQuick} sessions a month",
      "You arrange and get paid directly. We never take a cut.",
    ],
    notIncluded: [
      "Featured placement in search",
      "AI worksheet generator",
      "Profile views and enquiry insights",
    ],
  },
  "tutor.pro": {
    audience: "tutors",
    audienceLabel: "For tutors",
    tagline: "Stand out, with prep tools.",
    highlight: true,
    cta: { label: "Choose Pro", href: "/register?role=tutor&plan=tutor.pro" },
    features: [
      "Everything in Free",
      "Featured placement in search",
      "AI lesson plan and worksheet generator",
      "Curriculum-aware AI for your own prep",
      "Profile views and enquiry insights",
      "Around {aiQuick} quick and {aiDeep} deep AI sessions a month",
    ],
  },
  "tutor.premium": {
    audience: "tutors",
    audienceLabel: "For tutors",
    tagline: "Top placement, every tool.",
    cta: { label: "Choose Premium", href: "/register?role=tutor&plan=tutor.premium" },
    features: [
      "Everything in Pro",
      "Top placement in search",
      "Highest AI limits, around {aiQuick} quick and {aiDeep} deep a month",
      "Priority support",
    ],
  },
};

const AUDIENCE_ORDER: readonly string[] = ["free", "student.pro", "student.max", "parent", "parent.2", "parent.3", "parent.4", "tutor.free", "tutor.pro", "tutor.premium"];

const FAQ = [
  {
    q: "Do you take a cut of what tutors earn?",
    a: "No. Aptiverse is not a marketplace. Tutors pay a subscription to list a profile and use the tools. Any tutoring arrangement and payment happens directly between the tutor and the student, off Aptiverse.",
  },
  {
    q: "When do the paid plans launch?",
    a: "Paid plans open when billing goes live. Start free now and you will be the first to know.",
  },
  {
    q: "Does this work for university, not just school?",
    // "A school student sees subjects and past papers" implied past papers are
    // a school-tier benefit. They are a free link-out to the DBE archive, and
    // a tertiary student gets nothing from them, so it was a poor thing to
    // name here anyway.
    a: "Yes. Aptiverse works from Grade 10 to university. The tools adapt to your stage, so a university student sees the courses they added and their coursework, and a school student sees CAPS subjects and their assessments.",
  },
  {
    q: "Why is there an AI limit?",
    a: "The AI is powered by Anthropic and every message has a real cost. Sensible monthly limits keep the plans sustainable and mean you never get a surprise overage bill.",
  },
  {
    q: "How do payments work?",
    a: "Cards and instant EFT through a South African gateway, billed monthly or annually in ZAR with no foreign exchange fees. Cancel any time from your settings and keep access to the end of the period.",
  },
  {
    q: "Is my data safe?",
    // "Your diary is end-to-end encrypted by default, so even we cannot read
    // it" was false, and putting it under a heading that says "is my data
    // safe" makes it the worst instance of the claim on the site: it is the
    // exact question a cautious parent or student asks before trusting us, and
    // the answer was invented. DiaryEntry.Content is a plain column. What is
    // real is the access boundary and POPIA.
    a: "We follow POPIA and host data in South Africa, and we never sell your data. On the diary specifically, be clear on what we do and do not promise: no parent, teacher, or other student can read it, and there is no endpoint that would let them. It is not end-to-end encrypted, though. Entries are stored as ordinary text on our servers, so staff access is governed by policy and access control rather than by cryptography.",
  },
];

// Resolve {tokens} in a marketing bullet from the live plan. A missing quota
// leaves the token blank rather than printing a stale guess.
function fillTokens(text: string, plan: PlanDto): string {
  const quota = (key: string) => plan.quotas.find((q) => q.quotaKey === key)?.perMonth;
  const fmt = (n: number | undefined) => (n === undefined ? "" : n < 0 ? "unlimited" : String(n));
  const capMatch = plan.features.map((f) => /^subjects\.up_to_(\d+)$/.exec(f)).find(Boolean);

  return text
    .replaceAll("{aiQuick}", fmt(quota("ai.quick")))
    .replaceAll("{aiDeep}", fmt(quota("ai.deep")))
    .replaceAll("{subjectCap}", capMatch ? capMatch[1] : "")
    .replaceAll("{seats}", String(plan.maxMembers));
}

function isFree(plan: PlanDto): boolean {
  return plan.kind === "free" || !plan.monthlyPriceZar;
}

// Which pricing tab a marketing link asked for. "families" is the marketing
// word for the parents plans, so it maps onto the parents audience.
function audienceFromParam(value: string | null): Audience {
  if (value === "tutors") return "tutors";
  if (value === "parents" || value === "families") return "parents";
  return "students";
}

export default function PricingClient({ plans: allPlans }: { plans: PlanDto[] }) {
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<Billing>("monthly");
  const [audience, setAudience] = useState<Audience>(() =>
    audienceFromParam(searchParams.get("for")),
  );

  // Keep the catalog in its intended order, filtered to the tab. Only plans
  // that exist in BOTH the catalog and our copy map render.
  const plans = allPlans
    .filter((p) => PLAN_COPY[p.code]?.audience === audience)
    .sort((a, b) => AUDIENCE_ORDER.indexOf(a.code) - AUDIENCE_ORDER.indexOf(b.code));

  return (
    <>
      <GradientBackdrop variant="hero">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 12 } }}>
          <Stack spacing={2.5} sx={{ textAlign: "center", maxWidth: 760, mx: "auto" }}>
            <Typography variant="overline" color="primary.main">
              Pricing
            </Typography>
            <Typography variant="h1" component="h1">
              Simple, honest pricing.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Pick your plan. All prices in ZAR, including VAT, and you can cancel any time. Tutors can
              list a profile free and pay only for visibility and tools. We never touch money between a tutor and a student.
            </Typography>

            <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
              <ToggleButtonGroup value={billing} exclusive onChange={(_, v) => v && setBilling(v)} size="small">
                <ToggleButton value="monthly" sx={{ px: 3 }}>
                  Monthly
                </ToggleButton>
                <ToggleButton value="annual" sx={{ px: 3 }}>
                  Annual
                  <Chip label="Save 17%" size="small" color="primary" sx={{ ml: 1, height: 18 }} />
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
            variant="scrollable"
            scrollButtons="auto"
            sx={{ "& .MuiTab-root": { fontWeight: 600, textTransform: "none", fontSize: "0.95rem" } }}
          >
            <Tab value="students" label="Students" />
            <Tab value="parents" label="Parents" />
            <Tab value="tutors" label="Tutors" />
          </Tabs>
        </Box>

        {allPlans.length === 0 ? (
          <Stack spacing={1.5} sx={{ textAlign: "center", py: 6, maxWidth: 460, mx: "auto" }}>
            <Typography variant="h6">Pricing is being updated</Typography>
            <Typography variant="body2" color="text.secondary">
              Plan details are refreshing. Please check back shortly, or start free in the meantime.
            </Typography>
            <Box sx={{ pt: 1 }}>
              <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
                Create free account
              </Button>
            </Box>
          </Stack>
        ) : (
          <Grid container spacing={3} alignItems="stretch" justifyContent="center">
            {plans.map((p) => (
              <Grid key={p.code} size={{ xs: 12, sm: 6, md: 4 }}>
                <PlanCard plan={p} billing={billing} />
              </Grid>
            ))}
          </Grid>
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
          <Chip icon={<Sparkles size={14} />} label="AI powered by Anthropic" variant="outlined" size="small" />
          <Chip label="Secure cards and instant EFT" variant="outlined" size="small" />
          <Chip icon={<ShieldCheck size={14} />} label="POPIA compliant, ZA data residency" variant="outlined" size="small" />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2 }}>
          Paid plans open when billing goes live. The free tier is available now.
        </Typography>
      </Section>

      <Section py={6}>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Stack spacing={1.5} sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="overline" color="primary.main">
              FAQ
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
              Questions, answered
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
    </>
  );
}

function priceBlock(plan: PlanDto, billing: Billing) {
  if (isFree(plan)) {
    return (
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          R0
        </Typography>
        <Typography variant="body2" color="text.secondary">
          forever
        </Typography>
      </Stack>
    );
  }
  if (billing === "annual" && plan.annualPriceZar) {
    return (
      <>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            R{Math.round(plan.annualPriceZar / 12)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            per month
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          R{plan.annualPriceZar} billed annually
        </Typography>
      </>
    );
  }
  return (
    <Stack direction="row" alignItems="baseline" spacing={1}>
      <Typography variant="h3" sx={{ fontWeight: 700 }}>
        R{plan.monthlyPriceZar}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        per month
      </Typography>
    </Stack>
  );
}

function PlanCard({ plan, billing }: { plan: PlanDto; billing: Billing }) {
  const copy = PLAN_COPY[plan.code];
  const free = isFree(plan);

  // Carry the billing choice into signup so an annual selection is charged
  // annually. Only paid plans need it; free CTAs stay clean.
  const href =
    billing === "annual" && !free
      ? `${copy.cta.href}${copy.cta.href.includes("?") ? "&" : "?"}billing=annual`
      : copy.cta.href;

  // The child count now lives in the plan name (e.g. "Parent (2 children)"),
  // so the line under the price is just the audience label.
  const subLabel = copy.audienceLabel;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...(copy.highlight && { borderColor: "primary.main", borderWidth: 1.5, borderStyle: "solid" }),
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {copy.highlight && (
          <Chip label="Most popular" color="primary" size="small" sx={{ alignSelf: "flex-start", mb: 1.5, fontWeight: 600 }} />
        )}
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {plan.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, minHeight: 40 }}>
          {copy.tagline}
        </Typography>

        <Box sx={{ mb: 2 }}>
          {priceBlock(plan, billing)}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {subLabel}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mb: 3, flex: 1 }}>
          {copy.features.map((f) => {
            const label = fillTokens(f, plan);
            return (
              <Stack key={f} direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{ color: "primary.main", mt: 0.25, flexShrink: 0, display: "flex" }}>
                  <Check size={16} />
                </Box>
                <Typography variant="body2">{label}</Typography>
              </Stack>
            );
          })}
          {copy.notIncluded?.map((f) => (
            <Stack key={f} direction="row" spacing={1} alignItems="flex-start" sx={{ opacity: 0.5 }}>
              <Box sx={{ mt: 0.25, flexShrink: 0, display: "flex", color: "text.disabled" }}>
                <X size={16} />
              </Box>
              <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
                {f}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Button
          component={Link}
          href={href}
          variant={copy.highlight || free ? "contained" : "outlined"}
          fullWidth
          size="large"
        >
          {copy.cta.label}
        </Button>
      </CardContent>
    </Card>
  );
}
