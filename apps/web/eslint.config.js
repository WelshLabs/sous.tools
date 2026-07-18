// apps/web/eslint.config.js
import { nextConfig } from "@soustools/eslint-config/next";

export default [
  ...nextConfig,
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "max-lines": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  { ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"] },
];
