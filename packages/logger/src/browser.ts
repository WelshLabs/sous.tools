import pino from "pino";
import { clientConfig as config } from "@soustools/config/client";

let worker: Worker | null = null;

if (typeof window !== "undefined") {
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
    const blob = new Blob([workerCode], { type: "application/javascript" });
    worker = new Worker(URL.createObjectURL(blob));
  } catch (_err) {
    // Fail silently in worker setup to prevent loop
  }
}

let isBrowserLoggerInitialized = false;
let isLoggingGuard = false;

const nativeConsole = {
  log: typeof console !== "undefined" ? console.log : () => {},
  info: typeof console !== "undefined" ? console.info : () => {},
  warn: typeof console !== "undefined" ? console.warn : () => {},
  error: typeof console !== "undefined" ? console.error : () => {},
};

const initializeBrowserLogger = () => {
  if (typeof window === "undefined" || isBrowserLoggerInitialized) {
    return;
  }
  isBrowserLoggerInitialized = true;

  const pinoBrowser = pino({
    browser: {
      transmit: {
        level: "error",
        send: (level, logEvent) => {
          try {
            const licenseKey = config.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY;
            if (!licenseKey) return;

            const payload = {
              message: logEvent.messages ? logEvent.messages.join(" ") : "",
              level: level,
              service: "soustools-web",
              environment:
                config.NODE_ENV === "development" ? "remote-dev" : "production",
              timestamp: logEvent.ts,
              bindings: logEvent.bindings,
            };

            if (worker) {
              worker.postMessage({
                url: "https://log-api.newrelic.com/log/v1",
                headers: {
                  "Content-Type": "application/json",
                  "Api-Key": licenseKey,
                },
                body: JSON.stringify(payload),
              });
            } else {
              fetch("https://log-api.newrelic.com/log/v1", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Api-Key": licenseKey,
                },
                body: JSON.stringify(payload),
                keepalive: true,
              }).catch(() => {});
            }
          } catch (_err) {
            // Ignore transmission errors
          }
        },
      },
    },
  });

  (["log", "info", "warn", "error"] as const).forEach((level) => {
    const originalNative = nativeConsole[level];
    console[level] = (firstArg: unknown, ...restArgs: unknown[]) => {
      originalNative.apply(console, [firstArg, ...restArgs]);
      if (isLoggingGuard) {
        return;
      }
      isLoggingGuard = true;
      try {
        const pinoLevel = level === "log" ? "info" : level;
        if (typeof firstArg === "string") {
          (pinoBrowser[pinoLevel] as (...args: unknown[]) => void)(
            firstArg,
            ...restArgs,
          );
        } else {
          (pinoBrowser[pinoLevel] as (...args: unknown[]) => void)(
            firstArg,
            "",
            ...restArgs,
          );
        }
      } catch (_err) {
        // Silent fallback
      } finally {
        isLoggingGuard = false;
      }
    };
  });
};

export default initializeBrowserLogger;
