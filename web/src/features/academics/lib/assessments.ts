import { daysFromToday, sastDayNumber } from "@/lib/format/date";

import type { Stage } from "./stage";

export const HS_TYPES = [
  "test",
  "essay",
  "investigation",
  "practical",
  "exam",
  "project",
  "oral",
] as const;

export const UNI_TYPES = [
  "assignment",
  "class_test",
  "test",
  "tutorial",
  "lab_report",
  "practical",
  "midterm",
  "exam",
  "essay",
  "project",
  "presentation",
] as const;

export function typesFor(stage: Stage): readonly string[] {
  return stage === "university" ? UNI_TYPES : HS_TYPES;
}

export const STATE_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  submitted: "Submitted",
  graded: "Marked",
};

export const ACTION_LABELS: Record<string, string> = {
  start: "Start working on it",
  submit: "Mark as submitted",
  mark: "Log mark",
  reopen: "Move back to in progress",
  remove_mark: "Move back to submitted",
};

export type AssessmentGroup =
  "Overdue" | "This week" | "Next week" | "Later" | "Done";

export const ASSESSMENT_GROUPS: readonly AssessmentGroup[] = [
  "Overdue",
  "This week",
  "Next week",
  "Later",
  "Done",
];

function isOpen(state: string): boolean {
  return state === "scheduled" || state === "in_progress";
}

/** SAST week number, weeks starting Monday 00:00. */
function sastWeek(day: number): number {
  // Day 0 (1 Jan 1970) was a Thursday; shift so weeks start on Monday.
  return Math.floor((day + 3) / 7);
}

/**
 * Overdue means past due, still open and no mark logged. Graded or
 * submitted items are Done and never overdue.
 */
export function assessmentGroup(
  item: { dueAt: string; state: string; percent?: number | null },
  now: Date = new Date(),
): AssessmentGroup {
  if (!isOpen(item.state)) return "Done";
  if (Date.parse(item.dueAt) < now.getTime() && item.percent == null) {
    return "Overdue";
  }
  const week =
    sastWeek(sastDayNumber(item.dueAt)) - sastWeek(sastDayNumber(now));
  if (week <= 0) return "This week";
  if (week === 1) return "Next week";
  return "Later";
}

/** Mark column words: a mark, "Awaiting" or "Not submitted". */
export function markText(item: {
  state: string;
  percent?: number | null;
}): string {
  if (item.percent != null) return `${Math.round(item.percent)}%`;
  if (item.state === "submitted") return "Awaiting";
  if (item.state === "graded") return "No mark yet";
  return "Not submitted";
}

export function isOverdue(dueAt: string, state: string, now = new Date()) {
  return isOpen(state) && Date.parse(dueAt) < now.getTime();
}

export function overdueDays(dueAt: string, now = new Date()): number {
  return Math.max(1, -daysFromToday(dueAt, now));
}

/** "3 points above your prediction." and friends. */
export function compareSentence(mark: number, predicted: number): string {
  const diff = Math.round(mark - predicted);
  if (diff === 0) return "Right on your prediction.";
  const n = Math.abs(diff);
  return `${n} ${n === 1 ? "point" : "points"} ${diff > 0 ? "above" : "below"} your prediction.`;
}
