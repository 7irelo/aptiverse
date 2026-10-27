"use client";

import { MessageSquare } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Phone-sized conversation list in a sheet. */
export function ConversationsSheet({ children }: { children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="min-h-11 px-3">
          <MessageSquare aria-hidden="true" />
          Conversations
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto p-4">
        <SheetHeader className="p-0">
          <SheetTitle>Conversations</SheetTitle>
          <SheetDescription>Pick up an earlier chat.</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
