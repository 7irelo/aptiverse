"use client";

import { useEffect, useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import {
  Search,
  Coins,
  Send,
  CheckCheck,
  User,
  Video,
  MapPin,
  Users2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import {
  useOpenListings,
  useConnects,
  useProposeOnListing,
  type TutorListing,
  type ConnectsBalance,
} from "@/lib/api/queries";
import { listingModeLabel } from "@/lib/tutoring-labels";
import { heroGradient, riseSx } from "@/app/(app)/dashboard/study-groups/shared";

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const connectsQuery = useConnects();

  // Debounce the search into the query key so a tutor can type without firing a
  // request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const listingsQuery = useOpenListings(q || undefined);
  const connects = connectsQuery.data;

  return (
    <>
      <PageHeader
        title="Opportunities"
        description="Students and parents post the help they need. Spend connects to send a proposal, and the poster picks who they want to work with."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Opportunities" }]}
      />

      <Stack spacing={3}>
        <ConnectsBand connects={connects} />

        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject, level or keyword"
          fullWidth
          size="medium"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            },
          }}
        />

        <QueryStates
          query={listingsQuery}
          empty={{
            icon: <Users2 />,
            title: q ? "No matching listings" : "No open listings right now",
            description: q
              ? "Nothing matches that search yet. Try a broader term, or clear the search to see everything that is open."
              : "When a student or parent posts a request for help, it shows up here for you to propose on.",
          }}
        >
          {(listings) => (
            <ListingList listings={listings} connects={connects} />
          )}
        </QueryStates>
      </Stack>
    </>
  );
}

function ConnectsBand({ connects }: { connects: ConnectsBalance | undefined }) {
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
        spacing={{ xs: 1.5, sm: 3 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box
          sx={(t) => ({
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            bgcolor: alpha(t.palette.secondary.main, 0.9),
            color: t.palette.secondary.contrastText,
          })}
        >
          <Coins size={24} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {connects ? `${connects.balance} connects` : "Loading connects"}
          </Typography>
          <Typography variant="body2" sx={{ color: alpha("#F6F7F5", 0.82), mt: 0.5 }}>
            {connects
              ? `Each proposal costs ${connects.proposalCost} connect${connects.proposalCost === 1 ? "" : "s"}. You are topped up to ${connects.monthlyGrant} every month.`
              : "Fetching your monthly allowance."}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function ListingList({
  listings,
  connects,
}: {
  listings: TutorListing[];
  connects: ConnectsBalance | undefined;
}) {
  const [proposeFor, setProposeFor] = useState<TutorListing | null>(null);
  const canAfford =
    !connects || connects.balance >= connects.proposalCost;

  return (
    <>
      <Stack spacing={1.5}>
        {listings.map((listing, i) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            canAfford={canAfford}
            onPropose={() => setProposeFor(listing)}
            index={i}
          />
        ))}
      </Stack>

      <ProposeDialog
        listing={proposeFor}
        onClose={() => setProposeFor(null)}
      />
    </>
  );
}

function ModeIcon({ mode }: { mode: TutorListing["mode"] }) {
  if (mode === "online") return <Video size={14} />;
  if (mode === "in_person") return <MapPin size={14} />;
  return <Users2 size={14} />;
}

function ListingCard({
  listing,
  canAfford,
  onPropose,
  index,
}: {
  listing: TutorListing;
  canAfford: boolean;
  onPropose: () => void;
  index: number;
}) {
  const disabled = listing.alreadyProposed || !canAfford;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={(t) => ({
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        transition: "border-color .2s ease, background .2s ease",
        "&:hover": {
          borderColor: alpha(t.palette.secondary.main, 0.5),
          background: `linear-gradient(90deg, ${alpha(t.palette.secondary.main, 0.05)}, transparent 70%)`,
        },
        ...riseSx(index),
      })}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ md: "flex-start" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
            {listing.title}
          </Typography>
          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1 }}
          >
            <Chip label={listing.subject} size="small" color="secondary" variant="outlined" />
            {listing.level && (
              <Chip label={listing.level} size="small" variant="outlined" />
            )}
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
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mt: 1.5, color: "text.secondary" }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <User size={14} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {listing.learnerName}
              </Typography>
            </Stack>
            <Typography variant="caption">
              {listing.proposals} proposal{listing.proposals === 1 ? "" : "s"}
            </Typography>
            <Typography variant="caption">
              Posted <RelativeTime iso={listing.createdAt} />
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ flexShrink: 0, width: { xs: "100%", md: "auto" } }}>
          {listing.alreadyProposed ? (
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCheck size={16} />}
              disabled
              fullWidth
            >
              Proposed
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Send size={16} />}
              onClick={onPropose}
              disabled={disabled}
              fullWidth
            >
              {canAfford ? "Submit proposal" : "Not enough connects"}
            </Button>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

function ProposeDialog({
  listing,
  onClose,
}: {
  listing: TutorListing | null;
  onClose: () => void;
}) {
  const propose = useProposeOnListing();
  const { enqueueSnackbar } = useSnackbar();
  const [message, setMessage] = useState("");

  // Reset the draft and any prior error whenever the target listing changes.
  useEffect(() => {
    setMessage("");
    propose.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id]);

  const tooShort = message.trim().length < 10;
  const errorMessage = propose.error instanceof Error ? propose.error.message : null;

  const submit = () => {
    if (!listing || tooShort) return;
    propose.mutate(
      { listingId: listing.id, message: message.trim() },
      {
        onSuccess: () => {
          enqueueSnackbar("Proposal sent.", { variant: "success" });
          onClose();
        },
        onError: (err) =>
          enqueueSnackbar(
            err instanceof Error ? err.message : "Couldn't send your proposal.",
            { variant: "error" },
          ),
      },
    );
  };

  const remaining = 10 - message.trim().length;

  return (
    <Dialog
      open={!!listing}
      onClose={() => !propose.isPending && onClose()}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Propose on {listing?.title}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Tell {listing?.learnerName} how you can help, your relevant experience,
            and how you would run the sessions. This is what they read before
            choosing.
          </Typography>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and how you would approach this."
            multiline
            rows={4}
            fullWidth
            autoFocus
            error={message.length > 0 && tooShort}
            helperText={
              tooShort
                ? `At least ${remaining} more character${remaining === 1 ? "" : "s"}.`
                : "Looks good."
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={propose.isPending}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          startIcon={<Send size={16} />}
          disabled={tooShort || propose.isPending}
        >
          {propose.isPending ? "Sending" : "Send proposal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
