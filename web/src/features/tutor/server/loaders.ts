import "server-only";

import {
  getConversation,
  listConversations,
} from "@/lib/api/generated/endpoints/ai-tutor/ai-tutor";
import { getActivePracticeAttempt } from "@/lib/api/generated/endpoints/practice/practice";
import {
  GetConversationResponse,
  ListConversationsResponse,
} from "@/lib/api/generated/zod/ai-tutor/ai-tutor.zod";
import { GetActivePracticeAttemptResponse } from "@/lib/api/generated/zod/practice/practice.zod";
import { load } from "@/lib/api/server";

/**
 * The tutor's sidebar list and the live attempt check. The tutor is off
 * while a practice attempt runs (the API refuses messages too), so the page
 * shows the blocked state up front instead of letting the student type.
 */
export function getTutorHome(next: string) {
  return load(
    async (init) => {
      const [list, attempt] = await Promise.all([
        listConversations({ PageSize: 30 }, init),
        getActivePracticeAttempt(init).catch(() => undefined),
      ]);
      return {
        conversations: ListConversationsResponse.parse(list).items,
        attempt: attempt
          ? GetActivePracticeAttemptResponse.parse(attempt)
          : null,
      };
    },
    { next },
  );
}

export function getTutorConversation(id: string) {
  return load(
    async (init) =>
      GetConversationResponse.parse(await getConversation(id, init)),
    { next: `/dashboard/tutor/${id}` },
  );
}
