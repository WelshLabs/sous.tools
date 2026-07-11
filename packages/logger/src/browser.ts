import pino from 'pino';
import { config } from '@soustools/config';

const initializeBrowserLogger = () => {
  const pinoBrowser = pino({
    browser: {
      transmit: {
        level: 'error',
        send: async (level, logEvent) => {
          try {
            await fetch(`https://log-api.newrelic.com/log/v1`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(config.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY && { 'Api-Key': config.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY }),
                },
                body: JSON.stringify({
                  ...logEvent,
                  level: level,
                  service: 'soustools-web',
                  environment: process.env.NODE_ENV === 'development' ? 'remote-dev' : 'production',
                }),
                keepalive: true,
              });
          } catch (e) {
            console.error('Failed to send log to New Relic', e);
          }
        },
      },
    },
  });

  // Monkey-patch console methods
  (['log', 'info', 'warn', 'error'] as const).forEach(level => {
    const originalMethod = console[level];
    console[level] = (firstArg: any, ...restArgs: any[]) => {
      const pinoLevel = level === 'log' ? 'info' : level;
      pinoBrowser[pinoLevel](firstArg, ...restArgs);
      originalMethod.apply(console, [firstArg, ...restArgs]);
    };
  });
};

export default initializeBrowserLogger; 
