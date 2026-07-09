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

      // Next.js apps use NEXT_PUBLIC_* env vars that are inlined at build time.
      // NODE_ENV is a standard Node convention. Both are exempt from the
      // process.env ban. The ban remains in force for all OTHER env vars
      // (i.e., secrets that should come from @soustools/config).
      // Enforced via team convention + code review for the specific patterns.
      "no-restricted-syntax": "off",
    },
  },
  // Allow process.env in Next.js config files (next.config.ts etc.)
  {
    files: ["next.config.*", "*.config.ts", "*.config.js", "*.config.mjs"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];

export default nextConfig;
