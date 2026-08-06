// @soustools/eslint-config/base.js
// The Iron Gate — centralized ESLint flat config for the sous.tools monorepo.
// All apps and packages extend this. Zero tolerance: no eslint-disable bypasses.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * DDD Layer definitions.
 * These map workspace paths to logical architecture layers.
 */
const BOUNDARY_ELEMENTS = [
  {
    type: "app",
    pattern: ["apps/web/**", "apps/pos-simulator/**", "apps/setup-portal/**"],
  },
  {
    type: "backend",
    pattern: ["apps/api/**", "apps/cli/**"],
  },
  {
    type: "domain",
    pattern: ["packages/domain-*/**"],
  },
  {
    type: "ui",
    pattern: ["packages/design-system/**"],
  },
  
  {
    type: "shared",
    pattern: [
      "packages/config/**",
      "packages/logger/**",
      "packages/api-types/**",
      "packages/tsconfig/**",
    ],
  },
];

/**
 * Base configuration shared by ALL packages in the monorepo.
 * Returns a flat config array compatible with ESLint v9 flat config.
 */
export const baseConfig = [
  js.configs.recommended,

  // TypeScript-aware rules (applies to all .ts/.tsx files)
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),

  // Core Iron Gate rules
  {
    files: ["**/*.ts", "**/*.tsx"],

    plugins: {
      boundaries,
      "react-hooks": reactHooks,
    },

    settings: {
      "boundaries/elements": BOUNDARY_ELEMENTS,
      "boundaries/ignore": [
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.e2e.ts",
        "**/node_modules/**",
        "**/dist/**",
      ],
    },

    rules: {
      // ── DDD Boundary Enforcement ─────────────────────────────────────
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: "domain",
              disallow: ["backend"],
              message:
                "Domain packages cannot import from backend apps.",
            },
            {
              from: "ui",
              disallow: ["backend"],
              message:
                "Design system cannot import from backend apps.",
            },
          ],
        },
      ],

      // ── process.env Zero-Tolerance ───────────────────────────────────
      // Only packages/config is permitted to access process.env directly.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Direct process.env access is forbidden. Import the typed config object from @soustools/config instead.",
        },
      ],

      // ── File Size Cap: 200 Meaningful Lines ──────────────────────────
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],

      // ── TypeScript Best Practices ────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unused-expressions": "off",
      "no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // ── React Hooks ─────────────────────────────────────────────────────
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // ── Test file overrides ──────────────────────────────────────────────
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "**/*.test.tsx", "**/*.e2e.ts"],
    rules: {
      "max-lines": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "boundaries/element-types": "off",
    },
  },
  // ── Config & Foundational Utilities process.env Exemption ─────────────
  {
    files: ["**/*.config.js", "**/*.config.mjs", "**/*.config.ts", "packages/logger/**/*.ts"],
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

export default baseConfig;
