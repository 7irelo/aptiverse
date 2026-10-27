import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { getLegalVersions as fetchLegalVersions } from "@/lib/api/generated/endpoints/identity/identity";
import type { LegalVersionsResponse } from "@/lib/api/generated/model";
import { GetLegalVersionsResponse } from "@/lib/api/generated/zod/identity/identity.zod";

export const LEGAL_VERSIONS_CACHE_TAG = "legal:versions";

/**
 * The current Terms and Privacy Policy versions (public GET
 * /legal/versions). Sign-up sends them back as the consent record, so they
 * must match what /terms and /privacy show. Cached briefly; a failure throws
 * so the page offers a retry rather than a consent with no version.
 */
export async function getLegalVersions(): Promise<LegalVersionsResponse> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(LEGAL_VERSIONS_CACHE_TAG);

  return GetLegalVersionsResponse.parse(await fetchLegalVersions());
}
