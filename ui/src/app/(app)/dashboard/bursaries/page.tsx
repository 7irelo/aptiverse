"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { BURSARIES } from "@/lib/mockData";
import { formatDate, formatRelative } from "@/lib/format";

export default function BursariesDashboardPage() {
  return (
    <>
      <PageHeader
        title="Bursary navigator"
        description="Live bursary opportunities, with personalised checklists and deadline reminders."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bursaries" }]}
        actions={<Button variant="contained">Start application</Button>}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {BURSARIES.map((b) => (
              <Card key={b.id}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {b.name}
                        </Typography>
                        <StatusChip
                          kind={b.status === "open" ? "success" : b.status === "closing_soon" ? "warning" : "neutral"}
                          label={b.status === "open" ? "Open" : b.status === "closing_soon" ? "Closing soon" : "Closed"}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {b.field} · {b.amount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                        Deadline {formatDate(b.deadline)} ({formatRelative(b.deadline)})
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                        {b.requirements.map((r) => (
                          <Chip key={r} label={r} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                    <Stack spacing={1}>
                      <Button variant="contained">Track application</Button>
                      <Button variant="outlined">View details</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: "sticky", top: 88 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                NSFAS application
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your personalised checklist
              </Typography>
              <Stack spacing={1.25}>
                {[
                  { label: "Identity document (parents + you)", done: true },
                  { label: "Proof of household income", done: true },
                  { label: "Proof of residence", done: false },
                  { label: "Latest school report", done: true },
                  { label: "Consent forms signed", done: false },
                ].map((c) => (
                  <Stack key={c.label} direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" color={c.done ? "text.disabled" : "text.primary"} sx={{ textDecoration: c.done ? "line-through" : "none" }}>
                      {c.label}
                    </Typography>
                    {!c.done && (
                      <Button size="small">Upload</Button>
                    )}
                  </Stack>
                ))}
              </Stack>
              <LinearProgress variant="determinate" value={60} sx={{ mt: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                3 of 5 documents uploaded
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
