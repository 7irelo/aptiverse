import type { GoalSummary } from "@/lib/api/generated/model";

export const CRITERIA = [
  {
    value: "practice_tests_completed",
    label: "Finish practice tests",
    count: true,
  },
  {
    value: "practice_score_best",
    label: "Reach a practice score",
    count: false,
  },
  { value: "mastery_threshold", label: "Reach a mastery level", count: false },
  { value: "assessments_submitted", label: "Submit assessments", count: true },
  {
    value: "assessment_mark_threshold",
    label: "Reach an assessment mark",
    count: false,
  },
] as const;

export type CriteriaType = (typeof CRITERIA)[number]["value"];

export function isCountCriteria(type: string): boolean {
  return (
    type === "practice_tests_completed" || type === "assessments_submitted"
  );
}

export function criteriaLabel(type: string): string {
  return CRITERIA.find((c) => c.value === type)?.label ?? type;
}

function trim(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** A goal value with its unit: "3" for counts, "72%" for percents. */
export function goalValueText(type: string, value: number): string {
  return isCountCriteria(type) ? trim(value) : `${trim(value)}%`;
}

/**
 * "2 of 5" or "64% of 75%". Without evidence it says so instead of zero:
 * "No marks yet, target 75%".
 */
export function goalProgressText(
  goal: Pick<GoalSummary, "criteriaType" | "currentValue" | "targetValue">,
): string {
  const target = goalValueText(goal.criteriaType, goal.targetValue);
  if (goal.currentValue === null) return `No marks yet, target ${target}`;
  return `${goalValueText(goal.criteriaType, goal.currentValue)} of ${target}`;
}

export const GOAL_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  at_risk: "At risk",
  achieved: "Complete",
  expired: "Expired",
  abandoned: "Archived",
};

/** Default title from the form choices, as the spec words it. */
export function defaultGoalTitle(input: {
  type: string;
  target: number | null;
  unitName?: string;
  topic?: string;
}): string {
  const n = input.target ?? "N";
  const where = input.topic || input.unitName;
  switch (input.type) {
    case "practice_tests_completed":
      return input.unitName
        ? `Finish ${n} practice tests in ${input.unitName}`
        : `Finish ${n} practice tests`;
    case "assessments_submitted":
      return `Submit ${n} assessments${input.unitName ? ` in ${input.unitName}` : ""}`;
    case "mastery_threshold":
      return `Reach ${n}% in ${where ?? "a topic"}`;
    case "practice_score_best":
      return `Score ${n}% on a practice test${input.unitName ? ` in ${input.unitName}` : ""}`;
    case "assessment_mark_threshold":
      return `Get ${n}% on an assessment${input.unitName ? ` in ${input.unitName}` : ""}`;
    default:
      return "New goal";
  }
}

/** The spec's baseline refusal sentence. */
export function baselineRefusal(baseline: number, where: string): string {
  const b = trim(baseline);
  return `You're already at ${b}% in ${where}. Set a target above ${b}% so this goal measures new work.`;
}
