import next from "@soustools/eslint-config/next";

export default [
  ...next,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];
