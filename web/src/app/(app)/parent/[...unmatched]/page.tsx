import { notFound } from "next/navigation";

// See dashboard/[...unmatched]: keeps unknown /parent/* URLs inside the shell.
export default function UnmatchedParentRoute() {
  notFound();
}
