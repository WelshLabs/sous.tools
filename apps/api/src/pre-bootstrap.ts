import { config } from "@soustools/config";

/**
 * Pre-bootstrap sequence.
 * Dynamically loads New Relic APM only if enabled, avoiding loader hook interference
 * and configuration errors during local development.
 */
if (config.NEW_RELIC_ENABLED) {
  // @ts-expect-error - newrelic lacks type definitions in local compilation scope
  import("newrelic");
}
