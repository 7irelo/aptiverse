"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/common/PageHeader";
import { SUBJECTS } from "@/lib/mockData";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/CircleOutlined";
import StarIcon from "@mui/icons-material/Star";

export default function JourneyPage() {
  // Build a flat learning journey across topics — completed (>=70), in progress (40-70), upcoming (<40 or 0)
  const topics = SUBJECTS.flatMap((s) =>
    s.topics.map((t) => ({ ...t, subject: s.name, subjectId: s.id })),
  );
  const completed = topics.filter((t) => t.mastery >= 70);
  const inProgress = topics.filter((t) => t.mastery >= 40 && t.mastery < 70);
  const upcoming = topics.filter((t) => t.mastery < 40);

  return (
    <>
      <PageHeader
        title="Your learning journey"
        description="Each landmark is a topic mastered. Growth, not ranking — celebrate every step."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Journey" }]}
      />

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CheckCircleIcon sx={{ color: "success.main" }} />
              <Typography variant="h6">Mastered ({completed.length})</Typography>
            </Stack>
            <Stack spacing={1}>
              {completed.map((t) => (
                <Stack key={`${t.subjectId}-${t.name}`} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "success.main", color: "success.contrastText", opacity: 0.95 }}>
                  <StarIcon fontSize="small" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {t.subject}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {t.mastery}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CircleIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6">In progress ({inProgress.length})</Typography>
            </Stack>
            <Stack spacing={1}>
              {inProgress.map((t) => (
                <Stack key={`${t.subjectId}-${t.name}`} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: "primary.main" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {t.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.subject}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                    {t.mastery}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CircleIcon sx={{ color: "text.disabled" }} />
              <Typography variant="h6">Upcoming ({upcoming.length})</Typography>
            </Stack>
            <Stack spacing={1}>
              {upcoming.map((t) => (
                <Stack key={`${t.subjectId}-${t.name}`} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25, borderRadius: 1.5, border: 1, borderColor: "divider", borderStyle: "dashed" }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: "action.hover" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{t.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.subject}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t.mastery}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}
