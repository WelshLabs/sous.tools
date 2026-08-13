import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { LoggerInitializer } from "../components/LoggerInitializer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LoggerInitializer />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
