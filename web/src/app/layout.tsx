import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";

import { QueryProvider } from "@/components/providers/query-provider";

import "./globals.css";

// Font: Frygia is the brand face, but the old app loaded it from a third
// party CDN under an open licensing question and no font files exist in the
// repo. Until licensed .woff2 files are added (src/fonts + next/font/local),
// the system UI stack in src/styles/tokens.css is the documented fallback.

export const metadata: Metadata = {
  title: {
    default: "Aptiverse",
    template: "%s | Aptiverse",
  },
  description: "Study support for high school and university students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA">
      <body className="flex min-h-dvh flex-col">
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
