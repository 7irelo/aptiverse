"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useDifferentiation, type DifferentiationTier } from "@/lib/api/queries";

const TIER_COLOR: Record<string, string> = {
  Foundation: "warning.main",
  Core: "primary.main",
  Challenge: "secondary.main",
};

export default function DifferentiatorPage() {
  const [topic, setTopic] = useState("Calculus chain rule");
  const query = useDifferentiation();

  return (
    <>
      <PageHeader
        title="Differentiated assignment creator"
        description="One SBA, three tiers — foundation, core, challenge — generated automatically and assigned by AI to the right learners."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Differentiator" }]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "flex-end" }}>
            <TextField select fullWidth label="Subject" defaultValue="math" sx={{ minWidth: 200 }}>
              <MenuItem value="math">Mathematics</MenuItem>
              <MenuItem value="physci">Physical Sciences</MenuItem>
              <MenuItem value="english">English HL</MenuItem>
            </TextField>
            <TextField fullWidth label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <TextField type="number" label="Questions per tier" defaultValue={6} sx={{ minWidth: 160 }} />
            <Button variant="contained" startIcon={<AutoAwesomeIcon />} sx={{ minWidth: 220 }}>
              Generate tiers
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <QueryStates
        query={query}
        empty={{
          icon: <AutoAwesomeIcon />,
          title: "Pick a topic and generate",
          description: "We split the class into Foundation / Core / Challenge tiers based on each learner's mastery, then suggest a starting point.",
        }}
      >
        {(tiers) => (
          <Grid container spacing={3}>
            {tiers.map((t) => (
              <Grid key={t.label} size={{ xs: 12, md: 4 }}>
                <TierCard tier={t} />
              </Grid>
            ))}
          </Grid>
        )}
      </QueryStates>
    </>
  );
}

function TierCard({ tier: t }: { tier: DifferentiationTier }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="overline" sx={{ color: TIER_COLOR[t.label] ?? "text.secondary", fontWeight: 700 }}>
              {t.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {t.count} learners
            </Typography>
          </Box>
          <Chip label="6 questions" size="small" />
        </Stack>
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
          <Typography variant="caption" color="text.secondary">
            Suggested approach
          </Typography>
          <Typography variant="body2">{t.suggestion}</Typography>
        </Box>
        <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
          Preview & assign
        </Button>
      </CardContent>
    </Card>
  );
}
