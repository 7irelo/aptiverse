"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CelebrationIcon from "@mui/icons-material/CelebrationOutlined";
import EventNoteIcon from "@mui/icons-material/EventNoteOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmberOutlined";
import LightbulbIcon from "@mui/icons-material/LightbulbOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
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

// Category glyph + the single accent that category is allowed to show. Icons,
// not emojis. Colours resolve to real palette tokens so the tinted badge stays
// readable in both modes (celebration borrows the gold "achievement" zone; the
// citron accent is surface-only and never used as a small icon colour).
type NotifKind = { Icon: SvgIconComponent; color: "achievement" | "primary" | "warning" | "info" };

const KIND_ICON: Record<string, NotifKind> = {
  celebration: { Icon: CelebrationIcon, color: "achievement" },
  reminder: { Icon: EventNoteIcon, color: "primary" },
  alert: { Icon: WarningAmberIcon, color: "warning" },
  info: { Icon: LightbulbIcon, color: "info" },
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
            const k = KIND_ICON[n.kind] ?? KIND_ICON.info;
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
                      ? alpha(t.palette.primary.main, 0.05)
                      : alpha(t.palette.primary.main, 0.03),
                  transition: "background-color 200ms ease",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: (t) => alpha(t.palette[k.color].main, 0.14),
                    color: `${k.color}.main`,
                  }}
                >
                  <k.Icon fontSize="small" />
                </Box>
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
