"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { PageHeader } from "@/components/common/PageHeader";
import { NOTIFICATIONS } from "@/lib/mockData";
import { formatRelative } from "@/lib/format";
import { Dot } from "@/components/common/Dot";

const KIND_AVATAR: Record<string, { emoji: string; color: string }> = {
  celebration: { emoji: "🎉", color: "secondary.main" },
  reminder: { emoji: "📋", color: "primary.main" },
  alert: { emoji: "⚠️", color: "warning.main" },
  info: { emoji: "💡", color: "info.main" },
};

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Reminders, celebrations, and gentle nudges."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}
        actions={<Button variant="outlined">Mark all read</Button>}
      />

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Stack divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
            {NOTIFICATIONS.map((n) => {
              const k = KIND_AVATAR[n.kind];
              return (
                <Stack key={n.id} direction="row" spacing={2} alignItems="flex-start" sx={{ p: 2.5 }}>
                  <Avatar sx={{ bgcolor: k.color, color: "white", width: 40, height: 40 }}>{k.emoji}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: n.read ? 400 : 700 }}>
                        {n.title}
                      </Typography>
                      {!n.read && <Dot color="primary" size={8} />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {n.body}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      {formatRelative(n.time)}
                    </Typography>
                  </Box>
                  <Button size="small">View</Button>
                </Stack>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
