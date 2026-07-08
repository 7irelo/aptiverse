"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import Diversity3Icon from "@mui/icons-material/Diversity3Outlined";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  useMyParentLinks,
  useInviteStudent,
  useRemoveParentLink,
  type ParentLink,
} from "@/lib/api/queries";
import { initials } from "@/lib/format";

export default function ParentStudentsPage() {
  const linksQuery = useMyParentLinks();
  const [inviteOpen, setInviteOpen] = useState(false);

  const links = linksQuery.data ?? [];
  const accepted = links.filter((l) => l.status === "accepted");
  const pending = links.filter((l) => l.status === "pending");

  return (
    <>
      <PageHeader
        title="Students"
        description="Link to your child's account by invite, then follow their progress. You can see how they're doing, not change it."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Students" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteOpen(true)}
          >
            Invite student
          </Button>
        }
      />

      {linksQuery.isLoading ? (
        <Grid container spacing={3}>
          {[0, 1].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={150} />
            </Grid>
          ))}
        </Grid>
      ) : links.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center", maxWidth: 460, mx: "auto" }}>
          <Diversity3Icon sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            No students linked yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, mt: 0.5 }}>
            Invite your child by their Aptiverse email. Once they accept from their Connections page,
            you&apos;ll see their progress here.
          </Typography>
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setInviteOpen(true)}>
            Invite your first student
          </Button>
        </Box>
      ) : (
        <Stack spacing={4}>
          {pending.length > 0 && (
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                Pending invites
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {pending.map((l) => (
                  <PendingRow key={l.id} link={l} />
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            {pending.length > 0 && (
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                Linked students
              </Typography>
            )}
            {accepted.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No accepted links yet. Your pending invites appear above until the student accepts.
              </Typography>
            ) : (
              <Grid container spacing={3} sx={{ mt: pending.length > 0 ? 0 : 0 }}>
                {accepted.map((l) => (
                  <Grid key={l.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <LinkedStudentCard link={l} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Stack>
      )}

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} existing={links} />
    </>
  );
}

function PendingRow({ link }: { link: ParentLink }) {
  const { enqueueSnackbar } = useSnackbar();
  const remove = useRemoveParentLink();
  const { confirm, dialog } = useConfirm();

  const cancel = async () => {
    const ok = await confirm({
      title: "Cancel this invite?",
      description: `The invite to ${link.studentEmail} will be withdrawn.`,
      confirmLabel: "Cancel invite",
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(link.id);
      enqueueSnackbar("Invite cancelled.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Couldn't cancel${err instanceof Error ? `: ${err.message}` : ""}`, {
        variant: "error",
      });
    }
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent
          sx={{ py: 1.5, "&:last-child": { pb: 1.5 }, display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {link.studentEmail}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Waiting for them to accept
            </Typography>
          </Box>
          <Chip label="Pending" size="small" color="warning" variant="outlined" />
          <IconButton size="small" onClick={cancel} disabled={remove.isPending} aria-label="Cancel invite">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </CardContent>
      </Card>
      {dialog}
    </>
  );
}

function LinkedStudentCard({ link }: { link: ParentLink }) {
  const { enqueueSnackbar } = useSnackbar();
  const remove = useRemoveParentLink();
  const { confirm, dialog } = useConfirm();
  const name = link.studentName ?? link.studentEmail;

  const unlink = async () => {
    const ok = await confirm({
      title: `Unlink ${name}?`,
      description: "You'll stop seeing their progress. You can invite them again later.",
      confirmLabel: "Unlink",
    });
    if (!ok) return;
    try {
      await remove.mutateAsync(link.id);
      enqueueSnackbar(`Unlinked ${name}.`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Couldn't unlink${err instanceof Error ? `: ${err.message}` : ""}`, {
        variant: "error",
      });
    }
  };

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 44, height: 44, bgcolor: "primary.main", fontWeight: 700 }}>
              {initials(name)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                {link.studentEmail}
              </Typography>
            </Box>
            <IconButton size="small" onClick={unlink} disabled={remove.isPending} aria-label="Unlink student">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Button
            component={Link}
            href={`/parent/students/${link.studentUserId}`}
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: "auto", alignSelf: "flex-start", pt: 0 }}
          >
            View progress
          </Button>
        </CardContent>
      </Card>
      {dialog}
    </>
  );
}

function InviteDialog({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing: ParentLink[];
}) {
  const invite = useInviteStudent();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState("");

  const trimmed = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const duplicate = existing.some((l) => l.studentEmail.toLowerCase() === trimmed);

  const reset = () => {
    setEmail("");
    invite.reset();
  };
  const handleClose = () => {
    if (invite.isPending) return;
    reset();
    onClose();
  };
  const submit = () => {
    if (!valid || duplicate) return;
    invite.mutate(
      { studentEmail: trimmed },
      {
        onSuccess: () => {
          enqueueSnackbar(`Invite sent to ${trimmed}.`, { variant: "success" });
          reset();
          onClose();
        },
        onError: (err) =>
          enqueueSnackbar(
            err instanceof Error ? err.message : "Couldn't send the invite.",
            { variant: "error" },
          ),
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>Invite a student</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the email on your child&apos;s Aptiverse account. They&apos;ll get an invite to accept
          from their Connections page. Nothing is shared until they accept.
        </Typography>
        <TextField
          label="Student email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          autoFocus
          error={email.length > 0 && !valid}
          helperText={
            duplicate
              ? "You already have an invite or link for that email."
              : email.length > 0 && !valid
                ? "Enter a valid email address."
                : undefined
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={invite.isPending}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          disabled={!valid || duplicate || invite.isPending}
        >
          {invite.isPending ? "Sending…" : "Send invite"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
