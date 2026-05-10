"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";

type Flag = { key: string; description: string; enabled: boolean; rollout: number; env: string };

const INITIAL: Flag[] = [
  { key: "ai_practice_v2", description: "New AI practice generator with reasoning chains", enabled: true, rollout: 80, env: "production" },
  { key: "live_collab_workspace", description: "Real-time collaborative workspace for study groups", enabled: false, rollout: 0, env: "staging" },
  { key: "psychologist_video_chat", description: "Video chat with platform psychologists", enabled: true, rollout: 30, env: "production" },
  { key: "voice_diary", description: "Voice-input diary entries with transcription", enabled: false, rollout: 5, env: "production" },
  { key: "school_admin_export", description: "Allow school admins to export learner data", enabled: true, rollout: 100, env: "production" },
];

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState(INITIAL);

  return (
    <PermissionGuard require="flags.read">
      <PageHeader
        title="Feature flags"
        description="Toggle and roll out features without redeploys. Changes audited."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Feature flags" }]}
      />
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
    </PermissionGuard>
  );
}
