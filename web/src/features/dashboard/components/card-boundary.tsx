"use client";

import * as Sentry from "@sentry/nextjs";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Component, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type BoundaryProps = { name: string; children: ReactNode };
type BoundaryState = { failed: boolean };

class Boundary extends Component<
  BoundaryProps & { onRetry: () => void },
  BoundaryState
> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    Sentry.captureException(error, {
      tags: { page: "dashboard", card: this.props.name },
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-lg border bg-card p-4"
      >
        <p className="text-base">This card did not load.</p>
        <Button
          variant="outline"
          className="min-h-11 px-4"
          onClick={() => {
            this.setState({ failed: false });
            this.props.onRetry();
          }}
        >
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }
}

/** Keeps one broken card from taking down the whole dashboard. */
export function CardBoundary({ name, children }: BoundaryProps) {
  const router = useRouter();
  return (
    <Boundary name={name} onRetry={() => router.refresh()}>
      {children}
    </Boundary>
  );
}
