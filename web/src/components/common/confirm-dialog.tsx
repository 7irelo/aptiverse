"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
  /** The element that opens the dialog, usually a Button. */
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Rose styling for actions that delete or cannot be undone. */
  destructive?: boolean;
  /** Runs on confirm. The dialog stays open, busy, until it settles. */
  onConfirm: () => void | Promise<void>;
};

/** Asks the user to confirm an action before it runs. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="min-h-11" disabled={pending}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            variant={destructive ? "destructive" : "default"}
            className="min-h-11"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? (
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
            ) : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
