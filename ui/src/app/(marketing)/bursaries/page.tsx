"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Link from "next/link";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { StatusChip } from "@/components/common/StatusChip";
import { BURSARIES } from "@/lib/mockData";
import { formatDate, formatRelative } from "@/lib/format";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivismOutlined";


export default function Page() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              Bursaries & NSFAS
            </Typography>
            <Typography variant="h1" component="h1">
              Funding made simple.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Aptiverse keeps an updated list of bursaries, NSFAS deadlines and the documents you'll need. We'll remind you, check off your list, and even help you draft your motivation.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
              <Button component={Link} href="/register" variant="contained" size="large">
                Get reminders
              </Button>
              <Button component={Link} href="/contact?reason=bursary" variant="outlined" size="large">
                Bursary partner?
              </Button>
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section eyebrow="Open now" title="Featured bursaries">
        <Grid container spacing={3}>
          {BURSARIES.map((b) => (
            <Grid key={b.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText" }}>
                      <VolunteerActivismIcon />
                    </Box>
                    <StatusChip
                      kind={b.status === "open" ? "success" : b.status === "closing_soon" ? "warning" : "neutral"}
                      label={b.status === "open" ? "Open" : b.status === "closing_soon" ? "Closing soon" : "Closed"}
                    />
                  </Stack>
                  <Typography variant="h6" sx={{ mt: 2, mb: 0.5, fontWeight: 700 }}>
                    {b.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b.field}
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">Award</Typography>
                    <Typography variant="body2">{b.amount}</Typography>
                  </Stack>
                  <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Deadline</Typography>
                    <Typography variant="body2">
                      {formatDate(b.deadline)} ({formatRelative(b.deadline)})
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    {b.requirements.slice(0, 3).map((r) => (
                      <Chip key={r} label={r} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section bg="paper" eyebrow="Step by step" title="The Aptiverse bursary navigator">
        <Stack spacing={2}>
          {[
            { n: "1", title: "Tell us your subjects, marks and dream field", body: "30 seconds, no pressure. We pull from your existing profile." },
            { n: "2", title: "We match you to live bursaries", body: "Filtered by eligibility — no scrolling through dead links." },
            { n: "3", title: "Personalised checklist", body: "Documents, deadlines, motivation drafts — and reminders the right amount of times." },
            { n: "4", title: "Track applications", body: "All your applications in one dashboard. Plus the people you can talk to if you're stuck." },
          ].map((s) => (
            <Card key={s.n}>
              <CardContent sx={{ p: 3, display: "flex", gap: 2.5, alignItems: "flex-start" }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "primary.main", color: "primary.contrastText", display: "grid", placeItems: "center", fontWeight: 700, flexShrink: 0 }}>
                  {s.n}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.body}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Section>
    </>
  );
}
