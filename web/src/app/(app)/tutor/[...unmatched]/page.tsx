import { notFound } from "next/navigation";

// See dashboard/[...unmatched]: keeps unknown /tutor/* URLs inside the shell.
export default function UnmatchedTutorRoute() {
  notFound();
}
