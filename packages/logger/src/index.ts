import initializeBrowserLogger from './browser';
import initializeServerLogger from './server';

const initializeLogger = () => {
    if (typeof window === 'undefined') {
        initializeServerLogger();
    } else {
        initializeBrowserLogger();
    }
};

export { initializeLogger, initializeBrowserLogger, initializeServerLogger };
