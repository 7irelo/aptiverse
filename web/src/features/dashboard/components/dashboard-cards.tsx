import {
  ArrowRight,
  CalendarClock,
  Flag,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { percentText, type Stage } from "@/features/academics/lib/stage";
import { groupDeadlines } from "@/features/dashboard/lib/deadlines";
import { activeDays, nscLevel } from "@/features/dashboard/lib/nsc-level";
import {
  practiceHref,
  type TodaysFocus,
} from "@/features/dashboard/lib/pick-todays-focus";
import { goalProgressText } from "@/features/progress/lib/goals";
import { formatDueLabel } from "@/lib/format/date";
import { cn } from "@/lib/utils";

import type {
  ActivityDay,
  DashboardAssessment,
  DashboardTopic,
  GoalSummary,
  RecentPracticeView,
  UnitSummary,
} from "@/lib/api/generated/model";

const linkButton = "min-h-11 px-4";

/** A dashboard card: an h2, optional footer link, body. */
export function DashCard({
  id,
  title,
  icon: Icon,
  footer,
  children,
  className,
}: {
  id: string;
  title: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground",
        className,
      )}
    >
      <h2
        id={`${id}-title`}
        className="flex items-center gap-2 text-base font-semibold"
      >
        {Icon ? (
          <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        ) : null}
        {title}
      </h2>
      <div className="flex flex-1 flex-col gap-3">{children}</div>
      {footer ? <div className="flex flex-wrap gap-2">{footer}</div> : null}
    </section>
  );
}

export function TodaysFocusCard({ focus }: { focus: TodaysFocus | null }) {
  return (
    <DashCard id="focus" title="Today's focus" icon={Target}>
      {focus ? (
        <>
          <p className="text-lg font-medium">{focus.title}</p>
          <div>
            <Button asChild className={linkButton}>
              <Link href={focus.href}>
                {focus.actionLabel}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-base text-muted-foreground">
            Nothing urgent today. A short practice test keeps things moving.
          </p>
          <div>
            <Button asChild variant="outline" className={linkButton}>
              <Link href="/dashboard/practice">Start practice</Link>
            </Button>
          </div>
        </>
      )}
    </DashCard>
  );
}

/** Predicted (high school) or average (university) value of a unit, or null. */
export function unitValue(unit: UnitSummary, stage: Stage): number | null {
  const w = unit.weighting;
  return stage === "high_school"
    ? (w.predictedPercent ?? w.currentPercent ?? null)
    : (w.currentPercent ?? null);
}

export function ProgressSummaryCard({
  units,
  stage,
  weakest,
}: {
  units: UnitSummary[];
  stage: Stage;
  weakest: DashboardTopic[];
}) {
  const shown = units.slice(0, 4);
  const names = new Map(units.map((u) => [u.unitId, u.name]));
  const topics = weakest.filter((t) => t.score !== null && t.topic).slice(0, 2);
  return (
    <DashCard
      id="progress-summary"
      title={stage === "high_school" ? "Predicted results" : "Course averages"}
      footer={
        <Button asChild variant="outline" className={linkButton}>
          <Link href="/dashboard/progress/mastery">See all</Link>
        </Button>
      }
    >
      <ul className="flex flex-col gap-3">
        {shown.map((unit) => {
          const value = unitValue(unit, stage);
          return (
            <li key={unit.enrolmentId} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/dashboard/subjects`}
                  className="min-w-0 truncate font-medium underline-offset-4 hover:underline"
                >
                  {unit.name}
                </Link>
                {value === null ? (
                  <span className="shrink-0 text-sm text-muted-foreground">
                    No marks yet
                  </span>
                ) : (
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {percentText(value)}
                    {stage === "high_school"
                      ? ` (level ${nscLevel(value)})`
                      : null}
                  </span>
                )}
              </div>
              {value === null ? null : (
                <Progress
                  value={Math.min(100, Math.max(0, value))}
                  aria-label={`${unit.name}: ${percentText(value)}`}
                />
              )}
            </li>
          );
        })}
      </ul>
      {topics.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Needs work:{" "}
          {topics.map((t, i) => (
            <span key={`${t.studyUnitId}-${t.topic}`}>
              {i > 0 ? ", " : null}
              <Link
                href={practiceHref(t.studyUnitId, t.topic)}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {t.topic}
              </Link>
              {names.get(t.studyUnitId)
                ? ` in ${names.get(t.studyUnitId)}`
                : null}
            </span>
          ))}
        </p>
      ) : null}
    </DashCard>
  );
}

export function NextActionCard({
  weakest,
  units,
}: {
  weakest: DashboardTopic[];
  units: UnitSummary[];
}) {
  const topic = weakest.find((t) => t.score !== null && t.topic);
  const unitName = topic
    ? units.find((u) => u.unitId === topic.studyUnitId)?.name
    : undefined;
  return (
    <DashCard id="next-action" title="Next best action" icon={Sparkles}>
      {topic && topic.score !== null ? (
        <>
          <p className="text-base">
            <span className="font-medium">{topic.topic}</span>
            {unitName ? ` in ${unitName}` : null}
          </p>
          <p className="text-sm text-muted-foreground">
            Your weakest topic, {Math.round(topic.score * 100)}% over{" "}
            {topic.evidenceQuestions}{" "}
            {topic.evidenceQuestions === 1 ? "question" : "questions"}.
          </p>
          <div>
            <Button asChild className={linkButton}>
              <Link href={practiceHref(topic.studyUnitId, topic.topic)}>
                Start drill
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-base text-muted-foreground">
            Do a practice test and we&apos;ll suggest what to work on next.
          </p>
          <div>
            <Button asChild variant="outline" className={linkButton}>
              <Link href="/dashboard/practice">Go to practice</Link>
            </Button>
          </div>
        </>
      )}
    </DashCard>
  );
}

export function DeadlinesCard({
  assessments,
  now,
}: {
  assessments: DashboardAssessment[];
  now?: Date;
}) {
  const groups = groupDeadlines(assessments, 5, now);
  return (
    <DashCard
      id="deadlines"
      title="Upcoming deadlines"
      icon={CalendarClock}
      footer={
        <Button asChild variant="outline" className={linkButton}>
          <Link href="/dashboard/assessments">All assessments</Link>
        </Button>
      }
    >
      {groups.length === 0 ? (
        <>
          <p className="text-base text-muted-foreground">
            Nothing due in the next two weeks.
          </p>
          <div>
            <Button asChild variant="outline" className={linkButton}>
              <Link href="/dashboard/assessments/new">Add an assessment</Link>
            </Button>
          </div>
        </>
      ) : (
        groups.map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-1">
            <h3
              className={cn(
                "text-sm font-medium",
                group === "Overdue" ? "text-warning" : "text-muted-foreground",
              )}
            >
              {group}
            </h3>
            <ul className="flex flex-col">
              {items.map((a) => (
                <li key={a.assessmentId}>
                  <Link
                    href={`/dashboard/assessments/${a.assessmentId}`}
                    className="flex min-h-11 flex-col justify-center rounded-md py-1 hover:bg-muted"
                  >
                    <span className="font-medium">{a.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {a.unitName}, {formatDueLabel(a.dueAt, { now })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </DashCard>
  );
}

export function RecentPracticeCard({
  practice,
  masteryScore,
  activity,
}: {
  practice: RecentPracticeView;
  masteryScore: number | null;
  activity: ActivityDay[];
}) {
  const days = activeDays(activity);
  const rows: { label: string; value: string | null }[] = [
    {
      label: "Overall mastery",
      value:
        masteryScore === null ? null : `${Math.round(masteryScore * 100)}%`,
    },
    {
      label: "Average practice score",
      value: percentText(practice.averageScorePercent),
    },
    {
      label: "Best practice score",
      value: percentText(practice.bestScorePercent),
    },
  ];
  return (
    <DashCard id="recent-practice" title="Your practice">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd
              className={cn(
                row.value === null
                  ? "text-base text-muted-foreground"
                  : "text-xl font-semibold tabular-nums",
              )}
            >
              {row.value ?? "No marks yet"}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">
        {practice.attemptsGraded}{" "}
        {practice.attemptsGraded === 1 ? "test" : "tests"} marked,{" "}
        {practice.minutesOnTask} minutes of practice. Active on {days} of the
        last 7 days.
      </p>
    </DashCard>
  );
}

export function TutorShortcutCard() {
  return (
    <DashCard id="tutor" title="AI tutor" icon={Sparkles}>
      <p className="text-base">Stuck on something? Ask the AI tutor.</p>
      <div>
        <Button asChild variant="outline" className={linkButton}>
          <Link href="/dashboard/tutor">Open tutor</Link>
        </Button>
      </div>
    </DashCard>
  );
}

export function ActiveGoalsCard({ goals }: { goals: GoalSummary[] }) {
  const shown = goals.slice(0, 3);
  return (
    <DashCard
      id="goals"
      title="Active goals"
      icon={Flag}
      footer={
        shown.length > 0 ? (
          <Button asChild variant="outline" className={linkButton}>
            <Link href="/dashboard/goals">All goals</Link>
          </Button>
        ) : undefined
      }
    >
      {shown.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No active goals"
          description="Set a goal you can measure, like finishing three practice tests this week."
          action={
            <Button asChild variant="outline" className={linkButton}>
              <Link href="/dashboard/goals?new=1">Set a goal</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((goal) => (
            <li key={goal.id} className="flex flex-col gap-1.5">
              <Link
                href={`/dashboard/goals/${goal.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {goal.title}
              </Link>
              <span className="text-sm text-muted-foreground">
                {goalProgressText(goal)}
              </span>
              {goal.progressPercent === null ? null : (
                <Progress
                  value={goal.progressPercent}
                  aria-label={`${goal.title}: ${Math.round(goal.progressPercent)}% of the way`}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );
}
