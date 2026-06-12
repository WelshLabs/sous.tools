import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the `@soustools/ui` package.
 * Enforces the browser-like `jsdom` testing environment.
 */
export default defineConfig({
  test: {
    environment: "jsdom",
  },
});
