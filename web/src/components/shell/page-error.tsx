"use client";

import { RotateCcw } from "lucide-react";

import { PageState } from "@/components/shell/page-state";
import { Button } from "@/components/ui/button";

type PageErrorProps = {
  title?: string;
  description?: string;
  /** Called by the retry button. In error.tsx pass the `retry` prop. */
  onRetry: () => void;
  className?: string;
};

/** Something failed to load. Always offers a retry. */
export function PageError({
  title = "We could not load this page",
  description = "This is on our side, not yours. Check your connection and try again in a moment.",
  onRetry,
  className,
}: PageErrorProps) {
  return (
    <PageState
      icon="error"
      title={title}
      description={description}
      className={className}
    >
      <Button className="min-h-11 px-4" onClick={() => onRetry()}>
        <RotateCcw aria-hidden="true" />
        Try again
      </Button>
    </PageState>
  );
}
