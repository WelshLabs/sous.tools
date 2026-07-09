// packages/config/eslint.config.js
// @soustools/config is the ONLY package permitted to access process.env directly.
// This is the single authoritative source for all environment variable access.
import { baseConfig } from "@soustools/eslint-config";

export default [
  ...baseConfig,
  {
    // Override: process.env is the entire POINT of this package
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-syntax": "off",
      // Config files can be longer than 200 lines due to schema definitions
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];
