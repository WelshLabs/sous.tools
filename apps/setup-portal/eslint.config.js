// apps/setup-portal/eslint.config.js
import { nextConfig } from "@soustools/eslint-config/next";
export default [
  ...nextConfig,
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"] },
];
