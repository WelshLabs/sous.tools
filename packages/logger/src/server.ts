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

  // Monkey-patch console methods
  (['log', 'info', 'warn', 'error'] as const).forEach(level => {
    const originalMethod = console[level];
    console[level] = (firstArg: any, ...restArgs: any[]) => {
      const pinoLevel = level === 'log' ? 'info' : level;
      pinoServer[pinoLevel](firstArg, ...restArgs);
      originalMethod.apply(console, [firstArg, ...restArgs]);
    };
  });
};

export default initializeServerLogger;
