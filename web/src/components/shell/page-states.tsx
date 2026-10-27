import { Inbox, LockKeyhole, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Page level states: loading, empty, forbidden and the upgrade gate. The
 * error state needs a retry button, so it lives in page-error.tsx as a
 * client component. Every page in the app uses these, so the same situation
 * always looks and reads the same.
 */

/** Skeleton that mirrors PageShell: a header, then a grid of cards. */
export function PageLoading({
  cards = 3,
  className,
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
        className,
      )}
    >
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div
        aria-hidden="true"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: cards }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

type StateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/** The whole page has nothing to show yet. */
export function PageEmpty({
  title = "Nothing here yet",
  description,
  action,
  className,
}: StateProps) {
  return (
    <EmptyState
      icon={Inbox}
      title={title}
      description={description}
      action={action}
      headingLevel={2}
      className={cn("bg-card py-12", className)}
    />
  );
}

/** The user is signed in but not allowed to see this page. */
export function PageForbidden({
  title = "You do not have access to this page",
  description = "If you think you should, ask the person who manages your account, or contact support.",
  action,
  className,
}: StateProps) {
  return (
    <section
      aria-labelledby="forbidden-title"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border bg-card px-4 py-12 text-center text-card-foreground",
        className,
      )}
    >
      <ShieldAlert aria-hidden="true" className="size-8 text-warning" />
      <h2 id="forbidden-title" className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <p className="max-w-prose text-base text-muted-foreground">
        {description}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {action ?? (
          <Button asChild variant="outline" className="min-h-11 px-4">
            <Link href="/dashboard">Back to your dashboard</Link>
          </Button>
        )}
      </div>
    </section>
  );
}

type UpgradeGateProps = {
  /** What the feature is, for example "AI tutor". */
  feature: string;
  description?: string;
  /** Where the upgrade button goes. Billing arrives in Phase 6. */
  upgradeHref?: string;
  className?: string;
};

/**
 * Shown in place of a feature the user's plan does not include. Placeholder
 * until entitlements arrive in Phase 6: it explains, never nags, and the
 * button points at plans.
 */
export function UpgradeGate({
  feature,
  description,
  upgradeHref = "/dashboard/billing",
  className,
}: UpgradeGateProps) {
  return (
    <section
      aria-labelledby="upgrade-title"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border bg-card px-4 py-12 text-center text-card-foreground",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-citron-surface text-on-citron">
        <LockKeyhole aria-hidden="true" className="size-6" />
      </span>
      <h2 id="upgrade-title" className="text-lg font-semibold tracking-tight">
        {feature} is part of a paid plan
      </h2>
      <p className="max-w-prose text-base text-muted-foreground">
        {description ??
          `Upgrade your plan to unlock ${feature}. Everything you have done so far stays where it is.`}
      </p>
      <Button
        asChild
        className="mt-2 min-h-11 bg-citron-surface px-4 text-on-citron hover:bg-citron-surface-hover"
      >
        <Link href={upgradeHref}>
          <Sparkles aria-hidden="true" />
          See plans
        </Link>
      </Button>
    </section>
  );
}
