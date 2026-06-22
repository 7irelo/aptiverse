"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { UNIVERSITIES } from "@/lib/mockData";
import { formatDate } from "@/lib/format";


export default function Page() {
  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              Universities
            </Typography>
            <Typography variant="h1" component="h1">
              SA universities, decoded.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              APS calculators, admission cutoffs, application fees and deadlines — collected and kept fresh.
            </Typography>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section py={6}>
        <Grid container spacing={3}>
          {UNIVERSITIES.map((u) => (
            <Grid key={u.id} size={{ xs: 12, sm: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {u.name}
                    </Typography>
                    <Chip label={u.city} size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Application fee: R{u.applicationFee} · Deadline {formatDate(u.applicationDeadline)}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {u.apsCutoffs.map((c) => (
                      <Stack key={c.course} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{c.course}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                          APS {c.aps}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>
    </>
  );
}
