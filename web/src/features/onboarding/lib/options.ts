/** Option lists for the onboarding selects, values exactly as the API takes them. */
export const GRADE_OPTIONS = [8, 9, 10, 11, 12].map((grade) => ({
  value: String(grade),
  label: `Grade ${grade}`,
}));

export const CURRICULUM_OPTIONS = [
  { value: "nsc", label: "NSC (CAPS)" },
  { value: "ieb", label: "IEB" },
];

export const STUDY_LEVEL_OPTIONS = [
  { value: "first_year", label: "First year" },
  { value: "second_year", label: "Second year" },
  { value: "third_year", label: "Third year" },
  { value: "fourth_year", label: "Fourth year" },
  { value: "honours", label: "Honours" },
  { value: "masters", label: "Masters" },
  { value: "phd", label: "PhD" },
];

export const INSTITUTION_MAX_LENGTH = 200;
