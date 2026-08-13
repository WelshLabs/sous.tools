import { baseConfig } from "@soustools/eslint-config";

export default [
  ...baseConfig,
  {
    rules: {
      "no-restricted-syntax": "off",
      "max-lines": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  { ignores: ["dist/**", "node_modules/**", "src/schema.d.ts"] },
];
