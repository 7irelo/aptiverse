"use client";

import { use } from "react";
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
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { Dot } from "@/components/common/Dot";
import { useTutor } from "@/lib/api/queries";
import type { Tutor } from "@/lib/mockData";
import { initials, formatCurrency } from "@/lib/format";

export default function TutorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const query = useTutor(id);

  return (
    <>
      <PageHeader
        title={query.data?.name ?? "Tutor"}
        description={query.data ? `${query.data.subjects.join(" · ")} · ${query.data.city}` : undefined}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tutors", href: "/dashboard/tutors" },
          { label: query.data?.name ?? "Tutor" },
        ]}
        actions={<Button variant="contained">Book session</Button>}
      />

      <QueryStates
        query={query}
        isEmpty={() => false}
        empty={{
          icon: <PersonOutlineIcon />,
          title: "Tutor not found",
          description: "This tutor profile doesn't exist or is no longer available.",
          action: (
            <Button variant="outlined" href="/dashboard/tutors">
              Browse all tutors
            </Button>
          ),
        }}
      >
        {(tutor) => <TutorProfile tutor={tutor} />}
      </QueryStates>
    </>
  );
}

function TutorProfile({ tutor: t }: { tutor: Tutor }) {
  return (
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
      </Grid>
    </Grid>
  );
}
