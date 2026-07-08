import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything you need to do well and stay well, from your first term to your last exam.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
