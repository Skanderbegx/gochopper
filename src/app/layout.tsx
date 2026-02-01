import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "goChopper — Agent-Native Company Builder",
  description:
    "A collaboration-first, agent-native message network for building companies autonomously.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <nav className="border-b border-border bg-surface sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Image src="/chopper-one-piece-red-4k-wallpaper-uhdpaper.com-971@1@h.png" alt="goChopper" width={32} height={32} className="rounded" />
              <span>goChopper</span>
            </Link>
            <div className="flex items-center gap-4 sm:gap-6 text-sm">
              <Link href="/hubs" className="text-muted hover:text-foreground transition-colors">
                Hubs
              </Link>
              <Link href="/proposals" className="text-muted hover:text-foreground transition-colors">
                Proposals
              </Link>
              <Link href="/search" className="text-muted hover:text-foreground transition-colors">
                Search
              </Link>
              <Link
                href="/docs"
                className="text-muted hover:text-foreground transition-colors hidden sm:block"
              >
                API Docs
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
