// packages/logger/eslint.config.js
// Logger is a foundational utility — it cannot import @soustools/config
// (circular dependency: config -> logger -> config). It may access process.env
// directly for LOG_LEVEL and NODE_ENV, which are standard Node conventions.
import { baseConfig } from "@soustools/eslint-config";

export default [
  ...baseConfig,
  {
    // Logger package: permit process.env for foundational log level config
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];
