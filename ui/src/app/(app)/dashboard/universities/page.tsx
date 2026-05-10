"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { UNIVERSITIES, APS_SCORE } from "@/lib/mockData";
import { formatDate } from "@/lib/format";

export default function UniversitiesDashboardPage() {
  return (
    <>
      <PageHeader
        title="Universities"
        description="South African universities, decoded — APS cutoffs, fees, deadlines, and what's actually required."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Universities" }]}
      />

      <Card sx={{ mb: 3, p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="text.secondary">
              Your live APS score
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, color: "primary.main" }}>
              {APS_SCORE}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Updated daily as your marks come in
            </Typography>
          </Box>
          <Box sx={{ flex: 1, maxWidth: 480 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              At your current APS, you'd qualify for:
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {UNIVERSITIES.flatMap((u) => u.apsCutoffs.filter((c) => c.aps <= APS_SCORE).slice(0, 1).map((c) => ({ uni: u.name, ...c }))).slice(0, 5).map((opt) => (
                <Chip key={`${opt.uni}-${opt.course}`} label={`${opt.course} · ${opt.uni.split(" ")[2] ?? opt.uni.split(" ").slice(-1)}`} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {UNIVERSITIES.map((u) => (
          <Grid key={u.id} size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {u.name}
                  </Typography>
                  <Chip label={u.city} size="small" />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  Application closes {formatDate(u.applicationDeadline)} · R{u.applicationFee} fee
                </Typography>
                <Stack spacing={1.5}>
                  {u.apsCutoffs.map((c) => {
                    const reachable = APS_SCORE >= c.aps;
                    return (
                      <Box key={c.course}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="body2">{c.course}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: reachable ? "success.main" : "warning.main" }}>
                            {reachable ? "Likely" : "Stretch"} · APS {c.aps}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (APS_SCORE / c.aps) * 100)}
                          color={reachable ? "success" : "warning"}
                          sx={{ height: 6, borderRadius: 999 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
                <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                  Save university
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
