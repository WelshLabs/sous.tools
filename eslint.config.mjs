// Root eslint.config.js — sous.tools monorepo
// This file is intentionally minimal. It defers to the per-package configs.
// The root config only sets global ignores and is not used for linting source.
// Each app/package has its own eslint.config.js that extends @soustools/eslint-config.

import js from "@eslint/js";

export default [
  // Global ignores — files that should never be linted
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/build/**",
      "**/*.d.ts",
      "supabase/**",
      "apps/wearos/**",
      ".agents/**",
      ".context/**",
      "scripts/**",
    ],
  },
];
