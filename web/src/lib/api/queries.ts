"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, openEventStream } from "@/lib/api/fetcher";
import {
  BURSARIES,
  CHILDREN,
  CLASSES,
  NOTIFICATIONS,
  CAREERS,
  type Assessment,
  type Goal,
  type Subject,
  type PracticeTest,
  type Tutor,
  type Course,
  type Bursary,
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
  tutors: () => ["tutors"] as const,
  tutor: (id: string) => ["tutor", id] as const,
  courses: () => ["courses"] as const,
  course: (id: string) => ["course", id] as const,
  bursaries: () => ["bursaries"] as const,
  children: () => ["children"] as const,
  classes: () => ["classes"] as const,
  notifications: () => ["notifications"] as const,
  pastPapers: () => ["past-papers"] as const,
  diary: () => ["diary"] as const,
  counsellors: () => ["counsellors"] as const,
  rewards: () => ["rewards"] as const,
  careers: () => ["careers"] as const,
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

export const useCourses = () =>
  useQuery<Course[]>({
    queryKey: queryKeys.courses(),
    queryFn: () => apiClient.get<Course[]>("/api/marketplace/courses"),
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

export const useRewards = () =>
  useQuery<Reward[]>({
    queryKey: queryKeys.rewards(),
    queryFn: () => apiClient.get<Reward[]>("/api/goals/rewards"),
  });

export const useCareers = () =>
  useQuery<Career[]>({
    queryKey: queryKeys.careers(),
    queryFn: () => apiClient.get<Career[]>("/api/careers"),
  });

export const useBursaries = () =>
  useQuery<Bursary[]>({
    queryKey: queryKeys.bursaries(),
    queryFn: () => apiClient.get<Bursary[]>("/api/bursaries"),
  });

export const useChildren = () =>
  useQuery<Child[]>({
    queryKey: queryKeys.children(),
    queryFn: () => apiClient.get<Child[]>("/api/entitlements/children"),
  });

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
