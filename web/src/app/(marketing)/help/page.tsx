import type { Metadata } from "next";
import { Suspense } from "react";

import { PageContainer } from "@/components/shell/page-container";
import { FaqListSkeleton } from "@/features/support/components/faq-list-skeleton";
import { HelpFaqs } from "@/features/support/components/help-faqs";

export const metadata: Metadata = {
  title: "Help and FAQs",
  description: "Answers to common questions about Aptiverse.",
};

/**
 * Walking-skeleton page. The heading is part of the static shell; the FAQ
 * list streams in from the API on the server (see HelpFaqs).
 */
export default function HelpPage() {
  return (
    <PageContainer className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Help and FAQs</h1>
        <p className="text-base text-muted-foreground">
          Quick answers to the questions students ask us most.
        </p>
      </header>
      <Suspense fallback={<FaqListSkeleton />}>
        <HelpFaqs />
      </Suspense>
    </PageContainer>
  );
}
