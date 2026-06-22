"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { Dot } from "@/components/common/Dot";
import { QueryStates } from "@/components/common/QueryStates";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type AppNotification,
} from "@/lib/api/queries";
import { RelativeTime } from "@/components/common/RelativeTime";

const KIND_AVATAR: Record<string, { emoji: string; color: string }> = {
  celebration: { emoji: "🎉", color: "secondary.main" },
  reminder: { emoji: "📋", color: "primary.main" },
  alert: { emoji: "⚠️", color: "warning.main" },
  info: { emoji: "💡", color: "info.main" },
};

export default function NotificationsPage() {
  const query = useNotifications();
  const markAll = useMarkAllNotificationsRead();

  // Only enable "Mark all read" when there's something to mark — saves
  // a noop POST and gives the button a clearer disabled state.
  const hasUnread = (query.data ?? []).some((n) => !n.read);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Reminders, celebrations, and gentle nudges."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}
        actions={
          <Button
            variant="outlined"
            onClick={() => markAll.mutate()}
            disabled={!hasUnread || markAll.isPending}
          >
            {markAll.isPending ? "Marking…" : "Mark all read"}
          </Button>
        }
      />

      <QueryStates
        query={query}
        empty={{
          icon: <NotificationsNoneIcon />,
          title: "You're all caught up",
          description: "No new notifications. We'll let you know when something needs your attention.",
        }}
      >
        {(notifications) => <NotificationsList notifications={notifications} />}
      </QueryStates>
    </>
  );
}

function NotificationsList({ notifications }: { notifications: AppNotification[] }) {
  const markRead = useMarkNotificationRead();

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Stack divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
          {notifications.map((n) => {
            const k = KIND_AVATAR[n.kind] ?? KIND_AVATAR.info;
            const onView = () => {
              if (!n.read) markRead.mutate(n.id);
            };
            return (
              <Stack
                key={n.id}
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{
                  p: 2.5,
                  bgcolor: n.read ? "transparent" : (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(63,157,149,0.05)"
                      : "rgba(15,105,99,0.03)",
                  transition: "background-color 200ms ease",
                }}
              >
                <Avatar sx={{ bgcolor: k.color, color: "primary.contrastText", width: 40, height: 40 }}>
                  {k.emoji}
                </Avatar>
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
                    <RelativeTime iso={n.time} />
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  {n.actionHref ? (
                    <Button
                      component={Link}
                      href={n.actionHref}
                      size="small"
                      variant={n.read ? "text" : "outlined"}
                      onClick={onView}
                    >
                      View
                    </Button>
                  ) : (
                    !n.read && (
                      <Button size="small" variant="text" onClick={onView}>
                        Dismiss
                      </Button>
                    )
                  )}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
