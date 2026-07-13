import { initializeLogger } from '@soustools/logger';
initializeLogger();

import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '../components/theme-provider';
import { ClientInitializersWrapper } from '../components/ClientInitializersWrapper';

export default function RootLayout({
  children,
}: {
  children: any;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientInitializersWrapper />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
