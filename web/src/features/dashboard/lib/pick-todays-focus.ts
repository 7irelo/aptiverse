import { daysFromToday } from "@/lib/format/date";

import type {
  DashboardAssessment,
  DashboardTopic,
} from "@/lib/api/generated/model";

export type TodaysFocus = {
  kind: "overdue" | "due-today" | "due-tomorrow" | "recommended";
  title: string;
  href: string;
  actionLabel: string;
};

/**
 * One item for today, in order: overdue, due today, due tomorrow, then the
 * weakest topic with evidence. Day boundaries are SAST midnight. Pure.
 */
export function pickTodaysFocus(
  assessments: readonly DashboardAssessment[],
  weakest: readonly DashboardTopic[],
  now: Date = new Date(),
): TodaysFocus | null {
  const sorted = [...assessments].sort(
    (a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt),
  );
  const overdue = sorted.find((a) => Date.parse(a.dueAt) < now.getTime());
  if (overdue) {
    return {
      kind: "overdue",
      title: `Overdue: ${overdue.title}`,
      href: `/dashboard/assessments/${overdue.assessmentId}`,
      actionLabel: "Open assessment",
    };
  }
  const today = sorted.find((a) => daysFromToday(a.dueAt, now) === 0);
  if (today) {
    return {
      kind: "due-today",
      title: `Due today: ${today.title}`,
      href: `/dashboard/assessments/${today.assessmentId}`,
      actionLabel: "Open assessment",
    };
  }
  const tomorrow = sorted.find((a) => daysFromToday(a.dueAt, now) === 1);
  if (tomorrow) {
    return {
      kind: "due-tomorrow",
      title: `Due tomorrow: ${tomorrow.title}`,
      href: `/dashboard/assessments/${tomorrow.assessmentId}`,
      actionLabel: "Open assessment",
    };
  }
  const topic = weakest.find((t) => t.score !== null && t.topic);
  if (topic) {
    return {
      kind: "recommended",
      title: `Recommended: practise ${topic.topic}`,
      href: practiceHref(topic.studyUnitId, topic.topic),
      actionLabel: "Start drill",
    };
  }
  return null;
}

export function practiceHref(unitId: string, topic?: string | null): string {
  const params = new URLSearchParams({ unit: unitId });
  if (topic) params.set("topic", topic);
  params.set("source", "recommended");
  return `/dashboard/practice?${params.toString()}`;
}
