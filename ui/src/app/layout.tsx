import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aptiverse — Grow with confidence",
    template: "%s · Aptiverse",
  },
  description:
    "AI-powered student success platform built for South African Grade 11 & 12 learners. SBA prep, goals, mastery, wellbeing, and bursary navigation in one calm, empowering space.",
  applicationName: "Aptiverse",
  keywords: [
    "Aptiverse",
    "SBA",
    "Grade 12",
    "Matric",
    "South Africa",
    "Bursary",
    "NSFAS",
    "Tutor",
    "AI study",
  ],
  authors: [{ name: "Aptiverse" }],
  openGraph: {
    title: "Aptiverse — Grow with confidence",
    description:
      "Holistic student success: SBA prep, goals, wellbeing, tutors, bursaries.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F6963" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1219" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
