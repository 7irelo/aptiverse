import { Lock, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { ConversationResponse } from "@/lib/api/generated/model";
import { formatDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

import { ConversationsSheet } from "./conversations-sheet";

/** Conversation list: a rail on desktop, a sheet on phones. */
export function ConversationList({
  conversations,
  currentId,
}: {
  conversations: ConversationResponse[];
  currentId: string | null;
}) {
  if (conversations.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">
        Your conversations will show here.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-1">
      {conversations.map((c) => (
        <li key={c.id}>
          <Link
            href={`/dashboard/tutor/${c.id}`}
            aria-current={c.id === currentId ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-col justify-center rounded-md px-3 py-1.5 hover:bg-muted",
              c.id === currentId && "bg-muted font-medium",
            )}
          >
            <span className="truncate text-sm">
              {c.title || "Untitled chat"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(c.updatedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TutorShell({
  title,
  conversations,
  currentId,
  children,
}: {
  title: string;
  conversations: ConversationResponse[];
  currentId: string | null;
  children: ReactNode;
}) {
  const list = (
    <ConversationList conversations={conversations} currentId={currentId} />
  );
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
      <aside
        aria-label="Conversations"
        className="hidden flex-col gap-3 lg:flex"
      >
        <NewChatButton />
        {list}
      </aside>
      <div className="mx-auto flex w-full max-w-[760px] min-w-0 flex-col gap-4">
        <header className="flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <div className="flex gap-2 lg:hidden">
            <ConversationsSheet>{list}</ConversationsSheet>
            <NewChatButton />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function NewChatButton() {
  return (
    <Button asChild variant="outline" className="min-h-11 px-3">
      <Link href="/dashboard/tutor">
        <Plus aria-hidden="true" />
        New chat
      </Link>
    </Button>
  );
}

/** The tutor is off while a practice test is in progress. */
export function TutorBlocked({
  testId,
  testTitle,
}: {
  testId: string;
  testTitle: string;
}) {
  return (
    <section
      aria-labelledby="tutor-blocked-title"
      className="flex flex-col items-center gap-3 rounded-lg border bg-card px-4 py-12 text-center"
    >
      <Lock aria-hidden="true" className="size-8 text-muted-foreground" />
      <h2 id="tutor-blocked-title" className="text-lg font-semibold">
        The tutor is off during your test
      </h2>
      <p className="max-w-prose text-base text-muted-foreground">
        It comes back as soon as you submit {testTitle}.
      </p>
      <Button asChild className="min-h-11 px-4">
        <Link href={`/dashboard/practice/${testId}`}>Back to your test</Link>
      </Button>
    </section>
  );
}
