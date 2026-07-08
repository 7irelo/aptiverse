import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For tutors",
  description: "List a profile, showcase your qualifications, and get found by students and parents.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
