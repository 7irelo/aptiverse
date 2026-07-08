import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Aptiverse, in clear language.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
