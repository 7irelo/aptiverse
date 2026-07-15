"use client";

import { useState } from "react";
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
// server component in page.tsx and passed in as `plans` — this component owns
// only the billing toggle, audience tabs, and rendering.
//
// SINGLE SOURCE OF TRUTH: every number here (prices, seat caps, AI session
// quotas) comes from that catalog, seeded from EntitlementsCatalogSeeder.cs.
// Only marketing prose lives in this file, and any number inside a bullet is a
// {token} filled from the live plan (see fillTokens) — so the copy can never
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
      "Granular goals you set yourself",
      "A study planner and reminders",
      "Daily diary and mood check-in, encrypted",
      "Basic practice questions",
      "Around {aiQuick} AI study questions a month",
    ],
    notIncluded: [
      "Full AI study assistant",
      "Mastery predictions",
      "Past papers with worked solutions",
    ],
  },
  "student.pro": {
    audience: "students",
    audienceLabel: "For one student",
    tagline: "The full study toolkit.",
    highlight: true,
    cta: { label: "Choose Pro", href: "/register?plan=student.pro" },
    features: [
      "Everything in Free",
      "Unlimited subjects or modules",
      "Curriculum-aware AI study assistant",
      "Adaptive practice that scales to you",
      "Past papers and resources with worked solutions",
      "Mastery predictions per subject",
      "Career planner",
      "Around {aiQuick} quick and {aiDeep} deep AI sessions a month",
      "Priority email support",
    ],
  },
  "student.max": {
    audience: "students",
    audienceLabel: "For one student",
    tagline: "For exam season.",
    cta: { label: "Choose Max", href: "/register?plan=student.max" },
    features: [
      "Everything in Pro",
      "Exam practice with timed papers",
      "Higher AI limits, around {aiQuick} quick and {aiDeep} deep a month",
      "Audio explanations for tricky topics",
      "A cross-subject study plan",
    ],
  },
  parent: {
    audience: "parents",
    audienceLabel: "For parents",
    tagline: "For one learner.",
    cta: { label: "Choose 1 child", href: "/register?plan=parent" },
    features: [
      "One child on Student Pro",
      "Parent dashboard, calm and honest",
      "Private wellbeing summary and mark forecast",
      "Celebration alerts and shared family calendar",
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
      "Parent dashboard, calm and honest",
      "Private wellbeing summary and mark forecast",
      "Celebration alerts and shared family calendar",
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
      "Parent dashboard, calm and honest",
      "Private wellbeing summary and mark forecast",
      "Celebration alerts and shared family calendar",
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
      "Parent dashboard, calm and honest",
      "Private wellbeing summary and mark forecast",
      "Celebration alerts and shared family calendar",
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
    a: "Yes. Aptiverse works from Grade R to university. The tools adapt to your stage, so a university student sees modules and coursework, and a school student sees subjects and past papers.",
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
    a: "We follow POPIA and host data in South Africa. Your diary is end-to-end encrypted by default, so even we cannot read it. We never sell your data.",
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

export default function PricingClient({ plans: allPlans }: { plans: PlanDto[] }) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [audience, setAudience] = useState<Audience>("students");

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
