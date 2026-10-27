"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormAlert } from "@/components/common/form-alert";
import {
  describedBy,
  FieldShell,
  NativeInput,
  NativeSelect,
} from "@/components/common/native-fields";
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
import { TERTIARY_LEVEL_OPTIONS } from "@/features/academics/lib/stage";
import { errorCode, fieldErrors } from "@/lib/api/fetcher";
import { createTertiaryCourse } from "@/lib/api/generated/endpoints/academics/academics";

type Errors = Partial<Record<"name" | "code" | "level" | "lecturer", string>>;

function validate(values: {
  name: string;
  code: string;
  level: string;
  lecturer: string;
}): Errors {
  const errors: Errors = {};
  const name = values.name.trim();
  if (name.length < 2 || name.length > 120) {
    errors.name = "Give the course a name of 2 to 120 characters.";
  }
  if (values.code && !/^[A-Za-z0-9 ]{1,20}$/.test(values.code.trim())) {
    errors.code = "Use up to 20 letters, digits and spaces.";
  }
  if (!values.level) errors.level = "Pick your study level.";
  if (values.lecturer.length > 80) {
    errors.lecturer = "Keep the lecturer name under 80 characters.";
  }
  return errors;
}

/** Single course create for university students. */
export function AddCourseDialog({
  defaultLevel,
}: {
  defaultLevel: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    name: "",
    code: "",
    level: defaultLevel ?? "",
    duration: "semester",
    lecturer: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const found = validate(values);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setPending(true);
    try {
      await createTertiaryCourse({
        name: values.name.trim(),
        courseCode: values.code.trim() || null,
        level: values.level,
        duration: values.duration,
        startedOn: null,
        lecturerName: values.lecturer.trim() || null,
      });
      toast.success("Course added");
      setOpen(false);
      setValues((v) => ({ ...v, name: "", code: "", lecturer: "" }));
      router.refresh();
    } catch (error) {
      const server = fieldErrors(error);
      if (Object.keys(server).length > 0) {
        setErrors({
          name: server.name,
          code: server.courseCode,
          level: server.level,
          lecturer: server.lecturerName,
        });
      } else if (errorCode(error) === "academics.already_enrolled") {
        setFormError(`You already have a course called ${values.name.trim()}.`);
      } else {
        setFormError("That did not save. Check your connection and try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11 w-full px-4 sm:w-auto">
          <Plus aria-hidden="true" />
          Add course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add course</DialogTitle>
          <DialogDescription>
            Add a course you are registered for.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <FieldShell id="course-name" label="Course name" error={errors.name}>
            <NativeInput
              id="course-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name || undefined}
              aria-describedby={describedBy("course-name", false, errors.name)}
              required
            />
          </FieldShell>
          <FieldShell
            id="course-code"
            label="Course code (optional)"
            hint="For example MAM1000W"
            error={errors.code}
          >
            <NativeInput
              id="course-code"
              value={values.code}
              onChange={(e) => set("code", e.target.value)}
              aria-invalid={!!errors.code || undefined}
              aria-describedby={describedBy("course-code", true, errors.code)}
            />
          </FieldShell>
          <FieldShell
            id="course-level"
            label="Study level"
            error={errors.level}
          >
            <NativeSelect
              id="course-level"
              value={values.level}
              onChange={(e) => set("level", e.target.value)}
              aria-invalid={!!errors.level || undefined}
              aria-describedby={describedBy(
                "course-level",
                false,
                errors.level,
              )}
            >
              <option value="">Choose one</option>
              {TERTIARY_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </FieldShell>
          <FieldShell id="course-duration" label="Duration">
            <NativeSelect
              id="course-duration"
              value={values.duration}
              onChange={(e) => set("duration", e.target.value)}
            >
              <option value="semester">One semester</option>
              <option value="full_year">Full year (two semesters)</option>
            </NativeSelect>
          </FieldShell>
          <FieldShell
            id="course-lecturer"
            label="Lecturer (optional)"
            error={errors.lecturer}
          >
            <NativeInput
              id="course-lecturer"
              value={values.lecturer}
              onChange={(e) => set("lecturer", e.target.value)}
              aria-invalid={!!errors.lecturer || undefined}
              aria-describedby={describedBy(
                "course-lecturer",
                false,
                errors.lecturer,
              )}
            />
          </FieldShell>
          {formError ? <FormAlert>{formError}</FormAlert> : null}
          <DialogFooter>
            <Button type="submit" className="min-h-11 px-4" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircle aria-hidden="true" className="animate-spin" />
                  Adding...
                </>
              ) : (
                "Add course"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
