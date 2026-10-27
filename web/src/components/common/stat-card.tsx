import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  /**
   * The figure to show. Pass null when there is no data yet: the card then
   * says so instead of showing a zero that looks like a real result.
   */
  value: ReactNode | null;
  /** Short context under the value, for example "this week". */
  hint?: string;
  /** Shown instead of the value when it is null. */
  emptyHint?: string;
  icon?: LucideIcon;
  className?: string;
};

/** A single headline figure with its label. */
export function StatCard({
  label,
  value,
  hint,
  emptyHint = "No data yet",
  icon: Icon,
  className,
}: StatCardProps) {
  const empty = value === null || value === undefined;
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border bg-card p-4 text-card-foreground",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        ) : null}
      </div>
      {empty ? (
        <p className="text-base text-muted-foreground">{emptyHint}</p>
      ) : (
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      )}
      {hint && !empty ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
