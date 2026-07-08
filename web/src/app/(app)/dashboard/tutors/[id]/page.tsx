"use client";

import { use, useState } from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import { initials } from "@/lib/format";
import {
  useTutor,
  useTutorReviewsById,
  useConnectWithTutor,
  useCreateTutorReview,
  type TutorReview,
} from "@/lib/api/queries";
import type { Tutor } from "@/lib/mockData";

export default function TutorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const query = useTutor(id);

  return (
    <>
      <PageHeader
        title={query.data?.name ?? "Tutor"}
        description={query.data?.subjects.length ? query.data.subjects.join(" · ") : undefined}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tutors", href: "/dashboard/tutors" },
          { label: query.data?.name ?? "Tutor" },
        ]}
      />

      <QueryStates
        query={query}
        isEmpty={() => false}
        empty={{
          icon: <PersonOutlineIcon />,
          title: "Tutor not found",
          description: "This tutor profile doesn't exist or is no longer available.",
          action: (
            <Button variant="outlined" component={Link} href="/dashboard/tutors">
              Browse all tutors
            </Button>
          ),
        }}
      >
        {(tutor) => <TutorProfile tutor={tutor} tutorId={id} />}
      </QueryStates>
    </>
  );
}

function TutorProfile({ tutor: t, tutorId }: { tutor: Tutor; tutorId: string }) {
  const [connectOpen, setConnectOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const reviewsQuery = useTutorReviewsById(tutorId);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <Avatar sx={{ width: 96, height: 96, bgcolor: "primary.main", fontSize: "1.75rem", mx: "auto" }}>
              {initials(t.name)}
            </Avatar>
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {t.name}
              </Typography>
              {t.verified && <VerifiedIcon sx={{ color: "primary.main", fontSize: 22 }} />}
            </Stack>
            {t.qualification && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t.qualification}
              </Typography>
            )}
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
              <Rating value={t.rating} precision={0.1} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                {t.reviewCount > 0 ? `${t.rating.toFixed(1)} (${t.reviewCount})` : "No reviews yet"}
              </Typography>
            </Stack>
            {t.subjects.length > 0 && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="center" sx={{ mt: 2 }}>
                {t.subjects.map((s) => (
                  <Chip key={s} label={s} size="small" />
                ))}
              </Stack>
            )}
            <Stack spacing={1} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                startIcon={<PersonAddIcon />}
                onClick={() => setConnectOpen(true)}
              >
                Connect
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<RateReviewIcon />}
                onClick={() => setReviewOpen(true)}
              >
                Leave a review
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
              Connecting shares your name so the tutor can reach out. You arrange the tutoring directly.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              About
            </Typography>
            {t.bio ? (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {t.bio}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This tutor hasn't written a bio yet.
              </Typography>
            )}
            <Stack spacing={1.5} divider={<Divider flexItem />}>
              {t.specialization && <DetailRow label="Focus" value={t.specialization} />}
              <DetailRow
                label="Experience"
                value={t.yearsOfExperience > 0 ? `${t.yearsOfExperience} years` : "Not specified"}
              />
              {t.teachingStyle && <DetailRow label="Teaching style" value={t.teachingStyle} />}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reviews
            </Typography>
            {reviewsQuery.data && reviewsQuery.data.length > 0 ? (
              <Stack spacing={2.5} divider={<Divider flexItem />}>
                {reviewsQuery.data.map((r) => (
                  <ReviewItem key={r.id} review={r} />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No reviews yet. If you've worked with {t.name.split(" ")[0]}, you could be the first.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <ConnectDialog
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        tutor={t}
        tutorId={tutorId}
      />
      <ReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        tutor={t}
        tutorId={tutorId}
      />
    </Grid>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function ReviewItem({ review }: { review: TutorReview }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {review.student}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <RelativeTime iso={review.when} />
        </Typography>
      </Stack>
      <Rating value={review.rating} readOnly size="small" />
      {review.body && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {review.body}
        </Typography>
      )}
    </Box>
  );
}

function ConnectDialog({
  open,
  onClose,
  tutor,
  tutorId,
}: {
  open: boolean;
  onClose: () => void;
  tutor: Tutor;
  tutorId: string;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const connect = useConnectWithTutor();
  const [subject, setSubject] = useState("");

  const submit = async () => {
    try {
      await connect.mutateAsync({ tutorUserId: tutorId, subject: subject || undefined });
      enqueueSnackbar(
        `You're connected with ${tutor.name}. They can now reach out to arrange your sessions.`,
        { variant: "success" },
      );
      onClose();
      setSubject("");
    } catch (err) {
      enqueueSnackbar(
        `Couldn't connect${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  return (
    <Dialog open={open} onClose={connect.isPending ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Connect with {tutor.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          We'll share your name so they can reach out. Any tutoring and payment is arranged directly
          between you.
        </Typography>
        <TextField
          select
          fullWidth
          label="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <MenuItem value="">Not sure yet</MenuItem>
          {tutor.subjects.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={connect.isPending}>
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={connect.isPending}>
          {connect.isPending ? "Connecting…" : "Connect"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ReviewDialog({
  open,
  onClose,
  tutor,
  tutorId,
}: {
  open: boolean;
  onClose: () => void;
  tutor: Tutor;
  tutorId: string;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const createReview = useCreateTutorReview();
  const [rating, setRating] = useState<number | null>(5);
  const [body, setBody] = useState("");

  const close = () => {
    if (createReview.isPending) return;
    onClose();
  };

  const submit = async () => {
    if (!rating) {
      enqueueSnackbar("Pick a star rating.", { variant: "warning" });
      return;
    }
    try {
      await createReview.mutateAsync({ tutorUserId: tutorId, rating, body: body.trim() || undefined });
      enqueueSnackbar("Thanks, your review is posted.", { variant: "success" });
      onClose();
      setRating(5);
      setBody("");
    } catch (err) {
      enqueueSnackbar(
        `Couldn't post your review${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>Review {tutor.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Your rating
            </Typography>
            <Rating value={rating} onChange={(_, v) => setRating(v)} size="large" />
          </Box>
          <TextField
            label="Your review (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            placeholder="What was helpful? Be specific and fair."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} disabled={createReview.isPending}>
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={createReview.isPending}>
          {createReview.isPending ? "Posting…" : "Post review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
