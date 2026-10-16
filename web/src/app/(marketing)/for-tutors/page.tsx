"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Link from "next/link";
import {
  IdCard,
  BadgeCheck,
  Users,
  Sparkles,
  BookOpen,
  Handshake,
  Check,
  ChevronDown,
  UserPlus,
  Search,
  Wallet,
  Star,
  MapPin,
} from "lucide-react";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { FeatureCard } from "@/components/common/FeatureCard";

export default function ForTutorsPage() {
  return (
    <>
      <GradientBackdrop variant="hero">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 12 } }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 6, lg: 10 }} alignItems="center">
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              <Chip
                label="For tutors"
                size="small"
                sx={{ alignSelf: "flex-start", bgcolor: "background.paper", border: 1, borderColor: "divider", fontWeight: 600 }}
              />
              <Typography variant="h1" component="h1">
                Get found. Keep every rand.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 520 }}>
                List a profile, show what you teach, and reach the students and parents already
                searching. You arrange the lessons and you get paid directly. Aptiverse never takes a
                cut.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap>
                <Button component={Link} href="/register?role=tutor" variant="contained" color="secondary" size="large">
                  List your profile free
                </Button>
                <Button component={Link} href="/pricing?for=tutors" variant="outlined" size="large">
                  See tutor plans
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Listing is free, with no card and no commission. Upgrade only when you want featured
                placement and the prep tools.
              </Typography>
            </Stack>
            <Box sx={{ flex: 1, width: "100%", maxWidth: 460, mx: "auto" }}>
              <TutorProfileCard />
            </Box>
          </Stack>
        </Box>
      </GradientBackdrop>

      {/* How it works */}
      <Section
        eyebrow="How it works"
        title="Three steps, then you just teach"
        subtitle="No bidding, no lead fees, no waiting for a platform to release your money."
      >
        <Grid container spacing={3}>
          {STEPS.map((s, i) => (
            <Grid key={s.title} size={{ xs: 12, md: 4 }}>
              <StepCard n={i + 1} {...s} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* The commission story, told with our own numbers only. */}
      <Section bg="paper" py={2}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 5, lg: 8 }} alignItems="center">
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="overline" color="primary.main">
              No commission, ever
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
              What you charge is what you earn.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Aptiverse is not a marketplace and never sits between you and your money. There is no
              percentage, no lead fee, and no payout delay. You set your rate, the family pays you,
              and that is the end of it.
            </Typography>
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              {[
                "Zero commission on every lesson, on every plan",
                "You keep the student, even if you cancel your plan",
                "A flat monthly fee, or nothing at all on Tutor Free",
              ].map((t) => (
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
            <EarningsCard />
          </Box>
        </Stack>
      </Section>

      {/* Plans */}
      <Section
        eyebrow="Plans"
        title="Start free. Upgrade when it pays for itself."
        subtitle="Every plan is commission-free. The paid tiers buy visibility and prep time, not a share of your work."
      >
        <Grid container spacing={3}>
          {PLANS.map((p) => (
            <Grid key={p.name} size={{ xs: 12, md: 4 }}>
              <PlanCard {...p} />
            </Grid>
          ))}
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3 }}>
          Prices in rand, per month, billed monthly. Annual billing gives you two months free.
        </Typography>
      </Section>

      {/* Features */}
      <Section bg="paper" eyebrow="What you get" title="A profile that works while you teach">
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
            List your profile today.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
            It takes about ten minutes and costs nothing. Upgrade for featured placement and AI prep
            tools whenever you are ready, and cancel any time.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap justifyContent="center">
            <Button component={Link} href="/register?role=tutor" variant="contained" color="secondary" size="large">
              List your profile free
            </Button>
            <Button component={Link} href="/pricing?for=tutors" variant="outlined" size="large">
              See tutor plans
            </Button>
          </Stack>
        </Stack>
      </Section>
    </>
  );
}

// What a tutor's public listing looks like to a searching parent. Shows the
// page's promise rather than describing it.
function TutorProfileCard() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main", fontWeight: 700 }}>NM</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              Naledi M.
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "text.secondary" }}>
              <MapPin size={13} />
              <Typography variant="caption">Pretoria, and online</Typography>
            </Stack>
          </Box>
          <Chip label="Featured" size="small" color="secondary" sx={{ fontWeight: 600 }} />
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
          {["Mathematics", "Physical Sciences", "Grade 10 to 12"].map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 24 }} />
          ))}
        </Stack>

        <Stack spacing={1.5}>
          <ProfileRow icon={<BadgeCheck size={16} />} accent="primary.main" label="Qualification" value="BSc, verified" />
          <ProfileRow icon={<Star size={16} />} accent="secondary.main" label="Experience" value="8 years" />
          <ProfileRow icon={<Wallet size={16} />} accent="text.secondary" label="Your rate" value="R350 / hour" />
        </Stack>

        <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            Families contact you directly. Aptiverse takes R0 of that R350.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// A flat fee is easy to say and hard to feel. This does the arithmetic for the
// tutor using only our own published price, so it stays honest: no claims about
// what anyone else charges.
function EarningsCard() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">
          A month on Tutor Pro
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          At R350 an hour, eight lessons a week
        </Typography>
        <Stack spacing={1.25}>
          <MoneyRow label="You invoice your students" value="R11 200" />
          <MoneyRow label="Aptiverse commission" value="R0" accent />
          <MoneyRow label="Tutor Pro, flat monthly fee" value="R199" />
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            You keep
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            R11 001
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
          Your plan is covered by your first lesson of the month. Every lesson after that is yours.
        </Typography>
      </CardContent>
    </Card>
  );
}

function MoneyRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: accent ? "primary.main" : "text.primary", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function ProfileRow({
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

type Plan = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  items: string[];
  featured?: boolean;
};

function PlanCard({ name, price, cadence, blurb, items, featured }: Plan) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...(featured && { borderColor: "secondary.main" }),
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          {featured && <Chip label="Most popular" size="small" color="secondary" sx={{ height: 22, fontWeight: 600 }} />}
        </Stack>
        <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {price}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cadence}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {blurb}
        </Typography>
        <Stack spacing={1.25} sx={{ mb: 3 }}>
          {items.map((t) => (
            <Stack key={t} direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{ color: "primary.main", mt: 0.25, display: "flex", flexShrink: 0 }}>
                <Check size={16} />
              </Box>
              <Typography variant="body2">{t}</Typography>
            </Stack>
          ))}
        </Stack>
        <Button
          component={Link}
          href="/register?role=tutor"
          variant={featured ? "contained" : "outlined"}
          color={featured ? "secondary" : undefined}
          sx={{ mt: "auto" }}
        >
          {featured ? "Start with Pro" : `Choose ${name}`}
        </Button>
      </CardContent>
    </Card>
  );
}

const STEPS = [
  {
    icon: <UserPlus size={18} />,
    title: "Build your profile",
    body: "Add your subjects, grades, qualifications, experience, and your rate. About ten minutes.",
  },
  {
    icon: <Search size={18} />,
    title: "Get found",
    body: "Students and parents search by subject, grade, and area, and see your profile with your credentials up front.",
  },
  {
    icon: <Handshake size={18} />,
    title: "Teach and get paid",
    body: "They contact you directly. You agree the times and the rate, and the money goes straight to you.",
  },
];

const PLANS: Plan[] = [
  {
    name: "Tutor Free",
    price: "R0",
    cadence: "forever",
    blurb: "Everything you need to be found and get hired.",
    items: [
      "A public profile with subjects and rates",
      "Qualifications shown up front",
      "Direct contact from students and parents",
      "Zero commission",
    ],
  },
  {
    name: "Tutor Pro",
    price: "R199",
    cadence: "per month",
    blurb: "For tutors who want a full book and their evenings back.",
    featured: true,
    items: [
      "Everything in Tutor Free",
      "Featured placement in search",
      "AI lesson plans and worksheets",
      "Curriculum-aware AI for your own prep",
      "Profile-view insights",
    ],
  },
  {
    name: "Tutor Premium",
    price: "R349",
    cadence: "per month",
    blurb: "For established tutors competing for the best placements.",
    items: [
      "Everything in Tutor Pro",
      "Top placement in search",
      "The highest AI limits",
      "Priority support",
    ],
  },
];

const FEATURES = [
  {
    icon: <IdCard size={18} />,
    title: "A profile that gets found",
    description: "Show your subjects, qualifications, experience, and rates in a clean public profile.",
    accent: "primary" as const,
  },
  {
    icon: <BadgeCheck size={18} />,
    title: "Qualifications up front",
    description: "Put your credentials where students and parents can see them, not buried in a chat.",
    accent: "primary" as const,
  },
  {
    icon: <Users size={18} />,
    title: "Reach students and parents",
    description: "Be discoverable by the families searching for exactly what you teach.",
    accent: "info" as const,
  },
  {
    icon: <Sparkles size={18} />,
    title: "AI lesson prep",
    description: "Generate curriculum-aligned lesson plans and worksheets in minutes, at your students' level.",
    accent: "secondary" as const,
  },
  {
    icon: <BookOpen size={18} />,
    title: "Your own study assistant",
    description: "The same curriculum-aware AI, for your own prep and revision.",
    accent: "secondary" as const,
  },
  {
    icon: <Handshake size={18} />,
    title: "You own the relationship",
    description: "Arrangements and payments happen directly between you and the student. Aptiverse never takes a cut.",
    accent: "success" as const,
  },
];

const FAQ = [
  {
    q: "Does Aptiverse take a commission on my lessons?",
    a: "No. Not on any plan, not ever. You invoice your students and they pay you directly, so nothing routes through us and there is nothing for us to take a percentage of.",
  },
  {
    q: "What does listing cost?",
    a: "Nothing. Tutor Free gives you a public profile with your subjects, qualifications, and rates, and families can contact you directly. No card needed to start.",
  },
  {
    q: "Then what am I paying for on Tutor Pro?",
    a: "Visibility and time. Pro is R199 a month for featured placement in search, AI lesson plans and worksheets, curriculum-aware AI for your own prep, and insight into who is viewing your profile. At a R350 rate, your first lesson of the month covers it.",
  },
  {
    q: "Who handles payment and cancellations?",
    a: "You do. Aptiverse does not process lesson payments or hold your money, so your terms are yours to set and your cash flow is yours to keep.",
  },
  {
    q: "What happens to my students if I cancel my plan?",
    a: "Nothing. They are your students, not ours. Your profile drops back to the free tier and the featured placement and AI tools switch off, but every arrangement you have made stays exactly as it is.",
  },
  {
    q: "Do I need to be a qualified teacher?",
    a: "No, but you do need to be honest about your credentials. Your qualifications and experience appear on your profile so families can judge for themselves.",
  },
];
