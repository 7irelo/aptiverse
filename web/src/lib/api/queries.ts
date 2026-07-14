"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, openEventStream, ApiError } from "@/lib/api/fetcher";
import {
  type Assessment,
  type Goal,
  type Subject,
  type PracticeTest,
  type Tutor,
  type Child,
  type ClassRecord,
  type Notification,
  type DiaryEntry,
  type WellbeingSummary,
  type MoodPoint,
  type Reward,
  type Career,
  type StudyGroup,
  type Curriculum,
  type CatalogSubject,
  type AcademicProfile,
  type Institution,
  type EnrolledCourse,
} from "@/lib/mockData";

export type Counsellor = {
  id: string;
  name: string;
  title: string;
  specialisation: string;
  rating: number;
  online: boolean;
  avatarColor: string;
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

export type Gap = {
  topic: string;
  className: string;
  strugglingPct: number;
  sample: number;
};

export type DifferentiationTier = {
  label: string;
  count: number;
  suggestion: string;
};

export type Verification = {
  id: string;
  student: string;
  goal: string;
  value: string;
  date: string;
  reward: string;
};

export type Milestone = {
  id: string;
  goalId: string;
  title: string;
  description: string;
  priority: number;
  isCompleted: boolean;
  rewardPoints: number;
};

export type AuditLog = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  resource: string;
  ip: string;
  severity: string;
};

export type ModerationFlag = {
  id: string;
  reason: string;
  target: string;
  reporter: string;
  excerpt: string;
  severity: string;
  createdAt: string;
};

export type FeatureFlag = {
  key: string;
  description: string;
  enabled: boolean;
  rollout: number;
  env: string;
};

export type SchoolEnquiry = {
  id: string;
  schoolName: string;
  contactName: string;
  contactRole?: string | null;
  email: string;
  phone?: string | null;
  province?: string | null;
  city?: string | null;
  curricula?: string | null;     // CSV of nsc/ieb/cambridge
  learnerCount?: string | null;
  stage?: string | null;
  notes?: string | null;
  submittedAt: string;
  contacted: boolean;
  contactedAt?: string | null;
};

// Mock fetch with delay so loading states render properly. Used only by
// hooks that haven't been wired to the real API yet — convert per page.
const fakeFetch = <T>(value: T, ms = 350): Promise<T> =>
  new Promise((res) => setTimeout(() => res(value), ms));

export const queryKeys = {
  subjects: () => ["subjects"] as const,
  subject: (id: string) => ["subject", id] as const,
  assessments: () => ["assessments"] as const,
  assessment: (id: string) => ["assessment", id] as const,
  goals: () => ["goals"] as const,
  practiceTests: () => ["practice-tests"] as const,
  practiceTest: (id: string) => ["practice-test", id] as const,
  topicMastery: (subjectId?: string) => ["mastery", "topics", subjectId ?? "all"] as const,
  termPredictions: () => ["mastery", "predictions"] as const,
  tutors: () => ["tutors"] as const,
  tutor: (id: string) => ["tutor", id] as const,
  tutorConnections: () => ["tutor", "connections"] as const,
  tutorReviews: () => ["tutor", "reviews"] as const,
  children: () => ["children"] as const,
  classes: () => ["classes"] as const,
  notifications: () => ["notifications"] as const,
  pastPapers: () => ["past-papers"] as const,
  diary: () => ["diary"] as const,
  counsellors: () => ["counsellors"] as const,
  rewards: () => ["rewards"] as const,
  careers: () => ["careers"] as const,
  tutorConversations: () => ["ai", "conversations"] as const,
  tutorConversation: (id: string) => ["ai", "conversation", id] as const,
  studyGroups: () => ["study-groups"] as const,
  liveActivity: () => ["live-activity"] as const,
  gaps: () => ["gaps"] as const,
  differentiation: () => ["differentiation"] as const,
  verifications: () => ["verifications"] as const,
  goalMilestones: (goalId: string) => ["goal-milestones", goalId] as const,
  auditLogs: () => ["audit-logs"] as const,
  moderationQueue: () => ["moderation-queue"] as const,
  featureFlags: () => ["feature-flags"] as const,
  curricula: () => ["curricula"] as const,
  curriculumSubjects: (curriculumId: string) => ["curriculum-subjects", curriculumId] as const,
  academicProfile: () => ["academic-profile"] as const,
  institutions: (type?: string) => ["institutions", type ?? "all"] as const,
  courses: () => ["courses"] as const,
  institutionCourses: (institutionId: string) => ["institution-courses", institutionId] as const,
  schoolEnquiries: (contacted?: boolean) =>
    contacted === undefined
      ? (["school-enquiries"] as const)
      : (["school-enquiries", contacted] as const),
  plans: () => ["entitlements", "plans"] as const,
  wellbeingSummary: () => ["wellbeing", "summary"] as const,
  moodTrend: (days: number) => ["wellbeing", "mood-trend", days] as const,
  assessmentUploads: (assessmentId: string) => ["assessment-uploads", assessmentId] as const,
};

export const useSubjects = () =>
  useQuery<Subject[]>({
    queryKey: queryKeys.subjects(),
    queryFn: () => apiClient.get<Subject[]>("/api/academic-planning/subjects"),
  });

export const useSubject = (id: string) =>
  useQuery<Subject>({
    queryKey: queryKeys.subject(id),
    queryFn: () => apiClient.get<Subject>(`/api/academic-planning/subjects/${id}`),
    enabled: !!id,
  });

// --- Curriculum catalog + per-student profile ---------------------------

export const useCurricula = () =>
  useQuery<Curriculum[]>({
    queryKey: queryKeys.curricula(),
    queryFn: () => apiClient.get<Curriculum[]>("/api/academic-planning/curricula"),
  });

export const useCurriculumSubjects = (curriculumId: string | null | undefined) =>
  useQuery<CatalogSubject[]>({
    queryKey: queryKeys.curriculumSubjects(curriculumId ?? ""),
    queryFn: () =>
      apiClient.get<CatalogSubject[]>(`/api/academic-planning/curricula/${curriculumId}/subjects`),
    enabled: !!curriculumId,
  });

export const useAcademicProfile = () =>
  useQuery<AcademicProfile>({
    queryKey: queryKeys.academicProfile(),
    queryFn: () => apiClient.get<AcademicProfile>("/api/academic-planning/me/profile"),
  });

export type UpdateAcademicProfileInput = {
  curriculumId?: string;
  grade?: number;
  school?: string;
  educationLevel?: "highschool" | "tertiary";
  institutionId?: string;
};

export const useUpdateAcademicProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAcademicProfileInput) =>
      apiClient.patch<AcademicProfile>("/api/academic-planning/me/profile", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.academicProfile() });
    },
  });
};

export type AddSubjectInput = {
  curriculumSubjectId: number;
  grade?: number;
  teacher?: string;
};

export const useAddSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddSubjectInput) =>
      apiClient.post<Subject>("/api/academic-planning/subjects", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subjects() });
      void qc.invalidateQueries({ queryKey: queryKeys.academicProfile() });
    },
  });
};

// --- Institutions + courses (tertiary) ---------------------------------

export const useInstitutions = (type?: string) =>
  useQuery<Institution[]>({
    queryKey: queryKeys.institutions(type),
    queryFn: () =>
      apiClient.get<Institution[]>(
        `/api/academic-planning/institutions${type ? `?type=${encodeURIComponent(type)}` : ""}`,
      ),
    staleTime: 1000 * 60 * 60, // institution catalog is static within a session
  });

export const useCourses = () =>
  useQuery<EnrolledCourse[]>({
    queryKey: queryKeys.courses(),
    queryFn: () => apiClient.get<EnrolledCourse[]>("/api/academic-planning/courses"),
  });

// A student's academic units, unified across education levels: high-school
// students bind work to their CAPS subjects, tertiary students to their
// institution courses. Everything that used to assume "subjects" (assessments,
// filters, name resolution) reads this instead. The `id` is what gets stored on
// an assessment's subjectId, a subject slug for high-school, a course
// practiceKey for tertiary. Queries are gated by level so a high-schooler never
// calls the courses endpoint and vice versa.
export type AcademicUnit = { id: string; name: string; kind: "subject" | "course" };

export function useAcademicUnits() {
  const profileQuery = useAcademicProfile();
  const isTertiary = profileQuery.data?.educationLevel === "tertiary";

  const subjectsQuery = useQuery<Subject[]>({
    queryKey: queryKeys.subjects(),
    queryFn: () => apiClient.get<Subject[]>("/api/academic-planning/subjects"),
    enabled: profileQuery.isSuccess && !isTertiary,
  });
  const coursesQuery = useQuery<EnrolledCourse[]>({
    queryKey: queryKeys.courses(),
    queryFn: () => apiClient.get<EnrolledCourse[]>("/api/academic-planning/courses"),
    enabled: profileQuery.isSuccess && isTertiary,
  });

  const units: AcademicUnit[] = isTertiary
    ? (coursesQuery.data ?? []).map((c) => ({ id: c.practiceKey, name: c.name, kind: "course" as const }))
    : (subjectsQuery.data ?? []).map((s) => ({ id: s.subjectId, name: s.name, kind: "subject" as const }));

  return {
    units,
    isTertiary,
    // Singular/plural nouns + the page to add more, so shared UI reads correctly.
    unitNoun: isTertiary ? "course" : "subject",
    unitNounPlural: isTertiary ? "courses" : "subjects",
    addHref: isTertiary ? "/dashboard/courses" : "/dashboard/subjects",
    isLoading: profileQuery.isLoading || (isTertiary ? coursesQuery.isLoading : subjectsQuery.isLoading),
    isReady: profileQuery.isSuccess && (isTertiary ? coursesQuery.isSuccess : subjectsQuery.isSuccess),
    nameFor: (id: string | null | undefined) =>
      id ? units.find((u) => u.id === id)?.name : undefined,
  };
}

export type UnitSignal = {
  // Soonest not-yet-graded assessment for this unit, or null.
  nextAssessment: Assessment | null;
  // Weighted average of graded marks (TermPrediction.currentTerm), or null when
  // nothing has been graded. Never fabricated.
  currentMark: number | null;
  predictedMark: number | null;
  // Average topic mastery + how many topics have been practised, or null.
  mastery: { avg: number; topics: number } | null;
};

// Real per-unit academic signal, composed from the student's assessments, term
// predictions, and topic mastery. Keyed by unit id (subject slug for
// high-school, course practiceKey for tertiary), so one hook serves both. Every
// field is best-effort: a unit with no graded work has null marks/mastery
// rather than an invented number. This replaces the empty legacy aggregate
// fields on the Subject payload that made cards read as "-".
export function useAcademicSignals() {
  const assessmentsQuery = useAssessments();
  const predictionsQuery = useTermPredictions();
  const masteryQuery = useTopicMastery();

  const assessments = assessmentsQuery.data ?? [];
  const predictions = predictionsQuery.data ?? [];
  const mastery = masteryQuery.data ?? [];

  // "Upcoming" keeps today's still-due items (grace of one day) and sorts soonest first.
  const cutoff = Date.now() - 86_400_000;
  const upcoming = assessments
    .filter((a) => a.status !== "graded" && Number(new Date(a.dueDate)) >= cutoff)
    .sort((a, b) => Number(new Date(a.dueDate)) - Number(new Date(b.dueDate)));

  const signalsFor = (unitId: string): UnitSignal => {
    const prediction = predictions.find((p) => p.subjectId === unitId);
    const topics = mastery.filter((m) => m.subjectId === unitId);
    return {
      nextAssessment: upcoming.find((a) => a.subjectId === unitId) ?? null,
      currentMark: prediction && prediction.currentTerm > 0 ? Math.round(prediction.currentTerm) : null,
      predictedMark:
        prediction && prediction.predictedNextTerm > 0 ? Math.round(prediction.predictedNextTerm) : null,
      mastery: topics.length
        ? {
            avg: Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length),
            topics: topics.length,
          }
        : null,
    };
  };

  const marked = predictions.filter((p) => p.currentTerm > 0);

  return {
    signalsFor,
    nextAssessmentOverall: upcoming[0] ?? null,
    upcomingCount: upcoming.length,
    // Average current mark across units that actually have graded work.
    avgCurrentMark: marked.length
      ? Math.round(marked.reduce((s, p) => s + p.currentTerm, 0) / marked.length)
      : null,
    topicsPracticed: mastery.length,
    isLoading: assessmentsQuery.isLoading,
  };
}

export type AddCourseInput = { name: string; code?: string; lecturer?: string };

export const useAddCourse = () => {
  const qc = useQueryClient();
  return useMutation<EnrolledCourse, ApiError, AddCourseInput>({
    mutationFn: (input) => apiClient.post<EnrolledCourse>("/api/academic-planning/courses", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses() });
    },
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.delete<void>(`/api/academic-planning/courses/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses() });
    },
  });
};

// --- Admin: school enquiries (sales pipeline) ---------------------------

export const useSchoolEnquiries = (contacted?: boolean) =>
  useQuery<SchoolEnquiry[]>({
    queryKey: queryKeys.schoolEnquiries(contacted),
    queryFn: () => {
      const qs = contacted === undefined ? "" : `?contacted=${contacted}`;
      return apiClient.get<SchoolEnquiry[]>(`/api/sales/school-enquiries${qs}`);
    },
  });

export const useMarkEnquiryContacted = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<void>(`/api/sales/school-enquiries/${id}/mark-contacted`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["school-enquiries"] });
    },
  });
};

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/api/academic-planning/subjects/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.subjects() });
    },
  });
};

// --- Assessments (SBA tasks) -------------------------------------------

export type CreateAssessmentInput = {
  subjectId: string;
  title: string;
  type: Assessment["type"];
  weight: number;
  dueDate: string;
  status?: Assessment["status"];
  predictedMark?: number | null;
  actualMark?: number | null;
  notes?: string;
};

export type UpdateAssessmentInput = Partial<CreateAssessmentInput> & {
  // Send a full task list to replace what's stored; omit to leave
  // tasks untouched. Send [] to clear.
  tasks?: { label: string; done: boolean }[];
};

// Refresh the navbar bell after any mutation whose server-side handler
// can enqueue a notification (assessment submit, goal completion). The
// producer is selective server-side, so we always invalidate — at most
// one extra cheap unread-count round-trip per mutation.
const invalidateNotifications = (qc: ReturnType<typeof useQueryClient>) => {
  void qc.invalidateQueries({ queryKey: queryKeys.notifications() });
  void qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
};

export const useCreateAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssessmentInput) =>
      apiClient.post<Assessment>("/api/academic-planning/assessments", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.assessments() });
    },
  });
};

export const useUpdateAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateAssessmentInput & { id: string }) =>
      apiClient.patch<Assessment>(`/api/academic-planning/assessments/${id}`, patch),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: queryKeys.assessments() });
      void qc.invalidateQueries({ queryKey: queryKeys.assessment(vars.id) });
      // Server fires a "Draft submitted" notification on the transition
      // into submitted; refresh the bell so the user sees it without a
      // page reload.
      invalidateNotifications(qc);
    },
  });
};

// --- Assessment uploads (photos of working, reference PDFs, etc.) ------

export type AssessmentUpload = {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
};

export const useAssessmentUploads = (assessmentId: string) =>
  useQuery<AssessmentUpload[]>({
    queryKey: queryKeys.assessmentUploads(assessmentId),
    queryFn: () =>
      apiClient.get<AssessmentUpload[]>(
        `/api/academic-planning/assessments/${assessmentId}/uploads`,
      ),
    enabled: !!assessmentId,
  });

// Multipart upload of a single file. Bypasses apiClient because we
// need FormData not JSON, but reuses the same NextAuth session token
// the rest of the app reads.
export const useUploadAssessmentFile = (assessmentId: string) => {
  const qc = useQueryClient();
  return useMutation<AssessmentUpload, Error, File>({
    mutationFn: async (file) => {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const token = (session as { accessToken?: string } | null)?.accessToken;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

      const fd = new FormData();
      fd.append("file", file);

      const r = await fetch(
        `${baseUrl}/api/academic-planning/assessments/${assessmentId}/uploads`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        },
      );
      if (!r.ok) {
        const text = await r.text();
        throw new Error(text || `Upload failed (${r.status})`);
      }
      return (await r.json()) as AssessmentUpload;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.assessmentUploads(assessmentId) });
    },
  });
};

export const useDeleteAssessmentUpload = (assessmentId: string) => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (uploadId) =>
      apiClient.delete(
        `/api/academic-planning/assessments/${assessmentId}/uploads/${uploadId}`,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.assessmentUploads(assessmentId) });
    },
  });
};

export const useDeleteAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/api/academic-planning/assessments/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.assessments() });
    },
  });
};

export const useAssessments = () =>
  useQuery<Assessment[]>({
    queryKey: queryKeys.assessments(),
    queryFn: () => apiClient.get<Assessment[]>("/api/academic-planning/assessments"),
  });

export const useAssessment = (id: string) =>
  useQuery<Assessment>({
    queryKey: queryKeys.assessment(id),
    queryFn: () => apiClient.get<Assessment>(`/api/academic-planning/assessments/${id}`),
    enabled: !!id,
  });

export const useGoals = () =>
  useQuery<Goal[]>({
    queryKey: queryKeys.goals(),
    queryFn: () => apiClient.get<Goal[]>("/api/goals"),
  });

export type CreateGoalInput = {
  title: string;
  description?: string;
  target?: string;
  category?: Goal["category"];
  subjectId?: string | null;
  reward?: string;
  dueDate?: string;
};

export const useCreateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => apiClient.post<Goal>("/api/goals", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.goals() });
    },
  });
};

export const useUpdateGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Goal> & { id: string }) =>
      apiClient.patch<Goal>(`/api/goals/${id}`, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.goals() });
      // Server fires a celebration notification when this PATCH pushes
      // progress across the 100% line.
      invalidateNotifications(qc);
    },
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/api/goals/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.goals() });
    },
  });
};

// Persist a drag-to-reorder of the student's goals. The array of goal ids, in
// their new order, becomes the server-side SortOrder so the priority sticks.
export const useReorderGoals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goalIds: string[]) =>
      apiClient.patch<void>("/api/goals/reorder", { goalIds }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.goals() });
    },
  });
};

export const usePracticeTests = () =>
  useQuery<PracticeTest[]>({
    queryKey: queryKeys.practiceTests(),
    queryFn: () => apiClient.get<PracticeTest[]>("/api/practice/tests"),
  });

export const usePracticeTest = (id: string) =>
  useQuery<PracticeTest>({
    queryKey: queryKeys.practiceTest(id),
    queryFn: () => apiClient.get<PracticeTest>(`/api/practice/tests/${id}`),
    enabled: !!id,
  });

// ── Practice test-taking flow ─────────────────────────────────────────
// The runner loads questions, starts an attempt, then PATCHes it with
// per-question answers + timing. The submit writes AttemptScoreSummary
// (per-topic correctness) server-side, which is exactly what the Mastery
// engine reads — so a submitted attempt feeds topic-mastery + predictions.

export type PracticeQuestionKind = "mc" | "short" | "flashcard";

export type PracticeQuestion = {
  id: string;
  question: string;
  // How the question is taken + marked. Absent/"mc" is multiple choice.
  kind?: PracticeQuestionKind;
  options: string[];
  answerIdx: number;
  // Short-answer key (typed answer marked by normalized match).
  expectedAnswer?: string | null;
  acceptableAnswers?: string[];
  // Flashcard back (answer / definition); front is `question`.
  back?: string | null;
  explanation?: string | null;
  topic?: string | null;
};

export type PracticeTopicScore = {
  topic: string;
  correct: number;
  total: number;
  percent: number;
};

export type PracticeScoreSummary = {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercent: number;
  totalTimeMs: number;
  perTopic: PracticeTopicScore[];
};

export type PracticeAnswerItem = {
  questionId: string;
  selectedIdx: number;
  // Typed response for short-answer / reading short questions. Null for MC.
  textAnswer?: string | null;
  timeMs: number;
};

export type PracticeAttemptResult = {
  id: string;
  testId: string;
  studentId: string;
  status: string;
  startedAt: string;
  submittedAt?: string | null;
  score?: number | null;
  answers: number[];
  answerItems: PracticeAnswerItem[];
  summary?: PracticeScoreSummary | null;
};

export const usePracticeQuestions = (testId: string) =>
  useQuery<PracticeQuestion[]>({
    queryKey: ["practice-questions", testId],
    queryFn: () =>
      apiClient.get<PracticeQuestion[]>(`/api/practice/tests/${testId}/questions`),
    enabled: !!testId,
    // Questions are stable for a test; don't refetch mid-attempt.
    staleTime: Infinity,
  });

export const useStartAttempt = () =>
  useMutation<PracticeAttemptResult, Error, string>({
    mutationFn: (testId) =>
      apiClient.post<PracticeAttemptResult>(`/api/practice/tests/${testId}/attempts`, {}),
  });

export const useSubmitAttempt = () => {
  const qc = useQueryClient();
  return useMutation<
    PracticeAttemptResult,
    Error,
    { attemptId: string; answerItems: PracticeAnswerItem[]; focusLossCount?: number }
  >({
    mutationFn: ({ attemptId, answerItems, focusLossCount }) =>
      apiClient.patch<PracticeAttemptResult>(`/api/practice/attempts/${attemptId}`, {
        answerItems,
        focusLossCount: focusLossCount ?? 0,
      }),
    onSuccess: () => {
      // A scored attempt moves practice best-scores, mastery, and predictions.
      void qc.invalidateQueries({ queryKey: queryKeys.practiceTests() });
      void qc.invalidateQueries({ queryKey: ["mastery"] });
    },
  });
};

// The student's most recent submitted attempt at a test — used to review a
// completed test (their answers, the correct answers, explanations) without
// retaking it. Returns null when there's no attempt yet, or gracefully when
// the read endpoint isn't deployed (so the UI can fall back).
export const useLatestAttempt = (testId: string, enabled = true) =>
  useQuery<PracticeAttemptResult | null>({
    queryKey: ["practice-latest-attempt", testId],
    queryFn: async () => {
      try {
        return await apiClient.get<PracticeAttemptResult>(
          `/api/practice/tests/${testId}/attempts/latest`,
        );
      } catch {
        return null;
      }
    },
    enabled: enabled && !!testId,
    retry: false,
    staleTime: 60_000,
  });

// Generate a private practice test with Claude. Topics are optional — pass
// the student's weakest (from useTopicMastery) to target them, or omit for a
// general test. Metered server-side by the practice.generate quota; a 402
// ApiError means the monthly allowance is spent.
export type PracticeFormat =
  | "multiple_choice"
  | "short_answer"
  | "reading"
  | "flashcards"
  | "essay";

export type GenerateTestInput = {
  subjectId: string;
  topics?: string[];
  difficulty?: "foundation" | "core" | "challenge";
  questionCount?: number;
  format?: PracticeFormat;
};

export const useGenerateTest = () => {
  const qc = useQueryClient();
  return useMutation<PracticeTest, ApiError, GenerateTestInput>({
    mutationFn: (input) =>
      apiClient.post<PracticeTest>("/api/practice/tests/generate", input),
    onSuccess: (test) => {
      void qc.invalidateQueries({ queryKey: queryKeys.practiceTests() });
      // The generated test is immediately fetchable by id in the runner.
      qc.setQueryData(queryKeys.practiceTest(String(test.id)), test);
    },
  });
};

// Mastery — computed on read by the API from real practice + graded-SBA
// signals (no ML, no fake fields). Both return [] until the student has
// practice attempts / graded assessments, so callers render empty states.
export type TopicMastery = {
  subjectId: string;
  subject: string;
  topic: string;
  mastery: number; // 0-100 cumulative correctness for this topic
  trend: number; // points, latest attempt minus first (+/-)
};

export type TermPrediction = {
  subjectId: string;
  subject: string;
  currentTerm: number; // 0-100 weighted average of graded marks
  predictedNextTerm: number; // 0-100 projection
  confidence: number; // 0-1, grows with evidence
};

export const useTopicMastery = (subjectId?: string) =>
  useQuery<TopicMastery[]>({
    queryKey: queryKeys.topicMastery(subjectId),
    queryFn: () =>
      apiClient.get<TopicMastery[]>(
        `/api/mastery/topic-mastery${subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : ""}`,
      ),
  });

export const useTermPredictions = () =>
  useQuery<TermPrediction[]>({
    queryKey: queryKeys.termPredictions(),
    queryFn: () => apiClient.get<TermPrediction[]>("/api/mastery/predictions"),
  });

export const useTutors = () =>
  useQuery<Tutor[]>({
    queryKey: queryKeys.tutors(),
    queryFn: () => apiClient.get<Tutor[]>("/api/marketplace/tutors"),
  });

export const useTutor = (id: string) =>
  useQuery<Tutor>({
    queryKey: queryKeys.tutor(id),
    queryFn: () => apiClient.get<Tutor>(`/api/marketplace/tutors/${id}`),
    enabled: !!id,
  });

// Public reviews for a specific tutor (student-facing detail page).
export const useTutorReviewsById = (id: string) =>
  useQuery<TutorReview[]>({
    queryKey: ["tutor", "reviews", id],
    queryFn: () => apiClient.get<TutorReview[]>(`/api/marketplace/tutors/${id}/reviews`),
    enabled: !!id,
  });

// The reshaped tutor track: Aptiverse does not facilitate paid sessions or take
// commission. A tutor showcases a profile, connects with students/parents, and
// collects reviews; the tutoring arrangement happens directly, off-platform.
export type TutorConnection = {
  id: string;
  studentId: string;
  student: string;
  subject: string;
  status: "active" | "paused";
  connectedAt: string;
};

export type TutorReview = {
  id: string;
  student: string;
  rating: number;
  body: string;
  when: string;
};

export const useTutorConnections = () =>
  useQuery<TutorConnection[]>({
    queryKey: queryKeys.tutorConnections(),
    queryFn: () => apiClient.get<TutorConnection[]>("/api/booking/connections"),
  });

export const useTutorReviews = () =>
  useQuery<TutorReview[]>({
    queryKey: queryKeys.tutorReviews(),
    queryFn: () => apiClient.get<TutorReview[]>("/api/marketplace/tutor/reviews"),
  });

// Student/parent actions on a tutor. Both notify the tutor server-side (in-app
// always, email gated on the tutor's notification preferences).
export const useConnectWithTutor = () => {
  const qc = useQueryClient();
  return useMutation<TutorConnection, ApiError, { tutorUserId: string; subject?: string }>({
    mutationFn: (body) => apiClient.post<TutorConnection>("/api/booking/connections", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tutorConnections() });
    },
  });
};

export const useCreateTutorReview = () => {
  const qc = useQueryClient();
  return useMutation<TutorReview, ApiError, { tutorUserId: string; rating: number; body?: string }>({
    mutationFn: ({ tutorUserId, ...rest }) =>
      apiClient.post<TutorReview>(`/api/marketplace/tutors/${tutorUserId}/reviews`, rest),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tutorReviews() });
      void qc.invalidateQueries({ queryKey: ["tutor", "reviews", variables.tutorUserId] });
      void qc.invalidateQueries({ queryKey: queryKeys.tutor(variables.tutorUserId) });
    },
  });
};

export type TutorProfile = {
  id: string;
  qualification: string;
  specialization: string;
  bio: string;
  yearsOfExperience: number;
  teachingStyle: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  acceptingStudents: boolean;
  availableDays: string;
  earliestHour: number;
  latestHour: number;
  subjects: string;
  notifyOnConnection: boolean;
  notifyOnReview: boolean;
  weeklySummary: boolean;
};

// The tutor's own public profile. 404s until they set one up; the profile page
// treats a null result as the "not set up yet" empty state.
export const useTutorProfile = () =>
  useQuery<TutorProfile | null>({
    queryKey: ["tutor", "profile"],
    queryFn: async () => {
      try {
        return await apiClient.get<TutorProfile>("/api/marketplace/tutor/me");
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });

export type UpdateTutorProfileInput = {
  qualification?: string;
  specialization?: string;
  bio?: string;
  teachingStyle?: string;
  yearsOfExperience?: number;
  acceptingStudents?: boolean;
  availableDays?: string;
  earliestHour?: number;
  latestHour?: number;
  subjects?: string;
  notifyOnConnection?: boolean;
  notifyOnReview?: boolean;
  weeklySummary?: boolean;
};

// Upsert the tutor's public profile and settings. Rating, review count and
// verification are system-managed and not part of the payload.
export const useUpdateTutorProfile = () => {
  const qc = useQueryClient();
  return useMutation<TutorProfile, ApiError, UpdateTutorProfileInput>({
    mutationFn: (input) => apiClient.put<TutorProfile>("/api/marketplace/tutor/me", input),
    onSuccess: (data) => {
      qc.setQueryData(["tutor", "profile"], data);
    },
  });
};

export const useChangePassword = () =>
  useMutation<void, ApiError, { currentPassword: string; newPassword: string }>({
    mutationFn: (body) => apiClient.post<void>("/api/auth/change-password", body),
  });

export const useDiaryEntries = () =>
  useQuery<DiaryEntry[]>({
    queryKey: queryKeys.diary(),
    queryFn: () => apiClient.get<DiaryEntry[]>("/api/wellbeing/diary"),
  });

export const useCounsellors = () =>
  useQuery<Counsellor[]>({
    queryKey: queryKeys.counsellors(),
    queryFn: () => apiClient.get<Counsellor[]>("/api/wellbeing/counsellors"),
  });

// Wellbeing landing reads its top-row stats from this endpoint. The API
// currently returns zeroes for everyone — the page treats "moodAvg7d
// === 0 && streak === 0" as "no check-ins yet" and shows the first-run
// CTA instead of fake numbers.
export const useWellbeingSummary = () =>
  useQuery<WellbeingSummary>({
    queryKey: queryKeys.wellbeingSummary(),
    queryFn: () => apiClient.get<WellbeingSummary>("/api/wellbeing/summary"),
    staleTime: 60_000,
  });

// 14 days by default — the mood chart's x-axis. Returns [] for accounts
// with no check-ins; the chart degrades to its empty state.
export const useMoodTrend = (days = 14) =>
  useQuery<MoodPoint[]>({
    queryKey: queryKeys.moodTrend(days),
    queryFn: () => apiClient.get<MoodPoint[]>(`/api/wellbeing/mood-trend?days=${days}`),
    staleTime: 60_000,
  });

// ── Wellbeing check-ins (the write path the page was missing) ──────────
// Logging a mood/diary entry is what makes the summary + trend populate.

export type LogMoodInput = {
  mood: number; // 1-5
  stressLevel?: string;
  sleepHours?: number;
  notes?: string;
};

export const useLogMood = () => {
  const qc = useQueryClient();
  return useMutation<MoodPoint, Error, LogMoodInput>({
    mutationFn: (input) => apiClient.post<MoodPoint>("/api/wellbeing/mood", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.wellbeingSummary() });
      void qc.invalidateQueries({ queryKey: ["wellbeing", "mood-trend"] });
    },
  });
};

export type LogDiaryInput = {
  mood: number; // 1-5
  content: string;
  tags?: string[];
};

export const useLogDiary = () => {
  const qc = useQueryClient();
  return useMutation<DiaryEntry, Error, LogDiaryInput>({
    mutationFn: (input) => apiClient.post<DiaryEntry>("/api/wellbeing/diary", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.diary() });
      void qc.invalidateQueries({ queryKey: queryKeys.wellbeingSummary() });
      void qc.invalidateQueries({ queryKey: ["wellbeing", "mood-trend"] });
    },
  });
};

export const useRewards = () =>
  useQuery<Reward[]>({
    queryKey: queryKeys.rewards(),
    queryFn: () => apiClient.get<Reward[]>("/api/goals/rewards"),
  });

// ── AI tutor (the /dashboard/chatbot academic assistant) ───────────────
export type AiChatMessage = { role: "user" | "assistant"; content: string };
export type AiTutorReply = {
  reply: string;
  remaining: number;
  limit: number;
  used: number;
  // Present since deep mode: which quota was charged, and whether the reply
  // ran in deep mode (Opus + extended thinking).
  quotaKey?: string;
  deep?: boolean;
};
export type AiTutorInput = {
  messages: AiChatMessage[];
  deep?: boolean;
  // Who the student is (name, level, enrolled subjects/courses). Injected into
  // the tutor's system prompt server-side so replies are student-aware.
  studentContext?: string;
};

// Sends the running conversation to the tutor endpoint and returns its reply.
// `deep` runs the stronger model with extended thinking (ai.deep quota).
// Throws ApiError on 402 (quota) / 503 (not configured) so the UI can explain.
export const useAiTutor = () =>
  useMutation<AiTutorReply, ApiError, AiTutorInput>({
    mutationFn: ({ messages, deep, studentContext }) =>
      apiClient.post<AiTutorReply>("/api/ai/tutor", {
        messages,
        deep: deep ?? false,
        studentContext: studentContext ?? null,
      }),
  });

// ── AI tutor conversation history (server-backed) ──────────────────────
export type TutorConversationSummary = {
  id: string;
  title: string;
  messageCount: number;
  preview: string;
  updatedAt: string;
};
export type TutorConversation = {
  id: string;
  title: string;
  messages: AiChatMessage[];
  createdAt: string;
  updatedAt: string;
};
export type SaveConversationInput = { title?: string; messages?: AiChatMessage[] };

export const useTutorConversations = () =>
  useQuery<TutorConversationSummary[]>({
    queryKey: queryKeys.tutorConversations(),
    queryFn: () => apiClient.get<TutorConversationSummary[]>("/api/ai/conversations"),
  });

export const useTutorConversation = (id: string | null) =>
  useQuery<TutorConversation>({
    queryKey: queryKeys.tutorConversation(id ?? "none"),
    queryFn: () => apiClient.get<TutorConversation>(`/api/ai/conversations/${id}`),
    enabled: !!id,
  });

export const useCreateTutorConversation = () => {
  const qc = useQueryClient();
  return useMutation<TutorConversation, ApiError, SaveConversationInput>({
    mutationFn: (input) => apiClient.post<TutorConversation>("/api/ai/conversations", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tutorConversations() });
    },
  });
};

export const useSaveTutorConversation = () => {
  const qc = useQueryClient();
  return useMutation<TutorConversation, ApiError, { id: string } & SaveConversationInput>({
    mutationFn: ({ id, ...body }) =>
      apiClient.put<TutorConversation>(`/api/ai/conversations/${id}`, body),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tutorConversations() });
      qc.setQueryData(queryKeys.tutorConversation(data.id), data);
    },
  });
};

export const useDeleteTutorConversation = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.delete<void>(`/api/ai/conversations/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tutorConversations() });
    },
  });
};

export const useCareers = () =>
  useQuery<Career[]>({
    queryKey: queryKeys.careers(),
    queryFn: () => apiClient.get<Career[]>("/api/careers"),
  });

export const useChildren = () =>
  useQuery<Child[]>({
    queryKey: queryKeys.children(),
    queryFn: () => apiClient.get<Child[]>("/api/entitlements/children"),
  });

// --- Parent <-> student links -------------------------------------------
// A parent invites a student by email; the student accepts from their
// Connections hub. Additive link model (identity.parent_links), no change to
// the users table. Parent gets a read-only window onto a linked student.

export type ParentLink = {
  id: string;
  studentEmail: string;
  studentName: string | null;
  studentUserId: string | null;
  status: "pending" | "accepted" | string;
  createdAt: string;
  respondedAt: string | null;
};

export type LinkedParent = {
  id: string;
  parentName: string;
  status: string;
  since: string;
};

export type IncomingParentInvite = {
  id: string;
  token: string;
  parentName: string;
  invitedAt: string;
};

export type StudentOverview = {
  studentUserId: string;
  name: string;
  educationLevel: string;
  upcomingCount: number;
  upcoming: { id: string; title: string; subjectId: string; dueDate: string; status: string }[];
};

// Parent side
export const useMyParentLinks = () =>
  useQuery<ParentLink[]>({
    queryKey: ["parent-links", "mine"],
    queryFn: () => apiClient.get<ParentLink[]>("/api/parent-links/mine"),
  });

export const useInviteStudent = () => {
  const qc = useQueryClient();
  return useMutation<ParentLink, ApiError, { studentEmail: string }>({
    mutationFn: (body) => apiClient.post<ParentLink>("/api/parent-links/invites", body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["parent-links", "mine"] }),
  });
};

export const useRemoveParentLink = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.delete<void>(`/api/parent-links/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["parent-links", "mine"] }),
  });
};

export const useLinkedStudentOverview = (studentUserId: string) =>
  useQuery<StudentOverview>({
    queryKey: ["parent-links", "overview", studentUserId],
    queryFn: () =>
      apiClient.get<StudentOverview>(`/api/parent-links/students/${studentUserId}/overview`),
    enabled: !!studentUserId,
  });

// Student side
export const useIncomingParentInvites = () =>
  useQuery<IncomingParentInvite[]>({
    queryKey: ["parent-links", "incoming"],
    queryFn: () => apiClient.get<IncomingParentInvite[]>("/api/parent-links/invites/incoming"),
  });

export const useLinkedParents = () =>
  useQuery<LinkedParent[]>({
    queryKey: ["parent-links", "parents"],
    queryFn: () => apiClient.get<LinkedParent[]>("/api/parent-links/parents"),
  });

export const useRespondToParentInvite = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { token: string; accept: boolean }>({
    mutationFn: ({ token, accept }) =>
      apiClient.post<void>(`/api/parent-links/invites/${token}/${accept ? "accept" : "decline"}`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["parent-links", "incoming"] });
      void qc.invalidateQueries({ queryKey: ["parent-links", "parents"] });
    },
  });
};

export const useUnlinkParent = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.delete<void>(`/api/parent-links/parents/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["parent-links", "parents"] }),
  });
};

export const useClasses = () =>
  useQuery<ClassRecord[]>({
    queryKey: queryKeys.classes(),
    queryFn: () => apiClient.get<ClassRecord[]>("/api/academic-planning/classes"),
  });

export type AppNotification = Notification & { actionHref?: string | null };

export const useNotifications = (options?: { enabled?: boolean }) =>
  useQuery<AppNotification[]>({
    queryKey: queryKeys.notifications(),
    queryFn: () => apiClient.get<AppNotification[]>("/api/notifications"),
    enabled: options?.enabled,
  });

// Lightweight count for the navbar bell badge. Polled more aggressively
// than the full list — short staleTime + refetch on focus so the badge
// stays current without re-shipping all 50 rows.
export const useUnreadNotificationsCount = () =>
  useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => apiClient.get<{ count: number }>("/api/notifications/unread-count"),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

export type NotificationPreferences = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  studyGroupEmailReminders: boolean;
  wellbeingCheckinReminders: boolean;
  assessmentDueReminders: boolean;
  assessmentDueEmailReminders: boolean;
  weeklyStudySummary: boolean;
};

export const useNotificationPreferences = () =>
  useQuery<NotificationPreferences>({
    queryKey: ["notifications", "preferences"],
    queryFn: () => apiClient.get<NotificationPreferences>("/api/notifications/preferences"),
  });

// Partial patch: send only the toggled field. The server applies just what's
// present and returns the full, updated set.
export const useUpdateNotificationPreferences = () => {
  const qc = useQueryClient();
  return useMutation<NotificationPreferences, ApiError, Partial<NotificationPreferences>>({
    mutationFn: (body) =>
      apiClient.patch<NotificationPreferences>("/api/notifications/preferences", body),
    onSuccess: (data) => qc.setQueryData(["notifications", "preferences"], data),
  });
};

// Mark a single notification as read. Optimistic so the bold + dot
// disappear immediately while the PATCH is in flight.
export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch<void>(`/api/notifications/${id}/read`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications() });
      const previous = qc.getQueryData<AppNotification[]>(queryKeys.notifications());
      qc.setQueryData<AppNotification[]>(queryKeys.notifications(), (rows) =>
        rows?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? rows,
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.notifications(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications() });
      void qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

// Mark every unread as read in one shot — page-header "Mark all read".
export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<{ marked: number }>("/api/notifications/mark-all-read"),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications() });
      const previous = qc.getQueryData<AppNotification[]>(queryKeys.notifications());
      qc.setQueryData<AppNotification[]>(queryKeys.notifications(), (rows) =>
        rows?.map((n) => ({ ...n, read: true })) ?? rows,
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.notifications(), ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications() });
      void qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

export const useStudyGroups = () =>
  useQuery<StudyGroup[]>({
    queryKey: queryKeys.studyGroups(),
    queryFn: () => apiClient.get<StudyGroup[]>("/api/study-groups"),
  });

export type CreateStudyGroupInput = {
  name: string;
  subjectId: string;
  description?: string;
  privacy: "open" | "invite";
};

export const useCreateStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation<StudyGroup, ApiError, CreateStudyGroupInput>({
    mutationFn: (body) => apiClient.post<StudyGroup>("/api/study-groups", body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() }),
  });
};

export const useJoinStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.post<void>(`/api/study-groups/${id}/join`, {}),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() }),
  });
};

export const useLeaveStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.post<void>(`/api/study-groups/${id}/leave`, {}),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() }),
  });
};

export type StudyGroupSession = {
  id: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  location: string;
  canManage: boolean;
};

export const useStudyGroupSessions = (groupId: string, enabled = true) =>
  useQuery<StudyGroupSession[]>({
    queryKey: ["study-groups", groupId, "sessions"],
    queryFn: () => apiClient.get<StudyGroupSession[]>(`/api/study-groups/${groupId}/sessions`),
    enabled: enabled && !!groupId,
  });

export type ScheduleSessionInput = {
  title: string;
  startsAt: string;
  durationMinutes?: number;
  location?: string;
};

export const useScheduleSession = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation<StudyGroupSession, ApiError, ScheduleSessionInput>({
    mutationFn: (body) => apiClient.post<StudyGroupSession>(`/api/study-groups/${groupId}/sessions`, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "sessions"] });
      void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() });
    },
  });
};

export const useCancelSession = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (sessionId) => apiClient.delete<void>(`/api/study-groups/${groupId}/sessions/${sessionId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "sessions"] });
      void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() });
    },
  });
};

export const useLiveActivity = (take = 30) =>
  useQuery<LiveActivity[]>({
    queryKey: [...queryKeys.liveActivity(), take],
    queryFn: () => apiClient.get<LiveActivity[]>(`/api/insights/live-activity?take=${take}`),
  });

/**
 * Subscribes to the live-activity SSE stream and merges pushed events into the
 * `useLiveActivity(take)` query cache, so the feed updates in real time on top
 * of the initial backlog. New items are prepended (newest-first) and de-duped
 * by id; the list is capped so a long-lived stream can't grow unbounded.
 * Aborts the stream on unmount.
 */
export const useLiveActivityStream = (take = 30) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const stop = openEventStream("/api/insights/live-activity/stream", (event, data) => {
      if (event !== "activity") return;
      let item: LiveActivity;
      try {
        item = JSON.parse(data) as LiveActivity;
      } catch {
        return;
      }
      queryClient.setQueryData<LiveActivity[]>(
        [...queryKeys.liveActivity(), take],
        (old) => {
          const list = old ?? [];
          if (list.some((x) => x.id === item.id)) return list;
          return [item, ...list].slice(0, Math.max(take, 50));
        },
      );
    });
    return stop;
  }, [queryClient, take]);
};

export const useGaps = () =>
  useQuery<Gap[]>({
    queryKey: queryKeys.gaps(),
    queryFn: () => apiClient.get<Gap[]>("/api/insights/gaps"),
  });

export const useDifferentiation = () =>
  useQuery<DifferentiationTier[]>({
    queryKey: queryKeys.differentiation(),
    queryFn: () => apiClient.get<DifferentiationTier[]>("/api/insights/differentiation"),
  });

export const useVerifications = () =>
  useQuery<Verification[]>({
    queryKey: queryKeys.verifications(),
    queryFn: () => apiClient.get<Verification[]>("/api/goals/verifications"),
  });

export const useGoalMilestones = (goalId: string) =>
  useQuery<Milestone[]>({
    queryKey: queryKeys.goalMilestones(goalId),
    queryFn: () => apiClient.get<Milestone[]>(`/api/goals/${goalId}/milestones`),
    enabled: !!goalId,
  });

export const reorderGoalMilestones = (goalId: string, milestoneIds: string[]) =>
  apiClient.patch(`/api/goals/${goalId}/milestones/order`, { milestoneIds });

export const useAuditLogs = (take = 60) =>
  useQuery<AuditLog[]>({
    queryKey: [...queryKeys.auditLogs(), take],
    queryFn: () => apiClient.get<AuditLog[]>(`/api/audit/logs?take=${take}`),
  });

export const useModerationQueue = () =>
  useQuery<ModerationFlag[]>({
    queryKey: queryKeys.moderationQueue(),
    queryFn: () => apiClient.get<ModerationFlag[]>("/api/moderation/queue"),
  });

export const useFeatureFlags = () =>
  useQuery<FeatureFlag[]>({
    queryKey: queryKeys.featureFlags(),
    queryFn: () => apiClient.get<FeatureFlag[]>("/api/feature-flags/flags"),
  });

// --- Entitlements catalog (public) --------------------------------------
//
// Mirrors api/Modules/Entitlements/.../EntitlementsController.FrontendPlanDto.
// The catalog endpoint is anonymous so anonymous visitors on /pricing can
// see plan info. Long staleTime — pricing rarely changes, and a stale read
// is harmless (worst case the user sees yesterday's price on the billing
// page, then a refresh fixes it).
export type MembershipDto = {
  subscriptionId: string;
  planCode: string;
  planName: string;
  role: string;
  status: string;
  joinedAt: string;
};

export type UserEntitlementsDto = {
  primaryPlanCode: string;
  features: string[];
  memberships: MembershipDto[];
};

// Live entitlements for the signed-in user. The NextAuth session has a
// snapshot of features + planCode baked into the JWT at login time, but
// it goes stale the moment a plan changes (subscription added, role
// changed, admin gift, etc.). This query is the source of truth for
// "what can this user do right now". The session value is the SSR-safe
// fallback for the first paint.
export const useMyEntitlements = () =>
  useQuery<UserEntitlementsDto>({
    queryKey: ["entitlements", "me"],
    queryFn: () => apiClient.get<UserEntitlementsDto>("/api/entitlements/me"),
    staleTime: 30_000,
    // Refetch on focus so a tab left open picks up plan changes without
    // requiring a hard refresh.
    refetchOnWindowFocus: true,
  });

export type PlanQuotaDto = {
  quotaKey: string;
  perMonth: number; // -1 = unlimited
};

export type PlanDto = {
  code: string;
  name: string;
  description: string | null;
  monthlyPriceZar: number | null;
  annualPriceZar: number | null;
  maxMembers: number;
  kind: string;
  // Marketplace cut (tutor track only). 0.15 / 0.10 / 0; null elsewhere.
  commissionPercent: number | null;
  features: string[];
  quotas: PlanQuotaDto[];
};

export const usePlans = () =>
  useQuery<PlanDto[]>({
    queryKey: queryKeys.plans(),
    queryFn: () => apiClient.get<PlanDto[]>("/api/entitlements/plans"),
    staleTime: 5 * 60_000, // 5 minutes
  });

// --- Navigation (server-driven, entitlement-dependent) ------------------
// Mirrors api/Controllers/NavigationController.NavSectionDto / NavItemDto.
// The sidebar is computed from the signed-in user's real role + live
// features, so it reflects exactly what they can access.
export type NavItemDto = {
  label: string;
  href: string;
  icon: string; // key resolved via components/dashboard/nav-icons
  badge: string | null;
};

export type NavSectionDto = {
  heading: string;
  items: NavItemDto[];
};

export const useNavigation = () =>
  useQuery<NavSectionDto[]>({
    queryKey: ["navigation"],
    queryFn: () => apiClient.get<NavSectionDto[]>("/api/navigation"),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

// --- Billing (the signed-in user's own subscription) --------------------
// Mirrors api/Controllers/PaymentsController.BillingSummaryDto / TransactionDto.
export type BillingSummaryDto = {
  hasSubscription: boolean;
  isOwner: boolean;
  managedByOther: boolean;
  subscriptionId: string | null;
  planCode: string;
  planName: string;
  status: string; // active | past_due | cancelled | ""
  monthlyPriceZar: number | null;
  annualPriceZar: number | null;
  chargeAmountZar: number | null;
  maxMembers: number;
  nextChargeDate: string | null;
  cancelledAt: string | null;
  canManage: boolean;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: number | null;
  cardExpYear: number | null;
  pendingPlanCode: string | null;
  pendingPlanName: string | null;
  changeEffectiveDate: string | null;
};

export type BillingTransactionDto = {
  reference: string;
  amountZar: number;
  currency: string;
  status: string;
  paidAt: string | null;
};

export const useBillingSummary = () =>
  useQuery<BillingSummaryDto>({
    queryKey: ["billing", "subscription"],
    queryFn: () => apiClient.get<BillingSummaryDto>("/api/payments/subscription"),
    staleTime: 30_000,
  });

export const useBillingTransactions = () =>
  useQuery<BillingTransactionDto[]>({
    queryKey: ["billing", "transactions"],
    queryFn: () => apiClient.get<BillingTransactionDto[]>("/api/payments/transactions"),
    staleTime: 60_000,
  });

// Confirms a checkout by its Paystack reference on return from the hosted
// page, activating the subscription server-side (no webhook needed).
export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reference: string) =>
      apiClient.post<{ status: string; planCode?: string }>("/api/payments/verify", { reference }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      qc.invalidateQueries({ queryKey: ["entitlements", "me"] });
    },
  });
};

// Cancels the user's subscription (stops renewal; access stays until the
// paid-through date). Refreshes billing + entitlements after.
export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<{ status: string; validUntil: string | null }>("/api/payments/subscription/cancel"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      qc.invalidateQueries({ queryKey: ["entitlements", "me"] });
    },
  });
};

export type ChangePlanInput = {
  targetPlanCode: string;
  billing?: "monthly" | "annual";
  email?: string;
  callbackUrl?: string;
};

export type ChangePlanResult = {
  mode: "checkout" | "scheduled" | "noop";
  authorizationUrl?: string;
  planCode?: string;
  effectiveDate?: string | null;
};

// Changes plan. Upgrades return mode "checkout" (redirect to Paystack);
// downgrades return mode "scheduled" (takes effect at period end).
export const useChangePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ChangePlanInput) =>
      apiClient.post<ChangePlanResult>("/api/payments/subscription/change", input),
    onSuccess: (res) => {
      // Only invalidate for a scheduled change; a checkout redirects away.
      if (res.mode !== "checkout") {
        qc.invalidateQueries({ queryKey: ["billing"] });
        qc.invalidateQueries({ queryKey: ["entitlements", "me"] });
      }
    },
  });
};

// Cancels a scheduled downgrade before it takes effect.
export const useCancelChange = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<{ status: string; planCode: string }>("/api/payments/subscription/cancel-change"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing"] });
      qc.invalidateQueries({ queryKey: ["entitlements", "me"] });
    },
  });
};
