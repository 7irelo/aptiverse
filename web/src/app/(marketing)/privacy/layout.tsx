import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Aptiverse collects, how we use it, and your rights under POPIA.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
