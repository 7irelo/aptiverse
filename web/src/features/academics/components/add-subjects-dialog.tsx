"use client";

import { LoaderCircle, Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FormAlert } from "@/components/common/form-alert";
import { NativeInput } from "@/components/common/native-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  enrolInCapsSubjects,
  useGetSubjectCatalog,
} from "@/lib/api/generated/endpoints/academics/academics";

type AddSubjectsDialogProps = {
  curriculum: string | null;
  grade: number | null;
  /** Names of subjects the student already takes. */
  enrolledNames: string[];
};

const GROUPS = [
  { id: "language", label: "Languages" },
  { id: "compulsory", label: "Compulsory" },
  { id: "elective", label: "Electives" },
] as const;

function groupOf(subject: {
  category: string;
  isCompulsory: boolean;
  languageType?: string | null;
}): (typeof GROUPS)[number]["id"] {
  if (subject.languageType || subject.category === "language") {
    return "language";
  }
  if (subject.isCompulsory) return "compulsory";
  return "elective";
}

/** CAPS catalog picker for high-school students (multi-select). */
export function AddSubjectsDialog({
  curriculum,
  grade,
  enrolledNames,
}: AddSubjectsDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const ready = !!curriculum && !!grade;
  const catalog = useGetSubjectCatalog(
    { Curriculum: curriculum ?? undefined, Grade: grade ?? undefined },
    { query: { enabled: open && ready } },
  );
  const enrolled = useMemo(
    () => new Set(enrolledNames.map((n) => n.toLowerCase())),
    [enrolledNames],
  );

  const subjects = (catalog.data?.subjects ?? []).filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const count = selected.size;
  const total = enrolled.size + count;

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    if (count === 0 || pending) return;
    setPending(true);
    setFailed(false);
    try {
      await enrolInCapsSubjects({
        subjects: [...selected].map((subjectId) => ({
          subjectId,
          teacherName: null,
        })),
      });
      toast.success(`${count} ${count === 1 ? "subject" : "subjects"} added`);
      setSelected(new Set());
      setOpen(false);
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11 w-full px-4 sm:w-auto">
          <Plus aria-hidden="true" />
          Add subjects
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add subjects</DialogTitle>
          <DialogDescription>
            Pick the subjects you take this year. You can change them later.
          </DialogDescription>
        </DialogHeader>
        {!ready ? (
          <p className="text-base text-muted-foreground">
            Add your grade and curriculum in Settings to see the subject list.
          </p>
        ) : catalog.isPending ? (
          <p role="status" className="flex items-center gap-2 text-base">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading subjects
          </p>
        ) : catalog.isError ? (
          <FormAlert>
            <p>We could not load the subject list. Try again.</p>
            <div>
              <Button
                variant="outline"
                className="min-h-11 px-4"
                onClick={() => void catalog.refetch()}
              >
                <RotateCcw aria-hidden="true" />
                Try again
              </Button>
            </div>
          </FormAlert>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject-search" className="text-sm font-medium">
                Search subjects
              </label>
              <NativeInput
                id="subject-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {GROUPS.map((group) => {
              const items = subjects.filter((s) => groupOf(s) === group.id);
              if (items.length === 0) return null;
              return (
                <fieldset key={group.id} className="flex flex-col gap-1">
                  <legend className="mb-1 text-sm font-semibold">
                    {group.label}
                  </legend>
                  {items.map((s) => {
                    const already = enrolled.has(s.name.toLowerCase());
                    const id = `subject-${s.id}`;
                    return (
                      <label
                        key={s.id}
                        htmlFor={id}
                        className="flex min-h-11 items-center gap-3 rounded-md px-2 hover:bg-muted"
                      >
                        <input
                          id={id}
                          type="checkbox"
                          className="size-5 accent-primary"
                          checked={already || selected.has(s.id)}
                          disabled={already}
                          onChange={() => toggle(s.id)}
                        />
                        <span className="flex-1">{s.name}</span>
                        {already ? (
                          <span className="text-sm text-muted-foreground">
                            Already added
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </fieldset>
              );
            })}
            {count > 0 && (total < 6 || total > 9) ? (
              <p className="text-sm text-muted-foreground">
                {(grade ?? 0) >= 10
                  ? "Most learners take 7 subjects."
                  : "Most learners take 9 subjects."}
              </p>
            ) : null}
          </div>
        )}
        {failed ? (
          <FormAlert>
            That did not save. Check your connection and try again.
          </FormAlert>
        ) : null}
        <DialogFooter>
          <Button
            className="min-h-11 px-4"
            disabled={count === 0 || pending}
            onClick={() => void submit()}
          >
            {pending ? (
              <>
                <LoaderCircle aria-hidden="true" className="animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${count} ${count === 1 ? "subject" : "subjects"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
