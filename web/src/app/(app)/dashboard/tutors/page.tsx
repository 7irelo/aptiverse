"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import PeopleIcon from "@mui/icons-material/PeopleOutline";
import { PageHeader } from "@/components/common/PageHeader";
import { Dot } from "@/components/common/Dot";
import { QueryStates } from "@/components/common/QueryStates";
import { useTutors } from "@/lib/api/queries";
import type { Tutor } from "@/lib/mockData";
import { initials, formatCurrency } from "@/lib/format";
import Link from "next/link";

export default function TutorsPage() {
  const query = useTutors();

  return (
    <>
      <PageHeader
        title="Tutors"
        description="Verified, rated tutors. Match by subject, level and budget."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tutors" }]}
        actions={<Button variant="contained">My bookings</Button>}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <PeopleIcon />,
          title: "No tutors yet",
          description: "We're verifying tutors in your area. Check back soon, or browse courses in the meantime.",
          action: (
            <Button variant="outlined" component={Link} href="/dashboard/courses">
              Browse courses
            </Button>
          ),
        }}
      >
        {(tutors) => (
          <Grid container spacing={3}>
            {tutors.map((t) => (
              <Grid key={t.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <TutorCard tutor={t} />
              </Grid>
            ))}
          </Grid>
        )}
      </QueryStates>
    </>
  );
}

function TutorCard({ tutor: t }: { tutor: Tutor }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: t.avatarColor, fontWeight: 700 }}>
              {initials(t.name)}
            </Avatar>
            {t.online && (
              <Box sx={{ position: "absolute", bottom: 2, right: 2, p: 0.4, bgcolor: "background.paper", borderRadius: "50%" }}>
                <Dot color="success" pulsing size={9} />
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                {t.name}
              </Typography>
              {t.verified && <VerifiedIcon sx={{ color: "primary.main", fontSize: 18 }} />}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {t.city}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Rating value={t.rating} precision={0.1} readOnly size="small" emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />} />
              <Typography variant="caption" color="text.secondary">
                {t.rating.toFixed(1)} ({t.reviewCount})
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
          {t.bio}
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {t.subjects.map((s) => (
            <Chip key={s} label={s} size="small" variant="outlined" />
          ))}
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary">
              From
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
              {formatCurrency(t.hourlyRate)}/hr
            </Typography>
          </Box>
          <Button component={Link} href={`/dashboard/tutors/${t.id}`} variant="contained">
            Book session
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
