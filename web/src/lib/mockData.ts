// FET-phase subject shape returned by the API. `id` is the student's
// enrolment row id; `subjectId` is the canonical catalog slug. Marks
// /mastery fields are optional placeholders until SBA tasks are wired —
// they're undefined for fresh accounts. Pages must guard nullable access.
export type Subject = {
  id: string;             // student_subject id (e.g. "42")
  subjectId: string;      // canonical slug (e.g. "math", "physci")
  code: string;
  name: string;
  category: string;       // language|mathematics|natural_science|commerce|humanities|services|technical|arts|life_orientation
  languageType?: string | null;
  grade: number;          // 10 | 11 | 12
  teacher?: string | null;
  isCompulsory: boolean;
  createdAt: string;

  // Legacy aggregate fields — empty until SBA tasks land.
  level?: "core" | "elective";
  paper?: string;
  predictedNextTerm?: number;
  currentAverage?: number;
  trend?: "up" | "down" | "flat";
  termAverages?: { term: string; mark: number }[];
  topics?: { name: string; mastery: number }[];
  upcomingSBA?: number;
};

export type Curriculum = {
  id: string;
  name: string;
  shortName: string;
  description?: string | null;
};

export type CatalogSubject = {
  id: string;
  curriculumSubjectId: number;
  code: string;
  name: string;
  category: string;
  languageType?: string | null;
  description?: string | null;
  isCompulsory: boolean;
};

export type AcademicProfile = {
  firstName: string;
  lastName: string;
  // Read-only: identifies the account and is the password-reset channel.
  // The update endpoint does not accept it.
  email: string | null;
  curriculumId: string | null;
  grade: number | null;
  school: string | null;
  // "highschool" (CAPS catalog) | "tertiary" (institution courses).
  // Chosen at signup; decides where subjects/courses come from.
  educationLevel: "highschool" | "tertiary";
  // Tertiary only: the institution picked at signup.
  institutionId: string | null;
};

// A recognised SA tertiary institution (signup picker + course scoping).
export type Institution = {
  id: string;
  name: string;
  shortName: string | null;
  type: string; // university | university_of_technology | comprehensive_university | tvet | private_college
  province: string | null;
};

// A tertiary student's enrolled course. `practiceKey` is the id practice
// generation + mastery key on (institution-scoped). Named EnrolledCourse to
// avoid clashing with the legacy marketplace `Course` type below.
// A tertiary study level, in ascending order. Feeds AI question difficulty.
export type CourseLevel =
  | "first_year"
  | "second_year"
  | "third_year"
  | "fourth_year"
  | "honours"
  | "masters"
  | "phd";

// Display labels for each level, and the order to offer them in.
export const COURSE_LEVELS: { value: CourseLevel; label: string }[] = [
  { value: "first_year", label: "First year" },
  { value: "second_year", label: "Second year" },
  { value: "third_year", label: "Third year" },
  { value: "fourth_year", label: "Fourth year" },
  { value: "honours", label: "Honours" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
];

export type EnrolledCourse = {
  id: string; // student_course id
  courseId: number;
  practiceKey: string; // "institutionId:slug"
  institutionId: string;
  name: string;
  code: string | null;
  lecturer: string | null;
  createdAt: string;
  // Study level (first_year..fourth_year, honours, masters, phd). Set at
  // enrolment; pitches AI practice generation. Null on older courses.
  level?: CourseLevel | null;
  // How many semesters the course runs (null = ongoing / set before durations
  // existed). finishesOn is the computed end; isFinished is the flag the
  // analytics past-vs-active split reads.
  durationSemesters?: number | null;
  finishesOn?: string | null;
  isFinished?: boolean;
};

export type AssessmentType =
  // CAPS / high-school flavoured
  | "test"
  | "essay"
  | "investigation"
  | "practical"
  | "exam"
  | "project"
  | "oral"
  // University flavoured
  | "assignment"
  | "tutorial"
  | "lab_report"
  | "class_test"
  | "midterm"
  | "presentation";

export type AssessmentStatus = "scheduled" | "in_progress" | "submitted" | "graded";

export type AssessmentTask = {
  label: string;
  done: boolean;
};

export type Assessment = {
  id: string;
  subjectId: string;
  title: string;
  type: AssessmentType;
  weight: number;
  dueDate: string;
  status: AssessmentStatus;
  predictedMark?: number | null;
  actualMark?: number | null;
  notes?: string | null;
  createdAt?: string;
  tasks?: AssessmentTask[];
};

// The CAPS set high-school students choose from. `ASSESSMENT_TYPES` stays an
// alias of this so any existing consumer keeps its current behaviour.
export const CAPS_ASSESSMENT_TYPES: AssessmentType[] = [
  "test",
  "essay",
  "investigation",
  "practical",
  "exam",
  "project",
  "oral",
];

// The university set tertiary students choose from. Deliberately drops the
// CAPS-specific "investigation" and "oral", and leads with the coursework a
// semester actually runs on.
export const TERTIARY_ASSESSMENT_TYPES: AssessmentType[] = [
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
];

export const ASSESSMENT_TYPES: AssessmentType[] = CAPS_ASSESSMENT_TYPES;

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  test: "Test",
  essay: "Essay",
  investigation: "Investigation",
  practical: "Practical",
  exam: "Exam",
  project: "Project",
  oral: "Oral",
  assignment: "Assignment",
  tutorial: "Tutorial",
  lab_report: "Lab report",
  class_test: "Class test",
  midterm: "Midterm",
  presentation: "Presentation",
};

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  submitted: "Submitted",
  graded: "Graded",
};

// What a goal is checked against. Everything except "custom" is measured by
// the server from work the student actually did, so the client must not offer
// to edit their progress.
export type GoalKind =
  | "custom"
  | "practice_tests"
  | "practice_score"
  | "topic_mastery"
  | "assessment_mark"
  | "checkin_streak"
  | "practice_streak";

export type Goal = {
  id: string;
  subjectId?: string;
  title: string;
  description: string;
  /** Generated server-side from kind + targetValue. Never sent on create. */
  target: string;
  progress: number;
  status: "active" | "completed" | "verified" | "at_risk";
  dueDate: string;
  category: "academic" | "wellbeing" | "habit" | "career";
  reward?: string;

  kind: GoalKind;
  targetValue?: number | null;
  currentValue: number;
  topicFilter?: string | null;
  /**
   * Before the goal verifies this is a projection (the floor for landing
   * exactly on target). After it verifies it is the figure actually paid,
   * settled against the gain over baseline. Always 0 when `rewarded` is false.
   */
  rewardPoints: number;
  achievedAt?: string | null;
  /**
   * Where the student stood when they set the goal, in targetValue's unit.
   * Points are paid on the distance past this, so a target without it is
   * unreadable. Null for kinds with no baseline (custom, streaks, counts).
   */
  baselineValue?: number | null;
  /** "foundation" | "core" | "challenge". Set at verification; the multiplier. */
  achievedDifficulty?: string | null;
  /** The assessment this goal is preparing for, when there is one. */
  assessmentId?: number | null;
  /** False only for "custom". Gates the manual progress control. */
  autoVerified: boolean;
  /**
   * Whether this kind pays points at all. Measurable and rewarded are
   * different questions: a streak is checked but pays nothing. Server-stated
   * so the UI never implies a payout that never arrives.
   */
  rewarded: boolean;
};

/**
 * What a goal of a given shape would be measured against, asked before it
 * exists. The server rejects a rewarded target at or below the baseline, so
 * the dialog shows this next to the target input rather than letting the
 * student meet that error blind.
 */
export type GoalBaseline = {
  kind: GoalKind;
  rewarded: boolean;
  baseline?: number | null;
  /** Lowest target the server will accept: baseline + 1. */
  minimumTarget?: number | null;
  /** What the supplied target would pay at minimum. Null if no target sent. */
  projectedPoints?: number | null;
};

export type StudentPoints = {
  studentId: string;
  balance: number;
  totalEarned: number;
  level: number;
  rank: string;
  pointsIntoLevel: number;
  pointsPerLevel: number;
  checkinStreakDays: number;
  practiceStreakDays: number;
  goalsVerified: number;
  testsSubmitted: number;
};

export type PointsEntry = {
  id: string;
  points: number;
  description: string;
  source: string;
  date: string;
};

export type Achievement = {
  code: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  target: number;
};

/**
 * A metered feature a reward can top up. Matches the server's PlanQuota keys,
 * which is what makes a redeemed reward genuinely live: the usage meter adds
 * active grants to the plan limit.
 */
export type QuotaKey = "ai.deep" | "ai.quick" | "practice.generate";

/**
 * Something points can buy: a time-boxed top-up on a metered feature. The
 * catalogue is fixed server-side because each entry is joined to a quota the
 * meter actually enforces.
 */
export type Reward = {
  code: string;
  title: string;
  description: string;
  quotaKey: QuotaKey;
  /** Added on top of the plan's monthly limit while the grant is live. */
  bonus: number;
  /** How long the top-up lasts, in days. */
  days: number;
  costPoints: number;
  /** Server-computed, so a disabled button and a 400 can never disagree. */
  affordable: boolean;
};

/** A top-up the student is currently holding. */
export type Grant = {
  id: string;
  rewardCode: string;
  title: string;
  quotaKey: QuotaKey;
  bonus: number;
  pointsSpent: number;
  grantedAt: string;
  expiresAt: string;
};

export type PracticeTest = {
  id: string;
  subjectId: string;
  title: string;
  // Content format. Absent/"multiple_choice" is the classic MC test.
  format?: "multiple_choice" | "short_answer" | "reading" | "flashcards" | "essay" | "exam";
  topics: string[];
  questionCount: number;
  difficulty: "foundation" | "core" | "challenge";
  durationMinutes: number;
  // Reading passage (reading) / essay prompt + marking criteria (essay).
  passage?: string | null;
  prompt?: string | null;
  criteria?: string[];
  bestScore?: number;
  attempts: number;
  // The assessment this test was generated for. Null on seeded/teacher-authored
  // tests and on anything generated before practice was tied to an assessment.
  assessmentId?: string | null;
  aiGenerated: boolean;
};

// Student-facing tutor discovery. Real data comes from GET /api/marketplace/tutors
// (a join of marketplace.tutors + the tutor's identity user). Id is the tutor's
// identity user id, which connect/review actions key on.
export type Tutor = {
  id: string;
  name: string;
  subjects: string[];
  qualification: string;
  specialization: string;
  bio: string;
  yearsOfExperience: number;
  teachingStyle: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  // Who the tutor is, so a learner can judge fit at a glance.
  tutorKind?: "university_student" | "graduate" | "completed_matric";
  institution?: string;
  studyingToward?: string;
  matricYear?: number | null;
  // True when the platform has floated this tutor up the list.
  featured?: boolean;
};

export type Course = {
  id: string;
  title: string;
  tutorId: string;
  subjectId: string;
  duration: string;
  lessons: number;
  rating: number;
  enrolled: number;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  thumbnail?: string;
};

export type DiaryEntry = {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  content: string;
  tags: string[];
};

// Snapshot for the Wellbeing landing — read from /api/wellbeing/summary.
// All fields are zero / "none" for a brand-new account; the UI checks
// hasData() and renders the empty-state CTA when nothing has been logged.
export type WellbeingSummary = {
  moodAvg7d: number;          // 0 when no check-ins; 1.0–5.0 otherwise
  checkinStreakDays: number;
  stressSignal: "none" | "low" | "moderate" | "high";
  sleepHours: number;         // average per night over the last 7 days
};

// One day of the mood trend chart. The API returns an empty array for
// users with no check-ins; the chart degrades to its empty state.
export type MoodPoint = {
  date: string;   // ISO date
  mood: number;   // 1.0–5.0
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "celebration" | "reminder" | "alert" | "info";
  read: boolean;
};


export type StudyGroup = {
  id: string;
  name: string;
  subjectId: string;
  members: number;
  // Owner-set ceiling on membership; join is refused at capacity.
  memberCapacity: number;
  privacy: "open" | "invite";
  description: string;
  nextSession?: string;
  // Shared tasks not yet ticked off.
  openTasks: number;
  // The viewer's standing in the group: "owner" | "admin" | "member" | ""
  // (empty when not a member).
  role: "owner" | "admin" | "member" | "";
  isMember: boolean;
  isOwner: boolean;
  // True when the viewer can moderate (owner or admin).
  canManage: boolean;
  // True when the viewer may add a shared task (subject to the group's
  // tasksWhoCanAdd preference).
  canAddTasks: boolean;
  // True when members has reached memberCapacity.
  isFull: boolean;
  // Group preferences (owner-set).
  tasksWhoCanAdd: "everyone" | "admins";
  notifyOnNewTask: boolean;
  autoSyncTasks: boolean;
};

// One person on a group's roster, with what the viewer is allowed to do to them.
export type StudyGroupMember = {
  userId: string;
  name: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
  isYou: boolean;
  canRemove: boolean;
  canPromote: boolean;
};

// A shared task on a group's board. Everyone is notified when one is added, and
// a dated task can be synced into a member's own upcoming list.
export type StudyGroupTask = {
  id: string;
  title: string;
  notes: string;
  dueDate: string | null;
  done: boolean;
  createdBy: string;
  isMine: boolean;
  // Whether the viewer has this task on their own calendar.
  synced: boolean;
  // Whether the viewer may delete it (author or a moderator).
  canManage: boolean;
};

export type University = {
  id: string;
  name: string;
  city: string;
  apsCutoffs: { course: string; aps: number }[];
  applicationDeadline: string;
  applicationFee: number;
};

export type Career = {
  id: string;
  title: string;
  field: string;
  averageSalary: string;
  growth: "high" | "medium" | "low";
  requirements: string[];
  matchScore: number;
};

export type LiveActivity = {
  id: string;
  studentId: string;
  student: string;
  action: string;
  subject?: string;
  detail?: string;
  ts: string;
};

export type ClassRecord = {
  id: string;
  name: string;
  grade: 11 | 12;
  subject: string;
  studentCount: number;
  averageMastery: number;
  trend: number; // pp this term
  strugglingTopics: string[];
};

// A child a parent covers, or could cover. Shape returned by
// GET /api/entitlements/children. planCode is the child's current coverage
// tier ("student.pro" | "student.max") or "none" when not yet covered.
export type ChildCoveragePlan = "student.pro" | "student.max" | "none";

export type Child = {
  id: string;
  studentUserId: string;
  name: string;
  email: string;
  planCode: ChildCoveragePlan;
  covered: boolean;
  // Wellbeing / analytics fields are not wired to real data yet, so they are
  // optional and absent on the live coverage endpoint.
  grade?: 11 | 12;
  school?: string;
  weeklyMinutes?: number;
  predictedAverage?: number;
  trend?: number;
  isStudyingNow?: boolean;
  currentActivity?: string;
  moodAvg?: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
};

