import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For students",
  description: "Study with a plan, not panic. Know what to practise and where your marks are heading.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
