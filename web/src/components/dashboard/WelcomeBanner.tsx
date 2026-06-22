"use client";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useSession } from "next-auth/react";
import { useAssessments, useGoals } from "@/lib/api/queries";
import dayjs from "dayjs";

const TIME_OF_DAY_LABELS = ["morning", "afternoon", "evening", "night"];

function timeOfDay(hour: number) {
  if (hour < 5) return TIME_OF_DAY_LABELS[3];
  if (hour < 12) return TIME_OF_DAY_LABELS[0];
  if (hour < 17) return TIME_OF_DAY_LABELS[1];
  if (hour < 22) return TIME_OF_DAY_LABELS[2];
  return TIME_OF_DAY_LABELS[3];
}

// Context-aware orientation. The static "Pick up where you left off."
// becomes wallpaper for a daily-return user; the brand promises a
// "senior friend at 8pm" who notices what kind of day it is. Twelve
// quiet variants compound across the week without ever shouting,
// streaking, or congratulating. The dial is "acknowledges the moment",
// not "performs personality".
//
// PRODUCT.md guardrails I'm holding to:
//   - No "you're crushing it" / streak language (gamified-loud).
//   - No prescriptive coaching ("take a deep breath", "you've got
//     this"). The student is an adult.
//   - South African idiom is fine; American matey-ness is not.
function orientationSentence(opts: {
  weekday: string;
  hour: number;
  nextTitle?: string;
  daysOut: number | null;
}): string {
  const { weekday, hour, nextTitle, daysOut } = opts;
  const hasUrgent = nextTitle && daysOut != null && daysOut >= 0;
  const inDays = (n: number) => (n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);

  // Same-day or next-day deadlines win the orientation slot. Stating
  // the fact is enough; no instructions on what to do about it.
  if (hasUrgent && daysOut === 0) return `${nextTitle} is today.`;
  if (hasUrgent && daysOut === 1) return `${nextTitle} is tomorrow.`;

  // Late night (22:00–04:59). Acknowledge the hour without judging it.
  const isLate = hour >= 22 || hour < 5;
  if (isLate) {
    return hasUrgent
      ? `Late one. ${nextTitle} is ${inDays(daysOut as number)}.`
      : "Late one.";
  }

  // Friday afternoon onwards: weekend is in earshot.
  if (weekday === "Friday" && hour >= 14) {
    return hasUrgent
      ? `Weekend ahead. ${nextTitle} is ${inDays(daysOut as number)}.`
      : "Weekend ahead.";
  }

  // Sunday: quiet day, set up the week.
  if (weekday === "Sunday") {
    return hasUrgent
      ? `Quiet Sunday. ${nextTitle} is ${inDays(daysOut as number)}.`
      : "Quiet Sunday.";
  }

  // Monday morning: fresh week.
  if (weekday === "Monday" && hour < 12) {
    return hasUrgent
      ? `Fresh week. ${nextTitle} is ${inDays(daysOut as number)}.`
      : "Fresh week.";
  }

  // Default.
  return hasUrgent
    ? `Pick up where you left off. ${nextTitle} is due ${inDays(daysOut as number)}.`
    : "Pick up where you left off.";
}

export function WelcomeBanner({ name }: { name?: string }) {
  const { data: session } = useSession();
  const u = (session?.user ?? {}) as { name?: string | null; firstName?: string };
  const resolved = name ?? u.firstName ?? u.name?.split(" ")[0] ?? "there";

  const now = new Date();
  const hour = now.getHours();
  const tod = timeOfDay(hour);
  const weekday = dayjs(now).format("dddd");

  const assessmentsQuery = useAssessments();
  const next = (assessmentsQuery.data ?? [])
    .filter((a) => a.status !== "graded")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0];
  const daysOut = next ? dayjs(next.dueDate).diff(dayjs(), "day") : null;

  // Earned-milestone signal: a small amber dot beside the name when the
  // student has hit 100% on at least one goal. Sacred-Amber Rule from
  // DESIGN.md applies: amber is for earned achievement only, never
  // decorative. A goal at 100% qualifies; an "active" goal at 60%
  // doesn't. Tooltip carries the count for context without the dot
  // having to grow into a chip.
  const goalsQuery = useGoals();
  const milestoneCount = (goalsQuery.data ?? []).filter(
    (g) => g.progress === 100,
  ).length;

  const sentence = orientationSentence({
    weekday,
    hour,
    nextTitle: next?.title,
    daysOut,
  });

  return (
    <Box
      sx={{
        mb: 4,
        pb: 3,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="overline" color="text.secondary">
        {weekday} {tod}
      </Typography>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 600, mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}
      >
        Hi {resolved}.
        {milestoneCount > 0 && (
          <Tooltip
            arrow
            enterTouchDelay={0}
            title={
              milestoneCount === 1
                ? "1 goal completed."
                : `${milestoneCount} goals completed.`
            }
          >
            <Box
              component="span"
              aria-label={
                milestoneCount === 1
                  ? "1 goal completed"
                  : `${milestoneCount} goals completed`
              }
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "achievement.main",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          </Tooltip>
        )}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 1, maxWidth: "62ch" }}
      >
        {sentence}
      </Typography>
    </Box>
  );
}
