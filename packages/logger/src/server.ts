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
  ['log', 'info', 'warn', 'error'].forEach(level => {
    const originalMethod = console[level];
    console[level] = (...args) => {
      pinoServer[level](...args);
      originalMethod.apply(console, args);
    };
  });
};

export default initializeServerLogger;
