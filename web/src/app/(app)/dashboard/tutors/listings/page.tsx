"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { alpha } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import {
  Plus,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  BadgeCheck,
  Video,
  MapPin,
  Users2,
  Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import { initials } from "@/lib/format";
import {
  useMyListings,
  useListingProposals,
  useCreateListing,
  useAcceptProposal,
  useCloseListing,
  type TutorListing,
  type ListingProposal,
  type ListingMode,
} from "@/lib/api/queries";
import { listingModeLabel, listingStatusMeta } from "@/lib/tutoring-labels";
import { heroGradient } from "@/app/(app)/dashboard/study-groups/shared";

export default function MyListingsPage() {
  const listingsQuery = useMyListings();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="My tutor requests"
        description="Post what you need help with, read the proposals tutors send, and accept the one that fits. The tutoring is arranged directly with them."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Find a tutor", href: "/dashboard/tutors" },
          { label: "My requests" },
        ]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Plus size={18} />}
            onClick={() => setCreateOpen(true)}
          >
            Post a request
          </Button>
        }
      />

      <QueryStates
        query={listingsQuery}
        empty={{
          icon: <Megaphone />,
          title: "You haven't posted a request yet",
          description:
            "Describe the help you are after: the subject, your level, and what you want to work on. Tutors will send proposals and you choose who to work with.",
          action: (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Plus size={18} />}
              onClick={() => setCreateOpen(true)}
            >
              Post your first request
            </Button>
          ),
        }}
      >
        {(listings) => (
          <Stack spacing={3}>
            <SummaryBand listings={listings} />
            <Stack spacing={1.5}>
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </Stack>
          </Stack>
        )}
      </QueryStates>

      <CreateListingDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

function SummaryBand({ listings }: { listings: TutorListing[] }) {
  const open = listings.filter((l) => l.status === "open").length;
  const proposals = listings.reduce((sum, l) => sum + l.proposals, 0);

  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        ...heroGradient(t),
        borderRadius: 3,
        p: { xs: 2.5, sm: 3 },
        overflow: "hidden",
      })}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 4 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            Your requests for help
          </Typography>
          <Typography variant="body2" sx={{ color: alpha("#F6F7F5", 0.82), maxWidth: 460 }}>
            Open a request to read new proposals, accept a tutor when one fits, and close it once
            you are sorted.
          </Typography>
        </Box>
        <Stack direction="row" spacing={3}>
          <Stat value={open} label={open === 1 ? "open request" : "open requests"} />
          <Stat value={proposals} label={proposals === 1 ? "proposal in" : "proposals in"} />
        </Stack>
      </Stack>
    </Paper>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
      <Typography sx={{ fontWeight: 800, fontSize: "1.9rem", lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: alpha("#F6F7F5", 0.7) }}>
        {label}
      </Typography>
    </Box>
  );
}

function ModeIcon({ mode }: { mode: ListingMode }) {
  if (mode === "online") return <Video size={14} />;
  if (mode === "in_person") return <MapPin size={14} />;
  return <Users2 size={14} />;
}

function ListingCard({ listing }: { listing: TutorListing }) {
  const { enqueueSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState(false);
  const close = useCloseListing();
  const statusMeta = listingStatusMeta(listing.status);
  const canClose = listing.status !== "closed";

  const doClose = () => {
    close.mutate(
      { listingId: listing.id },
      {
        onSuccess: () => enqueueSnackbar("Request closed.", { variant: "default" }),
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't close the request.", {
            variant: "error",
          }),
      },
    );
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ borderRadius: 3, overflow: "hidden" }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "flex-start" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 0.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{listing.title}</Typography>
              <Chip label={statusMeta.label} size="small" color={statusMeta.color} variant="outlined" />
            </Stack>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip label={listing.subject} size="small" color="secondary" variant="outlined" />
              {listing.level && <Chip label={listing.level} size="small" variant="outlined" />}
              <Chip
                icon={<ModeIcon mode={listing.mode} />}
                label={listingModeLabel(listing.mode)}
                size="small"
                variant="outlined"
              />
            </Stack>
            {listing.details && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
                {listing.details}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
              Posted <RelativeTime iso={listing.createdAt} />
            </Typography>
          </Box>

          <Stack spacing={1} sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}>
            <Button
              variant={expanded ? "contained" : "outlined"}
              color={expanded ? "secondary" : "inherit"}
              size="small"
              startIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              onClick={() => setExpanded((v) => !v)}
            >
              {listing.proposals} proposal{listing.proposals === 1 ? "" : "s"}
            </Button>
            {canClose && (
              <Button
                variant="text"
                color="inherit"
                size="small"
                startIcon={<X size={16} />}
                onClick={doClose}
                disabled={close.isPending}
              >
                Close
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Collapse in={expanded} mountOnEnter unmountOnExit>
        <Divider />
        <Box sx={(t) => ({ p: { xs: 2, sm: 2.5 }, bgcolor: alpha(t.palette.action.hover, 0.4) })}>
          <ProposalsPanel listing={listing} />
        </Box>
      </Collapse>
    </Paper>
  );
}

function ProposalsPanel({ listing }: { listing: TutorListing }) {
  const proposalsQuery = useListingProposals(listing.id, true);

  if (proposalsQuery.isLoading) {
    return (
      <Stack spacing={1.5}>
        <Skeleton variant="rounded" height={96} />
        <Skeleton variant="rounded" height={96} />
      </Stack>
    );
  }
  if (proposalsQuery.isError) {
    return (
      <Typography variant="body2" color="error">
        Couldn't load proposals. Close and reopen this request to try again.
      </Typography>
    );
  }
  const proposals = proposalsQuery.data ?? [];
  if (proposals.length === 0) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary", py: 1 }}>
        <Inbox size={18} />
        <Typography variant="body2">
          No proposals yet. Tutors will send them here as they see your request.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5}>
      {proposals.map((p) => (
        <ProposalRow key={p.id} proposal={p} listing={listing} />
      ))}
    </Stack>
  );
}

function ProposalRow({
  proposal: p,
  listing,
}: {
  proposal: ListingProposal;
  listing: TutorListing;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const accept = useAcceptProposal();
  const isAccepted = p.status === "accepted";
  // Once the listing is filled (or this bid was accepted), no more accepting.
  const canAccept = listing.status === "open" && p.status === "submitted";

  const doAccept = () => {
    accept.mutate(
      { proposalId: p.id, listingId: listing.id },
      {
        onSuccess: () =>
          enqueueSnackbar(`You accepted ${p.tutorName}.`, { variant: "success" }),
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't accept.", {
            variant: "error",
          }),
      },
    );
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={(t) => ({
        borderRadius: 2.5,
        p: 2,
        bgcolor: "background.paper",
        ...(isAccepted && {
          borderColor: alpha(t.palette.success.main, 0.6),
          background: `linear-gradient(135deg, ${alpha(t.palette.success.main, 0.1)}, transparent 60%)`,
        }),
      })}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-start" }}>
        <Avatar name={p.tutorName} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 0.5 }}>
            <Typography sx={{ fontWeight: 700 }}>{p.tutorName}</Typography>
            {p.tutorVerified && (
              <Chip
                icon={<BadgeCheck size={14} />}
                label="Verified"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
            {isAccepted && <Chip label="Accepted" size="small" color="success" />}
          </Stack>
          {p.tutorQualification && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              {p.tutorQualification}
            </Typography>
          )}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
            <Rating value={p.tutorRating} precision={0.1} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">
              {p.tutorReviews > 0
                ? `${p.tutorRating.toFixed(1)} (${p.tutorReviews})`
                : "No reviews yet"}
            </Typography>
          </Stack>
          <Box
            sx={(t) => ({
              mt: 1.25,
              pl: 1.5,
              borderLeft: `3px solid ${t.palette.divider}`,
              color: "text.secondary",
            })}
          >
            <Typography variant="body2">{p.message}</Typography>
          </Box>
        </Box>

        {canAccept && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Check size={16} />}
            onClick={doAccept}
            disabled={accept.isPending}
            sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}
          >
            Accept
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function Avatar({ name }: { name: string }) {
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
      {initials(name) || "?"}
    </Box>
  );
}

const MODES: { value: ListingMode; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In person" },
  { value: "either", label: "Either" },
];

function CreateListingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateListing();
  const { enqueueSnackbar } = useSnackbar();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [mode, setMode] = useState<ListingMode>("either");
  const [details, setDetails] = useState("");

  const reset = () => {
    setTitle("");
    setSubject("");
    setLevel("");
    setMode("either");
    setDetails("");
    create.reset();
  };

  const handleClose = () => {
    if (create.isPending) return;
    reset();
    onClose();
  };

  const valid = title.trim().length >= 3 && subject.trim().length >= 2;

  const submit = () => {
    if (!valid) return;
    create.mutate(
      {
        title: title.trim(),
        subject: subject.trim(),
        level: level.trim() || undefined,
        mode,
        details: details.trim() || undefined,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Request posted.", { variant: "success" });
          reset();
          onClose();
        },
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't post the request.", {
            variant: "error",
          }),
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Post a tutor request</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Title"
            placeholder="e.g. Help with Grade 11 trigonometry"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            autoFocus
            required
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Subject"
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Level (optional)"
              placeholder="e.g. Grade 11, first year"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              fullWidth
            />
          </Stack>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
              How you would like to meet
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mode}
              onChange={(_, v) => v && setMode(v as ListingMode)}
              fullWidth
            >
              {MODES.map((m) => (
                <ToggleButton key={m.value} value={m.value}>
                  {m.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <TextField
            label="Details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="What do you want to work on? When are you free? Any deadlines?"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={create.isPending}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          disabled={!valid || create.isPending}
        >
          {create.isPending ? "Posting" : "Post request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
