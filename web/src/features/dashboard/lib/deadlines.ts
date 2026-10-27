import { daysFromToday } from "@/lib/format/date";

export type DeadlineGroup = "Overdue" | "Today" | "This week" | "Later";

export const DEADLINE_GROUPS: readonly DeadlineGroup[] = [
  "Overdue",
  "Today",
  "This week",
  "Later",
];

/** Which group a due date falls in, by SAST day. */
export function deadlineGroup(
  dueAt: string,
  now: Date = new Date(),
): DeadlineGroup {
  if (Date.parse(dueAt) < now.getTime()) return "Overdue";
  const days = daysFromToday(dueAt, now);
  if (days <= 0) return "Today";
  if (days < 7) return "This week";
  return "Later";
}

/** Groups items in display order, capped at `max` rows overall. */
export function groupDeadlines<T extends { dueAt: string }>(
  items: readonly T[],
  max = 5,
  now: Date = new Date(),
): { group: DeadlineGroup; items: T[] }[] {
  const sorted = [...items]
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
    .slice(0, max);
  return DEADLINE_GROUPS.map((group) => ({
    group,
    items: sorted.filter((item) => deadlineGroup(item.dueAt, now) === group),
  })).filter((entry) => entry.items.length > 0);
}
