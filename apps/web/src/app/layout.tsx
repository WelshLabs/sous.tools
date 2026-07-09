import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { InstrumentationClient } from "@/instrumentation-client";
import { OmniBarProvider } from "@soustools/design-system";
import { cookies } from "next/headers";

// @todo this should be a constant somewhere because it is used in multiple places (frontend and backend) and should be consistent
const SESSION_COOKIE = "sb-session-token";

export async function generateMetadata(): Promise<Metadata> {
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;
  let iconPath = "/favicon-prod.svg";
  
  if (env === "development") {
    iconPath = "/favicon-dev.svg";
  } else if (env === "staging") {
    iconPath = "/favicon-staging.svg";
  }

  return {
    title: "sous.tools",
    description: "Interactive kitchen display system and dashboard",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: iconPath,
      apple: iconPath,
    }
  };
}

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

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white text-zinc-900 dark:bg-card dark:text-zinc-50 font-sans overflow-x-hidden transition-colors duration-300 relative" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OmniBarProvider token={token}>
            {children}
          </OmniBarProvider>
          <Toaster theme="system" position="bottom-right" richColors />
          <Analytics />
          <SpeedInsights />
          <InstrumentationClient />
        </ThemeProvider>
      </body>
    </html>
  );
}
