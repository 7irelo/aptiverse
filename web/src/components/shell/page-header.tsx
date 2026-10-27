import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** Primary actions. Stack under the title on phones, sit right on sm up. */
  actions?: ReactNode;
  /** Small line above the title, for example a breadcrumb or subject name. */
  eyebrow?: ReactNode;
  className?: string;
};

/** The page's one h1, with an optional description and actions. */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {eyebrow ? (
          <div className="text-sm font-medium text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-base text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2 sm:shrink-0">{actions}</div>
      ) : null}
    </header>
  );
}
