"use client";

import NextLink from "next/link";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { Users, Check, X, Pause, Play, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import {
  useTutorConnections,
  useUpdateTutorConnection,
  type TutorConnection,
} from "@/lib/api/queries";

export default function TutorConnectionsPage() {
  const connectionsQuery = useTutorConnections();

  return (
    <>
      <PageHeader
        title="My students"
        description="Students who have asked to work with you, and the ones you have taken on. The tutoring, scheduling and payment stay between you and them."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "My students" }]}
      />
      <QueryStates
        query={connectionsQuery}
        empty={{
          icon: <Users />,
          title: "No students yet",
          description:
            "When a student reaches out through your public profile, their request shows up here for you to accept.",
        }}
      >
        {(connections) => <ConnectionsView connections={connections} />}
      </QueryStates>
    </>
  );
}

function ConnectionsView({ connections }: { connections: TutorConnection[] }) {
  const pending = connections.filter((c) => c.status === "pending");
  const roster = connections.filter((c) => c.status === "active" || c.status === "paused");

  return (
    <Stack spacing={4}>
      {pending.length > 0 && (
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1, letterSpacing: "0.08em" }}>
            Requests waiting on you
          </Typography>
          <Stack spacing={1.5}>
            {pending.map((c) => (
              <RequestCard key={c.id} connection={c} />
            ))}
          </Stack>
        </Box>
      )}

      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1, letterSpacing: "0.08em" }}>
          Your students
        </Typography>
        {roster.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No active students yet. Accept a request above to start.
          </Typography>
        ) : (
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            {roster.map((c, i) => (
              <StudentRow key={c.id} connection={c} last={i === roster.length - 1} />
            ))}
          </Paper>
        )}
      </Box>
    </Stack>
  );
}

function RequestCard({ connection: c }: { connection: TutorConnection }) {
  const { enqueueSnackbar } = useSnackbar();
  const update = useUpdateTutorConnection();

  const act = (status: "active" | "declined", msg: string) =>
    update.mutate(
      { id: c.id, status },
      {
        onSuccess: () => enqueueSnackbar(msg, { variant: status === "active" ? "success" : "default" }),
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't update.", { variant: "error" }),
      },
    );

  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        borderRadius: 3,
        p: 2.5,
        border: `1px solid ${t.palette.divider}`,
        background: `linear-gradient(135deg, ${alpha(t.palette.secondary.main, 0.1)}, transparent 60%)`,
      })}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700 }}>{c.student}</Typography>
          <Typography variant="body2" color="text.secondary">
            Wants help with {c.subject || "their studies"} · asked <RelativeTime iso={c.connectedAt} />
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Check size={16} />}
            disabled={update.isPending}
            onClick={() => act("active", `You are now working with ${c.student}.`)}
          >
            Accept
          </Button>
          <Button
            variant="text"
            color="inherit"
            startIcon={<X size={16} />}
            disabled={update.isPending}
            onClick={() => act("declined", "Request declined.")}
          >
            Decline
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function StudentRow({ connection: c, last }: { connection: TutorConnection; last: boolean }) {
  const { enqueueSnackbar } = useSnackbar();
  const update = useUpdateTutorConnection();
  const paused = c.status === "paused";

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    update.mutate(
      { id: c.id, status: paused ? "active" : "paused" },
      {
        onSuccess: () =>
          enqueueSnackbar(paused ? `Resumed ${c.student}.` : `Paused ${c.student}.`, { variant: "success" }),
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't update.", { variant: "error" }),
      },
    );
  };

  return (
    <ButtonBase
      component={NextLink}
      href={`/tutor/students/${c.id}`}
      sx={(t) => ({
        display: "block",
        width: "100%",
        textAlign: "left",
        px: { xs: 2, sm: 2.5 },
        py: 2,
        borderBottom: last ? "none" : `1px solid ${t.palette.divider}`,
        transition: "background .2s ease",
        "&:hover": { background: alpha(t.palette.secondary.main, 0.06) },
        "&:focus-visible": { outline: `2px solid ${t.palette.secondary.main}`, outlineOffset: -2 },
      })}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar name={c.student} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontWeight: 700 }} noWrap>
              {c.student}
            </Typography>
            {paused && <Chip label="Paused" size="small" />}
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            {c.subject || "General"} · since <RelativeTime iso={c.connectedAt} />
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={paused ? <Play size={14} /> : <Pause size={14} />}
          onClick={toggle}
          disabled={update.isPending}
          sx={{ flexShrink: 0, display: { xs: "none", sm: "inline-flex" } }}
        >
          {paused ? "Resume" : "Pause"}
        </Button>
        <ChevronRight size={20} style={{ opacity: 0.5, flexShrink: 0 }} />
      </Stack>
    </ButtonBase>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  let hue = 0;
  for (let i = 0; i < name.length; i++) hue = (hue * 31 + name.charCodeAt(i)) % 360;
  return (
    <Box
      sx={(t) => ({
        flexShrink: 0,
        width: 42,
        height: 42,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontSize: "0.85rem",
        fontWeight: 800,
        color: t.palette.mode === "dark" ? "#F6F7F5" : "#1B1D22",
        bgcolor: `hsl(${hue} 40% ${t.palette.mode === "dark" ? 30 : 84}%)`,
      })}
    >
      {initials || "?"}
    </Box>
  );
}
