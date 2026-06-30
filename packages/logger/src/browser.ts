import pino from 'pino';

const NEW_RELIC_KEY = process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY;

/**
 * Browser logger configuration.
 * Only transmits `error` level logs directly to New Relic using sendBeacon.
 * @tenant-docs-export
 */
export const logger = pino({
  browser: {
    transmit: {
      level: 'error',
      send: function (_level, logEvent) {
        if (!NEW_RELIC_KEY) return;

        try {
          const payload = [{
            common: {
              attributes: {
                plugin: "pino-browser",
                environment: process.env.NODE_ENV || "development"
              }
            },
            logs: [{
              timestamp: logEvent.ts,
              message: logEvent.messages.map(m => typeof m === 'string' ? m : JSON.stringify(m)).join(' '),
              attributes: {
                level: logEvent.level.label,
                ...logEvent.bindings.reduce((acc, binding) => ({ ...acc, ...binding }), {})
              }
            }]
          }];

          const url = 'https://log-api.newrelic.com/log/v1';
          
          // Use fetch with keepalive if beacon is not suitable for headers, 
          // but New Relic Log API requires Api-Key header. sendBeacon doesn't support headers.
          // Fetch is required to pass the Api-Key header.
          fetch(url, {
            method: 'POST',
            keepalive: true,
            headers: {
              'Content-Type': 'application/json',
              'Api-Key': NEW_RELIC_KEY
            },
            body: JSON.stringify(payload)
          }).catch(console.error);

        } catch (err) {
          console.error("Failed to format/send log to New Relic", err);
        }
      }
    }
  }
});

/**
 * Patches global console methods to route through pino logger on the client.
 * @tenant-docs-export
 */
export function patchConsole(): void {
  console.log = (...args: unknown[]) => {
    logger.info(args.length === 1 && typeof args[0] === 'string' ? args[0] : args);
  };
  console.error = (...args: unknown[]) => {
    logger.error(args.length === 1 && typeof args[0] === 'string' ? args[0] : args);
  };
  console.warn = (...args: unknown[]) => {
    logger.warn(args.length === 1 && typeof args[0] === 'string' ? args[0] : args);
  };
  console.info = (...args: unknown[]) => {
    logger.info(args.length === 1 && typeof args[0] === 'string' ? args[0] : args);
  };
}
