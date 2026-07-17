import pino from 'pino';

const initializeServerLogger = () => {
  const pinoServer = pino({
    level: 'info',
    formatters: {
        log(object) {
            return { 
                ...object,
                service: 'soustools-api',
                environment: process.env.NODE_ENV === 'development' ? 'remote-dev' : 'production',
            }
        }
    }
  });

  let isLogging = false;

  // Monkey-patch console methods
  (['log', 'info', 'warn', 'error'] as const).forEach(level => {
    const originalMethod = console[level];
        console[level] = (firstArg: unknown, ...restArgs: unknown[]) => {
      if (isLogging) {
        originalMethod.apply(console, [firstArg, ...restArgs]);
        return;
      }
      isLogging = true;
      try {
        const pinoLevel = level === 'log' ? 'info' : level;
        pinoServer[pinoLevel](firstArg, ...restArgs);
      } catch (_err) {
        // ignore
      } finally {
        isLogging = false;
      }
      originalMethod.apply(console, [firstArg, ...restArgs]);
    };
  });
};

export default initializeServerLogger;
