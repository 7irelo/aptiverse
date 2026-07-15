"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import { Section } from "@/components/common/Section";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { FeatureCard } from "@/components/common/FeatureCard";
import type { FeatureCardProps } from "@/components/common/FeatureCard";

type Cta = { label: string; href?: string; disabled?: boolean };

export type RoleLandingProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  features: FeatureCardProps[];
  featuresEyebrow?: string;
  featuresTitle?: string;
  closingTitle?: string;
  closingBody?: string;
};

function CtaButton({ cta, variant }: { cta: Cta; variant: "contained" | "outlined" }) {
  // The filled CTA is the conversion action, so it carries the citron accent
  // used for primary actions everywhere else in the product.
  const color = variant === "contained" ? "secondary" : undefined;

  if (cta.disabled) {
    return (
      <Button variant={variant} color={color} size="large" disabled>
        {cta.label}
      </Button>
    );
  }
  return (
    <Button component={Link} href={cta.href!} variant={variant} color={color} size="large">
      {cta.label}
    </Button>
  );
}

export function RoleLanding(p: RoleLandingProps) {
  return (
    <>
      <GradientBackdrop variant="hero">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Chip
              label={p.eyebrow}
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
              {p.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              {p.description}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }} flexWrap="wrap" useFlexGap>
              <CtaButton cta={p.primaryCta} variant="contained" />
              {p.secondaryCta && <CtaButton cta={p.secondaryCta} variant="outlined" />}
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section
        eyebrow={p.featuresEyebrow ?? "What's included"}
        title={p.featuresTitle ?? "Made for the way you work"}
      >
        <Grid container spacing={3}>
          {p.features.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Box
        sx={{
          py: { xs: 6, md: 12 },
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={1.5} sx={{ maxWidth: 620 }}>
              <Typography variant="h3" component="h2" sx={{ letterSpacing: "-0.02em" }}>
                {p.closingTitle ?? "Start free today."}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
                {p.closingBody ?? "No card needed. Upgrade only when you are ready."}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <CtaButton cta={p.primaryCta} variant="contained" />
              {p.secondaryCta && <CtaButton cta={p.secondaryCta} variant="outlined" />}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
