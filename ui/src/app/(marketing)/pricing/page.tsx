"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import Link from "next/link";
import { Section } from "@/components/common/Section";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";


type Plan = {
  name: string;
  tagline: string;
  monthly: number | "Free" | "Custom";
  annual?: number;
  highlight?: boolean;
  features: string[];
  cta: { label: string; href: string };
  audience: string;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "Genuinely useful — start here",
    monthly: "Free",
    audience: "Any student",
    features: [
      "SBA tracking (up to 6 subjects)",
      "Basic goal-setting",
      "5 AI practice tests / month",
      "Daily diary & wellbeing check-ins",
      "Take-a-break library",
      "Bursary navigator (read-only)",
    ],
    cta: { label: "Create free account", href: "/register" },
  },
  {
    name: "Student",
    tagline: "Unlock the full AI toolkit",
    monthly: 99,
    annual: 990,
    highlight: true,
    audience: "Individual students",
    features: [
      "Unlimited AI practice tests",
      "Past paper integration (IEB & NSC)",
      "Predictive mastery & forecasts",
      "AI tutor (chatbot) — unlimited",
      "Career & university navigator",
      "Bursary application checklist",
      "Verified rewards programme",
      "Priority support",
    ],
    cta: { label: "Start 14-day trial", href: "/register?plan=student" },
  },
  {
    name: "Family",
    tagline: "For parents & guardians",
    monthly: 199,
    annual: 1990,
    audience: "Up to 4 children",
    features: [
      "Everything in Student × 4",
      "Parent 'How can I help?' dashboard",
      "Realtime activity & celebration alerts",
      "Family wellbeing summary",
      "Shared calendar integration",
      "1 free counselling session / quarter",
    ],
    cta: { label: "Choose Family", href: "/register?plan=family" },
  },
  {
    name: "School",
    tagline: "Whole-school deployment",
    monthly: "Custom",
    audience: "Schools & districts",
    features: [
      "Everything in Family for every learner",
      "Teacher gap-analysis & differentiated tools",
      "School admin analytics & readiness reports",
      "SSO & student-info-system integration",
      "Bursary & university partnership pipeline",
      "Dedicated success manager",
    ],
    cta: { label: "Talk to sales", href: "/contact?reason=school" },
  },
];

export default function PricingPage() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ textAlign: "center", maxWidth: 720, mx: "auto" }}>
            <Typography variant="overline" color="primary.main">
              Pricing
            </Typography>
            <Typography variant="h1" component="h1">
              Genuinely free. Genuinely fair.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              No tricks, no toxic upsells. Start free, upgrade only when you're ready.
            </Typography>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section py={6}>
        <Grid container spacing={3} alignItems="stretch">
          {PLANS.map((p) => (
            <Grid key={p.name} size={{ xs: 12, sm: 6, md: 3 }}>
              <PlanCard plan={p} />
            </Grid>
          ))}
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 4 }}>
          Prices in ZAR. Bursary partners may sponsor seats — talk to your school's admin.
        </Typography>
      </Section>

      <Section bg="paper" eyebrow="Bursary partnerships" title="A pipeline that finds the talent" subtitle="If you fund students, we surface verified progress and university readiness — making allocations more accurate and impactful.">
        <Stack direction="row" justifyContent="center">
          <Button component={Link} href="/contact?reason=bursary" variant="contained" size="large">
            Partner with us
          </Button>
        </Stack>
      </Section>
    </>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...(plan.highlight && {
          borderColor: "primary.main",
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 0 0 1px rgba(63,157,149,0.5)"
              : "0 8px 32px -8px rgba(15,105,99,0.25)",
        }),
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {plan.highlight && (
          <Chip
            label="Most popular"
            color="primary"
            size="small"
            sx={{ alignSelf: "flex-start", mb: 1 }}
          />
        )}
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {plan.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {plan.tagline}
        </Typography>

        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 0.5 }}>
          {typeof plan.monthly === "number" ? (
            <>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                R{plan.monthly}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / month
              </Typography>
            </>
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {plan.monthly}
            </Typography>
          )}
        </Stack>
        {plan.annual && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            or R{plan.annual}/yr — saves 17%
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          {plan.audience}
        </Typography>

        <List dense disablePadding sx={{ mb: 2 }}>
          {plan.features.map((f) => (
            <ListItem key={f} disableGutters sx={{ alignItems: "flex-start", py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                <CheckIcon sx={{ color: "primary.main", fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText primary={f} primaryTypographyProps={{ variant: "body2" }} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ flex: 1 }} />
        <Button
          component={Link}
          href={plan.cta.href}
          variant={plan.highlight ? "contained" : "outlined"}
          fullWidth
        >
          {plan.cta.label}
        </Button>
      </CardContent>
    </Card>
  );
}
