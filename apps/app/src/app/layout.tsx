import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "../components/theme-provider";
import { InstrumentationClient } from "../instrumentation-client";

export const metadata: Metadata = {
  title: "sous.tools",
  description: "Interactive kitchen display system and dashboard",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans overflow-x-hidden transition-colors duration-300 relative">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Animated Background Orbs */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 dark:bg-sky-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
          </div>
          {children}
          <Toaster theme="system" position="bottom-right" richColors />
          <Analytics />
          <SpeedInsights />
          <InstrumentationClient />
        </ThemeProvider>
      </body>
    </html>
  );
}
