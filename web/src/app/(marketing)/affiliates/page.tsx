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
import Divider from "@mui/material/Divider";
import Link from "next/link";
import {
  Link2,
  Wallet,
  ShieldCheck,
  Clock,
  Infinity as InfinityIcon,
  Check,
  ChevronDown,
  Share2,
  CreditCard,
  Landmark,
  FileText,
  Users,
  GraduationCap,
} from "lucide-react";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { FeatureCard } from "@/components/common/FeatureCard";

// The commission terms are stated as a share, never as a rand figure. Plan
// prices change, and a worked example reads as a forecast of what someone will
// earn. Nothing on this page promises an amount.
const STEPS = [
  {
    icon: Share2,
    title: "Share your link",
    body: "Every account gets a referral link the moment it is created. Post it, message it, put it in a bio. There is nothing to apply for and nothing to wait for.",
  },
  {
    icon: CreditCard,
    title: "They subscribe",
    body: "If someone who arrived through your link later pays for a plan, that payment is credited to you. It does not matter how long they took to decide.",
  },
  {
    icon: Landmark,
    title: "You get paid",
    body: "Earnings become payable 30 days after each payment clears. We pay by EFT into your own bank account, with a reference you can match on your statement.",
  },
];

const TERMS = [
  {
    icon: <Wallet size={20} />,
    title: "40% of what they pay",
    description:
      "You earn 40% of each subscription payment we actually receive, not of a list price. If someone pays for two months and stops, you earned on two months.",
  },
  {
    icon: <CreditCard size={20} />,
    title: "Their first three payments",
    description:
      "Counted from their first paid one, not from the day they signed up, and a refunded month frees its place. On an annual plan, where a year is paid at once, it is the first annual payment.",
  },
  {
    icon: <InfinityIcon size={20} />,
    title: "The link does not expire",
    description:
      "Someone can join free through your link in March and only upgrade in September. It still counts, and your three months start at that September payment.",
  },
  {
    icon: <Clock size={20} />,
    title: "A 30 day hold",
    description:
      "Each amount sits on hold for 30 days before it becomes payable. That covers the refund and chargeback window, so nothing is paid out and then clawed back.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Every cent is on the record",
    description:
      "The ledger is append-only. Corrections are added as new entries rather than edits, so your history cannot change behind you, and neither can ours.",
  },
  {
    icon: <Link2 size={20} />,
    title: "One referrer per person",
    description:
      "Whoever referred someone first keeps them. A second link cannot take a referral off you later.",
  },
];

const AUDIENCE = [
  {
    icon: <GraduationCap size={20} />,
    title: "Students",
    description:
      "You already talk to the exact people this is built for. A class group chat reaches more of them in a minute than we reach in a week.",
  },
  {
    icon: <Users size={20} />,
    title: "Tutors and parents",
    description:
      "You are asked for recommendations anyway. This pays you for the ones you were already making.",
  },
  {
    icon: <Wallet size={20} />,
    title: "Anyone with an audience",
    description:
      "You do not have to study, teach or parent to take part. If you can reach South African students, you can earn from it.",
  },
];

const FAQ = [
  {
    q: "Do I need to be a paying customer?",
    a: "No. A free account is enough. You never need to buy anything to earn, and the programme is open on every plan including the free one.",
  },
  {
    q: "How do I get paid?",
    a: "By EFT into a South African bank account in your own name. You add your banking and tax details once, and each payout carries a reference you can match against your statement.",
  },
  {
    q: "Why do you need my ID and tax number?",
    a: "Because this is income, and SARS treats it as such. We keep the records a payer is required to keep. Your details are stored against your payout record and are not used for anything else.",
  },
  {
    q: "When does the money actually arrive?",
    a: "Each amount becomes payable 30 days after the payment it came from cleared. Payouts are then run in batches, so the first one can take a little longer than the ones after it.",
  },
  {
    q: "Can I refer myself?",
    a: "No. Using your own link on a second account does not create a referral, and we check again at payment time.",
  },
  {
    q: "What if someone I referred asks for a refund?",
    a: "The commission on that payment is reversed. If it had already been paid to you, the amount is carried against your next payout rather than invoiced back to you.",
  },
  {
    q: "What if they pay annually instead of monthly?",
    a: "You earn 40% of their first annual payment. A year is paid in one charge, so that single payment already earns you 40% of a full year, more than three monthly payments would. Annual therefore counts as one commissionable payment rather than three.",
  },
  {
    q: "Is there a limit on how much I can earn?",
    a: "There is no cap on the number of people you can refer. Each of them earns you 40% on their first three monthly payments, or on their first annual payment.",
  },
];

export default function AffiliatesPage() {
  return (
    <>
      <GradientBackdrop variant="hero">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 12 } }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 6, lg: 10 }} alignItems="center">
            <Stack spacing={2.5} sx={{ flex: 1 }}>
              <Chip
                label="Affiliate programme"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  fontWeight: 600,
                }}
              />
              <Typography variant="h1" component="h1">
                Share Aptiverse. Earn 40%.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 540 }}>
                Every account comes with a referral link. When someone who used yours pays for a
                plan, you earn 40% of each of their first three payments. No application, no
                interview, no minimum following.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap>
                <Button
                  component={Link}
                  href="/affiliates/join"
                  variant="contained"
                  color="secondary"
                  size="large"
                >
                  Get my link
                </Button>
                <Button component={Link} href="/login" variant="outlined" size="large">
                  I already have an account
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Creating an account is free and takes a minute. You do not need to buy anything to
                earn.
              </Typography>
            </Stack>
            <Box sx={{ flex: 1, width: "100%", maxWidth: 460, mx: "auto" }}>
              <HowItPaysCard />
            </Box>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section
        eyebrow="How it works"
        title="Three steps, and only one of them is yours"
        subtitle="You share a link. The rest is bookkeeping, and we do it."
      >
        <Grid container spacing={3}>
          {STEPS.map((s, i) => (
            <Grid key={s.title} size={{ xs: 12, md: 4 }}>
              <StepCard n={i + 1} icon={s.icon} title={s.title} body={s.body} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section
        bg="paper"
        eyebrow="The terms"
        title="All of it, in plain language"
        subtitle="These are the actual rules the system runs on, not a summary of them."
      >
        <Grid container spacing={3}>
          {TERMS.map((t) => (
            <Grid key={t.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard icon={t.icon} title={t.title} description={t.description} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section eyebrow="Who it is for" title="You do not have to be a student">
        <Grid container spacing={3}>
          {AUDIENCE.map((a) => (
            <Grid key={a.title} size={{ xs: 12, md: 4 }}>
              <FeatureCard icon={a.icon} title={a.title} description={a.description} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section bg="paper" py={2}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={{ xs: 5, lg: 8 }} alignItems="center">
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="overline" color="primary.main">
              Getting paid
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
              Real money, into your own account.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Payouts are made by EFT to a South African bank account in your name. Before the first
              one we need the details any payer is legally required to hold, which you enter once.
            </Typography>
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              {[
                "Your full legal name, as it appears on your bank account",
                "Your ID or passport number, and your tax reference",
                "Bank, account number and branch code",
              ].map((t) => (
                <Stack key={t} direction="row" spacing={1.25} alignItems="flex-start">
                  <Box sx={{ color: "primary.main", mt: 0.25, display: "flex" }}>
                    <Check size={18} />
                  </Box>
                  <Typography variant="body2">{t}</Typography>
                </Stack>
              ))}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
              You can start sharing your link straight away and add these later. Earnings keep
              accruing either way, they simply wait for the details before they can be paid.
            </Typography>
          </Stack>
          <Box sx={{ flex: 1, width: "100%", maxWidth: 480, mx: "auto" }}>
            <RecordCard />
          </Box>
        </Stack>
      </Section>

      <Section eyebrow="Questions" title="The things people ask first" align="center">
        <Box sx={{ maxWidth: 820, mx: "auto" }}>
          {FAQ.map((f) => (
            <Accordion
              key={f.q}
              disableGutters
              elevation={0}
              sx={{
                bgcolor: "transparent",
                borderBottom: 1,
                borderColor: "divider",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  {f.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Section>

      <Section bg="paper" align="center">
        <Stack spacing={2.5} alignItems="center" sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
            Your link is already waiting.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
            Create a free account and it is on your dashboard under Refer and earn, along with
            everything you have earned so far.
          </Typography>
          <Button
            component={Link}
            href="/affiliates/join"
            variant="contained"
            color="secondary"
            size="large"
          >
            Get my link
          </Button>
        </Stack>
      </Section>
    </>
  );
}

function StepCard({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number;
  icon: typeof Share2;
  title: string;
  body: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "action.hover",
                color: "primary.main",
              }}
            >
              <Icon size={18} />
            </Box>
            <Typography variant="overline" color="text.secondary">
              Step {n}
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {body}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Shows the shape of the arrangement without naming an amount. The rows are the
// real states an entry moves through in the ledger.
function HowItPaysCard() {
  const rows = [
    { label: "They pay for a plan", value: "You earn 40%" },
    { label: "Held for 30 days", value: "Refund window" },
    { label: "Becomes payable", value: "Paid by EFT" },
  ];
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ color: "primary.main", display: "flex" }}>
              <Wallet size={20} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              What one referral looks like
            </Typography>
          </Stack>
          <Divider />
          <Stack spacing={1.75}>
            {rows.map((r) => (
              <Stack
                key={r.label}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="body2" color="text.secondary">
                  {r.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
                  {r.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Typography variant="caption" color="text.secondary">
            Repeats for their first three payments. Amounts depend on the plan they choose.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RecordCard() {
  const items = [
    { icon: <FileText size={18} />, label: "Every entry dated and referenced" },
    { icon: <Landmark size={18} />, label: "Paid to your own bank account" },
    { icon: <ShieldCheck size={18} />, label: "Records kept for SARS" },
  ];
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            You can see all of it
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your dashboard shows what is still on hold, what is ready to be paid and what has
            already gone out, with the bank reference against each one.
          </Typography>
          <Divider />
          <Stack spacing={1.5}>
            {items.map((i) => (
              <Stack key={i.label} direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ color: "primary.main", display: "flex" }}>{i.icon}</Box>
                <Typography variant="body2">{i.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
