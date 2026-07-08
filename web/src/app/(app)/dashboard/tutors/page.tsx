"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { initials } from "@/lib/format";
import { useTutors } from "@/lib/api/queries";
import type { Tutor } from "@/lib/mockData";

type SortKey = "rating" | "experience" | "name";

export default function TutorsPage() {
  const query = useTutors();

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Find a tutor"
        description="Browse tutors, connect with the ones who fit, and arrange the tutoring directly. Aptiverse doesn't take a cut."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tutors" }]}
      />
      <QueryStates
        query={query}
        empty={{
          icon: <SchoolIcon />,
          title: "No tutors available yet",
          description:
            "No tutors are accepting new students right now. Check back soon, as new tutors join and open up their profiles.",
        }}
      >
        {(tutors) => <TutorsList tutors={tutors} />}
      </QueryStates>
    </AtmosphericBackdrop>
  );
}

function TutorsList({ tutors }: { tutors: Tutor[] }) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState<SortKey>("rating");

  const subjects = useMemo(() => {
    const set = new Set<string>();
    tutors.forEach((t) => t.subjects.forEach((s) => set.add(s)));
    return [...set].sort();
  }, [tutors]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = tutors.filter((t) => {
      const matchesSubject = subject === "all" || t.subjects.includes(subject);
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.qualification.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q));
      return matchesSubject && matchesSearch;
    });
    return filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "experience") return b.yearsOfExperience - a.yearsOfExperience;
      return b.rating - a.rating;
    });
  }, [tutors, search, subject, sort]);

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <TextField
          size="small"
          label="Search tutors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, subject or qualification"
          sx={{ flex: 1 }}
        />
        <TextField
          select
          size="small"
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All subjects</MenuItem>
          {subjects.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Sort by"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="rating">Top rated</MenuItem>
          <MenuItem value="experience">Most experienced</MenuItem>
          <MenuItem value="name">Name</MenuItem>
        </TextField>
      </Stack>

      {visible.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No tutors match your search.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {visible.map((t) => (
            <Grid key={t.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <TutorCard tutor={t} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

function TutorCard({ tutor: t }: { tutor: Tutor }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main", fontWeight: 700 }}>
            {initials(t.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                {t.name}
              </Typography>
              {t.verified && <VerifiedIcon sx={{ color: "primary.main", fontSize: 16 }} />}
            </Stack>
            {t.qualification && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                {t.qualification}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Rating value={t.rating} precision={0.1} readOnly size="small" />
          <Typography variant="caption" color="text.secondary">
            {t.reviewCount > 0 ? `${t.rating.toFixed(1)} (${t.reviewCount})` : "No reviews yet"}
          </Typography>
        </Stack>

        {t.subjects.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {t.subjects.slice(0, 4).map((s) => (
              <Chip key={s} label={s} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        {t.bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {t.bio}
          </Typography>
        )}

        <Button
          component={Link}
          href={`/dashboard/tutors/${t.id}`}
          variant="outlined"
          size="small"
          sx={{ mt: "auto", alignSelf: "flex-start" }}
        >
          View profile
        </Button>
      </CardContent>
    </Card>
  );
}
