import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageLoading } from "@/components/shell/page-states";
import { TutorPage } from "@/features/tutor/components/tutor-page";

export const metadata: Metadata = { title: "AI tutor" };

export default function TutorConversationPage({
  params,
}: PageProps<"/dashboard/tutor/[conversationId]">) {
  return (
    <Suspense fallback={<PageLoading cards={2} />}>
      <Conversation params={params} />
    </Suspense>
  );
}

async function Conversation({
  params,
}: {
  params: PageProps<"/dashboard/tutor/[conversationId]">["params"];
}) {
  const { conversationId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) notFound();
  return <TutorPage conversationId={conversationId} />;
}
