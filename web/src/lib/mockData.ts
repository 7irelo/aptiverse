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
export type EnrolledCourse = {
  id: string; // student_course id
  courseId: number;
  practiceKey: string; // "institutionId:slug"
  institutionId: string;
  name: string;
  code: string | null;
  lecturer: string | null;
  createdAt: string;
};

export type AssessmentType =
  | "test"
  | "essay"
  | "investigation"
  | "practical"
  | "exam"
  | "project"
  | "oral";

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

export const ASSESSMENT_TYPES: AssessmentType[] = [
  "test",
  "essay",
  "investigation",
  "practical",
  "exam",
  "project",
  "oral",
];

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  test: "Test",
  essay: "Essay",
  investigation: "Investigation",
  practical: "Practical",
  exam: "Exam",
  project: "Project",
  oral: "Oral",
};

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  submitted: "Submitted",
  graded: "Graded",
};

export type Goal = {
  id: string;
  subjectId?: string;
  title: string;
  description: string;
  target: string;
  progress: number;
  status: "active" | "completed" | "verified" | "at_risk";
  dueDate: string;
  category: "academic" | "wellbeing" | "habit" | "career";
  reward?: string;
};

export type PracticeTest = {
  id: string;
  subjectId: string;
  title: string;
  // Content format. Absent/"multiple_choice" is the classic MC test.
  format?: "multiple_choice" | "short_answer" | "reading" | "flashcards" | "essay";
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
  alignedSBA?: string;
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

export type Reward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: "course" | "tutor" | "feature" | "badge" | "experience";
  imageColor: string;
  available: boolean;
};

export type StudyGroup = {
  id: string;
  name: string;
  subjectId: string;
  members: number;
  privacy: "open" | "invite";
  description: string;
  nextSession?: string;
  isMember: boolean;
  isOwner: boolean;
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

export type Child = {
  id: string;
  name: string;
  grade: 11 | 12;
  school: string;
  weeklyMinutes: number;
  predictedAverage: number;
  trend: number;
  isStudyingNow: boolean;
  currentActivity?: string;
  moodAvg: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
};

