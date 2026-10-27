import "server-only";

import { getActivePracticeAttempt } from "@/lib/api/generated/endpoints/practice/practice";
import { getDashboard as fetchDashboard } from "@/lib/api/generated/endpoints/progress/progress";
import { listMyUnits } from "@/lib/api/generated/endpoints/academics/academics";
import type {
  ActiveAttemptView,
  DashboardView,
  UnitSummary,
} from "@/lib/api/generated/model";
import { ListMyUnitsResponse } from "@/lib/api/generated/zod/academics/academics.zod";
import { GetActivePracticeAttemptResponse } from "@/lib/api/generated/zod/practice/practice.zod";
import { GetDashboardResponse } from "@/lib/api/generated/zod/progress/progress.zod";
import { load, type Loaded } from "@/lib/api/server";

export type DashboardData = {
  dashboard: DashboardView;
  units: UnitSummary[];
  /** The live attempt with serverNow, for the countdown banner. */
  attempt: ActiveAttemptView | null;
};

/**
 * Everything the dashboard shows, from the caller's own records only.
 * Uncached on purpose: the data is user scoped (see src/lib/api/server.ts).
 */
export async function getDashboardData(): Promise<Loaded<DashboardData>> {
  return load(
    async (init) => {
      const [dashboard, units] = await Promise.all([
        fetchDashboard(init).then((d) => GetDashboardResponse.parse(d)),
        listMyUnits(undefined, init).then((u) => ListMyUnitsResponse.parse(u)),
      ]);
      let attempt: ActiveAttemptView | null = null;
      if (dashboard.activeAttempt) {
        const active = await getActivePracticeAttempt(init);
        attempt = active
          ? GetActivePracticeAttemptResponse.parse(active)
          : null;
      }
      return { dashboard, units, attempt };
    },
    { next: "/dashboard" },
  );
}
