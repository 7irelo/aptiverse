"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import { PageHeader } from "@/components/common/PageHeader";
import { initials, formatRelative } from "@/lib/format";
import { RelativeTime } from "@/components/common/RelativeTime";
import dayjs from "dayjs";

const REVIEWS = [
  { id: "r1", student: "Thabo M.", rating: 5, body: "Sipho explained chain rule in 10 minutes. I'd been stuck on it for weeks.", when: dayjs().subtract(2, "day").toISOString() },
  { id: "r2", student: "Naledi K.", rating: 5, body: "Patient. Knows the past papers cold. My maths jumped 12% this term.", when: dayjs().subtract(6, "day").toISOString() },
  { id: "r3", student: "Aisha M.", rating: 4, body: "Great with concepts. Could give more practice problems though.", when: dayjs().subtract(2, "week").toISOString() },
  { id: "r4", student: "Lerato P.", rating: 5, body: "Calm energy. I actually look forward to maths now.", when: dayjs().subtract(3, "week").toISOString() },
];

export default function TutorReviewsPage() {
  return (
    <>
      <PageHeader
        title="Reviews"
        description="Honest feedback that compounds your reputation."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Reviews" }]}
      />
      <Grid container spacing={3}>
        {REVIEWS.map((r) => (
          <Grid key={r.id} size={{ xs: 12, sm: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.8rem" }}>{initials(r.student)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {r.student}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <RelativeTime iso={r.when} />
                      </Typography>
                    </Stack>
                    <Rating value={r.rating} readOnly size="small" />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      "{r.body}"
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
