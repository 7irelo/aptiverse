import "server-only";

import { apiFetchWithEtag } from "@/lib/api/fetcher";
import {
  getGetGoalUrl,
  getMastery,
  listGoals,
} from "@/lib/api/generated/endpoints/progress/progress";
import type { GoalView } from "@/lib/api/generated/model";
import {
  GetGoalResponse,
  GetMasteryResponse,
  ListGoalsResponse,
} from "@/lib/api/generated/zod/progress/progress.zod";
import { load } from "@/lib/api/server";

export function getMasteryView(next: string) {
  return load(
    async (init) => GetMasteryResponse.parse(await getMastery(undefined, init)),
    { next },
  );
}

/** Open goals (active and at risk) and finished ones, for the two tabs. */
export function getGoalLists(next: string) {
  return load(
    async (init) => {
      const [active, achieved, expired, abandoned] = await Promise.all([
        listGoals({ Status: "active", PageSize: 50 }, init),
        listGoals({ Status: "achieved", PageSize: 50 }, init),
        listGoals({ Status: "expired", PageSize: 50 }, init),
        listGoals({ Status: "abandoned", PageSize: 50 }, init),
      ]);
      return {
        active: ListGoalsResponse.parse(active).items,
        expired: ListGoalsResponse.parse(expired).items,
        completed: [
          ...ListGoalsResponse.parse(achieved).items,
          ...ListGoalsResponse.parse(abandoned).items,
        ],
      };
    },
    { next },
  );
}

/** One goal with its ETag, which later changes send as If-Match. */
export function getGoalWithEtag(id: string) {
  return load(
    async (init) => {
      const { data, etag } = await apiFetchWithEtag<GoalView>(
        getGetGoalUrl(id),
        init,
      );
      return { goal: GetGoalResponse.parse(data), etag };
    },
    { next: `/dashboard/goals/${id}` },
  );
}
