import { baseConfig } from "@soustools/eslint-config";

export default [
  ...baseConfig,
  { ignores: ["dist/**", "node_modules/**"] },
];
