"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { Trash2, CalendarClock } from "lucide-react";
import {
  useStudyGroupSessions,
  useScheduleSession,
  useCancelSession,
  type StudyGroupSession,
} from "@/lib/api/queries";
import { useConfirm } from "@/components/common/ConfirmDialog";

export function SessionsPanel({ groupId }: { groupId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const sessionsQuery = useStudyGroupSessions(groupId);
  const schedule = useScheduleSession(groupId);
  const cancel = useCancelSession(groupId);
  const { confirm, dialog } = useConfirm();

  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState("");

  const sessions = sessionsQuery.data ?? [];
  const whenValid = when.length > 0 && dayjs(when).isValid() && dayjs(when).isAfter(dayjs());
  const canSubmit = title.trim().length >= 2 && whenValid && !schedule.isPending;

  const resetForm = () => {
    setTitle("");
    setWhen("");
    setDuration(60);
    setLocation("");
  };

  const submit = () => {
    if (!canSubmit) return;
    schedule.mutate(
      {
        title: title.trim(),
        startsAt: dayjs(when).toISOString(),
        durationMinutes: duration,
        location: location.trim() || undefined,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Session scheduled.", { variant: "success" });
          resetForm();
        },
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't schedule.", { variant: "error" }),
      },
    );
  };

  const remove = async (s: StudyGroupSession) => {
    const ok = await confirm({
      title: `Cancel "${s.title}"?`,
      description: "This removes the session for everyone in the group.",
      confirmLabel: "Cancel session",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await cancel.mutateAsync(s.id);
      enqueueSnackbar("Session cancelled.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Couldn't cancel${err instanceof Error ? `: ${err.message}` : ""}`, { variant: "error" });
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
          Upcoming
        </Typography>
        {sessionsQuery.isLoading ? (
          <Stack alignItems="center" sx={{ py: 3 }}>
            <CircularProgress size={20} />
          </Stack>
        ) : sessions.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
            <CalendarClock size={22} />
            <Typography variant="body2">No sessions scheduled yet. Set one up below.</Typography>
          </Stack>
        ) : (
          <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
            {sessions.map((s) => (
              <Stack key={s.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {s.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(s.startsAt).format("ddd D MMM, HH:mm")} · {s.durationMinutes} min
                    {s.location ? ` · ${s.location}` : ""}
                  </Typography>
                </Box>
                {s.canManage && (
                  <IconButton size="small" onClick={() => remove(s)} disabled={cancel.isPending} aria-label="Cancel session">
                    <Trash2 size={15} />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      <Divider />

      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
          Schedule a session
        </Typography>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="What are you working on?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
            placeholder="e.g. Past paper walkthrough"
          />
          <TextField
            label="When"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            error={when.length > 0 && !whenValid}
            helperText={when.length > 0 && !whenValid ? "Pick a time in the future." : undefined}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Minutes"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              size="small"
              sx={{ width: 120 }}
              slotProps={{ htmlInput: { min: 15, max: 600, step: 15 } }}
            />
            <TextField
              label="Where (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              size="small"
              fullWidth
              placeholder="Room or a link"
            />
          </Stack>
          <Button onClick={submit} variant="contained" color="secondary" disabled={!canSubmit} sx={{ alignSelf: "flex-start" }}>
            {schedule.isPending ? "Scheduling" : "Schedule session"}
          </Button>
        </Stack>
      </Box>
      {dialog}
    </Stack>
  );
}
