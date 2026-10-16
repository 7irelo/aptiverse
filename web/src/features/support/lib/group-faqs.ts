import type { FaqResponse } from "@/lib/api/generated/model";

export type FaqGroup = {
  category: string;
  /** Stable, URL-safe id for anchors and aria wiring. */
  slug: string;
  faqs: FaqResponse[];
};

export const FALLBACK_CATEGORY = "General";

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general"
  );
}

const byOrderThenQuestion = (a: FaqResponse, b: FaqResponse) =>
  a.sortOrder - b.sortOrder || a.question.localeCompare(b.question);

/**
 * Groups FAQs by category for display.
 *
 * - Blank categories fall back to "General".
 * - Categories match case-insensitively; the first spelling seen wins.
 * - Inside a group, FAQs sort by sortOrder, then question.
 * - Groups sort by their lowest sortOrder, then name, so the API controls
 *   the page order without a separate category ordering field.
 */
export function groupFaqsByCategory(faqs: readonly FaqResponse[]): FaqGroup[] {
  const groups = new Map<string, FaqGroup>();

  for (const faq of faqs) {
    const category = faq.category.trim() || FALLBACK_CATEGORY;
    const key = category.toLowerCase();
    let group = groups.get(key);
    if (!group) {
      group = { category, slug: slugify(category), faqs: [] };
      groups.set(key, group);
    }
    group.faqs.push(faq);
  }

  const result = [...groups.values()];
  for (const group of result) group.faqs.sort(byOrderThenQuestion);

  return result.sort(
    (a, b) =>
      a.faqs[0].sortOrder - b.faqs[0].sortOrder ||
      a.category.localeCompare(b.category),
  );
}
