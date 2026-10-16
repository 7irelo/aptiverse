"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, type PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useAssessments, useAcademicUnits } from "@/lib/api/queries";
import type { Assessment } from "@/lib/mockData";
import { formatRelative, prettifyUnitId } from "@/lib/format";
import { RelativeTime } from "@/components/common/RelativeTime";
import dayjs from "dayjs";

export default function CalendarPage() {
  const assessmentsQuery = useAssessments();
  const academic = useAcademicUnits();
  // Covers school Subjects and university Courses alike; see UpcomingList.
  const unitNameFor = (id: string | undefined) =>
    id ? (academic.nameFor(id) ?? prettifyUnitId(id)) : undefined;

  // Days that have something due, as YYYY-MM-DD keys. Ungraded only: a mark
  // already in is not a deadline, and dotting it would make a busy month look
  // busier than it is. Memoised on the assessment list so the slot component
  // is not handed a fresh Set on every render.
  const dueDates = useMemo(() => {
    const set = new Set<string>();
    for (const a of assessmentsQuery.data ?? []) {
      if (a.status !== "graded") set.add(dayjs(a.dueDate).format("YYYY-MM-DD"));
    }
    return set;
  }, [assessmentsQuery.data]);

  return (
    <>
      <PageHeader
        title="Calendar"
        // "high-school year" was hardcoded, which is simply untrue for the
        // university students this page also serves.
        //
        // "Sync with Google Calendar or Outlook" went with the two buttons that
        // used to sit here. Neither had an onClick, there is no OAuth flow, no
        // token store and no sync job: the whole integration was two words and a
        // pair of outlined buttons. A student clicking Sync Google and seeing
        // nothing happen learns the app is broken; a student reading the promise
        // and not clicking believes their deadlines are in their phone calendar
        // when they are not, which is worse.
        description="Every assessment you have logged, by date."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Calendar" }]}
        actions={
          // "New event" was also dead, and there is no event entity to create:
          // this page reads assessments. So it points at the thing that actually
          // puts a date on this calendar.
          <Button variant="contained" color="secondary" component={Link} href="/dashboard/assessments/new">
            Add assessment
          </Button>
        }
      />

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {dayjs().format("MMMM YYYY")}
            </Typography>
            {/*
              This was a bare <DateCalendar /> with no props: a month grid that
              knew nothing about the student and marked nothing. The one job a
              calendar has on this page is to show when work is due, and it was
              the only thing it did not do. The data was already loaded, sitting
              in the card immediately to the right.
            */}
            <DateCalendar
              value={null}
              onChange={() => {}}
              slots={{ day: DueDay }}
              slotProps={{ day: { dueDates } as never }}
            />
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
                // Offered syncing a school calendar, which does not exist, and
                // assumes a school besides.
                description: "Log an assessment and its due date shows up here and on the calendar.",
                size: "compact",
              }}
            >
              {(assessments) => <UpcomingList assessments={assessments} nameFor={unitNameFor} />}
            </QueryStates>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}

// A day cell that carries a dot when something is due on it.
//
// The dot is a shape, not just a colour: it sits under the numeral and stays
// legible for anyone who cannot separate the hue from the surrounding text, and
// the title attribute gives the same fact to a screen reader. Colour alone
// carrying "you have a deadline" would fail exactly the students most likely to
// miss one.
function DueDay(props: PickersDayProps & { dueDates?: Set<string> }) {
  const { dueDates, day, outsideCurrentMonth, ...rest } = props;
  const isDue = !outsideCurrentMonth && !!dueDates?.has(dayjs(day).format("YYYY-MM-DD"));

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <PickersDay {...rest} day={day} outsideCurrentMonth={outsideCurrentMonth} />
      {isDue && (
        <Box
          aria-hidden
          title="Something is due this day"
          sx={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            width: 4,
            height: 4,
            borderRadius: "50%",
            bgcolor: "primary.main",
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}

// The subject line used to look up useSubjects() by Subject.id while holding
// Assessment.subjectId, which is the slug: different fields, never a match. It
// rendered `{subject?.name}` with no fallback, so every row read " · in 3 days"
// with a dangling separator and no subject. Resolving through useAcademicUnits
// also fixes it for university students, whose courses useSubjects never had.
function UpcomingList({
  assessments,
  nameFor,
}: {
  assessments: Assessment[];
  nameFor: (id: string | undefined) => string | undefined;
}) {
  const upcoming = assessments
    .filter((a) => a.status !== "graded")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 8);

  if (upcoming.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No upcoming assessments. You're caught up.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {upcoming.map((a) => {
        const unitName = nameFor(a.subjectId);
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
                {unitName ? `${unitName} · ` : ""}
                <RelativeTime iso={a.dueDate} />
              </Typography>
            </Box>
            <Chip label={a.type} size="small" />
          </Box>
        );
      })}
    </Stack>
  );
}
