import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** A button or link that gets the user started. */
  action?: ReactNode;
  /** Heading level for the title, so it fits the page outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
};

/**
 * Inline "nothing here yet" block for cards and sections. Explains what will
 * appear and offers the next step, never a fake number or placeholder data.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  headingLevel = 3,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
      </span>
      <Heading className="text-base font-semibold">{title}</Heading>
      {description ? (
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
