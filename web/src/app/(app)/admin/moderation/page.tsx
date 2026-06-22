"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { QueryStates } from "@/components/common/QueryStates";
import { useModerationQueue, type ModerationFlag } from "@/lib/api/queries";

export default function ModerationPage() {
  const query = useModerationQueue();

  return (
    <PermissionGuard require="content.moderate">
      <PageHeader
        title="Moderation queue"
        description="Reports flagged by users and AI auto-detection."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Moderation" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <ShieldOutlinedIcon />,
          title: "Nothing to moderate",
          description: "You're caught up — new flags from users and AI auto-detection land here.",
        }}
      >
        {(flags) => (
          <Stack spacing={2}>
            {flags.map((f) => (
              <FlagCard key={f.id} flag={f} />
            ))}
          </Stack>
        )}
      </QueryStates>
    </PermissionGuard>
  );
}

function FlagCard({ flag: f }: { flag: ModerationFlag }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {f.reason}
              </Typography>
              <Chip
                label={f.severity}
                size="small"
                color={f.severity === "high" ? "error" : f.severity === "medium" ? "warning" : "default"}
                sx={{ textTransform: "capitalize" }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Target: {f.target} · Reported by {f.reporter}
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic", mt: 1, p: 1.5, bgcolor: "action.hover", borderRadius: 1.5 }}>
              &quot;{f.excerpt}&quot;
            </Typography>
          </Stack>
          <Stack spacing={1}>
            <Button variant="contained" color="error">
              Action
            </Button>
            <Button variant="outlined">Open target</Button>
            <Button variant="text">Dismiss</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
