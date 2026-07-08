"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import ForumIcon from "@mui/icons-material/ForumOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { RelativeTime } from "@/components/common/RelativeTime";
import { initials } from "@/lib/format";
import {
  useIncomingParentInvites,
  useLinkedParents,
  useRespondToParentInvite,
  useUnlinkParent,
  useTutorConnections,
  useStudyGroups,
  type IncomingParentInvite,
  type LinkedParent,
} from "@/lib/api/queries";

export default function ConnectionsPage() {
  const incomingQuery = useIncomingParentInvites();
  const parentsQuery = useLinkedParents();
  const tutorConnections = useTutorConnections();
  const studyGroups = useStudyGroups();

  const incoming = incomingQuery.data ?? [];
  const parents = parentsQuery.data ?? [];

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Connections"
        description="Everyone connected to your learning: parents who follow your progress, tutors, and study groups."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Connections" }]}
      />

      <Stack spacing={4}>
        <Box>
          <SectionHeading eyebrow="People" title="Parents" />
          {incomingQuery.isLoading || parentsQuery.isLoading ? (
            <Skeleton variant="rounded" height={90} />
          ) : incoming.length === 0 && parents.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No parent linked. A parent can connect by inviting your email, then you accept it
                  here. They get a read-only view of your progress, and you can unlink any time.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {incoming.map((inv) => (
                <IncomingInviteCard key={inv.id} invite={inv} />
              ))}
              {parents.map((p) => (
                <LinkedParentRow key={p.id} parent={p} />
              ))}
            </Stack>
          )}
        </Box>

        <Box>
          <SectionHeading eyebrow="More ways to connect" title="Tutors and study groups" />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <OptionCard
                icon={<GroupsIcon />}
                title="Tutors"
                count={tutorConnections.data?.length ?? 0}
                countNoun="connection"
                blurb="Find a tutor who fits, connect, and arrange sessions directly."
                href="/dashboard/tutors"
                cta="Find a tutor"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <OptionCard
                icon={<ForumIcon />}
                title="Study groups"
                count={(studyGroups.data ?? []).filter((g) => g.isMember).length}
                countNoun="group"
                blurb="Join or start a group to revise together and keep each other on track."
                href="/dashboard/study-groups"
                cta="Browse groups"
              />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </AtmosphericBackdrop>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
        {eyebrow}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {title}
      </Typography>
    </Box>
  );
}

function IncomingInviteCard({ invite }: { invite: IncomingParentInvite }) {
  const { enqueueSnackbar } = useSnackbar();
  const respond = useRespondToParentInvite();

  const act = (accept: boolean) =>
    respond.mutate(
      { token: invite.token, accept },
      {
        onSuccess: () =>
          enqueueSnackbar(
            accept ? `You're now linked with ${invite.parentName}.` : "Invite declined.",
            { variant: accept ? "success" : "info" },
          ),
        onError: (err) =>
          enqueueSnackbar(
            err instanceof Error ? err.message : "Couldn't respond to the invite.",
            { variant: "error" },
          ),
      },
    );

  return (
    <Card sx={{ borderColor: "secondary.main", borderWidth: 1, borderStyle: "solid" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Avatar sx={{ bgcolor: "brandSurface.main", color: "brandSurface.contrastText", fontWeight: 700 }}>
            {initials(invite.parentName)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {invite.parentName} wants to connect
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Invited <RelativeTime iso={invite.invitedAt} />. They&apos;ll see your progress read-only.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              disabled={respond.isPending}
              onClick={() => act(true)}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={respond.isPending}
              onClick={() => act(false)}
            >
              Decline
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function LinkedParentRow({ parent }: { parent: LinkedParent }) {
  const { enqueueSnackbar } = useSnackbar();
  const unlink = useUnlinkParent();
  const { confirm, dialog } = useConfirm();

  const remove = async () => {
    const ok = await confirm({
      title: `Unlink ${parent.parentName}?`,
      description: "They'll stop seeing your progress. They can invite you again later.",
      confirmLabel: "Unlink",
    });
    if (!ok) return;
    try {
      await unlink.mutateAsync(parent.id);
      enqueueSnackbar(`Unlinked ${parent.parentName}.`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Couldn't unlink${err instanceof Error ? `: ${err.message}` : ""}`, {
        variant: "error",
      });
    }
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700 }}>{initials(parent.parentName)}</Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
                {parent.parentName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Linked <RelativeTime iso={parent.since} />
              </Typography>
            </Box>
            <Button variant="text" size="small" color="inherit" disabled={unlink.isPending} onClick={remove}>
              Unlink
            </Button>
          </Stack>
        </CardContent>
      </Card>
      {dialog}
    </>
  );
}

function OptionCard({
  icon,
  title,
  count,
  countNoun,
  blurb,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  countNoun: string;
  blurb: string;
  href: string;
  cta: string;
}) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: "brandSurface.main",
              color: "brandSurface.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {count} {count === 1 ? countNoun : `${countNoun}s`}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {blurb}
        </Typography>
        <Divider sx={{ mt: "auto" }} />
        <Button
          component={Link}
          href={href}
          variant="text"
          endIcon={<ArrowForwardIcon />}
          sx={{ alignSelf: "flex-start", mt: 1.5 }}
        >
          {cta}
        </Button>
      </CardContent>
    </Card>
  );
}
