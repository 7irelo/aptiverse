"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PageHeader } from "@/components/common/PageHeader";

export default function TeacherCalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Lessons, due dates, and assessments — synced with your school's calendar."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Calendar" }]}
      />
      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <DateCalendar />
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              This week
            </Typography>
            <Stack spacing={1.5}>
              {[
                { day: "Mon", what: "12A Maths · Calculus revision · 8am" },
                { day: "Tue", what: "12B PhSci · Equilibrium SBA brief · 10am" },
                { day: "Wed", what: "11A English · Poetry workshop · 11am" },
                { day: "Thu", what: "12A LSci · Genetics practical · 2pm" },
              ].map((d, i) => (
                <Stack key={i} direction="row" spacing={2}>
                  <Typography variant="overline" color="primary.main" sx={{ minWidth: 56 }}>
                    {d.day}
                  </Typography>
                  <Typography variant="body2">{d.what}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}
