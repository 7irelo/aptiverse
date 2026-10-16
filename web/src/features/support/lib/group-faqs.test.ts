import { describe, expect, it } from "vitest";

import type { FaqResponse } from "@/lib/api/generated/model";

import { FALLBACK_CATEGORY, groupFaqsByCategory, slugify } from "./group-faqs";

let next = 0;
const faq = (overrides: Partial<FaqResponse>): FaqResponse => ({
  id: `00000000-0000-7000-8000-${String(++next).padStart(12, "0")}`,
  question: "Question",
  answer: "Answer",
  category: "General",
  sortOrder: 0,
  ...overrides,
});

describe("groupFaqsByCategory", () => {
  it("returns no groups for no FAQs", () => {
    expect(groupFaqsByCategory([])).toEqual([]);
  });

  it("groups by category and sorts FAQs by sortOrder then question", () => {
    const groups = groupFaqsByCategory([
      faq({ category: "Billing", question: "B", sortOrder: 5 }),
      faq({ category: "Billing", question: "A", sortOrder: 5 }),
      faq({ category: "Billing", question: "C", sortOrder: 1 }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].faqs.map((f) => f.question)).toEqual(["C", "A", "B"]);
  });

  it("orders groups by their lowest sortOrder, then by name", () => {
    const groups = groupFaqsByCategory([
      faq({ category: "Practice", sortOrder: 10 }),
      faq({ category: "Getting started", sortOrder: 1 }),
      faq({ category: "Account", sortOrder: 10 }),
      faq({ category: "Practice", sortOrder: 2 }),
    ]);

    expect(groups.map((g) => g.category)).toEqual([
      "Getting started",
      "Practice",
      "Account",
    ]);
  });

  it("merges categories case-insensitively and keeps the first spelling", () => {
    const groups = groupFaqsByCategory([
      faq({ category: "Getting Started", sortOrder: 1 }),
      faq({ category: "getting started ", sortOrder: 2 }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("Getting Started");
    expect(groups[0].faqs).toHaveLength(2);
  });

  it("puts blank categories under the fallback", () => {
    const [group] = groupFaqsByCategory([faq({ category: "   " })]);
    expect(group.category).toBe(FALLBACK_CATEGORY);
    expect(group.slug).toBe("general");
  });

  it("does not mutate the input", () => {
    const input = [
      faq({ sortOrder: 2, question: "Z" }),
      faq({ sortOrder: 1, question: "Y" }),
    ];
    const copy = structuredClone(input);
    groupFaqsByCategory(input);
    expect(input).toEqual(copy);
  });
});

describe("slugify", () => {
  it("makes URL-safe ids", () => {
    expect(slugify("Account & support")).toBe("account-support");
    expect(slugify("  Getting started  ")).toBe("getting-started");
    expect(slugify("!!!")).toBe("general");
  });
});
