"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, openEventStream, ApiError } from "@/lib/api/fetcher";
import { studyVocabulary } from "@/lib/study-vocabulary";
import { track } from "@/lib/analytics/events";
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
  type GoalKind,
  type StudentPoints,
  type PointsEntry,
  type Achievement,
  type Reward,
  type Grant,
  type GoalBaseline,
  type Career,
  type StudyGroup,
  type StudyGroupMember,
  type StudyGroupTask,
  type Curriculum,
  type CatalogSubject,
  type AcademicProfile,
  type Institution,
  type EnrolledCourse,
  type CourseLevel,
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

// Mirrors api/Modules/Audit/.../FrontendDtos.cs. One row of the append-only
// trail in audit.audit_logs.
export type AuditLog = {
  id: string;
  ts: string;
  actorId: string;
  actor: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  category: string;
  severity: string;
  entityType: string;
  entityId: string;
  resource: string;
  oldValues: string | null;
  newValues: string | null;
  ip: string;
  service: string;
  correlationId: string;
};

export type AuditLogPage = {
  items: AuditLog[];
  total: number;
  skip: number;
  take: number;
};

export type AuditAction = {
  name: string;
  category: string;
  severity: string;
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
  points: () => ["goals", "points"] as const,
  pointsLedger: () => ["goals", "points", "ledger"] as const,
  achievements: () => ["goals", "achievements"] as const,
  rewards: () => ["goals", "rewards"] as const,
  activeGrants: () => ["goals", "rewards", "active"] as const,
  goalBaseline: (
    kind: string,
    subjectId?: string | null,
    topicFilter?: string | null,
    targetValue?: number | null,
  ) => ["goals", "baseline", kind, subjectId ?? "", topicFilter ?? "", targetValue ?? 0] as const,
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
  auditActions: () => ["audit-actions"] as const,
  adminOverview: () => ["admin", "overview"] as const,
  adminUsers: () => ["admin", "users"] as const,
  adminUser: (id: string) => ["admin", "user", id] as const,
  adminRoles: () => ["admin", "roles"] as const,
  adminSubscriptions: () => ["admin", "subscriptions"] as const,
  adminTutors: () => ["admin", "tutors"] as const,
  adminSystem: () => ["admin", "system"] as const,
  paystackStatus: () => ["admin", "paystack", "status"] as const,
  paystackBalance: () => ["admin", "paystack", "balance"] as const,
  paystackTransactions: () => ["admin", "paystack", "transactions"] as const,
  paystackSettlements: () => ["admin", "paystack", "settlements"] as const,
  paystackCustomer: (q: string) => ["admin", "paystack", "customer", q] as const,
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
    staleTime: 1000 * 60 * 60, // curriculum catalog is static within a session
  });

export const useCurriculumSubjects = (curriculumId: string | null | undefined) =>
  useQuery<CatalogSubject[]>({
    queryKey: queryKeys.curriculumSubjects(curriculumId ?? ""),
    queryFn: () =>
      apiClient.get<CatalogSubject[]>(`/api/academic-planning/curricula/${curriculumId}/subjects`),
    enabled: !!curriculumId,
    staleTime: 1000 * 60 * 60, // catalog subjects are static within a session
  });

export const useAcademicProfile = () =>
  useQuery<AcademicProfile>({
    queryKey: queryKeys.academicProfile(),
    queryFn: () => apiClient.get<AcademicProfile>("/api/academic-planning/me/profile"),
  });

// No `email`: the API rejects it by omission, and changing an account's
// identity / reset channel needs a verification round-trip, not a form field.
export type UpdateAcademicProfileInput = {
  firstName?: string;
  lastName?: string;
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

// `enabled` lets a caller that only needs the catalog for tertiary students
// skip the request entirely for high-school ones, the same way
// useAcademicUnits gates subjects vs courses. Defaults to on so existing
// callers are unchanged.
export const useInstitutions = (type?: string, options?: { enabled?: boolean }) =>
  useQuery<Institution[]>({
    queryKey: queryKeys.institutions(type),
    queryFn: () =>
      apiClient.get<Institution[]>(
        `/api/academic-planning/institutions${type ? `?type=${encodeURIComponent(type)}` : ""}`,
      ),
    enabled: options?.enabled ?? true,
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
// `meta` and `href` exist so a page can render a unit fully without caring which
// side it came from. The two shapes carry the same idea under different names
// (grade + teacher vs course code + lecturer; a subject detail page vs the
// course list, which has no per-course route yet), and resolving that here is
// the difference between one unit-aware page and two parallel ones.
export type AcademicUnit = {
  id: string;
  name: string;
  kind: "subject" | "course";
  // The enrolment row id. Distinct from `id`: this identifies the student's
  // enrolment, `id` is the slug an assessment stores. Mixing them up is a
  // standing bug in this codebase.
  rowId: string;
  meta: string;
  href: string;
};

export function useAcademicUnits() {
  const profileQuery = useAcademicProfile();
  const vocabulary = studyVocabulary(profileQuery.data?.educationLevel);
  const isTertiary = vocabulary.isTertiary;

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
    ? (coursesQuery.data ?? []).map((c) => ({
        id: c.practiceKey,
        name: c.name,
        kind: "course" as const,
        rowId: c.id,
        meta: [c.code, c.lecturer].filter(Boolean).join(" · "),
        // No per-course detail route exists yet, so the list is the honest
        // destination rather than a link that 404s.
        href: "/dashboard/courses",
      }))
    : (subjectsQuery.data ?? []).map((s) => ({
        id: s.subjectId,
        name: s.name,
        kind: "subject" as const,
        rowId: s.id,
        meta: `Grade ${s.grade}${s.teacher ? ` · ${s.teacher}` : ""}`,
        href: `/dashboard/subjects/${s.id}`,
      }));

  return {
    units,
    isTertiary,
    // Singular/plural nouns + the page to add more, so shared UI reads
    // correctly. Sourced from the shared study vocabulary rather than spelled
    // out here, so these nouns and the ones useStudyVocabulary hands to copy
    // can never drift apart.
    unitNoun: vocabulary.unitSingular,
    unitNounPlural: vocabulary.unitPlural,
    addHref: vocabulary.unitsHref,
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

export type AddCourseInput = {
  name: string;
  code?: string;
  lecturer?: string;
  // Study level, so AI practice is pitched at the right year.
  level?: CourseLevel;
  // How many semesters the course runs. Optional: omitted reads as ongoing.
  durationSemesters?: number;
};

export const useAddCourse = () => {
  const qc = useQueryClient();
  return useMutation<EnrolledCourse, ApiError, AddCourseInput>({
    mutationFn: (input) => apiClient.post<EnrolledCourse>("/api/academic-planning/courses", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses() });
    },
  });
};

// Mark a course finished (or reopen it). Moves it into the analytics Past
// section immediately, whatever its computed end.
export const useSetCourseFinished = () => {
  const qc = useQueryClient();
  return useMutation<EnrolledCourse, ApiError, { id: string; finished: boolean }>({
    mutationFn: ({ id, finished }) =>
      apiClient.patch<EnrolledCourse>(`/api/academic-planning/courses/${id}`, { finished }),
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

// Contacted is a toggle, not a one-way door: a mis-click used to bury a live
// lead in the Contacted tab with no way back.
export const useSetEnquiryContacted = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { id: string; contacted: boolean }>({
    mutationFn: ({ id, contacted }) =>
      apiClient.put<void>(`/api/sales/school-enquiries/${id}/contacted`, { contacted }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["school-enquiries"] });
      void qc.invalidateQueries({ queryKey: ["audit-logs"] });
      void qc.invalidateQueries({ queryKey: ["admin", "overview"] });
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
      const { getAccessToken } = await import("@/lib/api/token");
      const token = await getAccessToken();
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
  category?: Goal["category"];
  subjectId?: string | null;
  reward?: string;
  dueDate?: string;

  /** Defaults to "custom" server-side. Anything else requires targetValue. */
  kind?: GoalKind;
  targetValue?: number | null;
  /** Only meaningful for topic_mastery: narrows the goal to one topic. */
  topicFilter?: string | null;
  /**
   * The assessment this goal is preparing for. Links the goal to the thing
   * that actually motivated it, so it reads "for your Maths SBA on the 14th"
   * instead of floating free.
   */
  assessmentId?: number | null;
  /**
   * Free-text "what done looks like", used only for custom goals. Every
   * measurable kind generates its own label server-side so the card and the
   * check can't drift apart, and anything sent here is ignored.
   */
  target?: string;
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

// "long" is an exam paper's extended-response question. Like "short" it is
// typed rather than picked, but it is marked by the server's examiner against a
// memo, never by the client.
export type PracticeQuestionKind = "mc" | "short" | "long" | "flashcard";

export type PracticeQuestion = {
  id: string;
  question: string;
  // How the question is taken + marked. Absent/"mc" is multiple choice.
  kind?: PracticeQuestionKind;
  options: string[];
  // The answer key. Withheld by the API until this student has a submitted
  // attempt, because the same endpoint renders the test while they are taking
  // it: answerIdx reads -1 and the rest are null/empty until then. Do not
  // reintroduce any UI that assumes these are present before submit.
  answerIdx: number;
  // Short-answer key (typed answer marked by normalized match).
  expectedAnswer?: string | null;
  acceptableAnswers?: string[];
  // Flashcard back (answer / definition); front is `question`.
  back?: string | null;
  explanation?: string | null;
  topic?: string | null;
  // Exam papers: what the question is out of, and which section it sits in.
  // 1 and null on every other format. Safe before submit, and shown while
  // taking, because the marks are how a student budgets the time.
  marks?: number;
  section?: string | null;
};

export type PracticeTopicScore = {
  topic: string;
  correct: number;
  total: number;
  percent: number;
};

// One question as the examiner left it. Exam papers only.
export type PracticeMarkedAnswer = {
  questionId: string;
  // Null when the question could not be marked (the marker was unavailable).
  // That is not the same as zero, and must not be rendered as zero.
  marksAwarded?: number | null;
  marksAvailable?: number | null;
  // Where the marks went and what was missing. The most useful thing on the
  // page: it is why a marked paper beats a percentage.
  feedback?: string | null;
  givenAnswerText?: string | null;
};

export type PracticeScoreSummary = {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercent: number;
  totalTimeMs: number;
  perTopic: PracticeTopicScore[];
  // Exam papers only; null elsewhere. "14/32" is what a student recognises
  // from a real paper; scorePercent is the same number for mastery and goals.
  marksAwarded?: number | null;
  marksTotal?: number | null;
  markedAnswers?: PracticeMarkedAnswer[];
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
  // True only on the response to the submit that was this student's FIRST ever
  // submitted attempt. The API decides it, not the browser, because "have you
  // ever practised" is a fact about an account and not about a device: a
  // localStorage flag would re-fire on a second phone, in a private window, and
  // for anyone who cleared their storage. This is the campaign optimisation
  // target, so it is the one flag that has to be right.
  firstSubmittedAttempt?: boolean;
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
    onSuccess: (result) => {
      // A scored attempt moves practice best-scores, mastery, and predictions.
      void qc.invalidateQueries({ queryKey: queryKeys.practiceTests() });
      void qc.invalidateQueries({ queryKey: ["mastery"] });
      // Instrumented here rather than in PracticeRunner so every submit path
      // is covered by construction, including the auto-submit on a timer
      // expiry, which is the one a component-level hook would miss.
      track("practice_attempt_submitted", { score: result.score ?? -1 });
      if (result.firstSubmittedAttempt) {
        track("first_practice_attempt", { score: result.score ?? -1 });
      }
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
//
// Generation is a QUEUED JOB, not a request. POST /tests/generate validates,
// meters and returns 202 with a job; the API runs the model calls on a
// background worker (one at a time, because production is a 1 GiB burstable
// instance) and the client polls /generations/{id} until it settles. See
// usePracticeGeneration for the polling, backoff and timeout policy.
export type PracticeFormat =
  | "multiple_choice"
  | "short_answer"
  | "reading"
  | "flashcards"
  | "essay"
  // A full paper: sections, mark allocations, and written answers marked by an
  // examiner against a memo. Sized by totalMarks, not questionCount.
  | "exam";

export type GenerateTestInput = {
  // The assessment to practise for. Required: the API reads the subject off the
  // assessment, so there is no way to generate for something you have not
  // logged.
  assessmentId: string;
  topics?: string[];
  difficulty?: "foundation" | "core" | "challenge";
  questionCount?: number;
  format?: PracticeFormat;
  // Exam papers only: what the paper is out of. Ignored by every other format,
  // which are sized by question count. The API clamps to 20..150 and times the
  // paper at roughly a minute a mark.
  totalMarks?: number;
};

// A queued generation, as the API reports it.
export type GenerationJobStatus = "queued" | "running" | "succeeded" | "failed";

export type GenerationJob = {
  id: string;
  status: GenerationJobStatus;
  format: PracticeFormat;
  // The finished test. Null until the job succeeds.
  practiceTestId: string | null;
  // A real message on failure. Null otherwise.
  error: string | null;
  attempts: number;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export const generationKeys = {
  job: (id: string) => ["practice-generation", id] as const,
  active: () => ["practice-generation", "active"] as const,
};

// Queue a generation. Returns immediately with the job to poll — the model
// calls have not started yet.
export const useStartGeneration = () =>
  useMutation<GenerationJob, ApiError, GenerateTestInput>({
    mutationFn: (input) =>
      apiClient.post<GenerationJob>("/api/practice/tests/generate", input),
  });

// Poll one job. Backs off as it goes: a multiple-choice test is usually done
// inside ten seconds, an exam paper takes a minute or more, and hammering the
// API every second for that whole minute is exactly the load this change
// exists to remove.
function pollDelay(polls: number) {
  if (polls < 4) return 1500;
  if (polls < 10) return 3000;
  return 6000;
}

export const useGenerationJob = (jobId: string | null) =>
  useQuery<GenerationJob>({
    queryKey: generationKeys.job(jobId ?? ""),
    queryFn: () => apiClient.get<GenerationJob>(`/api/practice/generations/${jobId}`),
    enabled: !!jobId,
    // A settled job never changes again, so stop polling the moment it does.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "succeeded" || status === "failed") return false;
      return pollDelay(query.state.dataUpdateCount);
    },
    refetchIntervalInBackground: false,
    staleTime: 0,
    retry: 1,
  });

// The student's most recent unfinished generation, straight from the API.
//
// This is what makes closing the tab safe: the job lives in the database, not
// in this browser, so coming back to the practice page picks it up again even
// on a different device.
export const useActiveGeneration = (enabled = true) =>
  useQuery<GenerationJob | null>({
    queryKey: generationKeys.active(),
    queryFn: async () => {
      const job = await apiClient.get<GenerationJob | null>("/api/practice/generations/active");
      // 204 comes back as undefined from the fetcher; normalise to null so
      // TanStack does not treat it as a failed query.
      return job ?? null;
    },
    enabled,
    staleTime: 0,
    retry: false,
  });

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
export type ConnectionStatus = "pending" | "active" | "paused" | "declined";

export type TutorConnection = {
  id: string;
  studentId: string;
  student: string;
  subject: string;
  status: ConnectionStatus;
  connectedAt: string;
};

// A read-only snapshot of a linked student's academics, shown to the tutor on
// an active connection so they can prepare. Server-scoped to that connection.
export type TutorStudentContext = {
  studentId: string;
  studentName: string;
  subject: string;
  units: { name: string; detail: string }[];
  assessments: {
    title: string;
    type: string;
    subject: string;
    weight: number;
    dueDate: string;
    status: string;
    predictedMark: number | null;
  }[];
  goals: {
    title: string;
    target: string;
    progress: number;
    status: string;
    category: string;
    dueDate: string;
  }[];
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

// Tutor moves a connection through its lifecycle: accept/decline a request, or
// pause/resume a student.
export const useUpdateTutorConnection = () => {
  const qc = useQueryClient();
  return useMutation<TutorConnection, ApiError, { id: string; status: ConnectionStatus }>({
    mutationFn: ({ id, status }) =>
      apiClient.patch<TutorConnection>(`/api/booking/connections/${id}`, { status }),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.tutorConnections() });
      void qc.invalidateQueries({ queryKey: ["tutor", "student-context", id] });
    },
  });
};

// The linked student's academic context, for the tutor's student detail page.
// Only resolves on an active connection (the server forbids otherwise).
export const useTutorStudentContext = (connectionId: string, enabled = true) =>
  useQuery<TutorStudentContext>({
    queryKey: ["tutor", "student-context", connectionId],
    queryFn: () =>
      apiClient.get<TutorStudentContext>(`/api/booking/connections/${connectionId}/student-context`),
    enabled: enabled && !!connectionId,
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

// ---- Tutoring marketplace (listings, proposals, connects) ----------------
// A student (or a parent for their child) posts a listing describing the help
// they need; tutors spend connects to propose; the poster picks one. Mirrors
// /api/tutoring on the backend.

export type ListingMode = "online" | "in_person" | "either";
export type ListingStatus = "open" | "filled" | "closed";

export type TutorListing = {
  id: string;
  learnerId: string;
  learnerName: string;
  postedByRole: "student" | "parent";
  title: string;
  subject: string;
  level: string;
  details: string;
  mode: ListingMode;
  status: ListingStatus;
  proposals: number;
  isMine: boolean;
  alreadyProposed: boolean;
  createdAt: string;
};

export type ProposalStatus = "submitted" | "accepted" | "declined" | "withdrawn";

// A proposal seen by the poster reviewing bids on their listing.
export type ListingProposal = {
  id: string;
  listingId: string;
  tutorId: string;
  tutorName: string;
  message: string;
  status: ProposalStatus;
  createdAt: string;
  tutorRating: number;
  tutorReviews: number;
  tutorVerified: boolean;
  tutorQualification: string;
};

// A proposal seen by the tutor who submitted it, with its listing context.
export type MyProposal = {
  id: string;
  listingId: string;
  listingTitle: string;
  subject: string;
  learnerName: string;
  message: string;
  status: ProposalStatus;
  connectsSpent: number;
  createdAt: string;
};

export type ConnectsBalance = {
  balance: number;
  proposalCost: number;
  monthlyGrant: number;
};

export type CreateListingInput = {
  learnerId?: string;
  title: string;
  subject: string;
  level?: string;
  details?: string;
  mode?: ListingMode;
};

// Listings the caller posted or that were posted for them.
export const useMyListings = () =>
  useQuery<TutorListing[]>({
    queryKey: ["tutoring", "listings", "mine"],
    queryFn: () => apiClient.get<TutorListing[]>("/api/tutoring/listings/mine"),
  });

// Open listings a tutor can bid on, optionally filtered by a search term.
export const useOpenListings = (q?: string) =>
  useQuery<TutorListing[]>({
    queryKey: ["tutoring", "listings", "open", q ?? ""],
    queryFn: () =>
      apiClient.get<TutorListing[]>(
        `/api/tutoring/listings/open${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      ),
  });

// Proposals submitted against one of the caller's listings.
export const useListingProposals = (listingId: string, enabled = true) =>
  useQuery<ListingProposal[]>({
    queryKey: ["tutoring", "listings", listingId, "proposals"],
    queryFn: () =>
      apiClient.get<ListingProposal[]>(`/api/tutoring/listings/${listingId}/proposals`),
    enabled: enabled && !!listingId,
  });

export const useCreateListing = () => {
  const qc = useQueryClient();
  return useMutation<TutorListing, ApiError, CreateListingInput>({
    mutationFn: (body) => apiClient.post<TutorListing>("/api/tutoring/listings", body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tutoring", "listings", "mine"] });
    },
  });
};

export const useAcceptProposal = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { proposalId: string; listingId: string }>({
    mutationFn: ({ proposalId }) =>
      apiClient.post<void>(`/api/tutoring/proposals/${proposalId}/accept`, {}),
    onSuccess: (_data, { listingId }) => {
      void qc.invalidateQueries({ queryKey: ["tutoring", "listings", "mine"] });
      void qc.invalidateQueries({ queryKey: ["tutoring", "listings", listingId, "proposals"] });
      void qc.invalidateQueries({ queryKey: queryKeys.tutorConnections() });
    },
  });
};

export const useCloseListing = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { listingId: string }>({
    mutationFn: ({ listingId }) =>
      apiClient.post<void>(`/api/tutoring/listings/${listingId}/close`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tutoring", "listings", "mine"] });
    },
  });
};

// Tutor submits a proposal, spending connects.
export const useProposeOnListing = () => {
  const qc = useQueryClient();
  return useMutation<ListingProposal, ApiError, { listingId: string; message: string }>({
    mutationFn: ({ listingId, message }) =>
      apiClient.post<ListingProposal>(`/api/tutoring/listings/${listingId}/propose`, { message }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tutoring", "listings", "open"] });
      void qc.invalidateQueries({ queryKey: ["tutoring", "proposals", "mine"] });
      void qc.invalidateQueries({ queryKey: ["tutoring", "connects"] });
    },
  });
};

// The tutor's own proposals.
export const useMyProposals = () =>
  useQuery<MyProposal[]>({
    queryKey: ["tutoring", "proposals", "mine"],
    queryFn: () => apiClient.get<MyProposal[]>("/api/tutoring/proposals/mine"),
  });

// The tutor's connect balance (tops up for the month on read).
export const useConnects = () =>
  useQuery<ConnectsBalance>({
    queryKey: ["tutoring", "connects"],
    queryFn: () => apiClient.get<ConnectsBalance>("/api/tutoring/connects"),
  });

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
  // Identity, so the tutor can present who they are, plus their connect balance.
  tutorKind: "university_student" | "graduate" | "completed_matric";
  institution: string;
  studyingToward: string;
  matricYear: number | null;
  connects: number;
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
  tutorKind?: "university_student" | "graduate" | "completed_matric";
  institution?: string;
  studyingToward?: string;
  matricYear?: number | null;
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

// ── Points, achievements and rewards ──────────────────────────────────
//
// The rewards catalogue used to be a shop of tutor hours and masterclasses
// that nothing could deliver, with a Redeem button wired to nothing. It is
// back, but every entry is now a quota the meter already enforces, raised for
// a fixed window, so redeeming one genuinely changes what the student can do.

/**
 * Balance, level, rank and streaks. The server re-evaluates every measurable
 * goal before answering, so this reflects work done since the last page load.
 */
export const useStudentPoints = () =>
  useQuery<StudentPoints>({
    queryKey: queryKeys.points(),
    queryFn: () => apiClient.get<StudentPoints>("/api/goals/points/me"),
  });

export const usePointsLedger = () =>
  useQuery<PointsEntry[]>({
    queryKey: queryKeys.pointsLedger(),
    queryFn: () => apiClient.get<PointsEntry[]>("/api/goals/points/ledger"),
  });

export const useAchievements = () =>
  useQuery<Achievement[]>({
    queryKey: queryKeys.achievements(),
    queryFn: () => apiClient.get<Achievement[]>("/api/goals/achievements"),
  });

/**
 * What points can buy: time-boxed top-ups on metered features. `affordable` is
 * computed server-side against the live balance, so the button and the API
 * cannot disagree about what the student can have.
 */
export const useRewards = () =>
  useQuery<Reward[]>({
    queryKey: queryKeys.rewards(),
    queryFn: () => apiClient.get<Reward[]>("/api/goals/rewards"),
  });

/** Top-ups the student is holding right now, soonest to expire first. */
export const useActiveGrants = () =>
  useQuery<Grant[]>({
    queryKey: queryKeys.activeGrants(),
    queryFn: () => apiClient.get<Grant[]>("/api/goals/rewards/active"),
  });

/**
 * Spend points on a reward. The server debits and grants in one transaction,
 * so there is no state where the points are gone and the top-up never arrived.
 * The new grant raises the real usage limit immediately, which is why the
 * usage query is invalidated alongside the points.
 */
export const useRedeemReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => apiClient.post<Grant>(`/api/goals/rewards/${code}/redeem`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.activeGrants() });
      // Balance changed, so affordability did too.
      void qc.invalidateQueries({ queryKey: queryKeys.rewards() });
      void qc.invalidateQueries({ queryKey: queryKeys.points() });
      void qc.invalidateQueries({ queryKey: queryKeys.pointsLedger() });
      // Prefix-matches ["entitlements","me"] and ["entitlements","me","usage"]:
      // the grant raises the real limit, so the meter is stale the moment this
      // returns.
      void qc.invalidateQueries({ queryKey: ["entitlements", "me"] });
      invalidateNotifications(qc);
    },
  });
};

/**
 * Where the student stands before they pick a target, and what that target
 * would pay.
 *
 * Creating a rewarded goal at or below the baseline is rejected outright, so
 * the dialog asks this first and shows the number next to the input. Pricing
 * stays server-side deliberately: re-deriving the curve here would quote a
 * figure that drifts from the one actually paid.
 */
export const useGoalBaseline = (
  kind: GoalKind,
  subjectId?: string | null,
  topicFilter?: string | null,
  targetValue?: number | null,
  enabled = true,
) =>
  useQuery<GoalBaseline>({
    queryKey: queryKeys.goalBaseline(kind, subjectId, topicFilter, targetValue),
    queryFn: () => {
      const params = new URLSearchParams({ kind });
      if (subjectId) params.set("subjectId", subjectId);
      if (topicFilter) params.set("topicFilter", topicFilter);
      if (targetValue && targetValue > 0) params.set("targetValue", String(targetValue));
      return apiClient.get<GoalBaseline>(`/api/goals/baseline?${params.toString()}`);
    },
    enabled,
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

// Wipes every stored conversation for the signed-in student. The server keeps
// only the 20 most recent anyway; this is the "and I want it gone now" path.
export const useClearTutorConversations = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: () => apiClient.delete<void>("/api/ai/conversations"),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tutorConversations() });
    },
  });
};

export const useCareers = () =>
  useQuery<Career[]>({
    queryKey: queryKeys.careers(),
    queryFn: () => apiClient.get<Career[]>("/api/careers"),
    staleTime: 1000 * 60 * 60, // careers catalog is static within a session
  });

export const useChildren = () =>
  useQuery<Child[]>({
    queryKey: queryKeys.children(),
    queryFn: () => apiClient.get<Child[]>("/api/entitlements/children"),
  });

// Parent sets a linked child's coverage plan (student.pro | student.max).
// A 409 surfaces the capacity message ("Your plan covers N students...").
export const useSetChildPlan = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    ApiError,
    { studentUserId: string; planCode: "student.pro" | "student.max" }
  >({
    mutationFn: ({ studentUserId, planCode }) =>
      apiClient.put<void>(`/api/entitlements/children/${studentUserId}/plan`, { planCode }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.children() }),
  });
};

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

// --- Tokenised invite accept (public landing page) ----------------------
// The /invite/{token} page an invitee opens from the email. Resolving the
// token is anonymous (the page is reachable while logged out), so this GET
// must not require a bearer token: apiClient omits the Authorization header
// when there is no session, and the endpoint is [AllowAnonymous], exactly like
// the public /pricing plans query. Accept / decline stay authenticated; the
// server still verifies the caller owns the invited email.

export type InviteByToken = {
  parentName: string;
  studentEmail: string;
  status: string;
};

// Returns null for an unknown token (404) so the page can render the calm
// "not valid / already used" state; other failures surface as query errors.
export const useInviteByToken = (token: string) =>
  useQuery<InviteByToken | null>({
    queryKey: ["parent-links", "invite-by-token", token],
    queryFn: async () => {
      try {
        return await apiClient.get<InviteByToken>(`/api/parent-links/invites/token/${token}`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 30_000,
  });

export const useAcceptInvite = (token: string) => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: () => apiClient.post<void>(`/api/parent-links/invites/${token}/accept`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["parent-links", "invite-by-token", token] });
      void qc.invalidateQueries({ queryKey: ["parent-links", "incoming"] });
      void qc.invalidateQueries({ queryKey: ["parent-links", "parents"] });
    },
  });
};

export const useDeclineInvite = (token: string) => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, void>({
    mutationFn: () => apiClient.post<void>(`/api/parent-links/invites/${token}/decline`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["parent-links", "invite-by-token", token] });
      void qc.invalidateQueries({ queryKey: ["parent-links", "incoming"] });
    },
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

// A single group's detail, for the group workspace page. Open groups resolve
// even for a non-member (so they can preview before joining).
export const useStudyGroup = (id: string, enabled = true) =>
  useQuery<StudyGroup>({
    queryKey: ["study-groups", id, "detail"],
    queryFn: () => apiClient.get<StudyGroup>(`/api/study-groups/${id}`),
    enabled: enabled && !!id,
  });

export type CreateStudyGroupInput = {
  name: string;
  subjectId: string;
  description?: string;
  privacy: "open" | "invite";
  memberCapacity?: number;
};

export const useCreateStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation<StudyGroup, ApiError, CreateStudyGroupInput>({
    mutationFn: (body) => apiClient.post<StudyGroup>("/api/study-groups", body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() }),
  });
};

export type UpdateStudyGroupInput = {
  name?: string;
  description?: string;
  privacy?: "open" | "invite";
  memberCapacity?: number;
  tasksWhoCanAdd?: "everyone" | "admins";
  notifyOnNewTask?: boolean;
  autoSyncTasks?: boolean;
};

export const useUpdateStudyGroup = (id: string) => {
  const qc = useQueryClient();
  return useMutation<StudyGroup, ApiError, UpdateStudyGroupInput>({
    mutationFn: (body) => apiClient.patch<StudyGroup>(`/api/study-groups/${id}`, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["study-groups", id, "detail"] });
      void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() });
    },
  });
};

export const useDeleteStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.delete<void>(`/api/study-groups/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() }),
  });
};

export const useJoinStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.post<void>(`/api/study-groups/${id}/join`, {}),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() });
      void qc.invalidateQueries({ queryKey: ["study-groups", id, "detail"] });
    },
  });
};

export const useLeaveStudyGroup = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => apiClient.post<void>(`/api/study-groups/${id}/leave`, {}),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() });
      void qc.invalidateQueries({ queryKey: ["study-groups", id, "detail"] });
    },
  });
};

// ---- Group roster / moderation ----

export const useStudyGroupMembers = (groupId: string, enabled = true) =>
  useQuery<StudyGroupMember[]>({
    queryKey: ["study-groups", groupId, "members"],
    queryFn: () => apiClient.get<StudyGroupMember[]>(`/api/study-groups/${groupId}/members`),
    enabled: enabled && !!groupId,
  });

export const useRemoveStudyGroupMember = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (userId) => apiClient.delete<void>(`/api/study-groups/${groupId}/members/${userId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "members"] });
      void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "detail"] });
      void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() });
    },
  });
};

export const useSetStudyGroupMemberRole = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { userId: string; role: "admin" | "member" | "owner" }>({
    mutationFn: ({ userId, role }) =>
      apiClient.post<void>(`/api/study-groups/${groupId}/members/${userId}/role`, { role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "members"] });
      void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "detail"] });
    },
  });
};

// ---- Shared tasks ----

const invalidateTasks = (qc: ReturnType<typeof useQueryClient>, groupId: string) => {
  void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "tasks"] });
  void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "detail"] });
  void qc.invalidateQueries({ queryKey: queryKeys.studyGroups() });
};

export const useStudyGroupTasks = (groupId: string, enabled = true) =>
  useQuery<StudyGroupTask[]>({
    queryKey: ["study-groups", groupId, "tasks"],
    queryFn: () => apiClient.get<StudyGroupTask[]>(`/api/study-groups/${groupId}/tasks`),
    enabled: enabled && !!groupId,
  });

export type AddStudyGroupTaskInput = { title: string; notes?: string; dueDate?: string | null };

export const useAddStudyGroupTask = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation<StudyGroupTask, ApiError, AddStudyGroupTaskInput>({
    mutationFn: (body) => apiClient.post<StudyGroupTask>(`/api/study-groups/${groupId}/tasks`, body),
    onSuccess: () => invalidateTasks(qc, groupId),
  });
};

export const useToggleStudyGroupTask = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { taskId: string; done: boolean }>({
    mutationFn: ({ taskId, done }) =>
      apiClient.patch<void>(`/api/study-groups/${groupId}/tasks/${taskId}`, { done }),
    onSuccess: () => invalidateTasks(qc, groupId),
  });
};

export const useDeleteStudyGroupTask = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (taskId) => apiClient.delete<void>(`/api/study-groups/${groupId}/tasks/${taskId}`),
    onSuccess: () => invalidateTasks(qc, groupId),
  });
};

// Pull a dated task onto the caller's own calendar, or take it back off.
export const useSyncStudyGroupTask = (groupId: string) => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { taskId: string; synced: boolean }>({
    mutationFn: ({ taskId, synced }) =>
      synced
        ? apiClient.delete<void>(`/api/study-groups/${groupId}/tasks/${taskId}/sync`)
        : apiClient.post<void>(`/api/study-groups/${groupId}/tasks/${taskId}/sync`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["study-groups", groupId, "tasks"] });
    },
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

// --- Admin: audit trail -------------------------------------------------
//
// GET /api/audit/logs is a real, filtered read over audit.audit_logs. It
// returned a hardcoded empty array until the writer (Services/Audit) and this
// endpoint landed together, so an admin page that rendered "no audit events
// yet" was telling them nothing about the platform.

export type AuditLogFilters = {
  userId?: string;
  action?: string;
  entityType?: string;
  severity?: string;
  q?: string;
  from?: string;
  to?: string;
  take?: number;
  skip?: number;
};

const auditQueryString = (f: AuditLogFilters) => {
  const params = new URLSearchParams();
  if (f.userId) params.set("userId", f.userId);
  if (f.action) params.set("action", f.action);
  if (f.entityType) params.set("entityType", f.entityType);
  if (f.severity) params.set("severity", f.severity);
  if (f.q) params.set("q", f.q);
  if (f.from) params.set("from", f.from);
  if (f.to) params.set("to", f.to);
  params.set("take", String(f.take ?? 50));
  params.set("skip", String(f.skip ?? 0));
  return params.toString();
};

export const useAuditLogs = (filters: AuditLogFilters = {}) =>
  useQuery<AuditLogPage>({
    queryKey: [...queryKeys.auditLogs(), filters],
    queryFn: () => apiClient.get<AuditLogPage>(`/api/audit/logs?${auditQueryString(filters)}`),
  });

export const useAuditActions = () =>
  useQuery<AuditAction[]>({
    queryKey: queryKeys.auditActions(),
    queryFn: () => apiClient.get<AuditAction[]>("/api/audit/actions"),
    staleTime: 1000 * 60 * 60, // audit action reference list is static within a session
  });

// --- Admin: back office -------------------------------------------------
// Mirrors api/Controllers/AdminController.cs.

export type AdminOverview = {
  users: number;
  usersByRole: Record<string, number>;
  subscriptionsLive: number;
  subscriptionsPastDue: number;
  subscriptionsCancelled: number;
  monthlyRecurringRevenueZar: number;
  schoolEnquiries: number;
  schoolEnquiriesUncontacted: number;
  outboxPending: number;
  auditEventsLast24h: number;
  tutors: number;
  tutorsUnverified: number;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber: string | null;
  school: string | null;
  grade: number | null;
  educationLevel: string;
  roles: string[];
  role: string;
  planCodes: string[];
  createdAt: string;
  lockedOut: boolean;
};

export type AdminUserPage = {
  items: AdminUserRow[];
  total: number;
  skip: number;
  take: number;
};

export type AdminSubscription = {
  id: string;
  planCode: string;
  planName: string;
  name: string | null;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  billing: string;
  memberCount: number | null;
  startedAt: string;
  validUntil: string | null;
  cancelledAt: string | null;
  lastChargeAt: string | null;
  renewalFailureCount: number;
  pendingPlanCode: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  billingEmail: string | null;
  paid: boolean;
};

export type AdminMembership = {
  subscriptionId: string;
  planCode: string;
  planName: string;
  status: string;
  role: string;
  joinedAt: string;
  isOwner: boolean;
};

export type AdminUserAudit = {
  id: string;
  action: string;
  resource: string;
  ts: string;
};

export type AdminUserDetail = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber: string | null;
  school: string | null;
  grade: number | null;
  curriculumId: string | null;
  educationLevel: string;
  institutionId: string | null;
  roles: string[];
  role: string;
  createdAt: string;
  updatedAt: string | null;
  lockedOut: boolean;
  subscriptions: AdminSubscription[];
  memberships: AdminMembership[];
  recentAudit: AdminUserAudit[];
};

export type AdminRole = {
  name: string;
  label: string;
  privileged: boolean;
};

export type AdminTutor = {
  userId: string;
  name: string;
  email: string;
  qualification: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  yearsOfExperience: number;
  verified: boolean;
  acceptingStudents: boolean;
  tutorKind: string;
  institution: string;
  createdAt: string;
};

export type AdminSystem = {
  databaseOk: boolean;
  databaseLatencyMs: number;
  outboxPending: number;
  outboxProcessed: number;
  oldestPendingOccurredAt: string | null;
  environment: string;
  serverTimeUtc: string;
  uptimeSeconds: number;
  dotnetVersion: string;
};

export const useAdminOverview = () =>
  useQuery<AdminOverview>({
    queryKey: queryKeys.adminOverview(),
    queryFn: () => apiClient.get<AdminOverview>("/api/admin/overview"),
  });

export const useAdminUsers = (opts: { q?: string; role?: string; take?: number; skip?: number } = {}) =>
  useQuery<AdminUserPage>({
    queryKey: [...queryKeys.adminUsers(), opts],
    queryFn: () => {
      const params = new URLSearchParams();
      if (opts.q) params.set("q", opts.q);
      if (opts.role) params.set("role", opts.role);
      params.set("take", String(opts.take ?? 100));
      params.set("skip", String(opts.skip ?? 0));
      return apiClient.get<AdminUserPage>(`/api/admin/users?${params.toString()}`);
    },
  });

export const useAdminUser = (id: string | null) =>
  useQuery<AdminUserDetail>({
    queryKey: queryKeys.adminUser(id ?? ""),
    queryFn: () => apiClient.get<AdminUserDetail>(`/api/admin/users/${id}`),
    enabled: !!id,
  });

export const useAdminRoles = () =>
  useQuery<AdminRole[]>({
    queryKey: queryKeys.adminRoles(),
    queryFn: () => apiClient.get<AdminRole[]>("/api/admin/roles"),
    staleTime: 10 * 60_000,
  });

export const useSetUserRoles = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { id: string; roles: string[] }>({
    mutationFn: ({ id, roles }) => apiClient.put<void>(`/api/admin/users/${id}/roles`, { roles }),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      void qc.invalidateQueries({ queryKey: queryKeys.adminUser(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.auditLogs() });
      void qc.invalidateQueries({ queryKey: queryKeys.adminOverview() });
    },
  });
};

export const useAdminSubscriptions = (opts: { status?: string; planCode?: string } = {}) =>
  useQuery<AdminSubscription[]>({
    queryKey: [...queryKeys.adminSubscriptions(), opts],
    queryFn: () => {
      const params = new URLSearchParams();
      if (opts.status) params.set("status", opts.status);
      if (opts.planCode) params.set("planCode", opts.planCode);
      const qs = params.toString();
      return apiClient.get<AdminSubscription[]>(`/api/admin/subscriptions${qs ? `?${qs}` : ""}`);
    },
  });

export const useAdminTutors = () =>
  useQuery<AdminTutor[]>({
    queryKey: queryKeys.adminTutors(),
    queryFn: () => apiClient.get<AdminTutor[]>("/api/admin/tutors"),
  });

export const useSetTutorVerification = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { userId: string; verified: boolean }>({
    mutationFn: ({ userId, verified }) =>
      apiClient.post<void>(`/api/admin/tutors/${userId}/verification`, { verified }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminTutors() });
      void qc.invalidateQueries({ queryKey: queryKeys.tutors() });
      void qc.invalidateQueries({ queryKey: queryKeys.auditLogs() });
      void qc.invalidateQueries({ queryKey: queryKeys.adminOverview() });
    },
  });
};

export const useAdminSystem = () =>
  useQuery<AdminSystem>({
    queryKey: queryKeys.adminSystem(),
    queryFn: () => apiClient.get<AdminSystem>("/api/admin/system"),
    // Health is only useful if it is current. Cheap query, short window.
    refetchInterval: 15_000,
  });

// ---- Paystack cockpit ------------------------------------------------------
// Reads and writes against the live Paystack account, so an operator does not
// have to sign in to Paystack's own dashboard. Every hook degrades on a missing
// key: the status hook is checked first and the page shows a connect prompt
// rather than a wall of failed requests.

export type PaystackStatus = { configured: boolean };
export type PaystackBalance = { currency: string; available: number; pending: number };
export type PaystackTransaction = {
  reference: string;
  amount: number;
  currency: string;
  status: string | null;
  paidAt: string | null;
  customerEmail: string | null;
  channel: string | null;
  card: string | null;
  refundable: boolean;
};
export type PaystackTransactionPage = {
  rows: PaystackTransaction[];
  page: number;
  pageCount: number;
  total: number;
};
export type PaystackSettlement = {
  id: number;
  amount: number;
  currency: string;
  status: string | null;
  settledAt: string | null;
  bankName: string | null;
  accountLast4: string | null;
};
export type PaystackSettlementPage = {
  rows: PaystackSettlement[];
  page: number;
  pageCount: number;
  total: number;
};
export type PaystackCustomer = {
  customerCode: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  transactions: PaystackTransaction[];
};

export const usePaystackStatus = () =>
  useQuery<PaystackStatus>({
    queryKey: queryKeys.paystackStatus(),
    queryFn: () => apiClient.get<PaystackStatus>("/api/admin/paystack/status"),
    staleTime: 5 * 60_000,
  });

export const usePaystackBalance = (enabled: boolean) =>
  useQuery<PaystackBalance[]>({
    queryKey: queryKeys.paystackBalance(),
    queryFn: () => apiClient.get<PaystackBalance[]>("/api/admin/paystack/balance"),
    enabled,
    refetchInterval: 60_000,
  });

export const usePaystackTransactions = (
  opts: { page?: number; status?: string } = {},
  enabled = true,
) =>
  useQuery<PaystackTransactionPage>({
    queryKey: [...queryKeys.paystackTransactions(), opts],
    queryFn: () => {
      const p = new URLSearchParams();
      if (opts.page) p.set("page", String(opts.page));
      if (opts.status) p.set("status", opts.status);
      const qs = p.toString();
      return apiClient.get<PaystackTransactionPage>(
        `/api/admin/paystack/transactions${qs ? `?${qs}` : ""}`,
      );
    },
    enabled,
  });

export const usePaystackSettlements = (enabled: boolean) =>
  useQuery<PaystackSettlementPage>({
    queryKey: queryKeys.paystackSettlements(),
    queryFn: () => apiClient.get<PaystackSettlementPage>("/api/admin/paystack/settlements"),
    enabled,
  });

// On-demand customer lookup. Not auto-run: only fires once a query string is
// entered and the caller flips `enabled`.
export const usePaystackCustomer = (query: string, enabled: boolean) =>
  useQuery<PaystackCustomer>({
    queryKey: queryKeys.paystackCustomer(query),
    queryFn: () =>
      apiClient.get<PaystackCustomer>(
        `/api/admin/paystack/customer?query=${encodeURIComponent(query)}`,
      ),
    enabled: enabled && query.trim().length > 0,
    retry: false,
  });

export const usePaystackRefund = () => {
  const qc = useQueryClient();
  return useMutation<
    { status: string | null; refundedAmount: number; currency: string | null },
    ApiError,
    { reference: string; amount?: number }
  >({
    mutationFn: (input) => apiClient.post("/api/admin/paystack/refund", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.paystackTransactions() });
      void qc.invalidateQueries({ queryKey: queryKeys.paystackBalance() });
      void qc.invalidateQueries({ queryKey: queryKeys.auditLogs() });
    },
  });
};

export const usePaystackSubscriptionAction = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, { code: string; action: "enable" | "disable" }>({
    mutationFn: ({ code, action }) =>
      apiClient.post<void>(`/api/admin/paystack/subscription/${code}/${action}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.auditLogs() });
      void qc.invalidateQueries({ queryKey: queryKeys.adminSubscriptions() });
    },
  });
};

// Recent rows from the transactional outbox. Real messages written by the
// modules via IEventPublisher and drained by the OutboxDispatcher.
export type OutboxMessage = {
  id: string;
  type: string;
  payload: string;
  occurredAt: string;
  processedAt: string | null;
};

export const useOutboxMessages = (pendingOnly = false) =>
  useQuery<OutboxMessage[]>({
    queryKey: ["admin", "outbox", pendingOnly],
    queryFn: () =>
      apiClient.get<OutboxMessage[]>(`/api/events/outbox?pendingOnly=${pendingOnly}`),
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
