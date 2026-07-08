"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import ReviewsIcon from "@mui/icons-material/ReviewsOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import { initials } from "@/lib/format";
import { useTutorReviews, type TutorReview } from "@/lib/api/queries";

export default function TutorReviewsPage() {
  const reviewsQuery = useTutorReviews();

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Honest feedback from your students. It compounds into reputation."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Reviews" }]}
      />
      <QueryStates
        query={reviewsQuery}
        empty={{
          icon: <ReviewsIcon />,
          title: "No reviews yet",
          description:
            "Once you've worked with a student, they can leave a review here. Reviews build the reputation that brings the next student.",
        }}
      >
        {(reviews) => (
          <Grid container spacing={3}>
            {reviews.map((r) => (
              <Grid key={r.id} size={{ xs: 12, sm: 6 }}>
                <ReviewCard review={r} />
              </Grid>
            ))}
          </Grid>
        )}
      </QueryStates>
    </>
  );
}

function ReviewCard({ review }: { review: TutorReview }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.8rem" }}>
            {initials(review.student)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {review.student}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <RelativeTime iso={review.when} />
              </Typography>
            </Stack>
            <Rating value={review.rating} readOnly size="small" />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {review.body}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
