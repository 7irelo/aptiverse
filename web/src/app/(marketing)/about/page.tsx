"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import { TrendingUp, HeartPulse, Unlock, ShieldCheck, MapPin, Heart } from "lucide-react";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { FeatureCard } from "@/components/common/FeatureCard";

export default function Page() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              About
            </Typography>
            <Typography variant="h1" component="h1">
              Built with care, in South Africa.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              We are building the tool we wish we had: one calm place to do well in your studies, and stay well while you do it.
            </Typography>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section eyebrow="Why we exist" title="Marks and wellbeing are not a trade-off">
        <Stack spacing={2.5} sx={{ maxWidth: 720 }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.0625rem", lineHeight: 1.75 }}>
            Students are told to work harder and to look after themselves, then handed tools that do
            neither well. Study apps ignore stress. Wellbeing apps ignore the exam on Monday. The two get
            treated as separate problems, so the student is left to carry the gap between them.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.0625rem", lineHeight: 1.75 }}>
            Aptiverse closes that gap. The same place that helps you plan, practise, and see where your
            results are heading also notices when you are running on empty, and does something about it.
            Better marks and a steadier head, from one tool, not two.
          </Typography>
        </Stack>
      </Section>

      <Section bg="paper" eyebrow="What we believe" title="Six things we will not compromise on">
        <Grid container spacing={3}>
          {VALUES.map((v) => (
            <Grid key={v.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...v} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section py={6}>
        <Stack spacing={2} alignItems="center" sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
            Come build the habit that lasts.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
            Start free and see what a calmer way to study feels like.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap justifyContent="center">
            <Button component={Link} href="/register" variant="contained" size="large">
              Start free
            </Button>
            <Button component={Link} href="/features" variant="outlined" size="large">
              See how it works
            </Button>
          </Stack>
        </Stack>
      </Section>
    </>
  );
}

const VALUES = [
  {
    icon: <TrendingUp size={18} />,
    title: "Growth, not ranking",
    description: "We never compare you to other students. We compare you to past you.",
    accent: "primary" as const,
  },
  {
    icon: <HeartPulse size={18} />,
    title: "Wellbeing first",
    description: "If something would make a stressed student more anxious, we do not ship it.",
    accent: "secondary" as const,
  },
  {
    icon: <Unlock size={18} />,
    title: "Real access",
    description: "Our free tier is genuinely useful. Paid plans fund the rest.",
    accent: "success" as const,
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Privacy by default",
    description: "Your diary is yours. Your marks are guarded. POPIA from day zero.",
    accent: "info" as const,
  },
  {
    icon: <MapPin size={18} />,
    title: "Built for here",
    description: "South African curricula and all 11 official languages. Built for here, not adapted.",
    accent: "primary" as const,
  },
  {
    icon: <Heart size={18} />,
    title: "Empathy, then engineering",
    description: "Every feature begins with a real story from a real student.",
    accent: "secondary" as const,
  },
];
