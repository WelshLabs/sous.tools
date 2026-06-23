import pino from 'pino';

/**
 * Server logger configuration.
 * Defaults to info level, uses pino-pretty in development.
 * In production, it relies on standard out streams captured by infrastructure.
 * @tenant-docs-export
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
    }
  } : undefined,
});

/**
 * Patches global console methods to route through pino logger on the server.
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

