"use client";

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ToggleOnIcon from "@mui/icons-material/ToggleOnOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { QueryStates } from "@/components/common/QueryStates";
import { useFeatureFlags, type FeatureFlag } from "@/lib/api/queries";

export default function AdminFlagsPage() {
  const query = useFeatureFlags();

  return (
    <PermissionGuard require="flags.read">
      <PageHeader
        title="Feature flags"
        description="Toggle and roll out features without redeploys. Changes audited."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Feature flags" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <ToggleOnIcon />,
          title: "No feature flags defined",
          description: "Add a flag in the API to start gating features by environment and rollout %.",
        }}
      >
        {(flags) => <FlagsList initial={flags} />}
      </QueryStates>
    </PermissionGuard>
  );
}

function FlagsList({ initial }: { initial: FeatureFlag[] }) {
  // Local optimistic toggle. PATCH /api/feature-flags/flags/{key} would
  // persist; we don't call it yet — the backend's HttpPatch is a stub.
  const [flags, setFlags] = useState<FeatureFlag[]>(initial);

  useEffect(() => {
    setFlags(initial);
  }, [initial]);

  return (
    <Stack spacing={2}>
      {flags.map((f, i) => (
        <Card key={f.key}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                    {f.key}
                  </Typography>
                  <Chip label={f.env} size="small" color={f.env === "production" ? "primary" : "default"} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {f.description}
                </Typography>
              </Box>
              <PermissionGuard require="flags.write" fallback={<Switch checked={f.enabled} disabled />}>
                <Switch
                  checked={f.enabled}
                  onChange={() => setFlags((arr) => arr.map((x, j) => (j === i ? { ...x, enabled: !x.enabled } : x)))}
                />
              </PermissionGuard>
            </Stack>
            <Box sx={{ mt: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Rollout
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {f.rollout}%
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={f.rollout} color="primary" />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
