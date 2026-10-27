import { Check, ChevronLeft, FlagTriangleRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProgressRing } from "@/components/common/progress-ring";
import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { humanize } from "@/features/academics/lib/stage";
import { getUnits } from "@/features/academics/server/loaders";
import {
  AddMilestoneForm,
  GoalActions,
} from "@/features/progress/components/goal-actions";
import {
  criteriaLabel,
  GOAL_STATUS_LABELS,
  goalValueText,
} from "@/features/progress/lib/goals";
import { getGoalWithEtag } from "@/features/progress/server/loaders";
import { formatDate } from "@/lib/format/date";

export const metadata: Metadata = { title: "Goal" };

export default function GoalPage({
  params,
}: PageProps<"/dashboard/goals/[id]">) {
  return (
    <Suspense
      fallback={
        <div>
          <span className="sr-only">Loading this goal</span>
          <PageLoading cards={2} />
        </div>
      }
    >
      <GoalDetail params={params} />
    </Suspense>
  );
}

const back = (
  <Link
    href="/dashboard/goals"
    className="inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline"
  >
    <ChevronLeft aria-hidden="true" className="size-4" />
    All goals
  </Link>
);

async function GoalDetail({
  params,
}: {
  params: PageProps<"/dashboard/goals/[id]">["params"];
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const next = `/dashboard/goals/${id}`;
  const [result, units] = await Promise.all([
    getGoalWithEtag(id),
    getUnits(next),
  ]);
  if (!result.ok && result.reason === "not-found") notFound();
  if (!result.ok) {
    return (
      <PageShell title="Goal" eyebrow={back}>
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
  const { goal, etag } = result.data;
  const unitName = units.ok
    ? units.data.find((u) => u.unitId === goal.studyUnitId)?.name
    : undefined;
  const where = goal.topic || unitName || "this goal";
  const type = goal.criteriaType;
  const sentence = `${criteriaLabel(type)}: ${goalValueText(type, goal.targetValue)}${
    goal.topic ? ` in ${goal.topic}` : ""
  }${unitName ? ` (${unitName})` : ""}`;

  return (
    <PageShell
      title={goal.title}
      eyebrow={back}
      description={sentence}
      actions={<GoalActions goal={goal} etag={etag} where={where} />}
    >
      {goal.status === "achieved" ? (
        <section className="flex items-start gap-3 rounded-lg bg-achievement p-4 text-achievement-foreground">
          <FlagTriangleRight
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0"
          />
          <div>
            <h2 className="font-semibold">Goal complete</h2>
            {goal.achievedAt ? (
              <p>You finished this on {formatDate(goal.achievedAt)}.</p>
            ) : null}
          </div>
        </section>
      ) : goal.status === "abandoned" ? (
        <p className="rounded-lg border bg-card p-4">
          This goal is archived and no longer tracks new work.
        </p>
      ) : goal.status === "expired" ? (
        <p className="rounded-lg border bg-card p-4 text-warning">
          The deadline passed on {formatDate(goal.dueAt)}. Change the deadline
          to keep going, or archive it.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section
          aria-labelledby="summary-title"
          className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:col-span-5"
        >
          <h2 id="summary-title" className="text-base font-semibold">
            Where you are
          </h2>
          <div className="flex items-center gap-4">
            {goal.currentValue === null || goal.progressPercent === null ? (
              <span className="flex size-[72px] shrink-0 items-center justify-center rounded-full border-4 border-dashed border-muted text-center text-xs text-muted-foreground">
                No marks yet
              </span>
            ) : (
              <ProgressRing
                value={goal.progressPercent}
                label={`${goal.title} progress`}
                centerLabel={goalValueText(type, goal.currentValue)}
              />
            )}
            <dl className="flex flex-col gap-1 text-sm">
              <div>
                <dt className="inline text-muted-foreground">Started at </dt>
                <dd className="inline">
                  {goal.baselineValue === null
                    ? "no evidence"
                    : goalValueText(type, goal.baselineValue)}
                </dd>
              </div>
              <div>
                <dt className="inline text-muted-foreground">Target </dt>
                <dd className="inline">
                  {goalValueText(type, goal.targetValue)}
                </dd>
              </div>
              <div>
                <dt className="inline text-muted-foreground">Deadline </dt>
                <dd className="inline">{formatDate(goal.dueAt)}</dd>
              </div>
              <div>
                <dt className="sr-only">Status</dt>
                <dd>
                  <Badge variant="outline">
                    {GOAL_STATUS_LABELS[goal.status] ?? goal.status}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
          {goal.currentValue === null ? (
            <p className="text-sm text-muted-foreground">
              Started with no evidence. Practise {where} to get your first
              number.
            </p>
          ) : null}
        </section>

        <div className="flex flex-col gap-4 lg:col-span-7">
          <section
            aria-labelledby="milestones-title"
            className="flex flex-col gap-3 rounded-lg border bg-card p-4"
          >
            <h2 id="milestones-title" className="text-base font-semibold">
              Milestones
            </h2>
            {goal.milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No milestones yet. Add steps on the way to your target.
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {goal.milestones.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-6 shrink-0 items-center justify-center rounded-full border"
                    >
                      {m.reachedAt ? <Check className="size-4" /> : null}
                    </span>
                    <span className="flex-1">
                      {m.title || goalValueText(type, m.thresholdValue)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {m.reachedAt
                        ? `Reached ${formatDate(m.reachedAt)}`
                        : "Not reached yet"}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {(goal.status === "active" || goal.status === "at_risk") &&
            goal.milestones.length < 5 ? (
              <AddMilestoneForm goal={goal} />
            ) : null}
          </section>

          <section
            aria-labelledby="evidence-title"
            className="flex flex-col gap-3 rounded-lg border bg-card p-4"
          >
            <h2 id="evidence-title" className="text-base font-semibold">
              What counted
            </h2>
            {goal.evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing has counted yet.{" "}
                {type.startsWith("assessment")
                  ? `Submit an assessment${unitName ? ` in ${unitName}` : ""}.`
                  : `Finish a practice test${unitName ? ` in ${unitName}` : ""}.`}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {goal.evidence.map((e, i) => (
                  <li
                    key={`${e.occurredAt}-${i}`}
                    className="flex flex-col gap-0.5 border-b pb-2 last:border-b-0"
                  >
                    <span className="font-medium">
                      {e.link ? (
                        <Link
                          href={e.link}
                          className="underline underline-offset-4"
                        >
                          {e.summary}
                        </Link>
                      ) : (
                        e.summary
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {humanize(e.sourceType)}, {formatDate(e.occurredAt)}
                      {e.valueAfter !== null
                        ? `, now ${goalValueText(type, e.valueAfter)}`
                        : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
