import { config } from "@soustools/config";

/**
 * Pre-bootstrap sequence.
 * Dynamically loads New Relic APM only if enabled, avoiding loader hook interference
 * and configuration errors during local development.
 */
if (config.NEW_RELIC_ENABLED) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("newrelic");
}
