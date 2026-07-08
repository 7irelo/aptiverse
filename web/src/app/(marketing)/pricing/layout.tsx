import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, honest pricing in ZAR for students, families, and tutors. Start free.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
