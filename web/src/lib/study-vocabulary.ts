// One source of truth for the words the app uses about a student's studies.
//
// Aptiverse serves two audiences behind the same screens. A high-school
// student follows a CAPS catalogue: they take Subjects, sit SBAs, and work in
// school Terms. A university student creates their own study units: they take
// Courses or modules, sit coursework, and work in Semesters. Before this
// module those differences were spelled out as `isTertiary ? "semester" :
// "term"` inline, in a dozen files, which is how the reports page ended up
// telling a university student about their "Term progress report" and their
// "Subject standing" while every other page had quietly been fixed.
//
// So the branch lives here once. Pages ask for a word, not for a level. That
// also means the next label a designer adds is one property on this object
// rather than a thirteenth copy of the same ternary.
//
// This deliberately does not cover concepts that simply do not exist on one
// side (a Grade selector, the CAPS curriculum picker, the DBE past-paper
// archive). Those are absent or replaced for the audience they do not fit,
// which is a routing/rendering decision, not a wording one.
//
// Kept import-free on purpose: the data layer (queries.ts) reads it to build
// useAcademicUnits' nouns, and the hook that binds it to the signed-in student
// lives in lib/hooks/useStudyVocabulary.ts. Importing the data layer from here
// would close that loop into a cycle.

export type EducationLevel = "highschool" | "tertiary";

export type StudyVocabulary = {
  level: EducationLevel;
  isTertiary: boolean;

  /** What the student studies: "subject" / "course". */
  unitSingular: string;
  unitPlural: string;
  /** Sentence-case forms, for headings and field labels. */
  UnitSingular: string;
  UnitPlural: string;

  /** The reporting period marks roll up into: "term" / "semester". */
  periodSingular: string;
  periodPlural: string;
  PeriodSingular: string;
  /** "next term" / "next semester", for projections. */
  nextPeriod: string;
  /** "Predicted next term" / "Predicted next semester". */
  NextPeriod: string;

  /** Where they study: "school" / "institution". */
  placeSingular: string;
  /** How they describe their stage: "High school" / "University or college". */
  levelLabel: string;
  /** Who a progress report is usually shown to, besides a parent or tutor. */
  educatorSingular: string;

  /** Where their study units live, and where new ones are added. */
  unitsHref: string;
};

const HIGHSCHOOL: StudyVocabulary = {
  level: "highschool",
  isTertiary: false,
  unitSingular: "subject",
  unitPlural: "subjects",
  UnitSingular: "Subject",
  UnitPlural: "Subjects",
  periodSingular: "term",
  periodPlural: "terms",
  PeriodSingular: "Term",
  nextPeriod: "next term",
  NextPeriod: "Next term",
  placeSingular: "school",
  levelLabel: "High school",
  educatorSingular: "teacher",
  unitsHref: "/dashboard/subjects",
};

const TERTIARY: StudyVocabulary = {
  level: "tertiary",
  isTertiary: true,
  unitSingular: "course",
  unitPlural: "courses",
  UnitSingular: "Course",
  UnitPlural: "Courses",
  periodSingular: "semester",
  periodPlural: "semesters",
  PeriodSingular: "Semester",
  nextPeriod: "next semester",
  NextPeriod: "Next semester",
  placeSingular: "institution",
  levelLabel: "University or college",
  educatorSingular: "lecturer",
  unitsHref: "/dashboard/courses",
};

// Pure lookup, for the places that already hold a level (server components,
// tests, or a hook that has its own profile query in hand).
//
// An unresolved level falls back to the high-school wording rather than to
// blanks: the first paint happens before the profile query lands, and empty
// labels flashing into words is worse than a word that settles. Tertiary
// students are the smaller half of the audience today, so this is the
// fallback that flashes least often, and no page should be branching on
// vocabulary for anything load-bearing anyway.
export function studyVocabulary(level: EducationLevel | string | null | undefined): StudyVocabulary {
  return level === "tertiary" ? TERTIARY : HIGHSCHOOL;
}
