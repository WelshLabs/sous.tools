import React from "react";
import "./globals.css";

/**
 * Metadata configuration for the marketing site.
 */
export const metadata = {
  title: "Sous Tools - Marketing",
  description: "Manage and automate your professional kitchen",
};

/**
 * RootLayoutProps defines properties for the marketing RootLayout.
 */
export interface RootLayoutProps {
  /**
   * The child components to render inside the layout.
   */
  children: React.ReactNode;
}

/**
 * RootLayout is the default layout for the marketing site, importing the global style sheet.
 *
 * @param props Contains the children node to render inside the body tag.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}
