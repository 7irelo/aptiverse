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
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AgricultureOutlinedIcon from "@mui/icons-material/AgricultureOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import { PageHeader } from "@/components/common/PageHeader";

// Aptiverse doesn't maintain its own bursary database — that's a curated
// data job that ZA Bursaries and Study Trust already do well and keep
// up-to-date. We point students at the right doors and give them a real
// checklist for the most-common applications.

const DIRECTORIES = [
  {
    name: "ZA Bursaries",
    url: "https://www.zabursaries.co.za/",
    description: "The largest SA bursary directory — searchable by field, year of study, university, and province. Updated regularly with closing dates.",
  },
  {
    name: "Study Trust",
    url: "https://studytrust.org.za/bursary-applications/",
    description: "Manages over 50 corporate bursary programmes including Sasol, Standard Bank, Rand Merchant Bank, Old Mutual and Nedbank.",
  },
];

const FIELDS: { name: string; icon: React.ReactNode; examples: string }[] = [
  { name: "Engineering", icon: <EngineeringOutlinedIcon />, examples: "Sasol, Eskom, Anglo American, Transnet, SAICE" },
  { name: "Health Sciences", icon: <LocalHospitalOutlinedIcon />, examples: "Discovery, Department of Health, Netcare, Medi-Clinic" },
  { name: "Commerce & Finance", icon: <GavelOutlinedIcon />, examples: "Allan Gray, Investec, Standard Bank, RMB, Old Mutual" },
  { name: "Agriculture", icon: <AgricultureOutlinedIcon />, examples: "AgriSETA, FW de Klerk Foundation, BKB" },
  { name: "Technology", icon: <CodeOutlinedIcon />, examples: "Cisco, Microsoft, TIA, Department of Communications" },
  { name: "Teaching & Education", icon: <SchoolOutlinedIcon />, examples: "Funza Lushaka, ISASA, individual schools" },
];

export default function BursariesPage() {
  return (
    <>
      <PageHeader
        title="Bursaries"
        description="Where to actually apply — handpicked directories and the big-name programmes worth checking every year."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bursaries" }]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* NSFAS — most important single bursary for SA students */}
          <Card sx={{ mb: 3, borderColor: "primary.main", borderWidth: 1.5, borderStyle: "solid" }}>
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
                  <AccountBalanceOutlinedIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      NSFAS
                    </Typography>
                    <Chip label="Apply first" size="small" color="primary" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Government bursary covering full cost of study (tuition, accommodation, food, books, transport) for South Africans from households earning under R350,000 combined per year. Applications open mid-year and run into the next year's intake.
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<OpenInNewIcon />}
                      component="a"
                      href="https://www.nsfas.org.za/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply at nsfas.org.za
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<OpenInNewIcon />}
                      component="a"
                      href="https://www.nsfas.org.za/content/eligibility.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Check eligibility
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Two main directories */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: "text.secondary" }}>
            Start with these two directories
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {DIRECTORIES.map((d) => (
              <Grid key={d.name} size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                    <VolunteerActivismOutlinedIcon sx={{ color: "primary.main", mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {d.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                      {d.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      endIcon={<OpenInNewIcon />}
                      component="a"
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open directory
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* By field */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: "text.secondary" }}>
            By field of study
          </Typography>
          <Grid container spacing={1.5}>
            {FIELDS.map((f) => (
              <Grid key={f.name} size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ color: "primary.main", mt: "2px" }}>{f.icon}</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, mb: 0.25 }}>{f.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {f.examples}
                        </Typography>
                      </Box>
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
                  Apply smart
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The students who win bursaries don't just have great marks — they apply early and apply broadly.
              </Typography>
              <Stack spacing={1.5}>
                <Tip n={1} text="Apply for NSFAS regardless — it doesn't block other bursary applications." />
                <Tip n={2} text="Aim for 5+ applications. Most students apply for one and miss." />
                <Tip n={3} text="Read each set of requirements twice. Wrong subjects = auto-reject." />
                <Tip n={4} text="Keep a folder: ID copy, latest report, proof of income, motivation letter." />
                <Tip n={5} text="Note every closing date in your calendar. Most close between June and September." />
              </Stack>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Need help with your motivation letter?
              </Typography>
              <Button variant="contained" fullWidth href="/dashboard/tutors">
                Find an essay tutor
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip label="Sources: zabursaries.co.za, studytrust.org.za, nsfas.org.za" size="small" variant="outlined" />
          <Typography variant="caption" color="text.secondary">
            Aptiverse links to maintained directories rather than hosting a stale list — closing dates and eligibility change yearly.
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
