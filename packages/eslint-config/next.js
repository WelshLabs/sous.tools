// @soustools/eslint-config/next.js
// ESLint config for Next.js apps (apps/web, apps/pos-simulator, apps/setup-portal).
import { baseConfig } from "./base.js";

export const nextConfig = [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "@typescript-eslint/require-await": "off",

      // Direct process.env access is forbidden in Next.js apps.
      // Import typed clientConfig or serverConfig from @soustools/config instead.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Direct process.env access is forbidden. Import the typed config object from @soustools/config instead.",
        },
      ],
    },
  },
  // Allow process.env in Next.js config files (next.config.ts etc.)
  {
    files: ["next.config.*", "*.config.ts", "*.config.js", "*.config.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];

export default nextConfig;
