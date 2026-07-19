import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider } from "next-themes";
import "@soustools/design-system/index.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Phone (iPhone 14)",
          styles: {
            width: "393px",
            height: "852px",
          },
          type: "mobile",
        },
        tablet: {
          name: "Tablet (iPad)",
          styles: {
            width: "768px",
            height: "1024px",
          },
          type: "tablet",
        },
        desktop: {
          name: "Desktop (Standard)",
          styles: {
            width: "1440px",
            height: "900px",
          },
          type: "desktop",
        },
      },
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: "dark",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
          { value: "system", icon: "browser", title: "System" }
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "dark";
      return (
        <ThemeProvider key={theme} attribute="class" defaultTheme={theme} enableSystem>
          <div className="bg-background text-foreground antialiased min-h-screen p-4">
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
