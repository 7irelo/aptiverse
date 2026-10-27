"use client";

import { BookOpen, Check, CircleAlert, ListChecks, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { humanize } from "@/features/academics/lib/stage";

import type {
  TutorCitation,
  TutorConfirm,
  TutorTool,
} from "../lib/tutor-stream";

export function citationLabel(c: TutorCitation): string {
  const parts = [c.title ?? (c.private ? "Your notes" : "Source")];
  if (c.headingPath.length > 0) parts.push(c.headingPath.join(", "));
  if (c.page != null) parts.push(`page ${c.page}`);
  return parts.join(", ");
}

/** Sources the answer relies on. */
export function CitationList({ citations }: { citations: TutorCitation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-medium text-muted-foreground">Sources</h3>
      <ol className="flex flex-col gap-1">
        {citations.map((c, i) => (
          <li
            key={`${c.chunkId ?? i}-${c.page ?? ""}`}
            className="flex items-start gap-2 text-sm"
          >
            <BookOpen
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <span>
              {citationLabel(c)}
              {c.licence ? (
                <span className="text-muted-foreground">, {c.licence}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const TOOL_LABELS: Record<string, string> = {
  search_curriculum: "Looked through the curriculum",
  search_notes: "Looked through your notes",
  get_mastery: "Checked your recent practice",
  propose_quiz: "Prepared a practice quiz",
};

/** What the tutor did while working on the answer. */
export function ToolActivity({ tools }: { tools: TutorTool[] }) {
  if (tools.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="What the tutor did">
      {tools.map((t, i) => (
        <li
          key={`${t.name}-${i}`}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
        >
          {t.ok ? (
            <Wrench aria-hidden="true" className="size-3" />
          ) : (
            <CircleAlert aria-hidden="true" className="size-3" />
          )}
          {TOOL_LABELS[t.name] ?? humanize(t.name)}
          {t.ok ? null : ", did not work"}
        </li>
      ))}
    </ul>
  );
}

function describeArguments(args: unknown): string[] {
  if (!args || typeof args !== "object") return [];
  const out: string[] = [];
  for (const [key, value] of Object.entries(args as Record<string, unknown>)) {
    if (typeof value === "string" || typeof value === "number") {
      out.push(
        `${humanize(key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase())}: ${value}`,
      );
    } else if (
      Array.isArray(value) &&
      value.every((v) => typeof v === "string")
    ) {
      out.push(`${humanize(key)}: ${value.join(", ")}`);
    }
  }
  return out.slice(0, 6);
}

/** The tutor proposes an action (a practice quiz); the student decides. */
export function ConfirmCard({
  confirm,
  disabled,
  onConfirm,
  onDismiss,
}: {
  confirm: TutorConfirm;
  disabled: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const details = describeArguments(confirm.arguments);
  return (
    <section
      aria-label="Suggested practice"
      className="flex flex-col gap-3 rounded-lg border bg-muted p-3"
    >
      <p className="flex items-center gap-2 font-medium">
        <ListChecks aria-hidden="true" className="size-4" />
        The tutor suggests a practice quiz
      </p>
      {details.length > 0 ? (
        <ul className="text-sm text-muted-foreground">
          {details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          className="min-h-11 px-4"
          disabled={disabled}
          onClick={onConfirm}
        >
          <Check aria-hidden="true" />
          Make the quiz
        </Button>
        <Button
          variant="outline"
          className="min-h-11 px-4"
          disabled={disabled}
          onClick={onDismiss}
        >
          Not now
        </Button>
      </div>
    </section>
  );
}
