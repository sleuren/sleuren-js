export default function catchWindowErrors() {
    if (typeof window === 'undefined') {
        return;
    }

    const sleuren = window.sleuren;

    if (!window || !sleuren) {
        return;
    }

    const originalOnerrorHandler = window.onerror;
    const originalOnunhandledrejectionHandler = window.onunhandledrejection;

    window.onerror = (_1, _2, _3, _4, error) => {
        if (error) {
            sleuren.report(error);
        }

        if (typeof originalOnerrorHandler === 'function') {
            originalOnerrorHandler(_1, _2, _3, _4, error);
        }
    };

    window.onunhandledrejection = (error: PromiseRejectionEvent) => {
        if (error.reason instanceof Error) {
            sleuren.report(error.reason);
        }
        if (typeof originalOnunhandledrejectionHandler === 'function') {
            // @ts-ignore
            originalOnunhandledrejectionHandler(error);
        }
    };
}
