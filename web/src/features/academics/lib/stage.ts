/**
 * Stage-aware wording. High-school students take subjects; university
 * students take courses. Pages never show the other stage's words.
 */
export type Stage = "high_school" | "university";

export function toStage(level: string | null | undefined): Stage {
  return level === "tertiary" || level === "university"
    ? "university"
    : "high_school";
}

export type StageWords = {
  noun: string;
  nouns: string;
  Noun: string;
  Nouns: string;
};

export function stageWords(stage: Stage): StageWords {
  return stage === "university"
    ? { noun: "course", nouns: "courses", Noun: "Course", Nouns: "Courses" }
    : {
        noun: "subject",
        nouns: "subjects",
        Noun: "Subject",
        Nouns: "Subjects",
      };
}

const TERTIARY_LEVELS: Record<string, string> = {
  first_year: "First year",
  second_year: "Second year",
  third_year: "Third year",
  fourth_year: "Fourth year",
  honours: "Honours",
  masters: "Masters",
  phd: "PhD",
};

export const TERTIARY_LEVEL_OPTIONS = Object.entries(TERTIARY_LEVELS).map(
  ([value, label]) => ({ value, label }),
);

/** "Grade 11" for a CAPS subject, "Second year" for a course. */
export function levelLabel(unit: {
  kind: string;
  level: string;
  grade?: number | null;
}): string {
  if (unit.kind === "caps_subject" && unit.grade) return `Grade ${unit.grade}`;
  return TERTIARY_LEVELS[unit.level] ?? humanize(unit.level);
}

/** "class_test" to "Class test". */
export function humanize(value: string): string {
  const text = value.replace(/_/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Whole percent text, keeping null as null. */
export function percentText(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return `${Math.round(value)}%`;
}
