import { z } from "zod";

import type { Navigation } from "@/components/shell/nav";

/**
 * Validates a navigation payload from the API (GET /navigation, planned).
 * Kept apart from nav.ts so client components do not bundle zod.
 */
export const navigationSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          href: z.string().startsWith("/"),
          icon: z.string(),
          permission: z.string().optional(),
          entitlement: z.string().optional(),
        }),
      ),
    }),
  ),
  primary: z.array(z.string()),
}) satisfies z.ZodType<Navigation>;
