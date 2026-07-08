import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Why we are building Aptiverse, and who it is for.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
