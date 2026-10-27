import { CalendarClock, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { NativeSelect } from "@/components/common/native-fields";
import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ASSESSMENT_GROUPS,
  assessmentGroup,
  markText,
  STATE_LABELS,
} from "@/features/academics/lib/assessments";
import {
  humanize,
  percentText,
  stageWords,
} from "@/features/academics/lib/stage";
import { getAssessments, getUnits } from "@/features/academics/server/loaders";
import { getStudent } from "@/features/academics/server/get-student";
import { unitValue } from "@/features/dashboard/components/dashboard-cards";
import { nscLevel } from "@/features/dashboard/lib/nsc-level";
import { formatDueLabel } from "@/lib/format/date";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Assessments" };

const UUID = /^[0-9a-f-]{36}$/i;

export default function AssessmentsPage({
  searchParams,
}: PageProps<"/dashboard/assessments">) {
  return (
    <Suspense fallback={<PageLoading cards={4} />}>
      <Assessments searchParams={searchParams} />
    </Suspense>
  );
}

async function Assessments({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard/assessments">["searchParams"];
}) {
  const { unit: rawUnit } = await searchParams;
  // Invalid filter values are ignored, never an error.
  const unit =
    typeof rawUnit === "string" && UUID.test(rawUnit) ? rawUnit : undefined;
  const next = "/dashboard/assessments";
  const [student, units, list] = await Promise.all([
    getStudent(next),
    getUnits(next),
    getAssessments({ EnrolmentId: unit, PageSize: 100 }, next),
  ]);
  const { stage } = student;
  const words = stageWords(stage);
  const hs = stage === "high_school";

  const header = {
    title: "Assessments",
    description: hs
      ? "Your SBA tasks, tests and exams."
      : "Your assignments, tests and exams.",
  };

  if (!units.ok || !list.ok) {
    return (
      <PageShell {...header}>
        <PageForbidden />
      </PageShell>
    );
  }

  const addButton = (
    <Button asChild className="min-h-11 w-full px-4 sm:w-auto">
      <Link
        href={
          unit
            ? `/dashboard/assessments/new?unit=${unit}`
            : "/dashboard/assessments/new"
        }
      >
        <Plus aria-hidden="true" />
        {hs ? "Add SBA" : "Add assessment"}
      </Link>
    </Button>
  );

  if (units.data.length === 0) {
    return (
      <PageShell {...header}>
        <EmptyState
          headingLevel={2}
          className="bg-card py-12"
          title={`Add your ${words.nouns} first`}
          description={`Assessments belong to a ${words.noun}.`}
          action={
            <Button asChild className="min-h-11 px-4">
              <Link href="/dashboard/subjects">Add {words.nouns}</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  const now = new Date();
  const items = list.data.items;
  const groups = ASSESSMENT_GROUPS.map((group) => ({
    group,
    items: items.filter((item) => assessmentGroup(item, now) === group),
  })).filter((g) => g.items.length > 0);

  return (
    <PageShell {...header} width="wide" actions={addButton}>
      <form
        method="get"
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        aria-label="Filter assessments"
      >
        <div className="flex flex-col gap-1.5 sm:w-72">
          <label htmlFor="filter-unit" className="text-sm font-medium">
            {words.Noun}
          </label>
          <NativeSelect id="filter-unit" name="unit" defaultValue={unit ?? ""}>
            <option value="">All {words.nouns}</option>
            {units.data.map((u) => (
              <option key={u.enrolmentId} value={u.enrolmentId}>
                {u.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button type="submit" variant="outline" className="min-h-11 px-4">
          Filter
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {items.length === 0 ? (
            unit ? (
              <EmptyState
                headingLevel={2}
                title="No assessments match these filters."
                action={
                  <Button asChild variant="outline" className="min-h-11 px-4">
                    <Link href="/dashboard/assessments">Clear filters</Link>
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={CalendarClock}
                headingLevel={2}
                className="bg-card py-12"
                title="No assessments yet"
                description={
                  hs
                    ? "Add your SBA tasks, tests and exams so nothing sneaks up on you."
                    : "Add your assignments, tests and exams so nothing sneaks up on you."
                }
                action={addButton}
              />
            )
          ) : (
            groups.map(({ group, items: rows }) => (
              <section
                key={group}
                aria-labelledby={`group-${group}`}
                className="flex flex-col gap-2"
              >
                <h2
                  id={`group-${group}`}
                  className={cn(
                    "text-base font-semibold",
                    group === "Overdue" && "text-warning",
                  )}
                >
                  {group}
                </h2>
                <ul className="flex flex-col gap-2">
                  {rows.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/dashboard/assessments/${a.id}`}
                        className="flex min-h-11 flex-col gap-1 rounded-lg border bg-card p-3 hover:bg-muted"
                      >
                        <span className="font-medium">{a.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {a.unitName},{" "}
                          {formatDueLabel(a.dueAt, {
                            done: group === "Done",
                            now,
                          })}
                        </span>
                        <span className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="outline">{humanize(a.type)}</Badge>
                          <Badge variant="secondary">
                            {STATE_LABELS[a.state] ?? humanize(a.state)}
                          </Badge>
                          <span
                            className={cn(
                              a.percent == null
                                ? "text-muted-foreground"
                                : "font-semibold tabular-nums",
                            )}
                          >
                            {markText(a)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <section
          aria-labelledby="weighting-title"
          className="flex h-fit flex-col gap-3 rounded-lg border bg-card p-4 lg:sticky lg:top-4 lg:col-span-4"
        >
          <h2 id="weighting-title" className="text-base font-semibold">
            {hs ? "Predicted results" : "Course averages"}
          </h2>
          <ul className="flex flex-col gap-3">
            {units.data.map((u) => {
              const value = unitValue(u, stage);
              const marked = Math.round(u.weighting.gradedWeightPercent);
              return (
                <li key={u.enrolmentId} className="flex flex-col gap-0.5">
                  <span className="font-medium">{u.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {value === null
                      ? "No marks yet"
                      : hs
                        ? `${marked}% of SBA marked, predicted ${percentText(value)} (level ${nscLevel(value)})`
                        : `${marked}% of course marked, average ${percentText(value)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
