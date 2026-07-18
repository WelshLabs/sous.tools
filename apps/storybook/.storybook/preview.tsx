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
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background text-foreground antialiased min-h-screen p-4">
        <Story />
      </div>
    ),
  ],
};

export default preview;
