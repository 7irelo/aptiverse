import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

/** Page heading for the auth shell: one h1 and an optional subhead. */
export function AuthHeading({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-base text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

/** Skeleton for an auth form: a few fields and a button. */
export function AuthFormSkeleton({
  fields = 2,
  label = "Loading",
}: {
  fields?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <span className="sr-only">{label}</span>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <Skeleton aria-hidden="true" className="h-11 w-full" />
    </div>
  );
}

/** Full-route loading state for auth pages (loading.tsx). */
export function AuthPageLoading({
  fields = 2,
  label = "Loading",
}: {
  fields?: number;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton aria-hidden="true" className="h-8 w-56" />
      <AuthFormSkeleton fields={fields} label={label} />
    </div>
  );
}
