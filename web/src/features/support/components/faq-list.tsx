import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqGroup } from "@/features/support/lib/group-faqs";

type FaqListProps = {
  groups: FaqGroup[];
};

/** Renders grouped FAQs. Server Component; only the accordion is a client leaf. */
export function FaqList({ groups }: FaqListProps) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section
          key={group.slug}
          aria-labelledby={`faq-${group.slug}`}
          className="flex flex-col gap-2"
        >
          <h2
            id={`faq-${group.slug}`}
            className="text-lg font-semibold tracking-tight"
          >
            {group.category}
          </h2>
          <Accordion
            type="multiple"
            className="rounded-lg border bg-card px-4 text-card-foreground"
          >
            {group.faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="min-h-12 items-center gap-3 py-3 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-base leading-relaxed whitespace-pre-line text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  );
}
