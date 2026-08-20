// apps/cli/eslint.config.js
import { nestjsConfig } from "@soustools/eslint-config/nestjs";

export default [
  ...nestjsConfig,
  {
    files: ["src/**/*.ts"],
    rules: { "boundaries/element-types": "off" },
  },
  {
    files: ["src/environment/**/*.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  { ignores: ["dist/**", "node_modules/**", "playwright-session/**"] },
];
