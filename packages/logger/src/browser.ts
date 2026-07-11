import pino from 'pino';
import { NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY } from '@soustools/config';

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
                  'Api-Key': NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY,
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
  ['log', 'info', 'warn', 'error'].forEach(level => {
    const originalMethod = console[level];
    console[level] = (...args) => {
      pinoBrowser[level](...args);
      originalMethod.apply(console, args);
    };
  });
};

export default initializeBrowserLogger; 
