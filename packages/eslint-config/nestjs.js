// @soustools/eslint-config/nestjs.js
import { baseConfig } from "./base.js";

export const nestjsConfig = [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "no-console": ["warn", { allow: ["error", "warn", "log"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
  // NestJS bootstrap and config files: permit process.env
  // NODE_ENV is a universal Node convention for runtime environment detection.
  // Module files often need NODE_ENV for conditional service configuration.
  {
    files: [
      "**/main.ts",
      "**/*.module.ts",
      "**/app.module.ts",
      "*.config.ts",
      "*.config.js",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];

export default nestjsConfig;
