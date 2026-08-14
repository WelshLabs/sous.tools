import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: [
    "../../../packages/design-system/src/**/*.mdx",
    "../../../packages/design-system/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../packages/domain-*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss());
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/navigation": path.resolve(
        __dirname,
        "./__mocks__/next-navigation.ts",
      ),
      "next/link": path.resolve(__dirname, "./__mocks__/next-link.tsx"),
    };
    return config;
  },
};
export default config;
