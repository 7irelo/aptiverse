"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type DetailDrawerProps = {
  /** The element that opens the drawer. Omit when controlling `open`. */
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  /** Sticky actions at the bottom, for example Save and Cancel. */
  footer?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Side panel for the details of one record (a user, a payout, a question),
 * so lists keep their place. Full width on phones, a side panel from sm up.
 */
export function DetailDrawer({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
}: DetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="right"
        showCloseButton={false}
        {...(description ? {} : { "aria-describedby": undefined })}
        className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="flex-row items-start justify-between gap-2 border-b">
          <div className="flex flex-col gap-0.5">
            <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
            {description ? (
              <SheetDescription>{description}</SheetDescription>
            ) : null}
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="size-11 shrink-0">
              <X aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <div className="flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
