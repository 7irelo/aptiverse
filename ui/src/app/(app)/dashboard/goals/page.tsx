"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AddIcon from "@mui/icons-material/Add";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { GOALS, SUBJECTS } from "@/lib/mockData";
import { formatRelative } from "@/lib/format";

const TABS = ["Active", "At risk", "Completed", "Verified"] as const;

export default function GoalsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active");

  const filtered = GOALS.filter((g) => {
    if (tab === "Active") return g.status === "active";
    if (tab === "At risk") return g.status === "at_risk";
    if (tab === "Completed") return g.status === "completed";
    if (tab === "Verified") return g.status === "verified";
    return true;
  });

  return (
    <>
      <PageHeader
        title="Goals"
        description="AI sets healthy goals based on your history. You make them happen. Schools verify the wins."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Goals" }]}
        actions={<Button variant="contained" startIcon={<AddIcon />}>New goal</Button>}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        {TABS.map((t) => (
          <Tab key={t} value={t} label={t} />
        ))}
      </Tabs>

      <Grid container spacing={3}>
        {filtered.map((g) => {
          const subject = SUBJECTS.find((s) => s.id === g.subjectId);
          const tone = g.status === "at_risk" ? "warning" : g.status === "verified" ? "success" : g.status === "completed" ? "info" : "primary";

          return (
            <Grid key={g.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Chip label={g.category} size="small" sx={{ textTransform: "capitalize" }} />
                    <IconButton size="small">
                      <MoreHorizIcon />
                    </IconButton>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {g.title}
                  </Typography>
                  {subject && (
                    <Typography variant="caption" color="text.secondary">
                      {subject.name}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {g.description}
                  </Typography>

                  <Box sx={{ mt: "auto", pt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress · {g.target}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {g.progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={g.progress} color={tone} sx={{ height: 8, borderRadius: 999 }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                      <StatusChip
                        kind={tone}
                        label={g.status.replace("_", " ")}
                        dot={g.status === "active" || g.status === "at_risk"}
                        sx={{ textTransform: "capitalize" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Due {formatRelative(g.dueDate)}
                      </Typography>
                    </Stack>

                    {g.reward && (
                      <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: "action.hover", display: "flex", alignItems: "center", gap: 1.5 }}>
                        <EmojiEventsIcon sx={{ color: "warning.main" }} />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {g.reward}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
