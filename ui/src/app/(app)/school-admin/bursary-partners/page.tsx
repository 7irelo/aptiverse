"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { BURSARIES } from "@/lib/mockData";

export default function BursaryPartnersPage() {
  return (
    <>
      <PageHeader
        title="Bursary partners"
        description="Match high-potential learners to live bursary opportunities. With consent, we surface profiles to funders."
        breadcrumbs={[{ label: "School", href: "/school-admin" }, { label: "Bursary partners" }]}
        actions={<Button variant="contained">Invite partner</Button>}
      />

      <Grid container spacing={3}>
        {BURSARIES.map((b) => (
          <Grid key={b.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {b.name}
                  </Typography>
                  <Chip label={b.status === "open" ? "Open" : b.status === "closing_soon" ? "Closing soon" : "Closed"} size="small" color={b.status === "open" ? "success" : b.status === "closing_soon" ? "warning" : "default"} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {b.field} · {b.amount}
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Eligible learners
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {Math.round(Math.random() * 50 + 20)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Applied so far
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {Math.round(Math.random() * 20)}
                    </Typography>
                  </Box>
                </Stack>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Surface eligible learners
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
