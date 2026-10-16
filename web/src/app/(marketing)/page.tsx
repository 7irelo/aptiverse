import { BookOpenCheck, HeartHandshake, Target } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const highlights = [
  {
    icon: BookOpenCheck,
    title: "Practise what you are studying",
    body: "Questions pitched at your level, whether you are in Grade 10 or second year.",
  },
  {
    icon: Target,
    title: "See where you stand",
    body: "Track progress by subject and know what to focus on next.",
  },
  {
    icon: HeartHandshake,
    title: "Look after yourself too",
    body: "A calm space for wellbeing that is never graded or ranked.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b bg-brand-surface text-on-brand-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:py-20">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Study support that fits how you learn
          </h1>
          <p className="max-w-xl text-lg text-pretty">
            Aptiverse helps high school and university students practise, track
            progress and stay on top of their work.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-citron-surface px-5 text-base text-on-citron hover:bg-citron-surface-hover"
            >
              <Link href="/help">Questions? Visit Help</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="highlights"
        className="mx-auto w-full max-w-5xl px-4 py-12"
      >
        <h2 id="highlights" className="sr-only">
          What you can do
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex flex-col gap-2 rounded-lg border bg-card p-5"
            >
              <Icon aria-hidden="true" className="size-6" />
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-base text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
