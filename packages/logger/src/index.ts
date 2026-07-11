import initializeBrowserLogger from './browser.js';
import initializeServerLogger from './server.js';

const initializeLogger = () => {
    if (typeof window === 'undefined') {
        initializeServerLogger();
    } else {
        initializeBrowserLogger();
    }
};

export { initializeLogger, initializeBrowserLogger, initializeServerLogger };
