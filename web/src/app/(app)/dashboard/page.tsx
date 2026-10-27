import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageForbidden, PageLoading } from "@/components/shell/page-states";
import { Button } from "@/components/ui/button";
import { stageWords } from "@/features/academics/lib/stage";
import { getStudent } from "@/features/academics/server/get-student";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { CardBoundary } from "@/features/dashboard/components/card-boundary";
import {
  ActiveGoalsCard,
  DeadlinesCard,
  NextActionCard,
  ProgressSummaryCard,
  RecentPracticeCard,
  TodaysFocusCard,
  TutorShortcutCard,
} from "@/features/dashboard/components/dashboard-cards";
import { greetingFor } from "@/features/dashboard/lib/nsc-level";
import { pickTodaysFocus } from "@/features/dashboard/lib/pick-todays-focus";
import { getDashboardData } from "@/features/dashboard/server/get-dashboard";
import { ActiveAttemptBanner } from "@/features/practice/components/active-attempt-banner";
import { formatLongDay, sastHour } from "@/lib/format/date";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <div>
      <span className="sr-only">Loading your dashboard</span>
      <PageLoading cards={6} className="max-w-7xl" />
    </div>
  );
}

async function Dashboard() {
  const [student, result] = await Promise.all([
    getStudent("/dashboard"),
    getDashboardData(),
  ]);
  const now = new Date();
  const { me, firstName, stage } = student;
  const words = stageWords(stage);
  const ob = me.onboarding;
  const chips = [
    ob.grade ? `Grade ${ob.grade}` : null,
    ob.curriculum ? ob.curriculum.toUpperCase() : null,
    stage === "university" ? ob.institutionName : null,
  ].filter((c): c is string => !!c);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {greetingFor(sastHour(now))}, {firstName}
          </h1>
          <p className="text-base text-muted-foreground">
            {formatLongDay(now)}
          </p>
          {chips.length > 0 ? (
            <ul className="mt-1 flex flex-wrap gap-2" aria-label="Your studies">
              {chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border px-3 py-1 text-sm text-muted-foreground"
                >
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <SignOutButton variant="ghost" />
      </header>

      {!result.ok ? (
        <PageForbidden />
      ) : result.data.units.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          headingLevel={2}
          className="bg-card py-12"
          title="Let's set up what you study"
          description={`Add your ${words.nouns} and we'll build your dashboard around them.`}
          action={
            <Button asChild className="min-h-11 px-4">
              <Link href="/dashboard/subjects">Add {words.nouns}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <nav aria-label="Quick actions">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Button asChild variant="outline" className="min-h-11 px-4">
                  <Link href="/dashboard/goals?new=1">Set a goal</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="outline" className="min-h-11 px-4">
                  <Link href="/dashboard/practice">Start practice</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="outline" className="min-h-11 px-4">
                  <Link href="/dashboard/subjects">{words.Nouns}</Link>
                </Button>
              </li>
            </ul>
          </nav>

          {result.data.attempt ? (
            <ActiveAttemptBanner
              testId={result.data.attempt.testId}
              testTitle={result.data.attempt.testTitle}
              deadlineAt={result.data.attempt.deadlineAt}
              serverNow={result.data.attempt.serverNow}
              remainingSeconds={result.data.attempt.remainingSeconds}
              paused={result.data.attempt.paused}
            />
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <CardBoundary name="focus">
                <TodaysFocusCard
                  focus={pickTodaysFocus(
                    result.data.dashboard.nextAssessments,
                    result.data.dashboard.weakestTopics,
                    now,
                  )}
                />
              </CardBoundary>
            </div>
            <div className="lg:col-span-4">
              <CardBoundary name="tutor">
                <TutorShortcutCard />
              </CardBoundary>
            </div>
            <div className="lg:col-span-8">
              <CardBoundary name="progress-summary">
                <ProgressSummaryCard
                  units={result.data.units}
                  stage={stage}
                  weakest={result.data.dashboard.weakestTopics}
                />
              </CardBoundary>
            </div>
            <div className="lg:col-span-4">
              <CardBoundary name="deadlines">
                <DeadlinesCard
                  assessments={result.data.dashboard.nextAssessments}
                  now={now}
                />
              </CardBoundary>
            </div>
            <div className="lg:col-span-4">
              <CardBoundary name="next-action">
                <NextActionCard
                  weakest={result.data.dashboard.weakestTopics}
                  units={result.data.units}
                />
              </CardBoundary>
            </div>
            <div className="lg:col-span-4">
              <CardBoundary name="goals">
                <ActiveGoalsCard goals={result.data.dashboard.activeGoals} />
              </CardBoundary>
            </div>
            <div className="lg:col-span-4">
              <CardBoundary name="recent-practice">
                <RecentPracticeCard
                  practice={result.data.dashboard.recentPractice}
                  masteryScore={result.data.dashboard.masteryScore}
                  activity={result.data.dashboard.activityLast7Days}
                />
              </CardBoundary>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
