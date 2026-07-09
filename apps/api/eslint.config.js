// apps/api/eslint.config.js
import { nestjsConfig } from "@soustools/eslint-config/nestjs";

export default [
  ...nestjsConfig,
  {
    // Backend apps are permitted to import from the infrastructure layer
    files: ["src/**/*.ts"],
    rules: { "boundaries/element-types": "off" },
  },
  {
    // APP_VERSION is injected at deployment time by Docker/CI — not a secret.
    // These files use it for health/version endpoints only.
    files: [
      "src/app.service.ts",
      "src/health/health.controller.ts",
      "src/modules/integrations/drivers/base.driver.ts",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
  { ignores: ["dist/**", "node_modules/**"] },
];
