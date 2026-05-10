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
import { PageHeader } from "@/components/common/PageHeader";
import { Dot } from "@/components/common/Dot";

const COUNSELLORS = [
  { id: "c1", name: "Dr. Lerato Mahlangu", title: "Clinical Psychologist", spec: "Anxiety, exam stress", rating: 4.9, online: true, color: "#1F8079" },
  { id: "c2", name: "Sarah Naidoo", title: "Counselling Psychologist", spec: "Relationships, family", rating: 4.8, online: false, color: "#F25C2E" },
  { id: "c3", name: "Khanya Dlamini", title: "Educational Psychologist", spec: "Career & focus", rating: 5.0, online: true, color: "#3D9762" },
];

export default function PsychologistPage() {
  return (
    <>
      <PageHeader
        title="Talk to someone"
        description="Verified psychologists for when life is more than studying. Confidential. Booked through your school plan or a one-off session."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Talk to someone" }]}
      />

      <Card sx={{ mb: 3, p: 3, background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`, color: "primary.contrastText" }}>
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
          <Button color="secondary" variant="contained" size="large">
            Send me the number
          </Button>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {COUNSELLORS.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ position: "relative" }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: c.color, fontWeight: 700 }}>
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
                <Chip label={c.spec} size="small" variant="outlined" sx={{ mt: 2 }} />
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
          </Grid>
        ))}
      </Grid>
    </>
  );
}
