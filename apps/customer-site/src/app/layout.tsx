import React from "react";
import "./globals.css";

/**
 * Metadata configuration for the customer ordering site.
 */
export const metadata = {
  title: "Sous Tools - Ordering Portal",
  description: "Order food online directly from your table or home",
};

/**
 * RootLayoutProps defines properties for the customer site RootLayout.
 */
export interface RootLayoutProps {
  /**
   * The child components to render inside the layout.
   */
  children: React.ReactNode;
}

/**
 * RootLayout is the default layout for the customer site, importing the global style sheet.
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
