import type { Preview } from "@storybook/react";
import React from "react";
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
          { value: "system", icon: "browser", title: "System" },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const selectedTheme = context.globals.theme || "dark";
      const theme = selectedTheme === "light" ? "light" : "dark";

      return (
        <div
          className={`${theme} bg-background text-foreground min-h-screen p-4 antialiased`}
          data-theme={theme}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
