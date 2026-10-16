import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For parents",
  description: "Support without surveillance. See how each child is doing, in class and out.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
