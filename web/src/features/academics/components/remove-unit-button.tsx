"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { unenrolFromUnit } from "@/lib/api/generated/endpoints/academics/academics";

/** Removes one of the student's units after a confirm. */
export function RemoveUnitButton({
  enrolmentId,
  name,
  noun,
  assessmentCount,
}: {
  enrolmentId: string;
  name: string;
  noun: string;
  assessmentCount: number;
}) {
  const router = useRouter();
  return (
    <ConfirmDialog
      destructive
      trigger={
        <Button variant="ghost" className="min-h-11 px-3">
          <Trash2 aria-hidden="true" />
          Remove<span className="sr-only"> {name}</span>
        </Button>
      }
      title={`Remove ${name}?`}
      description={`This removes ${name} from your list and deletes its ${assessmentCount} ${assessmentCount === 1 ? "assessment" : "assessments"} and marks. You can add it back later.`}
      confirmLabel={`Remove ${noun}`}
      onConfirm={async () => {
        try {
          await unenrolFromUnit(enrolmentId, { Confirm: true });
          toast.success(`${name} removed`);
          router.refresh();
        } catch {
          toast.error(
            "That did not save. Check your connection and try again.",
          );
        }
      }}
    />
  );
}
