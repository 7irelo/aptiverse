"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useAssessments, useSubjects } from "@/lib/api/queries";
import type { Assessment, Subject } from "@/lib/mockData";
import { formatRelative } from "@/lib/format";
import { RelativeTime } from "@/components/common/RelativeTime";
import dayjs from "dayjs";

export default function CalendarPage() {
  const assessmentsQuery = useAssessments();
  const subjectsQuery = useSubjects();

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Your high-school year at a glance. Sync with Google Calendar or Outlook."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Calendar" }]}
        actions={
          <>
            <Button variant="outlined">Sync Google</Button>
            <Button variant="outlined">Sync Outlook</Button>
            <Button variant="contained">New event</Button>
          </>
        }
      />

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {dayjs().format("MMMM YYYY")}
            </Typography>
            <DateCalendar />
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upcoming
            </Typography>
            <QueryStates
              query={assessmentsQuery}
              empty={{
                icon: <CalendarMonthIcon />,
                title: "Nothing scheduled",
                description: "Add an assessment or sync your school calendar to see deadlines here.",
                size: "compact",
              }}
            >
              {(assessments) => <UpcomingList assessments={assessments} subjects={subjectsQuery.data ?? []} />}
            </QueryStates>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}

function UpcomingList({ assessments, subjects }: { assessments: Assessment[]; subjects: Subject[] }) {
  const upcoming = assessments
    .filter((a) => a.status !== "graded")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 8);

  if (upcoming.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No upcoming assessments — you're caught up.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {upcoming.map((a) => {
        const subject = subjects.find((s) => s.id === a.subjectId);
        const daysLeft = dayjs(a.dueDate).diff(dayjs(), "day");
        const urgent = daysLeft <= 3;
        return (
          <Box key={a.id} sx={{ p: 2, borderRadius: 2, border: 1, borderColor: "divider", display: "flex", gap: 2, alignItems: "center" }}>
            <Box
              sx={{
                width: 56,
                textAlign: "center",
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: urgent ? "warning.main" : "primary.main",
                color: "primary.contrastText",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {dayjs(a.dueDate).format("MMM").toUpperCase()}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {dayjs(a.dueDate).format("DD")}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {a.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {subject?.name} · <RelativeTime iso={a.dueDate} />
              </Typography>
            </Box>
            <Chip label={a.type} size="small" />
          </Box>
        );
      })}
    </Stack>
  );
}
