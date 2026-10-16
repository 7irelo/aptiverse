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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownwardOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  useMyParentLinks,
  useInviteStudent,
  useRemoveParentLink,
  useChildren,
  useSetChildPlan,
  type ParentLink,
} from "@/lib/api/queries";
import type { Child } from "@/lib/mockData";
import { initials } from "@/lib/format";

export default function ParentStudentsPage() {
  const linksQuery = useMyParentLinks();
  const childrenQuery = useChildren();
  const [inviteOpen, setInviteOpen] = useState(false);

  const links = linksQuery.data ?? [];
  const accepted = links.filter((l) => l.status === "accepted");
  const pending = links.filter((l) => l.status === "pending");

  // Coverage, keyed by studentUserId, so each linked-student card can show and
  // change the plan the parent covers that child on.
  const childByUserId = new Map((childrenQuery.data ?? []).map((c) => [c.studentUserId, c]));
  const coveredCount = (childrenQuery.data ?? []).filter((c) => c.covered).length;

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
            Invite your child by email. If they don&apos;t have an account yet, they&apos;ll get an
            email to join, and connect once they sign up. When they accept, they move onto your plan
            and you&apos;ll see their progress here.
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
            {(pending.length > 0 || accepted.length > 0) && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="baseline"
                justifyContent="space-between"
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                  Linked students
                </Typography>
                {accepted.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {coveredCount} of {accepted.length} students covered
                  </Typography>
                )}
              </Stack>
            )}
            {accepted.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No accepted links yet. Your pending invites appear above until the student accepts.
              </Typography>
            ) : (
              <Grid container spacing={3} sx={{ mt: 0.5 }}>
                {accepted.map((l) => (
                  <Grid key={l.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <LinkedStudentCard
                      link={l}
                      child={l.studentUserId ? childByUserId.get(l.studentUserId) : undefined}
                    />
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

function LinkedStudentCard({ link, child }: { link: ParentLink; child?: Child }) {
  const { enqueueSnackbar } = useSnackbar();
  const remove = useRemoveParentLink();
  const setPlan = useSetChildPlan();
  const { confirm, dialog } = useConfirm();
  const name = link.studentName ?? link.studentEmail;

  const plan = child?.planCode ?? "none";
  const isMax = plan === "student.max";
  const isPro = plan === "student.pro";

  const changePlan = (planCode: "student.pro" | "student.max", label: string) => {
    if (!link.studentUserId) return;
    setPlan.mutate(
      { studentUserId: link.studentUserId, planCode },
      {
        onSuccess: () => enqueueSnackbar(`${name} is now on ${label}.`, { variant: "success" }),
        onError: (err) =>
          enqueueSnackbar(
            err instanceof Error ? err.message : "Couldn't change the plan.",
            { variant: "error" },
          ),
      },
    );
  };

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

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
            <WorkspacePremiumIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <Chip
              label={isMax ? "Max" : isPro ? "Pro" : "Not covered"}
              size="small"
              color={isMax ? "secondary" : isPro ? "primary" : "default"}
              variant={plan === "none" ? "outlined" : "filled"}
            />
            {setPlan.isPending && <CircularProgress size={16} />}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {isMax ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<ArrowDownwardIcon />}
                disabled={setPlan.isPending}
                onClick={() => changePlan("student.pro", "Student Pro")}
              >
                Switch to Pro
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<ArrowUpwardIcon />}
                disabled={setPlan.isPending}
                onClick={() => changePlan("student.max", "Student Max")}
              >
                {isPro ? "Upgrade to Max" : "Cover with Max"}
              </Button>
            )}
            {plan === "none" && (
              <Button
                size="small"
                variant="text"
                disabled={setPlan.isPending}
                onClick={() => changePlan("student.pro", "Student Pro")}
              >
                Cover with Pro
              </Button>
            )}
          </Stack>

          <Button
            component={Link}
            href={`/parent/students/${link.studentUserId}`}
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 2, alignSelf: "flex-start" }}
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
          Enter your child&apos;s email. If they already have an Aptiverse account, they&apos;ll get an
          invite to accept from their Connections page. If they don&apos;t have an account yet,
          they&apos;ll get an email to join, and connect once they sign up. Nothing is shared, and no
          plan changes, until they accept.
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
