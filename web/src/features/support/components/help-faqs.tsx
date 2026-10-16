import { connection } from "next/server";

import { PageState } from "@/components/shell/page-state";
import { FaqList } from "@/features/support/components/faq-list";
import { groupFaqsByCategory } from "@/features/support/lib/group-faqs";
import { getFaqs } from "@/features/support/server/get-faqs";

/**
 * Fetches FAQs on the server at request time and renders them grouped by
 * category. connection() keeps the API call out of the build, so the build
 * never needs a running API; getFaqs() caches the result for five minutes.
 */
export async function HelpFaqs() {
  await connection();
  const faqs = await getFaqs();
  const groups = groupFaqsByCategory(faqs);

  if (groups.length === 0) {
    return (
      <PageState
        icon="empty"
        title="No questions here yet"
        description="We are still writing answers. Check back soon."
      />
    );
  }

  return <FaqList groups={groups} />;
}
