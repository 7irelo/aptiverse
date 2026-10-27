import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ProgressRing } from "@/components/common/progress-ring";
import { PageShell } from "@/components/shell/page-shell";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { PageState } from "@/components/shell/page-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { stageWords } from "@/features/academics/lib/stage";
import { getStudent } from "@/features/academics/server/get-student";
import { practiceHref } from "@/features/dashboard/lib/pick-todays-focus";
import {
  BANDS,
  bandLabel,
  bandTone,
  masteryPercent,
  sortTopics,
} from "@/features/progress/lib/mastery";
import { getMasteryView } from "@/features/progress/server/loaders";
import type {
  TopicMasteryItem,
  UnitMasteryView,
} from "@/lib/api/generated/model";
import { formatRelativeDay } from "@/lib/format/date";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mastery" };

export default function MasteryPage({
  searchParams,
}: PageProps<"/dashboard/progress/mastery">) {
  return (
    <Suspense
      fallback={
        <div>
          <span className="sr-only">Loading your mastery</span>
          <PageLoading cards={3} />
        </div>
      }
    >
      <Mastery searchParams={searchParams} />
    </Suspense>
  );
}

const header = {
  title: "Mastery",
  description:
    "How well you're answering, topic by topic. Recent answers count more.",
};

async function Mastery({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard/progress/mastery">["searchParams"];
}) {
  const { unit } = await searchParams;
  const next = "/dashboard/progress/mastery";
  const [student, result] = await Promise.all([
    getStudent(next),
    getMasteryView(next),
  ]);
  const words = stageWords(student.stage);

  if (!result.ok) {
    return (
      <PageShell {...header}>
        <PageForbidden
          title="This page is for students."
          description="Mastery comes from a student's own practice."
          action={
            <Button asChild variant="outline" className="min-h-11 px-4">
              <Link href="/dashboard">Go to my dashboard</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }
  const units = [...result.data.units].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  if (units.length === 0) {
    return (
      <PageShell {...header}>
        <EmptyState
          icon={Target}
          headingLevel={2}
          className="bg-card py-12"
          title={`No ${words.nouns} yet`}
          description={`Add a ${words.noun} and practise it to see your mastery here.`}
          action={
            <Button asChild className="min-h-11 px-4">
              <Link href="/dashboard/subjects">Add {words.nouns}</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }

  const legend = (
    <ul className="flex flex-wrap gap-2" aria-label="Mastery bands">
      {BANDS.map((b) => (
        <li key={b.label}>
          <Badge variant="outline" title={b.range}>
            {b.label}: {b.range}
          </Badge>
        </li>
      ))}
    </ul>
  );

  if (typeof unit === "string") {
    const selected = units.find((u) => u.studyUnitId === unit);
    if (!selected) {
      return (
        <PageShell {...header}>
          <PageState
            icon="not-found"
            title={`We couldn't find that ${words.noun}. It may have been removed.`}
          >
            <Button asChild variant="outline" className="min-h-11 px-4">
              <Link href="/dashboard/progress/mastery">
                See all {words.nouns}
              </Link>
            </Button>
          </PageState>
        </PageShell>
      );
    }
    return (
      <PageShell {...header}>
        <UnitDetail unit={selected} allLabel={`All ${words.nouns}`} />
      </PageShell>
    );
  }

  const noEvidence = units.every((u) => u.score === null);

  return (
    <PageShell {...header}>
      {legend}
      {noEvidence ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border bg-card p-4">
          <p className="text-base">
            No evidence yet. Mastery comes from practice answers, so finish one
            practice test to see your first numbers.
          </p>
          <Button asChild className="min-h-11 px-4">
            <Link href="/dashboard/practice">Start practising</Link>
          </Button>
        </div>
      ) : null}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {units.map((u) => {
          const pct = masteryPercent(u.score);
          const practised = u.topics.filter((t) => t.score !== null).length;
          return (
            <li key={u.studyUnitId}>
              <Link
                href={`/dashboard/progress/mastery?unit=${u.studyUnitId}`}
                className="flex min-h-11 items-center gap-4 rounded-lg border bg-card p-4 hover:bg-muted"
              >
                {pct === null ? (
                  <span
                    aria-hidden="true"
                    className="size-12 shrink-0 rounded-full border-4 border-dashed border-muted"
                  />
                ) : (
                  <ProgressRing
                    value={pct}
                    size={48}
                    strokeWidth={6}
                    label={`${u.name} mastery`}
                  />
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold">{u.name}</span>
                  <span className={cn("text-sm", bandTone(u.band))}>
                    {pct === null
                      ? "No evidence yet"
                      : `${bandLabel(u.band)}, ${pct}%`}
                    {u.earlyRead && pct !== null ? ", early read" : null}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {practised} topics practised of {u.topics.length}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}

function UnitDetail({
  unit,
  allLabel,
}: {
  unit: UnitMasteryView;
  allLabel: string;
}) {
  const pct = masteryPercent(unit.score);
  const topics = sortTopics(unit.topics);
  const last = topics
    .map((t) => t.lastEvidenceAt)
    .filter((d): d is string => !!d)
    .sort()
    .pop();
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard/progress/mastery"
        className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {allLabel}
      </Link>
      <section
        aria-labelledby="unit-title"
        className="flex flex-col gap-2 rounded-lg border bg-card p-4"
      >
        <h2 id="unit-title" className="text-lg font-semibold">
          {unit.name}
        </h2>
        {pct === null ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-base text-muted-foreground">
              No evidence yet for {unit.name}.
            </p>
            <Button asChild className="min-h-11 px-4">
              <Link href={practiceHref(unit.studyUnitId)}>
                Practise {unit.name}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="flex flex-wrap items-center gap-2 text-base">
              <span className="text-2xl font-semibold tabular-nums">
                {pct}%
              </span>
              <span className={bandTone(unit.band)}>
                {bandLabel(unit.band)}
              </span>
              {unit.earlyRead ? (
                <Badge
                  variant="outline"
                  title="Based on fewer than 5 answers, so this can move a lot."
                >
                  Early read
                </Badge>
              ) : null}
            </p>
            <p className="text-sm text-muted-foreground">
              From {unit.evidenceQuestions} answers
              {last ? `, last practised ${formatRelativeDay(last)}` : null}.
            </p>
          </>
        )}
      </section>
      <section aria-labelledby="topics-title" className="flex flex-col gap-2">
        <h2 id="topics-title" className="text-lg font-semibold">
          Topics
        </h2>
        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">No topics yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {topics.map((t) => (
              <TopicRow key={t.topic} topic={t} unitId={unit.studyUnitId} />
            ))}
          </ul>
        )}
        {unit.marks ? (
          <p className="text-sm text-muted-foreground">
            Recorded marks: {masteryPercent(unit.marks.score) ?? "No marks yet"}
            {unit.marks.score !== null ? "%" : null}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function TopicRow({
  topic,
  unitId,
}: {
  topic: TopicMasteryItem;
  unitId: string;
}) {
  const pct = masteryPercent(topic.score);
  return (
    <li className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium">{topic.topic}</span>
          <span
            className={cn(
              "shrink-0 text-sm",
              pct === null ? "text-muted-foreground" : "tabular-nums",
            )}
          >
            {pct === null
              ? "No evidence yet"
              : `${pct}%, ${bandLabel(topic.band)}`}
          </span>
        </div>
        {pct === null ? null : (
          <Progress value={pct} aria-label={`${topic.topic}: ${pct}%`} />
        )}
        <span className="text-xs text-muted-foreground">
          {topic.evidenceQuestions}{" "}
          {topic.evidenceQuestions === 1 ? "answer" : "answers"}
          {topic.earlyRead && pct !== null ? ", early read" : null}
          {topic.trend === "up"
            ? ", trending up"
            : topic.trend === "down"
              ? ", trending down"
              : null}
        </span>
      </div>
      <Button asChild variant="outline" className="min-h-11 px-4">
        <Link href={practiceHref(unitId, topic.topic)}>
          Practise<span className="sr-only"> {topic.topic}</span>
        </Link>
      </Button>
    </li>
  );
}
