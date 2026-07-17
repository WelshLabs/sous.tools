import pino from 'pino';
import { config } from '@soustools/config';

let worker: Worker | null = null;

if (typeof window !== 'undefined') {
  try {
    const workerCode = `
      self.onmessage = function(e) {
        const { url, headers, body } = e.data;
        fetch(url, {
          method: 'POST',
          headers: headers,
          body: body,
          keepalive: true
        }).catch(() => {
          // Silent catch to prevent console output in worker thread
        });
      }
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob));
  } catch (_err) {
    // Fail silently in worker setup to prevent loop
  }
}

const initializeBrowserLogger = () => {
  const pinoBrowser = pino({
    browser: {
      transmit: {
        level: 'error',
        send: (level, logEvent) => {
          const licenseKey = config.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY;
          if (!licenseKey) return;

          const payload = {
            message: logEvent.messages.join(' '),
            level: level,
            service: 'soustools-web',
            environment: process.env.NODE_ENV === 'development' ? 'remote-dev' : 'production',
            timestamp: logEvent.ts,
            bindings: logEvent.bindings
          };

          if (worker) {
            worker.postMessage({
              url: 'https://log-api.newrelic.com/log/v1',
              headers: {
                'Content-Type': 'application/json',
                'Api-Key': licenseKey
              },
              body: JSON.stringify(payload)
            });
          } else {
            fetch('https://log-api.newrelic.com/log/v1', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Api-Key': licenseKey
              },
              body: JSON.stringify(payload),
              keepalive: true
            }).catch(() => {});
          }
        },
      },
    },
  });

  let isLogging = false;

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
        if (typeof firstArg === 'string') {
          (pinoBrowser[pinoLevel] as (...args: unknown[]) => void)(firstArg, ...restArgs);
        } else {
          (pinoBrowser[pinoLevel] as (...args: unknown[]) => void)(firstArg, '', ...restArgs);
        }
      } catch (_err) {
        // Fallback
      } finally {
        isLogging = false;
      }
      originalMethod.apply(console, [firstArg, ...restArgs]);
    };
  });
};

export default initializeBrowserLogger;

