"use client";

import { use } from "react";
import { notFound } from "next/navigation";
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
import { PageHeader } from "@/components/common/PageHeader";
import { TUTORS } from "@/lib/mockData";
import { initials, formatCurrency } from "@/lib/format";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Dot } from "@/components/common/Dot";

export default function TutorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = TUTORS.find((x) => x.id === id);
  if (!t) notFound();

  return (
    <>
      <PageHeader
        title={t.name}
        description={`${t.subjects.join(" · ")} · ${t.city}`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tutors", href: "/dashboard/tutors" }, { label: t.name }]}
        actions={<Button variant="contained">Book session</Button>}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar sx={{ width: 96, height: 96, bgcolor: t.avatarColor, fontSize: "1.75rem", mx: "auto" }}>{initials(t.name)}</Avatar>
                {t.online && (
                  <Box sx={{ position: "absolute", bottom: 4, right: 4, p: 0.5, bgcolor: "background.paper", borderRadius: "50%" }}>
                    <Dot color="success" pulsing size={12} />
                  </Box>
                )}
              </Box>
              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {t.name}
                </Typography>
                {t.verified && <VerifiedIcon sx={{ color: "primary.main", fontSize: 22 }} />}
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 0.5 }}>
                <Rating value={t.rating} precision={0.1} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  {t.rating.toFixed(1)} ({t.reviewCount})
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ mt: 2, color: "primary.main", fontWeight: 700 }}>
                {formatCurrency(t.hourlyRate)}/hr
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="center" sx={{ mt: 2 }}>
                {t.subjects.map((s) => (
                  <Chip key={s} label={s} size="small" />
                ))}
              </Stack>
              <Stack spacing={1} sx={{ mt: 3 }}>
                <Button variant="contained" size="large" fullWidth>
                  Book session
                </Button>
                <Button variant="outlined" fullWidth>
                  Message
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                About
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.bio}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent reviews
              </Typography>
              <Stack spacing={2}>
                {[
                  "Patient and clear. My maths jumped 12% this term.",
                  "Knows past papers cold — explains what markers want.",
                  "Calm energy. I actually look forward to maths now.",
                ].map((r, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Rating value={5} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {i + 2} weeks ago
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      "{r}"
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
