import type { Metadata } from "next";
import { Suspense } from "react";

import { PageLoading } from "@/components/shell/page-states";
import { TutorPage } from "@/features/tutor/components/tutor-page";

export const metadata: Metadata = { title: "AI tutor" };

export default function NewTutorChatPage() {
  return (
    <Suspense fallback={<PageLoading cards={2} />}>
      <TutorPage conversationId={null} />
    </Suspense>
  );
}
