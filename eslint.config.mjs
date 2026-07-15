// Root eslint.config.js — sous.tools monorepo
import js from "@eslint/js";
import projectStructure from "eslint-plugin-project-structure";
import boundaries from "eslint-plugin-boundaries";
import tailwindcss from "eslint-plugin-tailwindcss";

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

  // 🚨 SOUSTOOLS ARCHITECTURAL PHYSICAL WALLS 🚨
  {
    files: ["**/*.ts", "**/*.tsx"], // Apply strictly to all TypeScript/React files
    plugins: {
      "project-structure": projectStructure,
      boundaries: boundaries,
      tailwindcss: tailwindcss,
    },
    settings: {
      // Define our workspaces so the boundaries plugin knows what is what
      "boundaries/elements": [
        { type: "apps", pattern: "apps/*" },
        { type: "domain", pattern: "packages/domain-*" },
        { type: "ui", pattern: "packages/design-system" },
        { type: "config", pattern: "packages/config" },
        {
          type: "infrastructure",
          pattern: ["apps/api", "packages/infrastructure*"],
        },
      ],
    },
    rules: {
      // 1. The Container/View Enforcement (Prevents logic in pure UI files)
      "project-structure/file-structure": [
        "error",
        {
          rules: [
            { name: "Containers", extension: ".container.tsx" },
            { name: "Presentational", extension: ".tsx" },
          ],
        },
      ],

      // 2. The 200-Line "Bee's Nest" Limit
      "max-lines": ["error", 200],

      // 3. The Supabase & Domain Firewall (DDD Boundaries)
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            // UI apps can only talk to domain, config, and ui. NEVER infrastructure/DB.
            { from: ["apps"], allow: ["domain", "config", "ui"] },
            // Domain logic cannot import from infrastructure or Supabase directly.
            { from: ["domain"], allow: ["domain", "config"] },
          ],
        },
      ],

      // 4. Ban Process.env (Except in @soustools/config)
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "process",
              message:
                "Direct process.env access is banned. Import from @soustools/config instead.",
            },
          ],
        },
      ],

      // 5. Ban Hardcoded Tailwind (e.g., w-[32px] or bg-[#123])
      "tailwindcss/no-custom-classname": [
        "error",
        {
          callee: "classnames",
          config: "tailwind.config.js", // Ensure this points to your shared tailwind config
        },
      ],
    },
  },
];
