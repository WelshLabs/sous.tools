import { baseConfig } from "@soustools/eslint-config";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "max-lines": "off",
    },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];
