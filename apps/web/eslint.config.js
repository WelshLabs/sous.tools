// apps/web/eslint.config.js
import { nextConfig } from "@soustools/eslint-config/next";

export default [
  ...nextConfig,
  { ignores: [".next/**", "node_modules/**", "public/**"] },
];
