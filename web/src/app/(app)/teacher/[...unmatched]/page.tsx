import { notFound } from "next/navigation";

// See dashboard/[...unmatched]: keeps unknown /teacher/* URLs inside the shell.
export default function UnmatchedTeacherRoute() {
  notFound();
}
