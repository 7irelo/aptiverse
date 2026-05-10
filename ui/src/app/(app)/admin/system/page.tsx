"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import { LineChart } from "@mui/x-charts/LineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { Dot } from "@/components/common/Dot";
import { useTicker } from "@/lib/hooks/useTicker";

const SERVICES = [
  { name: "auth-provider", port: 5000, status: "healthy", p95: 42, rps: 124 },
  { name: "academic-planning-service", port: 5001, status: "healthy", p95: 68, rps: 32 },
  { name: "ai-service", port: 8000, status: "healthy", p95: 320, rps: 88 },
  { name: "payment-gateway", port: 3001, status: "degraded", p95: 540, rps: 14 },
  { name: "event-architecture", port: 8080, status: "healthy", p95: 18, rps: 412 },
  { name: "notification-service", port: 8081, status: "healthy", p95: 24, rps: 38 },
  { name: "practice-service", port: 5012, status: "healthy", p95: 88, rps: 56 },
  { name: "wellbeing-service", port: 5014, status: "healthy", p95: 32, rps: 18 },
];

export default function SystemHealth() {
  const tick = useTicker(2000);
  const series = Array.from({ length: 30 }, (_, i) => 80 + Math.round(Math.sin((tick + i) / 4) * 30 + Math.random() * 20));

  return (
    <PermissionGuard require="system.read">
      <PageHeader
        title="System health"
        description="Service status, latency and throughput across the 20-microservice platform."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "System" }]}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <Dot color="success" pulsing />
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
              LIVE
            </Typography>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Aggregate request rate
              </Typography>
              <LineChart
                height={260}
                xAxis={[{ data: Array.from({ length: 30 }, (_, i) => `${30 - i}s`), scaleType: "point" }]}
                series={[{ data: series, color: "#0F6963", curve: "natural", showMark: false, area: true }]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
        {SERVICES.map((s) => (
          <Grid key={s.name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                    {s.name}
                  </Typography>
                  <Chip
                    label={s.status}
                    size="small"
                    color={s.status === "healthy" ? "success" : s.status === "degraded" ? "warning" : "error"}
                    sx={{ textTransform: "capitalize" }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  port {s.port}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      p95
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {s.p95} ms
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      RPS
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {s.rps}
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (s.p95 / 1000) * 100)}
                  color={s.p95 > 300 ? "warning" : "success"}
                  sx={{ mt: 1.5 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PermissionGuard>
  );
}
