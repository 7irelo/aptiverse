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
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import Diversity3Icon from "@mui/icons-material/Diversity3Outlined";
import { PageHeader } from "@/components/common/PageHeader";
import { useMyParentLinks, type ParentLink } from "@/lib/api/queries";
import { initials } from "@/lib/format";

export default function ParentDashboard() {
  const linksQuery = useMyParentLinks();
  const links = linksQuery.data ?? [];
  const accepted = links.filter((l) => l.status === "accepted");
  const pending = links.filter((l) => l.status === "pending");

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Follow how your students are doing, without surveillance. Link an account by invite, then see their progress read-only."
        breadcrumbs={[{ label: "Home" }]}
        actions={
          <Button
            component={Link}
            href="/parent/students"
            variant="contained"
            color="secondary"
            startIcon={<PersonAddIcon />}
          >
            Invite student
          </Button>
        }
      />

      {linksQuery.isLoading ? (
        <Grid container spacing={2.5}>
          {[0, 1].map((i) => (
            <Grid key={i} size={{ xs: 6, md: 3 }}>
              <Skeleton variant="rounded" height={96} />
            </Grid>
          ))}
        </Grid>
      ) : links.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center", maxWidth: 460, mx: "auto" }}>
          <Diversity3Icon sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            No students linked yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, mt: 0.5 }}>
            Invite your child by their Aptiverse email. Once they accept, their progress shows up here.
          </Typography>
          <Button
            component={Link}
            href="/parent/students"
            variant="contained"
            startIcon={<PersonAddIcon />}
          >
            Invite your first student
          </Button>
        </Box>
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatTile label="Linked students" value={accepted.length} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatTile label="Pending invites" value={pending.length} />
            </Grid>
          </Grid>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Your students
                </Typography>
                <Button
                  component={Link}
                  href="/parent/students"
                  size="small"
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                >
                  Manage
                </Button>
              </Stack>

              {accepted.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {pending.length > 0
                    ? "Your invite is waiting to be accepted. It'll appear here once the student accepts."
                    : "No linked students yet."}
                </Typography>
              ) : (
                <Stack divider={<Divider flexItem />}>
                  {accepted.map((l) => (
                    <StudentRow key={l.id} link={l} />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function StudentRow({ link }: { link: ParentLink }) {
  const name = link.studentName ?? link.studentEmail;
  return (
    <Stack
      component={Link}
      href={`/parent/students/${link.studentUserId}`}
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ py: 1.5, textDecoration: "none", color: "inherit" }}
    >
      <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", fontWeight: 700 }}>
        {initials(name)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
          {link.studentEmail}
        </Typography>
      </Box>
      <ArrowForwardIcon fontSize="small" sx={{ color: "text.secondary" }} />
    </Stack>
  );
}
