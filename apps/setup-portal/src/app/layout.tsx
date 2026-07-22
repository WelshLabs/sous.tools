import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { LoggerInitializer } from "../components/LoggerInitializer";
import { AuroraBackground } from "@soustools/design-system";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuroraBackground />
        <LoggerInitializer />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
