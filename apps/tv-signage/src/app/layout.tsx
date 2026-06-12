import React from "react";
import "./globals.css";

/**
 * Metadata configuration for the TV signage application.
 */
export const metadata = {
  title: "Sous Tools - TV Signage Player",
  description: "Digital menu boards and television signage stream",
};

/**
 * RootLayoutProps defines properties for the tv-signage RootLayout.
 */
export interface RootLayoutProps {
  /**
   * The child components to render inside the layout.
   */
  children: React.ReactNode;
}

/**
 * RootLayout is the default layout for the TV signage app, importing the global style sheet.
 *
 * @param props Contains the children node to render inside the body tag.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
