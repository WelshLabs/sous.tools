import React from "react";
import "./globals.css";

export const metadata = {
  title: "Sous Tools - Documentation",
  description: "Public documentation portal for the Restaurant OS platform",
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}
