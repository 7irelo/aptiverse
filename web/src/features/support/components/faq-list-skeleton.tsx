/** Placeholder shown while FAQs load. Matches the FaqList layout to avoid jumps. */
export function FaqListSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-8">
      <span className="sr-only">Loading questions</span>
      {[0, 1].map((group) => (
        <div key={group} className="flex flex-col gap-2" aria-hidden="true">
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
          <div className="flex flex-col divide-y rounded-lg border bg-card px-4">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex min-h-12 items-center py-3">
                <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
