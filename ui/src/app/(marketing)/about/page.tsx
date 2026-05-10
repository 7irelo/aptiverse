"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";


export default function Page() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              About
            </Typography>
            <Typography variant="h1" component="h1">
              Built with care, in South Africa.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              We believe matric is hard enough — the tools around it shouldn't make it harder. Aptiverse is what we wish we'd had ourselves.
            </Typography>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section eyebrow="Mission" title="From 'I am not enough' to 'I am capable and growing.'" subtitle="We measure success by sustained growth and wellbeing — never just marks. Every product decision starts there." />

      <Section bg="paper" eyebrow="Values" title="What we stand for">
        <Grid container spacing={3}>
          {VALUES.map((v) => (
            <Grid key={v.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={1}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {v.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {v.body}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}

const VALUES = [
  { title: "Growth, not ranking", body: "We never compare students to each other. We compare you to past you." },
  { title: "Wellbeing first", body: "If something would make a 16-year-old anxious, we don't ship it. Period." },
  { title: "Real access", body: "Our free tier is genuinely useful. Bursary partnerships fund the rest." },
  { title: "Privacy by default", body: "Diaries are private. Marks are guarded. POPIA-compliant from day zero." },
  { title: "South African context", body: "IEB, NSC, NSFAS, four official languages. Built for here, not adapted." },
  { title: "Empathy, then engineering", body: "Every feature begins with a real story from a real student." },
];
