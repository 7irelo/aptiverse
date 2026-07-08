"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import PsychologyIcon from "@mui/icons-material/PsychologyOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { Dot } from "@/components/common/Dot";
import { QueryStates } from "@/components/common/QueryStates";
import { useCounsellors, type Counsellor } from "@/lib/api/queries";

export default function PsychologistPage() {
  const query = useCounsellors();

  return (
    <>
      <PageHeader
        title="Talk to someone"
        description="Verified psychologists for when life is more than studying. Confidential. Booked through your school plan or a one-off session."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Talk to someone" }]}
      />

      <Card
        sx={{
          mb: 3,
          p: 3,
          background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
          color: "primary.contrastText",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.85 }}>
              Need to talk now?
            </Typography>
            <Typography variant="h5">Free 24/7 SADAG line: 0800 567 567</Typography>
            <Typography variant="body2" sx={{ opacity: 0.92 }}>
              Trained counsellors. Anonymous. Free.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "wellbeing.main",
              color: "wellbeing.contrastText",
              "&:hover": { bgcolor: "wellbeing.dark" },
            }}
          >
            Send me the number
          </Button>
        </Stack>
      </Card>

      <QueryStates
        query={query}
        empty={{
          icon: <PsychologyIcon />,
          title: "No counsellors available yet",
          description:
            "We're verifying counsellors in your area. In the meantime, the SADAG line above is free, anonymous, and open 24/7.",
        }}
      >
        {(counsellors) => (
          <Grid container spacing={3}>
            {counsellors.map((c) => (
              <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <CounsellorCard counsellor={c} />
              </Grid>
            ))}
          </Grid>
        )}
      </QueryStates>
    </>
  );
}

function CounsellorCard({ counsellor: c }: { counsellor: Counsellor }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: c.avatarColor, fontWeight: 700 }}>
              {c.name.split(" ").slice(-2).map((p) => p[0]).join("")}
            </Avatar>
            {c.online && (
              <Box sx={{ position: "absolute", bottom: 2, right: 2, p: 0.4, bgcolor: "background.paper", borderRadius: "50%" }}>
                <Dot color="success" pulsing size={9} />
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {c.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {c.title}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
              <Rating value={c.rating} precision={0.1} size="small" readOnly />
              <Typography variant="caption" color="text.secondary">
                {c.rating.toFixed(1)}
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Chip label={c.specialisation} size="small" variant="outlined" sx={{ mt: 2 }} />
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined" fullWidth>
            Profile
          </Button>
          <Button variant="contained" fullWidth>
            Book 30 min
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
