// Admission and progression targets: what the student researched, and the
// goals generated from it.
//
// This lives beside queries.ts rather than inside it purely to keep a large
// concurrent edit off one file. Same conventions: apiClient, TanStack Query,
// no fetch() from components.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/queries";

export type AdmissionTargetKind = "admission" | "progression";
export type AdmissionStage = "next_year" | "honours" | "masters" | "phd";
export type AdmissionOverallUnit = "aps" | "average";
export type AdmissionTargetStatus = "active" | "archived";

/** One granular requirement: a study unit and the minimum the student researched. */
export type AdmissionRequirement = {
  id: string;
  /** Subject slug ("math") or course practice key ("uct:calculus-i"). Never rendered raw. */
  unitId: string;
  minimumPercent: number;
  /** The goal generated from this requirement, if one has been. */
  goalId?: string | null;
};

export type AdmissionTarget = {
  id: string;
  /** Free text, as the student typed it. There is no institution catalog. */
  institution: string;
  programme: string;
  kind: AdmissionTargetKind;
  stage?: AdmissionStage | null;
  overallUnit?: AdmissionOverallUnit | null;
  overallRequired?: number | null;
  deadline?: string | null;
  sourceNote?: string | null;
  status: AdmissionTargetStatus;
  createdAt: string;
  requirements: AdmissionRequirement[];
};

export type RequirementInput = { unitId: string; minimumPercent: number };

export type CreateAdmissionTargetInput = {
  institution: string;
  programme: string;
  kind?: AdmissionTargetKind;
  stage?: AdmissionStage | null;
  overallUnit?: AdmissionOverallUnit | null;
  overallRequired?: number | null;
  deadline?: string | null;
  sourceNote?: string | null;
  requirements?: RequirementInput[];
};

export type UpdateAdmissionTargetInput = Partial<CreateAdmissionTargetInput> & {
  status?: AdmissionTargetStatus;
};

export const targetKeys = {
  all: () => ["admission-targets"] as const,
  one: (id: string) => ["admission-targets", id] as const,
};

export const useAdmissionTargets = () =>
  useQuery<AdmissionTarget[]>({
    queryKey: targetKeys.all(),
    queryFn: () => apiClient.get<AdmissionTarget[]>("/api/admission-targets"),
  });

export const useAdmissionTarget = (id: string | null | undefined) =>
  useQuery<AdmissionTarget>({
    queryKey: targetKeys.one(id ?? ""),
    queryFn: () => apiClient.get<AdmissionTarget>(`/api/admission-targets/${id}`),
    enabled: !!id,
  });

export const useCreateAdmissionTarget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdmissionTargetInput) =>
      apiClient.post<AdmissionTarget>("/api/admission-targets", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: targetKeys.all() });
    },
  });
};

export const useUpdateAdmissionTarget = () => {
  const qc = useQueryClient();
  return useMutation<AdmissionTarget, Error, UpdateAdmissionTargetInput & { id: string }>({
    mutationFn: ({ id, ...patch }) =>
      apiClient.patch<AdmissionTarget>(`/api/admission-targets/${id}`, patch),
    onSuccess: (target) => {
      void qc.invalidateQueries({ queryKey: targetKeys.all() });
      void qc.invalidateQueries({ queryKey: targetKeys.one(target.id) });
    },
  });
};

export const useDeleteAdmissionTarget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/api/admission-targets/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: targetKeys.all() });
    },
  });
};

// --- goal generation ----------------------------------------------------

// What the server says about a rewarded goal before it exists. Mirrors
// GET /api/goals/baseline.
type GoalBaseline = {
  kind: string;
  rewarded: boolean;
  baseline?: number | null;
  minimumTarget?: number | null;
  projectedPoints?: number | null;
};

/** One requirement the caller wants turned into a goal. */
export type GoalCandidate = {
  requirementId: string;
  unitId: string;
  unitName: string;
  minimumPercent: number;
};

export type GenerateGoalsResult = {
  created: number;
  /** Requirements we deliberately did not turn into a goal, and why. */
  skipped: { unitName: string; reason: string }[];
  /** Genuine failures. Empty is the normal case. */
  failed: { unitName: string; reason: string }[];
};

/**
 * Turns requirements into goals through the existing POST /api/goals.
 *
 * The subtlety this exists to handle: rewarded goals are priced on the gain
 * over a baseline captured at creation, and the goals endpoint refuses a target
 * at or below that baseline with a 400. A student whose practice is already at
 * 78% cannot be given a "reach 70%" goal, and should not be: they are clear,
 * which is good news, not an error. So we ask for the baseline first and skip
 * those quietly. The 400 is a rule we agree with, not a failure to route around.
 */
export const useGenerateTargetGoals = () => {
  const qc = useQueryClient();

  return useMutation<
    GenerateGoalsResult,
    Error,
    { targetId: string; programme: string; institution: string; deadline?: string | null; candidates: GoalCandidate[] }
  >({
    mutationFn: async ({ targetId, programme, institution, deadline, candidates }) => {
      const result: GenerateGoalsResult = { created: 0, skipped: [], failed: [] };

      for (const c of candidates) {
        try {
          // Ask what the bar is before aiming at it, exactly as the goal
          // dialog does.
          const params = new URLSearchParams({ kind: "practice_score", subjectId: c.unitId });
          const baseline = await apiClient.get<GoalBaseline>(`/api/goals/baseline?${params}`);
          const at = baseline.baseline ?? 0;

          if (at >= c.minimumPercent) {
            result.skipped.push({
              unitName: c.unitName,
              reason: `your practice is already at ${at}%`,
            });
            continue;
          }

          const goal = await apiClient.post<{ id: string }>("/api/goals", {
            title: `${c.unitName} to ${c.minimumPercent}%`,
            description: `${programme} at ${institution} needs ${c.minimumPercent}% in ${c.unitName}. This goal verifies from your practice scores.`,
            kind: "practice_score",
            targetValue: c.minimumPercent,
            subjectId: c.unitId,
            category: "career",
            dueDate: deadline ?? undefined,
          });

          // Link it back so a second run does not duplicate it.
          await apiClient.patch(`/api/admission-targets/${targetId}/requirements/${c.requirementId}`, {
            goalId: goal.id,
          });
          result.created += 1;
        } catch (err) {
          result.failed.push({
            unitName: c.unitName,
            reason: err instanceof Error ? err.message : "could not create that goal",
          });
        }
      }

      return result;
    },
    onSuccess: (_r, vars) => {
      void qc.invalidateQueries({ queryKey: queryKeys.goals() });
      void qc.invalidateQueries({ queryKey: targetKeys.all() });
      void qc.invalidateQueries({ queryKey: targetKeys.one(vars.targetId) });
    },
  });
};

/** Clears a requirement's goal link, for when the student deleted the goal. */
export const useUnlinkRequirementGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ targetId, requirementId }: { targetId: string; requirementId: string }) =>
      apiClient.patch(`/api/admission-targets/${targetId}/requirements/${requirementId}`, {
        goalId: null,
      }),
    onSuccess: (_r, vars) => {
      void qc.invalidateQueries({ queryKey: targetKeys.all() });
      void qc.invalidateQueries({ queryKey: targetKeys.one(vars.targetId) });
    },
  });
};
