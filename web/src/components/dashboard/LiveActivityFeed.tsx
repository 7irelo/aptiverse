"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import SensorsOutlinedIcon from "@mui/icons-material/SensorsOutlined";
import { Dot } from "@/components/common/Dot";
import { EmptyState } from "@/components/common/EmptyState";
import { useLiveActivity, type LiveActivity } from "@/lib/api/queries";
import { initials, formatRelative } from "@/lib/format";
import dayjs from "dayjs";

export type LiveActivityFeedProps = {
  title?: string;
  description?: string;
  height?: number;
  /** How many recent events to request from the API. */
  take?: number;
};

export function LiveActivityFeed({ title = "Live activity", description, height = 480, take = 30 }: LiveActivityFeedProps) {
  const query = useLiveActivity(take);
  const items = query.data ?? [];
  const isLive = items.length > 0;

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Dot color={isLive ? "success" : "secondary"} pulsing={isLive} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Stack>
            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
          {isLive && (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
              LIVE
            </Typography>
          )}
        </Stack>
        <Box sx={{ maxHeight: height, overflowY: "auto" }}>
          {query.isLoading ? (
            <Stack spacing={0} divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.75 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="30%" />
                  </Box>
                </Stack>
              ))}
            </Stack>
          ) : query.isError ? (
            <EmptyState
              size="compact"
              icon={<SensorsOutlinedIcon />}
              title="Couldn't load activity"
              description="We hit a snag fetching the live stream. Try refreshing in a moment."
            />
          ) : items.length === 0 ? (
            <EmptyState
              size="compact"
              icon={<SensorsOutlinedIcon />}
              title="No activity yet"
              description="This stream lights up in real time as soon as learners start working."
            />
          ) : (
            <Stack divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
              {items.map((it: LiveActivity) => (
                <Stack key={it.id} direction="row" spacing={1.5} alignItems="flex-start" sx={{ p: 1.75 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>{initials(it.student)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 600 }}>
                        {it.student}
                      </Box>{" "}
                      <Box component="span" color="text.secondary">{it.action.toLowerCase()}</Box>
                      {it.subject && (
                        <>
                          {" "}
                          <Box component="span" sx={{ fontWeight: 500, color: "primary.main" }}>
                            {it.subject}
                          </Box>
                        </>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(it.ts).diff(dayjs(), "second") > -10 ? "just now" : formatRelative(it.ts)}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
