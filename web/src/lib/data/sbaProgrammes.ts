// FET-phase SBA Programme of Assessment, synthesised from the SA DBE
// CAPS Subject Statements (publicly published policy documents).
// One row per subject x grade. Curriculum is NSC; IEB structure is
// equivalent at this level of granularity, so the same rows apply.
//
// Source: DBE CAPS Subject Statements (Grades 10-12, Final), 2011-2024
// editions, as gazetted. The Programme of Assessment table is in
// Section 4 of each subject's Curriculum and Assessment Policy
// Statement.
//
// Caveats:
//   - Task NUMBERS and TERMS are policy. Task TITLES are slightly
//     normalised here for consistency across subjects ("Control test"
//     instead of "Test" everywhere, "Trial / Preparatory exam" rather
//     than each subject's local name) so the UI can render them
//     uniformly without losing meaning.
//   - Marks per task are intentionally omitted: CAPS allows schools
//     to set the mark allocation within ranges, and the SBA mark
//     conversion is what matters for the grade. The `weight`
//     percentages below are the per-task contributions to the SBA
//     mark, where CAPS specifies them; otherwise omitted.
//   - LIFE ORIENTATION is the only NSC subject with a 100% SBA
//     model (no external exam). All others split 25% SBA / 75%
//     external exam at Grade 12. Grade 10/11 still split internally
//     (the school sets the year-end exam), but the SBA contribution
//     to the year mark varies (typically 25%).
//
// Adding a subject: append to PROGRAMMES; cite the CAPS document
// version in a comment if it deviates from the standard structure.

export type SbaTaskType =
  | "test"
  | "exam"
  | "investigation"
  | "project"
  | "assignment"
  | "research"
  | "practical"
  | "portfolio"
  | "performance"
  | "oral"
  | "presentation"
  | "case_study"
  | "essay"
  | "report"
  | "pat" // Practical Assessment Task (CAT, IT, EGD, Tech subjects)
  | "pet" // Physical Education Task (Life Orientation)
  | "creative_work"; // Visual Arts, Design source workbook

export type SbaTerm = 1 | 2 | 3 | 4;
export type Grade = 10 | 11 | 12;

export type SbaTask = {
  /** Sequential within the year. */
  number: number;
  term: SbaTerm;
  type: SbaTaskType;
  /** Short, render-ready label. */
  title: string;
  /** Optional one-line explainer. */
  description?: string;
  /** Optional total marks per CAPS guidance. */
  marks?: number;
};

export type SbaProgramme = {
  subjectId: string;
  grade: Grade;
  /** % of the final mark from SBA. 100 for Life Orientation (no
   *  external paper); 25 for almost everything else at Grade 12. */
  sbaWeight: number;
  /** % of the final mark from the external paper. */
  externalWeight: number;
  tasks: SbaTask[];
  /** Free-form clarifications. Empty array if none. */
  notes: string[];
};

// ─── Common building blocks ─────────────────────────────────────────
// Reused across most academic subjects. The 6-task SBA + 1 external
// structure is the NSC standard at Grade 12: 1 subject-specific task,
// 2 control tests, 1 assignment-or-second-specific, 1 mid-year exam,
// 1 trial exam, plus the external NSC exam.

const standardSbaWeights = { sbaWeight: 25, externalWeight: 75 };

// ─── Programmes ─────────────────────────────────────────────────────

export const PROGRAMMES: SbaProgramme[] = [
  // ===================================================================
  // MATHEMATICS
  // ===================================================================
  {
    subjectId: "math",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "investigation", title: "Investigation or project", description: "One subject-specific task per year (school chooses either)." },
      { number: 2, term: 1, type: "test", title: "Control test", description: "Standardised test on Term 1 content." },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 + Paper 2." },
      { number: 5, term: 3, type: "test", title: "Control test", description: "Standardised test on Term 3 content." },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination", description: "Paper 1 + Paper 2." },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: [
      "Tasks 1–6 make up the School-Based Assessment (25%).",
      "Task 7 is the external NSC exam (75%).",
    ],
  },
  {
    subjectId: "math",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "investigation", title: "Investigation or project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination", description: "Paper 1 + Paper 2 (school-set)." },
    ],
    notes: [
      "Tasks 1–5 make up the SBA; Task 6 is the school-set final exam.",
      "Grade 11 SBA mark plus year-end exam feeds the progression mark for Grade 12.",
    ],
  },
  {
    subjectId: "math",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "investigation", title: "Investigation or project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // MATHEMATICAL LITERACY
  // ===================================================================
  {
    subjectId: "math_lit",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "investigation", title: "Investigation or project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 + Paper 2." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination", description: "Paper 1 + Paper 2." },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: ["Same Programme of Assessment as Mathematics."],
  },
  {
    subjectId: "math_lit",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "investigation", title: "Investigation or project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "math_lit",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "investigation", title: "Investigation or project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // LIFE ORIENTATION — 100% SBA, no external exam
  // ===================================================================
  {
    subjectId: "lo",
    grade: 12,
    sbaWeight: 100,
    externalWeight: 0,
    tasks: [
      { number: 1, term: 1, type: "pet", title: "Physical Education Task — Term 1", description: "PET, ongoing across the term." },
      { number: 2, term: 1, type: "project", title: "Project", description: "Sources-based research on a syllabus topic." },
      { number: 3, term: 2, type: "pet", title: "Physical Education Task — Term 2" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination", description: "School-set written paper." },
      { number: 5, term: 3, type: "pet", title: "Physical Education Task — Term 3" },
      { number: 6, term: 3, type: "presentation", title: "Common Assessment Task (CAT)", description: "Common national LO task, set by DBE." },
      { number: 7, term: 4, type: "exam", title: "End-of-year examination", description: "School-set written paper." },
    ],
    notes: [
      "Life Orientation is the only NSC subject with no external (75%) exam.",
      "All marks come from the SBA tasks above.",
      "PET counts as a single year-long task split across three terms in some schools.",
    ],
  },
  {
    subjectId: "lo",
    grade: 11,
    sbaWeight: 100,
    externalWeight: 0,
    tasks: [
      { number: 1, term: 1, type: "pet", title: "Physical Education Task — Term 1" },
      { number: 2, term: 1, type: "project", title: "Project" },
      { number: 3, term: 2, type: "pet", title: "Physical Education Task — Term 2" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "pet", title: "Physical Education Task — Term 3" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: ["No external exam."],
  },
  {
    subjectId: "lo",
    grade: 10,
    sbaWeight: 100,
    externalWeight: 0,
    tasks: [
      { number: 1, term: 1, type: "pet", title: "Physical Education Task — Term 1" },
      { number: 2, term: 1, type: "project", title: "Project" },
      { number: 3, term: 2, type: "pet", title: "Physical Education Task — Term 2" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "pet", title: "Physical Education Task — Term 3" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: ["No external exam."],
  },

  // ===================================================================
  // PHYSICAL SCIENCES (Physics + Chemistry combined)
  // ===================================================================
  {
    subjectId: "physci",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation 1" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical investigation 2" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 (Physics) + Paper 2 (Chemistry)." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination", description: "Paper 1 + Paper 2." },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: [
      "Two practicals (one Physics, one Chemistry) plus the formal lab logbook contribute to the SBA.",
      "Tasks 1–6 = 25% SBA; Task 7 = 75% external.",
    ],
  },
  {
    subjectId: "physci",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation 1" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical investigation 2" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "physci",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation 1" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical investigation 2" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // LIFE SCIENCES
  // ===================================================================
  {
    subjectId: "lifesci",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 + Paper 2." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination", description: "Paper 1 + Paper 2." },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: ["Tasks 1–6 = 25% SBA; Task 7 = 75% external."],
  },
  {
    subjectId: "lifesci",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "lifesci",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // AGRICULTURAL SCIENCES
  // ===================================================================
  {
    subjectId: "agrsci",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 + Paper 2." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination", description: "Paper 1 + Paper 2." },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: [],
  },
  {
    subjectId: "agrsci",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "agrsci",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "practical", title: "Practical investigation / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // ENGLISH HOME LANGUAGE (and template for other HL languages)
  // 7 tasks Grade 12: 1 oral × 4 (incl listening), 2 writing, 2
  // literature/comprehension, 2 exams, 1 final.
  // ===================================================================
  {
    subjectId: "eng_hl",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech", description: "Listening + speaking, recorded." },
      { number: 2, term: 1, type: "essay", title: "Creative writing: essay", description: "Approx 400 words." },
      { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 (comprehension) + Paper 2 (literature) + Paper 3 (writing)." },
      { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination", description: "Papers 1, 2, 3." },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Papers 1, 2, 3 (external)." },
    ],
    notes: [
      "Three papers: Paper 1 (Language in Context), Paper 2 (Literature), Paper 3 (Writing).",
      "Tasks 1–6 = 25% SBA; Task 7 = 75% external.",
      "Oral marks (orals across the year) form a school-internal aggregate counted within the SBA.",
    ],
  },
  {
    subjectId: "eng_hl",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech" },
      { number: 2, term: 1, type: "essay", title: "Creative writing: essay" },
      { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "eng_hl",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech" },
      { number: 2, term: 1, type: "essay", title: "Creative writing: essay" },
      { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // ENGLISH FIRST ADDITIONAL LANGUAGE
  // ===================================================================
  {
    subjectId: "eng_fal",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech" },
      { number: 2, term: 1, type: "essay", title: "Creative writing: essay" },
      { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Papers 1, 2, 3." },
      { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination", description: "Papers 1, 2, 3." },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Papers 1, 2, 3 (external)." },
    ],
    notes: ["Same task shape as Home Language but lower complexity threshold."],
  },
  {
    subjectId: "eng_fal",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech" },
      { number: 2, term: 1, type: "essay", title: "Creative writing: essay" },
      { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "eng_fal",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech" },
      { number: 2, term: 1, type: "essay", title: "Creative writing: essay" },
      { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // ACCOUNTING
  // ===================================================================
  {
    subjectId: "acc",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "case_study", title: "Case study / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Single paper (external)." },
    ],
    notes: ["Single-paper external exam, unlike Maths and Sciences."],
  },
  {
    subjectId: "acc",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "case_study", title: "Case study / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "acc",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "case_study", title: "Case study / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "assignment", title: "Assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // BUSINESS STUDIES
  // ===================================================================
  {
    subjectId: "bus",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "project", title: "Project / case study" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "presentation", title: "Presentation" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Single paper (external)." },
    ],
    notes: [],
  },
  {
    subjectId: "bus",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "project", title: "Project / case study" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "presentation", title: "Presentation" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "bus",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "project", title: "Project / case study" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "presentation", title: "Presentation" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // ECONOMICS
  // ===================================================================
  {
    subjectId: "eco",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "project", title: "Data response / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "essay", title: "Essay / case study" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 + Paper 2." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: [],
  },
  {
    subjectId: "eco",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "project", title: "Data response / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "essay", title: "Essay / case study" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "eco",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "project", title: "Data response / project" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "essay", title: "Essay / case study" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // HISTORY
  // ===================================================================
  {
    subjectId: "hist",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Research / heritage assignment" },
      { number: 2, term: 1, type: "test", title: "Control test", description: "Source-based + extended writing." },
      { number: 3, term: 2, type: "essay", title: "Essay assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 + Paper 2." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: [],
  },
  {
    subjectId: "hist",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Research / heritage assignment" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "essay", title: "Essay assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "hist",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Research / heritage assignment" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "essay", title: "Essay assignment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // GEOGRAPHY
  // ===================================================================
  {
    subjectId: "geo",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Geographical investigation" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "test", title: "Map work test" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 (theory) + Paper 2 (mapwork)." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: [],
  },
  {
    subjectId: "geo",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Geographical investigation" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "test", title: "Map work test" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "geo",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Geographical investigation" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "test", title: "Map work test" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // RELIGION STUDIES
  // ===================================================================
  {
    subjectId: "religion",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Research assignment" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "essay", title: "Essay" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Paper 1 + Paper 2." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 + Paper 2 (external)." },
    ],
    notes: [],
  },
  {
    subjectId: "religion",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Research assignment" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "essay", title: "Essay" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "religion",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "research", title: "Research assignment" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "essay", title: "Essay" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // AFRIKAANS HL / FAL / SAL
  // Same structure as English at the corresponding level. SAL has
  // lighter writing requirements than FAL.
  // ===================================================================
  ...buildLanguageProgrammes("afr_hl", "hl"),
  ...buildLanguageProgrammes("afr_fal", "fal"),
  ...buildLanguageProgrammes("afr_sal", "sal"),

  // ===================================================================
  // SA AFRICAN LANGUAGES — HOME LEVEL
  // Programme of Assessment mirrors English HL.
  // ===================================================================
  ...buildLanguageProgrammes("zul_hl", "hl"),
  ...buildLanguageProgrammes("xho_hl", "hl"),
  ...buildLanguageProgrammes("sep_hl", "hl"),
  ...buildLanguageProgrammes("sot_hl", "hl"),
  ...buildLanguageProgrammes("tsn_hl", "hl"),
  ...buildLanguageProgrammes("tso_hl", "hl"),
  ...buildLanguageProgrammes("ven_hl", "hl"),
  ...buildLanguageProgrammes("ssw_hl", "hl"),
  ...buildLanguageProgrammes("nbl_hl", "hl"),

  // FAL variants for African languages (where the user takes a SA
  // language as their first-additional, common combination with
  // English HL).
  ...buildLanguageProgrammes("zul_fal", "fal"),
  ...buildLanguageProgrammes("xho_fal", "fal"),

  // ===================================================================
  // TOURISM
  // ===================================================================
  {
    subjectId: "tourism",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT) — Phase 1", description: "Tour planning portfolio, year-long; split across terms." },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "case_study", title: "Case study / source-based task" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Single paper (external)." },
    ],
    notes: [
      "PAT spans Terms 1–3 and is internally moderated; counts within the 25% SBA.",
    ],
  },
  {
    subjectId: "tourism",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "case_study", title: "Case study / source-based task" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "tourism",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "case_study", title: "Case study / source-based task" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // HOSPITALITY STUDIES
  // ===================================================================
  {
    subjectId: "hosp",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT) — Phase 1", description: "Practical service task, year-long." },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical food preparation task" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Single paper (external)." },
    ],
    notes: ["PAT is year-long and counts within the 25% SBA."],
  },
  {
    subjectId: "hosp",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical food preparation task" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "hosp",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical food preparation task" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // CONSUMER STUDIES
  // ===================================================================
  {
    subjectId: "consumer",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)", description: "Production / entrepreneurial task, year-long." },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "case_study", title: "Case study / project" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Single paper (external)." },
    ],
    notes: [],
  },
  {
    subjectId: "consumer",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "case_study", title: "Case study / project" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "consumer",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "case_study", title: "Case study / project" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // CAT — Computer Applications Technology
  // ===================================================================
  {
    subjectId: "cat",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)", description: "Year-long applied IT solution; portfolio + product." },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical assessment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Theory paper + practical paper." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 (practical) + Paper 2 (theory) (external)." },
    ],
    notes: ["PAT is a year-long applied portfolio and is internally moderated."],
  },
  {
    subjectId: "cat",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical assessment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "cat",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical assessment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // IT — Information Technology
  // ===================================================================
  {
    subjectId: "it",
    grade: 12,
    ...standardSbaWeights,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)", description: "Year-long programming project." },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical programming assessment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Theory paper + practical paper." },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
      { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Paper 1 (practical) + Paper 2 (theory) (external)." },
    ],
    notes: [],
  },
  {
    subjectId: "it",
    grade: 11,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical programming assessment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },
  {
    subjectId: "it",
    grade: 10,
    sbaWeight: 25,
    externalWeight: 75,
    tasks: [
      { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
      { number: 2, term: 1, type: "test", title: "Control test" },
      { number: 3, term: 2, type: "practical", title: "Practical programming assessment" },
      { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
      { number: 5, term: 3, type: "test", title: "Control test" },
      { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
    ],
    notes: [],
  },

  // ===================================================================
  // ENGINEERING GRAPHICS AND DESIGN (EGD)
  // ===================================================================
  ...buildTechProgrammes("egd", "Mechanical / civil drawing PAT"),
  ...buildTechProgrammes("civil_tech", "Civil construction PAT"),
  ...buildTechProgrammes("elec_tech", "Electrical systems PAT"),
  ...buildTechProgrammes("mech_tech", "Mechanical workshop PAT"),

  // ===================================================================
  // VISUAL ARTS / DRAMATIC ARTS / MUSIC / DANCE / DESIGN
  // All have heavy PAT / Practical components.
  // ===================================================================
  ...buildArtsProgrammes("visual_arts", "Practical body of work + sourcebook"),
  ...buildArtsProgrammes("drama", "Practical performance + journal"),
  ...buildArtsProgrammes("music", "Practical performance + portfolio"),
  ...buildArtsProgrammes("dance", "Practical performance + journal"),
  ...buildArtsProgrammes("design", "Practical design portfolio"),
];

// ─── Builder helpers ────────────────────────────────────────────────
// Used to avoid repeating identical task lists for languages, technical
// subjects, and arts subjects. These follow the canonical CAPS shape.

function buildLanguageProgrammes(
  subjectId: string,
  level: "hl" | "fal" | "sal",
): SbaProgramme[] {
  const isSal = level === "sal";
  return [
    {
      subjectId,
      grade: 12,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech" },
        { number: 2, term: 1, type: "essay", title: isSal ? "Short writing task" : "Creative writing: essay" },
        { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
        { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination", description: "Papers 1, 2, 3." },
        { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
        { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination", description: "Papers 1, 2, 3." },
        { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Papers 1, 2, 3 (external)." },
      ],
      notes: isSal
        ? ["Second Additional Language: lighter writing requirements than FAL."]
        : ["Three papers: Paper 1 (Language in Context), Paper 2 (Literature), Paper 3 (Writing)."],
    },
    {
      subjectId,
      grade: 11,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech" },
        { number: 2, term: 1, type: "essay", title: isSal ? "Short writing task" : "Creative writing: essay" },
        { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
        { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
        { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
        { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
      ],
      notes: [],
    },
    {
      subjectId,
      grade: 10,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "oral", title: "Oral: Prepared speech" },
        { number: 2, term: 1, type: "essay", title: isSal ? "Short writing task" : "Creative writing: essay" },
        { number: 3, term: 2, type: "essay", title: "Literature essay or contextual response" },
        { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
        { number: 5, term: 3, type: "oral", title: "Oral: Listening or unprepared" },
        { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
      ],
      notes: [],
    },
  ];
}

function buildTechProgrammes(
  subjectId: string,
  patDescription: string,
): SbaProgramme[] {
  return [
    {
      subjectId,
      grade: 12,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)", description: `Year-long: ${patDescription}.` },
        { number: 2, term: 1, type: "test", title: "Control test" },
        { number: 3, term: 2, type: "practical", title: "Practical / workshop task" },
        { number: 4, term: 2, type: "exam", title: "Mid-year (June) examination" },
        { number: 5, term: 3, type: "test", title: "Control test" },
        { number: 6, term: 3, type: "exam", title: "Trial / Preparatory examination" },
        { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Single paper (external)." },
      ],
      notes: [
        "PAT is year-long and counts within the 25% SBA, with strict moderation.",
      ],
    },
    {
      subjectId,
      grade: 11,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
        { number: 2, term: 1, type: "test", title: "Control test" },
        { number: 3, term: 2, type: "practical", title: "Practical / workshop task" },
        { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
        { number: 5, term: 3, type: "test", title: "Control test" },
        { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
      ],
      notes: [],
    },
    {
      subjectId,
      grade: 10,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
        { number: 2, term: 1, type: "test", title: "Control test" },
        { number: 3, term: 2, type: "practical", title: "Practical / workshop task" },
        { number: 4, term: 2, type: "exam", title: "Mid-year examination" },
        { number: 5, term: 3, type: "test", title: "Control test" },
        { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
      ],
      notes: [],
    },
  ];
}

function buildArtsProgrammes(
  subjectId: string,
  patDescription: string,
): SbaProgramme[] {
  return [
    {
      subjectId,
      grade: 12,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)", description: `Year-long: ${patDescription}.` },
        { number: 2, term: 1, type: "test", title: "Theory test" },
        { number: 3, term: 2, type: "performance", title: "Performance / practical exam (mid-year)" },
        { number: 4, term: 2, type: "exam", title: "Mid-year (June) theory examination" },
        { number: 5, term: 3, type: "test", title: "Theory test" },
        { number: 6, term: 3, type: "exam", title: "Trial / Preparatory theory examination" },
        { number: 7, term: 4, type: "exam", title: "Final NSC examination", description: "Practical + theory papers (external)." },
      ],
      notes: [
        "Practical / performance components are externally moderated.",
        "PAT and performance combined are the majority of the SBA weight.",
      ],
    },
    {
      subjectId,
      grade: 11,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
        { number: 2, term: 1, type: "test", title: "Theory test" },
        { number: 3, term: 2, type: "performance", title: "Performance / practical exam" },
        { number: 4, term: 2, type: "exam", title: "Mid-year theory examination" },
        { number: 5, term: 3, type: "test", title: "Theory test" },
        { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
      ],
      notes: [],
    },
    {
      subjectId,
      grade: 10,
      sbaWeight: 25,
      externalWeight: 75,
      tasks: [
        { number: 1, term: 1, type: "pat", title: "Practical Assessment Task (PAT)" },
        { number: 2, term: 1, type: "test", title: "Theory test" },
        { number: 3, term: 2, type: "performance", title: "Performance / practical exam" },
        { number: 4, term: 2, type: "exam", title: "Mid-year theory examination" },
        { number: 5, term: 3, type: "test", title: "Theory test" },
        { number: 6, term: 4, type: "exam", title: "End-of-year examination" },
      ],
      notes: [],
    },
  ];
}

// Lookup helper — returns the programme for a (subjectId, grade) pair,
// or undefined if we haven't synthesised it yet. Callers can fall back
// to a generic "6 tasks per year" stub for subjects not yet covered.
export function findProgramme(
  subjectId: string,
  grade: Grade,
): SbaProgramme | undefined {
  return PROGRAMMES.find(
    (p) => p.subjectId === subjectId && p.grade === grade,
  );
}
