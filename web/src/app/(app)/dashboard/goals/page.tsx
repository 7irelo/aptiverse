import { Flag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getUnits } from "@/features/academics/server/loaders";
import { getStudent } from "@/features/academics/server/get-student";
import { CreateGoalDialog } from "@/features/progress/components/create-goal-dialog";
import {
  GOAL_STATUS_LABELS,
  goalProgressText,
} from "@/features/progress/lib/goals";
import { getGoalLists } from "@/features/progress/server/loaders";
import type { GoalSummary } from "@/lib/api/generated/model";
import { formatDate, formatDueLabel } from "@/lib/format/date";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage({
  searchParams,
}: PageProps<"/dashboard/goals">) {
  return (
    <Suspense
      fallback={
        <div>
          <span className="sr-only">Loading your goals</span>
          <PageLoading cards={3} />
        </div>
      }
    >
      <Goals searchParams={searchParams} />
    </Suspense>
  );
}

const header = {
  title: "Goals",
  description: "Goals the app can check from your real work.",
};

async function Goals({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard/goals">["searchParams"];
}) {
  const query = await searchParams;
  const view = query.view === "completed" ? "completed" : "active";
  const next = "/dashboard/goals";
  const [student, lists, units] = await Promise.all([
    getStudent(next),
    getGoalLists(next),
    getUnits(next),
  ]);

  if (!lists.ok || !units.ok) {
    return (
      <PageShell {...header}>
        <PageForbidden
          title="This page is for students."
          action={
            <Button asChild variant="outline" className="min-h-11 px-4">
              <Link href="/dashboard">Go to my dashboard</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  const unitNames = new Map(units.data.map((u) => [u.unitId, u.name]));
  const active = [...lists.data.active, ...lists.data.expired].sort(
    (a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt),
  );
  const completed = lists.data.completed;
  const shown = view === "active" ? active : completed;
  const dialog = (
    <CreateGoalDialog
      stage={student.stage}
      units={units.data.map((u) => ({
        unitId: u.unitId,
        enrolmentId: u.enrolmentId,
        name: u.name,
      }))}
      openOnLoad={query.new === "1"}
    />
  );

  return (
    <PageShell {...header} actions={dialog}>
      <nav aria-label="Goal lists">
        <ul className="flex gap-2">
          {(
            [
              ["active", `Active (${active.length})`, "/dashboard/goals"],
              [
                "completed",
                `Completed (${completed.length})`,
                "/dashboard/goals?view=completed",
              ],
            ] as const
          ).map(([key, label, href]) => (
            <li key={key}>
              <Link
                href={href}
                aria-current={view === key ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium",
                  view === key ? "border-primary bg-muted" : "hover:bg-muted",
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {active.length === 0 && completed.length === 0 ? (
        <EmptyState
          icon={Flag}
          headingLevel={2}
          className="bg-card py-12"
          title="No goals yet"
          description="Set a goal the app can check, like finishing 5 practice tests or reaching 70% in a topic."
          action={
            <Button asChild className="min-h-11 px-4">
              <Link href="/dashboard/goals?new=1">Set your first goal</Link>
            </Button>
          }
        />
      ) : shown.length === 0 ? (
        <p className="rounded-lg border bg-card p-4 text-base text-muted-foreground">
          {view === "active"
            ? "No active goals. Set a new one when you're ready."
            : "Completed goals will show here."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              unitName={unitNames.get(goal.studyUnitId)}
            />
          ))}
        </ul>
      )}
    </PageShell>
  );
}

function GoalCard({
  goal,
  unitName,
}: {
  goal: GoalSummary;
  unitName?: string;
}) {
  const expired = goal.status === "expired";
  return (
    <li>
      <Link
        href={`/dashboard/goals/${goal.id}`}
        className="flex h-full min-h-11 flex-col gap-2 rounded-lg border bg-card p-4 hover:bg-muted"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="font-semibold">{goal.title}</span>
          {goal.status !== "active" ? (
            <Badge variant={goal.status === "achieved" ? "default" : "outline"}>
              {GOAL_STATUS_LABELS[goal.status] ?? goal.status}
            </Badge>
          ) : null}
        </span>
        <span className="text-sm text-muted-foreground">
          {unitName ?? "Removed"}
        </span>
        <span className="text-sm">{goalProgressText(goal)}</span>
        {goal.progressPercent === null ? null : (
          <Progress
            value={goal.progressPercent}
            aria-label={`${goal.title}: ${Math.round(goal.progressPercent)}% of the way`}
          />
        )}
        <span
          className={cn(
            "text-sm",
            expired ? "text-warning" : "text-muted-foreground",
          )}
        >
          {expired
            ? `Deadline passed on ${formatDate(goal.dueAt)}`
            : formatDueLabel(goal.dueAt, {
                done: goal.status !== "active" && goal.status !== "at_risk",
              })}
        </span>
      </Link>
    </li>
  );
}
