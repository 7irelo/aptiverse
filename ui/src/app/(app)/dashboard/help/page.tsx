"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { PageHeader } from "@/components/common/PageHeader";
import HelpIcon from "@mui/icons-material/HelpOutline";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import ChatIcon from "@mui/icons-material/ChatBubbleOutline";

const FAQS = [
  { q: "How does AI generate practice tests?", a: "We use your subject, current mastery and upcoming SBAs to generate aligned questions, then mark them with rubric-aware feedback." },
  { q: "Is my diary private?", a: "Yes. Your diary is end-to-end encrypted by default. Even Aptiverse staff cannot read it." },
  { q: "How do rewards get verified?", a: "Your school confirms with one click via an email — no paperwork on the teacher." },
  { q: "Can I use Aptiverse offline?", a: "Yes. Practice tests, diary entries and goal modules work offline and sync when you're back online." },
];

export default function HelpPage() {
  return (
    <>
      <PageHeader
        title="Help & feedback"
        description="Find an answer, search the docs, or talk to a real human."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Help" }]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Search help articles
              </Typography>
              <TextField fullWidth placeholder="What can we help with?" />
            </CardContent>
          </Card>
          <Stack spacing={2}>
            {FAQS.map((f) => (
              <Card key={f.q}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {f.q}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.a}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            {[
              { icon: <ChatIcon />, title: "Live chat", desc: "Available 7am - 7pm SAST" },
              { icon: <EmailIcon />, title: "Email us", desc: "support@aptiverse.co.za" },
              { icon: <HelpIcon />, title: "Knowledge base", desc: "Step-by-step guides" },
            ].map((c) => (
              <Card key={c.title}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "action.hover", color: "primary.main" }}>
                      {c.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {c.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.desc}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                    Open
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
