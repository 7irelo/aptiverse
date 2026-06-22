"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { PageHeader } from "@/components/common/PageHeader";

// Aptiverse doesn't maintain its own university database. APS cutoffs,
// fees and deadlines change yearly — we link directly to each
// university's official admissions site so students see the source of
// truth, not stale snapshots.

const UNIVERSITIES = [
  { name: "University of Cape Town", short: "UCT", city: "Cape Town", url: "https://www.uct.ac.za/apply" },
  { name: "Stellenbosch University", short: "SU", city: "Stellenbosch", url: "https://www.sun.ac.za/english/Pages/apply.aspx" },
  { name: "University of the Witwatersrand", short: "Wits", city: "Johannesburg", url: "https://www.wits.ac.za/applications/" },
  { name: "University of Pretoria", short: "UP", city: "Pretoria", url: "https://www.up.ac.za/applications" },
  { name: "University of Johannesburg", short: "UJ", city: "Johannesburg", url: "https://www.uj.ac.za/apply/" },
  { name: "University of KwaZulu-Natal", short: "UKZN", city: "Durban / Pietermaritzburg", url: "https://applications.ukzn.ac.za/" },
  { name: "Rhodes University", short: "RU", city: "Makhanda", url: "https://www.ru.ac.za/admissionoffice/" },
  { name: "North-West University", short: "NWU", city: "Potchefstroom / Mahikeng / Vanderbijlpark", url: "https://www.nwu.ac.za/admissions" },
  { name: "University of the Free State", short: "UFS", city: "Bloemfontein", url: "https://www.ufs.ac.za/apply" },
  { name: "Nelson Mandela University", short: "NMU", city: "Gqeberha", url: "https://www.mandela.ac.za/Study-at-Mandela/Admission" },
  { name: "Cape Peninsula University of Technology", short: "CPUT", city: "Cape Town", url: "https://www.cput.ac.za/study" },
  { name: "Tshwane University of Technology", short: "TUT", city: "Pretoria", url: "https://www.tut.ac.za/applications" },
  { name: "Durban University of Technology", short: "DUT", city: "Durban", url: "https://www.dut.ac.za/applications/" },
  { name: "University of South Africa", short: "UNISA", city: "Distance learning", url: "https://www.unisa.ac.za/apply" },
];

export default function UniversitiesPage() {
  return (
    <>
      <PageHeader
        title="Universities"
        description="Where to apply, when to apply, and what each institution actually requires. We link straight to the official admissions pages so the info stays current."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Universities" }]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SchoolOutlinedIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    APS, cutoffs & deadlines
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Every university calculates APS slightly differently and runs its own application portal. Browse the universities below and follow each apply link — that's where the live cutoffs, fees and closing dates live.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: "text.secondary" }}>
            South African universities
          </Typography>
          <Grid container spacing={1.5}>
            {UNIVERSITIES.map((u) => (
              <Grid key={u.name} size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      justifyContent="space-between"
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                          <Chip label={u.short} size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {u.city}
                          </Typography>
                        </Stack>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<OpenInNewIcon />}
                        component="a"
                        href={u.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <TipsAndUpdatesOutlinedIcon sx={{ color: "warning.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Applying smart
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                One application is a gamble. Most students who get accepted apply to three or more.
              </Typography>
              <Stack spacing={1.5}>
                <Tip n={1} text="Pick 3-5 universities: 1 stretch, 2 likely, 1 safe." />
                <Tip n={2} text="Apply early — many close 30 June for the following year." />
                <Tip n={3} text="Check each university's specific subject requirements per course." />
                <Tip n={4} text="Visit virtual open days. They're free and surprisingly useful." />
                <Tip n={5} text="Use the Universities South Africa central application service (uSAf) where available." />
              </Stack>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Need help paying?
              </Typography>
              <Button variant="contained" fullWidth href="/dashboard/bursaries">
                Find bursaries
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip label="Sources: each university's official admissions site" size="small" variant="outlined" />
          <Typography variant="caption" color="text.secondary">
            APS, cutoffs and fees change every year — always confirm on the university's own site.
          </Typography>
        </Stack>
      </Box>
    </>
  );
}

function Tip({ n, text }: { n: number; text: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: "action.hover",
          color: "text.primary",
          fontWeight: 700,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {n}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Stack>
  );
}
