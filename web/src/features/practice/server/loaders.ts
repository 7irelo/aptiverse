import "server-only";

import {
  getActiveGeneration,
  getActivePracticeAttempt,
  getPracticeAttempt,
  getPracticeAttemptResults,
  getPracticeTest,
  listPracticeTests,
} from "@/lib/api/generated/endpoints/practice/practice";
import type { ActiveAttemptView } from "@/lib/api/generated/model";
import {
  GetActiveGenerationResponse,
  GetActivePracticeAttemptResponse,
  GetPracticeAttemptResponse,
  GetPracticeAttemptResultsResponse,
  GetPracticeTestResponse,
  ListPracticeTestsResponse,
} from "@/lib/api/generated/zod/practice/practice.zod";
import { load } from "@/lib/api/server";

/** The practice hub: tests, the running generation and the live attempt. */
export function getPracticeHub() {
  return load(
    async (init) => {
      const [tests, generation, attempt] = await Promise.all([
        listPracticeTests({ PageSize: 50 }, init),
        getActiveGeneration(init),
        getActivePracticeAttempt(init),
      ]);
      return {
        tests: ListPracticeTestsResponse.parse(tests),
        generation: generation
          ? GetActiveGenerationResponse.parse(generation)
          : null,
        attempt: attempt
          ? GetActivePracticeAttemptResponse.parse(attempt)
          : null,
      };
    },
    { next: "/dashboard/practice" },
  );
}

/** The live attempt, or null when there is none. */
export function getActiveAttempt(next: string) {
  return load(
    async (init): Promise<ActiveAttemptView | null> => {
      const attempt = await getActivePracticeAttempt(init);
      return attempt ? GetActivePracticeAttemptResponse.parse(attempt) : null;
    },
    { next },
  );
}

/** Instructions (never answers) and, while active, the attempt to resume. */
export function getTest(id: string) {
  return load(
    async (init) =>
      GetPracticeTestResponse.parse(await getPracticeTest(id, init)),
    { next: `/dashboard/practice/${id}` },
  );
}

export function getAttempt(id: string, next: string) {
  return load(
    async (init) =>
      GetPracticeAttemptResponse.parse(await getPracticeAttempt(id, init)),
    { next },
  );
}

/** The marked paper; 409 practice.results_not_ready comes back as a value. */
export function getResults(attemptId: string, next: string) {
  return load(
    async (init) =>
      GetPracticeAttemptResultsResponse.parse(
        await getPracticeAttemptResults(attemptId, init),
      ),
    { next, allowConflict: true },
  );
}
