import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { LoggerInitializer } from "../components/LoggerInitializer";
import { AuroraBackground } from "@soustools/design-system";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "../../../../packages/design-system/fonts/satoshi-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../packages/design-system/fonts/satoshi-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${archivo.variable} ${satoshi.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AuroraBackground />
        <LoggerInitializer />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
