import Link from "next/link";
import { notFound } from "next/navigation";

import { PageState } from "@/components/shell/page-state";
import { UpgradeGate } from "@/components/shell/page-states";
import { Button } from "@/components/ui/button";
import type { Stage } from "@/features/academics/lib/stage";
import { getStudent } from "@/features/academics/server/get-student";

import type { ChatMessage } from "../hooks/use-tutor-chat";
import { getTutorConversation, getTutorHome } from "../server/loaders";
import { TutorChat } from "./tutor-chat";
import { TutorBlocked, TutorShell } from "./tutor-layout";

function suggestionsFor(stage: Stage): string[] {
  return stage === "university"
    ? [
        "Explain a key idea from my course with an example",
        "Give me a practice question at my level",
        "Help me plan an answer for an essay question",
        "Summarise the key ideas in a topic I am studying",
      ]
    : [
        "Explain a topic like I'm seeing it for the first time",
        "Give me an exam-style question on a topic I am studying",
        "Check my working on this problem",
        "Summarise the topics for my next test",
      ];
}

/** Shared body of /dashboard/tutor and /dashboard/tutor/[conversationId]. */
export async function TutorPage({
  conversationId,
}: {
  conversationId: string | null;
}) {
  const next = conversationId
    ? `/dashboard/tutor/${conversationId}`
    : "/dashboard/tutor";
  const [student, home, conversation] = await Promise.all([
    getStudent(next),
    getTutorHome(next),
    conversationId
      ? getTutorConversation(conversationId)
      : Promise.resolve(null),
  ]);

  if (!home.ok) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">AI tutor</h1>
        <UpgradeGate
          feature="AI tutor"
          description="Get step-by-step help in any subject, at your level."
        />
      </div>
    );
  }

  if (conversation && !conversation.ok) {
    if (conversation.reason === "not-found") notFound();
    return (
      <TutorShell
        title="AI tutor"
        conversations={home.data.conversations}
        currentId={null}
      >
        <PageState
          icon="not-found"
          title="We could not find that conversation."
        >
          <Button asChild className="min-h-11 px-4">
            <Link href="/dashboard/tutor">Start a new chat</Link>
          </Button>
        </PageState>
      </TutorShell>
    );
  }

  const detail = conversation?.ok ? conversation.data : null;
  const title = detail?.title || "AI tutor";

  if (home.data.attempt) {
    return (
      <TutorShell
        title={title}
        conversations={home.data.conversations}
        currentId={conversationId}
      >
        <TutorBlocked
          testId={home.data.attempt.testId}
          testTitle={home.data.attempt.testTitle}
        />
      </TutorShell>
    );
  }

  const initialMessages: ChatMessage[] = (detail?.messages ?? []).map((m) => ({
    key: m.id,
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
    savedStatus: m.status,
  }));

  return (
    <TutorShell
      title={title}
      conversations={home.data.conversations}
      currentId={conversationId}
    >
      <TutorChat
        key={conversationId ?? "new"}
        conversationId={conversationId}
        initialMessages={initialMessages}
        suggestions={suggestionsFor(student.stage)}
        unitLabel={null}
      />
    </TutorShell>
  );
}
