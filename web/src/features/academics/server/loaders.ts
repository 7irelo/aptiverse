import "server-only";

import {
  getMyAssessment,
  listMyAssessments,
  listMyUnits,
} from "@/lib/api/generated/endpoints/academics/academics";
import type { ListMyAssessmentsParams } from "@/lib/api/generated/model";
import {
  GetMyAssessmentResponse,
  ListMyAssessmentsResponse,
  ListMyUnitsResponse,
} from "@/lib/api/generated/zod/academics/academics.zod";
import { load } from "@/lib/api/server";

/** The caller's units (enrolments). User scoped, uncached. */
export function getUnits(next: string) {
  return load(
    async (init) =>
      ListMyUnitsResponse.parse(await listMyUnits(undefined, init)),
    { next },
  );
}

/** The caller's assessments, by due date. */
export function getAssessments(params: ListMyAssessmentsParams, next: string) {
  return load(
    async (init) =>
      ListMyAssessmentsResponse.parse(await listMyAssessments(params, init)),
    { next },
  );
}

export function getAssessment(id: string) {
  return load(
    async (init) =>
      GetMyAssessmentResponse.parse(await getMyAssessment(id, init)),
    { next: `/dashboard/assessments/${id}` },
  );
}
