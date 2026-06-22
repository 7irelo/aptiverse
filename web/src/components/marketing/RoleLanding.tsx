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
  outcomeTitle: string;
  outcomes: { stat: string; label: string }[];
};

export function RoleLanding(p: RoleLandingProps) {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Chip label={p.eyebrow} size="small" sx={{ alignSelf: "flex-start", bgcolor: "background.paper", border: 1, borderColor: "divider", fontWeight: 500 }} />
            <Typography variant="h1" component="h1">
              {p.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              {p.description}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }} flexWrap="wrap" useFlexGap>
              {p.primaryCta.disabled ? (
                <Button variant="contained" size="large" disabled>
                  {p.primaryCta.label}
                </Button>
              ) : (
                <Button component={Link} href={p.primaryCta.href!} variant="contained" size="large">
                  {p.primaryCta.label}
                </Button>
              )}
              {p.secondaryCta && (
                p.secondaryCta.disabled ? (
                  <Button variant="outlined" size="large" disabled>
                    {p.secondaryCta.label}
                  </Button>
                ) : (
                  <Button component={Link} href={p.secondaryCta.href!} variant="outlined" size="large">
                    {p.secondaryCta.label}
                  </Button>
                )
              )}
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section eyebrow="What's in it" title="Made for the way you work">
        <Grid container spacing={3}>
          {p.features.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section bg="paper" eyebrow="Outcomes" title={p.outcomeTitle} align="center">
        <Grid container spacing={3} justifyContent="center">
          {p.outcomes.map((o) => (
            <Grid key={o.label} size={{ xs: 12, sm: 4 }}>
              <Stack alignItems="center" spacing={1} sx={{ textAlign: "center" }}>
                <Typography variant="h2" sx={{ color: "primary.main", fontWeight: 700 }}>
                  {o.stat}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {o.label}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}
