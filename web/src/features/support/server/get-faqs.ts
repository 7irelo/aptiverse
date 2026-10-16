import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { listFaqs } from "@/lib/api/generated/endpoints/support/support";
import type { FaqResponse } from "@/lib/api/generated/model";
import { ListFaqsResponse } from "@/lib/api/generated/zod/support/support.zod";

export const FAQS_CACHE_TAG = "support:faqs";

/**
 * Loads published FAQs from the API for Server Components.
 *
 * Cached for five minutes and tagged so a future admin edit can call
 * revalidateTag(FAQS_CACHE_TAG). Failed requests throw and are not cached,
 * so the segment error boundary shows a retry state instead of stale data.
 */
export async function getFaqs(): Promise<FaqResponse[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(FAQS_CACHE_TAG);

  const data = await listFaqs();
  return ListFaqsResponse.parse(data);
}
