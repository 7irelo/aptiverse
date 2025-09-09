import SessionProvider from "@/providers/SessionProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import QueryClientProvider from "../providers/QueryClientProvider";
import "./globals.css";

const frygia = localFont({
  src: [
    {
      path: './fonts/Frygia/Frygia-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Frygia/Frygia-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-frygia',
  display: 'swap',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aptiverse - Smart Learning Platform",
  description: "AI-powered educational platform for South African learners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${frygia.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <QueryClientProvider>
            {children}
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}