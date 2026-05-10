"use client";

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { Dot } from "@/components/common/Dot";
import { LIVE_ACTIVITY, type LiveActivity } from "@/lib/mockData";
import { initials, formatRelative } from "@/lib/format";
import dayjs from "dayjs";

const ACTIONS_POOL = [
  "Started practice test",
  "Submitted assessment draft",
  "Completed wellbeing check-in",
  "Asked AI tutor",
  "Joined study group",
  "Paused for a break",
  "Marked goal complete",
  "Read past paper",
];

const SUBJECTS_POOL = ["Mathematics", "English HL", "Physical Sciences", "Life Sciences", "Geography", "Afrikaans FAL"];
const STUDENT_POOL = ["Thabo M.", "Naledi K.", "Lerato P.", "Sipho D.", "Aisha M.", "Mandla T.", "Khanya N.", "Tumi B."];

export type LiveActivityFeedProps = {
  title?: string;
  description?: string;
  height?: number;
  realtime?: boolean;
};

export function LiveActivityFeed({ title = "Live activity", description, height = 480, realtime = true }: LiveActivityFeedProps) {
  const [items, setItems] = useState<LiveActivity[]>(LIVE_ACTIVITY);

  useEffect(() => {
    if (!realtime) return;
    const id = setInterval(() => {
      setItems((prev) => {
        const id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
        const newItem: LiveActivity = {
          id,
          studentId: id,
          student: STUDENT_POOL[Math.floor(Math.random() * STUDENT_POOL.length)],
          action: ACTIONS_POOL[Math.floor(Math.random() * ACTIONS_POOL.length)],
          subject: Math.random() > 0.4 ? SUBJECTS_POOL[Math.floor(Math.random() * SUBJECTS_POOL.length)] : undefined,
          ts: new Date().toISOString(),
        };
        return [newItem, ...prev].slice(0, 30);
      });
    }, 4000);
    return () => clearInterval(id);
  }, [realtime]);

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Dot color="success" pulsing />
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
          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
            LIVE
          </Typography>
        </Stack>
        <Box sx={{ maxHeight: height, overflowY: "auto" }}>
          <Stack divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
            {items.map((it) => (
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
        </Box>
      </CardContent>
    </Card>
  );
}
