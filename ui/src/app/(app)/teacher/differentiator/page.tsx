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
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import { PageHeader } from "@/components/common/PageHeader";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const TIERS = [
  { label: "Foundation", color: "warning.main", count: 6, sample: ["Solve dy/dx for y = 3x²", "Find slope at x = 1", "Why does the chain rule exist?"] },
  { label: "Core", color: "primary.main", count: 18, sample: ["Differentiate y = (3x² + 2)⁴", "If f(x) = sin(2x), find f'(π/4)", "Show that d/dx of e^(2x) = 2e^(2x)"] },
  { label: "Challenge", color: "secondary.main", count: 4, sample: ["Implicit differentiation of x² + y³ = 5xy", "Optimisation problem", "Prove the chain rule from first principles"] },
];

export default function DifferentiatorPage() {
  const [topic, setTopic] = useState("Calculus chain rule");

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

      <Grid container spacing={3}>
        {TIERS.map((t) => (
          <Grid key={t.label} size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" sx={{ color: t.color, fontWeight: 700 }}>
                      {t.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {t.count} learners
                    </Typography>
                  </Box>
                  <Chip label="6 questions" size="small" />
                </Stack>
                <Stack spacing={1}>
                  {t.sample.map((q, i) => (
                    <Box key={i} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                      <Typography variant="caption" color="text.secondary">
                        Q{i + 1}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "ui-monospace, monospace" }}>
                        {q}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                  Preview & assign
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
