import { LinkIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Shown for a missing, malformed, used or expired emailed link. */
export function InvalidLink({
  body,
  action,
}: {
  body: string;
  action: { href: string; label: string };
}) {
  return (
    <section
      aria-labelledby="invalid-link-title"
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground"
    >
      <LinkIcon aria-hidden="true" className="size-6 text-muted-foreground" />
      <h2
        id="invalid-link-title"
        className="text-lg font-semibold tracking-tight"
      >
        This link has expired or was already used
      </h2>
      <p className="text-base text-muted-foreground">{body}</p>
      <Button asChild size="lg" className="min-h-11 w-full text-base">
        <Link href={action.href}>{action.label}</Link>
      </Button>
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center justify-center rounded-md text-base font-medium underline-offset-4 hover:underline"
      >
        Back to log in
      </Link>
    </section>
  );
}
